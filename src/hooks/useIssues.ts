import { useEffect, useMemo, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { Milestone } from "../interfaces";
import getIssues, { Job } from "../utils/getIssues";
import useGithub from "./useGithub";
import { useTokenStore } from "./useStore";

const useIssues = (jobs: Job[] | null) => {
  const [token] = useTokenStore();
  const [state, setState] = useState<{
    loading: boolean;
    data: Map<string, Milestone> | null;
  }>({ loading: false, data: null });

  useDeepCompareEffect(() => {
    if (!jobs || !token) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    let exited = false;
    const cancel = getIssues(token, jobs, (err, data) => {
      if (exited) {
        return;
      }
      setState((prev) => ({ ...prev, data, loading: false }));
    });

    return () => {
      exited = false;
      cancel();
    };
  }, [token, jobs]);

  return useMemo(
    () => ({
      error: null,
      loading: state.loading,
      issues: state.data,
    }),
    [state.loading, state.data]
  );
};

export default useIssues;
