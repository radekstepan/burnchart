module.exports = (grunt) ->
  grunt.initConfig
    
    pkg: grunt.file.readJSON("package.json")

    'clean':
      public: [
        'public/js'
        'public/css'
      ]
      pages: [
        '.grunt'
      ]

    'mkdir':
      all:
        options:
          create: [
            'public/js'
            'public/css'
          ]

    'uglify':
      bundle:
        files:
          'public/js/app.bundle.min.js': 'public/js/app.bundle.js'

    'cssmin':
      bundle:
        files:
          'public/css/app.bundle.min.css': 'public/css/app.bundle.css'

    'gh-pages':
      options:
        base: 'public'
        branch: 'gh-pages'
        message: 'Publish to GitHub Pages'
        push: yes
        add: yes
      src: [
        'css/**/*'
        'fonts/**/*'
        'img/**/*'
        'js/**/*'
      ]

  grunt.loadNpmTasks('grunt-mkdir')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-gh-pages')

  # Cleanup public directories.
  grunt.registerTask('init', [
    'clean:public'
    'mkdir'
  ])  

  # Minify JS, CSS and concat JS.
  grunt.registerTask('minify', [
    'uglify'
    'cssmin'
  ])

  # Publish to GitHub Pages.
  grunt.registerTask('pages', [
    'gh-pages'
    'clean:pages'
  ])