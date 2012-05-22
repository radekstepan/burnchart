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
            # Determine the 'current' milestone
            now = new Date().getTime() ; current = { 'data': {}, 'diff': +Infinity }
            for milestone in store.milestones
                due = milestone['due_on']
                # JS expects more accuracy.
                due = new Date(due[0...due.length - 1] + '.000' + due.charAt due.length-1).getTime()
                # Is this the 'current' one?
                diff = due - now
                if diff > 0 and diff < current.diff
                    current.data = milestone ; current.diff = diff

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