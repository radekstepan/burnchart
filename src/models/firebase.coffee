{ Firebase } = require '../modules/vendor.coffee'

Model  = require '../utils/ractive/model.coffee'
user   = require './user.coffee'
config = require './config.coffee'

module.exports = new Model

  'name': 'models/firebase'

  # Login a user.
  login: (cb) ->
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

  onAuth: (authData) ->
    # Save user.
    user.set authData
    # Say we are done.
    user.set 'ready', yes

  # Logout a user.
  logout: ->
    throw 'Implement'

  onrender: ->
    # Setup a new client.
    @set 'client', client = new Firebase "https://#{config.data.firebase}.firebaseio.com"

    # When user is authenticated.
    client.onAuth @onAuth