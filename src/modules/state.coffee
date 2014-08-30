# Timeout in ms.
ms = 3e3

update = (text, type) ->
    switch type
        when 'load'
            text += '<span class="icon spin6"></span>'

    @
    .attr('text', text)
    .attr('type', type)

module.exports = State = new can.Map

    # HTML text.
    text: null

    # none/load/info/warn
    type: 'none'

    load: _.partialRight update, 'load'
    info: _.partialRight update, 'info'
    warn: _.partialRight update, 'warn'

    none: ->
        @attr 'type', 'none'

timeout = null

# Hide in 3s unless it is an alert or we are loading.
State.bind 'type', (ev, newVal, oldVal) ->
    clearTimeout timeout

    # Skip?
    return if newVal in [ 'warn', 'load' ]

    # Hide.
    setTimeout =>
        @attr 'type', 'none'
    , ms