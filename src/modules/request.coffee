#!/usr/bin/env coffee
{ _ } = require 'lodash'

protocol = 'https'
domain   = 'api.github.com'
token    = ''

module.exports =
    'all_milestones': ({ user, repo }, cb) ->
        opts = { state: 'open', sort: 'due_date', direction: 'asc' }
        request { user, repo, opts, path: 'milestones' }, cb
    
    'all_issues': ({ user, repo }, cb) ->
        opts = _.extend {}, arguments[0], { per_page: '100', direction: 'asc' }
        request { user, repo, opts, path: 'issues' }, cb

# Make a request using SuperAgent.
request = ({ user, repo, path, opts }, cb) ->
    opts = ( "#{k}=#{v}" for k, v of opts when k not in [ 'user', 'repo' ] ).join('&')

    (require 'superagent')
    .get("#{protocol}://#{domain}/repos/#{user}/#{repo}/#{path}?#{opts}")
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/vnd.github.raw')
    .set('Authorization', "token #{token}")
    .end (err, data) ->
        cb err, data?.body