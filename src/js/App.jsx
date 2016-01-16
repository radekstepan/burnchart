import React from 'react';
import { RouterMixin, navigate } from 'react-mini-router';
import _ from 'lodash';
import lodash from './mixins/lodash.js';

import ProjectsPage from './pages/ProjectsPage.jsx';
import MilestonesPage from './pages/MilestonesPage.jsx';
import ChartPage from './pages/ChartPage.jsx';
import AddProjectPage from './pages/AddProjectPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import actions from './actions/appActions.js';

// Will fire even if event is prevented from propagating.
delete RouterMixin.handleClick;

// Values are function names below.
let routes = {
  '/': 'projects',
  '/new/project': 'addProject',
  '/:owner/:name': 'milestones',
  '/:owner/:name/:milestone': 'chart',
  '/demo': 'demo'
};

let blank = false;

export default React.createClass({

  displayName: 'App.jsx',

  mixins: [ RouterMixin ],

  routes: routes,

  statics: {
    // Build a link to a page.
    link(to, params, query) {
      let $url;
      let re = /:[^\/]+/g;

      // Skip empty objects.
      [ params, query ] = [_.isObject(params) ? params : {}, query ].map(o => _.pick(o, _.identity));

      // Find among the routes.
      _.find(routes, (name, url) => {
        if (name != to) return;
        let matches = url.match(re);
        
        // Do not match on the number of params.
        if (_.keys(params).length != (matches || []).length) return;
        
        // Do not match on the name of params.
        if (!_.every(matches, m => m.slice(1) in params)) return;
        
        // Fill in the params.
        $url = url.replace(re, m => params[m.slice(1)]);

        // Found it.
        return true;
      });

      if (!$url) console.log(`path ${to} ${JSON.stringify(params)} is not recognized`);

      // Append querystring.
      if (_.keys(query).length) {
        $url += "?" + _.map(query, (v, k) => `${k}=${v}`).join("&");
      }

      return $url;
    },

    // Route to a link.
    // TODO: make this a named route.
    navigate: navigate
  },

  // Show projects.
  projects() {
    document.title = 'Burnchart: GitHub Burndown Chart as a Service';
    process.nextTick(() => { actions.emit('projects.load'); });
    return <ProjectsPage />;
  },

  // Show project milestones.
  milestones(owner, name) {
    return <MilestonesPage owner={owner} name={name} />;
  },

  // Show a project milestone chart.
  chart(owner, name, milestone) {
    return <ChartPage owner={owner} name={name} milestone={milestone} />;
  },

  // Add a project.
  addProject() {
    document.title = 'Add a project';
    return <AddProjectPage />;
  },

  // TODO: Add demo projects.
  demo() {
    // mediator.fire '!projects/demo'
    // window.location.hash = '#'
  },

  // 404.
  notFound(path) {
    return <NotFoundPage path={path} />;
  },

  // Use blank <div /> to always re-mount a Page.
  render() {
    if (blank) {
      process.nextTick(() => this.setState({ tick: true }));
      blank = false;
      return <div />;
    } else {
      blank = true;
      actions.emit('system.loading', false);
      return this.renderCurrentRoute();
    }
  }

});
