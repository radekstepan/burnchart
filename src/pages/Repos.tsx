import React, { useEffect, useCallback } from "react";
import Content from "../components/Content/Content";
import Table from "../components/Table/Table";
import Link from "../components/Link/Link";
import Loader from "../components/Loader/Loader";
import Status, { WhySignIn } from "../components/Status/Status";
import Error from "../components/Error/Error";
import { Route } from "../routes";
import useReposStore from "../hooks/useReposStore";
import { useAuthContext } from "../providers/AuthProvider";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";

const TITLE = "Repos";

function Repos() {
  const { isAuthenticated } = useAuthContext();
  const { repos, removeRepo } = useReposStore();

  useEffect(() => {
    document.title = "Burnchart";
  }, []);

  const jobs = repos.map<Job>((d) => [d.owner, d.repo]);

  const res = useIssues(jobs);

  const handleAddToken = useCallback(() => {
    window.dispatchEvent(new CustomEvent("show-token-modal"));
  }, []);

  // Handle 404 errors by removing non-existent repos
  useEffect(() => {
    if (res.error && res.error.message?.includes("not found")) {
      const { owner, repo } = res.error.variables || {};
      if (owner && repo) {
        removeRepo(owner as string, repo as string);
      }
    }
  }, [res.error, removeRepo]);

  if (!isAuthenticated) {
    return (
      <Content title={TITLE}>
        <Status>
          <>
            <Link styled onClick={handleAddToken}>
              Add Token
            </Link>{" "}
            {!jobs.length
              ? "and then proceed to add a repo."
              : "to view your repos."}
            <WhySignIn />
          </>
        </Status>
      </Content>
    );
  }

  if (!jobs.length) {
    return (
      <Content title={TITLE}>
        <Status>
          <>
            <Link styled routeName={Route.addRepo}>
              Add a Repo
            </Link>{" "}
            to view your milestones.
          </>
        </Status>
      </Content>
    );
  }

  if (res.error) {
    return (
      <Content title={TITLE}>
        <Error error={res.error} />
      </Content>
    );
  }

  if (res.loading) {
    return (
      <Content title={TITLE}>
        <Loader speed={2} />
      </Content>
    );
  }

  return (
    <Content>
      <Table heading={TITLE} {...res} />
    </Content>
  );
}

export default Repos;
