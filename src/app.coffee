#!/usr/bin/env coffee
async    = require 'async'
{ _ }    = require 'lodash'

config = require './modules/config'
regex  = require './modules/regex'
render = require './modules/render'
repo   = require './modules/repo'

# Check for a route.
route = ->
    # Do we have a location match?
    if match = window.location.hash.match regex.location
        # Get the user/repo pair then.
        path = match[1..3].join('/')

        # Say we are loading this repo then.
        render 'body', 'loading', { path }

        # Get config/cache.
        return async.waterfall [ config
        # Render this repo.
        , (conf, cb) ->
            repo _.extend({ path }, conf), cb
        ], (err) ->
            render 'body', 'error', { 'text': err.toString() } if err

    # Info notice for you.
    render 'body', 'info'

module.exports = ->
    # Do we have browser support?
    if 'onhashchange' of window and 'hash' of window.location
        # Detect route changes.
        window.addEventListener 'hashchange', route, no
        # And route now.
        return do route

    render 'body', 'error', { 'text': 'URL fragment identifier not supported' }