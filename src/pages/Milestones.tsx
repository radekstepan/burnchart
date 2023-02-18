import React, { useEffect, useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Table from "../components/Table/Table";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Box, { BoxType } from "../components/Box/Box";
import Link from "../components/Link/Link";
import Status from "../components/Status/Status";
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

  // Save the repo?
  useEffect(() => {
    const { owner, repo } = oatmilk.state;
    if (!repos) {
      setRepos([{ owner, repo }]);
      return;
    }
    if (repos.find((r) => r.owner === owner && r.repo === repo)) {
      return;
    }
    setRepos(repos.concat([{ owner, repo }]));
  }, []);

  const jobs = useMemo<Job[] | null>(() => {
    const { owner, repo } = oatmilk.state;
    return [[owner, repo]];
  }, [oatmilk.state]);

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
      <Status>
        <>
          <Link styled onClick={signIn}>
            Sign In
          </Link>
          &nbsp;to see your repo
        </>
      </Status>
    );
  }

  if (res.error) {
    return <Box type={BoxType.error}>{res.error}</Box>;
  }

  if (res.loading) {
    return <Loader speed={2} />;
  }

  // TODO?
  if (!milestones) {
    return null;
  }

  return (
    <div className="content content--milestones">
      <div className="title">
        {milestones.owner}/{milestones.repo}
      </div>
      <Chart milestone={milestones} />
      <Table heading="Milestones" {...res} />
    </div>
  );
}

export default Milestones;
