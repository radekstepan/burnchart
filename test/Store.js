import { assert } from 'chai';

import Store from '../src/js/lib/Store.js';
import actions from '../src/js/actions/appActions.js';

export default {
  'store - set': (done) => {
    let s = new Store();
    
    s.set('A.B', 1); // key as a string
    s.set([ 'A', 'C' ], 2); // key as an array

    assert.deepEqual({ A: { B: 1, C: 2 }}, s.get());

    done();
  },

  'store - push': (done) => {
    let s = new Store({ 'list': [ 'A' ] });
    
    s.push('list', 'B'); // key as a string
    s.push([ 'list' ], 'C'); // key as an array

    assert.deepEqual({ 'list': [ 'A', 'B', 'C' ] }, s.get());

    done();
  },

  'store - push with init': (done) => {
    let s = new Store();
    
    s.push('list', 'A');
    
    assert.deepEqual({ 'list': [ 'A' ] }, s.get());

    done();
  },

  'store - get': (done) => {
    let s = new Store({ 'A': [ 1, 2 ], 'B': { 'C': 3 } });

    assert.equal(2, s.get('A.1')); // key as a string
    assert.equal(3, s.get([ 'B', 'C' ])); // key as an array

    done();
  },

  'store - get with callback': (done) => {
    let s = new Store({ 'A': 1 });

    let vals = [];
    let cb = (val) => vals.push(val);

    s.get('A', cb);
    s.get('B', cb);
    s.set('B', 2); // value provided only now

    assert.deepEqual([ 1, 2 ], vals);

    done();
  },

  'store - setSilent': (done) => {
    let s = new Store();

    let val;

    s.onAny(v => val = v);

    s.set('A.B', 1, true);
    s.set('A.B', 2, false);

    assert.deepEqual({ A: { B: 2 }}, s.get());
    assert.equal(1, val);

    done();
  },

  'store - assign': (done) => {
    let s = new Store({ A: 1 });

    s.set({ B: 1 });

    assert.deepEqual({ A: 1, B: 1 }, s.get());

    done();
  },

  'store - changes': (done) => {
    let s = new Store({ A: { B: { C: 1 } } });
    
    let key;

    s.onAny((v, k) => key = k);

    s.set('A', { B: { C: 2 } });

    assert.equal('A.B.C', key);

    done();
  },

  'store - cb called': (done) => {
    let s = new Store();

    let events = [];
    actions.on('system.loading', (val) => events.push(val));

    let called = false;
    let cb = s.cb(() => called = true);
    assert.equal(1, Object.keys(s._cbs).length);
    cb();
    assert.ok(called);
    assert.equal(0, Object.keys(s._cbs).length);
    assert.deepEqual([ true, false ], events);

    done();
  },

  'store - cb cancelled': (done) => {
    let s = new Store();

    let events = [];
    actions.on('system.loading', (val) => events.push(val));

    let called = false;
    let cb = s.cb(() => called = true);
    assert.equal(1, Object.keys(s._cbs).length);
    setTimeout(cb, 10);
    s.clean();
    assert.equal(0, Object.keys(s._cbs).length);

    setTimeout(() => {
      assert.ok(!called);
      assert.deepEqual([ true, false ], events);
      done();
    }, 20);
  }
};
