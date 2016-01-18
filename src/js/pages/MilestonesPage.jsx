import React from 'react';

import Page from '../mixins/Page.js';

import Notify from '../components/Notify.jsx';
import Header from '../components/Header.jsx';
import Milestones from '../components/Milestones.jsx';
import Hero from '../components/Hero.jsx';

export default React.createClass({

  displayName: 'MilestonesPage.jsx',

  mixins: [ Page ],

  render() {
    let content;
    if (!this.state.app.loading) {
      let projects = this.state.projects;
      content = <Milestones projects={projects} project={this.props} />;
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

        <div id="footer">
          <div className="wrap">
            &copy; 2012-2016 <a href="https:/radekstepan.com" target="_blank">Radek Stepan</a>
          </div>
        </div>
      </div>
    );
  }

});
