import { RestEndpointMethodTypes } from "@octokit/rest";

export interface Repo {
  owner: string;
  repo: string;
}

export type APIMilestone =
  RestEndpointMethodTypes["issues"]["listMilestones"]["response"]["data"][number];

export interface Milestone extends APIMilestone, Repo {}

export interface Stats {
  isOverdue: boolean;
  isOnTime: boolean;
  progress: {
    points: number;
  };
}

export type WithStats<T> = T & { stats: Stats };
