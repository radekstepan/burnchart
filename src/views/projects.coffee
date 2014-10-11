mediator = require '../modules/mediator'
format   = require '../utils/format'
Icons    = require './icons'

module.exports = Ractive.extend

  'name': 'views/projects'

  'template': require '../templates/projects'

  'data': { format }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]