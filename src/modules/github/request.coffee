_          = require 'lodash'
superagent = require 'superagent'

# Lodash mixins.
require '../../utils/mixins.coffee'

config = require '../../models/config.coffee'
user   = require '../../models/user.coffee'

# Custom JSON parser.
superagent.parse =
  'application/json': (res) ->
    try
      JSON.parse res
    catch e
      {} # it was not to be...

# Default args.
defaults =
  'github':
    'host': 'api.github.com'
    'protocol': 'https'

# Public api.
module.exports =
  
  # Get a repo.
  repo: ({ owner, name }, cb) ->
    return cb 'Request is malformed' unless isValid { owner, name }

    ready ->
      data = _.defaults
        'path':   "/repos/#{owner}/#{name}"
        'headers':  headers user.data.github?.accessToken
      , defaults.github

      request data, cb

  # Get all open milestones.
  allMilestones: ({ owner, name }, cb) ->
    return cb 'Request is malformed' unless isValid { owner, name }

    ready ->
      data = _.defaults
        'path':   "/repos/#{owner}/#{name}/milestones"
        'query':  { 'state': 'open', 'sort': 'due_date', 'direction': 'asc' }
        'headers':  headers user.data.github?.accessToken
      , defaults.github

      request data, cb
  
  # Get one open milestone.
  oneMilestone: ({ owner, name, milestone }, cb) ->
    return cb 'Request is malformed' unless isValid { owner, name, milestone }

    ready ->
      data = _.defaults
        'path':   "/repos/#{owner}/#{name}/milestones/#{milestone}"
        'query':  { 'state': 'open', 'sort': 'due_date', 'direction': 'asc' }
        'headers':  headers user.data.github?.accessToken
      , defaults.github

      request data, cb

  # Get all issues for a state.
  allIssues: ({ owner, name, milestone }, query, cb) ->
    return cb 'Request is malformed' unless isValid { owner, name, milestone }

    ready ->
      data = _.defaults
        'path':   "/repos/#{owner}/#{name}/issues"
        'query':  _.extend query, { milestone, 'per_page': '100' }
        'headers':  headers user.data.github?.accessToken
      , defaults.github

      request data, cb

# Make a request using SuperAgent.
request = ({ protocol, host, path, query, headers }, cb) ->
  exited = no

  # Make the query params.
  q = if query then '?' + ( "#{k}=#{v}" for k, v of query ).join('&') else ''

  # The URI.
  req = superagent.get "#{protocol}://#{host}#{path}#{q}"
  # Add headers.
  ( req.set(k, v) for k, v of headers )

  # Timeout for requests that do not finish... see #32.
  timeout = setTimeout ->
    exited = yes
    cb 'Request has timed out'
  , config.data.request.timeout # wait this long

  # Send.
  req.end (err, data) ->
    # Arrived too late.
    return if exited
    # All fine.
    exited = yes
    clearTimeout timeout
    # Actually process the response.
    response err, data, cb

# How do we respond to a response?
response = (err, data, cb) ->
  return cb error err if err
  # 2xx?
  if data.statusType isnt 2
    # Do we have a message from GitHub?
    return cb data.body.message if data?.body?.message?
    # Use SA one.
    return cb data.error.message
  # All good.
  cb null, data.body

# Give us headers.
headers = (token) ->
  # The defaults.
  h =
    'Content-Type': 'application/json'
    'Accept': 'application/vnd.github.v3'
  # Add token?
  h.Authorization = "token #{token}" if token?
  h

isValid = (obj) ->
  rules =
    'owner':     (val) -> val?
    'name':      (val) -> val?
    'milestone': (val) -> _.isInt val
  
  ( return no for key, val of obj when key of rules and not rules[key](val) )

  yes

# Switch when user is ready.
isReady = user.data.ready

# A stack of requests to execute once ready.
stack = []
ready = (cb) ->
  if isReady then do cb else stack.push cb

# Observe user's readiness.
user.observe 'ready', (val) ->
  isReady = val
  # Clear the stack?
  ( do stack.shift() while stack.length ) if val

# Parse an error.
error = (err) ->
  switch
    when _.isString err
      message = err
    when _.isArray err
      message = err[1]
    when _.isObject(err) and _.isString(err.message)
      message = err.message

  unless message
    try
      message = JSON.stringify err
    catch
      message = do err.toString

  message