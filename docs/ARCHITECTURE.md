#Architecture

Captures how the app is build and what happens where.

##Build

Vendor libraries are fetched through npm. For CSS libs we `@import` them in LESS, for JS libs we `require` them using [Browserify](https://github.com/substack/node-browserify). All app dependencies are in `package.dependencies` rather than `package.devDependencies`, so that [David](https://david-dm.org/asm-products/burnchart) can see them and we get a nice icon if things go out of date.

##Code

###JavaScript

####Ractive

The app is written as a series of [Ractive](http://www.ractivejs.org/) components. We use the library for both views and models. The important bit is that we can observe changes on them. So that these changes propagate, we use the [ractive-ractive](https://github.com/rstacruz/ractive-ractive) plugin. This means that one ractive can be passed another ractive as a data attribute. All ractive components have a `name` attribute which makes it easier to debug them when things go wrong.

####Projects

The projects collection is a simple stack. When rendering it, we are actually working off an index. Index is a list of tuples where first value is an index of a project and the second is an index of a milestone. When sort order changes, we only change the index. `models/projects` has a map of functions which handle the different sort orders.

####Mediator Pattern

Whenever something happens that other components on the page should know about, we use the mediator component. It is accessible by extending the `utils/ractive/eventfull` *class*. You can then call `@subscribe(message, fn)` or `@publish(message, data...)`. Subscriptions are automatically cancelled on teardown.

####Config

All configuration lives in `models/config`.

####Router

All routes are handled via `modules/router`. There you can see that each route is prefixed with a context - name of the view which will handle it and a bunch of functions to execute. As an example, the project and milestone routes both add a project, behind the scenes, if it does not exist already.

####Icons

Icons are loaded on the page through `views/icons`. This view has a list of entity codes which correspond to codes provided by [Fontello](http://fontello.com) custom icon packs.

####Async

Whenever there is an asynchronous block of code, wrap it in `models/system.async()` which returns a callback function which you call when done. That gives us a consistent loading spinner when things are happening.

###CSS

When developing in LESS, be aware that [LESS Hat](http://lesshat.madebysource.com/) is imported into the app.

##Tests

Tests run via Mocha and [Blanket](http://blanketjs.org/) for coverage. You can use [proxyquire](https://github.com/thlorenz/proxyquire) to override requires, but results in incorrect test coverage when used with Blanket.

The `test/fixtures` folder contains example responses from GitHub.