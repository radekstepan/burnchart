import React from "react";
import Oatmilk from "oatmilk";

const routes: Oatmilk.IRoute[] = [
  {
    name: "home",
    path: "/",
    view: React.lazy(() => import("./components/pages/Projects")),
  },
  {
    name: "newProject",
    path: "/new/project",
    view: React.lazy(() => import("./components/pages/NewProject")),
  },
  {
    name: "milestones",
    path: "/:org/:project",
    view: React.lazy(() => import("./components/pages/Milestones")),
  },
  {
    name: "milestone",
    path: "/:org/:project/:id",
    view: React.lazy(() => import("./components/pages/Milestone")),
  },
  {
    name: "notFound",
    path: "/404",
    view: React.lazy(() => import("./components/pages/NotFound")),
  },
];

export default routes;
