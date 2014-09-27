mediator = require '../modules/mediator'
projects = require '../models/projects'
Icons    = require './icons'

module.exports = Ractive.extend

  'template': require '../templates/milestones'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]

  init: ->
    @set 'milestones', _.filter projects.get('list'),
      'owner': @get 'owner'
      'name':  @get 'name'