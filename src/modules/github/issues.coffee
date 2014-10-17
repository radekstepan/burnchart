#!/usr/bin/env coffee
config  = require '../../models/config.coffee'
request = require './request.coffee'

module.exports =

  # Fetch issues for a milestone.
  fetchAll: (repo, cb) ->
    # Calculate size of either open or closed issues.
    # Modifies issues by ref.
    calcSize = (list, cb) ->
      switch config.data.chart.points
        when 'ONE_SIZE'
          size = list.length

          ( issue.size = 1 for issue in list )

          cb null, { list, size }
        
        when 'LABELS'
          size = 0

          list = _.filter list, (issue) ->
            # Skip if no labels exist.
            return no unless labels = issue.labels

            # Determine the total issue size from all labels.
            issue.size = _.reduce labels, (sum, label) ->
              # Not matching.
              return sum unless matches = label.name.match config.data.chart.size_label
              # Increase sum.
              sum += parseInt matches[1]
            , 0
            
            # Increase the total.
            size += issue.size
            
            # Are we saving it?
            !!issue.size

          cb null, { list, size }

    # For each state...
    oneStatus = (state, cb) ->
      # Concat them here.
      results = []

      # One pageful fetch (next pages in series).
      do fetchPage = (page=1) ->
        request.allIssues repo, { state, page }, (err, data) ->
          # Errors?
          return cb err if err
          # Empty?
          return cb null, results unless data.length
          # Concat sorted (api does not sort on closed_at!).
          results = results.concat _.sortBy data, 'closed_at'
          # < 100 results?
          return cb null, results if data.length < 100
          # Fetch the next page then.
          fetchPage page + 1

    # For each `open` and `closed` issues in parallel.
    async.parallel [
      _.partial async.waterfall, [ _.partial(oneStatus, 'open'),   calcSize ]
      _.partial async.waterfall, [ _.partial(oneStatus, 'closed'), calcSize ]
    ], (err, [ open, closed ]) ->
      cb err, { open, closed }