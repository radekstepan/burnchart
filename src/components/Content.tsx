import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'

const routes: Oatmilk.IRoute[] = [
  {
    name: 'home',
    path: '/',
    view: React.lazy(() => import('./pages/Projects')),
  },
  {
    name: 'milestones',
    path: '/:org/:project',
    view: React.lazy(() => import('./pages/Milestones')),
  },
  {
    name: 'milestone',
    path: '/:org/:project/:id',
    view: React.lazy(() => import('./pages/Milestone')),
  },
  {
    name: 'notFound',
    path: '/404',
    view: React.lazy(() => import('./pages/NotFound')),
  }
]

function Content() {
  return (
    <Oatmilk.Provider routes={routes}>
      <div id="content">
        <Oatmilk.RouterView />
      </div>
    </Oatmilk.Provider>
  );
}

export default Content;
