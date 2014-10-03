{ system } = require '../models/system'
firebase   = require '../modules/firebase'
user       = require '../models/user'
Icons      = require './icons'

module.exports = Ractive.extend

  'template': require '../templates/header'

  'data':
    'user': user
    # Default app icon.
    'icon': 'fire-station'

  onconstruct: ->
    # Login user.
    @on '!login', ->
      firebase.login (err) ->
        throw err if err

  onrender: ->
    # Switch loading icon with app icon.
    system.observe 'loading', (ya) =>
      @set 'icon', if ya then 'spinner1' else 'fire-station'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]