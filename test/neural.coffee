{ assert } = require 'chai'
Chance     = require 'chance'
brain = require 'brain'
_     = require 'lodash'
d3    = require 'd3'

chance = new Chance()

module.exports =

  'neural net - detect sine chart type': (done) ->
    fns =
      # A "rough" sine wave.
      sine: (x) -> Math.sin chance.floating 'min': Math.max(x - 1, 0), 'max': x + 1
      # A linear function.
      linear: (x) -> ( chance.floating 'min': Math.max(x - 1, 0), 'max': x + 1 ) + 2

    # Generate sample data points.
    samples = 10
    data = _.map [ 0 ... 10 ], (i) ->
      fn = fns[ [ 'linear', 'sine' ][ sine = +(i < (samples / 2)) ] ]
      points = ( fn(j) for j in [ 0 ... 100 ] )
      { points, sine }

    # Scale the data to just 6 points.
    for chart in data then do (chart) ->
      step = Math.round (len = chart.points.length) / 5
      chart.points = ( chart.points[ Math.min(i, len - 1) ] for i in _.range(0, len + step, step) )

    # Scale the values for each chart.
    for chart in data then do (chart) ->
      scale = d3.scale.linear().range([ 0, 1 ]).domain([ d3.min(chart.points), d3.max(chart.points) ])
      chart.points = _.map chart.points, scale

    # Split the dataset.
    training = data[ 1...9 ]
    testing  = [ data[0] ].concat data[9]

    net = new brain.NeuralNetwork()

    keys = [ 0, 0.2, 0.4, 0.6, 0.8, 1 ]
    input = for chart in training then do (chart) ->
      'input': _.zipObject keys, chart.points
      'output':
        'sine': chart.sine
    
    net.train input,
      'errorThresh':  0.005 # error threshold to reach
      'iterations':   5e4   # maximum training iterations
      'log':          no    # console.log() progress periodically
      'logPeriod':    1e3   # number of iterations between logging
      'learningRate': 0.2   # learning rate

    # Now test it.
    for sample in testing
      out = net.run _.zipObject keys, sample.points
      assert sample.sine is Math.round(out.sine), "Network says #{out.sine} but sample says #{sample.sine}"

    do done