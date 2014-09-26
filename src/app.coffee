( require "./#{key}" for key in [
  'utils/mixins'
  'models/projects'
] )


Router = require './modules/router'
Header = require './views/header'
Notify = require './views/notify'

App = Ractive.extend
  
  'template': require './templates/layout'

  'components': { Header, Notify }

  init: ->
    new Router()

module.exports = new App()