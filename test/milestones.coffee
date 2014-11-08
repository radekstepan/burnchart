{ assert } = require 'chai'
moment     = require 'moment'

module.exports =

  'milestones - time format': (done) ->
    json = require './fixtures/milestones.json'

    # ISO 8601 dates are in UTC timezone.
    utc = do moment(json[0].created_at).toDate().toUTCString
    assert utc, 'Sun, 10 Apr 2011 20:09:31 GMT'

    do done