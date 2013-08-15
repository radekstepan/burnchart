#!/usr/bin/env coffee
assert = require 'assert'
path   = require 'path'

chart = require path.resolve __dirname, '../src/chart.coffee'

module.exports =
    'chartize closed issues': (done) ->
        a = { number: 2, closed_at: '2013-05-09T09:04:53Z', size: 6 }
        b = { number: 1, closed_at: '2013-05-09T10:04:53Z', size: 4 }
        c = { number: 3, closed_at: '2013-05-12T09:04:53Z', size: 2 }

        chart.closed [ a, b, c ], 20, (err, data) ->
            assert.ifError err
            assert.deepEqual data, [
                { x: 1368090293000, y: 14 }
                { x: 1368093893000, y: 10 }
                { x: 1368349493000, y: 8  }
            ]
            done.call null