#GitHub Burndown Chart
##Rework in Progress

##Project Charter

The app is to display a burndown chart from a set of GitHub issues in a milestone.

If we can, do all processing and storage on the client which makes the app run for "free" on `gh-pages` etc.

Show:

* Upcoming issues by size.
* Issues closed today.
* For each issue show other tags and assignee (avatar).
* Number of working days left.

Allow:

* Toggle non working days.
* Have a print view.
* Customization of the theme (own logo/colors etc.).

Configure:

* Repos for users/orgs.
* Private api keys.
* Non working days.
* Label pattern to determine size (?).
* How often to poll for updates (limited by GH API).

Be:

* Responsive.
* As lightweight as possible (do we need Backbone/jQuery?).
* Well documented and modularized.

Usage envisaged in these three scenarios:

1. Use the `gh-pages` branch of this repo to connect and visualize a public repo.
1. Deploy the app on a static server elsewhere with custom `config`.
1. Proxy requests through a service to not disclose private api keys publicly.