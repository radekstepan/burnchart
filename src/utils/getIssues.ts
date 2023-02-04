import { GraphQLClient } from "graphql-request";
import PQueue from "p-queue";
import { Milestone } from "../interfaces";
import GetRepoIssues from "../queries/GetRepoIssues";
import GetMilestoneIssues from "../queries/GetMilestoneIssues";
import {
  type GetRepoIssuesQuery,
  type GetMilestoneIssuesQuery,
} from "../__generated/graphql";

export type Job = [owner: string, repo: string, milestone?: number];

const k = (...args: any[]) => args.join("/");

// TODO run all jobs/repos.
const getIssues = (
  token: string,
  jobs: Job[],
  cb: (err: Error | null, res: Map<string, Milestone>) => void
) => {
  let exited = false;
  const q = new PQueue({ concurrency: 1 });
  const abortController = new AbortController();
  const client = new GraphQLClient("https://api.github.com/graphql", {
    signal: abortController.signal,
    headers: {
      authorization: `token ${token}`,
    },
  });

  // TODO wrap requests in try/catch and return varables so we can
  //  can get owner/repo.

  const all = new Map<string, Milestone>();

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
          const [owner, repo] = res.repository.nameWithOwner.split("/");
          const id = k(owner, repo, milestone.number);
          all.set(id, {
            ...milestone,
            id,
            description: milestone.description || null,
            dueOn: milestone.dueOn || null,
            // TODO reuse
            issues: (milestone.issues.nodes || []).flatMap((d) =>
              d
                ? {
                    ...d,
                    closedAt: d.closedAt || null,
                    labels: (d.labels?.nodes || []).flatMap((l) =>
                      l ? l.name : []
                    ),
                  }
                : []
            ),
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
      // TODO reuse
      ref.issues = ref.issues.concat(
        (milestone.issues.nodes || []).flatMap((d) =>
          d
            ? {
                ...d,
                closedAt: d.closedAt || null,
                labels: (d.labels?.nodes || []).flatMap((l) =>
                  l ? l.name : []
                ),
              }
            : []
        )
      );
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

  q.on("idle", () => {
    if (!exited) {
      cb(null, all);
    }
  });

  console.log("start", jobs);

  // Fetch all repo milestones and their issues.
  q.add(() =>
    client.request(GetRepoIssues, {
      owner: "rails",
      repo: "rails",
    })
  );

  return () => {
    exited = true;
    abortController.abort();
    q.clear();
  };
};

export default getIssues;
