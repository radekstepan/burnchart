mediator = require '../modules/mediator'
Icons    = require './icons'

module.exports = Ractive.extend

  'name': 'views/hero'

  'template': require '../templates/hero'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]