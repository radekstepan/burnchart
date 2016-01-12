{ assert } = require 'chai'
moment     = require 'moment'

request = require '../src/modules/github/request.coffee'
issues  = require '../src/modules/github/issues.coffee'
config  = require '../src/models/config.coffee'

repo = { 'owner': 'radekstepan', 'name': 'burnchart', 'milestone': 1 }

module.exports =

  'issues - time format': (done) ->
    json = require './fixtures/issues.json'

    # ISO 8601 dates are in UTC timezone.
    utc = do moment(json[0].created_at).toDate().toUTCString
    assert utc, 'Fri, 22 Apr 2011 13:33:48 GMT'

    do done

  'issues - all empty': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb null, []

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 2
      assert.strictEqual open.size, 0
      assert.strictEqual closed.size, 0
      do done

  'issues - open empty': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb null, if called is 1 then [] else [
        { number: 1 }
      ]

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 2
      assert.strictEqual open.size, 0
      assert.strictEqual open.list.length, 0
      assert closed.size, 1
      assert closed.list.length, 1
      do done

  'issues - closed empty': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb null, if called is 2 then [] else [
        { number: 1 }
      ]

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 2
      assert open.size, 1
      assert.strictEqual closed.size, 0
      do done

  'issues - both not empty': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb null, [ { number: 1 } ]

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 2
      assert open.size, 1
      assert closed.size, 1
      do done

  'issues - 99 results on a page': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb null, ( { number: i } for i in [ 0...99 ] )

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 2
      assert open.size, 99
      assert closed.size, 99
      do done

  'issues - 100 results on a page': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      assert opts.page in [ 1, 2 ]
      cb null, if opts.page is 1 then ( { number: i } for i in [ 0...100 ] ) else []

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 4
      assert open.size, 100
      assert closed.size, 100
      do done

  'issues - 101 total results': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      assert opts.page in [ 1, 2 ]
      cb null, if opts.page is 1
        ( { number: i } for i in [ 0...100 ] )
      else
        [ { number: 100 } ]

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 4
      assert open.size, 101
      assert closed.size, 101
      assert.deepEqual open.list[100], { number: 100, size: 1 }
      assert.deepEqual closed.list[100], { number: 100, size: 1 }
      do done

  'issues - 201 total results': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      assert opts.page in [ 1, 2, 3 ]
      cb null, if opts.page in [ 1, 2 ]
        ( { number: i } for i in [ (h = 100 * (opts.page - 1))...h + 100 ] )
      else
        [ { number: 200 } ]

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert called, 6
      assert open.size, 201
      assert closed.size, 201
      for { list } in [ open, closed ]
        for j in [ 100, 200 ]
          assert.deepEqual list[j], { number: j, size: 1 }
      do done

  'issues - get all when not found': (done) ->
    called = 0
    request.allIssues = (repo, opts, cb) ->
      called += 1
      cb 'Not Found'

    config.set 'chart.points', 'ONE_SIZE'

    issues.fetchAll repo, (err, { open, closed }) ->
      assert err, 'Not Found'
      assert called, 1
      do done

  'issues - size based on a label': (done) ->
    config.set 'chart.points', 'LABELS'

    request.allIssues = (repo, opts, cb) ->
      cb null, [
        { labels: [ { name: 'size 2' } ] }
        { labels: [ { name: 'size 10' } ] }
        { labels: [ { name: 'size A' } ] }
      ]

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert open.size, 12
      assert open.list[0].size, 2
      do done

  'issues - filter when no labels': (done) ->
    config.set 'chart.points', 'LABELS'

    request.allIssues = (repo, opts, cb) ->
      cb null, [ { } ]

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert.strictEqual open.size, 0
      do done  

  'issues - filter when empty labels': (done) ->
    config.set 'chart.points', 'LABELS'

    request.allIssues = (repo, opts, cb) ->
      cb null, [ { labels: [] } ]

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert.strictEqual open.size, 0
      do done 

  'issues - filter when not matching regex': (done) ->
    config.set 'chart.points', 'LABELS'

    request.allIssues = (repo, opts, cb) ->
      cb null, [ { labels: [ { name: 'size 1A' } ] } ]

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert.strictEqual open.size, 0
      do done

  'issues - filter when multiple match the regex': (done) ->
    config.set 'chart.points', 'LABELS'

    request.allIssues = (repo, opts, cb) ->
      cb null, [
        { labels: [ { name: 'size 1' }, { name: 'size 6' } ] }
        { labels: [ { name: 'size really big' }, { name: 'size 4' } ] }
      ]

    issues.fetchAll repo, (err, { open, closed }) ->
      assert.isNull err
      assert open.size, 11
      [ a, b ] = open.list
      assert a.size, 7
      assert b.size, 4
      do done