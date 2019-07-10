import React from 'react';
import { RouterMixin, navigate } from 'react-mini-router';
import _ from 'lodash';
import './modules/lodash.js';

import ProjectsPage from './components/pages/ProjectsPage.jsx';
import MilestonesPage from './components/pages/MilestonesPage.jsx';
import ChartPage from './components/pages/ChartPage.jsx';
import AddProjectPage from './components/pages/AddProjectPage.jsx';
import NotFoundPage from './components/pages/NotFoundPage.jsx';

import actions from './actions/appActions.js';

import appStore from './stores/appStore.js';

// Will fire even if event is prevented from propagating.
delete RouterMixin.handleClick;

// Values are function names below.
let routes = {
  '/': 'projects',
  '/new/project': 'addProject',
  '/:owner/:name': 'milestones',
  '/:owner/:name/:milestone': 'chart',
  '/:owner/:name/projects': 'githubProjects',
  '/:owner/projects': 'orgProjects',
  '/:owner/project/:project': 'orgProjectChart',
  '/:owner/:name/project/:project': 'projectChart',
  '/demo': 'demo'
};

let blank = false;

// Build a link to a page.
let find = ({ to, params, query }) => {
  let $url;
  let re = /:[^\/]+/g;

  // Skip empty objects.
  [ params, query ] = [ _.isObject(params) ? params : {}, query ].map(o => _.pick(o, _.keys(o)));

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

  if (!$url) throw new Error(`path ${to} ${JSON.stringify(params)} is not recognized`);

  // Append querystring.
  if (_.keys(query).length) {
    $url += "?" + _.map(query, (v, k) => `${k}=${v}`).join("&");
  }

  return $url;
};

export default React.createClass({

  displayName: 'App.jsx',

  mixins: [ RouterMixin ],

  routes: routes,

  statics: {
    // Build a link to a page.
    link: (route) => find(route),
    // Route to a link.
    navigate: (route) => {
      let fn = _.isString(route) ? _.identity : find;
      navigate(fn(route));
    }
  },

  // Show projects.
  projects() {
    document.title = 'Burnchart: GitHub Burndown Chart as a Service';
    process.nextTick(() => actions.emit('projects.load'));
    return <ProjectsPage />;
  },

  // Show project milestones.
  milestones(owner, name) {
    document.title = `${owner}/${name}`;
    process.nextTick(() => actions.emit('projects.load', { owner, name }));
    return <MilestonesPage owner={owner} name={name} />;
  },

  // Show projects (i.e. boards) for a repo.
  projects(owner, name) {
    document.title = `${owner}/${name} projects`;
    process.nextTick(() => actions.emit('projects.load', { owner, name }));
    return <GitHubProjectsPage owner={owner} name={name} />;
  },

  // Show a project milestone chart.
  chart(owner, name, milestone) {
    document.title = `${owner}/${name}/${milestone}`;
    process.nextTick(() => actions.emit('projects.load', { owner, name, milestone }));
    return <ChartPage owner={owner} name={name} milestone={milestone} />;
  },

  // Show a GitHub project (i.e. board) chart.
  projectChart(owner, name, project) {
    document.title = `${owner}/${name}/${project}`;
    process.nextTick(() => actions.emit('projects.load', { owner, name, milestone }));
    return <ProjectChartPage owner={owner} name={name} project={project} />;
  },

  // Add a project.
  addProject() {
    document.title = 'Add a project';
    return <AddProjectPage />;
  },

  // Demo projects.
  demo() {
    actions.emit('projects.demo');
    navigate(find({ 'to': 'projects' }));
    return <div />;
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
      // Clear any notifications.
      process.nextTick(() => actions.emit('system.notify'));
      return this.renderCurrentRoute();
    }
  }

});
