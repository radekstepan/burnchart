fs = require "fs" # I/O
cs = require 'coffee-script' # take a guess
yaml = require 'js-yaml' # YAML to JS

# ANSI Terminal colors.
COLORS =
    BOLD:    '\u001b[0;1m'
    RED:     '\u001b[0;31m'
    GREEN:   '\u001b[0;32m'
    BLUE:    '\u001b[0;34m'
    YELLOW:  '\u001b[0;33m'
    DEFAULT: '\u001b[0m'

# --------------------------------------------

# Compile.
task "compile", "compile .coffee to .js", (options) ->

    console.log "#{COLORS.BOLD}Compiling#{COLORS.DEFAULT}"

    fs.readFile "paths.yml", "utf8", (err, data) ->
        if err
            console.log "#{COLORS.RED}#{err}#{COLORS.DEFAULT}" ; return
        try
            #paths = JSON.stringify yaml.load data
            js = cs.compile fs.readFileSync('burndown.coffee', "utf-8"), bare: "on"
            write 'js/burndown.js', "(function() {\n#{js}\n}).call(this);"
      
            # We are done.
            console.log "#{COLORS.GREEN}Done#{COLORS.DEFAULT}"

        catch err
            console.log "#{COLORS.RED}#{err}#{COLORS.DEFAULT}" ; return

# Append to existing file.
write = (path, text, mode = "w") ->
    fs.open path, mode, 0o0666, (e, id) ->
        if e then throw new Error(e)
        fs.write id, text, null, "utf8"