import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'
import { Pane } from 'evergreen-ui';
import Loading from './Loading';

function Content() {
  return (
    <Pane
      display="flex"
      padding={16}
      alignItems="center"
      justifyContent="center"
    >
      <React.Suspense fallback={<Loading />}>
        <Oatmilk.RouterView />
      </React.Suspense>
    </Pane>
  );
}

export default Content;
