#Tasks to do

##Release: MVP

- [ ] show chart page

###GitHub

- [ ] sort milestones on index and project page based on priority (most delayed first)

###Notifications

- [ ] create a 500/400/loading system messages
- [ ] mediator `!app/notify/edit` will edit the current notification
- [ ] need to show status (receiving information etc.) per repo with little warning triangle when we get 400/500 on milestones
- [ ] handle multiple notifications, for example success on closed milestone and then show a different chart or add a project

###Error Handling

- [ ] verify that project exists on project page when fetching it remotely (add behind the scenes)
- [ ] deal with Firebase timing out, are we still logged-in?
- [ ] visiting a chart page saves the project if it isn't saved already
- [ ] check that we have not run out of requests to make
- [ ] can we get more than 1 notification at a time?
- [ ] save in memory only if no `localStorage`, warn about that
- [ ] what if milestone does not match our strategy?
- [ ] show a stack of errors from index page as notifications

###Bugs

- [ ] `localStorage` is getting reset
- [ ] a bit of a freeze when fetching `mbostock/d3`

###Docs

- [ ] landing page for the project and put message on `github-burndown-chart` repo
- [ ] provide a documentation site (because we ref it from hero)

###Routing

- [ ] Handle [404](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-404) on routes; from catch all check if '/' or go 404 controller
- [ ] allow `pushState` when [Firebase hosted](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-rewrites)

###Style

- [ ] focus on form fields style
- [ ] switch off `user-select` on buttons
- [ ] make async pages transition so that there is no "jumping" on the page
- [ ] index page alert tooltip
- [ ] app icon like http://thenounproject.com/term/fire/50966/

###Misc

- [ ] calculate by how many % are we late/on time so we can sort the milestones in projects
- [ ] vendor module so we can proxy require all `window` libs
- [ ] implement search box that quickly takes you to a chart (and may hide "pro actions")
- [ ] show hero box or projects with a fade in and only when known
- [ ] calculate left margin based on the total number of points text width
- [ ] show a countdown clock towards the end of the milestone or show overdue
- [ ] trigger success topbar when we have completed a milestone on chart page; show plain when we are behind
- [ ] on chart page show a little progress bar in the title
- [ ] use tap plugin for `Ractive`
- [ ] the app bundle (albeit uncompressed) clocks in at 1.5MB, reduce the size (`d3` is huge (use [grunt-smash](https://github.com/cvisco/grunt-smash), [docs here](https://github.com/mbostock/smash/wiki)), `localForage` not nedded)
- [ ] make tests work again
- [ ] use minified builds in production
- [ ] move project to Assembly
- [ ] make the names consistent, reuse code, template etc.

##Future Releases

- [ ] make an extensible architecture; for example I might want to enable another trendline in the chart which shows estimated end date if one keeps up the pace of last 5 days.
- [ ] desktop app via `node-gyp`
- [ ] when watching, only build changed files and then concat them to make builds much faster
- [ ] smooth animation when transitioning between icons and notifications
- [ ] show animated lines when drawing the chart
- [ ] highlight changes from past fetch
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
- [ ] some [fun loading messages](http://www.gamefaqs.com/pc/561176-simcity-4/faqs/22135) from Sim City.
- [ ] show number of tasks, points, days left just like in Assembly
