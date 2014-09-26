firebase = require '../modules/firebase'
mediator = require '../modules/mediator'
user     = require '../models/user'
Icons    = require './icons'

module.exports = Ractive.extend

  'template': require '../templates/header'

  'data':
    'user': user
    # Default app icon.
    'icon': 'fire-station'

  init: ->
    # Login user.
    @on '!login', ->
      firebase.login (err) ->
        throw err if err

    # Switch loading icon with app icon.
    mediator.on '!app/loading', (ya) =>
      @set 'icon', if ya then 'spin4' else 'fire-station'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]