firebase = require '../modules/firebase'
user     = require '../modules/user'

module.exports = Ractive.extend

    'template': require '../templates/header'

    init: ->
        # TODO: how to access adapted ractive model?
        console.log @get 'user.uid'

        # Login user.
        @on 'login', ->
            firebase.login (err) ->
                throw err if err

    'data': { user }

    'adapt': [ Ractive.adaptors.Ractive ]