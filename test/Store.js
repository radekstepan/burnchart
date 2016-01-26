import { assert } from 'chai';

import Store from '../src/js/lib/Store.js';
import actions from '../src/js/actions/appActions.js';

export default {
  'store - set': (done) => {
    let s = new Store();
    
    s.set('A.B', 1);
    
    assert.deepEqual({ A: { B: 1 }}, s.get());

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
    assert.equal(Object.keys(s._cbs).length, 1);
    cb();
    assert.ok(called);
    assert.equal(Object.keys(s._cbs).length, 0);
    assert.deepEqual(events, [ true, false ]);

    done();
  },

  'store - cb cancelled': (done) => {
    let s = new Store();

    let events = [];
    actions.on('system.loading', (val) => events.push(val));

    let called = false;
    let cb = s.cb(() => called = true);
    assert.equal(Object.keys(s._cbs).length, 1);
    setTimeout(cb, 10);
    s.clean();
    assert.equal(Object.keys(s._cbs).length, 0);

    setTimeout(() => {
      assert.ok(!called);
      assert.deepEqual(events, [ true, false ]);
      done();
    }, 20);
  }
};
