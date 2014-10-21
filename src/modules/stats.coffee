{ moment }  = require './vendor.coffee'

# Progress in %.
progress = (a, b) -> 100 * (a / (b + a))

# Calculate the stats for a milestone.
#  Is it on time? What is the progress?
module.exports = (milestone) ->
    # Progress in points.
    points = progress milestone.issues.closed.size, milestone.issues.open.size    
    
    # Milestones with no due date are always on track.
    return { 'isOnTime': yes, 'progress': { points } } unless milestone.due_on

    a = +new Date milestone.created_at
    b = +new Date
    c = +new Date milestone.due_on

    # Progress in time.
    time = progress b - a, c - b

    # How many days is 1% of the time?
    days = (moment(a).diff(moment(b), 'days')) / 100

    {
      'isOnTime': points > time
      'progress': { points, time }
      'days':     days
    }