Hero     = require '../hero'
Projects = require '../projects'

module.exports = Ractive.extend

    'template': require '../../templates/pages/index'

    'components': { Hero, Projects }