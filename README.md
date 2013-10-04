#GitHub Burndown Chart

**The original app got completely rewritten, see [notes](#rewrite), thank you.**

Displays a burndown chart from a set of GitHub issues in the current milestone.

[ ![Codeship Status for radekstepan/github-burndown-chart](https://www.codeship.io/projects/d69f4420-e5b0-0130-bbae-1632ddfb80f8/status?branch=master)](https://www.codeship.io/projects/5855)

##Features

1. Client side; easily hosted on GitHub Pages.
1. Private repos; use your GitHub API Token hiding it from public view if need be.
1. Off days; specify which days of the week to leave out from ideal burndown progression line.
1. Trend line; to see if you can make it to the deadline at this pace.

![image](https://raw.github.com/radekstepan/github-burndown-chart/master/example.png)

##Quickstart

1. Choose a **repo** that you want to display burndown chart for.
1. Make sure this repo has some **issues** assigned to a **milestone**.
1. Put some **labels** on the issues looking like this: `size 1`, `size 3` etc.
1. **Close** some of them labeled issues.
1. Visit [http://radekstepan.com/github-burndown-chart/](http://radekstepan.com/github-burndown-chart/) following the instructions there.

##Configuration

There are three modes of operation balancing between usability & security:

1. **Static Mode**: you can just serve the `public` directory using a static file server or GitHub Pages. No config needed, just serve the app and point to your repo in the browser, e.g.: `http://127.0.0.1:8000/#!/radekstepan/disposable`. You are rate limited to the tune of [60 requests per hour](http://developer.github.com/v3/#rate-limiting).
1. **Static Mode (Public Token)**: as before but now you want to use your [GitHub OAuth2 API Token](http://developer.github.com/v3/#authentication) in the config. This will require you to specify the token in the `config.json` file as outlined below.
1. **Proxy Mode (Private Token)**: you find it preposterous to share your token with the world. In this case you will need to serve the app using the [Proxy Mode](#proxy-mode). Your token will be scrubbed from the config file and all requests be routed through a proxy.

All of the following fields are defined in `config.json` and none of them, including the file itself, are required:

###Size Label

The way we are getting a size of an issue from GitHub is by putting a label on it. The following regex (string) specifies which part of the label represents the number.

```json
{
    "size_label": "^size (\\d+)$"
}
```

This is also the default label if no other is specified.

###Token

Your OAuth2 token from GitHub. Get it [here](https://github.com/settings/applications). Bear in mind that if you just statically serve the app, everybody will be able to see the token in transmission. If you would like to avoid that, use the [Proxy Mode](#proxy-mode).

Using the token increases your limit of requests per hour from [60 to 5000](http://developer.github.com/v3/#rate-limiting).

```json
{
    "token": "API_TOKEN"
}
```

###Off Days/Weekends

An array of day integers (Monday = 1) representing days of the week when you are not working. This will make the expected burndown line be more accurate.

```json
{
    "off_days": [ 6, 7 ]
}
```

##Proxy Mode

Use this strategy if you do not wish for your token to be publicly visible. Proxy mode routes all requests from the client side app through it, scrubbing the token from the `config.json` file. It is *slightly* slower than requesting data straight from GitHub of course.

Make sure you have [CoffeeScript](http://coffeescript.org/) installed:

```bash
$ npm install coffee-script -g
```

Then start the proxy passing port number as an argument:

```bash
$ PORT=1234 coffee proxy.coffee
```

Visit the port in question in the browser and continue as before.

##Build It

If you would like to run your own build for a custom version of the app, use the [Apps/B Builder](https://github.com/intermine/apps-b-builder).

In short:

```bash
$ npm install apps-b-builder -g
$ apps-b build ./src/ ./build/
```

##Test It

```bash
$ npm install -d
$ make test
```

Each bugfix receives an accompanying test case.

##Rewrite

The original app got rewritten from a clunky server side to a (better) client side app. Some tests are also provided and more will be going into the future.

If you are upgrading from the previous app, then please bear in mind that `config.yaml` is replaced with `config.json`.

If you would like to use the original app, please refer to the `original` branch.

##Thanks

Thank you for using the app and your feedback/comments are very much welcome. Radek
