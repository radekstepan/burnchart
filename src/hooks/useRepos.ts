import { RestEndpointMethodTypes } from "@octokit/rest";
import { useEffect, useMemo, useState } from "react";
import { APIMilestone, Milestone, Repo, WithStats } from "../interfaces";
import { useGetMilestones } from "./useGithub";
import useOctokit from "./useOctokit";
import { useReposStore } from "./useStore";

const useRepos = () => {
  const [repos] = useReposStore();

  const milestones = useGetMilestones(repos);

  // TODO add issues
  // TODO add stats

  return milestones;
};

export default useRepos;
