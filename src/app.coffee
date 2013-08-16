#!/usr/bin/env coffee
{ Repos } = require './repos'

module.exports = ->
    # A new repo collection.
    collection = new Repos()
    # Get the coll/config.
    collection.fetch (err) ->
        throw err if err
        # Use the head.
        repo = collection.at(0)
        # Render the repo.
        repo.render (err) ->
            throw err if err