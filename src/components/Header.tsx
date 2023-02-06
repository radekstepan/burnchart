import React, { memo, useEffect, useState, useContext } from "react";
import { useOatmilk } from "oatmilk";
import { Text, Pane } from "evergreen-ui";
import Link from "./Link";
import Icon from "./Icon";
import Auth from "./Auth";
import "./header.less";

function Header() {
  const oatmilk = useOatmilk();

  return (
    <Pane borderBottom display="flex" padding={16} className="header">
      <Pane flex={1} display="flex" alignItems="center">
        <Link routeName="home" className="logo">
          <Icon name="fire" />
        </Link>
        <Link routeName="addRepo" className="item">
          <Icon name="plus" /> Add a Repo
        </Link>
        <Link className="item">
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
