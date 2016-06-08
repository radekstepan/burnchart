import React from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';

import config from '../config.js';

let el = document.getElementById('app');
// Set the theme.
el.className = `theme--${config.theme}`;

// Start the router.
ReactDOM.render(<App />, el);
