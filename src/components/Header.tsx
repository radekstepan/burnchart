import React, {memo, useEffect, useState, useContext} from 'react';
import { useOatmilk } from 'oatmilk'
import {Button, Link, Pane} from 'evergreen-ui';
import Icon from './Icon';
import { FirebaseContext } from '../providers/FirebaseProvider';

function Header() {
  const oatmilk = useOatmilk();

  const {signIn} = useContext(FirebaseContext);

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
        <Button
          appearance='primary'
          onClick={signIn}
        >Sign In</Button>
      </Pane>
    </Pane>
  );
}

export default Header;
