module.exports =
  is: (evt) ->
    evt.original.type in [ 'keyup', 'keydown' ]

  isEnter: (evt) ->
    evt.original.which is 13