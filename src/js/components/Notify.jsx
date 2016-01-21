import React from 'react';
import Transition from 'react-addons-css-transition-group';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';

let Notify = React.createClass({

  displayName: 'Notify.jsx',

  // Close notification.
  _onClose() {
    actions.emit('system.notify');
  },

  getDefaultProps() {
    return {
      // No text.
      'text': null,
      // Grey style.
      'type': '',
      // Top notification.
      'system': false,
      // Just announcing.
      'icon': 'megaphone'
    };
  },

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

});

export default React.createClass({

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

});
