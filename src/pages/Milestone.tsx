import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import Chart from "../components/Chart";
import Loader from "../components/Loader";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";
import addStats from "../utils/addStats";

function Milestone() {
  const oatmilk = useOatmilk();

  const jobs = useMemo<Job[] | null>(() => {
    const { owner, repo, number } = oatmilk.state;
    return [[owner, repo, number]];
  }, [oatmilk.state]);

  const res = useIssues(jobs);
  const { data } = res;

  const milestone = useMemo(() => {
    if (!data.length) {
      return null;
    }
    return addStats(data[0]);
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
  if (!milestone) {
    return null;
  }

  return (
    <Pane flex={1} className="page">
      <div className="title">Milestone {milestone.title}</div>
      <Chart milestone={milestone} />
    </Pane>
  );
}

export default Milestone;
