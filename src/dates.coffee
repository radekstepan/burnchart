#!/usr/bin/env coffee
{ _ } = require 'lodash'
reg   = require './regex'

module.exports =
    # Create a range of days between two dates.
    'range': ({ a, b }, cb) ->
        # Swap?
        [ b, a ] = [ a, b ] if b < a

        # When do we start & end?
        [ year, month, day ] = _.map(a.match(reg.datetime)[1].split('-'), (d) -> parseInt(d) )
        b = b.match(reg.datetime)[1]

        days = []
        do add = (i = 0) ->
            days.push c = new Date(year, month - 1, day + i).toJSON().match(reg.datetime)[1]
            add(i + 1) unless c is b
        
        cb null, days