import React from 'react';

import Page from '../../lib/PageMixin.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import Milestones from '../Milestones.jsx';
import Hero from '../Hero.jsx';

export default React.createClass({

  displayName: 'ProjectsPage.jsx',

  mixins: [ Page ],

  render() {
    let content;
    if (!this.state.app.loading) {
      let projects = this.state.projects;
      if (projects.list.length) {
        content = <Milestones projects={projects} />;
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
