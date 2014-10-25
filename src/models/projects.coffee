{ _, lscache, sortedIndexCmp, semver } = require '../modules/vendor.coffee'

Model    = require '../utils/ractive/model.coffee'
config   = require '../models/config.coffee'
stats    = require '../modules/stats.coffee'
date     = require '../utils/date.coffee'
user     = require './user.coffee'

module.exports = new Model

  'name': 'models/projects'

  'data':
    # Current sort order.
    'sortBy': 'priority'
    # Sort functions.
    'sortFns': [ 'progress', 'priority', 'name' ]

  # Return a sort order comparator.
  comparator: ->
    { list, sortBy } = @data

    # Convert existing index into actual project milestone.
    deIdx = (fn) =>
      ([ i, j ], rest...) =>
        fn.apply @, [ [ list[i], list[i].milestones[j] ] ].concat rest

    # Set default fields, in place.
    defaults = (arr, hash) ->
      for item in arr
        for k, v of hash
          ref = item
          for p, i in keys = k.split '.'
            if i is keys.length - 1
              ref[p] ?= v
            else
              ref = ref[p] ?= {}

    # The actual fn selection.
    switch sortBy
      # From highest progress points.
      when 'progress' then deIdx ([ aP, aM ], [ bP, bM ]) ->
        defaults [ aM, bM ], { 'stats.progress.points': 0 }
        # Simple points difference.
        aM.stats.progress.points - bM.stats.progress.points

      # From most delayed in days.
      when 'priority' then deIdx ([ aP, aM ], [ bP, bM ]) ->
        # Milestones with no deadline are always at the "beginning".
        defaults [ aM, bM ], { 'stats.progress.time': 0, 'stats.days': 1e3 }
        # % difference in progress times the number of days ahead or behind.
        [ $a, $b ] = _.map [ aM, bM ], ({ stats }) ->
          (stats.progress.points - stats.progress.time) * stats.days

        $b - $a

      # Based on project then milestone name including semver.
      when 'name' then deIdx ([ aP, aM ], [ bP, bM ]) ->
        return owner if owner = bP.owner.localeCompare aP.owner
        return name if name = bP.name.localeCompare aP.name
        # Try semver.
        if semver.valid(bM.title) and semver.valid(aM.title)
          semver.gt bM.title, aM.title
        # Back to string compare.
        else
          bM.title.localeCompare aM.title

      # The "whatever" sort order...
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

  # Add a milestone for a project.
  addMilestone: (project, milestone) ->
    # Add in the stats.
    _.extend milestone, { 'stats': stats(milestone) }
    # We are supposed to exist already.
    throw 500 if (i = @findIndex(project)) < 0 

    # Have milestones already?
    if project.milestones?
      @push "list.#{i}.milestones", milestone
      j = @data.list[i].milestones.length - 1 # index in milestones
    else
      @set "list.#{i}.milestones", [ milestone ]
      j = 0  # index in milestones

    # Now index this milestone.
    @sort [ i, j ], [ project, milestone ]

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
    @set 'list': [], 'index': []

  # Sort/or insert into an already sorted index.
  sort: (ref, data) ->
    # Get or initialize the index.
    index = @data.index or []

    # Do one.
    if ref
      idx = sortedIndexCmp index, data, do @comparator
      index.splice idx, 0, ref
    # Do all.
    else
      for p, i in @data.list
        # TODO: need to show projects that failed too...
        continue unless p.milestones?
        for m, j in p.milestones
          # Run a comparator here inserting into index.
          idx = sortedIndexCmp index, [ p, m ], do @comparator
          # Log.
          index.splice idx, 0, [ i, j ]

    # Save the index.
    @set 'index', index

  onconstruct: ->
    @subscribe '!projects/add',    @add, @
    @subscribe '!projects/clear',  @clear, @

  onrender: ->
    # Init the projects.
    @set 'list', lscache.get('projects') or []

    # Persist projects in local storage (sans milestones).
    @observe 'list', (projects) ->
      lscache.set 'projects', _.pluckMany projects, [ 'owner', 'name' ]
    , 'init': no

    # Reset our index and re-sort.
    @observe 'sortBy', ->
      # Use pop as Ractive is glitchy when resetting arrays.
      @set 'index', null
      # Run the sort again.
      do @sort
    , 'init': no