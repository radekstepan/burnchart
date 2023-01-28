import React, {memo, useEffect, useState} from 'react';
import { Pane, Text } from 'evergreen-ui';

function Footer() {
  return (
    <Pane
      display="flex"
      padding={16}
      justifyContent="center"
    >
      <Text>
        &copy; 2012-2023 Radek Stepan &amp; Contributors
      </Text>
    </Pane>
  );
}

export default Footer;
