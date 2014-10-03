Hero     = require '../hero'
Projects = require '../projects'
format   = require '../../utils/format'

module.exports = Ractive.extend

  'template': require '../../templates/pages/index'

  'components': { Hero, Projects }

  'data': { format }

  onrender: ->
    document.title = 'Burnchart: GitHub Burndown Chart as a Service'