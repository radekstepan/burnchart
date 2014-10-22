install:
	npm install
	bower install

build-app:
	./node_modules/.bin/browserify -e ./src/app.coffee -o public/js/app.js -d

watch-app:
	./node_modules/.bin/watchify -e ./src/app.coffee -o public/js/app.js -d	

build:
	build-app
	grunt

serve:
	cd public; python -m SimpleHTTPServer 8000

deploy:
	firebase deploy

.PHONY: build