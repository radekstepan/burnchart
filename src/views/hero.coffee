mediator = require '../modules/mediator'
projects = require '../models/projects'

module.exports = Ractive.extend

    'template': require '../templates/hero'

    'data': { projects }

    'adapt': [ Ractive.adaptors.Ractive ]