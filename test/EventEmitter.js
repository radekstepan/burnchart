import { assert } from 'chai';

import EventEmitter from '../src/js/lib/EventEmitter.js';

export default {
  EventEmitter: {
    on(done) {
      let m = new EventEmitter();

      let i = 0;

      // Plain string.
      m.on('A', (o, e) => {
        assert.equal(1, o);
        assert.equal('A', e);
        i += o;
      });
      m.emit('A', 1);

      // Namespaced path.
      m.on(/^A\./, (o, e) => {
        assert.equal(2, o);
        assert(/^A\.B/.test(e));
        i += o;
      });
      m.emit('A.B', 2);
      m.emit('A.B.C', 2);

      m.emit('C.A.B', 3); // should not register

      assert.equal(5, i);

      done();
    },

    onAny(done) {
      let m = new EventEmitter();

      let i = 0;

      m.onAny((o, e) => i += o);

      m.emit('A', 1);
      m.emit('A.B', 2);
      m.emit('', 3); // should not register

      assert.equal(3, i);

      done();
    },

    off(done) {
      let m = new EventEmitter();

      let map = { A: 0, B: 0 };

      let cb = (o, e) => map[e] += 1;

      m.on('A', cb);
      m.on('B', cb);

      m.emit('A');
      m.off('A', cb);
      m.emit('A');
      m.emit('B');

      assert.deepEqual({ A: 1, B: 1 }, map);

      done();
    },

    offAny(done) {
      let m = new EventEmitter();

      let map = { A: 0, B: 0 };

      let cb = (o, e) => map[e] += 1;

      m.on('A', cb);
      m.on('B', cb);

      m.emit('A');
      m.offAny(cb);
      m.emit('A');
      m.emit('B');

      assert.deepEqual({ A: 1, B: 0 }, map);

      done();
    }
  }
};
