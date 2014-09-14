user = require '../models/user'

auth = 'oauth'

github = null

do setToken = (token=null) ->
    github = new Github { token, auth }

# Set token when we have one (otherwise init to null).
user.observe 'accessToken', setToken

module.exports = github