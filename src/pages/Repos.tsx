import React, { useMemo } from "react";
import Table from "../components/Table/Table";
import Link from "../components/Link/Link";
import Loader from "../components/Loader/Loader";
import Status, { WhySignIn } from "../components/Status/Status";
import Error from "../components/Error/Error";
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
          </Link>{" "}
          {!jobs || !jobs.length
            ? "and then proceed to add a repo"
            : "to view your repos"}
          <WhySignIn />
        </>
      </Status>
    );
  }

  if (!jobs || !jobs.length) {
    return (
      <Status>
        <>
          <Link styled routeName="addRepo">
            Add a Repo
          </Link>{" "}
          to view your milestones
        </>
      </Status>
    );
  }

  if (res.error) {
    return <Error error={res.error} />;
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
