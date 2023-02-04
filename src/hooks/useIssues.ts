import { useMemo, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import sortOn from "sort-on";
import { Milestone } from "../interfaces";
import getIssues, { Job } from "../utils/getIssues";
import k from "../utils/keys";
import { useTokenStore } from "./useStore";
import * as map from "../utils/map";

const data = new Map<string, Milestone>();

const useIssues = (jobs: Job[] | null) => {
  const [token] = useTokenStore();
  const [state, setState] = useState<{
    error: Error | null;
    loading: boolean;
  }>({ error: null, loading: false });

  useDeepCompareEffect(() => {
    if (!jobs || !token) {
      return;
    }

    setState({ error: null, loading: true });

    let exited = false;

    const cancel = getIssues(token, jobs, (error, res) => {
      if (exited) {
        return;
      }
      if (res) {
        for (const [key, milestone] of res) {
          data.set(key, {
            ...milestone,
            issues: sortOn(milestone.issues, "closedAt"),
          });
        }
      }
      setState({ error, loading: false });
    });

    return () => {
      exited = false;
      cancel();
    };
  }, [token, jobs]);

  return useMemo(() => {
    const issues: Milestone[] = [];

    if (jobs && !state.loading && !state.error) {
      for (const [owner, repo, milestone] of jobs) {
        if (milestone !== undefined) {
          const key = k(owner, repo, milestone);
          const d = map.get(data, key);
          if (d) {
            issues.push(d);
          }
        } else {
          const key = new RegExp(`^${owner}\/${repo}`);
          const d = map.get(data, key);
          issues.push(...d);
        }
      }
    }

    return {
      ...state,
      issues,
    };
  }, [state.error, state.loading]);
};

export default useIssues;
