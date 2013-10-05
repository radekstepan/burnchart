#!/usr/bin/env coffee
module.exports =
    # How do we parse GitHub dates?
    'datetime': /^(\d{4}-\d{2}-\d{2})T(.*)/
    # How does a size label look like?
    'size_label': /^size (\d+)$/
    # How do we specify which user/repo we want?
    'location': /^#!\/([^\/]+)\/([^\/]+)$/