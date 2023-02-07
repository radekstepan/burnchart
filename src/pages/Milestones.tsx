import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import Table from "../components/Table";
import Chart from "../components/Chart";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";

function Milestones() {
  const oatmilk = useOatmilk();

  const jobs = useMemo<Job[] | null>(() => {
    const { owner, repo } = oatmilk.state;
    return [[owner, repo]];
  }, [oatmilk.state]);

  const res = useIssues(jobs);
  const { data } = res;

  if (!data.length) {
    return null;
  }

  return (
    <Pane flex={1} className="page">
      <div className="title">
        {data[0].owner}/{data[0].repo}
      </div>
      <Chart milestone={data[0]} />
      <Table heading="Milestones" {...res} />
    </Pane>
  );
}

export default Milestones;
