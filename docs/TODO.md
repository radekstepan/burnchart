##Backlog

Use [Tally](http://tally.tl/) to determine what to work on next.

###Important

- [ ] 3 `rails/rails/24` has issues in two clusters as if merged from two milestones, does it mean that sort by date is not working?
- [ ] 3 check that we are using moment and toJSON all the way until chart view; tests checking res from github in milestones and issues
- [ ] 4 http://burnchart.io#rails I would expect it to list all the projects for that owner so I can select one of them (Ryan); we could show a list of available project names with their: `description`, `private` flag and `has_issues` making the project greyed out if no issues found, cache these projects in local storage
- [ ] 4 if all issue circles in the chart are close to each other, make a "master circle" that amalgamates all the issues into one large circle, makes for a prettier view
- [ ] 4 until GH fix milestone start date then provide an option to specify it; for example a text like this: `starts: 09-10-2014` in the description which we provide regex for in the config
- [ ] 5 be able to config options through ui that currently have to be hardcoded in the config
- [ ] 5 be able to delete added projects; on the project page listing all milestone, enable the cog at the bottom of the table, clicking it slides a link with a dustbin next to it which deletes the project

###Normal

- [ ] 1 highlight today in the chart better, perhaps just a red line and a text next to it saying what date it is
- [ ] 1 one click to go from a project or milestone view to github; have an icon in the header
- [ ] 1 use tap plugin for `Ractive` so we work on mobile
- [ ] 2 show project name on the milestone page, in the title so that we immediately know where we are
- [ ] 2 focus on form fields style (blue outline etc) and switch off `user-select` on buttons
- [ ] 2 be able to logout, add an icon next to the name with arrow leading out of the square
- [ ] 3 In add a project form autocomplete on my username, orgs I am member of and repos I have access to, use code from [elastic-med](https://github.com/intermine/intermine-apps-c/blob/master/elastic-med/src/components/search.coffee#L24-L46) to show the first option with Tab doing the autocomplete
- [ ] 3 be able to specify milestone by name (will nicely show in title), so when we type in `owner/name/name` it should resolve the number
- [ ] 3 trendline is sometimes cutting into axes, see `rails/rails/36`
- [ ] 3 deal with Firebase timing out, are we still logged-in? Show a warning page telling the people to refresh the browser (adding a button to do the same)
- [ ] 3 use issue title to determine size
- [ ] 3 give people the ability to use private or public repo access. Use a dropdown button where we can choose either or.
- [ ] 3 the app bundle (albeit uncompressed) clocks in at 1.5MB, reduce the size (`d3` is huge (use [grunt-smash](https://github.com/cvisco/grunt-smash), [docs here](https://github.com/mbostock/smash/wiki)))
- [ ] 4 show number of tasks, points, days left, progress bar in the header of a chart page, just like in Assembly
- [ ] 4 make better x-axis date display, otherwise we see all 1s, basically show better bands, choose per week or per month where appropriate
- [ ] 5 responsive layout hiding header links into a button
- [ ] 5 show burndown chart for all milestones

###Nice to Have

- [ ] 1 tell people if they have no due date
- [ ] 2 try appending '.0' to milestone titles to pass `semver` validation and compare 4.0, 5.x etc.
- [ ] 2 show an overall text-based status like: all projects on time etc.
- [ ] 2 web storage and location hash supported by 93% of browsers; good enough? check for support and throw an error
- [ ] 2 check that we have not run out of requests to make, write a test for this, it should throw an error when we are making a request
- [ ] 2 index page alert tooltip (like on chart page)
- [ ] 3 when fetching subsequent updates, fetch only the last page of issues since some repos are large (2.5MB & 19 pages for `mbostock/d3`); actually that is for all issues, not milestone constrained. So only an issue if we want to see a burnchart for all the issues for a repo
- [ ] 3 choose your own theme in config
- [ ] 3 rotate between percentage progress and points left, fade them in/out
- [ ] 3 make async pages transition so that there is no "jumping" on the page
- [ ] 3 calculate left margin based on the total number of points text width
- [ ] 3 GitHub Pages 404 file
- [ ] 3 show burnchart only for your tasks; this would be a second category of projects & tasks in the dashboard
- [ ] 3 smooth animation when transitioning between icons and notifications, sort of there, but not really
- [ ] 4 implement search box that quickly takes you to a chart (and may hide "pro actions")
- [ ] 4 handle Enterprise editions of GH (signed up in gh dev program)
- [ ] 4 auto-update the chart (with delay when no activity) when logged-in
- [ ] 4 show animated lines when drawing the chart
- [ ] 5 how GitHub show commit activity in weekly slots, can we have something like this in the chart? Basically show commits in that week and their users
- [ ] 5 create fake Firebase endpoint for GitHub auth, or change the endpoint in settings (easier) if people don't trust Google Firebase
- [ ] 5 show past commits or due dates like in [this calendar](https://dribbble.com/shots/1736128-Meetups-Page?list=shots&sort=popular&timeframe=now&offset=5)
- [ ] 7 support Jira, Gitlab, Assembly
- [ ] 5 determine which [case](http://www.scrumdesk.com/is-it-your-burn-down-chart/) the burnchart falls into
- [ ] 7 [Enhanced Burndown Chart](https://help.rallydev.com/enhanced-burndown-chart), if we cache the issues through a milestone, we can show changes to the scope of work
- [ ] 7 Use [RemoteStorage](http://remotestorage.io/integrate) to cache data instead of using Firebase