#!/usr/bin/env coffee
{ _ } = require 'lodash'
d3    = require 'd3'

reg   = require './regex'

module.exports =    
    # Map closed issues ready to be visualized by Rickshaw.
    # Assumes collection has been `filter`ed and is ordered.
    'actual': (collection, created_at, total, cb) ->
        head = [ { date: new Date(created_at), points: total } ]
        rest = _.map collection, ({ closed_at, size }) ->
            { date: new Date(closed_at), points: total -= size }
        cb null, head.concat rest

    # Map ideal velocity for each day ready to be visualized by Rickshaw.
    'ideal': (a, b, total, cb) ->
        # Swap?
        [ b, a ] = [ a, b ] if b < a

        cb null, [
            { date: new Date(a), points: total }
            { date: new Date(b), points: 0 }
        ]

    'render': ([ actual, ideal ], cb) ->
        # Get available space.    
        { height, width } = document.querySelector('#graph').getBoundingClientRect()

        margin = { top: 20, right: 20, bottom: 20, left: 20 }
        width -= margin.left + margin.right
        height -= margin.top + margin.bottom

        # Scales and axis.
        x = d3.time.scale().range([ 0, width ])
        y = d3.scale.linear().range([ height, 0 ])
        
        xAxis = d3.svg.axis().scale(x)
        # Show vertical lines...
        .tickSize(-height)
        # ...with day of the month...
        .tickFormat( (d) -> d.getDate() )
        # ...once per day.
        .ticks(d3.time.hours, 24)
        
        # Area generator.
        area = d3.svg.area()
        .interpolate("monotone")
        .x( (d) -> x(d.date) )
        .y0(height)
        .y1( (d) -> y(d.points) )
        
        # Line generator.
        line = d3.svg.line()
        .interpolate("basis")
        .x( (d) -> x(d.date) )
        .y( (d) -> y(d.points) )

        # Get the minimum and maximum date, and initial points.
        x.domain([ ideal[0].date, ideal[ideal.length - 1].date ])
        y.domain([ 0, ideal[0].points ]).nice()

        # Add an SVG element with the desired dimensions and margin.
        svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        # Add the clip path.
        svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)

        # Add the area path.
        svg.append("path")
        .attr("class", "area")
        .attr("d", area(ideal))

        # Add the x-axis.
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,#{height})")
        .call(xAxis)

        # Add the ideal line path.
        svg.append("path")
        .attr("class", "ideal line")
        .attr("d", line(ideal))

        # Add the actual line path.
        svg.append("path")
        .attr("class", "actual line")
        .attr("d", line(actual))

        cb null