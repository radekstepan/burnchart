#!/usr/bin/env coffee
{ _ }    = require 'lodash'
async    = require 'async'
Rickshaw = require 'rickshaw'

# Modules.
milestones = require './milestones'
issues     = require './issues'
graph      = require './graph'
reg        = require './regex'

# Eco templates as functions.
templates = {}
( templates[t] = require("./#{t}") for t in [ 'body', 'label' ] )

user = 'radekstepan'
repo = 'disposable'

module.exports = ->
    milestones.get_current { user, repo }, (err, warn, m) ->
        issues.get_all { user, repo, milestone: m.number }, (err, [ open, closed ]) ->
            issues.filter closed, reg.size_label, (err, warn, closed) ->
                async.parallel [
                    _.partial(graph.actual, closed, m.created_at, 10)
                    _.partial(graph.ideal, m.created_at, m.due_on, 10)
                ], (err, [ actual, ideal ]) ->
                    document.querySelector('body').innerHTML = templates.body({})

                    graph = new Rickshaw.Graph
                        'element': document.querySelector('#graph')
                        'renderer': 'line'
                        'series': [
                            { 'data':  actual, 'color': '#73C03A', 'name':  'actual' }
                            { 'data':  ideal,  'color': 'rgba(0,0,0,0.2)', 'name':  'ideal' }
                        ]

                    hoverDetail = new Rickshaw.Graph.HoverDetail
                        'graph': graph
                        'xFormatter': (timestamp) ->
                            new Date(timestamp * 1e3).toUTCString().substring(0, 11)
                        
                        'formatter': (series, timestamp, points) ->
                            templates.label { 'class': series.name, points }
                    
                    xAxis = new Rickshaw.Graph.Axis.Time 'graph': graph

                    yAxis = new Rickshaw.Graph.Axis.Y
                        'graph':       graph
                        'orientation': 'left'
                        'tickFormat':  Rickshaw.Fixtures.Number.formatKMBT

                    annotator = new Rickshaw.Graph.Annotate
                        'graph':   graph
                        'element': document.querySelector('#timeline')
                    
                    annotator.add +new Date / 1e3, 'Now'

                    graph.render()