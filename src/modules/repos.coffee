#!/usr/bin/env coffee
{ _ }      = require 'lodash'
async      = require 'async'

milestones = require './milestones'
issues     = require './issues'
graph      = require './graph'
reg        = require './regex'
req        = require './request'

# Eco templates as functions.
templates = {} ; ( templates[t] = require("./#{t}") for t in [ 'body', 'label' ] )

class exports.Repos

    constructor: ->
        @models = []

    fetch: (cb) ->
        self = @
        req.config (err, config) ->
            return cb err if err
            self.models = ( new Repo(entry) for entry in config )
            cb null

    at: (index) ->
        @models[index]


class Repo

    constructor: (opts) ->
        ( @[k] = v for k, v of opts )

    render: (cb) ->
        self = @

        async.waterfall [ (cb) ->
            # Get the current milestone.
            milestones.get_current self, (err, warn, milestone) ->
                self.milestone = milestone
                cb err

        # Get all issues.
        (cb) ->
            issues.get_all self, cb
        
        # Filter them to labeled ones.
        (all, cb) ->
            async.map all, (array, cb) ->
                issues.filter array, reg.size_label, (err, warn, filtered, total) ->
                    cb err, [ filtered, total ]
            , (err, [ open, closed ]) ->
                return cb err if err
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
                _.partial(graph.actual, self.issues.closed.data, self.milestone.created_at, total)
                _.partial(graph.ideal, self.milestone.created_at, self.milestone.due_on, total)
            ], (err, values) ->
                document.querySelector('body').innerHTML = templates.body { progress }

                graph.render values, cb

        ], cb