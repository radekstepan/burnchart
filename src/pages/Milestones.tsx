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

  return (
    <Pane flex={1}>
      {!!data.length && <Chart milestone={data[0]} />}
      <Table heading="Milestones" {...res} />
    </Pane>
  );
}

export default Milestones;
