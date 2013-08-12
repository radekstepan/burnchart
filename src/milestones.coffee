#!/usr/bin/env coffee
req = require './request'

module.exports =
    'get_current': (user, repo, cb) ->
        req.milestones user, repo, (err, data) ->
            return cb err if err
            return cb data.message if data.message
            return cb 'No open milestones for a repo' unless data.length
            # Go through the milestones looking for one that ends/ended soonest.
            max = [ null, 'A' ]
            for i, { due_on } of data when due_on < max[1]
                max = [ parseInt(i), due_on ]
            cb null, data[max[0]]