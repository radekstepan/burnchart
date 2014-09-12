#!/usr/bin/env coffee
{ _ } = require './require'

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
    'use_title': false

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
    # Skip cache in node.
    config = null if typeof window is 'undefined'
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
            # The wait is over.
            wait = no

            # We do not strictly require config files.
            config = _.defaults result or {}, defaults

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
            ( queue.pop() null, config while queue.length )