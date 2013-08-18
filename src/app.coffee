#!/usr/bin/env coffee
async    = require 'async'
{ _ }    = require 'lodash'
Router   = require 'route66'

config   = require './modules/config'
{ Repo } = require './modules/repo'

# Render an eco template into selector.
show = (selector, template, context = {}) ->
    tml = require "./templates/#{template}"
    document.querySelector(selector).innerHTML = tml context

module.exports = ->
    # Show info notice?
    show 'body', 'info' unless location.hash

    # A new router.
    new Router().path
        '/:user/:repo': ->
            repo = _.toArray(arguments).join('/')

            # Render the body.
            show 'body', 'graph'

            # Get config/cache.
            async.waterfall [ config
            # Instantiate.
            , (conf, cb) ->
                cb null, new Repo _.extend { repo }, conf
            # Render.
            , (repo, cb) ->
                repo.render cb
            ], (err) ->
                throw err if err