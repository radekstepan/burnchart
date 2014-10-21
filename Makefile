install:
	npm install
	bower install

build:
	./node_modules/.bin/browserify -e ./src/app.coffee -o public/js/app.js -d
	grunt

serve:
	cd public; python -m SimpleHTTPServer 8000

deploy:
	firebase deploy

.PHONY: build