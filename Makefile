install:
	npm install
	bower install

build:
	grunt

watch:
	watch --color -n 1 make build

serve:
	cd public; python -m SimpleHTTPServer 8000

.PHONY: build