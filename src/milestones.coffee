#!/usr/bin/env coffee
req = require './request'

module.exports =
    'get_current': (user, repo, cb) ->
        req.milestones user, repo, (err, data) ->
            return cb err if err
            # Go through the milestones looking for one that ends/ended soonest.
            max = [ null, +Infinity ]
            ( max = [ parseInt(i), int ] if (int = +new Date due_on) < max[1] for i, { due_on } of data )
            cb null, data[max[0]]