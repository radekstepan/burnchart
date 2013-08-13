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