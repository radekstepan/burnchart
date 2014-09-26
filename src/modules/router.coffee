mediator = require './mediator'

el = '#page'

route = (page, req, evt) ->
  Page = require "../views/pages/#{page}"
  new Page { el, 'data': { 'route': req.params } }

router =
  '':                _.partial route, 'index'
  'project/add':           _.partial route, 'addProject'
  'chart/:owner/:name/:milestone': _.partial route, 'showChart'
  # TODO: remove in production.
  'reset': ->
    mediator.fire '!projects/clear'
    window.location.hash = '#'
  'notify': ->
    mediator.fire '!app/loading', yes
    mediator.fire '!app/notify', 'You did something real good', 'warn'
    window.location.hash = '#'

module.exports = ->
  # Init the routes.
  Grapnel.listen router

  router