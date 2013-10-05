#!/usr/bin/env coffee
{ _ }  = require 'lodash'
marked = require 'marked'

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
            return cb null, "No open milestones for repo #{repo.path}" unless data.length
            # The first milestone should be ending soonest.
            m = data[0]
            # Filter milestones without due date.
            m = _.rest data, { 'due_on' : null }
            # The first milestone should be ending soonest. Prefer milestones with due dates.
            m = if m[0] then m[0] else data[0]
            # Empty milestone?
            return cb null, "No issues for milestone #{m.title}" if m.open_issues + m.closed_issues is 0
            # Has description? Parse GFM.
            m.description = marked(m.description)[3...-5] if m.description

            cb null, null, m