import React from 'react';

import Page from '../mixins/Page.js';

export default React.createClass({

  displayName: 'NotFoundPage.jsx',

  mixins: [ Page ],

  render() {
    return <div>Page {this.props.path} not found</div>;
  }

});
