module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON("package.json")
        
        apps_c:
            commonjs:
                src: [ 'src/**/*.{coffee,js,eco}' ]
                dest: 'build/app.js'
                options:
                    main: 'src/app.coffee'
                    name: [ 'ghbc', 'ghb', 'github-burndown-chart' ]

        stylus:
            compile:
                options:
                    paths: [ 'src/styles/app.styl' ]
                files:
                    'build/app.css': 'src/styles/app.styl'

        concat:            
            scripts:
                src: [
                    # Vendor dependencies.
                    'vendor/async/lib/async.js'
                    'vendor/d3/d3.js'
                    'vendor/d3-tip/index.js'
                    'vendor/lodash/dist/lodash.js'
                    'vendor/marked/lib/marked.js'
                    'vendor/superagent/superagent.js'
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
                    # Our styles.
                    'src/styles/fonts.css'
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