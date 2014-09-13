Hero     = require '../components/hero'
Projects = require '../components/projects'

module.exports = Ractive.extend

    'template': require '../templates/pages/index'

    'components': { Hero, Projects }