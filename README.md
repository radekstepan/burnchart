# burnchart

## Concept

GitHub Burndown Chart as a service. Public repos are free, for private access auth via GitHub and pay.

## Name

charcoal, charriot

- gurndown [.com/.io] github burndown
- bithubchart [.com/.io] burndown github chart
- burnchart [.io]

## Tasks

### MVP

[ ] landing page allows you to immediately jump into action
[ ] past repos are cached remotely or in localStorage
[ ] show chart for the current milestone or choose a custom one
[ ] be able to config options through UI that currently have to be hardcoded in config
[ ] embed user tracking
[ ] sort projects based on their closest due dates
[ ] show only repo name if all projects are under our name
[ ] rotate between percentage progress and points left
[ ] Send notifications to people like Codeship or have our own delivery system perhaps like Github or just show a notification icon and onclick ask people to upgrade 

### The 20%

[ ] Do not show login/logged-in state when we are still fetching that information from Firebase
[ ] Handle 404 on routes; from catch all check if '/' or go 404 controller
[ ] Variable document.title on different pages
[ ] In add a project form autocomplete on my username, orgs I am member of and repos I have access to
[ ] Someone might create a public repo, add it to the system and switch it to private; need to check repo priviledges at runtime; or when asking for auth, one would choose either public OR public/private, but this could get confusign.
[ ] Make sure the padding fits throughout the interface; we have user-select on elements.
[ ] Validate repo input and show a loading sign of sorts
[ ] When fetching repo say if no perms to access or does not exist
[ ] Check location.hash is supported
[ ] Have an app wide of triggering a URL and have named routes too
[ ] Check that we have not run out of requests to make

### Extras

[ ] choose your own strategy for naming issues, e.g. all issues are one size
[ ] choose your own theme
[ ] custom milestone start dates
[ ] show burndown chart for all milestones
[ ] handle Enterprise editions of GH
[ ] auto-update the chart (with delay when no activity) when logged-in
[ ] show a countdown clock towards the end of the milestone or show overdue
[ ] add weekly velocity across all projects and a bar chart to that effect
[ ] show a little lightning and a number for today's velocity
[ ] show burnchart only for your tasks; this would be a second category of projects & tasks in the dashboard
[ ] show an overall text-based status like: all projects on time etc.
[ ] until GH fix milestone start date then provide an option to specify it (either do that on GH server or locally)
[ ] work on mobile devices
[ ] show velocity number for each member of the team in the corner of the layout
[ ] show velocity for all team members and how it progresses through time
[ ] points collector - give medals for 1st 3 spots in terms of velocity

## Notes

- *payment gateways* in Canada: http://www.shopify.com/payment-gateways/canada
- start people on a *Startup* plan showing them a comparison table to upgrade to a better offering
- Startup, small business and enterprise plans