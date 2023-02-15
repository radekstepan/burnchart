import React from "react";
import Link from "./Link";
import Icon from "./Icon";
import Auth from "./Auth";
import "./header.less";

function Header() {
  return (
    <div id="header">
      <div className="links">
        <Link routeName="home" className="logo">
          <Icon name="fire" />
        </Link>
        <Link routeName="addRepo" className="item">
          <Icon name="plus" /> Add a Repo
        </Link>
      </div>
      <Auth />
    </div>
  );
}

export default Header;
