#!/usr/bin/env coffee
{ _, async  } = require './require'

req = require './request'
reg = require './regex'

module.exports =

    # Used on an initial fetch of issues for a repo.
    'get_all': (repo, cb) ->
        # For each state...
        one_status = (state, cb) ->
            # Concat them here.
            results = []
            # One pageful fetch (next pages in series).
            do fetch_page = (page = 1) ->
                req.all_issues repo, {
                    milestone: repo.milestone.number
                    state
                    page
                }, (err, data) ->
                    # Errors?
                    return cb err if err
                    # Empty?
                    return cb null, results unless data.length
                    # Concat sorted (API does not sort on closed_at!).
                    results = results.concat _.sortBy data, 'closed_at'
                    # < 100 results?
                    return cb null, results if data.length < 100
                    # Fetch the next page then.
                    fetch_page page + 1

        # For each `open` and `closed` issues in parallel.
        async.parallel [
            _.partial one_status, 'open'
            _.partial one_status, 'closed'
        ], cb

    # Filter an array of incoming issues based on a regex & save size on them.
    'filter': (collection, regex, cb) ->
        # The total size of all issues.
        total = 0
        
        filtered = _.filter collection, (issue) ->
            # Skip if no labels exist.
            return no unless labels = issue.labels

            # Determine the total issue size from all labels.
            issue.size = _.reduce labels, (sum, label) ->
                # Not matching.
                return sum unless matches = label.name.match(regex)
                # Increase sum.
                sum += parseInt matches[1]
            , 0
            
            # Increase the total.
            total += issue.size

            # Are we saving it?
            !!issue.size
        
        cb null, filtered, total