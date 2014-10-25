Model = require '../utils/ractive/model.coffee'

# Currently logged-in user.
module.exports = new Model

  'name': 'models/user'

  # Default to a local user.
  'data':
    'provider':  "local"
    'id':        "0"
    'uid':       "local:0"
    'token':     null