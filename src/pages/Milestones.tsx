import React, { useEffect, useMemo, useCallback } from "react";
import Content from "../components/Content/Content";
import Table from "../components/Table/Table";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Link from "../components/Link/Link";
import Error from "../components/Error/Error";
import { Title } from "../components/Text/Text";
import Status, { WhySignIn } from "../components/Status/Status";
import { useAuthContext } from "../providers/AuthProvider";
import useIssues from "../hooks/useIssues";
import useReposStore from "../hooks/useReposStore";
import useRouteParams from "../hooks/useRouteParams";
import addStats from "../utils/addStats";
import { Route } from "../routes";

function Milestones() {
  const { isAuthenticated } = useAuthContext();
  const { addRepo, removeRepo } = useReposStore();
  const { owner, repo } = useRouteParams(Route.milestones);

  // Update page title
  useEffect(() => {
    document.title = `${owner}/${repo}`;
  }, [owner, repo]);

  const res = useIssues([[owner, repo]]);
  const { data, error, loading } = res;

  const handleAddToken = useCallback(() => {
    window.dispatchEvent(new CustomEvent("show-token-modal"));
  }, []);

  // Handle repo persistence based on load result
  useEffect(() => {
    // Only act after we've completed loading
    if (loading) return;

    if (error && error.message?.includes("not found")) {
      // Remove non-existent repo from list
      removeRepo(owner, repo);
    } else if (data.length > 0 && !error) {
      // Successfully loaded - add to repos list
      addRepo(owner, repo);
    }
  }, [owner, repo, loading, error, data.length, addRepo, removeRepo]);

  // A milestone that is a merge of all of them.
  const milestones = useMemo(() => {
    if (!data || !data.length) {
      return null;
    }
    // Merge them all together.
    const [head, ...tail] = data;
    return addStats(
      tail.reduce(
        (acc, m) => ({
          ...acc,
          // NOTE: createdAt gets fixed in addStats
          createdAt: m.createdAt < acc.createdAt ? m.createdAt : acc.createdAt,
          dueOn: acc.dueOn
            ? m.dueOn
              ? m.dueOn > acc.dueOn
                ? m.dueOn
                : acc.dueOn
              : acc.dueOn
            : m.dueOn,
          issues: acc.issues.concat(m.issues),
        }),
        head
      )
    );
    // All the data arrive at the same time.
  }, [data]);

  if (!isAuthenticated) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Status>
          <>
            <Link styled onClick={handleAddToken}>
              Add Token
            </Link>{" "}
            to view your milestones
            <WhySignIn />
          </>
        </Status>
      </Content>
    );
  }

  if (error) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Error error={error} />
      </Content>
    );
  }

  if (loading) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Loader speed={2} />
      </Content>
    );
  }

  if (!milestones) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Status>No milestones found for this repository.</Status>
      </Content>
    );
  }

  return (
    <Content>
      <Title>
        {owner}/{repo}
      </Title>
      <Chart milestone={milestones} />
      <Table {...res} showRemove />
    </Content>
  );
}

export default Milestones;
