import _ from 'lodash';
import Firebase from 'firebase';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

import config from '../models/config.js';

// Setup a new client.
let client;

class AppStore extends Store {

  // Initial payload.
  constructor() {
    super({
      'system': {
        'loading': false,
      },
      'user': {}
    });

    // Listen to all app actions.
    actions.onAny((obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });

    client = new Firebase("https://" + config.firebase + ".firebaseio.com");

    // When user is already authenticated.
    client.onAuth((data={}) => actions.emit('user.ready', data));
  }

  onUserSignin() {
    client.authWithOAuthPopup("github", (err, data) => {
      if (!err) return actions.emit('firebase.auth', data);

      actions.emit('system.notify', {
        'text': err.toString(),
        'type': 'alert',
        'system': true          
      });
    }, {
      'rememberMe': true,
      // See https://developer.github.com/v3/oauth/#scopes
      'scope': 'repo'
    });
  }

  // Sign-out a user.
  onUserSignout() {
    this.set('user', {});
    client.unauth();
  }

  // Called by Firebase.
  onUserReady(user) {
    this.set('user', user || {});
  }

  onSystemLoading(state) {
    this.set('system.loading', state);
  }

  // TODO: implement.
  onSystemNotify() {

  }

}

export default new AppStore();
