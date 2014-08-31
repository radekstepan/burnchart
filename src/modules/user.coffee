# Currently logged-in user.
module.exports = user = new Ractive()

user.observe 'uid', ->
    console.log 'User', arguments