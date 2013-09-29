#!/usr/bin/env coffee
{ _ } = require 'lodash'
async = require 'async'

req   = require './request'
reg   = require './regex'

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
                    # Request errors.
                    return cb err if err
                    # GitHub errors.
                    return cb data.message if data.message
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
        warnings = null ; total = 0
        try
            filtered = _.filter collection, (issue) ->
                { labels, number } = issue
                number ?= '?'
                return false unless labels
                switch ( {} for { name } in labels when name and regex.test(name) ).length
                    when 0 then false
                    when 1
                        # Provide the size attribute on the issue.
                        total += issue.size = parseInt name.match(regex)[1]
                        true
                    else
                        warnings ?= []
                        warnings.push "Issue ##{number} has multiple matching size labels"
                        true
            
            cb null, warnings, filtered, total
        
        catch err
            return cb err, warnings