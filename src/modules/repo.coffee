#!/usr/bin/env coffee
{ _ }      = require 'lodash'
async      = require 'async'

milestones = require './milestones'
issues     = require './issues'
graph      = require './graph'
reg        = require './regex'
req        = require './request'
render     = require './render'

# Eco templates as functions.
tml = {}
( tml[t] = require("../templates/#{t}") for t in [ 'progress' ] )

class exports.Repo

    constructor: (opts) ->
        ( @[k] = v for k, v of opts )

        # Defaults.
        @host ?= 'api.github.com'
        @protocol ?= 'https'
        @size_label = new RegExp(@size_label) or reg.size_label

    render: (cb) =>
        self = @

        async.waterfall [ (cb) ->
            # Get the current milestone.
            milestones.get_current self, (err, warn, milestone) ->
                return cb err if err
                return cb warn if warn
                self.milestone = milestone
                cb null

        # Get all issues.
        (cb) ->
            issues.get_all self, cb
        
        # Filter them to labeled ones.
        (all, cb) ->
            async.map all, (array, cb) ->
                issues.filter array, self.size_label, (err, warn, filtered, total) ->
                    cb err, [ filtered, total ]
            , (err, [ open, closed ]) ->
                return cb err if err
                # Empty?
                return cb 'No matching issues found' if open[1] + closed[1] is 0
                # Save the open/closed on us first.
                self.issues =
                    closed: { points: closed[1], data: closed[0] }
                    open:   { points: open[1],   data: open[0]   }
                cb null
        
        # Create actual and ideal lines & render.
        (cb) ->
            progress = 100 * self.issues.closed.points /
                (total = self.issues.open.points + self.issues.closed.points)

            async.parallel [
                _.partial(
                    graph.actual,
                    self.issues.closed.data,
                    self.milestone.created_at,
                    total
                )
                _.partial(
                    graph.ideal,
                    self.milestone.created_at,
                    self.milestone.due_on,
                    self.off_days or [],
                    total
                )
            ], (err, values) ->
                # Render the body.
                render 'body', 'graph', name: self.repo

                # Render the progress.
                render '#progress', 'progress', { progress }

                # Generate a trendline?
                values.push(graph.trendline(
                    values[0],
                    self.milestone.created_at,
                    self.milestone.due_on
                )) if values[0].length

                # Render the chart.
                do doit = -> graph.render values, cb

                # Watch window resize?
                window.onresize = doit if 'onresize' of window

        ], cb