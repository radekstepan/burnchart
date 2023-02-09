import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import Table from "../components/Table";
import { useReposStore } from "../hooks/useStore";
import useIssues from "../hooks/useIssues";
import { Job } from "../utils/getIssues";

function Repos() {
  const [repos] = useReposStore();

  const jobs = useMemo<Job[] | null>(
    () => repos?.map((d) => [d.owner, d.repo]) || null,
    [repos]
  );

  // TODO skip cache
  const res = useIssues(jobs);

  return (
    <Pane flex={1} className="page">
      <Table heading="Projects" {...res} />
    </Pane>
  );
}

export default Repos;
