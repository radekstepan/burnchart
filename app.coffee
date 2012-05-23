express = require 'express'
eco     = require 'eco'
https =   require 'https'
fs =      require "fs"

# Make HTTPS GET to GitHub API v3.
apiGet = (path, type, callback) ->
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

# Express.
app = express.createServer()

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
            # Convert GitHub ISO to JS ISO date  and then time
            dateToTime = (date) -> new Date(date[0...date.length - 1] + '.000' + date.charAt date.length-1).getTime()
            
            # Store the current milestone and its size.
            current = { 'milestone': {}, 'diff': +Infinity, 'size': 0 }

            # Determine the 'current' milestone
            now = new Date().getTime()
            for milestone in store.milestones
                due = milestone['due_on']
                # JS expects more accuracy.
                due = dateToTime due
                # Is this the 'current' one?
                diff = due - now
                if diff > 0 and diff < current.diff
                    current.milestone = milestone ; current.diff = diff ; current.due = due

            # Create n dict with all dates in the milestone span.
            days = {} ; totalDays = 0
            day = dateToTime current.milestone.created_at # TODO: shift this to the start of the day and deal with time shifts.
            while day < current.due
                # Save the day.
                days[day] = { 'issue': {}, 'actual': 0, 'ideal': 0 }
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
                                closed = dateToTime issue.closed_at
                                # Find when was it closed (will be made faster)
                                day = do () ->
                                    for day, x of days
                                        if closed < day then return day

                                # Save it.
                                if day? then days[day]['issue'] = issue

            # Calculate the predicted daily velocity.
            dailyIdeal = current['size'] / totalDays ; ideal = current['size']

            # Go through the days and save the number of outstanding issues size.
            for day, d of days
                # Does this day have an issue closed? Reduce the total for this milestone.
                if d['issue'].size? then current['size'] -= d['issue'].size
                # Save the oustanding count for that day.
                days[day].actual = current['size']
                # Save the predicted velocity for that day.
                ideal -= dailyIdeal
                days[day].ideal = ideal

            # Finally send to client.
            res.render 'burndown',
                'days': days
            , (html) -> res.send html, 'Content-Type': 'text/html', 200


    # Get Milestones, Opened and Closed Tickets.
    apiGet "/repos/intermine/InterMine/milestones", 'milestones', done
    apiGet "/repos/intermine/InterMine/issues?state=open", 'issues', done
    apiGet "/repos/intermine/InterMine/issues?state=closed", 'issues', done

# Show open issues.
app.get '/issues', (req, res) ->
    apiGet "/repos/intermine/InterMine/issues?state=open", 'issues', (issues) ->
        # Vanilla render.
        res.render 'issues',
            'issues': issues
        , (html) -> res.send html, 'Content-Type': 'text/html', 200

app.listen 3000
console.log "Express server listening to port 3000"