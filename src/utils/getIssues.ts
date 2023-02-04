import { GraphQLClient } from "graphql-request";
import PQueue from "p-queue";
import { Milestone } from "../interfaces";
import GetRepoIssues from "../queries/GetRepoIssues";
import GetMilestoneIssues from "../queries/GetMilestoneIssues";
import {
  type GetRepoIssuesQuery,
  type GetMilestoneIssuesQuery,
} from "../__generated/graphql";
import k from "./keys";

const CONCURRENCY = 1;
const API_URL = "https://api.github.com/graphql";

type Nodes =
  | ({
      id: string;
      closedAt?: string;
      labels?:
        | {
            nodes?:
              | ({
                  name: string;
                } | null)[]
              | null
              | undefined;
          }
        | null
        | undefined;
    } | null)[]
  | null
  | undefined;

const formatIssues = (nodes: Nodes) =>
  (nodes || []).flatMap((d) =>
    d
      ? {
          ...d,
          closedAt: d.closedAt || null,
          labels: (d.labels?.nodes || []).flatMap((l) => (l ? l.name : [])),
        }
      : []
  );

export type Job = [owner: string, repo: string, milestone?: number];

const getIssues = (
  token: string,
  jobs: Job[],
  cb: (err: Error | null, res: Map<string, Milestone>) => void
) => {
  let exited = false;
  const q = new PQueue({ concurrency: CONCURRENCY });
  const abortController = new AbortController();
  const client = new GraphQLClient(API_URL, {
    signal: abortController.signal,
    headers: {
      authorization: `token ${token}`,
    },
  });

  const all = new Map<string, Milestone>();

  const onExit = () => {
    exited = true;
    abortController.abort();
    q.clear();
  };

  q.on("completed", (res: GetRepoIssuesQuery | GetMilestoneIssuesQuery) => {
    if (!res || !res.repository) {
      return;
    }

    if ("milestones" in res.repository) {
      const milestones = res.repository.milestones?.nodes;
      if (!milestones) {
        return;
      }
      for (const milestone of milestones) {
        if (milestone) {
          // TODO return variables so we can get the owner/repo.
          const [owner, repo] = res.repository.nameWithOwner.split("/");
          const id = k(owner, repo, milestone.number);
          all.set(id, {
            ...milestone,
            id,
            description: milestone.description || null,
            dueOn: milestone.dueOn || null,
            issues: formatIssues(milestone.issues.nodes),
          });
          const { hasNextPage, endCursor } = milestone.issues.pageInfo || {};
          if (hasNextPage && endCursor) {
            q.add(() =>
              client.request(GetMilestoneIssues, {
                owner,
                repo,
                milestone: milestone.number,
                cursor: endCursor,
              })
            );
          }
        }
      }
      return;
    }
    if ("milestone" in res.repository) {
      const milestone = res.repository.milestone;
      if (!milestone) {
        return;
      }
      const [owner, repo] = res.repository.nameWithOwner.split("/");
      const ref = all.get(k(owner, repo, milestone.number));
      if (!ref || !milestone.issues.nodes) {
        return;
      }
      ref.issues = ref.issues.concat(formatIssues(milestone.issues.nodes));
      const { hasNextPage, endCursor } = milestone.issues.pageInfo || {};
      if (hasNextPage && endCursor) {
        q.add(() =>
          client.request(GetMilestoneIssues, {
            owner,
            repo,
            milestone: milestone.number,
            cursor: endCursor,
          })
        );
      }
    }
  });

  q.on("error", (err: Error) => {
    if (!exited) {
      onExit();
      cb(err, all);
    }
  });

  q.on("idle", () => {
    if (!exited) {
      onExit();
      cb(null, all);
    }
  });

  // Nothing to do, early return.
  if (!jobs.length) {
    onExit();
    cb(null, all);
  }

  for (const [owner, repo, milestone] of jobs) {
    if (milestone !== undefined) {
      q.add(() =>
        client.request(GetMilestoneIssues, {
          owner,
          repo,
          milestone,
        })
      );
    } else {
      q.add(() =>
        client.request(GetRepoIssues, {
          owner,
          repo,
        })
      );
    }
  }

  return onExit;
};

export default getIssues;
