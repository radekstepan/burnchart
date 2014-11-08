{ assert } = require 'chai'

lines      = require '../src/modules/chart/lines.coffee'

module.exports =

  'lines - actual': (done) ->
    issues = [
      { 'size': 3, 'date': 2 }
      { 'size': 2, 'date': 3 }
      { 'size': 1, 'date': 4 }
    ]

    points = ( points for { points } in lines.actual issues, 1, 6 )

    assert.deepEqual points, [ 6, 3, 1, 0 ]

    do done

  'lines - ideal': (done) ->
    # Dates are coming in without timezone information, so UTC.
    a = '2011-04-01T00:00:00Z'
    b = '2011-04-03T00:00:00Z'
    
    line = lines.ideal(a, b, 4)[ 0...3 ]

    assert.deepEqual line, [
      { 'date': '2011-04-02T00:00:00.000Z', 'points': 4 }
      { 'date': '2011-04-03T00:00:00.000Z', 'points': 2 }
      { 'date': '2011-04-04T00:00:00.000Z', 'points': 0 }
    ]


    do done

  'lines - trend': (done) ->
    issues = [
      { 'date': 1, 'points': 4 }
      { 'date': 2, 'points': 1 }
      { 'date': 3, 'points': 1 }
    ]

    line = (Math.round(points) for { points } in lines.trend(issues, 1, new Date))

    assert.deepEqual line, [ 2, 1 ]

    do done