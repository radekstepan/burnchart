( require "./#{key}" for key in [
  'utils/mixins'
  'models/projects'
] )


Header = require './views/header'
Notify = require './views/notify'
router = require './modules/router'

App = Ractive.extend
  
  'template': require './templates/layout'

  'components': { Header, Notify }

  onrender: ->
    router.init '/'

module.exports = new App()