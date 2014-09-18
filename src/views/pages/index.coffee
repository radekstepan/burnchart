Hero     = require '../hero'
Projects = require '../projects'
format   = require '../../utils/format'

module.exports = Ractive.extend

    'template': require '../../templates/pages/index'

    'components': { Hero, Projects }

    'data': { format }