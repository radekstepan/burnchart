import React, { memo, useEffect, useState } from "react";
import Oatmilk from "oatmilk";
import { Pane, Table } from "evergreen-ui";
import { useReposStore } from "../hooks/useStore";
import ProgressBar from "../components/ProgressBar";
import useIssues from "../hooks/useIssues";
// import { useRepos } from "../hooks/useGithub";

function Repos() {
  const [repos] = useReposStore();

  // TODO sort order
  const { error, loading, data } = useIssues(
    repos?.map(({ owner, repo }) => [owner, repo]) || null
  );

  if (!repos?.length) {
    // TODO show a hero banner
    return null;
  }

  if (error || loading) {
    // TODO
    return null;
  }

  console.log(data);

  return (
    <Pane flex={1} display="flex">
      <Table width="100%">
        <Table.Body>
          {data.map((d) => (
            <Table.Row key={d.id}>
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
