import React from 'react';

import Page from '../../lib/PageMixin.js';

// TODO: implement
export default React.createClass({

  displayName: 'NotFoundPage.jsx',

  mixins: [ Page ],

  render() {
    return <div>Page {this.props.path} not found</div>;
  }

});
