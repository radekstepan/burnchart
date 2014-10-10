Model  = require '../utils/model'
user   = require './user'
config = require './config'

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
    @auth = new FirebaseSimpleLogin client, (err, obj) =>
      user.set 'loaded', yes

      throw err if err or not obj

      # Save user.
      user.set obj