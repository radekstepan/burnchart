WATCHIFY   = ./node_modules/.bin/watchify
WATCH      = ./node_modules/.bin/watch
LESS       = ./node_modules/.bin/lessc
BROWSERIFY = ./node_modules/.bin/browserify
UGLIFY     = ./node_modules/.bin/uglifyjs
MOCHA      = ./node_modules/.bin/mocha
NAME       = $(shell node -e "console.log(require('./package.json').name)")

watch-js:
	${MAKE} build-js
	${WATCHIFY} -e -s $(NAME) ./src/js/index.jsx -t babelify -o public/js/bundle.js -d -v

watch-css:
	${MAKE} build-css
	${WATCH} "${MAKE} build-css" src/less

watch:
	${MAKE} watch-js & ${MAKE} watch-css

build-js:
	${BROWSERIFY} -e -s $(NAME) ./src/js/index.jsx -t babelify | ${UGLIFY} - > public/js/bundle.js

build-css:
	${LESS} src/less/burnchart.less > public/css/bundle.css

build:
	${MAKE} build-js
	${MAKE} build-css

test:
	${MOCHA} --compilers js:babel/register --ui exports --timeout 5000 --bail --reporter spec

.PHONY: test