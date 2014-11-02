_     = require 'lodash'
async = require 'async'

Chart = require '../chart.coffee'

Eventful   = require '../../utils/ractive/eventful.coffee'
projects   = require '../../models/projects.coffee'
system     = require '../../models/system.coffee'
milestones = require '../../modules/github/milestones.coffee'
issues     = require '../../modules/github/issues.coffee'
format     = require '../../utils/format.coffee'

module.exports = Eventful.extend

  'name': 'views/pages/chart'

  'template': require '../../templates/pages/milestone.html'

  'components': { Chart }

  'data':
    'format': format
    'ready': no

  # Callback when we have data.
  cb: (err, data) ->
    return @publish '!app/notify', {
      'text': do err.toString
      'type': 'alert'
      'system': yes
      'ttl': null
    } if err
    
    # No issues?
    return @publish '!app/notify', {
      'text': 'This milestone has no issues'
      'type': 'warn'
      'system': yes
      'ttl': null
    } if data.stats.isEmpty

    # Done?
    @publish '!app/notify', {
      'text': 'This milestone is complete'
      'type': 'success'
    } if data.stats.isDone

    # Overdue?
    @publish '!app/notify', {
      'text': 'This milestone is overdue'
      'type': 'warn'
    } if data.stats.isOverdue

    # Show the page.
    @set
      'milestone': data
      'ready': yes

  onrender: ->
    [ owner, name, milestone ] = @get 'route'
  
    milestone = parseInt milestone

    document.title = "#{owner}/#{name}/#{milestone}"

    # Get the associated project.
    project = projects.find { owner, name }

    # Should not happen...
    return @cb 'Project not found' unless project

    # Do we have this milestone already?
    data = _.find project.milestones, { 'number': milestone }
    return @cb null, data if data?
    
    # ---

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

      # Save the milestone with issues.
      projects.addMilestone project, data unless err

      # Pass to callback.
      @cb.apply @, arguments