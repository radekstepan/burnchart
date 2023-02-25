import React, { useEffect, useMemo } from "react";
import Content from "../components/Content/Content";
import Table from "../components/Table/Table";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Link from "../components/Link/Link";
import Error from "../components/Error/Error";
import { Title } from "../components/Text/Text";
import Status, { WhySignIn } from "../components/Status/Status";
import useIssues from "../hooks/useIssues";
import useReposStore from "../hooks/useReposStore";
import useTokenStore from "../hooks/useTokenStore";
import useFirebase from "../hooks/useFirebase";
import useRouteParams from "../hooks/useRouteParams";
import addStats from "../utils/addStats";
import { Route } from "../routes";

function Milestones() {
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
  const { addRepo } = useReposStore();
  const { owner, repo } = useRouteParams(Route.milestones);

  // Save the repo?
  useEffect(() => {
    document.title = `${owner}/${repo}`;
    addRepo(owner, repo);
  }, [owner, repo]);

  const res = useIssues([[owner, repo]]);
  const { data } = res;

  const milestones = useMemo(() => {
    if (!data.length) {
      return null;
    }
    // Merge them all together.
    const [head, ...tail] = data;
    return addStats(
      tail.reduce(
        (acc, m) => ({
          ...acc,
          // TODO this should check when the first issue was closed
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
  }, [data.length]);

  if (!token) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Status>
          <>
            <Link styled onClick={signIn}>
              Sign In
            </Link>{" "}
            to view your milestones
            <WhySignIn />
          </>
        </Status>
      </Content>
    );
  }

  if (res.error) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Error error={res.error} />
      </Content>
    );
  }

  if (res.loading) {
    return (
      <Content title={`${owner}/${repo}`}>
        <Loader speed={2} />
      </Content>
    );
  }

  // TODO?
  if (!milestones) {
    return null;
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
