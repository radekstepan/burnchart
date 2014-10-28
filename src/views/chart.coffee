Ractive = require 'ractive'
d3      = require 'd3'

require('d3-tip')(d3)

lines = require '../modules/chart/lines.coffee'
axes  = require '../modules/chart/axes.coffee'

module.exports = Ractive.extend

  'name': 'views/chart'

  'template': require '../templates/chart.html'

  oncomplete: ->
    milestone = @data.milestone
    issues = milestone.issues
    # Total number of points in the milestone.
    total = issues.open.size + issues.closed.size


    # An issue may have been closed before the start of a milestone.
    head = issues.closed.list[0].closed_at
    if issues.length and milestone.created_at > head
      # This is the new start.
      milestone.created_at = head

    # Actual, ideal & trend lines.
    actual = lines.actual issues.closed.list, milestone.created_at, total
    ideal  = lines.ideal milestone.created_at, milestone.due_on, total
    trend  = lines.trend actual, milestone.created_at, milestone.due_on

    # Get available space.
    { height, width } = do @el.getBoundingClientRect

    margin = { 'top': 30, 'right': 30, 'bottom': 40, 'left': 50 }
    width -= margin.left + margin.right
    height -= margin.top + margin.bottom

    # Scales.
    x = d3.time.scale().range([ 0, width ])
    y = d3.scale.linear().range([ height, 0 ])

    # Axes.
    xAxis = axes.horizontal height, x
    yAxis = axes.vertical width, y

    # Line generator.
    line = d3.svg.line()
    .interpolate("linear")
    .x( (d) -> x(d.date) )
    .y( (d) -> y(d.points) )

    # Get the minimum and maximum date, and initial points.
    x.domain([ ideal[0].date, ideal[ideal.length - 1].date ])
    y.domain([ 0, ideal[0].points ]).nice()

    # Add an SVG element with the desired dimensions and margin.
    svg = d3.select(this.el.querySelector('#chart')).append("svg")
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
    # Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear")(ideal))

    # Add the trendline path.
    svg.append("path")
    .attr("class", "trendline line")
    # Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear")(trend))

    # Add the actual line path.
    svg.append("path")
    .attr("class", "actual line")
    # Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear").y( (d) -> y(d.points) )(actual))

    # Collect the tooltip here.
    tooltip = d3.tip().attr('class', 'd3-tip').html ({ number, title }) ->
      "##{number}: #{title}"

    svg.call(tooltip)

    # Show when we closed an issue.
    svg.selectAll("a.issue")
    .data(actual.slice(1)) # skip the starting point
    .enter()
    # A wrapping link.
    .append('svg:a')
    .attr("xlink:href", ({ html_url }) -> html_url )
    .attr("xlink:show", 'new')
    .append('svg:circle')
    .attr("cx", ({ date }) -> x date )
    .attr("cy", ({ points }) -> y points )
    .attr("r",  ({ radius }) -> 5 ) # fixed for now
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide)
