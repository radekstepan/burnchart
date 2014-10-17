( require "./#{key}" for key in [
  'utils/mixins.coffee'
  'models/projects.coffee' # will load projects from localStorage
] )

Header = require './views/header.coffee'
Notify = require './views/notify.coffee'
router = require './modules/router.coffee'

App = Ractive.extend
  
  'template': require './templates/app.html'

  'components': { Header, Notify }

  onrender: ->
    # Start the router.
    router.init '/'

module.exports = new App()