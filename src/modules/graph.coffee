#!/usr/bin/env coffee
{ _ } = require 'lodash'
d3    = require 'd3'
Tip   = require 'tip'

reg   = require './regex'

module.exports =    
    # Map closed issues.
    'actual': (collection, created_at, total, cb) ->
        head = [ {
            date: new Date(created_at)
            points: total
        } ]
        
        min = +Infinity ; max = -Infinity

        # Generate the actual closes.
        rest = _.map collection, ({ closed_at, size, title, html_url }) ->
            min = size if size < min
            max = size if size > max
            {
                date: new Date(closed_at)
                points: total -= size
                size
                title
                html_url
            }
        
        # Now add a radius in a range (will be used for a circle).
        range = d3.scale.linear().domain([ min, max ]).range([ 5, 8 ])

        rest = _.map rest, (issue) ->
            issue.radius = range issue.size
            issue

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

        # Do we need to make a link to right now?
        days.push { date: now, points: 0 } if (now = new Date()) > cutoff

        cb null, days

    # Render the D3 chart.
    'render': ([ actual, ideal ], cb) ->
        # Get available space.    
        { height, width } = document.querySelector('#graph').getBoundingClientRect()

        margin = { top: 10, right: 30, bottom: 40, left: 50 }
        width -= margin.left + margin.right
        height -= margin.top + margin.bottom

        # Scales and axes.
        x = d3.time.scale().range([ 0, width ])
        y = d3.scale.linear().range([ height, 0 ])
        
        xAxis = d3.svg.axis().scale(x)
        # Show vertical lines...
        .tickSize(-height)
        # ...with day of the month...
        .tickFormat( (d) -> d.getDate() )
        # ...once per day...
        .ticks(d3.time.hours, 24)
        # ...and give us a spacer.
        .tickPadding(10)

        yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .tickSize(-width)
        .ticks(5)
        .tickPadding(10)
        
        # Line generator.
        line = d3.svg.line()
        .interpolate("linear")
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

        # Add the x-axis.
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,#{height})")
        .call(xAxis)

        # Add the y-axis.
        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

        # Add a line showing where we are now.
        svg.append("svg:line")
        .attr("class", "today")
        .attr("x1", x(new Date()))
        .attr("y1", 0)
        .attr("x2", x(new Date()))
        .attr("y2", height)

        # Add the ideal line path.
        svg.append("path")
        .attr("class", "ideal line")
        .attr("d", line.interpolate("basis")(ideal))

        # Add the actual line path.
        svg.append("path")
        .attr("class", "actual line")
        .attr("d", line.interpolate("linear").y( (d) -> y(d.points) )(actual))

        # Collect the tooltip here.
        tooltip = null

        # Show when we closed an issue.
        svg.selectAll("a.issue")
        .data(actual[1...]) # skip the starting point
        .enter()
        # A wrapping link.
        .append('svg:a')
        .attr("xlink:href", ({ html_url }) -> html_url )
        .attr("xlink:show", 'new')
        .append('svg:circle')
        .attr("cx", ({ date }) -> x date )
        .attr("cy", ({ points }) -> y points )
        .attr("r",  ({ radius }) -> 5 ) # fixed for now
        .on('mouseover', ({ date, points, title }) ->
            # Pass a title string.
            tooltip = new Tip title
            # Absolutely position the div.
            div = document.querySelector '#tooltip'
            div.style.left = x(date) + margin.left + 'px'
            div.style.top = -10 + y(points) + margin.top + 'px'
            # And now show us on the div.
            tooltip.show '#tooltip'
        )
        .on('mouseout', (d) ->
            # Hide after a time has passed if exists.
            tooltip?.hide(200)
        )

        cb null