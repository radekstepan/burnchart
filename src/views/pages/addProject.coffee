mediator = require '../../modules/mediator'
user     = require '../../models/user'

module.exports = Ractive.extend

    'template': require '../../templates/pages/addProject'

    'data': { 'value': 'radekstepan/disposable', user }

    'adapt': [ Ractive.adaptors.Ractive ]

    init: ->
        # TODO: autocomplete on our username if we are logged in or based
        #  on repos we already have.
        autocomplete = (value) ->

        @observe 'value', _.debounce(autocomplete, 200), { 'init': no }

        # TODO: focus on the input field

        # TODO: listen to Enter keypress.
        @on 'submit', ->
            [ owner, name ] = @get('value').split('/')

            # TODO: save repo & persist.
            mediator.fire '!projects/add', { owner, name }, ->
                # Redirect to the dashboard.
                # TODO: trigger a named route
                window.location.hash = '#'