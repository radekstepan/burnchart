# All our vendor dependencies in one place.
module.exports =
  '_': window._
  'Ractive': window.Ractive
  'Firebase': window.Firebase
  'FirebaseSimpleLogin': window.FirebaseSimpleLogin
  'SuperAgent': window.superagent
  'async': window.async
  'moment': window.moment
  'd3': window.d3
  'marked': window.marked
  'director':
    'Router': window.Router
  'lscache': window.lscache
  'sortedIndexCmp': window.sortedIndex
  'semver': require 'semver'