{ _, lscache, sortedIndexCmp } = require '../modules/vendor.coffee'

config   = require '../models/config.coffee'
mediator = require '../modules/mediator.coffee'
stats    = require '../modules/stats.coffee'
Model    = require '../utils/model.coffee'
date     = require '../utils/date.coffee'
search   = require '../utils/search.coffee'
user     = require './user.coffee'

module.exports = new Model

  'name': 'models/projects'

  'data':
    'sortBy': 'priority'

  # Return a sort order comparator.
  comparator: ->
    switch @data.sortBy
      # Priority comparator from most delayed in days.
      when 'priority' then ([ i, j ], b) =>
        # Convert existing index into actual proejct milestone.
        a = @data.list[i].milestones[j]
        # By progress points.
        $ = { 'progress': { 'points': 0 } }
        a.stats ?= $ ; b.progress ?= $

        a.stats.progress.points - b.stats.progress.points
      
      # Whatever sort order...
      else -> 0

  find: (project) ->
    _.find @data.list, project

  exists: ->
    !!@find.apply @, arguments

  # Push to the stack unless it exists already.
  add: (project) ->
    @push 'list', project unless @exists project

  # Find index of a project.
  findIndex: ({ owner, name }) ->
    _.findIndex @data.list, { owner, name }

  addMilestone: (project, milestone) ->
    # Add in the stats.
    _.extend milestone, { 'stats': stats(milestone) }

    if (idx = @findIndex(project)) > -1
      if project.milestones?
        @push "list.#{idx}.milestones", milestone
      else
        @set "list.#{idx}.milestones", [ milestone ]
    else
      # We are supposed to exist already.
      throw 500

  # Save an error from loading milestones or issues
  saveError: (project, err) ->
    if (idx = @findIndex(project)) > -1
      if project.errors?
        @push "list.#{idx}.errors", err
      else
        @set "list.#{idx}.errors", [ err ]
    else
      # We are supposed to exist already.
      throw 500  

  clear: ->
    @set 'list', []

  # Sort an already sorted index.
  sort: ->
    # Get or initialize the index.
    index = @data.index or []

    for p, i in @data.list
      continue unless p.milestones?
      for m, j in p.milestones
        # Run a comparator here inserting into index.
        idx = sortedIndexCmp index, m, do @comparator
        # Log.
        index.splice idx, 0, [ i, j ]

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
    @observe 'sortBy', ->
      # Use pop as Ractive is glitchy.
      ( @pop 'index' while @data.index.length ) if @data.index?
      # Run the sort again.
      do @sort