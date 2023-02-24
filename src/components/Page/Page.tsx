import React from "react";
import { Router, Route } from "wouter";
import routes from "../../routes";
import Loader from "../Loader/Loader";
import "./page.less";

const Page: React.FC = () => (
  <div className="page">
    <React.Suspense fallback={<Loader speed={2} />}>
      <Router>
        {routes.map((route) => (
          <Route key={route.name} path={route.path} component={route.view} />
        ))}
      </Router>
    </React.Suspense>
  </div>
);

export default Page;
