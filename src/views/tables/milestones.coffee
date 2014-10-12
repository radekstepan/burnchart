mediator = require '../../modules/mediator'
projects = require '../../models/projects'
format   = require '../../utils/format'
Icons    = require '../icons'

module.exports = Ractive.extend

  'name': 'views/milestones'

  'template': require '../../templates/tables/milestones'

  'data': { format }

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]