import React from "react";
import Link from "../Link/Link";
import "./footer.less";

function Footer() {
  return (
    <div id="footer">
      2012-{new Date().getFullYear()}{" "}
      <Link styled href="https://radekstepan.com">
        Radek Stepan
      </Link>{" "}
      and{" "}
      <Link
        styled
        href="https://github.com/radekstepan/burnchart/graphs/contributors"
      >
        Contributors
      </Link>
    </div>
  );
}

export default Footer;
