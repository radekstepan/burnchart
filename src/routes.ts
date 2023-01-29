import React from "react";
import Oatmilk from "oatmilk";

const routes: Oatmilk.IRoute[] = [
  {
    name: "home",
    path: "/",
    view: React.lazy(() => import("./components/pages/Repos")),
  },
  {
    name: "addRepo",
    path: "/add/repo",
    view: React.lazy(() => import("./components/pages/AddRepo")),
  },
  {
    name: "milestones",
    path: "/:org/:repo",
    view: React.lazy(() => import("./components/pages/Milestones")),
  },
  {
    name: "milestone",
    path: "/:org/:repo/:id",
    view: React.lazy(() => import("./components/pages/Milestone")),
  },
  {
    name: "notFound",
    path: "/404",
    view: React.lazy(() => import("./components/pages/NotFound")),
  },
];

export default routes;
