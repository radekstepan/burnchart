#!/usr/bin/env coffee
{ _ } = require 'lodash'

module.exports =    
    # Map closed issues ready to be visualized.
    # Assumes collection has been `filter`ed and is ordered.
    'closed': (collection, total, cb) ->
        cb null, _.map collection, ({ closed_at, size }) ->
            { x: +new Date(closed_at), y: total -= size }