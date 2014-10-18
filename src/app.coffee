{ Ractive } = require './modules/vendor.coffee'
# Lodash mixins.
require './utils/mixins.coffee'
# Will load projects from localStorage.
require './models/projects.coffee'

Header = require './views/header.coffee'
Notify = require './views/notify.coffee'
router = require './modules/router.coffee'

app = new Ractive
  
  'template': require './templates/app.html'

  'el': 'body'

  'components': { Header, Notify }

  onrender: ->
    # Start the router.
    router.init '/'