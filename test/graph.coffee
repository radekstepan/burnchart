#!/usr/bin/env coffee
assert = require 'assert'
path   = require 'path'

graph = require path.resolve __dirname, '../src/modules/graph.coffee'

module.exports =
    'chartize closed issues': (done) ->
        a = { number: 2, closed_at: '2013-05-09T09:04:53Z', size: 6 }
        b = { number: 1, closed_at: '2013-05-09T10:04:53Z', size: 4 }
        c = { number: 3, closed_at: '2013-05-12T09:04:53Z', size: 2 }

        graph.actual [ a, b, c ], '2013-05-08T09:04:53Z', 20, (err, data) ->
            assert.ifError err
            assert.deepEqual data, [
                { x: 1368003893, y: 20 }
                { x: 1368090293, y: 14 }
                { x: 1368093893, y: 10 }
                { x: 1368349493, y: 8  }
            ]
            done.call null