mediator = require './mediator'
user     = require './user'
RactiveModel = require './ractiveModel'

module.exports = new RactiveModel

    'data':
        'items': []

    init: ->
        mediator.on '!projects/get', =>
            switch @get 'provider'
                when 'local'
                    localforage.getItem 'projects', (items=[]) =>
                        @set 'items', items
                
                when 'github'
                    throw 'Not implemented yet'

        mediator.on '!projects/add', (repo) =>
            # TODO: deal with repo.hasIssues and warn if there are none.
            @push 'items', { 'owner': repo.owner.login, 'name': repo.name }