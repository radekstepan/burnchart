utils = require '../utils/format'

# Fontello icon hex codes.
codes =
  'cog':           '\e800'
  'search':        '\e801'
  'github':        '\e802'
  'address':       '\e803'
  'plus-circled':  '\e804'
  'fire-station':  '\e805'
  'sort-alphabet': '\e806'
  'down-open':     '\e807'
  'spin6':         '\e808'
  'megaphone':     '\e809'
  'spin4':         '\e80a'

module.exports = Ractive.extend

  'template': require '../templates/icons'

  'isolated': yes

  init: ->
    @observe 'icon', (icon) ->
      if icon and hex = codes[icon]
        @set 'code', utils.hexToDecimal hex
      else
        @set 'code', null