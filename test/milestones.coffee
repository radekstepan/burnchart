#!/usr/bin/env coffee
assert = require 'assert'
async  = require 'async'
path   = require 'path'
proxy  = require 'proxyquire'

req = {}

milestones = proxy path.resolve(__dirname, '../src/milestones.coffee'),
    './request': req

module.exports =  
    'get current from 1': (done) ->
        req.milestones = (user, repo, cb) ->
            cb null, [
                {
                    'number': 1
                    'created_at': '2013-01-01T00:00:00Z'
                    'due_on': '2013-02-01T00:00:00Z'
                }
            ]

        milestones.get_current null, null, (err, milestone) ->
            assert.ifError err
            assert.equal milestone.number, 1
            done.call null

    'get current from > 1': (done) ->
        req.milestones = (user, repo, cb) ->
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

        milestones.get_current null, null, (err, milestone) ->
            assert.ifError err
            assert.equal milestone.number, 2
            done.call null

    'get current when empty': (done) ->
        req.milestones = (user, repo, cb) ->
            cb null, []

        milestones.get_current null, null, (err, milestone) ->
            assert.equal err, 'No open milestones for a repo'
            done.call null

    'get current when not found': (done) ->
        req.milestones = (user, repo, cb) ->
            cb null, { 'message': 'Not Found' }

        milestones.get_current null, null, (err, milestone) ->
            assert.equal err, 'Not Found'
            done.call null