Chart = require '../chart'

projects   = require '../../models/projects'
system     = require '../../models/system'
milestones = require '../../modules/github/milestones'
issues     = require '../../modules/github/issues'
mediator   = require '../../modules/mediator'
format     = require '../../utils/format'

module.exports = Ractive.extend

  'name': 'views/pages/chart'

  'template': require '../../templates/pages/milestone'

  'components': { Chart }

  'data':
    'format': format
    'ready': no

  onrender: ->
    [ owner, name, milestone ] = @get 'route'
  
    milestone = parseInt milestone

    document.title = "#{owner}/#{name}/#{milestone}"

    # Get the associated project.
    project = projects.find { owner, name }

    # Should not happen...
    throw 500 unless project

    # Do we have this milestone already?
    obj = _.find project.milestones, { 'number': milestone }
    return @set { 'milestone': obj, 'ready': yes } if obj?

    # We are loading the milestones then.
    done = do system.async

    fetchMilestone = (cb) ->
      milestones.fetch { owner, name, milestone }, cb

    fetchIssues = (data, cb) ->
      issues.fetchAll { owner, name, milestone }, (err, obj) ->
        cb err, _.extend data, { 'issues': obj }

    async.waterfall [
      # Get the milestone.
      fetchMilestone,
      # Then all its issues.
      fetchIssues
    ], (err, data) =>
      do done
      return mediator.fire '!app/notify', {
        'text': do err.toString
        'type': 'alert'
        'system': yes
        'ttl': null
      } if err

      # Save the milestone.
      project.milestones ?= []
      project.milestones.push data
      projects.update 'list'

      # Show the page.
      @set
        'milestone': data
        'ready': yes