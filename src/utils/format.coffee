{ _, moment, marked } = require '../modules/vendor.coffee'

module.exports =

  # Time from now.
  fromNow: _.memoize (jsonDate) ->
    moment(new Date(jsonDate)).fromNow()

  # When is a milestone due?
  due: (jsonDate) ->
    return '&nbsp;' unless jsonDate
    [ 'due', @fromNow jsonDate ].join(' ')

  # Markdown formatting.
  markdown: (markup) ->
    marked markup

  # Format milestone title.
  title: (text) ->
    if text.toLowerCase().indexOf('milestone') > -1
      text
    else
      [ 'Milestone', text ].join(' ')

  # Hex to decimal.
  hexToDec: (hex) ->
    parseInt hex, 16