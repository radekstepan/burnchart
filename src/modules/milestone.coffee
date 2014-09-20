#!/usr/bin/env coffee
request = require './request'

module.exports =
    # Get current/specified milestone for a repo.
    get: (repo, cb) ->       
        # Get a specific milestone.
        if repo.milestone
            request.oneMilestone repo, repo.milestone, (err, m) ->
                # Errors?
                return cb err if err
                # Empty milestone?
                if m.open_issues + m.closed_issues is 0
                    return cb null, "No issues for milestone `#{m.title}`"

                cb null, null, m

        # Get the current milestone out of many.
        else
            request.allMilestones repo, (err, data) ->
                # Errors?
                return cb err if err
                # Empty warning?
                return cb null, "No open milestones for repo #{repo.path}" unless data.length
                # The first milestone should be ending soonest.
                m = data[0]
                # Filter milestones without due date.
                m = _.rest data, { 'due_on' : null }
                # The first milestone should be ending soonest. Prefer milestones with due dates.
                m = if m[0] then m[0] else data[0]
                # Empty milestone?
                if m.open_issues + m.closed_issues is 0
                    return cb null, "No issues for milestone `#{m.title}`"

                cb null, null, m