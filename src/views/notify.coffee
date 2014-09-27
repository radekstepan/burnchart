mediator = require '../modules/mediator'
Icons    = require './icons'

HEIGHT = 68 # height of div in px

module.exports = Ractive.extend

  'template': require '../templates/notify'

  'data':
    'top': HEIGHT

  init: ->
    defaults =
      'text': ''
      'type': ''
      'system': no
      'icon': 'megaphone'

    # Animate.
    # type:   alert/warn/success
    # system: yes/no
    mediator.on '!app/notify', (opts) =>
      opts = _.defaults opts, defaults

      # Set the text.
      @set opts
      # Which position to slide to?
      pos = [ 0, 50 ][ +opts.system ] # 0px or 50% from top
      # Slide into view.
      @animate 'top', pos,
        'easing': d3.ease('bounce')
        'duration': 800
      _.delay =>
        # Slide out of the view.
        @animate 'top', HEIGHT,
          'easing': d3.ease('back')
          'complete': =>
            # Reset the text when all is done.
            @set 'text', null
      # Ttl.
      , 5e3

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]