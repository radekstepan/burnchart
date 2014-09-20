module.exports =

    # Progress in percentages.
    'progress': _.memoize (a, b) ->
        100 * (a / (b + a))

    # Is a milestone on time?
    'onTime': _.memoize (milestone) ->
        # Progress in points.
        points = @progress milestone.closed_issues, milestone.open_issues

        # Calculate the progress in days.
        a = +new Date milestone.created_at
        b = +new Date
        c = +new Date milestone.due_on

        # Progress in time.
        time = @progress b - a, c - b

        [ 'red', 'green' ][ +(points > time) ]

    # Time from now.
    'fromNow': _.memoize (jsonDate) ->
        moment(new Date(jsonDate)).fromNow()

    # When is a milestone due?
    'due': (jsonDate) ->
        [ 'due', @fromNow jsonDate ].join(' ')

    # Markdown formatting.
    'markdown': (markup) ->
        marked markup