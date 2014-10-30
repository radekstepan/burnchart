proxy  = do require('proxyquire').noCallThru
assert = require 'assert'
path   = require 'path'
_      = require 'lodash'

projects = proxy path.resolve(__dirname, '../src/models/projects.coffee'),
  # Just return the stats that are on the milestone already.
  '../modules/stats.coffee': ({ stats }) -> stats

module.exports =

  'projects - initializes empty': (done) ->
    assert.deepEqual projects.data.list, [ ]
    do done

  'projects - sorts on new milestones': (done) ->
    do projects.clear

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone = 'title': '1.0.0'

    projects.push 'list', project
    projects.addMilestone project, milestone

    assert.deepEqual projects.data.index, [ [ 0, 0 ] ]

    do done

  'projects - sort by progress': (done) ->
    do projects.clear

    projects.set 'sortBy', 'progress'

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone1 = 'title': '1.0.0', 'stats': {
      'progress': { 'points': 5 }
    }
    milestone2 = 'title': '2.0.0', 'stats': {
      'progress': { 'points': 7 }
    }

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2

    assert.deepEqual projects.data.index, [ [ 0, 1 ], [ 0, 0 ] ]

    do done

  # (points - time) * days
  'projects - sort by priority': (done) ->
    do projects.clear

    projects.set 'sortBy', 'priority'

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone1 = 'title': '1.0.0', 'stats': {
      'progress': { 'points': 2, 'time': 1 }
      'days': 2
    }
    milestone2 = 'title': '2.0.0', 'stats': {
      'progress': { 'points': 2, 'time': 1 }
      'days': 3
    }
    milestone3 = 'title': '3.0.0', 'stats': {
      'progress': { 'points': 1, 'time': 2 }
      'days': 4
    }

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2
    projects.addMilestone project, milestone3

    assert.deepEqual projects.data.index, [ [ 0, 2 ], [ 0, 0 ], [ 0, 1 ] ]

    do done

  # (points - time) * days
  'projects - sort by priority defaults': (done) ->
    do projects.clear

    projects.set 'sortBy', 'priority'

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone1 = 'title': '1.0.0', 'stats': {
      'progress': { 'points': 3 }
    }
    milestone2 = 'title': '2.0.0', 'stats': {
      'progress': { 'points': 2 }
    }
    milestone3 = 'title': '3.0.0', 'stats': {
      'progress': { 'points': 1 }
    }

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2
    projects.addMilestone project, milestone3

    assert.deepEqual projects.data.index, [ [ 0, 2 ], [ 0, 1 ], [ 0, 0 ] ]

    do done

  'projects - sort by name': (done) ->
    do projects.clear

    projects.set 'sortBy', 'name'

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone1 = 'title': 'B'
    milestone2 = 'title': 'A'

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2

    assert.deepEqual projects.data.index, [ [ 0, 1 ], [ 0, 0 ] ]

    do done

  'projects - sort by name semver': (done) ->
    do projects.clear

    projects.set 'sortBy', 'name'

    project = { 'owner': 'radekstepan', 'name': 'burnchart' }
    milestone1 = 'title': '1.2.5'
    milestone2 = 'title': '1.1.x'
    milestone3 = 'title': '1.1.7'

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2
    projects.addMilestone project, milestone3

    assert.deepEqual projects.data.index, [ [ 0, 2 ], [ 0, 1 ], [ 0, 0 ] ]

    do done