assert = require 'assert'

projects = require '../src/models/projects.coffee'

module.exports =

  'projects - initializes empty': (done) ->
    assert.deepEqual projects.data.list, [ ]
    do done

  'projects - sorts on new milestones': (done) ->
    do projects.clear

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
    milestone = 'title': '1.0.0', 'stats': {}

    projects.push 'list', project
    projects.addMilestone project, milestone

    assert.deepEqual projects.data.index, [ [ 0, 0 ] ]

    do done

  'projects - sort by progress': (done) ->
    do projects.clear

    projects.set 'sortBy', 'progress'

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
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

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
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

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
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

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
    milestone1 = 'title': 'B', 'stats': {}
    milestone2 = 'title': 'A', 'stats': {}

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2

    assert.deepEqual projects.data.index, [ [ 0, 1 ], [ 0, 0 ] ]

    do done

  'projects - sort by name semver': (done) ->
    do projects.clear

    projects.set 'sortBy', 'name'

    project = { 'owner': 'asm-products', 'name': 'burnchart' }
    milestone1 = 'title': '1.2.5', 'stats': {}
    milestone2 = 'title': '1.1.x', 'stats': {}
    milestone3 = 'title': '1.1.7', 'stats': {}

    projects.push 'list', project
    projects.addMilestone project, milestone1
    projects.addMilestone project, milestone2
    projects.addMilestone project, milestone3

    assert.deepEqual projects.data.index, [ [ 0, 2 ], [ 0, 1 ], [ 0, 0 ] ]

    do done