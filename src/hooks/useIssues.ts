import { useState } from "react";
import { useDeepCompareEffect } from "react-use";
import sortOn from "sort-on";
import { Milestone, WithStats } from "../interfaces";
import getIssues, { Job } from "../utils/getIssues";
import k from "../utils/keys";
import { useTokenStore } from "./useStore";
import * as map from "../utils/map";
import addStats from "../utils/addStats";

const store = new Map<string, WithStats<Milestone>>();

const useIssues = (ask: Job[] | null) => {
  const [token] = useTokenStore();
  const [state, setState] = useState<{
    error: Error | null;
    loading: boolean;
    data: WithStats<Milestone>[];
  }>({ error: null, loading: false, data: [] });

  useDeepCompareEffect(() => {
    if (!ask || !token) {
      return;
    }

    const jobs: Job[] = [];
    for (const job of ask) {
      const [owner, repo, milestone] = job;
      if (milestone !== undefined) {
        const key = k(owner, repo, milestone);
        const d = map.get(store, key);
        if (!d) {
          jobs.push(job);
        }
        continue;
      }

      const key = new RegExp(`^${owner}\/${repo}`);
      const d = map.get(store, key);
      if (!d.length) {
        jobs.push(job);
      }
    }

    setState({ error: null, loading: true, data: [] });

    let exited = false;

    const cancel = getIssues(token, jobs, (error, res) => {
      if (exited) {
        return;
      }
      if (error) {
        setState({ error, loading: false, data: [] });
        return;
      }
      if (res) {
        // Save the data.
        for (const [key, milestone] of res) {
          const sorted = sortOn(milestone.issues, "closedAt");
          store.set(
            key,
            addStats({
              ...milestone,
              issues: sorted,
            })
          );
        }

        // Populate the result.
        const data: WithStats<Milestone>[] = [];
        for (const [owner, repo, milestone] of ask) {
          if (milestone !== undefined) {
            const key = k(owner, repo, milestone);
            const d = map.get(store, key);
            if (!d) {
              // TODO should not happen
              continue;
            }
            data.push(d);
            continue;
          }

          const key = new RegExp(`^${owner}\/${repo}`);
          const d = map.get(store, key);
          if (!d.length) {
            // TODO should not happen
            continue;
          }
          data.push(...d);
        }

        setState({ error, loading: false, data });
      }
    });

    return () => {
      exited = false;
      cancel();
    };
  }, [token, ask]);

  return state;
};

export default useIssues;
