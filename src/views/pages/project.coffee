Hero     = require '../hero'
Projects = require '../projects'
format   = require '../../utils/format'

module.exports = Ractive.extend

  'template': require '../../templates/pages/project'

  'components': { Hero, Projects }

  'data': { format }

  init: ->
    [ owner, name ] = @get 'route'
    route = { owner, name }
    
    document.title = "#{owner}/#{name}"