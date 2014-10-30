proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'

class Sa

  # How soon do we call back?
  timeout: 1

  # Save the uri.
  get: (uri) ->
    @params = { uri }
    @

  # Save the key-value pair.
  set: (key, value) ->
    @params[key] = value
    @
  
  # Call back with the response.
  end: (cb) ->
    setTimeout =>
      cb null, @response
    , @timeout

superagent = new Sa()

# Proxy the superagent lib.
request = proxy path.resolve(__dirname, '../src/modules/github/request.coffee'),
  'superagent': superagent

# User is ready, make the requests.
user = require '../src/models/user.coffee'
user.set 'ready', yes

# Get config so we can fudge timeout.
config = require '../src/models/config.coffee'

module.exports =

  'request - all milestones (ok)': (done) ->
    superagent.response =
      'statusType': 2
      'error': no
      'body': [ null ]
    
    owner = 'radekstepan'
    name = 'burnchart'

    request.allMilestones { owner, name }, (err, data) ->
      assert.ifError err
      assert.deepEqual superagent.params,
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/milestones?state=open&sort=due_date&direction=asc'
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      assert.deepEqual data, [ null ]
      do done

  'request - one milestone (ok)': (done) ->
    superagent.response =
      'statusType': 2
      'error': no
      'body': [ null ]
    
    owner = 'radekstepan'
    name = 'burnchart'
    milestone = 1

    request.oneMilestone { owner, name, milestone }, (err, data) ->
      assert.ifError err
      assert.deepEqual superagent.params,
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/milestones/1?state=open&sort=due_date&direction=asc'
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      assert.deepEqual data, [ null ]
      do done
  
  'request - one milestone (404)': (done) ->
    superagent.response =
      'statusType': 4
      'error': Error "cannot GET undefined (404)"
      'body':
        'documentation_url': "http://developer.github.com/v3"
        'message': "Not Found"

    owner = 'radekstepan'
    name = 'burnchart'
    milestone = 0
    
    request.oneMilestone { owner, name, milestone }, (err) ->
      assert.equal err, 'Not Found'
      do done

  'request - one milestone (500)': (done) ->
    superagent.response =
      'statusType': 5
      'error': Error "Error"
      'body': null

    owner = 'radekstepan'
    name = 'burnchart'
    milestone = 0
    
    request.oneMilestone { owner, name, milestone }, (err) ->
      assert.equal err, 'Error'
      do done

  'request - all issues (ok)': (done) ->
    superagent.response =
      'statusType': 2
      'error': no
      'body': [ null ]

    owner = 'radekstepan'
    name = 'burnchart'
    milestone = 0
    
    request.allIssues { owner, name, milestone }, {}, (err, data) ->
      assert.ifError err
      assert.deepEqual superagent.params,
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/issues?milestone=0&per_page=100'
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      assert.deepEqual data, [ null ]
      do done

  'request - timeout': (done) ->
    # Run this last or reset timeout to default again...
    config.set 'request.timeout', 10

    superagent.timeout = 11
    superagent.response =
      'statusType': 2
      'error': no
      'body': [ null ]

    owner = 'radekstepan'
    name = 'burnchart'
    milestone = 0
    
    request.allIssues { owner, name, milestone }, {}, (err) ->
      assert.equal err, 'Request has timed out'
      do done