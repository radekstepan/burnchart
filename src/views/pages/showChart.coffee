milestone = require '../../modules/milestone'
project   = require '../../modules/project'
format    = require '../../utils/format'

module.exports = Ractive.extend

    'template': require '../../templates/pages/showChart'

    'adapt': [ Ractive.adaptors.Ractive ]

    'data': { format }

    init: ->
        route = @get 'route'
        milestone.get route, (err, warn, obj) =>
            throw err if err
            throw warn if warn
            # Save the milestone on the route.
            @set 'milestone', obj
            route.milestone = obj

            project route, (err) ->
                throw err if err
                console.log 'Done'