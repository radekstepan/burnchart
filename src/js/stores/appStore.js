import _ from 'lodash';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

class AppStore extends Store {

  // Initial payload.
  constructor() {
    super({
      system: {
        loading: true
      },
      user: {}
    });

    // Listen to all app actions
    actions.onAny((obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });
  }

  onUserSignin() {
    console.log('in');
  }

  onUserSignOut() {
    console.log('out');
  }

}

export default new AppStore();
