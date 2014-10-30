Ractive = require 'ractive'

# Load Ractive transitions and adapters.
require 'ractive-transitions-fade'
require 'ractive-ractive'

# Will load projects from localStorage.
require './models/projects.coffee'

Header = require './views/header.coffee'
Notify = require './views/notify.coffee'
Icons  = require './views/icons.coffee'

router = require './modules/router.coffee'

new Ractive
  
  'template': require './templates/app.html'

  'el': 'body'

  'components': { Header, Notify, Icons }

  onrender: ->
    # Start the router.
    router.init '/'