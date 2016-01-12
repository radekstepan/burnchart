import { assert } from 'chai';

import Store from '../src/js/core/Store.js';

export default {
  Store: {
    set(done) {
      let s = new Store();
      
      s.set('A.B', 1);
      
      assert.deepEqual({ A: { B: 1 }}, s.get());

      done();
    },

    setSilent(done) {
      let s = new Store();

      let val;

      s.onAny(v => val = v);

      s.set('A.B', 1, true);
      s.set('A.B', 2, false);

      assert.deepEqual({ A: { B: 2 }}, s.get());
      assert.equal(1, val);

      done();
    },

    assign(done) {
      let s = new Store({ A: 1 });

      s.set({ B: 1 });

      assert.deepEqual({ A: 1, B: 1 }, s.get());

      done();
    },

    changes(done) {
      let s = new Store({ A: { B: { C: 1 } } });
      
      let key;

      s.onAny((v, k) => key = k);

      s.set('A', { B: { C: 2 } });

      assert.equal('A.B.C', key);

      done();
    }
  }
};
