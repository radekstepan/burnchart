mediator = require '../modules/mediator'
request  = require '../modules/request'
Model    = require '../utils/model'
date     = require '../utils/date'
config   = require './config'
user     = require './user'

module.exports = new Model

    'data':
        'list': []

    init: ->
        # Initialize with items stored locally.
        localforage.getItem 'projects', (projects=[]) =>
            # Fetch milestones for each of these projects.
            async.each projects, (project, cb) ->
                mediator.fire '!projects/add', project
            , (err) ->
                throw err if err

        # Persist projects in local storage.
        @observe 'list', (projects) ->
            localforage.setItem 'projects', projects

        mediator.on '!projects/add', (repo, done) =>
            # TODO: warn when we are adding an existing repo (or
            #  silently go to index again).

            # Fetch milestones (which validates repo too).
            request.allMilestones repo, (err, res) =>
                return done err if err

                # Pluck these fields for milestones.
                milestones = _.pluckMany res, config.fields.milestone

                # Push to the stack.
                @push 'list', _.merge repo, { milestones }

                # Call back.
                do done

        mediator.on '!projects/clear', =>
            @set 'list', []