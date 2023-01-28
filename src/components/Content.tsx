import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'
import Loading from './Loading';

function Content() {
  return (
    <div id="content">
      <React.Suspense fallback={<Loading />}>
        <Oatmilk.RouterView />
      </React.Suspense>
    </div>
  );
}

export default Content;
