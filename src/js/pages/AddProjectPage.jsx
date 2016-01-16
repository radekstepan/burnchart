import React from 'react';

import actions from '../actions/appActions.js';

import Page from '../mixins/Page.js';

import Notify from '../components/Notify.jsx';
import Header from '../components/Header.jsx';
import AddProjectForm from '../components/AddProjectForm.jsx';

export default React.createClass({

  displayName: 'AddProjectPage.jsx',

  mixins: [ Page ],

  render() {
    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page">
          <div id="content" className="wrap">
            <AddProjectForm user={this.state.app.user} />
          </div>
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
