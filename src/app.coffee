( require "./#{key}" for key in [
  'utils/mixins'
  'models/projects'
] )


Router = require './modules/router'
Header = require './views/header'

App = Ractive.extend
  
  'template': require './templates/layout'

  'components': { Header }

  init: ->
    new Router()

module.exports = new App()