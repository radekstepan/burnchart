import React from 'react';
import { RouterMixin, navigate } from 'react-mini-router';
import _ from 'lodash';

import BlogPage from './pages/BlogPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Will fire even if event is prevented from propagating.
delete RouterMixin.handleClick;

// Values are function names below.
let routes = {
  '/': 'blog',
  '/article/:id': 'article'
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
    navigate: navigate
  },

  blog() {
    return <BlogPage />;
  },

  article(id) {
    return <ArticlePage id={id} />;
  },

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
      return this.renderCurrentRoute();
    }
  }

});
