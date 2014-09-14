firebase = require '../modules/firebase'
mediator = require '../modules/mediator'
user     = require '../models/user'

module.exports = Ractive.extend

    'template': require '../templates/header'

    init: ->
        # Login user.
        @on '!login', ->
            firebase.login (err) ->
                throw err if err

    'data': { user }

    'adapt': [ Ractive.adaptors.Ractive ]