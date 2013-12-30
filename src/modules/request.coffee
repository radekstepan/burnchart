#!/usr/bin/env coffee
{ superagent, _  } = require './require'

# Custom JSON parser.
superagent.parse =
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
    
    # Get one milestone.
    'one_milestone': (repo, number, cb) ->
        query = { 'state': 'open', 'sort': 'due_date', 'direction': 'asc' }
        request repo, query, "milestones/#{number}", cb

    # Get all issues for a state.
    'all_issues': (repo, query, cb) ->
        _.extend query, { 'per_page': '100' }
        request repo, query, 'issues', cb

    # Get config from our host always.
    'config': (cb) ->
        superagent
        .get("http://#{window.location.host + window.location.pathname}config.json")
        .set('Content-Type', 'application/json')
        .end _.partialRight respond, cb

# Make a request using SuperAgent to GitHub.
request = ({ protocol, host, token, path }, query, noun, cb) ->
    # Make the query params.
    q = ( "#{k}=#{v}" for k, v of query ).join('&')

    req = superagent
    # The URI.
    .get("#{protocol}://#{host}/repos/#{path}/#{noun}?#{q}")
    # The content type.
    .set('Content-Type', 'application/json')
    # The media type.
    .set('Accept', 'application/vnd.github.v3')
    
    # Auth token?
    req = req.set('Authorization', "token #{token}") if token
    
    # Send.
    req.end _.partialRight respond, cb

# How do we respond to a response?
respond = (data, cb) ->
    # 2xx?
    if data.statusType isnt 2
        # Do we have a message from GitHub?
        return cb data.body.message if data?.body?.message?
        # Use SA one.
        return cb data.error.message
    # All good.
    cb null, data.body