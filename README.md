#[burnchart v3](http://radekstepan.com/burnchart)

A [React](http://facebook.github.io/react/) app utilizing a [Flux](http://facebook.github.io/flux/) architecture.

- EventEmitter listeners can use RegExp paths thus allowing the use of namespaces
- routing resets the whole UI between page changes and so Components are easier to reason about (`componentDidMount`)

##Quickstart

```bash
$ nvm use
$ npm install
$ make watch
$ npm start
# Server started on port 8080
```

##Changelog

###v3.0.0
- switch to React & Flux architecture