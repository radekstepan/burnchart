mediator = require '../modules/mediator'
projects = require '../models/projects'
Icons    = require './icons'

module.exports = Ractive.extend

  'name': 'views/projects'

  'template': require '../templates/projects'

  'data': { projects }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]