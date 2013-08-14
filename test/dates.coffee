#!/usr/bin/env coffee
assert = require 'assert'
path   = require 'path'
{ _ }  = require 'lodash'
moment = require 'moment'

dates = require path.resolve __dirname, '../src/dates.coffee'

tests =
    'range between two dates':
        [ '2013-01-01T00:00:00Z', '2013-01-02T00:00:00Z' ]
    'range regardless of the order':
        [ '2013-01-02T00:00:00Z', '2013-01-01T00:00:00Z' ]
    'range across a year':
        [ '2012-12-12T00:00:00Z', '2013-01-05T00:00:00Z' ]
    'range on the same day':
        [ '2012-12-12T00:00:00Z', '2013-12-12T00:00:00Z' ]
    'daylight saving':
        [ '2013-05-09T09:04:53Z', '2013-05-12T09:04:53Z' ]

for key, value of tests then do (key, value) ->
    exports[key] = (done) ->
        [ a, b ] = value
        dates.range { a, b }, (err, data) ->
            assert.ifError err
            assert.equal data.length, Math.abs(moment(a).diff(moment(b), 'days')) + 1
            _.each data, (date) -> assert moment(date).isValid()
            done.call null