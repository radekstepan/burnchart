_      = require 'lodash'
moment = require 'moment'
marked = require 'marked'

module.exports =

  # Time from now.
  fromNow: _.memoize (jsonDate) ->
    moment(jsonDate, moment.ISO_8601).fromNow()

  # When is a milestone due?
  due: (jsonDate) ->
    return '&nbsp;' unless jsonDate
    [ 'due', @fromNow jsonDate ].join(' ')

  # Markdown formatting.
  'markdown': marked

  # Format milestone title.
  title: (text) ->
    if text.toLowerCase().indexOf('milestone') > -1
      text
    else
      [ 'Milestone', text ].join(' ')

  # Hex to decimal.
  hexToDec: (hex) ->
    parseInt hex, 16