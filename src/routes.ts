import React from "react";

export enum Route {
  repos,
  addRepo,
  milestones,
  milestone,
  notFound,
}

export type RouteParams = {
  [Route.repos]: undefined;
  [Route.addRepo]: undefined;
  [Route.milestones]: {
    owner: string;
    repo: string;
  };
  [Route.milestone]: {
    owner: string;
    repo: string;
    number: string;
  };
  [Route.notFound]: undefined;
};

export type RouteParam = RouteParams[keyof RouteParams];

const routes = [
  {
    name: Route.repos,
    path: "/",
    view: React.lazy(() => import("./pages/Repos")),
  },
  {
    name: Route.addRepo,
    path: "/add/repo",
    view: React.lazy(() => import("./pages/AddRepo")),
  },
  {
    name: Route.milestones,
    path: "/:owner/:repo",
    view: React.lazy(() => import("./pages/Milestones")),
  },
  {
    name: Route.milestone,
    path: "/:owner/:repo/:number",
    view: React.lazy(() => import("./pages/Milestone")),
  },
  {
    name: Route.notFound,
    path: "/404",
    view: React.lazy(() => import("./pages/NotFound")),
  },
];

export default routes;
