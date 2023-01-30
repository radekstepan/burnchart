import React from "react";
import Oatmilk from "oatmilk";
import Repos from "./pages/Repos";
import Milestones from "./pages/Milestones";

const routes: Oatmilk.IRoute[] = [
  {
    name: "home",
    path: "/",
    // view: React.lazy(() => import("./pages/Repos")),
    view: Repos,
  },
  {
    name: "addRepo",
    path: "/add/repo",
    view: React.lazy(() => import("./pages/AddRepo")),
  },
  {
    name: "milestones",
    path: "/:org/:repo",
    // view: React.lazy(() => import("./pages/Milestones")),
    view: Milestones,
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
