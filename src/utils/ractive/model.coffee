Eventful = require './eventful.coffee'

module.exports = (opts) ->
  Model = Eventful.extend(opts)
  model = new Model()
  model.render()
  model