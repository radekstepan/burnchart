import React from 'react';
import _ from 'lodash';

import Page from '../../lib/PageClass.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Milestones from '../Milestones.jsx';
import EditProjects from '../EditProjects.jsx';
import Hero from '../Hero.jsx';

export default class ProjectsPage extends Page {

  displayName: 'ProjectsPage.jsx'

  constructor(props) {
    super(props);
    // Start the page in a view mode.
    // NOTE probably move into its own component so we don't merge state.
    _.merge(this.state, { 'edit': false });
    // Bindings.
    this._onToggleMode = this._onToggleMode.bind(this);
  }

  // Toggle between edit and view mode.
  _onToggleMode() {
    this.setState({ 'edit': !this.state.edit });
  }

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

}
