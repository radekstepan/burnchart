mediator = require './mediator'
state    = require '../models/state'

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
    window.location.hash = '#'
    state.set 'loading', yes

module.exports = ->
  # Init the routes.
  Grapnel.listen router

  router