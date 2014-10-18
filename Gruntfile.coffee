module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    
    clean: [ 'public/js' ]

    browserify:
      commonjs:
        src: 'src/app.coffee'
        dest: 'public/js/app.bundle.js'
        options:
          transform: [
            # CoffeeScript.
            'coffeeify'
            # Mustaches.
            'ractivate'
          ]

    stylus:
      compile:
        src: [
          'src/styles/fonts.styl'
          'src/styles/icons.styl'
          'src/styles/chart.styl'
          'src/styles/notification.styl'
          'src/styles/app.styl'
        ]
        dest: 'public/css/app.css'

    concat:      
      scripts:
        src: [
          # CommonJS loader.
          'public/js/commonjs.js'
          # Vendor dependencies.
          'vendor/lodash/dist/lodash.js'
          'vendor/ractive/ractive.js'
          'vendor/ractive-transitions-fade/ractive-transitions-fade.js'
          'vendor/ractive-ractive/index.js'
          'vendor/firebase/firebase.js'
          'vendor/firebase-simple-login/firebase-simple-login.js'
          'vendor/superagent/superagent.js'
          'vendor/lscache/lscache.js'
          'vendor/async/lib/async.js'
          'vendor/moment/moment.js'
          'vendor/d3/d3.js'
          'vendor/d3-tip/index.js'
          'vendor/marked/lib/marked.js'
          'vendor/director/build/director.js'
          # Our app.
          'public/js/app.js'
        ]
        dest: 'public/js/app.bundle.js'
        options:
          separator: ';' # for minification purposes

      styles:
        src: [
          # Vendor dependencies.
          'vendor/normalize-css/normalize.css'
          # Our style.
          'public/css/app.css'
        ]
        dest: 'public/css/app.bundle.css'

    uglify:
      scripts:
        files:
          'public/js/app.min.js': 'public/js/app.js'
          'public/js/app.bundle.min.js': 'public/js/app.bundle.js'

    cssmin:
      combine:
        files:
          'public/css/app.min.css': 'public/css/app.css'
          'public/css/app.bundle.min.css': 'public/css/app.bundle.css'

    watchify:
      scripts:
        files: "src/**/*.*"
        tasks: [ "default" ]
        options:
          interrupt: true # interrupt build when a file has changed?
          debounceDelay: 250 # delay a bit
          livereload: true


  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-stylus')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-watchify')

  grunt.registerTask('default', [
    'clean'
    'browserify'
    'stylus'
    #'concat'
  ])

  grunt.registerTask('minify', [
    'uglify'
    'cssmin'
  ])