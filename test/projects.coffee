proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'
require 'blanket'

projects = require '../src/models/projects.coffee'

module.exports =

  'projects - initializes empty': (done) ->
    assert.deepEqual projects.data.list, [ ]
    do done