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

  // TODO: Unit-test.
  push(key, val) {
    let obj = this.get(key);
    if (_.isArray(obj)) {
      // TODO: Don't assume a string.
      this.set(`${key}.${obj.length}`, val);
      return obj.length - 1;
    } else {
      this.set(key, [ val ]);
      return 0;
    }
  }

  // Get this key path or everything. Pass a callback to be
  //  provided with value once it is set.
  get(path, cb) {
    let val = opa.get(this[DATA], path);
    if (!_.isFunction(cb)) return val;
    
    if (opa.has(this[DATA], path)) return cb(val);
    
    // TODO: unit-test.
    this.on(path, (...args) => {
      this.off(path, cb);
      cb.apply(this, args);
    });
  }

}
