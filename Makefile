install:
	npm install
	bower install

build:
	grunt

watch:
	grunt
	grunt watch

serve:
	cd public; python -m SimpleHTTPServer 8000

deploy:
	firebase deploy

.PHONY: build