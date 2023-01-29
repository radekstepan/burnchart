import React, { memo, useEffect, useState } from "react";
import Oatmilk from "oatmilk";
import { Pane, Table } from "evergreen-ui";

function Repos() {
  return (
    <Pane flex={1} display="flex">
      <Table width="100%">
        <Table.Body>
          <Table.Row>
            <Table.TextCell>radekstepan/disposable</Table.TextCell>
            <Table.TextCell>Empty milestone</Table.TextCell>
            <Table.TextCell>due 7 years ago</Table.TextCell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Pane>
  );
}

export default Repos;
