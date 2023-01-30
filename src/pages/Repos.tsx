import React, { memo, useEffect, useState } from "react";
import Oatmilk from "oatmilk";
import { Pane, Table } from "evergreen-ui";
import { useReposStore } from "../hooks/useStore";
import useRepos from "../hooks/useRepos";
import ProgressBar from "../components/ProgressBar";
// import { useRepos } from "../hooks/useGithub";

function Repos() {
  const milestones = useRepos();

  if (!milestones.length) {
    return null;
  }

  console.log(milestones);

  return (
    <Pane flex={1} display="flex">
      <Table width="100%">
        <Table.Body>
          {milestones.map((d) => (
            <Table.Row key={d.node_id}>
              <Table.TextCell>
                {d.owner}/{d.repo}
              </Table.TextCell>
              <Table.TextCell>{d.title}</Table.TextCell>
              {/**<Table.TextCell><ProgressBar milestone={d} /></Table.TextCell>*/}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Pane>
  );
}

export default Repos;
