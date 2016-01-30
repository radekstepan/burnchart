import opa from 'object-path';
import assign from 'object-assign';
import _ from 'lodash';
import { diff } from 'deep-diff';

import EventEmitter from './EventEmitter.js';

import actions from '../actions/appActions.js';

const DATA = 'data';

export default class Store extends EventEmitter {

  constructor(data) {
    super();
    // Initial payload.
    this[DATA] = data || {};
    // Callbacks to cleanup.
    this._cbs = {};
  }

  // Register an async function callback, handle loading state.
  cb(fn) {
    let id = _.uniqueId();
    actions.emit('system.loading', true);
    return this._cbs[id] = (...args) => {
      // Still running?
      if (!(id in this._cbs)) return;
      fn.apply(this, args);
      delete this._cbs[id];
      if (!(Object.keys(this._cbs).length)) {
        actions.emit('system.loading', false);
      }
    };
  };

  // Cleanup callbacks because a View has changed thus long-running
  //  functions need to end. Unreference any onChange events too.
  clean(onChange) {
    for (let id in this._cbs) delete this._cbs[id];
    if (_.isFunction(onChange)) this.offAny(onChange);
    actions.emit('system.loading', false);
  }

  // Set a value on a key. Pass falsy value as 3rd param to not emit changes.
  set(...args) {
    if (args.length == 1) {
      var val = args[0]; // keep var!
    } else {
      var [ key, val, emit=true ] = args; // keep var!
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

  // Push a value on an array or init it.
  // TODO: emit flag
  push(key, val) {
    // Make sure the key is an array.
    if (!_.isArray(key)) key = key.split('.');

    let obj = this.get(key);
    if (_.isArray(obj)) {
      this.set(key.concat(obj.length), val); // TODO: won't emit for root key
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

    this.on(path, (...args) => {
      this.off(path, cb);
      cb.apply(this, args);
    });
  }

  // Delete a path.
  // TODO: emit flag
  del(path) {
    // Make sure the key is an array.
    if (!_.isArray(path)) path = path.split('.');
    // Actually delete.
    opa.del(this[DATA], path);
    // Emit event.
    this.emit(path, this.get(path.splice(-1,1).join('.')));
  }

}
