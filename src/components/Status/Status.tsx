import React from "react";
import Box, { BoxProps } from "../Box/Box";
import Link from "../Link/Link";
import Loader from "../Loader/Loader";
import "./status.less";

export { BoxType } from "../Box/Box";

interface Props extends BoxProps {}

const Status: React.FC<Props> = ({ type, children }) => (
  <div className="status">
    <Loader speed={0} />
    <Box absolute type={type}>
      {children}
    </Box>
  </div>
);

export const WhySignIn: React.FC = () => {
  const external = (
    <Link
      styled
      href="https://docs.github.com/en/graphql/guides/forming-calls-with-graphql"
    >
      API requests to GitHub need to be authenticated
    </Link>
  );
  return (
    <div className="status__sub">
      Why is it necessary to sign in? This is because all {external}. By signing
      in, you are able to prove your identity and access authorized resources.
    </div>
  );
};

export default Status;
