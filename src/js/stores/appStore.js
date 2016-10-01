import _ from 'lodash';
import firebase from 'firebase/app';
import 'firebase/auth';

import Store from '../lib/Store.js';

import actions from '../actions/appActions.js';

import config from '../../config.js';

// Setup a new client.
let client;

class AppStore extends Store {

  // Initial payload.
  constructor() {
    super({
      'system': {
        'loading': false,
        'notification': null
      }
    });

    // Listen to all app actions.
    actions.onAny((obj, event) => {
      let fn = `on.${event}`.replace(/[.]+(\w|$)/g, (m, p) => p.toUpperCase());
      // Run?
      (fn in this) && this[fn](obj);
    });

      // Initialize Firebase
    client = firebase.initializeApp(config.firebase);

    actions.emit('user.ready', {});
  }

  onUserSignin() {
    const provider = new firebase.auth.GithubAuthProvider();
    // See https://developer.github.com/v3/oauth/#scopes
    provider.addScope('repo');

    client.auth().signInWithPopup(provider).then((res) => {
      actions.emit('user.ready', {
        'github': res.user.providerData[0],
        'credential': res.credential,
      });
    }).catch((err) => {
      // Handle Errors here.
      actions.emit('system.notify', {
        'text': 'message' in err ? err.message : err.toString(),
        'type': 'alert',
        'system': true
      });
    });
  }

  // Sign-out a user.
  onUserSignout() {
    actions.emit('user.ready', {}); // projectsStore references user
    client.auth().signOut();
  }

  // Called by Firebase.
  onUserReady(user) {
    this.set('user', user);
  }

  onSystemLoading(state) {
    this.set('system.loading', state);
  }

  // Show a notification.
  // TODO: multiple notifications & ttl
  onSystemNotify(args) {
    if (!_.isObject(args)) args = { 'text': args };
    args.id = _.uniqueId('m-');
    this.set('system.notification', args);
  }

}

export default new AppStore();
