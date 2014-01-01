install:
	npm install
	bower install

build:
	grunt

minify:
	grunt minify

watch:
	watch --color -n 1 grunt

publish: build minify
	git checkout gh-pages
	git show master:build/app.bundle.min.js > app.bundle.min.js
	git show master:build/app.bundle.min.css > app.bundle.min.css
	git add .
	@status=$$(git status --porcelain); \
	if ! test "x$${status}" = x; then \
		git commit -m 'publish latest build to gh-pages'; \
		git push -u origin gh-pages; \
	fi
	git checkout master

test:
	./node_modules/.bin/mocha --compilers coffee:coffee-script --reporter spec --ui exports --timeout 20000 --slow 15000 --bail

.PHONY: build test