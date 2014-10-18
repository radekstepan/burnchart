{ Ractive } = require '../../modules/vendor.coffee'

mediator = require '../../modules/mediator.coffee'
projects = require '../../models/projects.coffee'
format   = require '../../utils/format.coffee'
Icons    = require '../icons.coffee'

module.exports = Ractive.extend

  'name': 'views/milestones'

  'template': require '../../templates/tables/milestones.html'

  'data': { format }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]