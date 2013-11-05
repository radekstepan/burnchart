#!/usr/bin/env coffee
config = require './modules/config'
regex  = require './modules/regex'
render = require './modules/render'
repo   = require './modules/repo'

# Check for a route.
route = ->
    # Do we have a location match?
    if match = window.location.hash.match regex.location
        # User/repo/(milestone) path
        path = match[1][1...]

        # Say we are loading this repo then.
        render 'body', 'loading', { path }

        # Did we specify a milestone?
        [ u, r, m ] = path.split('/')
        opts = if m then { 'path': "#{u}/#{r}", 'milestone': m } else { path }

        # Get config/cache.
        return async.waterfall [ config
        # Render this repo.
        , (conf, cb) ->
            repo _.extend(opts, conf), cb
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