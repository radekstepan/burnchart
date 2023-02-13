import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import Table from "../components/Table";
import Link from "../components/Link";
import Loader from "../components/Loader";
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
      <div id="repos">
        <Loader speed={0} />
        <div className="note">
          <Link styled onClick={signIn}>
            Sign In
          </Link>
          &nbsp;
          {!jobs || !jobs.length ? "and add a repo" : "to see your repos"}
        </div>
      </div>
    );
  }

  if (res.error) {
    // TODO
    return null;
  }

  if (res.loading) {
    return <Loader speed={2} />;
  }

  return (
    <Pane flex={1}>
      <Table heading="Repos" {...res} />
    </Pane>
  );
}

export default Repos;
