import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { useMemo } from "react";
import { useAsync } from "react-use";
import { sortBy } from "../utils/sort";
import useFirebase from "./useFirebase";
import useOctokit from "./useOctokit";

// Get repos user has access to or are public to owner.
export const useRepos = (username?: string) => {
  const octokit = useOctokit();

  const res = useAsync(async () => {
    if (username) {
      // "GET /users/{username}/repos
      const { data } = await octokit.repos.listForUser({ username });
      return data;
    }
    // GET /user/repos
    const { data } = await octokit.repos.listForAuthenticatedUser();
    return data;
  }, [username, octokit]);

  return res;
};

// Get all open milestones.
export const useMilestones = (
  params: RestEndpointMethodTypes["issues"]["listMilestones"]["parameters"]
) => {
  const octokit = useOctokit();

  const res = useAsync(async () => {
    // GET /repos/{owner}/{repo}/milestones
    const { data } = await octokit.issues.listMilestones({
      ...params,
      state: "open",
      sort: "due_on",
      direction: "asc",
    });
    return data;
  }, [params, octokit]);

  return res;
};

// Get one open milestone.
export const useMilestone = (
  params: RestEndpointMethodTypes["issues"]["getMilestone"]["parameters"]
) => {
  const octokit = useOctokit();

  const res = useAsync(async () => {
    // GET /repos/{owner}/{repo}/milestones/{milestone_number}
    const { data } = await octokit.issues.getMilestone({
      ...params,
      state: "open",
      sort: "due_date",
      direction: "asc",
    });
    return data;
  }, [params, octokit]);

  return res;
};

// Get all (pages of) issues for a state.
export const useIssues = (
  params: RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"]
) => {
  const octokit = useOctokit();

  const res = useAsync(async () => {
    // GET /repos/{owner}/{repo}/issues
    const res = await octokit.paginate(octokit.issues.listForRepo, params);
    return sortBy(res, "closed_at");
  }, [params, octokit]);

  return res;
};
