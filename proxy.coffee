#!/usr/bin/env coffee
_       = require 'lodash'
http    = require 'http'
fs      = require 'fs'
connect = require 'connect'
request = require 'request'

# Read the original config.
config = JSON.parse fs.readFileSync './config.json', 'utf-8'
# Some defaults.
config.host ?= 'api.github.com'
# This is the scrubbed version.
_.extend scrubbed = {}, config, { 'protocol': 'http', 'token': null }

proxy = (req, res, next) ->
    end = (code, body) ->
        res.writeHead code, {'Content-Type': 'application/json; charset=utf-8'}
        res.end body

    # Log it.
    console.log new Date(), req.url

    # Config?
    if req.url is '/config.json'
        # Refer to us like so.
        # Prefer custom header x-forwarded-host if defined.
        scrubbed.host = req.headers['x-forwarded-host'] or req.headers.host
        return end 200, JSON.stringify scrubbed, null, 4

    # GitHub API request?
    if req.url.match /^\/repos/
        # The default headers.
        headers =
            # See http://developer.github.com/v3/media/#beta-v3-and-the-future
            'Accept': 'application/vnd.github.v3'
            # See http://developer.github.com/v3/#user-agent-required
            'User-Agent': 'GitHub-Burndown-Chart'
        # Add a token?
        headers.Authorization = "token #{config.token}" if config.token?

        # Make the HTTPS request.
        return request {
            'uri': "https://#{config.host}#{req.url}"
            headers
        # Handle the response.
        }, (err, _res, body) ->
            return end(500) if err
            end _res.statusCode, body

    # Get handled by Connect.
    do next

app = connect()
.use(proxy)
# Serve the public directory with the app, no need to launch another service.
.use(connect.static(__dirname + '/public'))
# Connect on an env port or go random.
.listen process.env.PORT, ->
    console.log 'Proxy listening on port', app.address().port