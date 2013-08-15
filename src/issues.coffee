#!/usr/bin/env coffee
{ _ } = require 'lodash'
async = require 'async'

req   = require './request'
reg   = require './regex'
dates = require './dates'

module.exports =
    # Used on an initial fetch of issues for a repo.
    'get_all': (opts, cb) ->
        done = no

        # For each status...
        one_status = (status, cb) ->
            # Concat them here.
            results = []
            # One pageful fetch (next pages in series).
            do fetch_page = (page = 1) ->
                req.all_issues { status: status, page: page }, (err, data) ->
                    # Request errors.
                    return cb err if err
                    # GitHub errors.
                    return cb data.message if data.message
                    # Empty?
                    return cb null, results unless data.length
                    # Concat.
                    results = results.concat data
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
        warnings = null
        try
            filtered = _.filter collection, (issue) ->
                { labels, number } = issue
                number ?= '?'
                return false unless labels
                switch ( {} for { name } in labels when name and regex.test(name) ).length
                    when 0 then false
                    when 1
                        # Provide the size attribute on the issue.
                        issue.size = parseInt name.match(regex)[1]
                        true
                    else
                        warnings ?= []
                        warnings.push "Issue ##{number} has multiple matching size labels"
                        true
            
            cb null, warnings, filtered
        
        catch err
            return cb err, warnings

    # Map a collection of closed issues into days and determine the velocity for the range of all days.
    # Assumes collection has been `filter`ed and is ordered.
    'into_days': (collection, regex, cb) ->
        days = {}
        for issue in collection
            { state, number, closed_at } = issue
            number ?= '?'
            return "Issue ##{number} does not have a `closed_at` parameter" unless closed_at
            unless matches = closed_at.match reg.datetime
                return "Issue ##{number} does not match the `closed_at` pattern"
            
            # Explode the matches.
            [ date, time ] = matches[1...]
            # Save it.
            days[date] ?= []
            days[date].push issue

        cb null, days