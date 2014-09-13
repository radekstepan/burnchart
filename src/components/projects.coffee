projects = require '../modules/projects'
mediator = require '../modules/mediator'

module.exports = Ractive.extend

    'template': require '../templates/projects'

    'data':
        'projects': projects

    'adapt': [ Ractive.adaptors.Ractive ]