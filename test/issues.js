import { assert } from 'chai';
import moment from 'moment';
import _ from 'lodash';
import opa from 'object-path';

import request from '../src/js/modules/github/request.js';
import issues from '../src/js/modules/github/issues.js';
import config from '../src/config.js';

import json from './fixtures/issues.json';

let repo = {
  'owner': 'radekstepan',
  'name': 'burnchart',
  'milestone': 1
};

describe('issues', () => {
  it('time format', done => {
    // ISO 8601 dates are in UTC timezone.
    let utc = moment(json[0].created_at).toDate().toUTCString();
    assert(utc, 'Fri, 22 Apr 2011 13:33:48 GMT');
    done();
  });

  it('all empty', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb(null, []);
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 2);
      assert.strictEqual(open.size, 0);
      assert.strictEqual(closed.size, 0);
      done();
    });
  });

  it('open empty', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb(null, called === 1 ? [] : [{ 'number': 1 }]);
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 2);
      assert.strictEqual(open.size, 0);
      assert.strictEqual(open.list.length, 0);
      assert(closed.size, 1);
      assert(closed.list.length, 1);
      done();
    });
  });

  it('closed empty', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb(null, called === 2 ? [] : [{ 'number': 1 }]);
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 2);
      assert(open.size, 1);
      assert.strictEqual(closed.size, 0);
      done();
    });
  });

  it('both not empty', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb(null, [{ 'number': 1 } ]);
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 2);
      assert(open.size, 1);
      assert(closed.size, 1);
      done();
    });
  });

  it('99 results on a page', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb(null, _.range(99).map((number) => { return { number }; } ));
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 2);
      assert(open.size, 99);
      assert(closed.size, 99);
      done();
    });
  });

  it('100 results on a page', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      switch(opts.page) {
        case 1:
          return cb(null, _.range(100).map((number) => { return { number }; }));
        case 2:
          return cb(null, []);
        default:
          assert(false);
      }
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, function(err, { open, closed }) {
      assert.isNull(err);
      assert(called, 4);
      assert(open.size, 100);
      assert(closed.size, 100);
      done();
    });
  });

  it('101 total results', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      switch(opts.page) {
        case 1:
          return cb(null, _.range(100).map((number) => { return { number }; }));
        case 2:
          return cb(null,  [{ 'number': 100 }]);
        default:
          assert(false);
      }
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 4);
      assert(open.size, 101);
      assert(closed.size, 101);
      assert.deepEqual(open.list[100], { 'number': 100, 'size': 1 });
      assert.deepEqual(closed.list[100], { 'number': 100, 'size': 1 });
      done();
    });
  });

  it('201 total results', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      switch(opts.page) {
        case 1:
        case 2:
          let i = 100 * (opts.page - 1);
          return cb(null, _.range(i, i + 100).map((number) => { return { number }; }));
        case 3:
          return cb(null,  [{ 'number': 200 }]);
        default:
          assert(false);
      }
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(called, 6);
      assert(open.size, 201);
      assert(closed.size, 201);
      _.each([ open, closed ], ({ list }) => {
        _.each([ 100, 200 ], (number) => {
          assert.deepEqual(list[number], { number, 'size': 1 });
        });
      });
      done();
    });
  });

  it('get all when not found', done => {
    let called = 0;
    request.allIssues = (user, repo, opts, cb) => {
      called += 1;
      cb('Not Found');
    };

    opa.set(config, 'chart.points', 'ONE_SIZE');

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert(err, 'Not Found');
      assert(called, 1);
      done();
    });
  });

  it('size based on a label', done => {
    opa.set(config, 'chart.points', 'LABELS');

    request.allIssues = (user, repo, opts, cb) => {
      cb(null, [
        { 'labels': [{ 'name': 'size 2' }]},
        { 'labels': [{ 'name': 'size 10' }]},
        { 'labels': [{ 'name': 'size A' }]}
      ]);
    };

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(open.size, 12);
      assert(open.list[0].size, 2);
      done();
    });
  });

  it('filter when no labels', done => {
    opa.set(config, 'chart.points', 'LABELS');

    request.allIssues = (user, repo, opts, cb) => cb(null, [{}]);

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert.strictEqual(open.size, 0);
      done();
    });
  });

  it('filter when empty labels', done => {
    opa.set(config, 'chart.points', 'LABELS');

    request.allIssues = (user, repo, opts, cb) => {
      cb(null, [{ 'labels': [] }]);
    };

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert.strictEqual(open.size, 0);
      done();
    });
  });

  it('filter when not matching regex', done => {
    opa.set(config, 'chart.points', 'LABELS');

    request.allIssues = (user, repo, opts, cb) => {
      cb(null, [{ 'labels': [{ 'name': 'size 1A' }] }]);
    };

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert.strictEqual(open.size, 0);
      done();
    });
  });

  it('filter when multiple match the regex', done => {
    opa.set(config, 'chart.points', 'LABELS');

    request.allIssues = (user, repo, opts, cb) => {
      cb(null, [
        { 'labels': [ { 'name': 'size 1' }, { 'name': 'size 6' } ]},
        { 'labels': [ { 'name': 'size really big' }, { 'name': 'size 4' } ]}
      ]);
    };

    issues.fetchAll({}, repo, (err, { open, closed }) => {
      assert.isNull(err);
      assert(open.size, 11);
      let [ a, b ] = open.list;
      assert(a.size, 7);
      assert(b.size, 4);
      done();
    });
  });
});
