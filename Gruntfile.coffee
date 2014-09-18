module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON("package.json")
        
        apps_c:
            loader:
                dest: 'public/js/commonjs.js'

            commonjs:
                src: [ 'src/**/*.{coffee,js,json,mustache}' ]
                dest: 'public/js/app.js'
                options:
                    main: 'src/app.coffee'
                    loader: no

        stylus:
            compile:
                src: [
                    'src/styles/fonts.styl'
                    'src/styles/icons.styl'
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
                    'vendor/ractive-adaptor/adaptor.js'
                    'vendor/firebase/firebase.js'
                    'vendor/firebase-simple-login/firebase-simple-login.js'
                    'vendor/grapnel/src/grapnel.js'
                    'vendor/superagent/superagent.js'
                    'vendor/localforage/dist/localforage.js'
                    'vendor/async/lib/async.js'
                    'vendor/moment/moment.js'
                    'vendor/d3/d3.js'
                    'vendor/d3-tip/index.js'
                    'vendor/marked/lib/marked.js'
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

        watch:
            scripts:
                files: "src/**/*.*"
                tasks: [ "default" ]
                options:
                    interrupt: true # interrupt build when a file has changed?
                    debounceDelay: 250 # delay a bit
                    livereload: true


    grunt.loadNpmTasks('grunt-apps-c')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-watch')

    grunt.registerTask('default', [
        'apps_c'
        'stylus'
        'concat'
    ])

    grunt.registerTask('minify', [
        'uglify'
        'cssmin'
    ])