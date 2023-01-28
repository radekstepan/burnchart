import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'

function Header() {
  return (
    <div id="header">
      <Oatmilk.Link
        routeName='home'
        className="logo"
      >Burnchart</Oatmilk.Link>
      <ul className="links">
        <li>
          <Oatmilk.Link routeName='newProject'>Add a Project</Oatmilk.Link>
        </li>
        <li>
          See Examples
        </li>
      </ul>
      <div className="signIn">Sign In</div>
    </div>
  );
}

export default Header;
