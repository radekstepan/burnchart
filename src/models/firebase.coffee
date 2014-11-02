Firebase = require 'firebase'

Model  = require '../utils/ractive/model.coffee'
user   = require './user.coffee'
config = require './config.coffee'

module.exports = new Model

  'name': 'models/firebase'

  # Sign-in a user.
  signin: (cb) ->
    cb 'Not ready yet' unless @data.client

    @data.client.authWithOAuthPopup "github", (err, authData) =>      
      return @publish '!app/notify', {
        'text': do err.toString
        'type': 'alert'
        'system': yes
      } if err

      @onAuth authData
    ,
      'rememberMe': yes
      'scope': 'private_repo'

  # When we sign-in/-out.
  onAuth: (data={}) ->
    # Save user.
    user.set data
    # Say we are done.
    user.set 'ready', yes

  # Sign-out a user.
  signout: ->
    do user.reset
    user.set 'uid', null
    do @data.client.unauth

  onrender: ->
    # Setup a new client.
    @set 'client', client = new Firebase "https://#{config.data.firebase}.firebaseio.com"

    # When user is authenticated.
    client.onAuth @onAuth