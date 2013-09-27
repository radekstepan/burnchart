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

# Validators of config fields.
validators =
    'host': (value) ->
        _.isString value
    'protocol': (value) ->
        _.isString(value) and value.match /^http(s?)$/
    'token': (value) ->
        _.isString value
    'off_days': (value) ->
        return no unless _.isArray value
        ( return no for day in value when day not in [ 1..7 ] )
        yes

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

            # Validate it.
            for field, validator of validators when config[field]
                unless validator config[field]
                    return cb "Config field `#{field}` misconfigured"

            # Call back for each enqueued.
            _.each queue, (cb) ->
                cb null, config