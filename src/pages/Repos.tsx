import React, { useMemo } from "react";
import Table from "../components/Table/Table";
import Link from "../components/Link/Link";
import Loader from "../components/Loader/Loader";
import Status from "../components/Status/Status";
import Box, { BoxType } from "../components/Box/Box";
import { useReposStore, useTokenStore } from "../hooks/useStore";
import useIssues from "../hooks/useIssues";
import useFirebase from "../hooks/useFirebase";
import { Job } from "../utils/getIssues";

function Repos() {
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
  const [repos] = useReposStore();

  const jobs = useMemo<Job[] | null>(
    () => repos?.map((d) => [d.owner, d.repo]) || null,
    [repos]
  );

  const res = useIssues(jobs);

  if (!token) {
    return (
      <Status>
        <>
          <Link styled onClick={signIn}>
            Sign In
          </Link>
          &nbsp;
          {!jobs || !jobs.length ? "and add a repo" : "to see your repos"}
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

  return (
    <div className="content">
      <Table heading="Repos" {...res} />
    </div>
  );
}

export default Repos;
