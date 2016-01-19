import React from 'react';
import _ from 'lodash';

import Page from '../mixins/Page.js';

import Notify from '../components/Notify.jsx';
import Header from '../components/Header.jsx';
import Chart from '../components/Chart.jsx';

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
        content = <Chart milestone={milestone} />;
      }
    }

    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">{content}</div>

        <div id="footer">
          <div className="wrap">
            &copy; 2012-2016 <a href="https:/radekstepan.com" target="_blank">Radek Stepan</a>
          </div>
        </div>
      </div>
    );
  }

});
