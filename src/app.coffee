header = require './components/header'

document.title = 'BurnChart: GitHub Burndown Chart as a Service'

App = Ractive.extend
    
    template: require './templates/layout'

    'components':
        'Header': header

module.exports = new App()