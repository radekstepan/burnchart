import React from 'react';

import Page from '../mixins/Page.js';

export default React.createClass({

  displayName: 'ProjectsPage.jsx',

  mixins: [ Page ],

  render() {
    return <div>Projects</div>;
  }

});
