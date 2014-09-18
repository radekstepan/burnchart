module.exports = Ractive.extend

    'template': require '../../templates/pages/showChart'

    'adapt': [ Ractive.adaptors.Ractive ]

    init: ->
        console.log @get 'route'