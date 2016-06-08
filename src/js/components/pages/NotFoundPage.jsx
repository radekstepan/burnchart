import React from 'react';

import Page from '../../lib/PageClass.js';

// TODO: implement
export default class NotFoundPage extends Page {

  displayName: 'NotFoundPage.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    return <div>Page {this.props.path} not found</div>;
  }

}
