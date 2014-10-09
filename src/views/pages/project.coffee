Milestones = require '../milestones'

projects  = require '../../models/projects'
system    = require '../../models/system'
milestone = require '../../modules/milestone'
mediator  = require '../../modules/mediator'

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

    milestone.getAll project, (err, warn, list) =>
      do done

      return mediator.fire '!app/notify', {
        'text': do err.toString
        'type': 'alert'
        'system': yes
        'ttl': null
      } if err

      return mediator.fire '!app/notify', {
        'text': do warn.toString
        'type': 'warn'
        'system': yes
        'ttl': null
      } if warn

      # Save the milestones.
      @set
        'project.milestones': list
        'ready': yes