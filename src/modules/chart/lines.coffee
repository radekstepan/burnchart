_  = require 'lodash'
d3 = require 'd3'

config = require '../../models/config.coffee'

module.exports =

  # A graph of closed issues.
  # `issues`:     issues list
  # `created_at`: milestone start date
  # `total`:    total number of points (open & closed issues)
  actual: (issues, created_at, total) ->
    head = [ {
      'date': new Date created_at
      'points': total
    } ]
    
    min = +Infinity ; max = -Infinity

    # Generate the actual closes.
    rest = _.map issues, (issue) ->
      { size, closed_at } = issue
      # Determine the range.
      min = size if size < min
      max = size if size > max

      # Dropping points remaining.
      issue.date = new Date closed_at
      issue.points = total -= size
      issue
    
    # Now add a radius in a range (will be used for a circle).
    range = d3.scale.linear().domain([ min, max ]).range([ 5, 8 ])

    rest = _.map rest, (issue) ->
      issue.radius = range issue.size
      issue

    [].concat head, rest

  # A graph of an ideal progression..
  # `a`:   milestone start date
  # `b`:   milestone end date
  # `total`: total number of points (open & closed issues)
  ideal: (a, b, total) ->
    # Swap?
    [ b, a ] = [ a, b ] if b < a

    # We start here adding days to `d`.
    [ y, m, d ] = _.map a.match(config.data.chart.datetime)[1].split('-'), (v) -> parseInt v
    # We want to end here.
    cutoff = new Date(b)

    # Go through the beginning to the end skipping off days.
    days = [] ; length = 0
    do once = (inc = 0) ->
      # A new day.
      day = new Date y, m - 1, d + inc
      
      # Does this day count?
      day_of = 7 if !day_of = day.getDay()
      if day_of in config.data.chart.off_days
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

    days

  # Graph representing a trendling of actual issues.
  trend: (actual, created_at, due_on) ->
    return [] unless actual.length

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
        'date': created_at
        'points': fn(a)
      }, {
        'date': due_on
        'points': fn(b)
      }
    ]