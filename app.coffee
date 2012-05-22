express = require 'express'
eco     = require 'eco'
https =   require 'https'
fs =      require "fs"

options =
    host: "api.github.com"
    path: "/repos/intermine/InterMine/issues"
    method: "GET"

getIssues = (callback) ->
    https.request(options, (response) ->
        if response.statusCode is 200
            json = ""
            response.on "data", (chunk) -> json += chunk
            
            response.on "end", -> callback JSON.parse json
    ).end()

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

# Routes
app.get '/issues', (req, res) ->
    getIssues (issues) ->
        res.render 'issues',
            'issues': issues
        , (html) -> res.send html, 'Content-Type': 'text/html', 200

app.listen 3000
console.log "Express server listening to port 3000"