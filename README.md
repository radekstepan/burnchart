#[burnchart](http://radekstepan.com/burnchart)

##Quickstart

```bash
$ npm install burnchart -g
$ burnchart --port 8080
# burnchart/3.0.0 started on port 8080
```

##Development

To run your local version of the app, install all the NPM dependencies, watch the source files in one window, and start the static file server in the other in `--dev` mode.

```bash
$ nvm use
$ npm install
$ make watch
$ make start --dev
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