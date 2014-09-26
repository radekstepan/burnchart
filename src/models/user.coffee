mediator = require '../modules/mediator'
Model  = require '../utils/model'

# Currently logged-in user.
module.exports = new Model

  # Default to a local user.
  'data':
    'provider': "local"
    'id':     "0"
    'uid':    "local:0"
    'token':  null