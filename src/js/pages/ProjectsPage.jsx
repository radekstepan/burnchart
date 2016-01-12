import React from 'react';

import Page from '../mixins/Page.js';

import Notify from '../components/Notify.jsx';
import Header from '../components/Header.jsx';

export default React.createClass({

  displayName: 'ProjectsPage.jsx',

  mixins: [ Page ],

  render() {
    return (
      <div>
        <Notify />
        <Header {...this.state} />

        <div id="page" />

        <div id="footer">
          <div className="wrap">
            &copy; 2012-2016 <a href="https:/radekstepan.com" target="_blank">Radek Stepan</a>
          </div>
        </div>
      </div>
    );
  }

});
