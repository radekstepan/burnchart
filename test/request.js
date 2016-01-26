import { assert } from 'chai';
import path from 'path';
import opa from 'object-path';
import { noCallThru } from 'proxyquire'
let proxy = noCallThru();

import config from '../src/config.js';

class Sa {
  constructor() {
    // How soon do we call back?
    this.timeout = 1;
  }

  // Save the uri.
  get(uri) {
    this.params = { uri };
    return this;
  }

  // Save the key-value pair.
  set(key, value) {
    this.params[key] = value;
    return this;
  }
  
  // Call back with the response, async.
  end(cb) {
    setTimeout(() => cb(null, this.response), this.timeout);
  }
}

let superagent = new Sa();

// Proxy the superagent lib.
let lib = path.resolve(__dirname, '../src/js/modules/github/request.js');
let request = proxy(lib, { superagent }).default;

export default {
  'request - all milestones (ok)': (done) => {
    superagent.response = {
      'statusType': 2,
      'error': false,
      'body': [ null ]
    };

    let owner = 'radekstepan';
    let name = 'burnchart';

    request.allMilestones({}, { owner, name }, (err, data) => {
      assert.isNull(err);
      assert.deepEqual(superagent.params, {
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/milestones?state=open&sort=due_date&direction=asc',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      });
      assert.deepEqual(data, [null]);
      done();
    });
  },

  'request - all milestones (403)': (done) => {
    superagent.response = {
      'statusType': 4,
      'error': false,
      'body': {
        'message': 'API rate limit exceeded'
      }
    };

    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 0;
    
    request.oneMilestone({}, { owner, name, milestone }, (err) => {
      assert(err, 'Error');
      done();
    });
  },

  'request - one milestone (ok)': (done) => {
    superagent.response = {
      'statusType': 2,
      'error': false,
      'body': [ null ]
    };

    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 1;
    
    request.oneMilestone({}, { owner, name, milestone }, (err, data) => {
      assert.isNull(err);
      assert.deepEqual(superagent.params, {
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/milestones/1?state=open&sort=due_date&direction=asc',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      });
      assert.deepEqual(data, [null]);
      done();
    });
  },

  'request - one milestone (404)': (done) => {
    superagent.response = {
      'statusType': 4,
      'error': Error("cannot GET undefined (404)"),
      'body': {
        'documentation_url': "http://developer.github.com/v3",
        'message': "Not Found"
      }
    };

    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 0;
    
    request.oneMilestone({}, { owner, name, milestone }, (err) => {
      assert(err, 'Not Found');
      done();
    });
  },

  'request - one milestone (500)': (done) => {
    superagent.response = {
      'statusType': 5,
      'error': Error("Error"),
      'body': null
    };

    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 0;
    
    request.oneMilestone({}, { owner, name, milestone }, (err) => {
      assert(err, 'Error');
      done();
    });
  },

  'request - all issues (ok)': (done) => {
    superagent.response = {
      'statusType': 2,
      'error': false,
      'body': [ null ]
    };

    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 0;
    
    request.allIssues({}, { owner, name, milestone }, {}, (err, data) => {
      assert.isNull(err);
      assert.deepEqual(superagent.params, {
        'uri': 'https://api.github.com/repos/radekstepan/burnchart/issues?milestone=0&per_page=100',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3'
      });
      assert.deepEqual(data, [ null ]);
      done();
    });
  },

  'request - timeout': (done) => {
    opa.set(config, 'request.timeout', 10);
    
    superagent.timeout = 20;
    superagent.response = {
      'statusType': 2,
      'error': false,
      'body': [ null ]
    };
    
    let owner = 'radekstepan';
    let name = 'burnchart';
    let milestone = 0;
    
    request.allIssues({}, { owner, name, milestone }, {}, (err) => {
      assert(err, 'Request has timed out');
      done();
    });
  },

  'request - use tokens': (done) => {
    superagent.response = {};
    
    let user = { 'github': { 'accessToken': 'ABC' }};
    let owner = 'radekstepan';
    let name = 'burnchart';

    request.repo(user, { owner, name }, () => {
      assert(superagent.params.Authorization, 'token ABC');
      done();
    });
  }
};
