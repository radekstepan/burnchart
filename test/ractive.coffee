assert = require 'assert'

RactiveEventful = require '../src/utils/ractive/eventful.coffee'

module.exports = ->
    # This represents a way for mediator subscriptions to get cancelled.
  'mediator subscriptions get cancelled': (done) ->
    # Need to be able to deal with custom context.
    ctx = 'called': 0

    view = new RactiveEventful

      onconstruct: ->
        # Track how many times we get called.
        @subscribe '!event', ->
          @called += 1
        , ctx

      onteardown: ->
        # Need to deal with multiple teardown handlers
        do this._super

    do view.render()

    view.publish '!event'
    assert.equal ctx.called, 1
    do view.teardown
    view.publish '!event'
    assert.equal ctx.called, 1

    do done