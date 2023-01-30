import { RestEndpointMethodTypes } from "@octokit/rest";
import { useEffect, useMemo, useState } from "react";
import { APIMilestone, Milestone, Repo, WithStats } from "../interfaces";
import { useGetMilestones } from "./useGithub";
import useGql from "./useGql";
import useOctokit from "./useOctokit";
import { useReposStore } from "./useStore";

// TODO wait for the token to arrive.
const useRepos = () => {
  const [repos] = useReposStore();

  // const milestones = useGetMilestones(repos);

  useGql(repos);

  // TODO add issues
  // TODO add stats

  return [];
};

export default useRepos;
