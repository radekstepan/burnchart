import React, { useEffect, useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Content from "../components/Content/Content";
import Table from "../components/Table/Table";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Link from "../components/Link/Link";
import Error from "../components/Error/Error";
import { Title } from "../components/Text/Text";
import Status, { WhySignIn } from "../components/Status/Status";
import useIssues from "../hooks/useIssues";
import { useReposStore, useTokenStore } from "../hooks/useStore";
import { Job } from "../utils/getIssues";
import addStats from "../utils/addStats";
import useFirebase from "../hooks/useFirebase";

function Milestones() {
  const oatmilk = useOatmilk();
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
  const [repos, setRepos] = useReposStore();

  const { owner, repo } = oatmilk.state;

  // Save the repo?
  useEffect(() => {
    if (!repos) {
      setRepos([{ owner, repo }]);
      return;
    }
    if (repos.find((r) => r.owner === owner && r.repo === repo)) {
      return;
    }
    setRepos(repos.concat([{ owner, repo }]));
  }, [owner, repo]);

  const jobs = useMemo<Job[] | null>(() => {
    return [[owner, repo]];
  }, [owner, repo]);

  const res = useIssues(jobs);
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
      <div style={{ height: 20 }} />
      <Table {...res} showRemove />
    </Content>
  );
}

export default Milestones;
