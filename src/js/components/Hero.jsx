import React from 'react';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';
import Link from './Link.jsx';

export default React.createClass({

  displayName: 'Hero.jsx',

  _onDemo() {
    actions.emit('projects.demo');
  },

  render() {
    return (
      <div id="hero">
        <div className="content">
          <Icon name="direction" />
          <h2>See your project progress</h2>
          <p>Serious about a project deadline? Add your GitHub project and we'll tell you if it is running on time or not.</p>
          <div className="cta">
            <Link route={{ to: 'addProject' }} className="primary"><Icon name="plus" /> Add a Project</Link>
            <Link route={{ to: 'demo' }} className="secondary"><Icon name="computer" /> See Examples</Link>
          </div>
        </div>
      </div>
    );
  }

});
