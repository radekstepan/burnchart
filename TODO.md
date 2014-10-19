#Tasks to do

##Release: Assembly

- [ ] use Browserify as an app build pipeline
- [ ] sort milestones on index and project page based on priority (most delayed first); Trend - actual = different in days and those overdue come first

1. in a projects collection observe the list prop and resort index; already sorted flag passed in as yes)
1. The index is not already sorted when sort order changes
1. index is a list ofls and its milestones in two loops to extract and sort using function
1. tables loop index getting the obj from projects collection and render
1. sort order link toggles available sort by keys and changes the current key
1. use while loop and pop when resetting the index
1. third number in tuples be the priority number so we can insert into already sorted
1. leave the code open so we can remove a project or milestone later on

###Git

- [ ] create notes about how original people can upgrade to burnchart
- [ ] add licensing, clean up docs, track them on git or using Assembly system?
- [ ] rename repo to burnchart
- [ ] check with austin@assembly.com if my repo looks good to be forked to Assembly
- [ ] fork it to Assembly

###Error Handling

- [ ] save in memory only if no `localStorage`, warn about that
- [ ] can we get more than 1 notification at a time? stack them and show just one text
- [ ] Check location.hash is supported
- [ ] move tests from `radekstepan/github-burndown-chart`

###Customers

- [ ] landing page for the project and put message on `github-burndown-chart` repo
- [ ] provide a documentation site (because we ref it from hero)
- [ ] track users/make it easy for people to leave feedback

###Style

- [ ] make it easy to go back to project page from a chart page, show it in the header

###Misc

- [ ] the deploy script needs to disable autoreload; `make watch` should start a static web server and also launch a build script with a flag saying which files to include in the head (uncompressed, with live reload); standard build script should minify scripts
- [ ] vendor module so we can proxy require all `window` libs
- [ ] show a countdown clock towards the end of the milestone or show overdue
- [ ] trigger success topbar when we have completed a milestone on chart page; show plain when we are behind
- [ ] on chart page show a little progress bar in the title
- [ ] add a chart straight from the hero banner
- [ ]

##Backlog

###Routing

- [ ] Handle [404](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-404) on routes; from catch all check if '/' or go 404 controller
- [ ] allow `pushState` when [Firebase hosted](https://www.firebase.com/docs/hosting/guide/url-redirects-rewrites.html#section-rewrites)

###Style

- [ ] focus on form fields style (blue outline etc)
- [ ] switch off `user-select` on buttons
- [ ] make async pages transition so that there is no "jumping" on the page
- [ ] index page alert tooltip (like on chart page)
- [ ] app icon like http://thenounproject.com/term/fire/50966/
- [ ] tell people if they have no due date
- [ ] calculate left margin based on the total number of points text width

###Customers

- [ ] conctact the people that have starred the original burndown chart telling them about the repo; keep track of connects via a tiny crm/spreadsheet and use a custom email address like radek@burnchart.io

###Bugs

- [ ] `rails/rails/24` has issues in two clusters as if merged from two milestones
- [ ] trendline cutting into axes
- [ ] Browserify does not generate source maps

###Error Handling

- [ ] deal with Firebase timing out, are we still logged-in?
- [ ] check that we have not run out of requests to make
- [ ] what if milestone does not match our strategy?

###Notifications

- [ ] create a 500/400/loading system messages
- [ ] mediator `!app/notify/edit` will edit the current notification
- [ ] handle multiple notifications, for example success on closed milestone and then show a different chart or add a project

###Misc

- [ ] use tap plugin for `Ractive`
- [ ] the app bundle (albeit uncompressed) clocks in at 1.5MB, reduce the size (`d3` is huge (use [grunt-smash](https://github.com/cvisco/grunt-smash), [docs here](https://github.com/mbostock/smash/wiki)), `localForage` not nedded)
- [ ] make the names consistent, reuse code, template etc.
- [ ] implement search box that quickly takes you to a chart (and may hide "pro actions")
- [ ] make an extensible architecture; for example I might want to enable another trendline in the chart which shows estimated end date if one keeps up the pace of last 5 days.
- [ ] desktop app via `node-gyp`
- [ ] when watching, only build changed files and then concat them to make builds much faster
- [ ] smooth animation when transitioning between icons and notifications
- [ ] show animated lines when drawing the chart
- [ ] highlight changes from past fetch
- [ ] In add a project form autocomplete on my username, orgs I am member of and repos I have access to
- [ ] Make sure the padding fits throughout the interface; we have user-select on elements.
- [ ] Have an app wide of triggering a URL and have named routes too
- [ ] rotate between percentage progress and points left
- [ ] be able to config options through UI that currently have to be hardcoded in config
- [ ] choose your own theme
- [ ] show burndown chart for all milestones
- [ ] handle Enterprise editions of GH (signed up in gh dev program)
- [ ] auto-update the chart (with delay when no activity) when logged-in
- [ ] add weekly velocity across all projects and a bar chart to that effect
- [ ] show a little lightning and a number for today's velocity
- [ ] show burnchart only for your tasks; this would be a second category of projects & tasks in the dashboard
- [ ] show an overall text-based status like: all projects on time etc.
- [ ] until GH fix milestone start date then provide an option to specify it (either do that on GH server or locally); for example a text like this: `starts: 09-10-2014` in the description which we provide regex for
- [ ] work on mobile devices
- [ ] show velocity number for each member of the team in the corner of the layout (the point is to get better at planning how many tasks can people take on, thus how fast can we work)
- [ ] if we have the above, we could get a suggestion as to how many points we are able to go through in the next iteration while keeping everyone at their max capacity. One could almost drag & drop tasks to people and see a live progress of how the ideal trendline will fare based on a known speed of people; or we could be somehow notified that people are maxed out
- [ ] show velocity for all team members and how it progresses through time
- [ ] points collector - give medals for 1st 3 spots in terms of velocity
- [ ] show past commits or due dates like in [this calendar](https://dribbble.com/shots/1736128-Meetups-Page?list=shots&sort=popular&timeframe=now&offset=5)
- [ ] support Jira & Gitlab
- [ ] when fetching subsequent updates, fetch only the last page of issues since some repos are large (2.5MB & 19 pages for `mbostock/d3`); actually that is for all issues, not milestone constrained. So only an issue if we want to see a burnchart for all the issues for a repo
- [ ] if all issue circles are close to each other, make a "master circle" that amalgamates all the issues into one large circle, makes for a prettier view
- [ ] make better x-axis date display, otherwise we see all 1s.
- [ ] some [fun loading messages](http://www.gamefaqs.com/pc/561176-simcity-4/faqs/22135) from Sim City.
- [ ] show number of tasks, points, days left just like in Assembly on chart page
- [ ] receive reminders when a due date is nearing and our project is behind schedule; receive a daily digest saying how the progress went in that day/week; these are all ways we can help people answer the question: is my project on track?
- [ ] if we save user's tokens we could check data on their behalf, then messaging would work; API could be provided so that others could plug into the data
- [ ] derive insights; one part is to see if we are on track, the other is to get better at estimating. If we know when an issue is worked on and when closed, with its accompanying size, we can say which issues went well, and which fared poorly. Then we can visualize a weekly/monthly/per-milestone list of loosers and winners. Perhaps the user can glean a pattern from that.
- [ ] create fake Firebase endpoint for GitHub auth, or change the endpoint in settings (easier)
- [ ] have an icon that shows a progress for a milestone that can be shown on GitHub README page
