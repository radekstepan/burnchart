#!/usr/bin/env coffee
async    = require 'async'
{ _ }    = require 'lodash'
Router   = require 'route66'

config   = require './modules/config'
render   = require './modules/render'
{ Repo } = require './modules/repo'

module.exports = ->
    # Show info notice?
    render 'body', 'info' unless location.hash

    # A new router.
    new Router().path
        '/:user/:repo': ->
            repo = _.toArray(arguments).join('/')

            # Get config/cache.
            async.waterfall [ config
            # Instantiate.
            , (conf, cb) ->
                cb null, new Repo _.extend { repo }, conf
            # Render.
            , (repo, cb) ->
                repo.render cb
            ], (err) ->
                render 'body', 'error', { text: err.toString() } if err