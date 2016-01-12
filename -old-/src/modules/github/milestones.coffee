request = require './request.coffee'

module.exports =

  # Fetch a milestone.
  'fetch': request.oneMilestone

  # Fetch all milestones.
  'fetchAll': request.allMilestones