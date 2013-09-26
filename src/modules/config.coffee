#!/usr/bin/env coffee
{ _ } = require 'lodash'

request = require './request'
regex   = require './regex'

# Have it?
config = null
# We are cold.
wait   = no
# Callbacks go here.
queue  = []

# Defaults.
defaults =
    # You do know we work with GitHub right?
    'host': 'api.github.com'
    # Making NSA (err taxpayer) work for it.
    'protocol': 'https'

# Get (& cache) configuration from the server.
module.exports = (cb) ->
    # Have config?
    return cb null, config if config
    # Enqueue.
    queue.push cb
    # Load it?
    unless wait
        # Everyone else wait now.
        wait = yes
        # Make the request.
        request.config (err, result) ->
            # We do not strictly require config files.
            config = ( if err then { } else result )
            
            # Tack on defaults?
            ( config[k] ?= v for k, v of defaults )
            
            # RegExpify the size label?
            if config.size_label
                config.size_label = new RegExp config.size_label
            else
                config.size_label = regex.size_label

            # Call back for each enqueued.
            _.each queue, (cb) ->
                cb null, config