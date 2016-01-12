import opa from 'object-path';
import assign from 'object-assign';
import _ from 'lodash';
import { diff } from 'deep-diff';

import EventEmitter from './EventEmitter.js';

const DATA = 'data';

export default class Store extends EventEmitter {

  constructor(data) {
    super();
    // Initial payload.
    this[DATA] = data || {};
  }

  // Set a value on a key. Pass falsy value as 3rd param to not emit changes.
  set(...args) {
    if (args.length == 1) {
      var val = args[0];
    } else {
      var [ key, val, emit=true ] = args;
    }

    // A list of changes.
    let changes = [];

    // Object assign.
    if (!key) {
      if (emit) changes = diff(this[DATA], val) || [];
      assign(this[DATA], val);
      key = [];
    // When path is provided.
    } else {
      if (emit) changes = diff(opa.get(this[DATA], key), val) || [];
      opa.set(this[DATA], key, val);
    }

    // Make sure the key is an array.
    if (!_.isArray(key)) key = key.split('.');

    // Emit all changes.
    changes.forEach(ch => {
      // Form the full path.
      let path = key.concat(ch.path || []).join('.');
      // Emit the path changed and the associated object.
      this.emit(path, this.get(path));
    });
  }

  // Get this key path or everything. Pass truthy value as a 2nd param to get
  //  a deep clone of the object (expensive).
  get(path, clone=false) {
    let fn = clone ? _.cloneDeep : _.identity;
    return fn(opa.get(this[DATA], path));
  }

}
