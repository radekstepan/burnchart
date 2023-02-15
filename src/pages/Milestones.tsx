import React, { useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Table from "../components/Table";
import Chart from "../components/Chart";
import Loader from "../components/Loader";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";
import addStats from "../utils/addStats";

function Milestones() {
  const oatmilk = useOatmilk();

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

  if (res.error) {
    // TODO
    return null;
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
