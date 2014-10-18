{ _, Ractive } = require '../../modules/vendor.coffee'

mediator = require '../../modules/mediator.coffee'
system   = require '../../models/system.coffee'
user     = require '../../models/user.coffee'
key      = require '../../utils/key.coffee'

module.exports = Ractive.extend

  'name': 'views/pages/new'

  'template': require '../../templates/pages/new.html'

  'data': { 'value': 'radekstepan/disposable', user }

  'adapt': [ Ractive.adaptors.Ractive ]

  # Listen to Enter keypress or Submit button click.
  submit: (evt, value) ->
    return if key.is(evt) and not key.isEnter(evt)

    [ owner, name ] = value.split('/')

    done = do system.async

    # Save repo.
    mediator.fire '!projects/add', { owner, name }, (err) ->
      do done

      mediator.fire '!app/notify',
        'text': err or "Project #{value} saved."
        'type': if err then 'error' else 'success'

      # Redirect to the dashboard.
      # TODO: trigger a named route
      window.location.hash = '#'

  onrender: ->
    document.title = 'Add a new project'

    # TODO: autocomplete on our username if we are logged in or based
    #  on repos we already have.
    autocomplete = (value) ->

    @observe 'value', _.debounce(autocomplete, 200), { 'init': no }

    # Focus on the input field.
    do @el.querySelector('input').focus

    @on 'submit', @submit