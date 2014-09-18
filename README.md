# burnchart.io

## Concept

GitHub Burndown Chart as a service. Public repos are free, for private access auth via GitHub and pay.

## Tasks

### MVP - Community Plan

- [x] show a list of projects and their milestones with progress & due date
- [ ] show burnchart for that project milestone
- [ ] show all issues as [one size](https://github.com/radekstepan/github-burndown-chart/issues/46)
- [x] use `localStorage` to save project names

### Extras

- [ ] Do not show login/logged-in state when we are still fetching that information from Firebase
- [ ] Handle 404 on routes; from catch all check if '/' or go 404 controller
- [ ] Variable document.title on different pages
- [ ] In add a project form autocomplete on my username, orgs I am member of and repos I have access to
- [ ] Someone might create a public repo, add it to the system and switch it to private; need to check repo priviledges at runtime; or when asking for auth, one would choose either public OR public/private, but this could get confusign.
- [ ] Make sure the padding fits throughout the interface; we have user-select on elements.
- [ ] Validate repo input and show a loading sign of sorts
- [ ] When fetching repo say if no perms to access or does not exist
- [ ] Check location.hash is supported
- [ ] Have an app wide of triggering a URL and have named routes too
- [ ] Check that we have not run out of requests to make
- [ ] Deal with running out of GH API requests
- [ ] Since persistence is async, deal with the flicker (show laoding?) when we are still getting data
- [ ] On page load get all the latest data regardless of `time_ago`
- [ ] Show loading sign on top of [browser window](https://github.com/buunguyen/topbar) which is unobtrusive enough we can show it immediately.
- [ ] rotate between percentage progress and points left
- [ ] be able to config options through UI that currently have to be hardcoded in config
- [ ] cache repos in `localStorage` for those that do not use GitHub login
- [ ] allow people to go straight to a URL that fetches the repo, if public, for them; to demo our app without adding a repo (add it behind the scenes); *req* cache repos
- [ ] choose your own strategy for naming issues, e.g. all issues are one size
- [ ] choose your own theme
- [ ] custom milestone start dates
- [ ] show burndown chart for all milestones
- [ ] handle Enterprise editions of GH (signed up in gh dev program)
- [ ] auto-update the chart (with delay when no activity) when logged-in
- [ ] show a countdown clock towards the end of the milestone or show overdue
- [ ] add weekly velocity across all projects and a bar chart to that effect
- [ ] show a little lightning and a number for today's velocity
- [ ] show burnchart only for your tasks; this would be a second category of projects & tasks in the dashboard
- [ ] show an overall text-based status like: all projects on time etc.
- [ ] until GH fix milestone start date then provide an option to specify it (either do that on GH server or locally)
- [ ] work on mobile devices
- [ ] show velocity number for each member of the team in the corner of the layout
- [ ] show velocity for all team members and how it progresses through time
- [ ] points collector - give medals for 1st 3 spots in terms of velocity
- [ ] show past commits or due dates like in [this calendar](https://dribbble.com/shots/1736128-Meetups-Page?list=shots&sort=popular&timeframe=now&offset=5)
- [ ] allow people to submit suggestions via GitHub Issues
- [ ] find a way where, as a group, we can share repo data by trusting the other repo members that use our platform

## Notes

- *payment gateways* in Canada: [Shopify](http://www.shopify.com/payment-gateways/canada), [Chargify](http://chargify.com/payment-gateways/) list
- start people on a *Community* plan showing them a comparison table to upgrade to a better offering
- community (open source, local storage), business (private repos, firebase)
- keep discussion going via [gitter](http://gitter.im)
- [credit card form](http://designmodo.com/ux-credit-card-payment-form/) ux from Designmodo
- workers: using a free instance of IronWorker and assuming 5s runtime each time gives us a poll every 6 minutes. Zapier would poll every 15 minutes but already integrates Stripe and FB.
- worst case scenario I provide even Small Business plan for free and provide a better experience


## Plans

### Community

- your repos are saved locally
- no auto-updates to milestones, everything fetched on page load
- no private repos

### Business

- repos, milestones saved remotely
- auto-update with new information
- private repos
