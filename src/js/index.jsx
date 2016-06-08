import React from 'react';
import ReactDOM from 'react-dom';
import qs from 'qs';
import _ from 'lodash';

import App from './App.jsx';

// Get the config.
import config from '../config.js';

// Parse the query string params overriding the config.
if (location.search) {
  _.merge(config, qs.parse(location.search.substring(1)));
}

//&chart[off_days][0]=0&chart[off_days][1]=6
let el = document.getElementById('app');
// Set the theme.
el.className = `theme--${config.theme}`;

// Start the router.
ReactDOM.render(<App />, el);
