import React from "react";
import Oatmilk from "oatmilk";

const routes: Oatmilk.IRoute[] = [
  {
    name: "home",
    path: "/",
    view: React.lazy(() => import("./pages/Repos")),
  },
  {
    name: "addRepo",
    path: "/add/repo",
    view: React.lazy(() => import("./pages/AddRepo")),
  },
  {
    name: "milestones",
    path: "/:org/:repo",
    view: React.lazy(() => import("./pages/Milestones")),
  },
  {
    name: "milestone",
    path: "/:org/:repo/:id",
    view: React.lazy(() => import("./pages/Milestone")),
  },
  {
    name: "notFound",
    path: "/404",
    view: React.lazy(() => import("./pages/NotFound")),
  },
];

export default routes;
