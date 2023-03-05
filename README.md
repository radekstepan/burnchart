# [burnchart](https://burnchart.netlify.app)

GitHub Burndown Chart as a Service. Answers the question "are my projects on track"?

[![Netlify Status](https://api.netlify.com/api/v1/badges/f2a6aa0c-b92b-4e8a-a339-3bdac4fb19ee/deploy-status)](https://app.netlify.com/sites/burnchart/deploys)

![image](https://raw.githubusercontent.com/radekstepan/burnchart/master/screenshot.png)

## Features

1. Running from the **browser**, apart from GitHub account sign in which uses Firebase backend.
1. **Private repos**; sign in with your GitHub account.
1. **Off days**; specify which days of the week to leave out from ideal burndown progression line.
1. **Trend line**; to see if you can make it to the deadline at this pace.
1. Different **point counting** strategies; select from 1 issues = 1 point or read size from issue label.

## Quickstart

```sh
$ yarn install
$ ./cli.js --port 1234
# burnchart/4.0.0 started on port 1234
```

## FAQ

### Browser 404 Errors

If you are running a dev mode on localhost (`yarn start`) and start the app by navigating to a URL that contains a `.` character - `Vite` serves a 404. To fix this either navigate to the page through homepage or start the app through the cli - `yarn start:preview`.

### GitHub Bugs

Some milestones show "incorrect" issues associated. Consider the two following views of a milestones:

- https://github.com/nhn/tui.calendar/milestone/6 - 21 closed issues
- https://github.com/nhn/tui.calendar/issues?q=is%3Aissue+milestone%3Av1.12.13+is%3Aclosed - 11 closed issues (what we show)

## Configuration

At the moment, there is no UI exposed to change the app settings. You have to either edit the `src/config.js` file or use URL query string parameters to override these on a per-user basis.

An array of days when we are not working where Monday = 1. The ideal progression line won't _drop_ on these days.

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

### Firebase

Signup for Firebase and go to your [console](http://console.firebase.google.com) and create a new project there.

You can leave the Database/Storage section as is, you only want to configure your "Authentication". There, enable "GitHub" and add your domain in "Authorised domains". Mine is set to `radekstepan.com` and `type: Custom`. If you want to run the app locally, you may want to add `localhost` and/or `0.0.0.0` as well.

Since you are using your own Firebase project, you want to copy a couple of keys/ids into the `firebase.*` section of `src/config.js`.

- `firebase.apiKey` is "Web API key" from the "Settings" page (in "Project Overview")
- `firebase.authDomain` is one of the authorised domains in "Authentication", then "Sign-in method"
