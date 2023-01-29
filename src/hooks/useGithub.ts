import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { useMemo } from "react";
import { useAsync } from "react-use";
import { sortBy } from "../utils/sort";
import useFirebase from "./useFirebase";

const useOctokit = () => {
  const { user } = useFirebase();

  return useMemo(
    () => new Octokit(user ? { auth: user.accessToken } : undefined),
    [user]
  );
};

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

// Get all issues for a state.
export const useIssues = (
  params: RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"]
) => {
  const octokit = useOctokit();

  const res = useAsync(async () => {
    // GET /repos/{owner}/{repo}/issues
    let page = 1;
    let res: RestEndpointMethodTypes["issues"]["listForRepo"]["response"]["data"] =
      [];
    while (page) {
      const { data } = await octokit.issues.listForRepo({
        ...params,
        page,
        per_page: 100,
      });
      res = res.concat(data);
      if (!data.length || data.length < 100) {
        return sortBy(res, "closed_at");
      }
      page += 1;
    }
  }, [params, octokit]);

  return res;
};
