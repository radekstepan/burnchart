# Currently logged-in user.
module.exports = user = new Ractive()

# Init now.
do user.render

user.observe '*', ->
    console.log 'User', arguments