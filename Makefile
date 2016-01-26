WATCHIFY   = ./node_modules/.bin/watchify
WATCH      = ./node_modules/.bin/watch
LESS       = ./node_modules/.bin/lessc
BROWSERIFY = ./node_modules/.bin/browserify
UGLIFY     = ./node_modules/.bin/uglifyjs
CLEANCSS   = ./node_modules/.bin/cleancss
MOCHA      = ./node_modules/.bin/mocha
BIN        = ./bin/burnchart.js

MOCHA-OPTS = --compilers js:babel-register --ui exports --timeout 5000 --bail

start:
	${BIN}

start-dev:
	${BIN} --dev

watch-js: build-js
	${WATCHIFY} -e -s burnchart ./src/js/index.jsx -t babelify -o public/js/bundle.js -d -v

watch-css: build-css
	${WATCH} "${MAKE} build-css" src/less

watch:
	${MAKE} watch-js & ${MAKE} watch-css

build-js:
	${BROWSERIFY} -e -s burnchart ./src/js/index.jsx -t babelify > public/js/bundle.js

build-css:
	${LESS} src/less/burnchart.less > public/css/bundle.css

build: build-js build-css

minify-js:
	${UGLIFY} public/js/bundle.js > public/js/bundle.min.js

minify-css:
	${CLEANCSS} public/css/bundle.css > public/css/bundle.min.css

test:
	${MOCHA} ${MOCHA-OPTS} --reporter spec

.PHONY: test
