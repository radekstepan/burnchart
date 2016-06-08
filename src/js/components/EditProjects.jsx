import React from 'react';
import _ from 'lodash';
import cls from 'classnames';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';
import Link from './Link.jsx';

export default class EditProjects extends React.Component {

  displayName: 'EditProjects.jsx'

  constructor(props) {
    super(props);
  }

  _onDelete(project) {
    actions.emit('projects.delete', project);
  }

  render() {
    let { projects } = this.props;

    let list = _(projects.list)
    .sortBy(({ owner, name }) => `${owner}/${name}`)
    .map(({owner, name}, i) => {
      return (
        <tr key={`${owner}-${name}`}>
          <td className="repo" colSpan="2">
            <Link
              route={{ 'to': 'milestones', 'params': { owner, name } }}
              className="project"
              >
              {owner}/{name}
            </Link>
          </td>
          <td
            className="action"
            onClick={this._onDelete.bind(this, { owner, name })}
          ><Icon name="delete" /> Delete</td>
        </tr>
      );
    }).value();

    // Wait for something to show.
    if (!list.length) return false;

    return (
      <div id="projects">
        <div className="header"><h2>Edit Projects</h2></div>
        <table>
          <tbody>{list}</tbody>
        </table>
        <div className="footer">
          <a onClick={this.props.onToggleMode}>View Projects</a>
        </div>
      </div>
    );
  }

}
