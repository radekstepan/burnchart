firebase = require '../modules/firebase'
user     = require '../modules/user'
mediator = require '../modules/mediator'

module.exports = Ractive.extend

    'template': require '../templates/addProjectForm'

    'data':
        'user': user
        'value': null

    'adapt': [ Ractive.adaptors.Ractive ]

    init: ->
        autocomplete = (value) ->
            console.log 'Autocomplete', value

        @observe 'value', _.debounce(autocomplete, 200), { 'init': no }

        @on 'submit', ->
            console.log 'Submit the form with', @get('value')