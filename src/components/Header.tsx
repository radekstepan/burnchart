import React, {memo, useEffect, useState} from 'react';
import { useOatmilk } from 'oatmilk'
import {Button, Link, Pane} from 'evergreen-ui';
import Icon from './Icon';

function Header() {
  const oatmilk = useOatmilk();

  return (
    <Pane
      borderBottom
      display="flex"
      padding={16}
    >
      <Pane flex={1} display="flex">
        <Link href={oatmilk.getHref('newProject')}>
          <Icon name="fire" />
        </Link>
        <Link href={oatmilk.getHref('newProject')}>
          Add a Project
        </Link>
        <Link>
          See Examples
        </Link>
      </Pane>
      <Pane>
        <Button appearance='primary'>Sign In</Button>
      </Pane>
    </Pane>
  );
}

export default Header;
