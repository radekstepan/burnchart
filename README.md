# burnchart.io

## Concept

GitHub Burndown Chart as a service. Public repos are free, for private access auth via GitHub and pay.

## Tasks

### MVP - Community Plan

- [x] show a list of projects and their milestones with progress & due date
- [x] show burnchart for that project milestone
- [x] show all issues as [one size](https://github.com/radekstepan/github-burndown-chart/issues/46)
- [x] use `localStorage` to save project names
- [ ] show a milestones page where we see a table ala projects but for only one project

### The 20%

- [ ] provide a documentation site
- [ ] visiting a chart page saves the project if it isn't saved already
- [ ] landing page for the project and put message on my repo
- [ ] Handle [404](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-404) on routes; from catch all check if '/' or go 404 controller
- [ ] allow `pushState` when [Firebase hosted](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-rewrites)
- [ ] progress needs to be calculated based on strategy even on homepage, then sort the milestones based on priority
- [ ] calculate left margin based on the total number of points text width
- [ ] Do not show login/logged-in state when we are still fetching that information from Firebase
- [ ] local storage is getting reset
- [ ] a bit of a freeze when fetching `mbostock/d3`
- [ ] Validate repo input and show a loading sign of sorts
- [ ] Check that we have not run out of requests to make
- [ ] Show loading sign on top of [browser window](https://github.com/buunguyen/topbar) which is unobtrusive enough we can show it immediately.
- [ ] show a countdown clock towards the end of the milestone or show overdue
- [ ] highlight for a moment recently changed milestone
- [ ] smooth animation when transitioning between icons and notifications
- [x] format milestone titles prepending "Milestone" word if appropriate
- [x] Variable document.title on different pages
- [x] be able to go back to homepage
- [x] deal with no due date milestones - always on track
- [x] show title on the chart page
- [x] work for `mbostock/d3`
- [x] allow people to go straight to a URL that fetches the repo, if public, for them; to demo our app without adding a repo (add it behind the scenes); *req* cache repos
- [x] closed issues can be moved to a newly created milestone, this messes up the chart since we assume milestone is created first!

### Extras

- [ ] In add a project form autocomplete on my username, orgs I am member of and repos I have access to
- [ ] Someone might create a public repo, add it to the system and switch it to private; need to check repo priviledges at runtime; or when asking for auth, one would choose either public OR public/private, but this could get confusign.
- [ ] Make sure the padding fits throughout the interface; we have user-select on elements.
- [ ] Check location.hash is supported
- [ ] Have an app wide of triggering a URL and have named routes too
- [ ] On page load get all the latest data regardless of `time_ago`
- [ ] rotate between percentage progress and points left
- [ ] be able to config options through UI that currently have to be hardcoded in config
- [ ] cache repos in `localStorage` for those that do not use GitHub login
- [ ] choose your own theme
- [ ] custom milestone start dates
- [ ] show burndown chart for all milestones
- [ ] handle Enterprise editions of GH (signed up in gh dev program)
- [ ] auto-update the chart (with delay when no activity) when logged-in
- [ ] add weekly velocity across all projects and a bar chart to that effect
- [ ] show a little lightning and a number for today's velocity
- [ ] show burnchart only for your tasks; this would be a second category of projects & tasks in the dashboard
- [ ] show an overall text-based status like: all projects on time etc.
- [ ] until GH fix milestone start date then provide an option to specify it (either do that on GH server or locally); for example a text like this: `starts: 09-10-2014` in the description which we provide regex for
- [ ] work on mobile devices
- [ ] show velocity number for each member of the team in the corner of the layout
- [ ] show velocity for all team members and how it progresses through time
- [ ] points collector - give medals for 1st 3 spots in terms of velocity
- [ ] show past commits or due dates like in [this calendar](https://dribbble.com/shots/1736128-Meetups-Page?list=shots&sort=popular&timeframe=now&offset=5)
- [ ] allow people to submit suggestions via GitHub Issues
- [ ] find a way where, as a group, we can share repo data by trusting the other repo members that use our platform
- [ ] support Jira & Gitlab
- [ ] when fetching subsequent updates, fetch only the last page of issues since some repos are large (2.5MB & 19 pages for `mbostock/d3`); actually that is for all issues, not milestone constrained. So only an issue if we want to see a burnchart for all the issues for a repo
- [ ] move tests from `radekstepan/github-burndown-chart`
- [ ] if all issue circles are close to each other, make a "master circle" that amalgamates all the issues into one large circle, makes for a prettier view
- [ ] tell people if they have no due date
- [ ] make better x-axis date display, otherwise we see all 1s.

## Notes

- *payment gateways* in Canada: [Shopify](http://www.shopify.com/payment-gateways/canada), [Chargify](http://chargify.com/payment-gateways/) list; I get free processing on first $1000 with [Stripe](https://education.github.com/pack/offers)
- start people on a *Community* plan showing them a comparison table to upgrade to a better offering
- community (open source, local storage), business (private repos, firebase)
- keep discussion going via [gitter](http://gitter.im)
- [credit card form](http://designmodo.com/ux-credit-card-payment-form/) ux from Designmodo
- workers: using a free instance of IronWorker and assuming 5s runtime each time gives us a poll every 6 minutes. Zapier would poll every 15 minutes but already integrates Stripe and FB.
- worst case scenario I provide even Small Business plan for free and provide a better experience
- $2.5 Node.js PaaS via Gandi with promo code `PAASLAUNCH-C50E-B077-A317`.
- let people vote on features they want to see fast: [tally.tl](http://tally.tl/).
- use [readme.io](https://readme.io/) for documentation

## Plans

### Community

- your repos are saved locally
- no auto-updates to milestones, everything fetched on page load
- no private repos

### Business

- repos, milestones saved remotely
- auto-update with new information
- private repos
