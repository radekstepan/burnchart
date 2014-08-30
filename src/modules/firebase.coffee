config = require '../models/config'

user  = require './user'
state = require '../modules/state'

# Default "silent" callback for auth.
authCb = ->

# New client.
firebase.attr 'client', opts.firebase

module.exports = new can.Map

    # Ref server.
    setClient: (root, success, error) ->
        # Create a new instance pointing to a root.
        client = new Firebase "https://#{root}.firebaseio.com"

        # Check if we have a user in session.
        state.load 'Loading'

        @attr 'auth', new FirebaseSimpleLogin client, (err, obj) ->
            if err or not obj
                do state.none unless obj
                return authCb err

            # Save user in memory.
            user obj
            state.info "#{obj.displayName} is logged in"

            # Call back.
            do authCb

        client

    # Login a user.
    login: (cb, provider='github') ->
        return cb 'Client is not setup' unless @client
        
        # Override the default auth callback.
        authCb = cb

        # Login.
        state.load 'Connecting GitHub account'
        @auth.login provider,
            # 30 days.
            'rememberMe': yes
            # See: http://developer.github.com/v3/oauth/#scopes
            # TODO: access private repos as well
            'scope': 'public_repo'

    # Logout a user.
    logout: ->
        do @auth?.logout
        user {}
        # TODO: fixme
        state.info 'You have logged out'

    # Signup a new account.
    signup: (data, cb) ->
        console.log data
        cb null