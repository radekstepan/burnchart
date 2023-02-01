import { GraphQLClient } from "graphql-request";
import { useEffect } from "react";
import { Repo } from "../interfaces";
import { useTokenStore } from "./useStore";
import GetRepoIssues from "../queries/GetRepoIssues";
import GetMilestoneIssues from "../queries/GetMilestoneIssues";
import doUntil from "../utils/doUntil";

export const client = new GraphQLClient("https://api.github.com/graphql");

const useGql = (repos: Repo[]) => {
  const [token] = useTokenStore();

  useEffect(() => {
    if (!token) {
      return;
    }

    client.setHeader("Authorization", `token ${token}`);

    let exited = false;
    const run = async () => {
      // Fetch all repo milestones and their issues.
      const repoRes = await client.request(GetRepoIssues, {
        owner: "rails",
        repo: "rails",
      });

      const milestones = repoRes.repository?.milestones?.nodes;
      if (!exited && milestones) {
        const cursors: [number, string][] = [];
        for (const milestone of milestones) {
          if (milestone) {
            const { hasNextPage, endCursor } = milestone.issues.pageInfo || {};
            if (hasNextPage && endCursor) {
              cursors.push([milestone.number, endCursor]);
            }
          }
        }

        // Resolve next pages of milestones issues.
        if (cursors.length) {
          doUntil(
            async () => {
              const job = cursors.shift();
              if (!job) {
                // TODO should not happen
                return;
              }
              const [milestone, cursor] = job;
              return client.request(GetMilestoneIssues, {
                milestone,
                cursor,
                owner: "rails",
                repo: "rails",
              });
            },
            (last) => {
              if (exited || !last) {
                return false;
              }
              const milestone = last.repository?.milestone;
              if (!milestone) {
                return false;
              }

              const { hasNextPage, endCursor } =
                milestone.issues.pageInfo || {};
              if (hasNextPage && endCursor) {
                cursors.push([milestone.number, endCursor]);
              }

              return !!cursors.length;
            },
            (_err, res) => {
              console.log(res);
            }
          );
        }
      }
    };

    run();

    return () => {
      exited = true;
    };
  }, [token]);
};

export default useGql;
