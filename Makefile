BROWSERIFY = ./node_modules/.bin/browserify
WATCHIFY   = ./node_modules/.bin/watchify
LESS       = ./node_modules/.bin/lessc
WATCH      = ./node_modules/.bin/watch
SERVER     = ./node_modules/.bin/static
MOCHA      = ./node_modules/.bin/mocha
COVERALLS  = ./node_modules/.bin/coveralls
GRUNT      = grunt

# Install dependencies.
install:
	npm install

watch:
	${MAKE} watch-js & ${MAKE} watch-css

# Watch the app.
watch-js:
	${WATCHIFY} -e ./src/app.coffee -o public/js/app.bundle.js -d -v

# Watch the styles.
watch-css:
	${MAKE} build-css
	${WATCH} "${MAKE} build-css" src/styles

# Serve locally.
serve:
	${SERVER} public -H '{"Cache-Control": "no-cache, must-revalidate"}'

# Make a minified package.
build:
	${GRUNT} init
	${MAKE} build-js
	${MAKE} build-css
	${GRUNT} minify

build-js:
	${BROWSERIFY} -e ./src/app.coffee -o public/js/app.bundle.js

# Use less on index style.
build-css:
	${LESS} src/styles/burnchart.less > public/css/app.bundle.css	

# Publish to GitHub Pages.
publish:
	${GRUNT} pages

OPTS = --compilers coffee:coffee-script/register --ui exports

# Run mocha test.
test:
	${MOCHA} ${OPTS} --reporter spec

# Run code coverage.
coverage:
	${MOCHA} ${OPTS} --reporter html-cov --require blanket > docs/COVERAGE.html

# Run code coverage and publish to coveralls.
coveralls:
	${MOCHA} ${OPTS} --reporter mocha-lcov-reporter --require blanket | COVERALLS_REPO_TOKEN=$(TOKEN) COVERALLS_SERVICE_NAME=MOCHA ${COVERALLS}

.PHONY: test