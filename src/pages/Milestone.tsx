import React, { useEffect, useMemo } from "react";
import Content from "../components/Content/Content";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Status, { WhySignIn } from "../components/Status/Status";
import Error from "../components/Error/Error";
import Link from "../components/Link/Link";
import { Title } from "../components/Text/Text";
import Table from "../components/Table/Table";
import useIssues from "../hooks/useIssues";
import useFirebase from "../hooks/useFirebase";
import useReposStore from "../hooks/useReposStore";
import useTokenStore from "../hooks/useTokenStore";
import useRouteParams from "../hooks/useRouteParams";
import addStats from "../utils/addStats";
import { Route } from "../routes";

function Milestone() {
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
  const { addRepo } = useReposStore();
  const { owner, repo, number } = useRouteParams(Route.milestone);

  // Save the repo?
  useEffect(() => {
    document.title = `${owner}/${repo}/${number}`;
    addRepo(owner, repo);
  }, [owner, repo, number]);

  const res = useIssues([[owner, repo, number]]);
  const { data } = res;

  const milestone = useMemo(() => {
    if (!data.length) {
      return null;
    }
    return addStats(data[0]);
    // All the data arrive at the same time.
  }, [data.length]);

  useEffect(() => {
    if (milestone?.title) {
      document.title = milestone.title;
    }
  }, [milestone]);

  if (!token) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Status>
          <>
            <Link styled onClick={signIn}>
              Sign In
            </Link>{" "}
            to view your milestone
            <WhySignIn />
          </>
        </Status>
      </Content>
    );
  }

  if (res.error) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Error error={res.error} />
      </Content>
    );
  }

  if (res.loading) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Loader speed={2} />
      </Content>
    );
  }

  // TODO?
  if (!milestone) {
    return null;
  }

  return (
    <Content>
      <Title>
        <Link href={`https://github.com/${owner}/${repo}/milestone/${number}`}>
          {milestone.title}
        </Link>
      </Title>
      <Chart milestone={milestone} />
      <Table {...res} showRemove />
    </Content>
  );
}

export default Milestone;
