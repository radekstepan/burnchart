firebase = require '../modules/firebase'
mediator = require '../modules/mediator'
user     = require '../models/user'
state    = require '../models/state'
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
    state.observe 'loading', (val) =>
      @set 'icon', if val then 'spin4' else 'fire-station'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]