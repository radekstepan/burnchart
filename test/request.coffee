#!/usr/bin/env coffee
proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'

class Superagent

    get: -> @
    set: -> @
    end: (cb) -> cb @response

request = proxy path.resolve(__dirname, '../src/modules/request.coffee'),
    'superagent': sa = new Superagent()

module.exports =

    'request - all milestones (ok)': (done) ->
        sa.response =
            'statusType': 2
            'error': no
            'body': [ null ]
        
        request.all_milestones {}, (err) ->
            assert.ifError err
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