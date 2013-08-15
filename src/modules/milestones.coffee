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
            # The first milestone should be ending soonest.
            m = data[0]
            # Empty milestone?
            return cb null, 'No issues for milestone' if m.open_issues + m.closed_issues is 0
            cb null, null, m