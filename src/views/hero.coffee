{ Ractive } = require '../modules/vendor.coffee'

mediator = require '../modules/mediator.coffee'
Icons    = require './icons.coffee'

module.exports = Ractive.extend

  'name': 'views/hero'

  'template': require '../templates/hero.html'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]