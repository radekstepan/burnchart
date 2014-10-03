Milestones = require '../milestones'

module.exports = Ractive.extend

  'template': require '../../templates/pages/project'

  'components': { Milestones }

  onrender: ->
    [ owner, name ] = @get 'route'
    
    document.title = "#{owner}/#{name}"