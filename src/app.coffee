#!/usr/bin/env coffee
{ _ }    = require 'lodash'
async    = require 'async'
Rickshaw = require 'rickshaw'

graph = require './graph'

templates =
    'body':  require './body'
    'label': require './label'

module.exports = ->
    a = { number: 2, closed_at: '2013-05-09T09:04:53Z', size: 6 }
    b = { number: 1, closed_at: '2013-05-20T10:04:53Z', size: 4 }
    c = { number: 3, closed_at: '2013-06-15T09:04:53Z', size: 2 }

    async.parallel [
        _.partial(graph.actual, [ a, b, c ], 20)
        _.partial(graph.ideal, '2013-05-09T09:04:53Z', '2013-08-29T09:04:53Z', 20)
    ], (err, [ actual, ideal ]) ->
        throw err if err

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