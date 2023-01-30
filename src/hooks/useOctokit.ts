import { Octokit } from "@octokit/rest";
import { useMemo } from "react";
import useFirebase from "./useFirebase";
import { useTokenStore } from "./useStore";

const useOctokit = () => {
  const [token] = useTokenStore();

  return useMemo(
    () =>
      new Octokit({
        userAgent: "radekstepan/burnchart",
        auth: token,
      }),
    [token]
  );
};

export default useOctokit;
