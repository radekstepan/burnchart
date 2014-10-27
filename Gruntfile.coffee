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
      css:
        src: [
          # Vendor dependencies.
          'node_modules/normalize.css/normalize.css'
          # Our style.
          'public/css/app.css'
        ]
        dest: 'public/css/app.bundle.css'

    uglify:
      bundle:
        files:
          'public/js/app.bundle.min.js': 'public/js/app.bundle.js'

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
    'concat:css'
  ])

  # Cleanup public directories.
  grunt.registerTask('init', [
    'clean'
    'mkdir'
  ])  

  # Minify JS, CSS and concat JS.
  grunt.registerTask('minify', [
    'uglify'
    'cssmin'
  ])