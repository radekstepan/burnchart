#!/usr/bin/env coffee
async    = require 'async'
{ _ }    = require 'lodash'

config   = require './modules/config'
render   = require './modules/render'
{ Repo } = require './modules/repo'

route = ->
    if match = window.location.hash.match /^#!\/(.+)\/(.+)$/
        repo = match[1..3].join('/')

        # We are loading.
        render 'body', 'loading', { repo }

        # Get config/cache.
        return async.waterfall [ config
        # Instantiate.
        , (conf, cb) ->
            cb null, new Repo _.extend { repo }, conf
        # Render.
        , (repo, cb) ->
            repo.render cb
        ], (err) ->
            render 'body', 'error', { text: err.toString() } if err

    # Info notice for you.
    render 'body', 'info'

module.exports = ->
    # Do we have browser support?
    if 'onhashchange' of window and 'hash' of window.location
        # Detect route changes.
        window.addEventListener 'hashchange', route, no
        # And route now.
        return do route

    render 'body', 'error', { text: 'URL fragment identifier not supported' }