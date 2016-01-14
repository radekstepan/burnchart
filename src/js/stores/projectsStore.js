import _ from 'lodash';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

class ProjectsStore extends Store {

  // Initial payload.
  constructor() {
    super({
      list: [ ]
    });

    // Listen to all app actions.
    actions.onAny((obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });
  }

  onProjectsLoad() {
    console.log('load projects');
  }

}

export default new ProjectsStore();
