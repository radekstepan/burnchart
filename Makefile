# Install dependencies.
install:
	npm install
	bower install

# Build the app for production.
build-app:
	./node_modules/.bin/browserify -e ./src/app.coffee -o public/js/app.js

# Watch the app sources and build with source maps.
watch-app:
	./node_modules/.bin/watchify -e ./src/app.coffee -o public/js/app.js -d	-v

# Build vendor libs and styles.
build-vendor:
	grunt

# Serve locally.
serve:
	cd public; python -m SimpleHTTPServer 8000

# Make and publish a minified package.
publish:
	grunt init
	make build-app
	make build-vendor
	grunt minify
	firebase deploy