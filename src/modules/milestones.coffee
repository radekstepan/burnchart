#!/usr/bin/env coffee
req = require './request'

module.exports =
    # Used at initialization stage.
    'get_current': (opts, cb) ->
        req.all_milestones opts, (err, data) ->
            # Request errors.
            return cb err if err
            # GitHub errors.
            return cb data.message if data.message
            # Empty warning.
            return cb null, 'No open milestones for repo' unless data.length
            # Find the one due on soonest (string comparison).
            max = { 'due_on': 'A' }
            ( max = ms for ms in data when ms.due_on < max.due_on )
            # Empty milestone?
            return cb null, 'No issues for milestone' if max.open_issues + max.closed_issues is 0
            cb null, null, max