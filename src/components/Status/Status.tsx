import React from "react";
import Box, { BoxProps } from "../Box/Box";
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

export default Status;
