_       = require 'lodash'
Ractive = require 'ractive'

mediator = require '../../modules/mediator.coffee'

# An Ractive that subscribes and listens to messages on `mediator` event bus.
# Usage: this.subscribe('!event', function() { /* listener */ }, context);
module.exports = Ractive.extend

  subscribe: (name, cb, ctx) ->
    ctx ?= @
    @_subs = [] unless _.isArray @_subs
    if _.isFunction cb
      @_subs.push mediator.on name, _.bind cb, ctx
    else
      console.log "Warning: `cb` is not a function"

  publish: ->
    mediator.fire.apply mediator, arguments

  onteardown: ->
    if _.isArray @_subs
      for sub in @_subs
        if _.isFunction sub.cancel
          do sub.cancel
        else
          console.log "Warning: `sub.cancel` is not a function"