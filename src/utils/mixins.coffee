_.mixin
  'pluckMany': (source, keys) ->
    throw '`keys` needs to be an Array' unless _.isArray keys
    _.map source, (item) ->
      obj = {}
      _.each keys, (key) ->
        obj[key] = item[key]
      obj