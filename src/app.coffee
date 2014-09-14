( require "./#{key}" for key in [
    'utils/mixins'
    'models/projects'
] )

Header = require './views/header'

mediator = require './modules/mediator'

el = '#page'

route = (page, req, evt) ->
    document.title = 'BurnChart: GitHub Burndown Chart as a Service'
    Page = require "./views/pages/#{page}"
    new Page { el }

router =
    '':            _.partial route, 'index'
    'project/add': _.partial route, 'addProject'
    # TODO: remove in production.
    'reset':       ->
        mediator.fire '!projects/clear'
        window.location.hash = '#'

App = Ractive.extend
    
    'template': require './templates/layout'

    'components': { Header }

    init: ->
        # Init the routes.
        Grapnel.listen router        

module.exports = new App()