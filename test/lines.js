import { assert } from 'chai';
import moment from 'moment';
import _ from 'lodash';

import lines from '../src/js/modules/chart/lines.js';

export default {
  'lines - actual': (done) => {
    let issues = [
      { 'size': 3, 'date': 2 },
      { 'size': 2, 'date': 3 },
      { 'size': 1, 'date': 4 }
    ];

    let points = _.map(lines.actual(issues, 1, 6), ({ points }) => points);

    assert.deepEqual(points, [6, 3, 1, 0]);
    
    done();
  },

  'lines - ideal': (done) => {
    let a = '2011-04-01T00:00:00Z';
    let b = '2011-04-03T00:00:00Z';
    
    let line = lines.ideal(a, b, 4).slice(0, 3);
    
    assert.deepEqual(line, [
      { 'date': '2011-04-02T00:00:00.000Z', 'points': 4 },
      { 'date': '2011-04-03T00:00:00.000Z', 'points': 2 },
      { 'date': '2011-04-04T00:00:00.000Z', 'points': 0 }
    ]);

    done();
  },

  'lines - trend': (done) => {
    let issues = [
      { 'date': '2011-04-02T00:00:00.000Z', 'points': 4 },
      { 'date': '2011-04-03T00:00:00.000Z', 'points': 1 },
      { 'date': '2011-04-04T00:00:00.000Z', 'points': 1 }
    ];

    let opts = [
      issues,
      '2011-04-02T00:00:00.000Z',
      moment.utc()
    ];
    
    let line = _.map(lines.trend.apply(null, opts), ({ points }) => Math.round(points));

    assert.deepEqual(line, [2, 1]);
    
    done();
  }
};
