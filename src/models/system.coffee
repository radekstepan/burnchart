mediator = require '../modules/mediator'
Model    = require '../utils/model'

# System state.
system = new Model
  
  'name': 'models/system'

  'data':
    'loading': no

counter = 0
async = ->
  counter += 1
  system.set 'loading', yes
  ->
    counter -= 1
    system.set 'loading', +counter

module.exports = { system, async }