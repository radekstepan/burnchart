mediator = require '../modules/mediator'
projects = require '../models/projects'
Icons    = require './icons'

module.exports = Ractive.extend

  'name': 'views/hero'

  'template': require '../templates/hero'

  'data': { projects }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]