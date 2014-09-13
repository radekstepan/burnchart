mediator = require './mediator'
RactiveModel = require './ractiveModel'

module.exports = new RactiveModel

    'data':
        'items': []

    init: ->
        mediator.on '!projects/get', (provider) =>
            switch provider    
                when 'local'
                    localforage.getItem 'projects', (items=[]) =>
                        @set 'items', items
                
                when 'github'
                    throw 'Not implemented yet'