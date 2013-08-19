#!/usr/bin/env coffee
{ _ } = require 'lodash'
d3    = require 'd3'

reg   = require './regex'

module.exports =    
    # Map closed issues.
    'actual': (collection, created_at, total, cb) ->
        head = [ { date: new Date(created_at), points: total } ]
        rest = _.map collection, ({ closed_at, size }) ->
            { date: new Date(closed_at), points: total -= size }
        cb null, head.concat rest

    # Map ideal velocity for each day.
    'ideal': (a, b, off_days, total, cb) ->
        # Swap?
        [ b, a ] = [ a, b ] if b < a

        # We start here adding days to `d`.
        [ y, m, d ] = _.map a.match(reg.datetime)[1].split('-'), (v) -> parseInt v
        # We want to end here.
        cutoff = new Date(b)

        # Go through the beginning to the end skipping off days.
        days = [] ; length = 0
        do once = (inc = 0) ->
            # A new day.
            day = new Date y, m - 1, d + inc
            
            # Does this day count?
            day_of = 7 if !day_of = day.getDay()
            if day_of in off_days
                days.push { date: day, off_day: yes }
            else
                length += 1
                days.push { date: day }
            
            # Go again?
            once(inc + 1) unless day > cutoff

        # Map points on the array of days now.
        velocity = total / (length - 1)
        
        days = _.map days, (day, i) ->
            day.points = total
            total -= velocity if days[i] and not days[i].off_day
            day

        cb null, days

    # Render the D3 chart.
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
        .interpolate("precise")
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