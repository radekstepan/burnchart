config   = require '../models/config.coffee'
mediator = require '../modules/mediator.coffee'
Model    = require '../utils/model.coffee'
date     = require '../utils/date.coffee'
user     = require './user.coffee'

module.exports = new Model

  'name': 'models/projects'

  find: (project) ->
    _.find @data.list, project

  exists: ->
    !!@find.apply @, arguments

  # Push to the stack unless it exists already.
  add: (project) ->
    @push 'list', project unless @exists project

  addMilestone: (project, milestone) ->
    if (idx = _.findIndex(@data.list, project)) > -1
      if project.milestones?
        @push "list.#{idx}.milestones", milestone
      else
        @set "list.#{idx}.milestones", [ milestone ]
    else
      throw 500

  clear: ->
    @set 'list', []

  onconstruct: ->
    mediator.on '!projects/add',    _.bind @add, @
    mediator.on '!projects/clear',  _.bind @clear, @

  onrender: ->
    # Init the projects.
    @set 'list', lscache.get('projects') or []

    # Persist projects in local storage (sans milestones).
    @observe 'list', (projects) ->
      lscache.set 'projects', _.pluckMany projects, [ 'owner', 'name' ]
    , 'init': no