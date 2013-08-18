#!/usr/bin/env coffee
{ _ } = require 'lodash'

req   = require './request'

config = null
wait   = no
queue  = []

module.exports = (cb) ->
    # Have config?
    return cb null, config if config
    # Enqueue.
    queue.push cb
    # Load it?
    unless wait
        wait = yes
        req.config (err, result) ->
            # Save config?
            config = result unless err
            # Call back for each.
            _.each queue, (cb) ->
                cb err, result