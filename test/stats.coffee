proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'
require 'blanket'

stats = require '../src/modules/stats.coffee'

module.exports =

  'stats - empty milestone': (done) ->
    milestone =
      'issues':
        'open': { 'size': 0 }
        'closed': { 'size': 0 }

    { isEmpty } = stats milestone
    assert.equal isEmpty, yes
    do done