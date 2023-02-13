import { useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { Milestone } from "../interfaces";
import getIssues, { Job } from "../utils/getIssues";
import k from "../utils/keys";
import { useTokenStore } from "./useStore";
import * as map from "../utils/map";

const store = new Map<string, Milestone>();

const defaultState = {
  error: null,
  loading: false,
  data: [],
};

const useIssues = (ask: Job[] | null) => {
  const [token] = useTokenStore();
  const [state, setState] = useState<{
    error: Error | null;
    loading: boolean;
    data: Milestone[];
  }>(defaultState);

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

      jobs.push(job);

      // TODO display the cache while the latest data loads.
      // const key = new RegExp(`^${owner}\/${repo}`);
      // const d = map.get(store, key);
      // if (!d.length) {
      //   jobs.push(job);
      // }
    }

    setState({ error: null, loading: true, data: defaultState.data });

    let exited = false;

    const cancel = getIssues(token, jobs, (error, res) => {
      if (exited) {
        return;
      }
      if (error) {
        setState({ error, loading: false, data: defaultState.data });
        return;
      }
      if (res) {
        // Save the data.
        for (const [key, milestone] of res) {
          store.set(key, milestone);
        }

        // Populate the result.
        const data: Milestone[] = [];
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
