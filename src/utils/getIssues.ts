import PQueue from "p-queue";
import { serializeError } from "serialize-error";
import k from "./keys";
import { Milestone, Issue, ErrorWithVars } from "../interfaces";

const CONCURRENCY = 2;
const API_URL = "https://api.github.com";

export type Job = [owner: string, repo: string, milestone?: string];

/**
 * Rate limit information extracted from response headers
 */
interface RateLimitInfo {
  limited: boolean;
  resetAt: number | null; // Unix timestamp in seconds
  remaining: number;
  total: number;
}

/**
 * Parse rate limit headers from GitHub response
 */
const getRateLimitInfo = (response: Response | undefined): RateLimitInfo => {
  if (!response) {
    return { limited: false, resetAt: null, remaining: 0, total: 0 };
  }

  const remaining = parseInt(response.headers.get("X-RateLimit-Remaining") || "0", 10);
  const limit = parseInt(response.headers.get("X-RateLimit-Limit") || "0", 10);
  const resetAt = parseInt(response.headers.get("X-RateLimit-Reset") || "0", 10);

  // 403 with specific header means rate limited
  // 429 is explicit rate limit
  const limited = response.status === 429 || 
    (response.status === 403 && remaining === 0);

  return { limited, resetAt: resetAt || null, remaining, total: limit };
};

/**
 * Calculate wait time for rate limit reset with jitter
 * Returns milliseconds to wait
 */
const calculateWaitTime = (resetAt: number | null): number => {
  if (!resetAt) {
    // No reset time header, use default backoff
    return 5000 + Math.random() * 2000; // 5-7 seconds with jitter
  }

  const now = Math.floor(Date.now() / 1000);
  let waitSeconds = Math.max(0, resetAt - now);

  // Add jitter: ±20% of the wait time, minimum 500ms
  const jitter = Math.max(0.5, waitSeconds * 0.2);
  waitSeconds += Math.random() * jitter - jitter / 2;

  // Ensure minimum wait and cap at 60 seconds
  const cappedWait = Math.max(0.5, Math.min(waitSeconds, 60));

  return cappedWait * 1000; // Convert to milliseconds
};

/**
 * Custom error for rate limit situations
 */
class RateLimitError extends Error {
  resetAt: number | null;
  constructor(message: string, resetAt: number | null = null) {
    super(message);
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}

/**
 * Format a REST API issue to our Issue type
 */
const formatIssue = (issue: {
  number: number;
  title: string;
  closed_at?: string | null;
  labels?: Array<{ name: string }>;
}): Issue => ({
  number: issue.number,
  title: issue.title,
  closedAt: issue.closed_at || null,
  labels: (issue.labels || []).map(l => l.name),
});

/**
 * Fetch with rate limit handling, retry, and abort signal support
 */
const fetchWithRateLimit = async (
  url: string,
  token: string,
  signal: AbortSignal | undefined,
  retries = 2
): Promise<{ ok: boolean; data: unknown; rateLimit: RateLimitInfo }> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Check if aborted before making request
    if (signal?.aborted) {
      throw new Error("Request aborted");
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal,
      });

      const rateLimit = getRateLimitInfo(response);

      if (rateLimit.limited && attempt < retries) {
        const waitTime = calculateWaitTime(rateLimit.resetAt);
        await new Promise(r => setTimeout(r, waitTime));
        lastError = new RateLimitError(
          `Rate limited, waiting ${Math.round(waitTime / 1000)}s`,
          rateLimit.resetAt
        );
        continue;
      }

      if (!response.ok) {
        // Return structured error info instead of null
        return { 
          ok: false, 
          data: null, 
          rateLimit 
        };
      }

      const data = await response.json();
      return { ok: true, data, rateLimit };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err; // Re-throw abort errors
      }
      lastError = err as Error;
      if (attempt < retries) {
        // Exponential backoff on network errors
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Get a single milestone with its issues using REST API
 */
const getMilestone = async (
  token: string,
  owner: string,
  repo: string,
  milestoneNumber: number,
  signal: AbortSignal | undefined
): Promise<Milestone | null> => {
  // Fetch milestone
  const milestoneRes = await fetchWithRateLimit(
    `${API_URL}/repos/${owner}/${repo}/milestones/${milestoneNumber}`,
    token,
    signal
  );

  if (!milestoneRes.ok || !milestoneRes.data) {
    return null;
  }

  const milestone = milestoneRes.data as {
    id: number;
    number: number;
    title: string;
    description: string | null;
    created_at: string;
    due_on: string | null;
  };

  // Fetch issues for this milestone (first page only, max 100)
  const issuesRes = await fetchWithRateLimit(
    `${API_URL}/repos/${owner}/${repo}/issues?milestone=${milestoneNumber}&state=all&per_page=100&page=1`,
    token,
    signal
  );

  const issuesRaw = issuesRes.ok ? (issuesRes.data as unknown[]) : [];

  // Filter out pull requests (GitHub's issues endpoint includes PRs)
  const issues = (issuesRaw as { pull_request?: unknown }[])
    .filter(item => !item.pull_request)
    .map(formatIssue);

  return {
    id: String(milestone.id),
    owner,
    repo,
    number: milestone.number,
    title: milestone.title,
    description: milestone.description || null,
    createdAt: milestone.created_at,
    dueOn: milestone.due_on || null,
    issues,
  };
};

/**
 * Get all milestones and their issues for a repo using REST API
 */
const getRepoMilestones = async (
  token: string,
  owner: string,
  repo: string,
  signal: AbortSignal | undefined
): Promise<Milestone[]> => {
  // Fetch first page of milestones (max 100, we only need last 10)
  const milestonesRes = await fetchWithRateLimit(
    `${API_URL}/repos/${owner}/${repo}/milestones?state=all&per_page=100&page=1`,
    token,
    signal
  );

  if (!milestonesRes.ok || !milestonesRes.data) {
    // Return empty array for rate limit, but log the error
    if (milestonesRes.rateLimit.limited) {
      console.warn(`Rate limited fetching milestones for ${owner}/${repo}`);
    }
    return [];
  }

  const milestones = milestonesRes.data as {
    id: number;
    number: number;
    title: string;
    description: string | null;
    created_at: string;
    due_on: string | null;
  }[];

  // Sort by creation date (newest first) and take last 10
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const recentMilestones = sortedMilestones.slice(0, 10);

  // Fetch issues for each milestone (parallelized)
  const results: Milestone[] = [];
  const queue = new PQueue({ concurrency: CONCURRENCY });

  for (const milestone of recentMilestones) {
    queue.add(async () => {
      try {
        const milestoneWithIssues = await getMilestone(token, owner, repo, milestone.number, signal);
        if (milestoneWithIssues) {
          results.push(milestoneWithIssues);
        }
      } catch (err) {
        // Ignore abort errors - they're expected on cancel
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn(`Failed to fetch milestone ${milestone.number}:`, err);
        }
      }
    });
  }

  await queue.onIdle();
  return results;
};

const getIssues = (
  token: string,
  jobs: Job[],
  cb: (err: ErrorWithVars | null, res: Map<string, Milestone>) => void
) => {
  let exited = false;
  const controller = new AbortController();
  const q = new PQueue({ concurrency: CONCURRENCY });

  const onExit = () => {
    exited = true;
    q.clear();
    controller.abort(); // Abort all in-flight requests
  };

  const all = new Map<string, Milestone>();

  const onError = (err: Error & { resetAt?: number | null }) => {
    if (exited) return;

    const { message } = serializeError(err);
    let errorMessage = message || "Something went wrong fetching issues.";
    
    // Handle rate limiting with useful info
    if (err instanceof RateLimitError || err.name === "RateLimitError") {
      if (err.resetAt) {
        const waitSeconds = Math.max(0, err.resetAt - Math.floor(Date.now() / 1000));
        errorMessage = `GitHub API rate limited. Retry in ~${Math.ceil(waitSeconds)} seconds.`;
      } else {
        errorMessage = "GitHub API rate limited. Please wait a moment and try again.";
      }
    } else if (err.status === 403 || err.status === 429) {
      errorMessage = "GitHub API rate limit exceeded. Please wait a moment and try again.";
    } else if (err.name === "AbortError") {
      // Don't report abort errors as user-facing errors
      return;
    }

    const error: ErrorWithVars = { message: errorMessage };

    onExit();
    cb(error, all);
  };

  const onComplete = () => {
    if (!exited) {
      onExit();
      cb(null, all);
    }
  };

  // Nothing to do, early return.
  if (!jobs.length) {
    onExit();
    cb(null, all);
    return onExit;
  }

  for (const [owner, repo, milestoneNumber] of jobs) {
    if (milestoneNumber) {
      // Fetch a single milestone
      q.add(async () => {
        try {
          const milestone = await getMilestone(
            token,
            owner,
            repo,
            parseInt(milestoneNumber, 10),
            controller.signal
          );
          if (milestone && !exited) {
            const key = k(owner, repo, milestone.number);
            all.set(key, milestone);
          }
        } catch (err) {
          onError(err as Error);
        }
      });
    } else {
      // Fetch all milestones for a repo
      q.add(async () => {
        try {
          const milestones = await getRepoMilestones(token, owner, repo, controller.signal);
          for (const milestone of milestones) {
            if (exited) break;
            const key = k(owner, repo, milestone.number);
            all.set(key, milestone);
          }
        } catch (err) {
          onError(err as Error);
        }
      });
    }
  }

  q.on("idle", onComplete);
  q.on("error", onError);

  return onExit;
};

export default getIssues;
