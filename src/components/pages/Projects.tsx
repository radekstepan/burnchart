import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'

function Projects() {
  return (
    <div id="projects">
      Projects
      <Oatmilk.Link
        routeName='milestones'
        state={{org: '111', project: '222'}}
      >111 - 222</Oatmilk.Link>
    </div>
  );
}

export default Projects;
