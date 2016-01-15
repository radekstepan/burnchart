import React from 'react';
import _ from 'lodash';
import cls from 'classnames';

import Format from '../mixins/Format.js';

import Icon from './Icon.jsx';
import Link from './Link.jsx';

export default React.createClass({

  displayName: 'Projects.jsx',

  mixins: [ Format ],

  // TODO: implement
  _onSort() {

  },

  render() {
    let projects = this.props.projects;

    // Show the projects with errors first.
    let errors = _(projects.list).filter('errors').map((project, i) => {
      let text = project.errors.join('\n');
      return (
        <tr key={`err-${i}`}>
          <td colSpan="3" className="repo">
            <div className="project">{project.owner}/{project.name}
              <span className="error" title={text}><Icon name="warning"/></span>
            </div>
          </td>
        </tr>
      );
    }).value();

    // Now for the list of projects.
    let list = _.map(projects.index, ([ pI, mI ]) => {
      let { owner, name, milestones } = projects.list[pI];
      let milestone = milestones[mI];

      return (
        <tr className={cls({ 'done': milestone.stats.isDone })} key={`${pI}-${mI}`}>
          <td className="repo">
            <Link route={{ 'to': 'milestones', 'params': { owner, name } }} className="project">
              {owner}/{name}
            </Link>
          </td>
          <td>
            <Link route={{ 'to': 'chart', 'params': { owner, name, 'milestone': milestone.number } }} className="milestone">
              {milestone.title}
            </Link>
          </td>
          <td style={{ 'width': '1%' }}>
            <div className="progress">
              <span className="percent">{Math.floor(milestone.stats.progress.points)}%</span>
              <span className={cls('due', { 'red': milestone.stats.isOverdue })}>
                {this._due(milestone.due_on)}
              </span>
              <div className="outer bar">
                <div
                  className={cls('inner', 'bar', { 'green': milestone.stats.isOnTime, 'red': !milestone.stats.isOnTime })}
                  style={{ 'width': `${milestone.stats.progress.points}%` }}
                />
              </div>
            </div>
          </td>
        </tr>
      );
    });

    return (
      <div id="projects">
        <div className="header">
          <a className="sort" onClick={this._onSort}><Icon name="sort"/> Sorted by {projects.sortBy}</a>
          <h2>Projects</h2>
        </div>
        <table>
          <tbody>
            {errors}
            {list}
          </tbody>
        </table>
        <div className="footer" />
      </div>
    );
  }

});
