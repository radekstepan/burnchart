#!/usr/bin/env coffee
{ _ } = require 'lodash'

reg   = require './regex'

module.exports =    
    # Map closed issues ready to be visualized by Rickshaw.
    # Assumes collection has been `filter`ed and is ordered.
    'actual': (collection, created_at, total, cb) ->
        head = [ { x: +new Date(created_at) / 1e3, y: total } ]
        rest = _.map collection, ({ closed_at, size }) ->
            { x: +new Date(closed_at) / 1e3, y: total -= size }
        cb null, head.concat rest

    # Map ideal velocity for each day ready to be visualized by Rickshaw.
    'ideal': (a, b, total, cb) ->
        # Swap?
        [ b, a ] = [ a, b ] if b < a

        # When do we start & end?
        [ year, month, day ] = _.map(a.match(reg.datetime)[1].split('-'), (d) -> parseInt(d) )
        b = b.match(reg.datetime)[1]

        # The head/tail are quite specific.
        head = { x: +new Date(a) / 1e3, y: total }
        tail = { x: b = +new Date(b) / 1e3, y: 0 }

        # The fillers...
        days = []
        do add = (i = 1) ->
            # Lunchtime to "handle" daylight saving.
            c = +new Date year, month - 1, day + i, 12
            # Add the time point.
            days.push { x: c / 1e3 }
            # Moar?
            add(i + 1) if c < b

        # Daily velocity needed.
        daily = total / (days.length + 1)
        # Map points to days.
        days = _.map days, (day) ->
            day.y = total -= daily
            day

        cb null, [ head ].concat(days).concat([ tail ])