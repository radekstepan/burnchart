#!/usr/bin/env coffee
{ _ } = require 'lodash'

dates = require './dates'

module.exports =    
    # Map closed issues ready to be visualized by Rickshaw.
    # Assumes collection has been `filter`ed and is ordered.
    'actual': (collection, total, cb) ->
        cb null, _.map collection, ({ closed_at, size }) ->
            { x: +new Date(closed_at) / 1e3, y: total -= size }

    # Map ideal velocity for each day ready to be visualized by Rickshaw.
    'ideal': (a, b, total, cb) ->
        # Swap?
        [ b, a ] = [ a, b ] if b < a

        # Generate the days in between.
        dates.range { a, b }, (err, data) ->
            return cb err if err

            # Daily velocity needed.
            daily = total / data.length
            # Map days to data points.
            data = _.map data, (day) ->
                { x: +new Date(day) / 1e3, y: total -= daily }

            cb null, data