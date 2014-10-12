Milestones = require '../tables/milestones'

projects   = require '../../models/projects'
system     = require '../../models/system'
milestones = require '../../modules/github/milestones'
issues     = require '../../modules/github/issues'
mediator   = require '../../modules/mediator'

module.exports = Ractive.extend

  'name': 'views/pages/project'

  'template': require '../../templates/pages/project'

  'components': { Milestones }

  'data':
    'ready': no

  onrender: ->
    [ owner, name ] = @get 'route'

    document.title = "#{owner}/#{name}"

    # Get the associated project.
    @set 'project', project = projects.find { owner, name }

    # Should not happen...
    throw 500 unless project

    # Does it have milestones already?
    return @set('ready', yes) if project.milestones

    # We are loading the milestones then.
    done = do system.async

    fetchMilestones = (cb) ->
      milestones.fetchAll project, cb

    fetchIssues = (allMilestones, cb) ->
      async.map allMilestones, (milestone, cb) ->
        issues.fetchAll { owner, name, 'milestone': milestone.number }, (err, obj) ->
          cb err, _.extend milestone, { 'issues': obj }
      , cb

    async.waterfall [
      # First get all the milestones.
      fetchMilestones,
      # Then all the issues per milestone.
      fetchIssues
    ], (err, data) =>
      do done
      return mediator.fire '!app/notify', {
        'text': do err.toString
        'type': 'alert'
        'system': yes
        'ttl': null
      } if err

      # Save the milestones.
      @set
        'project.milestones': data
        'ready': yes