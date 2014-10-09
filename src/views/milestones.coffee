mediator = require '../modules/mediator'
projects = require '../models/projects'
Icons    = require './icons'

module.exports = Ractive.extend

  'name': 'views/milestones'

  'template': require '../templates/milestones'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]