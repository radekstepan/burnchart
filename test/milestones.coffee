#!/usr/bin/env coffee
assert = require 'assert'
path   = require 'path'
proxy  = require 'proxyquire'

req = {}

milestones = proxy path.resolve(__dirname, '../src/modules/milestones.coffee'),
    './request': req

module.exports =  
    'get current from 1': (done) ->
        req.all_milestones = (opts, cb) ->
            cb null, [
                {
                    'number': 1
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-02-01T00:00:00Z'
                }
            ]

        milestones.get_current {}, (err, warn, milestone) ->
            assert.ifError err
            assert.equal milestone.number, 1
            done.call null

    'get current from > 1': (done) ->
        req.all_milestones = (opts, cb) ->
            cb null, [
                {
                    'number': 1
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-02-01T00:00:00Z'
                }
                {
                    'number': 2
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-01-15T00:00:00Z'
                }
                {
                    'number': 3
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-02-15T00:00:00Z'
                }
            ]

        milestones.get_current {}, (err, warn, milestone) ->
            assert.ifError err
            assert.equal milestone.number, 2
            done.call null

    'get current when empty': (done) ->
        req.all_milestones = (opts, cb) ->
            cb null, []

        milestones.get_current {}, (err, warn, milestone) ->
            assert.ifError err
            assert.equal warn, 'No open milestones for repo'
            done.call null

    'get current when not found': (done) ->
        req.all_milestones = (opts, cb) ->
            cb null, { 'message': 'Not Found' }

        milestones.get_current {}, (err, warn, milestone) ->
            assert.equal err, 'Not Found'
            done.call null

    'get current when no issues': (done) ->
        req.all_milestones = (opts, cb) ->
            cb null, [
                {
                    'number': 1
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-02-01T00:00:00Z',
                    'open_issues': 0,
                    'closed_issues': 0
                }
            ]

        milestones.get_current {}, (err, warn, milestone) ->
            assert.ifError err
            assert.equal warn, 'No issues for milestone'
            done.call null