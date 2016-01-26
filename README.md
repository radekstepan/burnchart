#[burnchart](http://radekstepan.com/burnchart)

GitHub Burndown Chart as a Service. Answers the question "are my projects on track"?

![Build Status](http://img.shields.io/codeship/5645c5d0-4b7e-0132-641d-623ee7e48d08/master.svg?style=flat)
[![Dependencies](http://img.shields.io/david/radekstepan/burnchart.svg?style=flat)](https://david-dm.org/radekstepan/burnchart)
[![License](http://img.shields.io/badge/license-AGPL--3.0-red.svg?style=flat)](LICENSE)

![image](https://raw.githubusercontent.com/radekstepan/burnchart/master/screenshots.jpg)

##Features

1. Running from the **browser**, apart from GitHub account sign in which uses Firebase backend.
1. **Private repos**; sign in with your GitHub account.
1. **Store** projects in browser's `localStorage`.
1. **Off days**; specify which days of the week to leave out from ideal burndown progression line.
1. **Trend line**; to see if you can make it to the deadline at this pace.
1. Different **point counting** strategies; select from 1 issues = 1 point or read size from issue label.

##Quickstart

```bash
$ npm install burnchart -g
$ burnchart --port 8080
# burnchart/3.0.0 started on port 8080
```

##Configuration

At the moment, there is no ui exposed to change the app settings. You have to edit the `src/config.js` file.

An array of days when we are not working where Monday = 1. The ideal progression line won't *drop* on these days.

```js
"off_days": [ ]
```

Choose from `ONE_SIZE` which means each issue is worth 1 point or `LABELS` where issue labels determine its size.

```js
"points": "ONE_SIZE"
```

If you specify `LABELS` above, this is the place to set a regex used to parse a label and extract points size from it. When multiple matching size labels exist, their sum is taken.

```js
"size_label": /^size (\d+)$/
```

##Development

To run your local version of the app, install all the NPM dependencies, watch the source files in one window, and start the static file server in the other in `--dev` mode.

```bash
$ nvm use
$ npm install
$ make watch
$ make start-dev
# burnchart/3.0.0 (dev) started on port 8080
```

###GitHub Pages

To serve the app from GitHub Pages that are in sync with master branch, add these two lines to `.git/config`, in the `[remote "origin"]` section:

```
[remote "origin"]
  fetch = +refs/heads/*:refs/remotes/origin/*
  url = git@github.com:user/repo.git
  push = +refs/heads/master:refs/heads/gh-pages
  push = +refs/heads/master:refs/heads/master
```
