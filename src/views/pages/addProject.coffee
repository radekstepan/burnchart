mediator = require '../../modules/mediator'
github   = require '../../modules/github'
user     = require '../../models/user'

module.exports = Ractive.extend

    'template': require '../../templates/pages/addProject'

    'data': { 'value': null, user }

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
            repo = github.getRepo owner, name
            repo.show (err, repo, xhr) ->
                throw err if err
                # TODO: save repo to us & Firebase.
                mediator.fire '!projects/add', repo
                # Redirect to the dashboard.
                # TODO: trigger a named route
                window.location.hash = '#'