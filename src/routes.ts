import React from "react";
import Oatmilk from "oatmilk";
import Repos from "./pages/Repos";
import Milestones from "./pages/Milestones";
import Milestone from "./pages/Milestone";

const routes: Oatmilk.IRoute[] = [
  {
    name: "repos",
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
    path: "/:owner/:repo",
    // view: React.lazy(() => import("./pages/Milestones")),
    view: Milestones,
  },
  {
    name: "milestone",
    path: "/:owner/:repo/:number",
    // view: React.lazy(() => import("./pages/Milestone")),
    view: Milestone,
  },
  {
    name: "notFound",
    path: "/404",
    view: React.lazy(() => import("./pages/NotFound")),
  },
];

export default routes;
