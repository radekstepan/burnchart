firebase = require '../modules/firebase'

module.exports = Ractive.extend

    'template': require '../templates/header'

    init: ->
        # # Login user.
        # firebase.login (err) ->
        #     throw err if err