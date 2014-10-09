( require "./#{key}" for key in [
  'utils/mixins'
  'models/projects' # will load projects from localStorage
] )

Header = require './views/header'
Notify = require './views/notify'
router = require './modules/router'

App = Ractive.extend
  
  'template': require './templates/app'

  'components': { Header, Notify }

  onrender: ->
    # Start the router.
    router.init '/'

module.exports = new App()