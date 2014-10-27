_        = require 'lodash'
director = require 'director'

mediator = require './mediator.coffee'
system   = require '../models/system.coffee'

el = '#page'

pages =
  "index": require "../views/pages/index.coffee"
  "milestone": require "../views/pages/milestone.coffee"
  "new": require "../views/pages/new.coffee"
  "project": require "../views/pages/project.coffee"

# Add a project from a route.
addProject = (page, owner, name) ->
  mediator.fire '!projects/add', { owner, name }

# Preapply all functions with our page name/context.
c = (name, fns=[]) ->
  ( _.partial fn, name for fn in fns )

view = null
route = (page, args...) ->
  # Unrender the previous one.
  do view?.teardown
  # Hide any notifications.
  mediator.fire '!app/notify/hide'
  # Require the new one.
  Page = pages[page]
  # Render it.
  view = new Page { el, 'data': { 'route': args } }

routes =
  '/':                        c 'index', [ route ]
  '/new/project':             c 'new',   [ route ]
  # The following two routes add a project in the background.
  '/:owner/:name':            c 'project',   [ addProject, route ]
  '/:owner/:name/:milestone': c 'milestone', [ addProject, route ]
  # TODO: remove in production.
  '/reset': ->
    mediator.fire '!projects/clear'
    window.location.hash = '#'

# Flatiron Director router.
module.exports = director.Router(routes).configure
  'strict': no # allow trailing slashes
  notfound: ->
    throw 404