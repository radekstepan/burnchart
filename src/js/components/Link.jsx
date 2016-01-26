import React from 'react';

import App from '../App.jsx';

export default React.createClass({

  displayName: 'Link.jsx',

  // Navigate to a route.
  _navigate(link, evt) {
    App.navigate(link);
    evt.preventDefault();
  },

  render() {
    let route = this.props.route;
    let link = App.link(route);

    return (
      <a
        {...this.props}
        href={`#!${link}`}
        onClick={this._navigate.bind(this, link)}
      >
        {this.props.children}
      </a>
    );
  }

});
