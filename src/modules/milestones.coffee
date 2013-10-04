#!/usr/bin/env coffee
{ _ } = require 'lodash'
request = require './request'

module.exports =

    # Get current milestones for a repo..
    'get_current': (repo, cb) ->
        request.all_milestones repo, (err, data) ->
            # Request errors?
            return cb err if err
            # GitHub errors?
            return cb data.message if data.message
            # Empty warning?
            return cb null, 'No open milestones for repo' unless data.length
            # Filter milestones without due date.
            m = _.rest data, { 'due_on' : null }
            # The first milestone should be ending soonest. Prefer milestones with due dates.
            m = if m[0] then m[0] else data[0]
            # Empty milestone?
            return cb null, 'No issues for milestone' if m.open_issues + m.closed_issues is 0
            
            cb null, null, m