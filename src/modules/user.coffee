# Currently logged-in user.
module.exports = user = can.compute({ })
user.bind 'change', (ev, obj) ->
    mixpanel.people.set
        '$email': obj.email
        'name': obj.displayName
    mixpanel.identify obj.username