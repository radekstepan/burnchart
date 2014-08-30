user = require './modules/user'

header = require './components/header'

document.title = 'BurnChart: GitHub Burndown Chart as a Service'

App = Ractive.extend
    
    template: require './templates/layout'

    'components':
        'Header': header

    # TODO: observe Model Ractive data.
    'data':
        'user': user.data

module.exports = new App()