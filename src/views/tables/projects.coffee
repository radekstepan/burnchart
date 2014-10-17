mediator = require '../../modules/mediator.coffee'
format   = require '../../utils/format.coffee'
Icons    = require '../icons.coffee'

module.exports = Ractive.extend

  'name': 'views/projects'

  'template': require '../../templates/tables/projects.html'

  'data': { format }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]