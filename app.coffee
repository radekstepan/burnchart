express = require 'express'
eco     = require 'eco'
https =   require 'https'
fs =      require "fs"
yaml =    require "js-yaml"

# Helper object for GitHub Issues.
Issues =

    # Make HTTPS GET to GitHub API v3.
    get: (path, type, callback) ->
        options =
            host:   "api.github.com"
            method: "GET"
            path:   path

        https.request(options, (response) ->
            if response.statusCode is 200
                json = ""
                response.on "data", (chunk) -> json += chunk
                
                response.on "end", -> callback JSON.parse(json), type
        ).end()

    # URLs to API.
    getOpenIssues:   (callback) -> Issues.get "/repos/#{Issues.config.github_user}/#{Issues.config.github_project}/issues?state=open", 'issues', callback
    getClosedIssues: (callback) -> Issues.get "/repos/#{Issues.config.github_user}/#{Issues.config.github_project}/issues?state=closed", 'issues', callback
    getMilestones:   (callback) -> Issues.get "/repos/#{Issues.config.github_user}/#{Issues.config.github_project}/milestones", 'milestones', callback

    # Convert GitHub ISO 8601 to JS timestamp at the beginning of UTC day!'
    dateToTime: (date) ->
        # Add miliseconds and create `Date`.
        date = new Date(date[0...date.length - 1] + '.000' + date.charAt date.length-1)
        # Move to the beginning of the day (at 9am BST, 8am GMT, so we do not worry about time shifts).
        date = new Date date.getFullYear(), date.getMonth(), date.getDate(), 9
        # Return timestamp.
        date.getTime();

    # Format issues for display in a listing.
    format: (issue) ->
        # Format the timestamps.
        if issue.created_at? then issue.created_at = new Date(Issues.dateToTime(issue.created_at)).toUTCString()
        if issue.updated_at? then issue.updated_at = new Date(Issues.dateToTime(issue.updated_at)).toUTCString()

        issue

# Express.
app = express()

app.configure ->
    app.use express.logger()
    app.use express.bodyParser()

    app.set 'view engine', 'eco'
    app.set 'views', './templates'

    # Register a custom .eco compiler.
    app.engine 'eco', (path, options, callback) ->
        fs.readFile "./#{path}", "utf8", (err, str) ->
            callback eco.render str, options

    app.use express.static('./public')

app.configure 'development', ->
    app.use express.errorHandler
        dumpExceptions: true
        showStack:      true

app.configure 'production', ->
    app.use express.errorHandler()

# Redirect to chart from index.
app.get '/', (req, res) -> res.redirect '/burndown'

# Show burndown chart.
app.get '/burndown', (req, res) ->
    resources = 3 ; store = { 'issues': [], 'milestones': [] }
    done = (data, type) ->
        # One less to do.
        resources--

        switch type
            when 'issues' then store.issues = store.issues.concat data
            when 'milestones' then store.milestones = store.milestones.concat data

        # Are we done?
        if resources is 0
            # Do we actually have an open milestone?
            if store.milestones.length > 0
                # Store the current milestone and its size.
                current = { 'milestone': {}, 'diff': +Infinity, 'size': 0 }

                # Determine the 'current' milestone
                now = new Date().getTime()
                for milestone in store.milestones
                    # JS expects more accuracy.
                    due = Issues.dateToTime milestone['due_on']
                    # Is this the 'current' one?
                    diff = due - now
                    if diff > 0 and diff < current.diff
                        current.milestone = milestone ; current.diff = diff ; current.due = due

                # Create n dict with all dates in the milestone span.
                days = {} ; totalDays = 0 ; totalNonWorkingDays = 0
                day = Issues.dateToTime current.milestone.created_at
                while day < current.due
                    # Is this a weekend?
                    dayOfWeek = new Date(day).getDay()
                    if dayOfWeek is 6 or dayOfWeek is 0
                        totalNonWorkingDays += 1                 
                        # Save the day.
                        days[day] = { 'issues': [], 'actual': 0, 'ideal': 0, 'weekend': true  }
                    else
                        # Save the day.
                        days[day] = { 'issues': [], 'actual': 0, 'ideal': 0, 'weekend': false  }
                    
                    # Shift by a day.
                    day += 1000 * 60 * 60 * 24
                    # Increase the total count.
                    totalDays += 1

                # Now go through the issues and place them to the appropriate days.
                for issue in store.issues
                    # This milestone?
                    if issue.milestone?.number is current.milestone.number
                        # Has a size label?
                        if issue.labels?
                            issue.size = do (issue) ->
                                for label in issue.labels
                                    if label.name.indexOf("size ") is 0
                                        return parseInt label.name[5...]

                            if issue.size?
                                # Increase the total size of the milestone.
                                current.size += issue.size
                                # Is it closed?
                                if issue.closed_at?
                                    # Save it.
                                    days[Issues.dateToTime issue.closed_at]['issues'].push issue

                # Calculate the predicted daily velocity.
                dailyIdeal = current['size'] / (totalDays - totalNonWorkingDays) ; ideal = current['size']

                # Go through the days and save the number of outstanding issues size.
                for day, d of days
                    # Does this day have any closed issues? Reduce the total for this milestone.
                    for issue in d['issues']
                        current['size'] -= issue.size
                    # Save the oustanding count for that day.
                    days[day].actual = current['size']
                    
                    # Save the predicted velocity for that day if it is not a non-working day.
                    ideal -= dailyIdeal unless days[day].weekend
                    days[day].ideal = ideal

                # Finally send to client.
                res.render 'burndown',
                    'days':    days
                    'project': Issues.config.project_name
                , (html) -> res.send html, 'Content-Type': 'text/html', 200

            else
                # No current milestone.
                res.render 'empty',
                    'project': Issues.config.project_name
                , (html) -> res.send html, 'Content-Type': 'text/html', 200            


    # Get Milestones, Opened and Closed Tickets.
    Issues.getMilestones done
    Issues.getOpenIssues done
    Issues.getClosedIssues done

# Show open issues.
app.get '/issues', (req, res) ->
    Issues.getOpenIssues (issues) ->

        # Replace the dates in issues with nice dates.
        issues = ( Issues.format(issue) for issue in issues  )

        res.render 'issues',
            'issues':  issues
            'project': Issues.config.project_name
        , (html) -> res.send html, 'Content-Type': 'text/html', 200

# Fetch config and start server.
fs.readFile "config.yml", "utf8", (err, data) ->
    Issues.config = yaml.load data

    app.listen 3000
    console.log "Express server listening to port 3000"