import React from 'react';

import Page from '../mixins/Page.js';

import Notify from '../components/Notify.jsx';
import Header from '../components/Header.jsx';
import Projects from '../components/Projects.jsx';
import Hero from '../components/Hero.jsx';

export default React.createClass({

  displayName: 'ProjectsPage.jsx',

  mixins: [ Page ],

  render() {
    let content;
    if (!this.state.app.loading) {
      let projects = this.state.projects;
      if (projects.list.length) {
        // Show a list of projects.
        content = <Projects projects={projects} />;
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

        <div id="footer">
          <div className="wrap">
            &copy; 2012-2016 <a href="https:/radekstepan.com" target="_blank">Radek Stepan</a>
          </div>
        </div>
      </div>
    );
  }

});
