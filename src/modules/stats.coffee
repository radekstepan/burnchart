moment = require 'moment'

# Progress in %.
progress = (a, b) ->
    if a + b is 0 then 0 else 100 * (a / (b + a))

# Calculate the stats for a milestone.
#  Is it on time? What is the progress?
module.exports = (milestone) ->
    # Makes testing easier...
    return milestone.stats if milestone.stats?

    isDone = no ; isOnTime = yes ; isOverdue = no ; isEmpty = yes; points = 0

    # Progress in points.
    a = milestone.issues.closed.size
    b = milestone.issues.open.size
    if a + b > 0
        isEmpty = no
        points = progress a, b
        isDone = yes if points is 100

    # Milestones with no due date are always on track.
    return { isOverdue, isOnTime, isDone, isEmpty, 'progress': { points } } unless milestone.due_on?

    a = moment milestone.created_at
    b = do moment.utc
    c = moment milestone.due_on

    # Overdue?
    isOverdue = yes if b.isAfter c

    # Progress in time.
    time = progress b.diff(a), c.diff(b)

    # How many days is 1% of the time?
    days = (b.diff(a, 'days')) / 100

    # Are we on time?
    isOnTime = points > time

    {
      isDone, days, isOnTime, isOverdue
      'progress': { points, time }
    }