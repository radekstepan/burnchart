# Install dependencies.
install:
	npm install

# Watch the app sources and build with source maps.
watch:
	./node_modules/.bin/watchify -e ./src/app.coffee -o public/js/app.bundle.js -d	-v

# Serve locally.
serve:
	cd public; python -m SimpleHTTPServer 8000

# Make a minified package.
build:
	grunt init
	./node_modules/.bin/browserify -e ./src/app.coffee -o public/js/app.bundle.js
	grunt
	grunt minify

# Publish on Firebase or GitHub Pages.
publish:
	# firebase deploy -> http://burnchart.firebaseapp.com
	git subtree push --prefix public origin gh-pages

# Run mocha test.
test:
	./node_modules/.bin/mocha --compilers coffee:coffee-script/register --reporter spec --ui exports --timeout 20000 --slow 15000 --bail

.PHONY: test