#!/usr/bin/env coffee
proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'

req = {}

regex = require path.resolve(__dirname, '../src/modules/regex.coffee')

issues = proxy path.resolve(__dirname, '../src/modules/issues.coffee'),
    './request': req

repo = { 'milestone': { 'number': no } }

module.exports =

    'issues - all empty': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, []

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 0
            assert.equal closed.length, 0
            do done

    'issues - open empty': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, if called is 1 then [] else [
                { number: 1 }
            ]

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 0
            assert.equal closed.length, 1
            do done

    'issues - closed empty': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, if called is 2 then [] else [
                { number: 1 }
            ]

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 1
            assert.equal closed.length, 0
            do done

    'issues - both not empty': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, [ { number: 1 } ]

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 1
            assert.equal closed.length, 1
            do done

    'issues - 99 results on a page': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, ( { number: i } for i in [ 0...99 ] )

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 2
            assert.equal open.length, 99
            assert.equal closed.length, 99
            do done

    'issues - 100 results on a page': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            assert opts.page in [ 1, 2 ]
            cb null, if opts.page is 1 then ( { number: i } for i in [ 0...100 ] ) else []

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 4
            assert.equal open.length, 100
            assert.equal closed.length, 100
            do done

    'issues - 101 total results': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            assert opts.page in [ 1, 2 ]
            cb null, if opts.page is 1
                ( { number: i } for i in [ 0...100 ] )
            else
                [ { number: 100 } ]

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 4
            assert.equal open.length, 101
            assert.equal closed.length, 101
            assert.deepEqual open[100], { number: 100 }
            assert.deepEqual closed[100], { number: 100 }
            do done

    'issues - 201 total results': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            assert opts.page in [ 1, 2, 3 ]
            cb null, if opts.page in [ 1, 2 ]
                ( { number: i } for i in [ (h = 100 * (opts.page - 1))...h + 100 ] )
            else
                [ { number: 200 } ]

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.ifError err
            assert.equal called, 6
            assert.equal open.length, 201
            assert.equal closed.length, 201
            for i in [ open, closed ]
                for j in [ 100, 200 ]
                    assert.deepEqual i[j], { number: j }
            do done

    'issues - get all when not found': (done) ->
        called = 0
        req.all_issues = (repo, opts, cb) ->
            called += 1
            cb null, { 'message': 'Not Found' }

        issues.get_all repo, (err, [ open, closed ]) ->
            assert.equal err, 'Not Found'
            assert.equal called, 1
            do done

    'issues - filter on existing label regex': (done) ->
        issues.filter [ { labels: [ { name: 'size 15' } ] } ]
        , regex.size_label, (err, warn, data) ->
            assert.ifError err
            assert.ifError warn
            assert.equal data.length, 1
            assert.equal data[0].size, 15
            do done

    'issues - filter when no labels': (done) ->
        issues.filter [ { } ]
        , regex.size_label, (err, warn, data) ->
            assert.ifError err
            assert.ifError warn
            assert.equal data.length, 0
            do done

    'issues - filter when empty labels': (done) ->
        issues.filter [ { labels: [] } ]
        , regex.size_label, (err, warn, data) ->
            assert.ifError err
            assert.ifError warn
            assert.equal data.length, 0
            do done

    'issues - filter when not matching regex': (done) ->
        issues.filter [ { labels: [ { name: 'size 1A' } ] } ]
        , regex.size_label, (err, warn, data) ->
            assert.ifError err
            assert.ifError warn
            assert.equal data.length, 0
            do done

    'issues - filter when multiple match the regex': (done) ->
        issues.filter [ { labels: [ { name: 'size 1' }, { name: 'size 6' } ] } ]
        , regex.size_label, (err, warn, data) ->
            assert.ifError err
            assert.equal warn.length, 1
            assert.equal data.length, 1
            do done