import React, {memo, useEffect, useState, useContext} from 'react';
import { useOatmilk } from 'oatmilk'
import {Button, Link, Pane} from 'evergreen-ui';
import Icon from './Icon';
import Auth from './Auth';

function Header() {
  const oatmilk = useOatmilk();

  return (
    <Pane
      borderBottom
      display="flex"
      padding={16}
    >
      <Pane flex={1} display="flex">
        <Link href={oatmilk.getHref('home')}>
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
        <Auth />
      </Pane>
    </Pane>
  );
}

export default Header;
