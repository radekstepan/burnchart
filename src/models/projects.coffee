mediator = require '../modules/mediator'
Model    = require '../utils/model'
user     = require './user'

module.exports = new Model

    'data':
        'items': []

    init: ->
        # Initialize with items stored locally.
        localforage.getItem 'projects', (items=[]) =>
            @set 'items', items

        # Persist in local storage.
        @observe 'items', ->
            localforage.setItem 'projects', @get('items')

        mediator.on '!projects/add', (repo) =>
            # TODO: deal with repo.hasIssues and warn if there are none.
            @push 'items', { 'owner': repo.owner.login, 'name': repo.name }