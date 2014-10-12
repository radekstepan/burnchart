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
  
    document.title = "#{owner}/#{name}/#{milestone}"

    # Get the associated project.
    project = projects.find { owner, name }

    # Should not happen...
    throw 500 unless project

    # Do we have this milestone already?
    obj = _.find project.milestones, { 'number': milestone }
    return @set { 'milestone': obj, 'ready': yes } if obj

    # We are loading the milestones then.
    done = do system.async

    fetchMilestone = (cb) ->
      milestones.fetch _.extend(project, { milestone }), cb

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
      projects.push 'list', data

      # Show the page.
      @set
        'milestone': data
        'ready': yes