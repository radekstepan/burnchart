Ractive = require 'ractive'

format = require '../utils/format.coffee'

# Fontello icon hex codes.
codes =
  'cog':            '\e800'
  'search':         '\e801'
  'github':         '\e802'
  'address':        '\e803'
  'plus-circled':   '\e804'
  'fire-station':   '\e805'
  'sort-alphabet':  '\e806'
  'down-open':      '\e807'
  'spin6':          '\e808'
  'megaphone':      '\e809'
  'spin4':          '\e80a'
  'spinner1':       '\e80b'
  'attention':      '\e80c'
  'download-cloud': '\e80d'
  'heart':          '\e80e'
  'lifebuoy':       '\e80f'

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