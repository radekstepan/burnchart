BROWSERIFY = ./node_modules/.bin/browserify
WATCH      = ./node_modules/.bin/watchify
SERVER     = ./node_modules/.bin/static
MOCHA      = ./node_modules/.bin/mocha
COVERALLS  = ./node_modules/.bin/coveralls
GRUNT      = grunt

# Install dependencies.
install:
	npm install

watch:
	$(MAKE) watch-js & $(MAKE) watch-css

# Watch the app.
watch-js:
	$(WATCH) -e ./src/app.coffee -o public/js/app.bundle.js -d	-v

# Watch the styles.
watch-css:
	$(GRUNT) watch

# Serve locally.
serve:
	$(SERVER) public -H '{"Cache-Control": "no-cache, must-revalidate"}'

# Make a minified package.
build:
	$(GRUNT) init
	$(BROWSERIFY) -e ./src/app.coffee -o public/js/app.bundle.js
	$(GRUNT) css
	$(GRUNT) minify

# Publish to GitHub Pages.
publish:
	$(GRUNT) gh-pages

OPTS = --compilers coffee:coffee-script/register --ui exports --timeout 20000 --slow 15000 --bail

# Run mocha test.
test:
	REPORTER = spec
	$(MOCHA) $(OPTS) --reporter $(REPORTER)

# Run code coverage.
coverage:
	$(MOCHA) $(OPTS) --reporter $(REPORTER) --require blanket > docs/COVERAGE.html

# Run code coverage and publish to coveralls.
coveralls:
	$(MOCHA) $(OPTS) --reporter $(REPORTER) --require blanket | COVERALLS_SERVICE_NAME=MOCHA $(COVERALLS)

.PHONY: test