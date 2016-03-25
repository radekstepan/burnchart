import React from 'react';

import Page from '../../lib/PageMixin.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Milestones from '../Milestones.jsx';
import Chart from '../Chart.jsx';

export default React.createClass({

  displayName: 'MilestonesPage.jsx',

  mixins: [ Page ],

  render() {
    let content;
    if (!this.state.app.loading) {
      let projects = this.state.projects;
      content = (
        <div>
          <Milestones projects={projects} project={this.props} />
        </div>
      );
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

});
