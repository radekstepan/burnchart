#!/usr/bin/env coffee
assert = require 'assert'
path   = require 'path'

days = require path.resolve __dirname, '../src/days.coffee'

module.exports =  
    'days array between two endpoints': (done) ->
        days.range { a: '2013-01-05', a: '2012-11-01' }, (err, data) ->
            assert.ifError err
            done.call null