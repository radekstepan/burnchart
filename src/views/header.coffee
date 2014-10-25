{ Ractive } = require '../modules/vendor.coffee'

{ system } = require '../models/system.coffee'
firebase   = require '../models/firebase.coffee'
user       = require '../models/user.coffee'
Icons      = require './icons.coffee'

module.exports = Ractive.extend

  'name': 'views/header'

  'template': require '../templates/header.html'

  'data':
    'user': user
    # Default app icon.
    'icon': 'fire-station'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]
  
  onconstruct: ->
    # Login user.
    @on '!login', ->
      do firebase.login

  onrender: ->
    # Switch loading icon with app icon.
    system.observe 'loading', (ya) =>
      @set 'icon', if ya then 'spinner1' else 'fire-station'