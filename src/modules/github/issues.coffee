_     = require 'lodash'
async = require 'async'

config  = require '../../models/config.coffee'
request = require './request.coffee'

module.exports =

  # Fetch issues for a milestone.
  fetchAll: (repo, cb) ->
    # For each `open` and `closed` issues in parallel.
    async.parallel [
      _.partial(oneStatus, repo, 'open')
      _.partial(oneStatus, repo, 'closed')
    ], (err, [ open, closed ]) ->
      cb err, { open, closed }

# Calculate size of either open or closed issues.
# Modifies issues by ref.
calcSize = (list) ->
  switch config.data.chart.points
    when 'ONE_SIZE'
      size = list.length
      ( issue.size = 1 for issue in list )
    
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
        
        # Issues without size (no matching labels) are not saved.
        !!issue.size

    else
      throw 500

  # Sync return.
  { list, size }

# For each state...
oneStatus = (repo, state, cb) ->
  # Concat them here.
  results = []

  done = (err) ->
    return cb err if err
    # Add the size.
    cb null, calcSize results

  # One pageful fetch (next pages in series).
  do fetchPage = (page=1) ->
    request.allIssues repo, { state, page }, (err, data) ->
      # Errors?
      return done err if err
      # Empty?
      return done null, results unless data.length
      # Concat sorted (api does not sort on closed_at!).
      results = results.concat _.sortBy data, 'closed_at'
      # < 100 results?
      return done null, results if data.length < 100
      # Fetch the next page then.
      fetchPage page + 1