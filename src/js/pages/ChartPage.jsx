import React from 'react';

import Page from '../mixins/Page.js';

export default React.createClass({

  displayName: 'ChartPage.jsx',

  mixins: [ Page ],

  render() {
    return <div>Chart</div>;
  }

});
