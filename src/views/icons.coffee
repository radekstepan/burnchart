Ractive = require 'ractive'

format = require '../utils/format.coffee'

# Fontello icon hex codes.
codes =
  'spyglass':  '\e801' # Font Awesome - search
  'plus':      '\e804' # Font Awesome - plus-circled
  'settings':  '\e800' # Font Awesome - cog
  'rocket':    '\e80a' # Font Awesome - rocket
  'computer':  '\e807' # Font Awesome - desktop
  'help':      '\e80f' # Font Awesome - lifebuoy
  'github':    '\e802' # Font Awesome - github
  'warning':   '\e80c' # Entypo - attention
  'direction': '\e803' # Entypo - address
  'megaphone': '\e808' # Entypo - megaphone
  'heart':     '\e80e' # Typicons - heart
  'sort':      '\e806' # Typicons - sort-alphabet
  'spinner':   '\e80b' # MFG Labs - spinner1
  'fire':      '\e805' # Maki - fire-station


module.exports = Ractive.extend

  'name': 'views/icons'

  'template': require '../templates/icons.html'

  'isolated': yes

  onrender: ->
    @observe 'icon', (icon) ->
      if icon and hex = codes[icon]
        @set 'code', format.hexToDec hex
      else
        @set 'code', null