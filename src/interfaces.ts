import { RestEndpointMethodTypes } from "@octokit/rest";

export interface Repo {
  owner: string;
  repo: string;
}

export type APIMilestone =
  RestEndpointMethodTypes["issues"]["listMilestones"]["response"]["data"][number];

export interface Milestone extends APIMilestone, Repo {}

export interface Stats {
  days: number;
  span: number;
  isOverdue: boolean;
  isOnTime: boolean;
  progress: {
    points: number;
    time: number;
  };
}

export type WithStats<T> = T & { stats: Stats };
