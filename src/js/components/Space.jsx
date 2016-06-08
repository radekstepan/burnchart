import React from 'react';

// Inserts a space before rendering text.
export default class Space extends React.Component {

  displayName: 'Space.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    return <span>&nbsp;</span>;
  }

}
