import React from "react";
import Content from "../components/Content/Content";
import Box, { BoxType } from "../components/Box/Box";

const NotFound: React.FC = () => (
  <Content slim title="404">
    <Box type={BoxType.error}>
      We're sorry, but the page you are looking for could not be found. Please
      check the URL or try navigating to a different page.
    </Box>
  </Content>
);

export default NotFound;
