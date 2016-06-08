import React from 'react';
import Transition from 'react-addons-css-transition-group';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';

class Notify extends React.Component {

  displayName: 'Notify.jsx'

  constructor(props) {
    super(props);

    this.props = {
      // No text.
      'text': null,
      // Grey style.
      'type': '',
      // Top notification.
      'system': false,
      // Just announcing.
      'icon': 'megaphone'
    };
  }

  // Close notification.
  _onClose() {
    actions.emit('system.notify');
  }

  render() {
    let { text, system, type, icon, ttl } = this.props;

    // No text = no message.
    if (!text) return false;

    if (system) {
      return (
        <div id="notify" className={`system ${type}`}>
          <Icon name={icon} />
          <p>{text}</p>
        </div>
      );
    } else {
      return (
        <div id="notify" className={type}>
          <span className="close" onClick={this._onClose} />
          <Icon name={icon} />
          <p>{text}</p>
        </div>
      );
    }
  }

}

export default class NotifyWrapper extends React.Component {

  // TODO: animate in
  render() {
    if (!this.props.id) return false; // TODO: fix ghost

    // Top bar or center positioned?
    let name = (this.props.system) ? 'animCenter' : 'animTop';

    return (
      <Transition transitionName={name}
        transitionEnterTimeout={2000}
        transitionLeaveTimeout={1000}
        component="div"
      >
        <Notify {...this.props} key={this.props.id} />
      </Transition>
    );
  }

}
