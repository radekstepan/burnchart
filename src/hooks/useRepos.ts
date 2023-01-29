import { RestEndpointMethodTypes } from "@octokit/rest";
import { useEffect, useMemo, useState } from "react";
import { APIMilestone, Milestone, Repo } from "../interfaces";
import useOctokit from "./useOctokit";
import { useReposStorage } from "./useStorage";

const useRepos = () => {
  const octokit = useOctokit();
  const [repos] = useReposStorage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const get = async (
      params: RestEndpointMethodTypes["issues"]["listMilestones"]["parameters"]
    ) => {
      // GET /repos/{owner}/{repo}/milestones
      const { data } = await octokit.issues.listMilestones({
        ...params,
        state: "open",
        sort: "due_on",
        direction: "asc",
      });
      return data;
    };

    let cancelled = false;

    const loop = async () => {
      let res: Milestone[] = [];
      const jobs = repos || [{ owner: "rails", repo: "rails" }];
      let params: Repo | undefined;
      while (!cancelled && (params = jobs.shift())) {
        const { owner, repo } = params;
        const data = await get({ owner, repo });
        res = res.concat(data.map((d) => ({ ...d, owner, repo })));
      }
      setMilestones(res);
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [repos, octokit]);

  return milestones;
};

export default useRepos;
