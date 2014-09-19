#!/usr/bin/env coffee
milestones = require './milestones'
issues     = require './issues'
chart      = require './chart'

# Setup a project and render it.
module.exports = (opts, cb) ->

    # Resolve the milestone.
    async.waterfall [ (cb) ->
        milestones opts, (err, warn, milestone) ->
            return cb err if err
            return cb warn if warn
            opts.milestone = milestone
            cb null

    # Get all issues.
    (cb) ->
        issues.get_all opts, cb
    
    # Filter them to labeled ones.
    (all, cb) ->
        async.map all, (array, cb) ->
            issues.filter array, (err, filtered, total) ->
                cb err, [ filtered, total ]
        , (err, [ open, closed ]) ->
            return cb err if err
            # Empty?
            return cb 'No matching issues found' if open[1] + closed[1] is 0
            # Save the open/closed on us first.
            opts.issues =
                'closed': { 'points': closed[1], 'data': closed[0] }
                'open':   { 'points': open[1],   'data': open[0]   }
            # Do we need to move the milestone start date?
            if (start = closed[0][0].closed_at) < opts.milestone.created_at
                opts.milestone.created_at = start

            cb null
    
    # Create actual and ideal lines & render.
    (cb) ->
        total = opts.issues.open.points + opts.issues.closed.points

        async.parallel [
            _.partial(
                chart.actual, # actual line
                opts.issues.closed.data,
                opts.milestone.created_at,
                total
            )
            _.partial(
                chart.ideal, # ideal line
                opts.milestone.created_at,
                opts.milestone.due_on,
                total
            )
        ], (err, values) ->
            # Generate a trendline?
            values.push(chart.trendline(
                values[0],
                opts.milestone.created_at,
                opts.milestone.due_on
            )) if values[0].length

            # Render the chart.
            chart.render values, cb

            # Watch window resize from now on?
            # window.onresize = doit if 'onresize' of window

    ], cb