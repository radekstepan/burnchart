Milestones = require '../milestones'

projects   = require '../../models/projects'
system     = require '../../models/system'
config     = require '../../models/config'
milestones = require '../../modules/milestone'
issues     = require '../../modules/issues'
mediator   = require '../../modules/mediator'
format     = require '../../utils/format'

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

    milestones.getAll project, (err, warn, list) =>
      if err or warn
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

      # Calculate progress in all milestones.
      switch config.data.chart.points
        when 'ONE_SIZE'
          list = _.map list, (m) ->
            m.progress = format.progress m.closed_issues, m.open_issues
            m.on_time  = format.onTime m
            m.due      = format.due m.due_on
            m

          # Now we are done.
          do done

          # Save the milestones.
          @set
            'project.milestones': list
            'ready': yes
        
        when 'LABELS'
          # We need to fetch all issues per milestone.
          async.map list, (m, cb) ->
            issues.get_all _.extend(project, { 'milestone': m }), (err, arr) ->
              return cb err if err
              issues.filter arr, (err, filtered, total) ->
                console.log filtered, total

          , (err, list) ->
            # Now we are done.
            do done

            return mediator.fire '!app/notify', {
              'text': do err.toString
              'type': 'alert'
              'system': yes
              'ttl': null
            } if err

            # Save the milestones.
            @set
              'project.milestones': list
              'ready': yes