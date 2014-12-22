proxy      = do require('proxyquire').noCallThru
{ assert } = require 'chai'
path       = require 'path'
moment     = require 'moment'

stats = require '../src/modules/stats.coffee'

module.exports =

  'stats - is milestone empty, on time and overdue? no due date': (done) ->
    milestone =
      'issues':
        'open': { 'size': 0 }
        'closed': { 'size': 0 }

    { isEmpty, isOverdue, isOnTime } = stats milestone
    assert.isTrue isEmpty
    assert.isFalse isOverdue
    assert.isTrue isOnTime
    do done

  'stats - is milestone done?': (done) ->
    milestone =
      'issues':
        'open': { 'size': 0 }
        'closed': { 'size': 5 }

    { isDone } = stats milestone
    assert.isTrue isDone
    do done

  'stats - is milestone overdue? has due date, yes': (done) ->
    milestone =
      'created_at': '2011-04-02T00:00:00.000Z'
      'due_on': '2011-04-03T00:00:00.000Z'
      'issues':
        'open': { 'size': 0 }
        'closed': { 'size': 0 }

    { isOverdue } = stats milestone
    assert.isTrue isOverdue
    do done

  'stats - is milestone on time? has due date, yes': (done) ->
    now = do moment.utc

    milestone =
      'created_at': now.subtract(1, 'week').toISOString()
      'due_on': now.add(1, 'month').toISOString()
      'issues':
        'open': { 'size': 1 }
        'closed': { 'size': 1 }

    { isOnTime } = stats milestone
    assert.isTrue isOnTime
    do done

  'stats - is milestone on time? has due date, no': (done) ->
    now = do moment.utc

    milestone =
      'created_at': now.subtract(2, 'week').toISOString()
      'due_on': now.add(1, 'day').toISOString()
      'issues':
        'open': { 'size': 2 }
        'closed': { 'size': 2 }

    { isOnTime } = stats milestone
    assert.isFalse isOnTime
    do done

  'stats - is milestone on time? has due date, all issues closed': (done) ->
    now = do moment.utc

    milestone =
      'created_at': now.subtract(2, 'week').toISOString()
      'due_on': now.subtract(1, 'week').toISOString()
      'issues':
        'open': { 'size': 0 }
        'closed': { 'size': 5 }

    { isOnTime } = stats milestone
    assert.isTrue isOnTime
    do done