Chart = require '../chart.coffee'

projects   = require '../../models/projects'
system     = require '../../models/system'
milestones = require '../../modules/github/milestone'
issues     = require '../../modules/github/issues'
mediator   = require '../../modules/mediator'
format     = require '../../utils/format'

module.exports = Ractive.extend

  'name': 'views/pages/chart'

  'template': require '../../templates/pages/chart'

  'components': { Chart }

  'data':
    'format': format
    'ready': no

  onrender: ->
    [ owner, name, milestone ] = @get 'route'
  
    document.title = "#{owner}/#{name}/#{milestone}"

    # Get the associated project.
    project = projects.find { owner, name }

    # Should not happen...
    throw 500 unless project

    # Do we have this milestone already?
    milestone = _.find project.milestones, { 'number': milestone }
    return @set { milestone, 'ready': yes } if milestone

    # We are loading the milestones then.
    done = do system.async

    fetchMilestone = (cb) ->
      milestones.fetch project, cb

    fetchIssues = (milestone, cb) ->
      issues.fetchAll project, (err, obj) ->
        cb err, _.extend milestone, { 'issues': obj }

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
      @set
        'milestone': data
        'ready': yes