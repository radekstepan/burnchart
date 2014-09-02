AddProjectForm = require '../components/addProjectForm'

module.exports = Ractive.extend

    'template': require '../templates/pages/addProject'

    'components': { AddProjectForm }

    init: ->
        console.log 'Add a project page'