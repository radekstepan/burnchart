config   = require '../models/config'
mediator = require '../modules/mediator'
Model    = require '../utils/model'
date     = require '../utils/date'
user     = require './user'

module.exports = new Model

  'name': 'models/projects'

  find: (project) ->
    _.find @data.list, project

  exists: ->
    !!@find.apply @, arguments

  # Push to the stack unless it exists already.
  add: (project) ->
    @push 'list', project unless @exists project

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