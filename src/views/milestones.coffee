mediator = require '../modules/mediator'
projects = require '../models/projects'
Icons    = require './icons'

module.exports = Ractive.extend

  'template': require '../templates/milestones'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]

  onconstruct: ->
    @set 'milestones', _.filter projects.get('list'),
      'owner': @get 'owner'
      'name':  @get 'name'