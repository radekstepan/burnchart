#!/usr/bin/env coffee
proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'

req = {}

config = proxy path.resolve(__dirname, '../src/modules/config.coffee'),
    './request': req

{ size_label } = require path.resolve __dirname, '../src/modules/regex.coffee'

module.exports =

    'config - is null': (done) ->
        req.config = (cb) ->
            cb null, null

        config (err, cfg) ->
            assert.ifError err
            assert.deepEqual cfg,
                'host': 'api.github.com'
                'protocol': 'https'
                'size_label': new RegExp size_label
            do done

    'config - is empty': (done) ->
        req.config = (cb) ->
            cb null, {}

        config (err, cfg) ->
            assert.ifError err
            assert.deepEqual cfg,
                'host': 'api.github.com'
                'protocol': 'https'
                'size_label': new RegExp size_label
            do done

    'config - custom size label': (done) ->
        size = '/^taille (\d+)$/'

        req.config = (cb) ->
            cb null, { 'size_label': size }

        config (err, cfg) ->
            assert.ifError err
            assert.deepEqual cfg,
                'host': 'api.github.com'
                'protocol': 'https'
                'size_label': new RegExp size
            do done

    'config - custom valid protocol': (done) ->
        req.config = (cb) ->
            cb null, { 'protocol': 'http' }

        config (err, cfg) ->
            assert.ifError err
            assert.deepEqual cfg,
                'host': 'api.github.com'
                'protocol': 'http'
                'size_label': new RegExp size_label
            do done

    'config - custom invalid protocol': (done) ->
        req.config = (cb) ->
            cb null, { 'protocol': 'nntp' }

        config (err, cfg) ->
            assert.equal err, 'Config field `protocol` misconfigured'
            assert.equal cfg, null
            do done

    'config - custom invalid off days': (done) ->
        req.config = (cb) ->
            cb null, { 'off_days': [ 0 ] }

        config (err, cfg) ->
            assert.equal err, 'Config field `off_days` misconfigured'
            assert.equal cfg, null
            do done