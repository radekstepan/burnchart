module.exports =

  # Progress in percentages.
  'progress': _.memoize (a, b) ->
    100 * (a / (b + a))

  # Is a milestone on time?
  'onTime': _.memoize (number, due_on, created_at, closed_size, open_size) ->
    # Milestones with no due date are always on track.
    return 'green' unless due_on

    # Calculate the progress in days.
    a = +new Date created_at
    b = +new Date
    c = +new Date due_on

    # Progress in time.
    time = @progress b - a, c - b

    # Progress in size.
    [ 'red', 'green' ][ +(@progress(closed_size, open_size) > time) ]
  , (args...) -> # resolver
    args.join '/'

  # Time from now.
  'fromNow': _.memoize (jsonDate) ->
    moment(new Date(jsonDate)).fromNow()

  # When is a milestone due?
  'due': (jsonDate) ->
    return '&nbsp;' unless jsonDate
    [ 'due', @fromNow jsonDate ].join(' ')

  # Markdown formatting.
  'markdown': (markup) ->
    marked markup

  # Format milestone title.
  'title': (text) ->
    if text.toLowerCase().indexOf('milestone') > -1
      text
    else
      [ 'Milestone', text ].join(' ')

  # Hex to decimal.
  hexToDecimal: (hex) ->
    parseInt hex, 16