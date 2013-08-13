#!/usr/bin/env coffee
assert = require 'assert'
async  = require 'async'
path   = require 'path'
proxy  = require 'proxyquire'

req = {}

issues = proxy path.resolve(__dirname, '../src/issues.coffee'),
    './request': req

module.exports =  
    'all empty': (done) ->
        called = 0
        req.all_issues = (opts, cb) ->
            called += 1
            cb null, []

        issues.get_all {}, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 0
            assert.equal closed.length, 0
            done.call null