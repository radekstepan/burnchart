import React from 'react';
import _ from 'lodash';

import Page from '../../lib/PageMixin.js';

import format from '../../modules/format.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Chart from '../Chart.jsx';

export default React.createClass({

  displayName: 'ChartPage.jsx',

  mixins: [ Page ],

  render() {
    let content;
    if (!this.state.app.loading) {
      let projects = this.state.projects;
      // Find the milestone.
      let milestone;
      _.find(projects.list, (obj) => {
        if (obj.owner == this.props.owner && obj.name == this.props.name) {
          return _.find(obj.milestones, (m) => {
            if (m.number == this.props.milestone) {
              milestone = m;
              return true;
            }
            return false;
          });
        }
        return false;
      });

      if (milestone) {
        let description;
        if (milestone.description) {
          description = format.markdown(milestone.description);
        }

        content = (
          <div>
            <div id="title">
              <div className="wrap">
                <h2 className="title">{format.title(milestone.title)}</h2>
                <span className="sub">{format.due(milestone.due_on)}</span>
                <div className="description">{description}</div>
              </div>
            </div>
            <div id="content" className="wrap">
              <Chart data={milestone} />
            </div>
          </div>
        );
      }
    }

    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">{content}</div>

        <Footer />
      </div>
    );
  }

});
