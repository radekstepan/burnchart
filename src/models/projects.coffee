{ _, lscache } = require '../modules/vendor.coffee'

config   = require '../models/config.coffee'
mediator = require '../modules/mediator.coffee'
Model    = require '../utils/model.coffee'
date     = require '../utils/date.coffee'
search   = require '../utils/search.coffee'
user     = require './user.coffee'

module.exports = new Model

  'name': 'models/projects'

  'data':
    'sortKey': 'priority'

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

  # Sort an already sorted index.
  sort: ->
    # Get or initialize the index.
    index = @data.index or []

    for p in @data.list
      for m in p.milestones
        # Run a comparator here inserting into index.
        @data.sortKey

    # Save the index.
    @set 'index', index

  onconstruct: ->
    mediator.on '!projects/add',    _.bind @add, @
    mediator.on '!projects/clear',  _.bind @clear, @

  onrender: ->
    # Init the projects.
    @set 'list', lscache.get('projects') or []

    @observe 'list', (projects) ->
      # Persist projects in local storage (sans milestones).
      lscache.set 'projects', _.pluckMany projects, [ 'owner', 'name' ]
      # Update the index.
      do @sort
    , 'init': no

    # Reset our index and re-sort.
    @observe 'sortKey', ->
      # Use pop as Ractive is glitchy.
      @pop 'index' while @data.index.length
      # Run the sort again.
      do @sort