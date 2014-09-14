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
        # Fetches a list of milestones for a repo.
        getMilestones = ->

        # Initialize with items stored locally.
        localforage.getItem 'projects', (projects=[]) =>
            @set 'list', projects

        # Persist in local storage.
        @observe 'list', (projects) ->
            localforage.setItem 'projects', projects

        mediator.on '!projects/add', (repo, done) =>
            # TODO: warn when we are adding an existing repo (or
            #  silently go to index again).

            # Fetch milestones (which validates repo too).
            request.allMilestones repo, (err, res) =>
                throw err if err

                # Pluck these fields for milestones.
                milestones = _.pluckMany res, config.fields.milestone

                # Set the default milestone as the soonest one with issues.
                active = _.find milestones, (m) ->
                    0 < m.open_issues + m.closed_issues

                active?.active = true

                # Push to the stack
                @push 'list', _.merge repo,
                    'milestones':
                        'list':       milestones
                        'checked_at': do date.now # checked now

                # Call back so we can redirect.
                do done

        mediator.on '!projects/clear', =>
            @set 'list', []