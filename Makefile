install:
	npm install
	bower install

build:
	grunt

watch:
	grunt
	grunt watchify

serve:
	cd public; python -m SimpleHTTPServer 8000

deploy:
	firebase deploy

.PHONY: build