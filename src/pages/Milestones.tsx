import React, { useMemo } from "react";
import { Pane } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import Table from "../components/Table";

function Milestones() {
  const oatmilk = useOatmilk();

  const jobs = useMemo(() => {
    const { owner, repo } = oatmilk.state;
    return [[owner, repo]];
  }, [oatmilk.state]);

  return (
    <Pane flex={1}>
      <Table heading="Milestones" jobs={jobs} />
    </Pane>
  );
}

export default Milestones;
