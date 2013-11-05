#!/usr/bin/env coffee
{ _, marked  } = require './require'

request = require './request'

# Get current/specified milestone for a repo.
module.exports = (repo, cb) ->
    # Has description? Parse GFM.
    parse = (data) ->
        data.description = marked(data.description)[3...-5] if data.description
        data
    
    # Get a specific milestone.
    if repo.milestone
        request.one_milestone repo, repo.milestone, (err, m) ->
            # Errors?
            return cb err if err
            # Empty milestone?
            if m.open_issues + m.closed_issues is 0
                return cb null, "No issues for milestone `#{m.title}`"
            # Parse GFM.
            m = parse m

            cb null, null, m

    # Get the current milestone out of many.
    else
        request.all_milestones repo, (err, data) ->
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
            # Parse GFM.
            m = parse m

            cb null, null, m