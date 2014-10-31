*Existing users: The url mapping has been preserved from the original app, we are just using a different domain. If you'd like to use the previous version(s), grab the tags `v1`, `v2`.*

#burnchart

GitHub Burndown Chart as a service. Answers the question "are my projects on track"?

[![Build Status](http://img.shields.io/codeship/<ID_HERE>.svg?style=flat)](<URL_HERE>)
[![Coverage](http://img.shields.io/coveralls/asm-products/burnchart/master.svg?style=flat)](<https://coveralls.io/r/asm-products/burnchart>)
[![Dependencies](http://img.shields.io/david/asm-products/burnchart.svg?style=flat)](https://david-dm.org/asm-products/burnchart)
[![License](http://img.shields.io/badge/license-AGPL--3.0-red.svg?style=flat)](LICENSE)

![image](https://raw.githubusercontent.com/asm-products/burnchart/master/public/screenshots.jpg)

##Features

1. Running from the browser, apart from GitHub account sign in.
1. Private repos; sign in with your GitHub account.
1. Store projects in browser's `localStorage`.
1. Off days; specify which days of the week to leave out from ideal burndown progression line.
1. Trend line; to see if you can make it to the deadline at this pace.
1. Different point counting strategies; select from 1 issues = 1 point or read size from issue label.

##Configuration

At the moment, there is no ui exposed to change the app settings. You have to edit the `src/models/config.coffee` file.

An array of days when we are not working where Monday = 1. The ideal progression line won't *drop* on these days.

```coffeescript
"off_days": [ ]
```

Choose from `ONE_SIZE` which means each issue is worth 1 point or `LABELS` where issue labels determine its size.

```coffeescript
"points": "ONE_SIZE"
```

If you specify `LABELS` above, here is the place set the regex used to parse the number out of a label. When multiple matching size labels exist, their sum is taken.

```coffeescript
"size_label": /^size (\d+)$/
```

##Build

The app is built using [Node](http://nodejs.org/). To install dev dependencies:

```bash
$ make install
```

###Development

To create an unminified package with source maps for debugging:

```bash
$ make watch
```

You can then start a local http server with:

```bash
$ make serve
```

To test your changes run:

```bash
$ make test
```

And finally for code coverage:

```bash
$ make coverage
```

There is currently a bug that incorrectly shows code coverage (using [blanket.js](http://blanketjs.org/)) for modules that are loaded using [proxyquire](https://github.com/thlorenz/proxyquire).

###Production

To make a minified package for production:

```bash
$ make build
```

You can then publish the contents of the `public` folder to `gh-pages` branch with:

```bash
$ make publish
```