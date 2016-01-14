import _ from 'lodash';

import Store from '../core/Store.js';

import actions from '../actions/appActions.js';

class ProjectsStore extends Store {

  // Initial payload.
  constructor() {
    super({
      list: [ ]
    });

    // Listen to only projects actions.
    actions.on('projects.*', (obj, event) => {
      let fn = ('on.' + event).replace(/[.]+(\w|$)/g, (m, p) => {
        return p.toUpperCase();
      });

      (fn in this) && this[fn](obj);
    });
  }

  onProjectsLoad() {
    let list = this.get('list');

    // Quit if we have no projects.
    if (!list.length) {
      return;
    }

    actions.emit('system.loading', true);
  }

}

export default new ProjectsStore();
