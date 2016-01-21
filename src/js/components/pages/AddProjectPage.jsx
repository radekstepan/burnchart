import React from 'react';

import actions from '../../actions/appActions.js';

import Page from '../../lib/PageMixin.js';

import Notify from '../Notify.jsx';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import AddProjectForm from '../AddProjectForm.jsx';

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

        <Footer />
      </div>
    );
  }

});
