Ractive = require 'ractive'

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
    'icon': 'fire'

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]
  
  onconstruct: ->
    # Sign-in a user.
    @on '!signin', ->
      do firebase.signin

    # Sign-out a user.
    @on '!signout', ->
      do firebase.signout

  onrender: ->
    # Switch loading icon with app icon.
    system.observe 'loading', (ya) =>
      @set 'icon', if ya then 'spinner' else 'fire'