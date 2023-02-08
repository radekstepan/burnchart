import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import Table from "../components/Table";
import Chart from "../components/Chart";
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

  const milestone = useMemo(() => {
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

  if (!milestone) {
    return null;
  }

  return (
    <Pane flex={1} className="page">
      <div className="title">
        {milestone.owner}/{milestone.repo}
      </div>
      <Chart milestone={milestone} />
      <Table heading="Milestones" {...res} />
    </Pane>
  );
}

export default Milestones;
