#!/usr/bin/env coffee
{ _ }   = require 'lodash'
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
        scrubbed.host = req.headers.host
        return write 200, JSON.stringify scrubbed, null, 4

    # API request?
    if req.url.match /^\/repos/
        # The new headers.
        headers = 'Accept': 'application/vnd.github.raw'
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
    next()

app = connect()
.use(proxy)
.use(connect.static(__dirname + '/public'))
.listen process.env.PORT