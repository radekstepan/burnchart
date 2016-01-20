import React from 'react';

import App from '../App.jsx';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';
import S from './Space.jsx';

export default React.createClass({

  displayName: 'AddProjectForm.jsx',

  // Sign user in.
  _onSignIn() {
    actions.emit('user.signin');
  },

  _onChange(evt) {
    this.setState({ 'val': evt.target.value });
  },

  _onKeyUp(evt) {
    if (evt.key == 'Enter') {
      this._onAdd();
    }
  },

  _onAdd() {
    let [ owner, name ] = this.state.val.split('/');
    actions.emit('projects.add', { owner, name });
    // Redirect to the dashboard.
    App.navigate({ 'to': 'projects' });
  },

  getInitialState() {
    return { 'val': '' };
  },

  render() {
    let user;
    if (!('uid' in this.props.user)) {
      user = (
        <span><S />If you'd like to add a private GitHub repo,
        <S /><a onClick={this._onSignIn}>Sign In</a> first.</span>
      );
    }

    return (
      <div id="add">
        <div className="header">
          <h2>Add a Project</h2>
          <p>Type the name of a GitHub repository that has some
          milestones with issues.{user}</p>
        </div>

        <div className="form">
          <table>
            <tbody>
              <tr>
                <td>
                  <input type="text" ref="el" placeholder="user/repo" autoComplete="off"
                  onChange={this._onChange} value={this.state.val} onKeyUp={this._onKeyUp} />
                </td>
                <td><a onClick={this._onAdd}>Add</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="protip">
          <Icon name="rocket"/> Protip: To see if a milestone is on track or not,
          make sure it has a due date assigned to it.
        </div>
      </div>
    );
  },

  componentDidMount() {
    this.refs.el.focus();
  }

});
