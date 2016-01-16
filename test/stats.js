import { assert } from 'chai';
import { noCallThru } from 'proxyquire';
import path from 'path';
import moment from 'moment';

let proxy = noCallThru();

import stats from '../src/js/modules/stats.js';

export default {
  'stats - is milestone empty, on time and overdue? no due date': (done) => {
    let milestone = {
      'issues': {
        'open': {
          'size': 0
        },
        'closed': {
          'size': 0
        }
      }
    };

    let { isEmpty, isOverdue, isOnTime } = stats(milestone);
    
    assert.isTrue(isEmpty);
    assert.isFalse(isOverdue);
    assert.isTrue(isOnTime);

    done();
  },

  'stats - is milestone done?': (done) => {
    let milestone = {
      'issues': {
        'open': {
          'size': 0
        },
        'closed': {
          'size': 5
        }
      }
    };
    
    let { isDone } = stats(milestone);
    assert.isTrue(isDone);
    
    done();
  },

  'stats - is milestone overdue? has due date, yes': (done) => {
    let milestone = {
      'created_at': '2011-04-02T00:00:00.000Z',
      'due_on': '2011-04-03T00:00:00.000Z',
      'issues': {
        'open': {
          'size': 0
        },
        'closed': {
          'size': 0
        }
      }
    };
    
    let { isOverdue } = stats(milestone);
    assert.isTrue(isOverdue);
    
    done();
  },

  'stats - is milestone on time? has due date, yes': (done) => {
    let now = moment.utc();
    let milestone = {
      'created_at': now.subtract(1, 'week').toISOString(),
      'due_on': now.add(1, 'month').toISOString(),
      'issues': {
        'open': {
          'size': 1
        },
        'closed': {
          'size': 1
        }
      }
    };
    
    let { isOnTime } = stats(milestone);
    assert.isTrue(isOnTime);

    done();
  },

  'stats - is milestone on time? has due date, no': (done) => {
    let now = moment.utc();
    let milestone = {
      'created_at': now.subtract(2, 'week').toISOString(),
      'due_on': now.add(1, 'day').toISOString(),
      'issues': {
        'open': {
          'size': 2
        },
        'closed': {
          'size': 2
        }
      }
    };

    let { isOnTime } = stats(milestone);
    assert.isFalse(isOnTime);

    done();
  },

  'stats - is milestone on time? has due date, all issues closed': (done) => {
    let now = moment.utc();
    let milestone = {
      'created_at': now.subtract(2, 'week').toISOString(),
      'due_on': now.subtract(1, 'week').toISOString(),
      'issues': {
        'open': {
          'size': 0
        },
        'closed': {
          'size': 5
        }
      }
    };

    let { isOnTime } = stats(milestone);
    assert.isTrue(isOnTime);

    done();
  }
};
