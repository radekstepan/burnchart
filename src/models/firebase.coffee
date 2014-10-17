Model  = require '../utils/model.coffee'
user   = require './user.coffee'
config = require './config.coffee'

module.exports = new Model

  'name': 'models/firebase'

  auth: ->
    throw 'Not overriden'

  # Login a user.
  login: (cb) ->
    # Login.
    @auth.login config.data.provider,
      'rememberMe': yes
      'scope': 'public_repo'

  # Logout a user.
  logout: ->
    @auth?.logout
    do user.reset

  onrender: ->
    # Setup a new client.
    @set 'client', client = new Firebase "https://#{config.data.firebase}.firebaseio.com"
    
    # Check if we have a user in session.
    @auth = new FirebaseSimpleLogin client, (err, obj) ->
      throw err if err
      
      # Save user.
      user.set obj if obj
      # Say we are done.
      user.set 'ready', yes