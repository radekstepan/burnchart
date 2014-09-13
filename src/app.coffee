( require "./modules/#{key}" for key in [
    'projects'
] )

Header = require './components/header'


el = '#page'

route = (page, req, evt) ->
    document.title = 'BurnChart: GitHub Burndown Chart as a Service'
    Page = require "./pages/#{page}"
    new Page { el }

router =
    '':            _.partial route, 'index'
    'project/add': _.partial route, 'addProject'

App = Ractive.extend
    
    'template': require './templates/layout'

    'components': { Header }

    init: ->
        # Init the routes.
        Grapnel.listen router        

module.exports = new App()