#!/usr/bin/env coffee
proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'
_      = require 'lodash'

class Superagent

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

request = proxy path.resolve(__dirname, '../src/modules/request.coffee'),
    './require':
        '_': require 'lodash'
        'superagent': sa = new Superagent()
        'd3': null
        'async': null
        'marked': null

module.exports =

    'request - all milestones (ok)': (done) ->
        sa.response =
            'statusType': 2
            'error': no
            'body': [ null ]
        
        request.all_milestones {}, (err, data) ->
            assert.ifError err
            assert.deepEqual sa.params,
                'uri': 'undefined://undefined/repos/undefined/milestones?state=open&sort=due_date&direction=asc'
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3'
            assert.deepEqual data, [ null ]
            do done

    'request - one milestone (ok)': (done) ->
        sa.response =
            'statusType': 2
            'error': no
            'body': [ null ]
        
        request.one_milestone {}, 1, (err, data) ->
            assert.ifError err
            assert.deepEqual sa.params,
                'uri': 'undefined://undefined/repos/undefined/milestones/1?state=open&sort=due_date&direction=asc'
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3'
            assert.deepEqual data, [ null ]
            do done
    
    'request - one milestone (404)': (done) ->
        sa.response =
            'statusType': 4
            'error': Error "cannot GET undefined (404)"
            'body':
                'documentation_url': "http://developer.github.com/v3"
                'message': "Not Found"
        
        request.one_milestone {}, 9, (err) ->
            assert.equal err, 'Not Found'
            do done

    'request - one milestone (500)': (done) ->
        sa.response =
            'statusType': 5
            'error': Error "Error"
            'body': null
        
        request.one_milestone {}, 9, (err) ->
            assert.equal err, 'Error'
            do done

    'request - all issues (ok)': (done) ->
        sa.response =
            'statusType': 2
            'error': no
            'body': [ null ]
        
        request.all_issues {}, {}, (err, data) ->
            assert.ifError err
            assert.deepEqual sa.params,
                'uri': 'undefined://undefined/repos/undefined/issues?per_page=100'
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3'
            assert.deepEqual data, [ null ]
            do done

    'request - timeout': (done) ->
        sa.timeout = 10001
        sa.response =
            'statusType': 2
            'error': no
            'body': [ null ]
        
        request.all_issues {}, {}, (err) ->
            assert.equal err, 'Request has timed out'
            do done