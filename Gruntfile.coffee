module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    stylus:
      style:
        src: [
          'src/styles/fonts.styl'
          'src/styles/icons.styl'
          'src/styles/chart.styl'
          'src/styles/notification.styl'
          'src/styles/app.styl'
        ]
        dest: 'public/css/app.css'

    concat:
      js:
        src: [
          # Vendor dependencies.
          'vendor/lodash/dist/lodash.js'
          'vendor/ractive/ractive.js'
          'vendor/ractive-transitions-fade/ractive-transitions-fade.js'
          'vendor/ractive-ractive/index.js'
          'vendor/firebase/firebase.js'
          'vendor/superagent/superagent.js'
          'vendor/lscache/lscache.js'
          'vendor/async/lib/async.js'
          'vendor/moment/moment.js'
          'vendor/d3/d3.js'
          'vendor/d3-tip/index.js'
          'vendor/marked/lib/marked.js'
          'vendor/director/build/director.js'
          'vendor/sorted-index-compare/index.js'
          'node-semver/semver.js'
        ]
        dest: 'public/js/vendor.js'
        options:
          separator: ';' # for minification purposes

      css:
        src: [
          # Vendor dependencies.
          'vendor/normalize-css/normalize.css'
          # Our style.
          'public/css/app.css'
        ]
        dest: 'public/css/app.bundle.css'

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-stylus')
  grunt.loadNpmTasks('grunt-contrib-concat')

  grunt.registerTask('default', [
    'stylus'
    'concat'
  ])