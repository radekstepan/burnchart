import React from 'react';

import Page from '../../lib/PageMixin.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Milestones from '../Milestones.jsx';
import EditProjects from '../EditProjects.jsx';
import Hero from '../Hero.jsx';

export default React.createClass({

  displayName: 'ProjectsPage.jsx',

  mixins: [ Page ],

  // Toggle between edit and view mode.
  _onToggleMode() {
    this.setState({ 'edit': !this.state.edit });
  },

  getInitialState() {
    return {
      // Start the page in a view mode.
      'edit': false
    };
  },

  render() {
    let content;
    if (!this.state.app.system.loading) {
      let projects = this.state.projects;
      if (projects.list.length) {
        if (!this.state.edit) {
          content = (
            <Milestones
              projects={projects}
              onToggleMode={this._onToggleMode}
            />
          );
        } else {
          content = (
            <EditProjects
              projects={projects}
              onToggleMode={this._onToggleMode}
            />
          );
        }
      } else {
        content = <Hero />;
      }
    }

    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">
          <div id="content" className="wrap">{content}</div>
        </div>

        <Footer />
      </div>
    );
  }

});
