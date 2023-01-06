# [burnchart](https://burnchart.netlify.app)

GitHub Burndown Chart as a Service. Answers the question "are my projects on track"?

[![Build Status](https://img.shields.io/travis/radekstepan/burnchart/master.svg?style=flat)](https://travis-ci.org/radekstepan/burnchart)
[![Dependencies](http://img.shields.io/david/radekstepan/burnchart.svg?style=flat)](https://david-dm.org/radekstepan/burnchart)
[![License](http://img.shields.io/badge/license-AGPL--3.0-red.svg?style=flat)](LICENSE)

![image](https://raw.githubusercontent.com/radekstepan/burnchart/master/screenshots.jpg)

## Features

1. Running from the **browser**, apart from GitHub account sign in which uses Firebase backend.
1. **Private repos**; sign in with your GitHub account.
1. **Store** projects in browser's `localStorage`.
1. **Off days**; specify which days of the week to leave out from ideal burndown progression line.
1. **Trend line**; to see if you can make it to the deadline at this pace.
1. Different **point counting** strategies; select from 1 issues = 1 point or read size from issue label.

## Quickstart

```bash
$ npm install burnchart -g
$ burnchart --port 8080
# burnchart/3.0.0 started on port 8080
```

## Configuration

At the moment, there is no UI exposed to change the app settings. You have to either edit the `src/config.js` file or use URL query string parameters to override these on a per-user basis.

### Config Fields

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

You can also create your own app theme. Create a LESS file following the example of the default app theme, "monza", in `src/less/themes/monza.less`, include the file in `src/less/burnchart.less` and finally specify the theme in the config:

```js
"theme": "monza"
```

### URL Query String

The main config file can be overriden by passing URL query string parameters. This allows app customization on a per-user basis. We use the [qs](https://github.com/ljharb/qs) library to parse and [lodash](http://devdocs.io/lodash~3/index#merge) to merge in the new values. The following example will switch off the main theme and set off days to fall on the weekend:

```
?theme=raw&chart[off_days][0]=0&chart[off_days][1]=6
```

## Development

To run your local version of the app, install all the NPM dependencies, watch the source files in one window, and start the static file server in the other in `--dev` mode.

```bash
$ nvm use
$ npm install
$ make watch
$ make start-dev
# burnchart/3.0.0 (dev) started on port 8080
```

### GitHub Pages

#### 1. GitHub

To serve the app from GitHub Pages set the "Source branch" in the `/settings` page of your repository.

#### 2. Firebase

Then, signup for Firebase and go to your [console](http://console.firebase.google.com) and create a new project there.

You can leave the Database/Storage section as is, you only want to configure your "Authentication". There, enable "GitHub" and add your domain in "Authorised domains". Mine is set to `radekstepan.com` and `type: Custom`. If you want to run the app locally, you may want to add `localhost` and/or `0.0.0.0` as well.

Since you are using your own Firebase project, you want to copy a couple of keys/ids into the `firebase.*` section of `src/config.js`.

- `firebase.apiKey` is "Web API key" from the "Settings" page (in "Project Overview")
- `firebase.authDomain` is one of the authorised domains in "Authentication", then "Sign-in method"

#### Sync with `master` branch

To serve the app from GitHub Pages that are in sync with master branch, add these two lines to `.git/config`, in the `[remote "origin"]` section:

```
[remote "origin"]
  fetch = +refs/heads/*:refs/remotes/origin/*
  url = git@github.com:user/repo.git
  push = +refs/heads/master:refs/heads/gh-pages
  push = +refs/heads/master:refs/heads/master
```
