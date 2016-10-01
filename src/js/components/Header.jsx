import React from 'react';

import actions from '../actions/appActions.js';

import Notify from './Notify.jsx';
import Icon from './Icon.jsx';
import Link from './Link.jsx';

export default class Header extends React.Component {

  displayName: 'Header.jsx'

  constructor(props) {
    super(props);
  }

  // Sign user in.
  _onSignIn() {
    actions.emit('user.signin');
  }

  // Sign user out.
  _onSignOut() {
    actions.emit('user.signout');
  }

  // Add example projects.
  _onDemo() {
    actions.emit('projects.demo');
  }

  render() {
    // From app store.
    let props = this.props.app;

    // Sign-in/out.
    let user;
    if (props.user && props.user.github) {
      user = (
        <div className="right">
          <a onClick={this._onSignOut}>
            <Icon name="signout" /> Sign Out {props.user.github.displayName}
          </a>
        </div>
      );
    } else {
      user = (
        <div className="right">
          <a className="button" onClick={this._onSignIn}>
            <Icon name="github"/> Sign In
          </a>
        </div>
      );
    }

    // Switch loading icon with app icon.
    let icon = [ 'fire', 'spinner' ][ +props.system.loading ];

    return (
      <div>
        <Notify {...props.system.notification} />
        <div id="head">
          {user}

          <Link route={{ 'to': 'projects' }} id="icon">
            <Icon name={icon} />
          </Link>

          <ul>
            <li>
              <Link route={{ 'to': 'addProject' }}>
                <Icon name="plus" /> Add a Project
              </Link>
            </li>
            <li>
              <Link route={{ 'to': 'demo' }}>
                <Icon name="computer" /> See Examples
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }

}
