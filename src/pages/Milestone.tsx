import React, { useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Chart from "../components/Chart";
import Loader from "../components/Loader";
import Box, { BoxType } from "../components/Box";
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
    return <Box type={BoxType.error}>{res.error}</Box>;
  }

  if (res.loading) {
    return <Loader speed={2} />;
  }

  // TODO?
  if (!milestone) {
    return null;
  }

  return (
    <div className="content">
      <div className="title">Milestone {milestone.title}</div>
      <Chart milestone={milestone} />
    </div>
  );
}

export default Milestone;
