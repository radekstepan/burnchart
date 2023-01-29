import { Octokit } from "@octokit/rest";
import { useMemo } from "react";
import useFirebase from "./useFirebase";

const useOctokit = () => {
  const { user } = useFirebase();

  return useMemo(
    () =>
      new Octokit({
        userAgent: "radekstepan/burnchart",
        auth: user ? user.accessToken : undefined,
      }),
    [user]
  );
};

export default useOctokit;
