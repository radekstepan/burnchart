module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    clean: [
      'public/js'
      'public/css'
    ]

    mkdir:
      all:
        options:
          create: [
            'public/js'
            'public/css'
          ]

    stylus:
      app:
        src: [
          'src/styles/fonts.styl'
          'src/styles/icons.styl'
          'src/styles/chart.styl'
          'src/styles/notification.styl'
          'src/styles/app.styl'
        ]
        dest: 'public/css/app.css'

    concat:
      vendor:
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

      bundle:
        src: [
          'public/js/vendor.min.js'
          'public/js/app.min.js'
        ]
        dest: 'public/js/app.bundle.min.js'
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

    uglify:
      bundle:
        files:
          'public/js/app.min.js': 'public/js/app.js'
          'public/js/vendor.min.js': 'public/js/vendor.js'

    cssmin:
      bundle:
        files:
          'public/css/app.min.css': 'public/css/app.css'
          'public/css/app.bundle.min.css': 'public/css/app.bundle.css'

  grunt.loadNpmTasks('grunt-mkdir')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-stylus')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-cssmin')

  # Stylus to CSS, concat JS libs and all CSS.
  grunt.registerTask('default', [
    'stylus:app'
    'concat:vendor'
    'concat:css'
  ])

  # Cleanup public directories.
  grunt.registerTask('init', [
    'clean'
    'mkdir'
  ])  

  # Minify JS, CSS and concat JS.
  grunt.registerTask('minify', [
    'uglify:bundle'
    'cssmin:bundle'
    'concat:bundle'
  ])