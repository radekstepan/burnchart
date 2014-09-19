project = require '../../modules/project'

module.exports = Ractive.extend

    'template': require '../../templates/pages/showChart'

    'adapt': [ Ractive.adaptors.Ractive ]

    init: ->
        project @get 'route'