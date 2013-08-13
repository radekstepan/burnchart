#!/usr/bin/env coffee
{ _ } = require 'lodash'
async = require 'async'
req   = require './request'

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

    # Filter an array of incoming issues based on a regex.
    'filter': (collection, regex, cb) ->
        warnings = null
        try
            filtered = _.filter collection, ({ labels, number }) ->
                number ?= '?'
                return false unless labels
                switch ( {} for { name } in labels when name and regex.test(name) ).length
                    when 0 then false
                    when 1 then true
                    else
                        warnings ?= []
                        warnings.push "Issue ##{number} has multiple matching size labels"
                        true
            
            cb null, warnings, filtered
        
        catch err
            return cb err, warnings

    # Map a collection of closed issues into days.
    'into_days': (collection, cb) ->
        days = {}
        for issue in collection
            { state, number, closed_at } = issue
            number ?= '?'
            return "Issue ##{number} does not have a `closed_at` parameter" unless closed_at
            unless matches = closed_at.match /^(\d{4}-\d{2}-\d{2})T(.*)/
                return "Issue ##{number} does not match the `closed_at` pattern"
            [ date, time ] = matches[1...]
            days[date] ?= []
            days[date].push issue

        cb null, days