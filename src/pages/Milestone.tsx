import React, { useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Box, { BoxType } from "../components/Box/Box";
import Status, { WhySignIn } from "../components/Status/Status";
import Link from "../components/Link/Link";
import { Title } from "../components/Text/Text";
import useIssues from "../hooks/useIssues";
import useFirebase from "../hooks/useFirebase";
import { useTokenStore } from "../hooks/useStore";
import { Job } from "../utils/getIssues";
import addStats from "../utils/addStats";

function Milestone() {
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
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

  if (!token) {
    return (
      <Status>
        <>
          <Link styled onClick={signIn}>
            Sign In
          </Link>{" "}
          to view your milestone
          <WhySignIn />
        </>
      </Status>
    );
  }

  if (res.error) {
    return <Box type={BoxType.error}>{res.error.message}</Box>;
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
      <Title>Milestone {milestone.title}</Title>
      <Chart milestone={milestone} />
    </div>
  );
}

export default Milestone;
