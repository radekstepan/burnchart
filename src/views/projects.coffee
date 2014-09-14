mediator = require '../modules/mediator'
projects = require '../models/projects'

module.exports = Ractive.extend

    'template': require '../templates/projects'

    'data': { projects }

    'adapt': [ Ractive.adaptors.Ractive ]