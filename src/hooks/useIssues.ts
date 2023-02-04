import { useMemo, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import sortOn from "sort-on";
import { Milestone } from "../interfaces";
import getIssues, { Job } from "../utils/getIssues";
import { useTokenStore } from "./useStore";

const useIssues = (jobs: Job[] | null) => {
  const [token] = useTokenStore();
  const [state, setState] = useState<{
    error: Error | null;
    loading: boolean;
    data: Map<string, Milestone> | null;
  }>({ error: null, loading: false, data: null });

  useDeepCompareEffect(() => {
    if (!jobs || !token) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    let exited = false;
    const cancel = getIssues(token, jobs, (error, data) => {
      if (exited) {
        return;
      }
      if (data) {
        for (const [, milestone] of data) {
          milestone.issues = sortOn(milestone.issues, "closedAt");
        }
      }
      setState((prev) => ({ ...prev, error, data, loading: false }));
    });

    return () => {
      exited = false;
      cancel();
    };
  }, [token, jobs]);

  return useMemo(
    () => ({
      error: state.error,
      loading: state.loading,
      issues: state.data,
    }),
    [state.error, state.loading, state.data]
  );
};

export default useIssues;
