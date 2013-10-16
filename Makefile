test:
	./node_modules/.bin/mocha --compilers coffee:coffee-script --reporter spec --ui exports --bail

publish:
	git checkout gh-pages
	git show master:build/build.js > build.js
	git show master:build/build.css > build.css
	git add .
	@status=$$(git status --porcelain); \
	if ! test "x$${status}" = x; then \
		git commit -m 'publish latest build to gh-pages'; \
		git push -u origin gh-pages; \
	fi
	git checkout master

.PHONY: test