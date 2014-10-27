Ractive = require 'ractive'

format   = require '../../utils/format.coffee'
Icons    = require '../icons.coffee'
projects = require '../../models/projects.coffee'

module.exports = Ractive.extend

  'name': 'views/table'

  'data': { format }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]

  onconstruct: ->
    # Change sort order.
    @on 'sortBy', ->
      fns = projects.data.sortFns

      idx = 1 + fns.indexOf projects.data.sortBy
      idx = 0 if idx is fns.length

      projects.set 'sortBy', fns[idx]