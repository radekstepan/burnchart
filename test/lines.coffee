proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'

lines = require '../src/modules/chart/lines.coffee'

module.exports =

  'lines - na': (done) ->
    assert.equal 1, 1
    do done