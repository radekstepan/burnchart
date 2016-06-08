import React from 'react';
import _ from 'lodash';

import Page from '../../lib/PageClass.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Milestones from '../Milestones.jsx';
import Chart from '../Chart.jsx';

export default class MilestonePage extends Page {

  displayName: 'MilestonesPage.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    let content;
    if (!this.state.app.system.loading) {
      let projects = this.state.projects;
      // Create the all milestones payload.
      let data;
      _.find(projects.list, (obj) => {
        if (obj.owner == this.props.owner && obj.name == this.props.name) {
          if (obj.milestones) {
            let created_at = 'Z',
                due_on = '0',
                issues = {
                  'closed': { 'list': [], 'size': 0 },
                  'open':   { 'list': [], 'size': 0 }
                };
            // Merge all the milestone issues together.
            _(obj.milestones).filter((m) => !m.stats.isEmpty).each((m) => {
              if (m.created_at < created_at) created_at = m.created_at;
              if (m.due_on > due_on) due_on = m.due_on;
              _.each([ 'closed', 'open' ], (k) => {
                issues[k].list = issues[k].list.concat(m.issues[k].list);
                issues[k].size += m.issues[k].size;
              });
            }).value();

            issues.closed.list = _.sortBy(issues.closed.list, 'closed_at');

            // A meta milestone.
            data = { issues, created_at, 'stats': { 'isEmpty': false } };

            if (due_on != '0') data.due_on = due_on;
          }
          return true;
        }
      });

      if (data) {
        content = (
          <div>
            <Chart data={data} style={{ 'marginBottom': '40px' }} />
            <Milestones projects={projects} project={this.props} />
          </div>
        );
      } else {
        content = <Milestones projects={projects} project={this.props} />
      }
    }

    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">
          <div id="title">
            <div className="wrap">
              <h2 className="title">{this.props.owner}/{this.props.name}</h2>
            </div>
          </div>
          <div id="content" className="wrap">{content}</div>
        </div>

        <Footer />
      </div>
    );
  }

}
