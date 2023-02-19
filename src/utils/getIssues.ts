import { GraphQLClient } from "graphql-request";
import PQueue from "p-queue";
import { serializeError } from "serialize-error";
import k from "./keys";
import GetRepoIssues from "../queries/GetRepoIssues";
import GetMilestoneIssues from "../queries/GetMilestoneIssues";
import { Milestone, Issue, ErrorWithVars } from "../interfaces";
import {
  type GetRepoIssuesQuery,
  type GetMilestoneIssuesQuery,
} from "../__generated/graphql";

const CONCURRENCY = 2;
const API_URL = "https://api.github.com/graphql";

type Nodes =
  | ({
      id: string;
      number: number;
      title: string;
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

export type Job = [owner: string, repo: string, milestone?: string];

const getIssues = (
  token: string,
  jobs: Job[],
  cb: (err: ErrorWithVars | null, res: Map<string, Milestone>) => void
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
            owner,
            repo,
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
        throw new Error("Could not resolve to a Milestone");
      }
      if (!milestone.issues.nodes) {
        return;
      }
      const [owner, repo] = res.repository.nameWithOwner.split("/");
      const id = k(owner, repo, milestone.number);
      const d = all.get(id) || {
        ...milestone,
        id,
        owner,
        repo,
        description: milestone.description || null,
        dueOn: milestone.dueOn || null,
        issues: [] as Issue[],
      };
      all.set(id, {
        ...d,
        issues: d.issues.concat(formatIssues(milestone.issues.nodes)),
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
  });

  q.on("error", (err: Error) => {
    if (!exited) {
      const { message, request, response } = serializeError(err);

      const error: ErrorWithVars = {
        message: "Something went wrong.",
      };

      if (
        response &&
        typeof response === "object" &&
        "errors" in response &&
        response.errors instanceof Array &&
        response.errors[0] &&
        typeof response.errors[0] === "object" &&
        "message" in response.errors[0] &&
        response.errors[0].message &&
        typeof response.errors[0].message === "string"
      ) {
        error.message = response.errors[0].message;
      } else if (message) {
        error.message = message;
      }

      if (
        request &&
        typeof request === "object" &&
        "variables" in request &&
        request.variables &&
        typeof request.variables === "object" &&
        !(request.variables instanceof Array)
      ) {
        error.variables = request.variables;
      }

      onExit();
      cb(error, all);
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

  for (const [owner, repo, number] of jobs) {
    const milestone = number && parseInt(number, 10);
    if (milestone) {
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
