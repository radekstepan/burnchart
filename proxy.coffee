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
    write = (code, body) ->
        res.writeHead code, {'Content-Type': 'application/json; charset=utf-8'}
        res.end body

    # Config?
    if req.url is '/config.json'
        # Refer to us like so.
        # Prefer custom header x-forwarded-host if defined.
        scrubbed.host = req.headers['x-forwarded-host'] or req.headers.host
        return write 200, JSON.stringify scrubbed, null, 4

    # API request?
    if req.url.match /^\/repos/
        # The new headers.
        headers =
            # See http://developer.github.com/v3/media/#beta-v3-and-the-future
            'Accept': 'application/vnd.github.v3'
            # See http://developer.github.com/v3/#user-agent-required
            'User-Agent': 'GitHub-Burndown-Chart'
        # Add a token?
        headers.Authorization = 'token ' + config.token if config.token
        # Make the HTTPS request.
        return request {
            'uri': 'https://' + config.host + req.url
            headers
        }, (_err, _res, body) ->
            return write(500) if _err
            write _res.statusCode, body

    # Get handled by Connect.
    do next

app = connect()
.use(proxy)
.use(connect.static(__dirname + '/public'))
.listen process.env.PORT, ->
    console.log 'Proxy listening on port', app.address().port