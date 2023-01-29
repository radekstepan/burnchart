import { RestEndpointMethodTypes } from "@octokit/rest";

export interface Repo {
  owner: string;
  repo: string;
}

export type APIMilestone =
  RestEndpointMethodTypes["issues"]["listMilestones"]["response"]["data"][number];

export interface Milestone extends APIMilestone, Repo {}
