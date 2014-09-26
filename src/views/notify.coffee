mediator = require '../modules/mediator'
Icons    = require './icons'

HEIGHT = 68 # height of div in px

module.exports = Ractive.extend

  'template': require '../templates/notify'

  'data':
    'top': HEIGHT

  init: ->
    # Save the notify text on us.
    mediator.on '!app/notify', (text, type='') =>
      @set { text, type }
      @animate 'top', 0,      # slide to view
        'easing': d3.ease('bounce')
        'duration': 800
      _.delay =>
        @animate 'top', HEIGHT,  # slide out of view
          'easing': d3.ease('back')
          'complete': =>
            @set 'text', null # reset
      , 5e3 # ttl

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]