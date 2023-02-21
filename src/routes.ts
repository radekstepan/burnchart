import React from "react";
import Oatmilk from "oatmilk";

const routes: Oatmilk.IRoute[] = [
  {
    name: "repos",
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
    path: "/:owner/:repo",
    view: React.lazy(() => import("./pages/Milestones")),
  },
  {
    name: "milestone",
    path: "/:owner/:repo/:number",
    view: React.lazy(() => import("./pages/Milestone")),
  },
  {
    name: "notFound",
    path: "/404",
    view: React.lazy(() => import("./pages/NotFound")),
  },
];

export default routes;
