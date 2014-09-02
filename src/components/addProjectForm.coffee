firebase = require '../modules/firebase'
user     = require '../modules/user'
mediator = require '../modules/mediator'

module.exports = Ractive.extend

    'template': require '../templates/addProjectForm'

    'data':
        'user': user

    'adapt': [ Ractive.adaptors.Ractive ]