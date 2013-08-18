#!/usr/bin/env coffee
async    = require 'async'
{ _ }    = require 'lodash'
Router   = require 'route66'

config   = require './modules/config'
{ Repo } = require './modules/repo'

module.exports = ->
    # A new router.
    new Router().path
        '/:user/:repo': ->
            repo = _.toArray(arguments).join('/')

            # Render the body.
            document.querySelector('body').innerHTML = do require('./templates/body')

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