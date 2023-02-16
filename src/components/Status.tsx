import React from "react";
import Box, { BoxProps } from "./Box";
import Loader from "./Loader";
import "./status.less";

export { BoxType } from "./Box";

interface Props extends BoxProps {}

const Status: React.FC<Props> = ({ type, children }) => (
  <div className="status">
    <Loader speed={0} />
    <Box absolute type={type}>
      {children}
    </Box>
  </div>
);

export default Status;
