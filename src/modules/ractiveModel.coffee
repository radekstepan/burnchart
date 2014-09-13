module.exports = (opts) ->
    Model = Ractive.extend(opts)
    model = new Model()
    model.render()
    model