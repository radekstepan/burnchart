#!/usr/bin/env coffee
{ _ }      = require 'lodash'
async      = require 'async'

milestones = require './milestones'
issues     = require './issues'
graph      = require './graph'
regex      = require './regex'
render     = require './render'

# Setup a repo and render it.
module.exports = (opts, cb) ->

    # Get the current milestone.
    async.waterfall [ (cb) ->
        milestones.get_current opts, (err, warn, milestone) ->
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
            issues.filter array, opts.size_label, (err, warn, filtered, total) ->
                cb err, [ filtered, total ]
        , (err, [ open, closed ]) ->
            return cb err if err
            # Empty?
            return cb 'No matching issues found' if open[1] + closed[1] is 0
            # Save the open/closed on us first.
            opts.issues =
                closed: { points: closed[1], data: closed[0] }
                open:   { points: open[1],   data: open[0]   }
            cb null
    
    # Create actual and ideal lines & render.
    (cb) ->
        progress = 100 * opts.issues.closed.points /
            (total = opts.issues.open.points + opts.issues.closed.points)

        async.parallel [
            _.partial(
                graph.actual,
                opts.issues.closed.data,
                opts.milestone.created_at,
                total
            )
            _.partial(
                graph.ideal,
                opts.milestone.created_at,
                opts.milestone.due_on,
                opts.off_days or [],
                total
            )
        ], (err, values) ->
            # Render the body.
            render 'body', 'graph', { repo: opts.path, milestone: opts.milestone }

            # Render the progress.
            render '#progress', 'progress', { progress }

            # Generate a trendline?
            values.push(graph.trendline(
                values[0],
                opts.milestone.created_at,
                opts.milestone.due_on
            )) if values[0].length

            # Render the chart.
            do doit = -> graph.render values, cb

            # Watch window resize from now on?
            window.onresize = doit if 'onresize' of window

    ], cb