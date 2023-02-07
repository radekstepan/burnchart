import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import Chart from "../components/Chart";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";

function Milestone() {
  const oatmilk = useOatmilk();

  const jobs = useMemo<Job[] | null>(() => {
    const { owner, repo, number } = oatmilk.state;
    return [[owner, repo, number]];
  }, [oatmilk.state]);

  const res = useIssues(jobs);
  const { data } = res;

  if (!data.length) {
    return null;
  }

  return (
    <Pane flex={1} className="page">
      <div className="title">Milestone {data[0].title}</div>
      <Chart milestone={data[0]} />
    </Pane>
  );
}

export default Milestone;
