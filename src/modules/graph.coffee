#!/usr/bin/env coffee
{ _ } = require 'lodash'
d3    = require 'd3'
Tip   = require 'tip'

reg   = require './regex'

module.exports =
    
    # A graph of closed issues.
    'actual': (collection, created_at, total, cb) ->
        head = [ {
            date: new Date(created_at)
            points: total
        } ]
        
        min = +Infinity ; max = -Infinity

        # Generate the actual closes.
        rest = _.map collection, (issue) ->
            { size, closed_at } = issue
            # Determine the range.
            min = size if size < min
            max = size if size > max

            # Dropping points remaining.
            _.extend {}, issue,
                date: new Date(closed_at)
                points: total -= size
        
        # Now add a radius in a range (will be used for a circle).
        range = d3.scale.linear().domain([ min, max ]).range([ 5, 8 ])

        rest = _.map rest, (issue) ->
            issue.radius = range issue.size
            issue

        cb null, [].concat head, rest

    # A graph of an ideal progression..
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

    # Graph representing a trendling of actual issues.
    'trendline': (actual, created_at, due_on) ->
        start = +actual[0].date

        # Values is a list of time from the start and points remaining.
        values = _.map actual, ({ date, points }) ->
            [ +date - start, points ]

        # Now is an actual point too.
        last = actual[actual.length - 1]
        values.push [ + new Date() - start, last.points ]

        # http://classroom.synonym.com/calculate-trendline-2709.html
        b1 = 0 ; e = 0 ; c1 = 0
        a = (l = values.length) * _.reduce(values, (sum, [ a, b ]) ->
            b1 += a ; e += b
            c1 += Math.pow(a, 2)
            sum + (a * b)
        , 0)

        slope = (a - (b1 * e)) / ((l * c1) - (Math.pow(b1, 2)))
        intercept = (e - (slope * b1)) / l
        fn = (x) -> slope * x + intercept

        # Milestone always has a creation date.
        created_at = new Date created_at
        # Due date can be empty.
        due_on = if due_on then new Date(due_on) else new Date()

        a = created_at - start
        b = due_on - start

        [
            {
                date: created_at
                points: fn(a)
            }, {
                date: due_on
                points: fn(b)
            }
        ]

    # The graph as a whole.
    'render': ([ actual, ideal, trendline ], cb) ->
        document.querySelector('#svg').innerHTML = ''

        # Get available space.    
        { height, width } = document.querySelector('#graph').getBoundingClientRect()

        margin = { top: 30, right: 30, bottom: 40, left: 50 }
        width -= margin.left + margin.right
        height -= margin.top + margin.bottom

        # Scales.
        x = d3.time.scale().range([ 0, width ])
        y = d3.scale.linear().range([ height, 0 ])
        
        # Axes.
        xAxis = d3.svg.axis().scale(x)
        .orient("bottom")
        # Show vertical lines...
        .tickSize(-height)
        # ...with day of the month...
        .tickFormat( (d) -> d.getDate() )
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
        svg = d3.select("#svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        # Add the days x-axis.
        svg.append("g")
        .attr("class", "x axis day")
        .attr("transform", "translate(0,#{height})")
        .call(xAxis)

        # Add the months x-axis.
        m = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        mAxis = xAxis
        .orient("top")
        .tickSize(height)
        .tickFormat( (d) -> m[d.getMonth()] )
        .ticks(2)
        
        svg.append("g")
        .attr("class", "x axis month")
        .attr("transform", "translate(0,#{height})")
        .call(mAxis)

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

        # Add the trendline path.
        svg.append("path")
        .attr("class", "trendline line")
        .attr("d", line.interpolate("linear")(trendline))

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
        .on('mouseover', ({ date, points, title, number }) ->
            # Pass a title string.
            tooltip = new Tip "##{number}: #{title}"
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