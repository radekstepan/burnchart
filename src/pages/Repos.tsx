import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useReposStore } from "../hooks/useStore";
import Table from "../components/Table";

function Repos() {
  const [repos] = useReposStore();

  const jobs = useMemo(
    () => repos?.map((d) => [d.owner, d.repo]) || null,
    [repos]
  );

  return (
    <Pane flex={1}>
      <Table heading="Projects" jobs={jobs} />
    </Pane>
  );
}

export default Repos;
