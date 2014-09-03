firebase = require '../modules/firebase'
user     = require '../modules/user'
mediator = require '../modules/mediator'
github   = require '../modules/github'

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
            [ username, reponame ] = @get('value').split('/')
            repo = github.getRepo username, reponame
            repo.show (err, repo, xhr) ->
                throw err if err
                # TODO: save repo to us & Firebase.
                # Redirect to the dashboard.
                # TODO: trigger a named route
                window.location.hash = '#'