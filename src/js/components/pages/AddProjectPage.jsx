import React from 'react';

import actions from '../../actions/appActions.js';

import Page from '../../lib/PageClass.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import AddProjectForm from '../AddProjectForm.jsx';

export default class AddProjectPage extends Page {

  displayName: 'AddProjectPage.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">
          <div id="content" className="wrap">
            <AddProjectForm
              user={this.state.app.user}
              suggestions={this.state.projects.suggestions}
            />
          </div>
        </div>

        <Footer />
      </div>
    );
  }

}
