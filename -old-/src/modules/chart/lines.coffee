_      = require 'lodash'
d3     = require 'd3'
moment = require 'moment'

config = require '../../models/config.coffee'

module.exports =

  # A graph of closed issues.
  # `issues`:     closed issues list
  # `created_at`: milestone start date
  # `total`:      total number of points (open & closed issues)
  actual: (issues, created_at, total) ->
    head = [ {
      'date': moment(created_at, moment.ISO_8601).toJSON()
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
      issue.date = moment(closed_at, moment.ISO_8601).toJSON()
      issue.points = total -= size
      issue
    
    # Now add a radius in a range (will be used for a circle).
    range = d3.scale.linear().domain([ min, max ]).range([ 5, 8 ])

    rest = _.map rest, (issue) ->
      issue.radius = range issue.size
      issue

    [].concat head, rest

  # A graph of an ideal progression..
  # `a`:     milestone start date
  # `b`:     milestone end date
  # `total`: total number of points (open & closed issues)
  ideal: (a, b, total) ->
    # Swap if end is before the start...
    [ b, a ] = [ a, b ] if b < a

    a = moment a, moment.ISO_8601
    # Do we have a due date?
    b = if b? then moment(b, moment.ISO_8601) else do moment.utc

    # Go through the beginning to the end skipping off days.
    days = [] ; length = 0
    do once = (inc = 0) ->
      # A new day. TODO: deal with hours and minutes!
      day = a.add 1, 'days'
      
      # Does this day count?
      day_of = 7 unless day_of = do day.weekday
      if day_of in config.data.chart.off_days
        days.push { 'date': do day.toJSON, 'off_day': yes }
      else
        length += 1
        days.push { 'date': do day.toJSON }
      
      # Go again?
      once(inc + 1) unless day > b

    # Map points on the array of days now.
    velocity = total / (length - 1)

    days = _.map days, (day, i) ->
      day.points = total
      total -= velocity if days[i] and not days[i].off_day
      day

    # Do we need to make a link to right now?
    days.push { 'date': do now.toJSON, 'points': 0 } if (now = do moment.utc) > b

    days

  # Graph representing a trendling of actual issues.
  trend: (actual, created_at, due_on) ->
    return [] unless actual.length

    [ first, ..., last ] = actual

    start = moment first.date, moment.ISO_8601

    # Values is a list of time from the start and points remaining.
    values = _.map actual, ({ date, points }) ->
      [ moment(date, moment.ISO_8601).diff(start), points ]

    # Now is an actual point too.
    now = do moment.utc
    values.push [ now.diff(start), last.points ]

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
    created_at = moment created_at, moment.ISO_8601
    
    # Due date specified.
    if due_on
      due_on = moment due_on, moment.ISO_8601
      # In the past?
      due_on = now if now > due_on
    # No due date
    else
      due_on = now

    a = created_at.diff start
    b = due_on.diff start

    [
      {
        'date': do created_at.toJSON
        'points': fn a
      }, {
        'date': do due_on.toJSON
        'points': fn b
      }
    ]