import React from "react";
import Box, { BoxType } from "../components/Box/Box";

function NotFound() {
  return <Box type={BoxType.error}>Page not found</Box>;
}

export default NotFound;
