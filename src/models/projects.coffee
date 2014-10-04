config   = require '../models/config'
mediator = require '../modules/mediator'
request  = require '../modules/request'
Model    = require '../utils/model'
date     = require '../utils/date'
user     = require './user'

module.exports = new Model

  'data':
    'list': []

  load: (projects=[]) ->
    # Fetch milestones for each of these projects.
    async.each projects, (project, cb) ->
      mediator.fire '!projects/add', project
    , (err) ->
      throw err if err

  add: (repo, done) ->
    # TODO: warn when we are adding an existing repo (or
    #  silently go to index again).

    # Fetch milestones (which validates repo too).
    request.allMilestones repo, (err, res) =>
      return done err if err

      # Pluck these fields for milestones.
      milestones = _.pluckMany res, config.get('fields.milestone')

      # Push to the stack.
      @push 'list', _.merge repo, { milestones }

      # Call back.
      do done

  clear: ->
    @set 'list', []

  onconstruct: ->
    # Initialize with items stored locally.
    localforage.getItem 'projects', _.bind @load, @

    mediator.on '!projects/add',   _.bind @add, @
    mediator.on '!projects/clear', _.bind @clear, @

  onrender: ->
    # Persist projects in local storage.
    @observe 'list', (projects) ->
      localforage.setItem 'projects', projects
