import React, {memo, useEffect, useState} from 'react';

function Header() {
  return (
    <div id="header">
      <div className="logo" />
      <ul className="links">
        <li>Add a Project</li>
        <li>See Examples</li>
      </ul>
      <div className="signIn">Sign In</div>
    </div>
  );
}

export default Header;
