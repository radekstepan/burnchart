{ moment }  = require './vendor.coffee'

# Progress in %.
progress = (a, b) -> 100 * (a / (b + a))

# Calculate the stats for a milestone.
#  Is it on time? What is the progress?
module.exports = (milestone) ->
    isDone = no ; isOnTime = yes ; isOverdue = no

    # Progress in points.
    points = progress milestone.issues.closed.size, milestone.issues.open.size    
    isDone = yes if points is 100

    # Milestones with no due date are always on track.
    return { isOverdue, isOnTime, isDone, 'progress': { points } } unless milestone.due_on

    a = +new Date milestone.created_at
    b = +new Date
    c = +new Date milestone.due_on

    # Overdue?
    isOverdue = yes if b > c

    # Progress in time.
    time = progress b - a, c - b

    # How many days is 1% of the time?
    days = (moment(b).diff(moment(a), 'days')) / 100

    # Are we on time?
    isOnTime = points > time

    {
      isDone, days, isOnTime, isOverdue
      'progress': { points, time }
    }