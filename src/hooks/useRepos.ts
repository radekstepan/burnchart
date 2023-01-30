import { RestEndpointMethodTypes } from "@octokit/rest";
import { useEffect, useMemo, useState } from "react";
import { APIMilestone, Milestone, Repo, WithStats } from "../interfaces";
import { useGetMilestones } from "./useGithub";
import useOctokit from "./useOctokit";
import { useReposStorage } from "./useStorage";

const useRepos = () => {
  const [repos] = useReposStorage();

  const milestones = useGetMilestones(repos);

  // TODO add issues
  // TODO add stats

  return milestones;
};

export default useRepos;
