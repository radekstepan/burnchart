mediator = require './mediator'

el = '#page'

route = (page, args...) ->
  Page = require "../views/pages/#{page}"
  new Page { el, 'data': { 'route': args } }

router = Router
  '/':                        _.partial route, 'index'
  '/new/project':             _.partial route, 'new'
  '/:owner/:name':            _.partial route, 'project'
  '/:owner/:name/:milestone': _.partial route, 'chart'
  # TODO: remove in production.
  '/reset': ->
    mediator.fire '!projects/clear'
    window.location.hash = '#'
  '/notify': ->
    mediator.fire '!app/loading', yes
    mediator.fire '!app/notify', 'You did something real good', 'warn'
    window.location.hash = '#'

module.exports = ->
  # Init the routes.
  router.init '/'
  router