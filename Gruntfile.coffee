module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON("package.json")
        
        apps_c:
            commonjs:
                src: [ 'src/**/*.{coffee,mustache}' ]
                dest: 'build/app.js'
                options:
                    main: 'src/app.coffee'

        stylus:
            compile:
                src: [
                    'src/styles/fonts.styl'
                    'src/styles/icons.styl'
                    'src/styles/app.styl'
                ]
                dest: 'build/app.css'

        concat:            
            scripts:
                src: [
                    # Vendor dependencies.
                    'vendor/jquery/jquery.js'
                    'vendor/lodash/dist/lodash.js'
                    'vendor/async/lib/async.js'
                    'vendor/ractive/ractive.js'
                    # Our app.
                    'build/app.js'
                ]
                dest: 'build/app.bundle.js'
                options:
                    separator: ';' # for minification purposes

            styles:
                src: [
                    # Vendor dependencies.
                    'vendor/normalize-css/normalize.css'
                    # Our style.
                    'build/app.css'
                ]
                dest: 'build/app.bundle.css'

        uglify:
            scripts:
                files:
                    'build/app.min.js': 'build/app.js'
                    'build/app.bundle.min.js': 'build/app.bundle.js'

        cssmin:
            combine:
                files:
                    'build/app.min.css': 'build/app.css'
                    'build/app.bundle.min.css': 'build/app.bundle.css'

    grunt.loadNpmTasks('grunt-apps-c')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')

    grunt.registerTask('default', [
        'apps_c'
        'stylus'
        'concat'
    ])

    grunt.registerTask('minify', [
        'uglify'
        'cssmin'
    ])