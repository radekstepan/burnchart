import React, { memo, useEffect, useState, useContext } from "react";
import { useOatmilk } from "oatmilk";
import { Text, Pane } from "evergreen-ui";
import Link from "./Link";
import Icon from "./Icon";
import Auth from "./Auth";

function Header() {
  const oatmilk = useOatmilk();

  return (
    <Pane borderBottom display="flex" padding={16}>
      <Pane flex={1} display="flex">
        <Link routeName="home">
          <Icon name="fire" />
        </Link>
        <Link routeName="addRepo">
          <Icon name="plus" /> Add a Repo
        </Link>
        <Link>
          <Icon name="computer" /> See Examples
        </Link>
      </Pane>
      <Pane>
        <Auth />
      </Pane>
    </Pane>
  );
}

export default Header;
