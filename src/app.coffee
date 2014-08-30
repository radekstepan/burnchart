firebase = require './modules/firebase'

document.title = 'BurnChart: GitHub Burndown Chart as a Service'

App = Ractive.extend
    
    template: require './templates/layout'

    init: ->
        # Login user.
        firebase.login (err) ->
            throw err if err

module.exports = new App()