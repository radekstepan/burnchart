#!/usr/bin/env coffee
sa    = require 'superagent'
{ _ } = require 'lodash'

# Custom JSON parser.
sa.parse =
    'application/json': (res) ->
        try
            JSON.parse res
        catch e
            {} # it was not to be...

module.exports =
    
    # Get all milestones.
    'all_milestones': (repo, cb) ->
        query = { 'state': 'open', 'sort': 'due_date', 'direction': 'asc' }
        request repo, query, 'milestones', cb
    
    # Get all issues for a state.
    'all_issues': (repo, query, cb) ->
        _.extend query, { 'per_page': '100' }
        request repo, query, 'issues', cb

    # Get config from our host always.
    'config': (cb) ->
        sa
        .get("http://#{window.location.host + window.location.pathname}config.json")
        .set('Content-Type', 'application/json')
        .end _.partialRight respond, cb

# Make a request using SuperAgent to GitHub.
request = ({ protocol, host, token, path }, query, noun, cb) ->
    # Make the query params.
    q = ( "#{k}=#{v}" for k, v of query ).join('&')

    req = sa
    # The URI.
    .get("#{protocol}://#{host}/repos/#{path}/#{noun}?#{q}")
    # The content type.
    .set('Content-Type', 'application/json')
    # The media type.
    .set('Accept', 'application/vnd.github.raw')
    
    # Auth token?
    req = req.set('Authorization', "token #{token}") if token
    
    # Send.
    req.end _.partialRight respond, cb

# How do we respond to a response?
respond = (data, cb) ->
    # 2xx?
    return cb data.error.message if data.statusType isnt 2
    # All good.
    cb null, data?.body