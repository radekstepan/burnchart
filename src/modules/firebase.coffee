config = require '../models/config'
user   = require '../models/user'

# Default "silent" callback for auth.
class Class
    
    constructor: ->       
        # Setup a new client.
        @client = new Firebase "https://#{config.firebase}.firebaseio.com"
        
        # Check if we have a user in session.
        @auth = new FirebaseSimpleLogin @client, (err, obj) =>
            return @authCb err if err or not obj

            # Save user.
            user.set obj

    # Default "blank" callback.
    authCb: ->

    # Login a user.
    login: (cb) ->
        return cb 'Client is not setup' unless @client
        
        # Override the default auth callback.
        @authCb = cb

        # Login.
        @auth.login config.provider,
            'rememberMe': yes
            'scope': 'public_repo'

    # Logout a user.
    logout: ->
        @auth?.logout
        do user.reset

module.exports = new Class()