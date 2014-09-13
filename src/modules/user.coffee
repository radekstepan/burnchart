mediator = require './mediator'
RactiveModel = require './ractiveModel'

# Currently logged-in user.
module.exports = new RactiveModel

    # Default to a local user.
    'data':
        'provider': "local"
        'id':       "0"
        'uid':      "local:0"

    init: ->
        # When we are changed, get our projects.
        @observe 'uid', ->
            mediator.fire '!projects/get'