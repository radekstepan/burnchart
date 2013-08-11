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
* To whom open issues still belong.

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

##Design

###Initialization

1. Get [milestones](http://developer.github.com/v3/issues/milestones/#list-milestones-for-a-repository) and determine which one is ending the soonest.
1. For this milestone get both [open & closed](http://developer.github.com/v3/issues/#list-issues-for-a-repository) issues (can span [multiple pages](http://developer.github.com/v3/#pagination)).
1. Filter out issues not matching our pattern. For those that do keep tally and insert them to a map of days. Keep track of issue ids of open and closed issues.
1. Determine what the average velocity per day needs to be.
1. Go from the front (milestone creation date) to the back (milestone due date) day by day.
    1. For each day that has an entry in the map, add them to the end array (for actual).
    1. For expected just keep reducing the total by velocity every day.
1. Profit.

###Poll

An issue can be re-opened so we need to keep track of changes to individual tickets. Assume that polls happen quite frequently in the day and not say once a week or something.

1. Get both open & closed tickets sorted by their `created` and `updated` in a descending order. Do not need to get all pages back to UNIX time...
1. If we have a mismatch between our previous arrays of open/closed issue ids then determine if we need to move an issue (change of state) from one group to another.