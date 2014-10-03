mediator = require '../modules/mediator'
Icons    = require './icons'

HEIGHT = 68 # height of div in px

module.exports = Ractive.extend

  'template': require '../templates/notify'

  'data':
    'top': HEIGHT
    'hidden': yes
    'defaults':
      'text': ''
      'type': ''
      'system': no
      'icon': 'megaphone'
      'ttl':  5e3

  # Show a notification.
  show: (opts) ->
    @set 'hidden', no
    
    # Set the opts.
    @set opts = _.defaults opts, @data.defaults
    # Which position to slide to?
    pos = [ 0, 50 ][ +opts.system ] # 0px or 50% from top
    # Slide into view.
    @animate 'top', pos,
      'easing': d3.ease('bounce')
      'duration': 800
    
    # If no ttl then show permanently.
    return unless opts.ttl

    # Slide out of the view.
    _.delay _.bind(@hide, @), opts.ttl

  # Hide a notification.
  hide: ->
    return if @data.hidden
    @set 'hidden', yes

    @animate 'top', HEIGHT,
      'easing': d3.ease('back')
      'complete': =>
        # Reset the text when all is done.
        @set 'text', null
  
  onconstruct: ->
    # On outside messages.
    mediator.on '!app/notify', _.bind @show, @
    mediator.on '!app/notify/hide', _.bind @hide, @

    # Close us prematurely...
    @on 'close', @hide

  'components': { Icons }

  'adapt': [ Ractive.adaptors.Ractive ]