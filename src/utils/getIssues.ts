import PQueue from "p-queue";
import { serializeError } from "serialize-error";
import k from "./keys";
import { Milestone, Issue, ErrorWithVars } from "../interfaces";

const CONCURRENCY = 2;
const API_URL = "https://api.github.com";

export type Job = [owner: string, repo: string, milestone?: string];

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
 * GitHub API rate limit handling
 */
const isRateLimited = (response: Response | undefined): boolean => {
  if (!response) return false;
  return response.status === 403 || response.status === 429;
};

/**
 * Get a single milestone with its issues using REST API
 */
const getMilestone = async (
  token: string,
  owner: string,
  repo: string,
  milestoneNumber: number,
  retryCount = 2
): Promise<Milestone | null> => {
  // Fetch milestone
  let milestoneRes = await fetch(
    `${API_URL}/repos/${owner}/${repo}/milestones/${milestoneNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  // Retry on rate limit
  if (isRateLimited(milestoneRes) && retryCount > 0) {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
    return getMilestone(token, owner, repo, milestoneNumber, retryCount - 1);
  }

  if (!milestoneRes.ok) {
    return null;
  }

  const milestone = await milestoneRes.json();

  // Fetch issues for this milestone (first page only, max 100)
  const issuesRes = await fetch(
    `${API_URL}/repos/${owner}/${repo}/issues?milestone=${milestoneNumber}&state=all&per_page=100&page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!issuesRes.ok) {
    return null;
  }

  const issuesRaw = await issuesRes.json();

  // Filter out pull requests (GitHub's issues endpoint includes PRs)
  const issues = issuesRaw
    .filter((item: { pull_request?: unknown }) => !item.pull_request)
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
    issues: issues,
  };
};

/**
 * Get all milestones and their issues for a repo using REST API
 */
const getRepoMilestones = async (
  token: string,
  owner: string,
  repo: string,
  retryCount = 2
): Promise<Milestone[]> => {
  // Fetch first page of milestones (max 100, we only need last 10)
  const milestonesRes = await fetch(
    `${API_URL}/repos/${owner}/${repo}/milestones?state=all&per_page=100&page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (isRateLimited(milestonesRes) && retryCount > 0) {
    await new Promise(r => setTimeout(r, 2000));
    return getRepoMilestones(token, owner, repo, retryCount - 1);
  }

  if (!milestonesRes.ok) {
    return [];
  }

  const milestones = await milestonesRes.json();

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
      const milestoneWithIssues = await getMilestone(token, owner, repo, milestone.number);
      if (milestoneWithIssues) {
        results.push(milestoneWithIssues);
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
  const q = new PQueue({ concurrency: CONCURRENCY });

  const onExit = () => {
    exited = true;
    q.clear();
  };

  const all = new Map<string, Milestone>();

  const onError = (err: Error & { status?: number }) => {
    if (exited) return;

    let message = err.message || "Something went wrong fetching issues.";
    
    // Handle rate limiting
    if (err.status === 403 || err.status === 429) {
      message = "GitHub API rate limit exceeded. Please wait a moment and try again.";
    }

    const error: ErrorWithVars = { message };

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
            parseInt(milestoneNumber, 10)
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
          const milestones = await getRepoMilestones(token, owner, repo);
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
