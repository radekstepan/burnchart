document.title = 'BurnChart: GitHub Burndown Chart as a Service'

App = Ractive.extend
    
    template: require './templates/layout'

    init: ->

module.exports = new App()