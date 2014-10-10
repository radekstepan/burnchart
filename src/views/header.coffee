{ system } = require '../models/system'
firebase   = require '../models/firebase'
user       = require '../models/user'
Icons      = require './icons'

module.exports = Ractive.extend

  'name': 'views/header'

  'template': require '../templates/header'

  'data':
    'user': user
    # Default app icon.
    'icon': 'fire-station'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]
  
  onconstruct: ->
    # Login user.
    @on '!login', ->
      firebase.login (err) ->
        throw err if err

  onrender: ->
    # Switch loading icon with app icon.
    system.observe 'loading', (ya) =>
      @set 'icon', if ya then 'spinner1' else 'fire-station'