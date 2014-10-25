(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/radek/dev/burnchart.io/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/home/radek/dev/burnchart.io/src/app.coffee":[function(require,module,exports){
var Header, Notify, Ractive, router;

Ractive = require('./modules/vendor.coffee').Ractive;

require('./utils/mixins.coffee');

require('./models/projects.coffee');

Header = require('./views/header.coffee');

Notify = require('./views/notify.coffee');

router = require('./modules/router.coffee');

new Ractive({
  'template': require('./templates/app.html'),
  'el': 'body',
  'components': {
    Header: Header,
    Notify: Notify
  },
  onrender: function() {
    return router.init('/');
  }
});



},{"./models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","./modules/router.coffee":"/home/radek/dev/burnchart.io/src/modules/router.coffee","./modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","./templates/app.html":"/home/radek/dev/burnchart.io/src/templates/app.html","./utils/mixins.coffee":"/home/radek/dev/burnchart.io/src/utils/mixins.coffee","./views/header.coffee":"/home/radek/dev/burnchart.io/src/views/header.coffee","./views/notify.coffee":"/home/radek/dev/burnchart.io/src/views/notify.coffee"}],"/home/radek/dev/burnchart.io/src/models/config.coffee":[function(require,module,exports){
var Model;

Model = require('../utils/ractive/model.coffee');

module.exports = new Model({
  'name': 'models/config',
  "data": {
    "firebase": "burnchart",
    "provider": "github",
    "fields": {
      "milestone": ["closed_issues", "created_at", "description", "due_on", "number", "open_issues", "title", "updated_at"]
    },
    "chart": {
      "off_days": [],
      "datetime": /^(\d{4}-\d{2}-\d{2})T(.*)/,
      "size_label": /^size (\d+)$/,
      "location": /^#!((\/[^\/]+){2,3})$/,
      "points": 'ONE_SIZE'
    }
  }
});



},{"../utils/ractive/model.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee"}],"/home/radek/dev/burnchart.io/src/models/firebase.coffee":[function(require,module,exports){
var Firebase, FirebaseSimpleLogin, Model, config, user, _ref;

_ref = require('../modules/vendor.coffee'), Firebase = _ref.Firebase, FirebaseSimpleLogin = _ref.FirebaseSimpleLogin;

Model = require('../utils/ractive/model.coffee');

user = require('./user.coffee');

config = require('./config.coffee');

module.exports = new Model({
  'name': 'models/firebase',
  auth: function() {
    throw 'Not overriden';
  },
  login: function(cb) {
    return this.auth.login(config.data.provider, {
      'rememberMe': true,
      'scope': 'private_repo'
    });
  },
  logout: function() {
    var _ref1;
    if ((_ref1 = this.auth) != null) {
      _ref1.logout;
    }
    return user.reset();
  },
  onrender: function() {
    var client;
    this.set('client', client = new Firebase("https://" + config.data.firebase + ".firebaseio.com"));
    return this.auth = new FirebaseSimpleLogin(client, function(err, obj) {
      if (err) {
        throw err;
      }
      if (obj) {
        user.set(obj);
      }
      return user.set('ready', true);
    });
  }
});



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../utils/ractive/model.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee","./config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","./user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee"}],"/home/radek/dev/burnchart.io/src/models/projects.coffee":[function(require,module,exports){
var Model, config, date, lscache, semver, sortedIndexCmp, stats, user, _, _ref,
  __slice = [].slice;

_ref = require('../modules/vendor.coffee'), _ = _ref._, lscache = _ref.lscache, sortedIndexCmp = _ref.sortedIndexCmp, semver = _ref.semver;

Model = require('../utils/ractive/model.coffee');

config = require('../models/config.coffee');

stats = require('../modules/stats.coffee');

date = require('../utils/date.coffee');

user = require('./user.coffee');

module.exports = new Model({
  'name': 'models/projects',
  'data': {
    'sortBy': 'priority',
    'sortFns': ['progress', 'priority', 'name']
  },
  comparator: function() {
    var deIdx, defaults, list, sortBy, _ref1;
    _ref1 = this.data, list = _ref1.list, sortBy = _ref1.sortBy;
    deIdx = (function(_this) {
      return function(fn) {
        return function() {
          var i, j, rest, _arg;
          _arg = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          i = _arg[0], j = _arg[1];
          return fn.apply(_this, [[list[i], list[i].milestones[j]]].concat(rest));
        };
      };
    })(this);
    defaults = function(arr, hash) {
      var i, item, k, keys, p, ref, v, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        item = arr[_i];
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (k in hash) {
            v = hash[k];
            ref = item;
            _results1.push((function() {
              var _j, _len1, _ref2, _results2;
              _ref2 = keys = k.split('.');
              _results2 = [];
              for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
                p = _ref2[i];
                if (i === keys.length - 1) {
                  _results2.push(ref[p] != null ? ref[p] : ref[p] = v);
                } else {
                  _results2.push(ref = ref[p] != null ? ref[p] : ref[p] = {});
                }
              }
              return _results2;
            })());
          }
          return _results1;
        })());
      }
      return _results;
    };
    switch (sortBy) {
      case 'progress':
        return deIdx(function(_arg, _arg1) {
          var aM, aP, bM, bP;
          aP = _arg[0], aM = _arg[1];
          bP = _arg1[0], bM = _arg1[1];
          defaults([aM, bM], {
            'stats.progress.points': 0
          });
          return aM.stats.progress.points - bM.stats.progress.points;
        });
      case 'priority':
        return deIdx(function(_arg, _arg1) {
          var $a, $b, aM, aP, bM, bP, _ref2;
          aP = _arg[0], aM = _arg[1];
          bP = _arg1[0], bM = _arg1[1];
          defaults([aM, bM], {
            'stats.progress.time': 0,
            'stats.days': 1e3
          });
          _ref2 = _.map([aM, bM], function(_arg2) {
            var stats;
            stats = _arg2.stats;
            return (stats.progress.points - stats.progress.time) * stats.days;
          }), $a = _ref2[0], $b = _ref2[1];
          return $b - $a;
        });
      case 'name':
        return deIdx(function(_arg, _arg1) {
          var aM, aP, bM, bP, name, owner;
          aP = _arg[0], aM = _arg[1];
          bP = _arg1[0], bM = _arg1[1];
          if (owner = bP.owner.localeCompare(aP.owner)) {
            return owner;
          }
          if (name = bP.name.localeCompare(aP.name)) {
            return name;
          }
          if (semver.valid(bM.title) && semver.valid(aM.title)) {
            return semver.gt(bM.title, aM.title);
          } else {
            return bM.title.localeCompare(aM.title);
          }
        });
      default:
        return function() {
          return 0;
        };
    }
  },
  find: function(project) {
    return _.find(this.data.list, project);
  },
  exists: function() {
    return !!this.find.apply(this, arguments);
  },
  add: function(project) {
    if (!this.exists(project)) {
      return this.push('list', project);
    }
  },
  findIndex: function(_arg) {
    var name, owner;
    owner = _arg.owner, name = _arg.name;
    return _.findIndex(this.data.list, {
      owner: owner,
      name: name
    });
  },
  addMilestone: function(project, milestone) {
    var i, j;
    _.extend(milestone, {
      'stats': stats(milestone)
    });
    if ((i = this.findIndex(project)) < 0) {
      throw 500;
    }
    if (project.milestones != null) {
      this.push("list." + i + ".milestones", milestone);
      j = this.data.list[i].milestones.length - 1;
    } else {
      this.set("list." + i + ".milestones", [milestone]);
      j = 0;
    }
    return this.sort([i, j], [project, milestone]);
  },
  saveError: function(project, err) {
    var idx;
    if ((idx = this.findIndex(project)) > -1) {
      if (project.errors != null) {
        return this.push("list." + idx + ".errors", err);
      } else {
        return this.set("list." + idx + ".errors", [err]);
      }
    } else {
      throw 500;
    }
  },
  clear: function() {
    return this.set({
      'list': [],
      'index': []
    });
  },
  sort: function(ref, data) {
    var i, idx, index, j, m, p, _i, _j, _len, _len1, _ref1, _ref2;
    index = this.data.index || [];
    if (ref) {
      idx = sortedIndexCmp(index, data, this.comparator());
      index.splice(idx, 0, ref);
    } else {
      _ref1 = this.data.list;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        p = _ref1[i];
        if (p.milestones == null) {
          continue;
        }
        _ref2 = p.milestones;
        for (j = _j = 0, _len1 = _ref2.length; _j < _len1; j = ++_j) {
          m = _ref2[j];
          idx = sortedIndexCmp(index, [p, m], this.comparator());
          index.splice(idx, 0, [i, j]);
        }
      }
    }
    return this.set('index', index);
  },
  onconstruct: function() {
    this.subscribe('!projects/add', this.add, this);
    return this.subscribe('!projects/clear', this.clear, this);
  },
  onrender: function() {
    this.set('list', lscache.get('projects') || []);
    this.observe('list', function(projects) {
      return lscache.set('projects', _.pluckMany(projects, ['owner', 'name']));
    }, {
      'init': false
    });
    return this.observe('sortBy', function() {
      this.set('index', null);
      return this.sort();
    }, {
      'init': false
    });
  }
});



},{"../models/config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","../modules/stats.coffee":"/home/radek/dev/burnchart.io/src/modules/stats.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../utils/date.coffee":"/home/radek/dev/burnchart.io/src/utils/date.coffee","../utils/ractive/model.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee","./user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee"}],"/home/radek/dev/burnchart.io/src/models/system.coffee":[function(require,module,exports){
var Model, async, counter, system;

Model = require('../utils/ractive/model.coffee');

system = new Model({
  'name': 'models/system',
  'data': {
    'loading': false
  }
});

counter = 0;

async = function() {
  counter += 1;
  system.set('loading', true);
  return function() {
    counter -= 1;
    return system.set('loading', +counter);
  };
};

module.exports = {
  system: system,
  async: async
};



},{"../utils/ractive/model.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee"}],"/home/radek/dev/burnchart.io/src/models/user.coffee":[function(require,module,exports){
var Model;

Model = require('../utils/ractive/model.coffee');

module.exports = new Model({
  'name': 'models/user',
  'data': {
    'provider': "local",
    'id': "0",
    'uid': "local:0",
    'token': null
  }
});



},{"../utils/ractive/model.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee"}],"/home/radek/dev/burnchart.io/src/modules/chart/axes.coffee":[function(require,module,exports){
var d3;

d3 = require('../vendor.coffee').d3;

module.exports = {
  horizontal: function(height, x) {
    return d3.svg.axis().scale(x).orient("bottom").tickSize(-height).tickFormat(function(d) {
      return d.getDate();
    }).tickPadding(10);
  },
  vertical: function(width, y) {
    return d3.svg.axis().scale(y).orient("left").tickSize(-width).ticks(5).tickPadding(10);
  }
};



},{"../vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/chart/lines.coffee":[function(require,module,exports){
var config, d3, _, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = require('../../modules/vendor.coffee'), _ = _ref._, d3 = _ref.d3;

config = require('../../models/config.coffee');

module.exports = {
  actual: function(issues, created_at, total) {
    var head, max, min, range, rest;
    head = [
      {
        'date': new Date(created_at),
        'points': total
      }
    ];
    min = +Infinity;
    max = -Infinity;
    rest = _.map(issues, function(issue) {
      var closed_at, size;
      size = issue.size, closed_at = issue.closed_at;
      if (size < min) {
        min = size;
      }
      if (size > max) {
        max = size;
      }
      issue.date = new Date(closed_at);
      issue.points = total -= size;
      return issue;
    });
    range = d3.scale.linear().domain([min, max]).range([5, 8]);
    rest = _.map(rest, function(issue) {
      issue.radius = range(issue.size);
      return issue;
    });
    return [].concat(head, rest);
  },
  ideal: function(a, b, total) {
    var cutoff, d, days, length, m, now, once, velocity, y, _ref1, _ref2;
    if (b < a) {
      _ref1 = [a, b], b = _ref1[0], a = _ref1[1];
    }
    _ref2 = _.map(a.match(config.data.chart.datetime)[1].split('-'), function(v) {
      return parseInt(v);
    }), y = _ref2[0], m = _ref2[1], d = _ref2[2];
    cutoff = new Date(b);
    days = [];
    length = 0;
    (once = function(inc) {
      var day, day_of;
      day = new Date(y, m - 1, d + inc);
      if (!(day_of = day.getDay())) {
        day_of = 7;
      }
      if (__indexOf.call(config.data.chart.off_days, day_of) >= 0) {
        days.push({
          date: day,
          off_day: true
        });
      } else {
        length += 1;
        days.push({
          date: day
        });
      }
      if (!(day > cutoff)) {
        return once(inc + 1);
      }
    })(0);
    velocity = total / (length - 1);
    days = _.map(days, function(day, i) {
      day.points = total;
      if (days[i] && !days[i].off_day) {
        total -= velocity;
      }
      return day;
    });
    if ((now = new Date()) > cutoff) {
      days.push({
        date: now,
        points: 0
      });
    }
    return days;
  },
  trend: function(actual, created_at, due_on) {
    var a, b, b1, c1, e, fn, intercept, l, last, slope, start, values;
    if (!actual.length) {
      return [];
    }
    start = +actual[0].date;
    values = _.map(actual, function(_arg) {
      var date, points;
      date = _arg.date, points = _arg.points;
      return [+date - start, points];
    });
    last = actual[actual.length - 1];
    values.push([+new Date() - start, last.points]);
    b1 = 0;
    e = 0;
    c1 = 0;
    a = (l = values.length) * _.reduce(values, function(sum, _arg) {
      var a, b;
      a = _arg[0], b = _arg[1];
      b1 += a;
      e += b;
      c1 += Math.pow(a, 2);
      return sum + (a * b);
    }, 0);
    slope = (a - (b1 * e)) / ((l * c1) - (Math.pow(b1, 2)));
    intercept = (e - (slope * b1)) / l;
    fn = function(x) {
      return slope * x + intercept;
    };
    created_at = new Date(created_at);
    due_on = due_on ? new Date(due_on) : new Date();
    a = created_at - start;
    b = due_on - start;
    return [
      {
        'date': created_at,
        'points': fn(a)
      }, {
        'date': due_on,
        'points': fn(b)
      }
    ];
  }
};



},{"../../models/config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee":[function(require,module,exports){
var async, config, request, _, _ref;

_ref = require('../vendor.coffee'), _ = _ref._, async = _ref.async;

config = require('../../models/config.coffee');

request = require('./request.coffee');

module.exports = {
  fetchAll: function(repo, cb) {
    var calcSize, oneStatus;
    calcSize = function(list, cb) {
      var issue, size, _i, _len;
      switch (config.data.chart.points) {
        case 'ONE_SIZE':
          size = list.length;
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            issue = list[_i];
            issue.size = 1;
          }
          return cb(null, {
            list: list,
            size: size
          });
        case 'LABELS':
          size = 0;
          list = _.filter(list, function(issue) {
            var labels;
            if (!(labels = issue.labels)) {
              return false;
            }
            issue.size = _.reduce(labels, function(sum, label) {
              var matches;
              if (!(matches = label.name.match(config.data.chart.size_label))) {
                return sum;
              }
              return sum += parseInt(matches[1]);
            }, 0);
            size += issue.size;
            return !!issue.size;
          });
          return cb(null, {
            list: list,
            size: size
          });
      }
    };
    oneStatus = function(state, cb) {
      var fetchPage, results;
      results = [];
      return (fetchPage = function(page) {
        return request.allIssues(repo, {
          state: state,
          page: page
        }, function(err, data) {
          if (err) {
            return cb(err);
          }
          if (!data.length) {
            return cb(null, results);
          }
          results = results.concat(_.sortBy(data, 'closed_at'));
          if (data.length < 100) {
            return cb(null, results);
          }
          return fetchPage(page + 1);
        });
      })(1);
    };
    return async.parallel([_.partial(async.waterfall, [_.partial(oneStatus, 'open'), calcSize]), _.partial(async.waterfall, [_.partial(oneStatus, 'closed'), calcSize])], function(err, _arg) {
      var closed, open;
      open = _arg[0], closed = _arg[1];
      return cb(err, {
        open: open,
        closed: closed
      });
    });
  }
};



},{"../../models/config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","../vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","./request.coffee":"/home/radek/dev/burnchart.io/src/modules/github/request.coffee"}],"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee":[function(require,module,exports){
var request;

request = require('./request.coffee');

module.exports = {
  'fetch': request.oneMilestone,
  'fetchAll': request.allMilestones
};



},{"./request.coffee":"/home/radek/dev/burnchart.io/src/modules/github/request.coffee"}],"/home/radek/dev/burnchart.io/src/modules/github/request.coffee":[function(require,module,exports){
var SuperAgent, defaults, error, headers, isReady, isValid, ready, request, response, stack, user, _, _ref;

_ref = require('../vendor.coffee'), _ = _ref._, SuperAgent = _ref.SuperAgent;

user = require('../../models/user.coffee');

SuperAgent.parse = {
  'application/json': function(res) {
    var e;
    try {
      return JSON.parse(res);
    } catch (_error) {
      e = _error;
      return {};
    }
  }
};

defaults = {
  'github': {
    'host': 'api.github.com',
    'protocol': 'https'
  }
};

module.exports = {
  repo: function(_arg, cb) {
    var name, owner;
    owner = _arg.owner, name = _arg.name;
    if (!isValid({
      owner: owner,
      name: name
    })) {
      return cb('Request is malformed');
    }
    return ready(function() {
      var data;
      data = _.defaults({
        'path': "/repos/" + owner + "/" + name,
        'headers': headers(user.data.accessToken)
      }, defaults.github);
      return request(data, cb);
    });
  },
  allMilestones: function(_arg, cb) {
    var name, owner;
    owner = _arg.owner, name = _arg.name;
    if (!isValid({
      owner: owner,
      name: name
    })) {
      return cb('Request is malformed');
    }
    return ready(function() {
      var data;
      data = _.defaults({
        'path': "/repos/" + owner + "/" + name + "/milestones",
        'query': {
          'state': 'open',
          'sort': 'due_date',
          'direction': 'asc'
        },
        'headers': headers(user.data.accessToken)
      }, defaults.github);
      return request(data, cb);
    });
  },
  oneMilestone: function(_arg, cb) {
    var milestone, name, owner;
    owner = _arg.owner, name = _arg.name, milestone = _arg.milestone;
    if (!isValid({
      owner: owner,
      name: name,
      milestone: milestone
    })) {
      return cb('Request is malformed');
    }
    return ready(function() {
      var data;
      data = _.defaults({
        'path': "/repos/" + owner + "/" + name + "/milestones/" + milestone,
        'query': {
          'state': 'open',
          'sort': 'due_date',
          'direction': 'asc'
        },
        'headers': headers(user.data.accessToken)
      }, defaults.github);
      return request(data, cb);
    });
  },
  allIssues: function(_arg, query, cb) {
    var milestone, name, owner;
    owner = _arg.owner, name = _arg.name, milestone = _arg.milestone;
    if (!isValid({
      owner: owner,
      name: name,
      milestone: milestone
    })) {
      return cb('Request is malformed');
    }
    return ready(function() {
      var data;
      data = _.defaults({
        'path': "/repos/" + owner + "/" + name + "/issues",
        'query': _.extend(query, {
          milestone: milestone,
          'per_page': '100'
        }),
        'headers': headers(user.data.accessToken)
      }, defaults.github);
      return request(data, cb);
    });
  }
};

request = function(_arg, cb) {
  var exited, headers, host, k, path, protocol, q, query, req, timeout, v;
  protocol = _arg.protocol, host = _arg.host, path = _arg.path, query = _arg.query, headers = _arg.headers;
  exited = false;
  q = query ? '?' + ((function() {
    var _results;
    _results = [];
    for (k in query) {
      v = query[k];
      _results.push("" + k + "=" + v);
    }
    return _results;
  })()).join('&') : '';
  req = SuperAgent.get("" + protocol + "://" + host + path + q);
  for (k in headers) {
    v = headers[k];
    req.set(k, v);
  }
  timeout = setTimeout(function() {
    exited = true;
    return cb('Request has timed out');
  }, 1e4);
  return req.end(function(err, data) {
    if (exited) {
      return;
    }
    exited = true;
    clearTimeout(timeout);
    return response(err, data, cb);
  });
};

response = function(err, data, cb) {
  var _ref1;
  if (err) {
    return cb(error(err));
  }
  if (data.statusType !== 2) {
    if ((data != null ? (_ref1 = data.body) != null ? _ref1.message : void 0 : void 0) != null) {
      return cb(data.body.message);
    }
    return cb(data.error.message);
  }
  return cb(null, data.body);
};

headers = function(token) {
  var h;
  h = {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3'
  };
  if (token != null) {
    h.Authorization = "token " + token;
  }
  return h;
};

isValid = function(obj) {
  var key, rules, val;
  rules = {
    'owner': function(val) {
      return val != null;
    },
    'name': function(val) {
      return val != null;
    },
    'milestone': function(val) {
      return _.isInt(val);
    }
  };
  for (key in obj) {
    val = obj[key];
    if (key in rules && !rules[key](val)) {
      return false;
    }
  }
  return true;
};

isReady = user.data.ready;

stack = [];

ready = function(cb) {
  if (isReady) {
    return cb();
  } else {
    return stack.push(cb);
  }
};

user.observe('ready', function(val) {
  var _results;
  isReady = val;
  if (val) {
    _results = [];
    while (stack.length) {
      _results.push(stack.shift()());
    }
    return _results;
  }
});

error = function(err) {
  var message;
  switch (false) {
    case !_.isString(err):
      message = err;
      break;
    case !_.isArray(err):
      message = err[1];
      break;
    case !(_.isObject(err) && _.isString(err.message)):
      message = err.message;
  }
  if (!message) {
    try {
      message = JSON.stringify(err);
    } catch (_error) {
      message = err.toString();
    }
  }
  return message;
};



},{"../../models/user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee","../vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/mediator.coffee":[function(require,module,exports){
var Mediator, Ractive;

Ractive = require('./vendor.coffee').Ractive;

Mediator = Ractive.extend({});

module.exports = new Mediator();



},{"./vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/router.coffee":[function(require,module,exports){
var addProject, c, director, el, mediator, pages, route, routes, system, view, _, _ref,
  __slice = [].slice;

_ref = require('./vendor.coffee'), _ = _ref._, director = _ref.director;

mediator = require('./mediator.coffee');

system = require('../models/system.coffee');

el = '#page';

pages = {
  "index": require("../views/pages/index.coffee"),
  "milestone": require("../views/pages/milestone.coffee"),
  "new": require("../views/pages/new.coffee"),
  "project": require("../views/pages/project.coffee")
};

addProject = function(page, owner, name) {
  return mediator.fire('!projects/add', {
    owner: owner,
    name: name
  });
};

c = function(name, fns) {
  var fn, _i, _len, _results;
  if (fns == null) {
    fns = [];
  }
  _results = [];
  for (_i = 0, _len = fns.length; _i < _len; _i++) {
    fn = fns[_i];
    _results.push(_.partial(fn, name));
  }
  return _results;
};

view = null;

route = function() {
  var Page, args, page;
  page = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (view != null) {
    view.teardown();
  }
  mediator.fire('!app/notify/hide');
  Page = pages[page];
  return view = new Page({
    el: el,
    'data': {
      'route': args
    }
  });
};

routes = {
  '/': c('index', [route]),
  '/new/project': c('new', [route]),
  '/:owner/:name': c('project', [addProject, route]),
  '/:owner/:name/:milestone': c('milestone', [addProject, route]),
  '/reset': function() {
    mediator.fire('!projects/clear');
    return window.location.hash = '#';
  }
};

module.exports = director.Router(routes).configure({
  'strict': false,
  notfound: function() {
    throw 404;
  }
});



},{"../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../views/pages/index.coffee":"/home/radek/dev/burnchart.io/src/views/pages/index.coffee","../views/pages/milestone.coffee":"/home/radek/dev/burnchart.io/src/views/pages/milestone.coffee","../views/pages/new.coffee":"/home/radek/dev/burnchart.io/src/views/pages/new.coffee","../views/pages/project.coffee":"/home/radek/dev/burnchart.io/src/views/pages/project.coffee","./mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","./vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/stats.coffee":[function(require,module,exports){
var moment, progress;

moment = require('./vendor.coffee').moment;

progress = function(a, b) {
  return 100 * (a / (b + a));
};

module.exports = function(milestone) {
  var a, b, c, days, isDone, isOnTime, isOverdue, points, time;
  isDone = false;
  isOnTime = true;
  isOverdue = false;
  points = progress(milestone.issues.closed.size, milestone.issues.open.size);
  if (points === 100) {
    isDone = true;
  }
  if (!milestone.due_on) {
    return {
      isOverdue: isOverdue,
      isOnTime: isOnTime,
      isDone: isDone,
      'progress': {
        points: points
      }
    };
  }
  a = +new Date(milestone.created_at);
  b = +(new Date);
  c = +new Date(milestone.due_on);
  if (b > c) {
    isOverdue = true;
  }
  time = progress(b - a, c - b);
  days = (moment(b).diff(moment(a), 'days')) / 100;
  isOnTime = points > time;
  return {
    isDone: isDone,
    days: days,
    isOnTime: isOnTime,
    isOverdue: isOverdue,
    'progress': {
      points: points,
      time: time
    }
  };
};



},{"./vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/modules/vendor.coffee":[function(require,module,exports){
module.exports = {
  '_': window._,
  'Ractive': window.Ractive,
  'Firebase': window.Firebase,
  'FirebaseSimpleLogin': window.FirebaseSimpleLogin,
  'SuperAgent': window.superagent,
  'async': window.async,
  'moment': window.moment,
  'd3': window.d3,
  'marked': window.marked,
  'director': {
    'Router': window.Router
  },
  'lscache': window.lscache,
  'sortedIndexCmp': window.sortedIndex,
  'semver': require('semver')
};



},{"semver":"/home/radek/dev/burnchart.io/vendor/node-semver/semver.js"}],"/home/radek/dev/burnchart.io/src/templates/app.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"app"},"f":[{"t":7,"e":"Notify"}," ",{"t":7,"e":"Header"}," ",{"t":7,"e":"div","a":{"id":"page"},"f":[]}," ",{"t":7,"e":"div","a":{"id":"footer"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":["&copy; 2012-2014 ",{"t":7,"e":"a","a":{"href":"http://cloudfi.re"},"f":["Cloudfire Systems"]}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/chart.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"chart"}}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/header.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"head"},"f":[{"t":4,"n":53,"r":"user","f":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","a":{"class":"right"},"t1":"fade","f":[{"t":4,"r":"displayName","f":[{"t":2,"r":"displayName"}," logged in"]},{"t":4,"n":51,"f":[{"t":7,"e":"a","a":{"class":"github"},"v":{"click":"!login"},"f":[{"t":7,"e":"Icons","a":{"icon":"github"}}," Sign In"]}],"r":"displayName"}]}]}]}," ",{"t":7,"e":"a","a":{"id":"icon","href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}]}," ",{"t":7,"e":"ul","f":[{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#new/project","class":"add"},"f":[{"t":7,"e":"Icons","a":{"icon":"plus-circled"}}," Add a Project"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#","class":"faq"},"f":["FAQ"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#reset"},"f":["DB Reset"]}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/hero.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"hero"},"f":[{"t":7,"e":"div","a":{"class":"content"},"f":[{"t":7,"e":"Icons","a":{"icon":"address"}}," ",{"t":7,"e":"h2","f":["See your project progress"]}," ",{"t":7,"e":"p","f":["Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable."]}," ",{"t":7,"e":"div","a":{"class":"cta"},"f":[{"t":7,"e":"a","a":{"href":"#new/project","class":"primary"},"f":[{"t":7,"e":"Icons","a":{"icon":"plus-circled"}}," Add your project"]}," ",{"t":7,"e":"a","a":{"href":"#","class":"secondary"},"f":["Read the Guide"]}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/icons.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"code","f":[{"t":7,"e":"span","a":{"class":["icon ",{"t":2,"r":"icon"}]},"f":[{"t":3,"x":{"r":["code"],"s":"\"&#\"+_0+\";\""}}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/notify.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"text","f":[{"t":4,"r":"system","f":[{"t":7,"e":"div","a":{"id":"notify","class":[{"t":2,"r":"type"}," system"],"style":["top:",{"t":2,"r":"top"},"%"]},"f":[{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}," ",{"t":7,"e":"p","f":[{"t":2,"r":"text"}]}]}]},{"t":4,"n":51,"f":[{"t":7,"e":"div","a":{"id":"notify","class":[{"t":2,"r":"type"}],"style":["top:",{"t":2,"x":{"r":["top"],"s":"-_0"}},"px"]},"f":[{"t":7,"e":"span","a":{"class":"close"},"v":{"click":"close"}}," ",{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}," ",{"t":7,"e":"p","f":[{"t":2,"r":"text"}]}]}],"r":"system"}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/pages/index.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":4,"n":50,"r":"projects.list","f":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"Projects","a":{"projects":[{"t":2,"r":"projects"}]}}]}]}]},{"t":4,"n":51,"f":[{"t":7,"e":"Hero"}],"r":"projects.list"}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/pages/milestone.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"div","a":{"id":"title"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":[{"t":7,"e":"h2","a":{"class":"title"},"f":[{"t":2,"x":{"r":["format","milestone.title"],"s":"_0.title(_1)"}}]}," ",{"t":7,"e":"span","a":{"class":"sub"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"p","a":{"class":"description"},"f":[{"t":3,"x":{"r":["format","milestone.description"],"s":"_0.markdown(_1)"}}]}]}]}," ",{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"Chart","a":{"milestone":[{"t":2,"r":"milestone"}]}}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/pages/new.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"div","a":{"id":"add"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"h2","f":["Add a Project"]}," ",{"t":7,"e":"p","f":["Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, ",{"t":7,"e":"a","a":{"href":"#"},"f":["Sign In"]}," first."]}]}," ",{"t":7,"e":"div","a":{"class":"form"},"f":[{"t":7,"e":"table","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","f":[{"t":7,"e":"input","a":{"type":"text","placeholder":"user/repo","autocomplete":"off","value":[{"t":2,"r":"value"}]},"v":{"keyup":{"n":"submit","d":[{"t":2,"r":"value"}]}}}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","v":{"click":{"n":"submit","d":[{"t":2,"r":"value"}]}},"f":["Add"]}]}]}]}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/pages/project.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"div","a":{"id":"title"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":[{"t":7,"e":"h2","a":{"class":"title"},"f":[{"t":2,"x":{"r":["route"],"s":"_0.join(\"/\")"}}]}]}]}," ",{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"Milestones","a":{"project":[{"t":2,"r":"project"}]}}]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/tables/milestones.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"class":"sort"},"v":{"click":"sortBy"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by ",{"t":2,"r":"projects.sortBy"}]}," ",{"t":7,"e":"h2","f":["Milestones"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{p:_1[_0]}"},"f":[{"t":4,"n":50,"x":{"r":["p.owner","project.owner","p.name","project.name"],"s":"_0==_1&&_2==_3"},"f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","a":{"class":[{"t":4,"n":50,"r":"milestone.stats.isDone","f":["done"]}]},"f":[{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"project.owner"},"/",{"t":2,"r":"project.name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":["due ",{"t":4,"n":50,"r":"milestone.stats.isOverdue","f":["red"]}]},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/tables/projects.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"class":"sort"},"v":{"click":"sortBy"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by ",{"t":2,"r":"projects.sortBy"}]}," ",{"t":7,"e":"h2","f":["Projects"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.list","f":[{"t":4,"n":50,"r":"errors","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"colspan":"3","class":"repo"},"f":[{"t":7,"e":"div","a":{"class":"project"},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}," ",{"t":7,"e":"span","a":{"class":"error","title":[{"t":2,"x":{"r":["errors"],"s":"_0.join(\"\\n\")"}}]},"f":[{"t":7,"e":"Icons","a":{"icon":"attention"}}]}]}]}]}]}]}," ",{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{project:_1[_0]}"},"f":[{"t":4,"n":53,"r":"project","f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","a":{"class":[{"t":4,"n":50,"r":"milestone.stats.isDone","f":["done"]}]},"f":[{"t":7,"e":"td","a":{"class":"repo"},"f":[{"t":7,"e":"a","a":{"class":"project","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":["due ",{"t":4,"n":50,"r":"milestone.stats.isOverdue","f":["red"]}]},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/utils/date.coffee":[function(require,module,exports){
module.exports = {
  now: function() {
    return new Date().toJSON();
  }
};



},{}],"/home/radek/dev/burnchart.io/src/utils/format.coffee":[function(require,module,exports){
var marked, moment, _, _ref;

_ref = require('../modules/vendor.coffee'), _ = _ref._, moment = _ref.moment, marked = _ref.marked;

module.exports = {
  fromNow: _.memoize(function(jsonDate) {
    return moment(new Date(jsonDate)).fromNow();
  }),
  due: function(jsonDate) {
    if (!jsonDate) {
      return '&nbsp;';
    }
    return ['due', this.fromNow(jsonDate)].join(' ');
  },
  markdown: function(markup) {
    return marked(markup);
  },
  title: function(text) {
    if (text.toLowerCase().indexOf('milestone') > -1) {
      return text;
    } else {
      return ['Milestone', text].join(' ');
    }
  },
  hexToDec: function(hex) {
    return parseInt(hex, 16);
  }
};



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/utils/key.coffee":[function(require,module,exports){
module.exports = {
  is: function(evt) {
    var _ref;
    return (_ref = evt.original.type) === 'keyup' || _ref === 'keydown';
  },
  isEnter: function(evt) {
    return evt.original.which === 13;
  }
};



},{}],"/home/radek/dev/burnchart.io/src/utils/mixins.coffee":[function(require,module,exports){
var _;

_ = require('../modules/vendor.coffee')._;

_.mixin({
  'pluckMany': function(source, keys) {
    if (!_.isArray(keys)) {
      throw '`keys` needs to be an Array';
    }
    return _.map(source, function(item) {
      var obj;
      obj = {};
      _.each(keys, function(key) {
        return obj[key] = item[key];
      });
      return obj;
    });
  },
  'isInt': function(val) {
    return !isNaN(val) && parseInt(Number(val)) === val && !isNaN(parseInt(val, 10));
  }
});



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee":[function(require,module,exports){
var Ractive, mediator, _, _ref;

_ref = require('../../modules/vendor.coffee'), Ractive = _ref.Ractive, _ = _ref._;

mediator = require('../../modules/mediator.coffee');

module.exports = Ractive.extend({
  subscribe: function(name, cb, ctx) {
    if (ctx == null) {
      ctx = this;
    }
    if (!_.isArray(this._subs)) {
      this._subs = [];
    }
    if (_.isFunction(cb)) {
      return this._subs.push(mediator.on(name, _.bind(cb, ctx)));
    } else {
      return console.log("Warning: `cb` is not a function");
    }
  },
  publish: function() {
    return mediator.fire.apply(mediator, arguments);
  },
  onteardown: function() {
    var sub, _i, _len, _ref1, _results;
    if (_.isArray(this._subs)) {
      _ref1 = this._subs;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        sub = _ref1[_i];
        if (_.isFunction(sub.cancel)) {
          _results.push(sub.cancel());
        } else {
          _results.push(console.log("Warning: `sub.cancel` is not a function"));
        }
      }
      return _results;
    }
  }
});



},{"../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/utils/ractive/model.coffee":[function(require,module,exports){
var Eventful;

Eventful = require('./eventful.coffee');

module.exports = function(opts) {
  var Model, model;
  Model = Eventful.extend(opts);
  model = new Model();
  model.render();
  return model;
};



},{"./eventful.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee"}],"/home/radek/dev/burnchart.io/src/views/chart.coffee":[function(require,module,exports){
var Ractive, axes, d3, lines, _ref;

_ref = require('../modules/vendor.coffee'), Ractive = _ref.Ractive, d3 = _ref.d3;

lines = require('../modules/chart/lines.coffee');

axes = require('../modules/chart/axes.coffee');

module.exports = Ractive.extend({
  'name': 'views/chart',
  'template': require('../templates/chart.html'),
  oncomplete: function() {
    var actual, head, height, ideal, issues, line, m, mAxis, margin, milestone, svg, tooltip, total, trend, width, x, xAxis, y, yAxis, _ref1;
    milestone = this.data.milestone;
    issues = milestone.issues;
    total = issues.open.size + issues.closed.size;
    head = issues.closed.list[0].closed_at;
    if (issues.length && milestone.created_at > head) {
      milestone.created_at = head;
    }
    actual = lines.actual(issues.closed.list, milestone.created_at, total);
    ideal = lines.ideal(milestone.created_at, milestone.due_on, total);
    trend = lines.trend(actual, milestone.created_at, milestone.due_on);
    _ref1 = this.el.getBoundingClientRect(), height = _ref1.height, width = _ref1.width;
    margin = {
      'top': 30,
      'right': 30,
      'bottom': 40,
      'left': 50
    };
    width -= margin.left + margin.right;
    height -= margin.top + margin.bottom;
    x = d3.time.scale().range([0, width]);
    y = d3.scale.linear().range([height, 0]);
    xAxis = axes.horizontal(height, x);
    yAxis = axes.vertical(width, y);
    line = d3.svg.line().interpolate("linear").x(function(d) {
      return x(d.date);
    }).y(function(d) {
      return y(d.points);
    });
    x.domain([ideal[0].date, ideal[ideal.length - 1].date]);
    y.domain([0, ideal[0].points]).nice();
    svg = d3.select(this.el.querySelector('#chart')).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g").attr("class", "x axis day").attr("transform", "translate(0," + height + ")").call(xAxis);
    m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    mAxis = xAxis.orient("top").tickSize(height).tickFormat(function(d) {
      return m[d.getMonth()];
    }).ticks(2);
    svg.append("g").attr("class", "x axis month").attr("transform", "translate(0," + height + ")").call(mAxis);
    svg.append("g").attr("class", "y axis").call(yAxis);
    svg.append("svg:line").attr("class", "today").attr("x1", x(new Date())).attr("y1", 0).attr("x2", x(new Date())).attr("y2", height);
    svg.append("path").attr("class", "ideal line").attr("d", line.interpolate("basis")(ideal));
    svg.append("path").attr("class", "trendline line").attr("d", line.interpolate("linear")(trend));
    svg.append("path").attr("class", "actual line").attr("d", line.interpolate("linear").y(function(d) {
      return y(d.points);
    })(actual));
    tooltip = d3.tip().attr('class', 'd3-tip').html(function(_arg) {
      var number, title;
      number = _arg.number, title = _arg.title;
      return "#" + number + ": " + title;
    });
    svg.call(tooltip);
    return svg.selectAll("a.issue").data(actual.slice(1)).enter().append('svg:a').attr("xlink:href", function(_arg) {
      var html_url;
      html_url = _arg.html_url;
      return html_url;
    }).attr("xlink:show", 'new').append('svg:circle').attr("cx", function(_arg) {
      var date;
      date = _arg.date;
      return x(date);
    }).attr("cy", function(_arg) {
      var points;
      points = _arg.points;
      return y(points);
    }).attr("r", function(_arg) {
      var radius;
      radius = _arg.radius;
      return 5;
    }).on('mouseover', tooltip.show).on('mouseout', tooltip.hide);
  }
});



},{"../modules/chart/axes.coffee":"/home/radek/dev/burnchart.io/src/modules/chart/axes.coffee","../modules/chart/lines.coffee":"/home/radek/dev/burnchart.io/src/modules/chart/lines.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/chart.html":"/home/radek/dev/burnchart.io/src/templates/chart.html"}],"/home/radek/dev/burnchart.io/src/views/header.coffee":[function(require,module,exports){
var Icons, Ractive, firebase, system, user;

Ractive = require('../modules/vendor.coffee').Ractive;

system = require('../models/system.coffee').system;

firebase = require('../models/firebase.coffee');

user = require('../models/user.coffee');

Icons = require('./icons.coffee');

module.exports = Ractive.extend({
  'name': 'views/header',
  'template': require('../templates/header.html'),
  'data': {
    'user': user,
    'icon': 'fire-station'
  },
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive],
  onconstruct: function() {
    return this.on('!login', function() {
      return firebase.login(function(err) {
        if (err) {
          throw err;
        }
      });
    });
  },
  onrender: function() {
    return system.observe('loading', (function(_this) {
      return function(ya) {
        return _this.set('icon', ya ? 'spinner1' : 'fire-station');
      };
    })(this));
  }
});



},{"../models/firebase.coffee":"/home/radek/dev/burnchart.io/src/models/firebase.coffee","../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../models/user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/header.html":"/home/radek/dev/burnchart.io/src/templates/header.html","./icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/hero.coffee":[function(require,module,exports){
var Icons, Ractive;

Ractive = require('../modules/vendor.coffee').Ractive;

Icons = require('./icons.coffee');

module.exports = Ractive.extend({
  'name': 'views/hero',
  'template': require('../templates/hero.html'),
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive]
});



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/hero.html":"/home/radek/dev/burnchart.io/src/templates/hero.html","./icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/icons.coffee":[function(require,module,exports){
var Ractive, codes, format;

Ractive = require('../modules/vendor.coffee').Ractive;

format = require('../utils/format.coffee');

codes = {
  'cog': '\e800',
  'search': '\e801',
  'github': '\e802',
  'address': '\e803',
  'plus-circled': '\e804',
  'fire-station': '\e805',
  'sort-alphabet': '\e806',
  'down-open': '\e807',
  'spin6': '\e808',
  'megaphone': '\e809',
  'spin4': '\e80a',
  'spinner1': '\e80b',
  'attention': '\e80c'
};

module.exports = Ractive.extend({
  'name': 'views/icons',
  'template': require('../templates/icons.html'),
  'isolated': true,
  onrender: function() {
    return this.observe('icon', function(icon) {
      var hex;
      if (icon && (hex = codes[icon])) {
        return this.set('code', format.hexToDec(hex));
      } else {
        return this.set('code', null);
      }
    });
  }
});



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/icons.html":"/home/radek/dev/burnchart.io/src/templates/icons.html","../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee"}],"/home/radek/dev/burnchart.io/src/views/notify.coffee":[function(require,module,exports){
var Eventful, HEIGHT, Icons, Ractive, d3, _, _ref;

_ref = require('../modules/vendor.coffee'), Ractive = _ref.Ractive, _ = _ref._, d3 = _ref.d3;

Eventful = require('../utils/ractive/eventful.coffee');

Icons = require('./icons.coffee');

HEIGHT = 68;

module.exports = Eventful.extend({
  'name': 'views/notify',
  'template': require('../templates/notify.html'),
  'data': {
    'top': HEIGHT,
    'hidden': true,
    'defaults': {
      'text': '',
      'type': '',
      'system': false,
      'icon': 'megaphone',
      'ttl': 5e3
    }
  },
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive],
  show: function(opts) {
    var pos;
    this.set('hidden', false);
    this.set(opts = _.defaults(opts, this.data.defaults));
    pos = [0, 50][+opts.system];
    this.animate('top', pos, {
      'easing': d3.ease('bounce'),
      'duration': 800
    });
    if (!opts.ttl) {
      return;
    }
    return _.delay(_.bind(this.hide, this), opts.ttl);
  },
  hide: function() {
    if (this.data.hidden) {
      return;
    }
    this.set('hidden', true);
    return this.animate('top', HEIGHT, {
      'easing': d3.ease('back'),
      'complete': (function(_this) {
        return function() {
          return _this.set('text', null);
        };
      })(this)
    });
  },
  onconstruct: function() {
    this.subscribe('!app/notify', this.show, this);
    this.subscribe('!app/notify/hide', this.hide, this);
    return this.on('close', this.hide);
  }
});



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/notify.html":"/home/radek/dev/burnchart.io/src/templates/notify.html","../utils/ractive/eventful.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee","./icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/index.coffee":[function(require,module,exports){
var Hero, Projects, Ractive, async, issues, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), Ractive = _ref.Ractive, _ = _ref._, async = _ref.async;

Hero = require('../hero.coffee');

Projects = require('../tables/projects.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

module.exports = Ractive.extend({
  'name': 'views/pages/index',
  'template': require('../../templates/pages/index.html'),
  'components': {
    Hero: Hero,
    Projects: Projects
  },
  'data': {
    'projects': projects,
    'ready': false
  },
  'adapt': [Ractive.adaptors.Ractive],
  onrender: function() {
    var done;
    document.title = 'Burnchart: GitHub Burndown Chart as a Service';
    if (!projects.list.length) {
      return this.set('ready', true);
    }
    done = system.async();
    return async.map(projects.data.list, function(project, cb) {
      return milestones.fetchAll(project, function(err, list) {
        if (err) {
          projects.saveError(project, err);
          return cb();
        }
        return async.each(list, function(milestone, cb) {
          if (_.find(project.milestones, function(_arg) {
            var number;
            number = _arg.number;
            return milestone.number === number;
          })) {
            return cb(null);
          }
          return issues.fetchAll({
            'owner': project.owner,
            'name': project.name,
            'milestone': milestone.number
          }, function(err, obj) {
            if (err) {
              projects.saveError(project, err);
              return cb();
            }
            _.extend(milestone, {
              'issues': obj
            });
            projects.addMilestone(project, milestone);
            return cb();
          });
        }, cb);
      });
    }, (function(_this) {
      return function() {
        done();
        return _this.set('ready', true);
      };
    })(this));
  }
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/index.html":"/home/radek/dev/burnchart.io/src/templates/pages/index.html","../hero.coffee":"/home/radek/dev/burnchart.io/src/views/hero.coffee","../tables/projects.coffee":"/home/radek/dev/burnchart.io/src/views/tables/projects.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/milestone.coffee":[function(require,module,exports){
var Chart, Eventful, async, format, issues, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, async = _ref.async;

Chart = require('../chart.coffee');

Eventful = require('../../utils/ractive/eventful.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

format = require('../../utils/format.coffee');

module.exports = Eventful.extend({
  'name': 'views/pages/chart',
  'template': require('../../templates/pages/milestone.html'),
  'components': {
    Chart: Chart
  },
  'data': {
    'format': format,
    'ready': false
  },
  onrender: function() {
    var done, fetchIssues, fetchMilestone, milestone, name, obj, owner, project, _ref1;
    _ref1 = this.get('route'), owner = _ref1[0], name = _ref1[1], milestone = _ref1[2];
    milestone = parseInt(milestone);
    document.title = "" + owner + "/" + name + "/" + milestone;
    project = projects.find({
      owner: owner,
      name: name
    });
    if (!project) {
      throw 500;
    }
    obj = _.find(project.milestones, {
      'number': milestone
    });
    if (obj != null) {
      return this.set({
        'milestone': obj,
        'ready': true
      });
    }
    done = system.async();
    fetchMilestone = function(cb) {
      return milestones.fetch({
        owner: owner,
        name: name,
        milestone: milestone
      }, cb);
    };
    fetchIssues = function(data, cb) {
      return issues.fetchAll({
        owner: owner,
        name: name,
        milestone: milestone
      }, function(err, obj) {
        return cb(err, _.extend(data, {
          'issues': obj
        }));
      });
    };
    return async.waterfall([fetchMilestone, fetchIssues], (function(_this) {
      return function(err, data) {
        done();
        if (err) {
          return _this.publish('!app/notify', {
            'text': err.toString(),
            'type': 'alert',
            'system': true,
            'ttl': null
          });
        }
        projects.addMilestone(project, data);
        if (data.stats.isDone) {
          _this.publish('!app/notify', {
            'text': 'The milestone is complete',
            'type': 'success'
          });
        }
        if (data.stats.isOverdue) {
          _this.publish('!app/notify', {
            'text': 'The milestone is overdue',
            'type': 'warn'
          });
        }
        return _this.set({
          'milestone': data,
          'ready': true
        });
      };
    })(this));
  }
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/milestone.html":"/home/radek/dev/burnchart.io/src/templates/pages/milestone.html","../../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee","../../utils/ractive/eventful.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee","../chart.coffee":"/home/radek/dev/burnchart.io/src/views/chart.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/new.coffee":[function(require,module,exports){
var Eventful, Ractive, key, system, user, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive;

Eventful = require('../../utils/ractive/eventful.coffee');

system = require('../../models/system.coffee');

user = require('../../models/user.coffee');

key = require('../../utils/key.coffee');

module.exports = Eventful.extend({
  'name': 'views/pages/new',
  'template': require('../../templates/pages/new.html'),
  'data': {
    'value': 'radekstepan/disposable',
    user: user
  },
  'adapt': [Ractive.adaptors.Ractive],
  submit: function(evt, value) {
    var name, owner, _ref1;
    if (key.is(evt) && !key.isEnter(evt)) {
      return;
    }
    _ref1 = value.split('/'), owner = _ref1[0], name = _ref1[1];
    this.publish('!projects/add', {
      owner: owner,
      name: name
    });
    return window.location.hash = '#';
  },
  onrender: function() {
    var autocomplete;
    document.title = 'Add a new project';
    autocomplete = function(value) {};
    this.observe('value', _.debounce(autocomplete, 200), {
      'init': false
    });
    this.el.querySelector('input').focus();
    return this.on('submit', this.submit);
  }
});



},{"../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../models/user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/new.html":"/home/radek/dev/burnchart.io/src/templates/pages/new.html","../../utils/key.coffee":"/home/radek/dev/burnchart.io/src/utils/key.coffee","../../utils/ractive/eventful.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/project.coffee":[function(require,module,exports){
var Eventful, Milestones, async, issues, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, async = _ref.async;

Milestones = require('../tables/milestones.coffee');

Eventful = require('../../utils/ractive/eventful.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

module.exports = Eventful.extend({
  'name': 'views/pages/project',
  'template': require('../../templates/pages/project.html'),
  'components': {
    Milestones: Milestones
  },
  'data': {
    'projects': projects,
    'ready': false
  },
  onrender: function() {
    var done, fetchIssues, fetchMilestones, findMilestone, name, owner, project, _ref1;
    _ref1 = this.get('route'), owner = _ref1[0], name = _ref1[1];
    document.title = "" + owner + "/" + name;
    this.set('project', project = projects.find({
      owner: owner,
      name: name
    }));
    if (!project) {
      throw 500;
    }
    done = system.async();
    findMilestone = function(number) {
      return _.find(project.milestones || [], {
        number: number
      });
    };
    fetchMilestones = function(cb) {
      return milestones.fetchAll(project, cb);
    };
    fetchIssues = function(allMilestones, cb) {
      if (!allMilestones.length) {
        return cb('The project has no milestones');
      }
      return async.each(allMilestones, function(milestone, cb) {
        if (findMilestone(milestone.number)) {
          return cb(null);
        }
        return issues.fetchAll({
          owner: owner,
          name: name,
          'milestone': milestone.number
        }, function(err, obj) {
          if (err) {
            return cb(err);
          }
          projects.addMilestone(project, _.extend(milestone, {
            'issues': obj
          }));
          return cb();
        });
      }, cb);
    };
    return async.waterfall([fetchMilestones, fetchIssues], (function(_this) {
      return function(err) {
        done();
        if (err) {
          return _this.publish('!app/notify', {
            'text': err.toString(),
            'type': 'alert',
            'system': true,
            'ttl': null
          });
        }
        return _this.set('ready', true);
      };
    })(this));
  }
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/project.html":"/home/radek/dev/burnchart.io/src/templates/pages/project.html","../../utils/ractive/eventful.coffee":"/home/radek/dev/burnchart.io/src/utils/ractive/eventful.coffee","../tables/milestones.coffee":"/home/radek/dev/burnchart.io/src/views/tables/milestones.coffee"}],"/home/radek/dev/burnchart.io/src/views/tables/milestones.coffee":[function(require,module,exports){
var Table;

Table = require('./table.coffee');

module.exports = Table.extend({
  'name': 'views/milestones',
  'template': require('../../templates/tables/milestones.html')
});



},{"../../templates/tables/milestones.html":"/home/radek/dev/burnchart.io/src/templates/tables/milestones.html","./table.coffee":"/home/radek/dev/burnchart.io/src/views/tables/table.coffee"}],"/home/radek/dev/burnchart.io/src/views/tables/projects.coffee":[function(require,module,exports){
var Table;

Table = require('./table.coffee');

module.exports = Table.extend({
  'name': 'views/projects',
  'template': require('../../templates/tables/projects.html')
});



},{"../../templates/tables/projects.html":"/home/radek/dev/burnchart.io/src/templates/tables/projects.html","./table.coffee":"/home/radek/dev/burnchart.io/src/views/tables/table.coffee"}],"/home/radek/dev/burnchart.io/src/views/tables/table.coffee":[function(require,module,exports){
var Icons, Ractive, format, projects;

Ractive = require('../../modules/vendor.coffee').Ractive;

format = require('../../utils/format.coffee');

Icons = require('../icons.coffee');

projects = require('../../models/projects.coffee');

module.exports = Ractive.extend({
  'name': 'views/table',
  'data': {
    format: format
  },
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive],
  onconstruct: function() {
    return this.on('sortBy', function() {
      var fns, idx;
      fns = projects.data.sortFns;
      idx = 1 + fns.indexOf(projects.data.sortBy);
      if (idx === fns.length) {
        idx = 0;
      }
      return projects.set('sortBy', fns[idx]);
    });
  }
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee","../icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/vendor/node-semver/semver.js":[function(require,module,exports){
(function (process){
// export the class if we are in a Node-like system.
if (typeof module === 'object' && module.exports === exports)
  exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ process.env &&
    /* nomin */ process.env.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
  /* nomin */ debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ };
/* nomin */ else
  /* nomin */ debug = function() {};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    re[i] = new RegExp(src[i]);
}

exports.parse = parse;
function parse(version, loose) {
  var r = loose ? re[LOOSE] : re[FULL];
  return (r.test(version)) ? new SemVer(version, loose) : null;
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      return version;
    else
      version = version.version;
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (!(this instanceof SemVer))
    return new SemVer(version, loose);

  debug('SemVer', version, loose);
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

  if (!m)
    throw new TypeError('Invalid Version: ' + version);

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  // numberify any prerelease numeric ids
  if (!m[4])
    this.prerelease = [];
  else
    this.prerelease = m[4].split('.').map(function(id) {
      return (/^[0-9]+$/.test(id)) ? +id : id;
    });

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    this.version += '-' + this.prerelease.join('.');
  return this.version;
};

SemVer.prototype.inspect = function() {
  return '<SemVer "' + this + '">';
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.loose, other);
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    return -1;
  else if (!this.prerelease.length && other.prerelease.length)
    return 1;
  else if (!this.prerelease.length && !other.prerelease.length)
    return 0;

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      return 0;
    else if (b === undefined)
      return 1;
    else if (a === undefined)
      return -1;
    else if (a === b)
      continue;
    else
      return compareIdentifiers(a, b);
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        this.major++;
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        this.minor++;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        this.patch++;
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        this.prerelease = [0];
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          this.prerelease.push(0);
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            this.prerelease = [identifier, 0];
        } else
          this.prerelease = [identifier, 0];
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(b);
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      return comp;
    else
      comp = comp.value;
  }

  if (!(this instanceof Comparator))
    return new Comparator(comp, loose);

  debug('comparator', comp, loose);
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    this.value = '';
  else
    this.value = this.operator + this.semver.version;

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    throw new TypeError('Invalid comparator: ' + comp);

  this.operator = m[1];
  if (this.operator === '=')
    this.operator = '';

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    this.semver = ANY;
  else
    this.semver = new SemVer(m[2], this.loose);
};

Comparator.prototype.inspect = function() {
  return '<SemVer Comparator "' + this + '">';
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.loose);

  if (this.semver === ANY)
    return true;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  return cmp(version, this.operator, this.semver, this.loose);
};


exports.Range = Range;
function Range(range, loose) {
  if ((range instanceof Range) && range.loose === loose)
    return range;

  if (!(this instanceof Range))
    return new Range(range, loose);

  this.loose = loose;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.inspect = function() {
  return '<SemVer Range "' + this.range + '">';
};

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.loose;
  range = range.trim();
  debug('range', range, loose);
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  debug('comp', comp);
  comp = replaceCarets(comp, loose);
  debug('caret', comp);
  comp = replaceTildes(comp, loose);
  debug('tildes', comp);
  comp = replaceXRanges(comp, loose);
  debug('xrange', comp);
  comp = replaceStars(comp, loose);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p))
      // ~1.2 == >=1.2.0- <1.3.0-
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  debug('caret', comp, loose);
  var r = loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p)) {
      if (M === '0')
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      else
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0';
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, loose) {
  debug('replaceXRanges', comp, loose);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      gtlt = '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        m = 0;
      if (xp)
        p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm)
          M = +M + 1
        else
          m = +m + 1
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, loose) {
  debug('replaceStars', comp, loose);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    from = '';
  else if (isX(fm))
    from = '>=' + fM + '.0.0';
  else if (isX(fp))
    from = '>=' + fM + '.' + fm + '.0';
  else
    from = '>=' + from;

  if (isX(tM))
    to = '';
  else if (isX(tm))
    to = '<' + (+tM + 1) + '.0.0';
  else if (isX(tp))
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  else if (tpr)
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  else
    to = '<=' + to;

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  if (!version)
    return false;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version))
      return true;
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      return false;
  }

  if (version.prerelease.length) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        return true;

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          return true;
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  return versions.filter(function(version) {
    return satisfies(version, range, loose);
  }).sort(function(a, b) {
    return rcompare(a, b, loose);
  })[0] || null;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, loose)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

// Use the define() function if we're in AMD land
if (typeof define === 'function' && define.amd)
  define(exports);

}).call(this,require('_process'))
},{"_process":"/home/radek/dev/burnchart.io/node_modules/browserify/node_modules/process/browser.js"}]},{},["/home/radek/dev/burnchart.io/src/app.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvYXBwLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9jb25maWcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvc3lzdGVtLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy91c2VyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL3JlcXVlc3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3JvdXRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3N0YXRzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvdmVuZG9yLmNvZmZlZSIsInNyYy90ZW1wbGF0ZXMvYXBwLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2NoYXJ0Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL3RlbXBsYXRlcy9oZXJvLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2ljb25zLmh0bWwiLCJzcmMvdGVtcGxhdGVzL25vdGlmeS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9kYXRlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2Zvcm1hdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9rZXkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbWl4aW5zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvcmFjdGl2ZS9tb2RlbC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9jaGFydC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZWFkZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaGVyby5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9pY29ucy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9ub3RpZnkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvaW5kZXguY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbWlsZXN0b25lLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL25ldy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9wcm9qZWN0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvdGFibGUuY29mZmVlIiwidmVuZG9yL25vZGUtc2VtdmVyL3NlbXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuIyBMb2Rhc2ggbWl4aW5zLlxucmVxdWlyZSAnLi91dGlscy9taXhpbnMuY29mZmVlJ1xuIyBXaWxsIGxvYWQgcHJvamVjdHMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5yZXF1aXJlICcuL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5cbkhlYWRlciA9IHJlcXVpcmUgJy4vdmlld3MvaGVhZGVyLmNvZmZlZSdcbk5vdGlmeSA9IHJlcXVpcmUgJy4vdmlld3Mvbm90aWZ5LmNvZmZlZSdcbnJvdXRlciA9IHJlcXVpcmUgJy4vbW9kdWxlcy9yb3V0ZXIuY29mZmVlJ1xuXG5uZXcgUmFjdGl2ZVxuICBcbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYXBwLmh0bWwnXG5cbiAgJ2VsJzogJ2JvZHknXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEhlYWRlciwgTm90aWZ5IH1cblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFN0YXJ0IHRoZSByb3V0ZXIuXG4gICAgcm91dGVyLmluaXQgJy8nIiwiTW9kZWwgPSByZXF1aXJlICcuLi91dGlscy9yYWN0aXZlL21vZGVsLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvY29uZmlnJ1xuXG4gIFwiZGF0YVwiOlxuICAgICMgRmlyZWJhc2UgYXBwIG5hbWUuXG4gICAgXCJmaXJlYmFzZVwiOiBcImJ1cm5jaGFydFwiXG4gICAgIyBEYXRhIHNvdXJjZSBwcm92aWRlci5cbiAgICBcInByb3ZpZGVyXCI6IFwiZ2l0aHViXCJcbiAgICAjIEZpZWxkcyB0byBrZWVwIGZyb20gR0ggcmVzcG9uc2VzLlxuICAgIFwiZmllbGRzXCI6XG4gICAgICBcIm1pbGVzdG9uZVwiOiBbXG4gICAgICAgIFwiY2xvc2VkX2lzc3Vlc1wiXG4gICAgICAgIFwiY3JlYXRlZF9hdFwiXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIlxuICAgICAgICBcImR1ZV9vblwiXG4gICAgICAgIFwibnVtYmVyXCJcbiAgICAgICAgXCJvcGVuX2lzc3Vlc1wiXG4gICAgICAgIFwidGl0bGVcIlxuICAgICAgICBcInVwZGF0ZWRfYXRcIlxuICAgICAgXVxuICAgICMgQ2hhcnQgY29uZmlndXJhdGlvbi5cbiAgICBcImNoYXJ0XCI6XG4gICAgICAjIERheXMgd2UgYXJlIG5vdCB3b3JraW5nLlxuICAgICAgXCJvZmZfZGF5c1wiOiBbIF1cbiAgICAgICMgSG93IGRvIHdlIHBhcnNlIEdpdEh1YiBkYXRlcz9cbiAgICAgIFwiZGF0ZXRpbWVcIjogL14oXFxkezR9LVxcZHsyfS1cXGR7Mn0pVCguKikvXG4gICAgICAjIEhvdyBkb2VzIGEgc2l6ZSBsYWJlbCBsb29rIGxpa2U/XG4gICAgICBcInNpemVfbGFiZWxcIjogL15zaXplIChcXGQrKSQvXG4gICAgICAjIEhvdyBkbyB3ZSBzcGVjaWZ5IHdoaWNoIHVzZXIvcmVwby8obWlsZXN0b25lKSB3ZSB3YW50P1xuICAgICAgXCJsb2NhdGlvblwiOiAvXiMhKChcXC9bXlxcL10rKXsyLDN9KSQvXG4gICAgICAjIFByb2Nlc3MgYWxsIGlzc3VlcyBhcyBvbmUgc2l6ZSAoT05FX1NJWkUpIG9yIHVzZSBsYWJlbHMgKExBQkVMUykuXG4gICAgICBcInBvaW50c1wiOiAnT05FX1NJWkUnIiwieyBGaXJlYmFzZSwgRmlyZWJhc2VTaW1wbGVMb2dpbiB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5Nb2RlbCAgPSByZXF1aXJlICcuLi91dGlscy9yYWN0aXZlL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHJpdmF0ZV9yZXBvJ1xuXG4gICMgTG9nb3V0IGEgdXNlci5cbiAgbG9nb3V0OiAtPlxuICAgIEBhdXRoPy5sb2dvdXRcbiAgICBkbyB1c2VyLnJlc2V0XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTZXR1cCBhIG5ldyBjbGllbnQuXG4gICAgQHNldCAnY2xpZW50JywgY2xpZW50ID0gbmV3IEZpcmViYXNlIFwiaHR0cHM6Ly8je2NvbmZpZy5kYXRhLmZpcmViYXNlfS5maXJlYmFzZWlvLmNvbVwiXG4gICAgXG4gICAgIyBDaGVjayBpZiB3ZSBoYXZlIGEgdXNlciBpbiBzZXNzaW9uLlxuICAgIEBhdXRoID0gbmV3IEZpcmViYXNlU2ltcGxlTG9naW4gY2xpZW50LCAoZXJyLCBvYmopIC0+XG4gICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICBcbiAgICAgICMgU2F2ZSB1c2VyLlxuICAgICAgdXNlci5zZXQgb2JqIGlmIG9ialxuICAgICAgIyBTYXkgd2UgYXJlIGRvbmUuXG4gICAgICB1c2VyLnNldCAncmVhZHknLCB5ZXMiLCJ7IF8sIGxzY2FjaGUsIHNvcnRlZEluZGV4Q21wLCBzZW12ZXIgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9yYWN0aXZlL21vZGVsLmNvZmZlZSdcbmNvbmZpZyAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5zdGF0cyAgICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvc3RhdHMuY29mZmVlJ1xuZGF0ZSAgICAgPSByZXF1aXJlICcuLi91dGlscy9kYXRlLmNvZmZlZSdcbnVzZXIgICAgID0gcmVxdWlyZSAnLi91c2VyLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvcHJvamVjdHMnXG5cbiAgJ2RhdGEnOlxuICAgICMgQ3VycmVudCBzb3J0IG9yZGVyLlxuICAgICdzb3J0QnknOiAncHJpb3JpdHknXG4gICAgIyBTb3J0IGZ1bmN0aW9ucy5cbiAgICAnc29ydEZucyc6IFsgJ3Byb2dyZXNzJywgJ3ByaW9yaXR5JywgJ25hbWUnIF1cblxuICAjIFJldHVybiBhIHNvcnQgb3JkZXIgY29tcGFyYXRvci5cbiAgY29tcGFyYXRvcjogLT5cbiAgICB7IGxpc3QsIHNvcnRCeSB9ID0gQGRhdGFcblxuICAgICMgQ29udmVydCBleGlzdGluZyBpbmRleCBpbnRvIGFjdHVhbCBwcm9qZWN0IG1pbGVzdG9uZS5cbiAgICBkZUlkeCA9IChmbikgPT5cbiAgICAgIChbIGksIGogXSwgcmVzdC4uLikgPT5cbiAgICAgICAgZm4uYXBwbHkgQCwgWyBbIGxpc3RbaV0sIGxpc3RbaV0ubWlsZXN0b25lc1tqXSBdIF0uY29uY2F0IHJlc3RcblxuICAgICMgU2V0IGRlZmF1bHQgZmllbGRzLCBpbiBwbGFjZS5cbiAgICBkZWZhdWx0cyA9IChhcnIsIGhhc2gpIC0+XG4gICAgICBmb3IgaXRlbSBpbiBhcnJcbiAgICAgICAgZm9yIGssIHYgb2YgaGFzaFxuICAgICAgICAgIHJlZiA9IGl0ZW1cbiAgICAgICAgICBmb3IgcCwgaSBpbiBrZXlzID0gay5zcGxpdCAnLidcbiAgICAgICAgICAgIGlmIGkgaXMga2V5cy5sZW5ndGggLSAxXG4gICAgICAgICAgICAgIHJlZltwXSA/PSB2XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJlZiA9IHJlZltwXSA/PSB7fVxuXG4gICAgIyBUaGUgYWN0dWFsIGZuIHNlbGVjdGlvbi5cbiAgICBzd2l0Y2ggc29ydEJ5XG4gICAgICAjIEZyb20gaGlnaGVzdCBwcm9ncmVzcyBwb2ludHMuXG4gICAgICB3aGVuICdwcm9ncmVzcycgdGhlbiBkZUlkeCAoWyBhUCwgYU0gXSwgWyBiUCwgYk0gXSkgLT5cbiAgICAgICAgZGVmYXVsdHMgWyBhTSwgYk0gXSwgeyAnc3RhdHMucHJvZ3Jlc3MucG9pbnRzJzogMCB9XG4gICAgICAgICMgU2ltcGxlIHBvaW50cyBkaWZmZXJlbmNlLlxuICAgICAgICBhTS5zdGF0cy5wcm9ncmVzcy5wb2ludHMgLSBiTS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcblxuICAgICAgIyBGcm9tIG1vc3QgZGVsYXllZCBpbiBkYXlzLlxuICAgICAgd2hlbiAncHJpb3JpdHknIHRoZW4gZGVJZHggKFsgYVAsIGFNIF0sIFsgYlAsIGJNIF0pIC0+XG4gICAgICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGRlYWRsaW5lIGFyZSBhbHdheXMgYXQgdGhlIFwiYmVnaW5uaW5nXCIuXG4gICAgICAgIGRlZmF1bHRzIFsgYU0sIGJNIF0sIHsgJ3N0YXRzLnByb2dyZXNzLnRpbWUnOiAwLCAnc3RhdHMuZGF5cyc6IDFlMyB9XG4gICAgICAgICMgJSBkaWZmZXJlbmNlIGluIHByb2dyZXNzIHRpbWVzIHRoZSBudW1iZXIgb2YgZGF5cyBhaGVhZCBvciBiZWhpbmQuXG4gICAgICAgIFsgJGEsICRiIF0gPSBfLm1hcCBbIGFNLCBiTSBdLCAoeyBzdGF0cyB9KSAtPlxuICAgICAgICAgIChzdGF0cy5wcm9ncmVzcy5wb2ludHMgLSBzdGF0cy5wcm9ncmVzcy50aW1lKSAqIHN0YXRzLmRheXNcblxuICAgICAgICAkYiAtICRhXG5cbiAgICAgICMgQmFzZWQgb24gcHJvamVjdCB0aGVuIG1pbGVzdG9uZSBuYW1lIGluY2x1ZGluZyBzZW12ZXIuXG4gICAgICB3aGVuICduYW1lJyB0aGVuIGRlSWR4IChbIGFQLCBhTSBdLCBbIGJQLCBiTSBdKSAtPlxuICAgICAgICByZXR1cm4gb3duZXIgaWYgb3duZXIgPSBiUC5vd25lci5sb2NhbGVDb21wYXJlIGFQLm93bmVyXG4gICAgICAgIHJldHVybiBuYW1lIGlmIG5hbWUgPSBiUC5uYW1lLmxvY2FsZUNvbXBhcmUgYVAubmFtZVxuICAgICAgICAjIFRyeSBzZW12ZXIuXG4gICAgICAgIGlmIHNlbXZlci52YWxpZChiTS50aXRsZSkgYW5kIHNlbXZlci52YWxpZChhTS50aXRsZSlcbiAgICAgICAgICBzZW12ZXIuZ3QgYk0udGl0bGUsIGFNLnRpdGxlXG4gICAgICAgICMgQmFjayB0byBzdHJpbmcgY29tcGFyZS5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGJNLnRpdGxlLmxvY2FsZUNvbXBhcmUgYU0udGl0bGVcblxuICAgICAgIyBUaGUgXCJ3aGF0ZXZlclwiIHNvcnQgb3JkZXIuLi5cbiAgICAgIGVsc2UgLT4gMFxuXG4gIGZpbmQ6IChwcm9qZWN0KSAtPlxuICAgIF8uZmluZCBAZGF0YS5saXN0LCBwcm9qZWN0XG5cbiAgZXhpc3RzOiAtPlxuICAgICEhQGZpbmQuYXBwbHkgQCwgYXJndW1lbnRzXG5cbiAgIyBQdXNoIHRvIHRoZSBzdGFjayB1bmxlc3MgaXQgZXhpc3RzIGFscmVhZHkuXG4gIGFkZDogKHByb2plY3QpIC0+XG4gICAgQHB1c2ggJ2xpc3QnLCBwcm9qZWN0IHVubGVzcyBAZXhpc3RzIHByb2plY3RcblxuICAjIEZpbmQgaW5kZXggb2YgYSBwcm9qZWN0LlxuICBmaW5kSW5kZXg6ICh7IG93bmVyLCBuYW1lIH0pIC0+XG4gICAgXy5maW5kSW5kZXggQGRhdGEubGlzdCwgeyBvd25lciwgbmFtZSB9XG5cbiAgIyBBZGQgYSBtaWxlc3RvbmUgZm9yIGEgcHJvamVjdC5cbiAgYWRkTWlsZXN0b25lOiAocHJvamVjdCwgbWlsZXN0b25lKSAtPlxuICAgICMgQWRkIGluIHRoZSBzdGF0cy5cbiAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ3N0YXRzJzogc3RhdHMobWlsZXN0b25lKSB9XG4gICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICB0aHJvdyA1MDAgaWYgKGkgPSBAZmluZEluZGV4KHByb2plY3QpKSA8IDAgXG5cbiAgICAjIEhhdmUgbWlsZXN0b25lcyBhbHJlYWR5P1xuICAgIGlmIHByb2plY3QubWlsZXN0b25lcz9cbiAgICAgIEBwdXNoIFwibGlzdC4je2l9Lm1pbGVzdG9uZXNcIiwgbWlsZXN0b25lXG4gICAgICBqID0gQGRhdGEubGlzdFtpXS5taWxlc3RvbmVzLmxlbmd0aCAtIDEgIyBpbmRleCBpbiBtaWxlc3RvbmVzXG4gICAgZWxzZVxuICAgICAgQHNldCBcImxpc3QuI3tpfS5taWxlc3RvbmVzXCIsIFsgbWlsZXN0b25lIF1cbiAgICAgIGogPSAwICAjIGluZGV4IGluIG1pbGVzdG9uZXNcblxuICAgICMgTm93IGluZGV4IHRoaXMgbWlsZXN0b25lLlxuICAgIEBzb3J0IFsgaSwgaiBdLCBbIHByb2plY3QsIG1pbGVzdG9uZSBdXG5cbiAgIyBTYXZlIGFuIGVycm9yIGZyb20gbG9hZGluZyBtaWxlc3RvbmVzIG9yIGlzc3Vlc1xuICBzYXZlRXJyb3I6IChwcm9qZWN0LCBlcnIpIC0+XG4gICAgaWYgKGlkeCA9IEBmaW5kSW5kZXgocHJvamVjdCkpID4gLTFcbiAgICAgIGlmIHByb2plY3QuZXJyb3JzP1xuICAgICAgICBAcHVzaCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBbIGVyciBdXG4gICAgZWxzZVxuICAgICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICAgIHRocm93IDUwMCAgXG5cbiAgY2xlYXI6IC0+XG4gICAgQHNldCAnbGlzdCc6IFtdLCAnaW5kZXgnOiBbXVxuXG4gICMgU29ydC9vciBpbnNlcnQgaW50byBhbiBhbHJlYWR5IHNvcnRlZCBpbmRleC5cbiAgc29ydDogKHJlZiwgZGF0YSkgLT5cbiAgICAjIEdldCBvciBpbml0aWFsaXplIHRoZSBpbmRleC5cbiAgICBpbmRleCA9IEBkYXRhLmluZGV4IG9yIFtdXG5cbiAgICAjIERvIG9uZS5cbiAgICBpZiByZWZcbiAgICAgIGlkeCA9IHNvcnRlZEluZGV4Q21wIGluZGV4LCBkYXRhLCBkbyBAY29tcGFyYXRvclxuICAgICAgaW5kZXguc3BsaWNlIGlkeCwgMCwgcmVmXG4gICAgIyBEbyBhbGwuXG4gICAgZWxzZVxuICAgICAgZm9yIHAsIGkgaW4gQGRhdGEubGlzdFxuICAgICAgICAjIFRPRE86IG5lZWQgdG8gc2hvdyBwcm9qZWN0cyB0aGF0IGZhaWxlZCB0b28uLi5cbiAgICAgICAgY29udGludWUgdW5sZXNzIHAubWlsZXN0b25lcz9cbiAgICAgICAgZm9yIG0sIGogaW4gcC5taWxlc3RvbmVzXG4gICAgICAgICAgIyBSdW4gYSBjb21wYXJhdG9yIGhlcmUgaW5zZXJ0aW5nIGludG8gaW5kZXguXG4gICAgICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIFsgcCwgbSBdLCBkbyBAY29tcGFyYXRvclxuICAgICAgICAgICMgTG9nLlxuICAgICAgICAgIGluZGV4LnNwbGljZSBpZHgsIDAsIFsgaSwgaiBdXG5cbiAgICAjIFNhdmUgdGhlIGluZGV4LlxuICAgIEBzZXQgJ2luZGV4JywgaW5kZXhcblxuICBvbmNvbnN0cnVjdDogLT5cbiAgICBAc3Vic2NyaWJlICchcHJvamVjdHMvYWRkJywgICAgQGFkZCwgQFxuICAgIEBzdWJzY3JpYmUgJyFwcm9qZWN0cy9jbGVhcicsICBAY2xlYXIsIEBcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIEluaXQgdGhlIHByb2plY3RzLlxuICAgIEBzZXQgJ2xpc3QnLCBsc2NhY2hlLmdldCgncHJvamVjdHMnKSBvciBbXVxuXG4gICAgIyBQZXJzaXN0IHByb2plY3RzIGluIGxvY2FsIHN0b3JhZ2UgKHNhbnMgbWlsZXN0b25lcykuXG4gICAgQG9ic2VydmUgJ2xpc3QnLCAocHJvamVjdHMpIC0+XG4gICAgICBsc2NhY2hlLnNldCAncHJvamVjdHMnLCBfLnBsdWNrTWFueSBwcm9qZWN0cywgWyAnb3duZXInLCAnbmFtZScgXVxuICAgICwgJ2luaXQnOiBub1xuXG4gICAgIyBSZXNldCBvdXIgaW5kZXggYW5kIHJlLXNvcnQuXG4gICAgQG9ic2VydmUgJ3NvcnRCeScsIC0+XG4gICAgICAjIFVzZSBwb3AgYXMgUmFjdGl2ZSBpcyBnbGl0Y2h5IHdoZW4gcmVzZXR0aW5nIGFycmF5cy5cbiAgICAgIEBzZXQgJ2luZGV4JywgbnVsbFxuICAgICAgI8KgUnVuIHRoZSBzb3J0IGFnYWluLlxuICAgICAgZG8gQHNvcnRcbiAgICAsICdpbml0Jzogbm8iLCJNb2RlbCA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvbW9kZWwuY29mZmVlJ1xuXG4jIFN5c3RlbSBzdGF0ZS5cbnN5c3RlbSA9IG5ldyBNb2RlbFxuICBcbiAgJ25hbWUnOiAnbW9kZWxzL3N5c3RlbSdcblxuICAnZGF0YSc6XG4gICAgJ2xvYWRpbmcnOiBub1xuXG5jb3VudGVyID0gMFxuYXN5bmMgPSAtPlxuICBjb3VudGVyICs9IDFcbiAgc3lzdGVtLnNldCAnbG9hZGluZycsIHllc1xuICAtPlxuICAgIGNvdW50ZXIgLT0gMVxuICAgIHN5c3RlbS5zZXQgJ2xvYWRpbmcnLCArY291bnRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgc3lzdGVtLCBhc3luYyB9IiwiTW9kZWwgPSByZXF1aXJlICcuLi91dGlscy9yYWN0aXZlL21vZGVsLmNvZmZlZSdcblxuIyBDdXJyZW50bHkgbG9nZ2VkLWluIHVzZXIuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy91c2VyJ1xuXG4gICMgRGVmYXVsdCB0byBhIGxvY2FsIHVzZXIuXG4gICdkYXRhJzpcbiAgICAncHJvdmlkZXInOiAgXCJsb2NhbFwiXG4gICAgJ2lkJzogICAgICAgIFwiMFwiXG4gICAgJ3VpZCc6ICAgICAgIFwibG9jYWw6MFwiXG4gICAgJ3Rva2VuJzogICAgIG51bGwiLCJ7IGQzIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgaG9yaXpvbnRhbDogKGhlaWdodCwgeCkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHgpXG4gICAgICAub3JpZW50KFwiYm90dG9tXCIpXG4gICAgICAjIFNob3cgdmVydGljYWwgbGluZXMuLi5cbiAgICAgIC50aWNrU2l6ZSgtaGVpZ2h0KVxuICAgICAgIyAuLi53aXRoIGRheSBvZiB0aGUgbW9udGguLi5cbiAgICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gZC5nZXREYXRlKCkgKVxuICAgICAgIyAuLi5hbmQgZ2l2ZSB1cyBhIHNwYWNlci5cbiAgICAgIC50aWNrUGFkZGluZygxMClcblxuICB2ZXJ0aWNhbDogKHdpZHRoLCB5KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeSlcbiAgICAgIC5vcmllbnQoXCJsZWZ0XCIpXG4gICAgICAudGlja1NpemUoLXdpZHRoKVxuICAgICAgLnRpY2tzKDUpXG4gICAgICAudGlja1BhZGRpbmcoMTApIiwieyBfLCBkMyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5jb25maWcgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgQSBncmFwaCBvZiBjbG9zZWQgaXNzdWVzLlxuICAjIGBpc3N1ZXNgOiAgICAgaXNzdWVzIGxpc3RcbiAgIyBgY3JlYXRlZF9hdGA6IG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYHRvdGFsYDogICAgdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGFjdHVhbDogKGlzc3VlcywgY3JlYXRlZF9hdCwgdG90YWwpIC0+XG4gICAgaGVhZCA9IFsge1xuICAgICAgJ2RhdGUnOiBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgICAncG9pbnRzJzogdG90YWxcbiAgICB9IF1cbiAgICBcbiAgICBtaW4gPSArSW5maW5pdHkgOyBtYXggPSAtSW5maW5pdHlcblxuICAgICMgR2VuZXJhdGUgdGhlIGFjdHVhbCBjbG9zZXMuXG4gICAgcmVzdCA9IF8ubWFwIGlzc3VlcywgKGlzc3VlKSAtPlxuICAgICAgeyBzaXplLCBjbG9zZWRfYXQgfSA9IGlzc3VlXG4gICAgICAjIERldGVybWluZSB0aGUgcmFuZ2UuXG4gICAgICBtaW4gPSBzaXplIGlmIHNpemUgPCBtaW5cbiAgICAgIG1heCA9IHNpemUgaWYgc2l6ZSA+IG1heFxuXG4gICAgICAjIERyb3BwaW5nIHBvaW50cyByZW1haW5pbmcuXG4gICAgICBpc3N1ZS5kYXRlID0gbmV3IERhdGUgY2xvc2VkX2F0XG4gICAgICBpc3N1ZS5wb2ludHMgPSB0b3RhbCAtPSBzaXplXG4gICAgICBpc3N1ZVxuICAgIFxuICAgICMgTm93IGFkZCBhIHJhZGl1cyBpbiBhIHJhbmdlICh3aWxsIGJlIHVzZWQgZm9yIGEgY2lyY2xlKS5cbiAgICByYW5nZSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbIG1pbiwgbWF4IF0pLnJhbmdlKFsgNSwgOCBdKVxuXG4gICAgcmVzdCA9IF8ubWFwIHJlc3QsIChpc3N1ZSkgLT5cbiAgICAgIGlzc3VlLnJhZGl1cyA9IHJhbmdlIGlzc3VlLnNpemVcbiAgICAgIGlzc3VlXG5cbiAgICBbXS5jb25jYXQgaGVhZCwgcmVzdFxuXG4gICMgQSBncmFwaCBvZiBhbiBpZGVhbCBwcm9ncmVzc2lvbi4uXG4gICMgYGFgOiAgIG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYGJgOiAgIG1pbGVzdG9uZSBlbmQgZGF0ZVxuICAjIGB0b3RhbGA6IHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBpZGVhbDogKGEsIGIsIHRvdGFsKSAtPlxuICAgICMgU3dhcD9cbiAgICBbIGIsIGEgXSA9IFsgYSwgYiBdIGlmIGIgPCBhXG5cbiAgICAjIFdlIHN0YXJ0IGhlcmUgYWRkaW5nIGRheXMgdG8gYGRgLlxuICAgIFsgeSwgbSwgZCBdID0gXy5tYXAgYS5tYXRjaChjb25maWcuZGF0YS5jaGFydC5kYXRldGltZSlbMV0uc3BsaXQoJy0nKSwgKHYpIC0+IHBhcnNlSW50IHZcbiAgICAjIFdlIHdhbnQgdG8gZW5kIGhlcmUuXG4gICAgY3V0b2ZmID0gbmV3IERhdGUoYilcblxuICAgICMgR28gdGhyb3VnaCB0aGUgYmVnaW5uaW5nIHRvIHRoZSBlbmQgc2tpcHBpbmcgb2ZmIGRheXMuXG4gICAgZGF5cyA9IFtdIDsgbGVuZ3RoID0gMFxuICAgIGRvIG9uY2UgPSAoaW5jID0gMCkgLT5cbiAgICAgICMgQSBuZXcgZGF5LlxuICAgICAgZGF5ID0gbmV3IERhdGUgeSwgbSAtIDEsIGQgKyBpbmNcbiAgICAgIFxuICAgICAgIyBEb2VzIHRoaXMgZGF5IGNvdW50P1xuICAgICAgZGF5X29mID0gNyBpZiAhZGF5X29mID0gZGF5LmdldERheSgpXG4gICAgICBpZiBkYXlfb2YgaW4gY29uZmlnLmRhdGEuY2hhcnQub2ZmX2RheXNcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5LCBvZmZfZGF5OiB5ZXMgfVxuICAgICAgZWxzZVxuICAgICAgICBsZW5ndGggKz0gMVxuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXkgfVxuICAgICAgXG4gICAgICAjIEdvIGFnYWluP1xuICAgICAgb25jZShpbmMgKyAxKSB1bmxlc3MgZGF5ID4gY3V0b2ZmXG5cbiAgICAjIE1hcCBwb2ludHMgb24gdGhlIGFycmF5IG9mIGRheXMgbm93LlxuICAgIHZlbG9jaXR5ID0gdG90YWwgLyAobGVuZ3RoIC0gMSlcblxuICAgIGRheXMgPSBfLm1hcCBkYXlzLCAoZGF5LCBpKSAtPlxuICAgICAgZGF5LnBvaW50cyA9IHRvdGFsXG4gICAgICB0b3RhbCAtPSB2ZWxvY2l0eSBpZiBkYXlzW2ldIGFuZCBub3QgZGF5c1tpXS5vZmZfZGF5XG4gICAgICBkYXlcblxuICAgICMgRG8gd2UgbmVlZCB0byBtYWtlIGEgbGluayB0byByaWdodCBub3c/XG4gICAgZGF5cy5wdXNoIHsgZGF0ZTogbm93LCBwb2ludHM6IDAgfSBpZiAobm93ID0gbmV3IERhdGUoKSkgPiBjdXRvZmZcblxuICAgIGRheXNcblxuICAjIEdyYXBoIHJlcHJlc2VudGluZyBhIHRyZW5kbGluZyBvZiBhY3R1YWwgaXNzdWVzLlxuICB0cmVuZDogKGFjdHVhbCwgY3JlYXRlZF9hdCwgZHVlX29uKSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgYWN0dWFsLmxlbmd0aFxuXG4gICAgc3RhcnQgPSArYWN0dWFsWzBdLmRhdGVcblxuICAgICMgVmFsdWVzIGlzIGEgbGlzdCBvZiB0aW1lIGZyb20gdGhlIHN0YXJ0IGFuZCBwb2ludHMgcmVtYWluaW5nLlxuICAgIHZhbHVlcyA9IF8ubWFwIGFjdHVhbCwgKHsgZGF0ZSwgcG9pbnRzIH0pIC0+XG4gICAgICBbICtkYXRlIC0gc3RhcnQsIHBvaW50cyBdXG5cbiAgICAjIE5vdyBpcyBhbiBhY3R1YWwgcG9pbnQgdG9vLlxuICAgIGxhc3QgPSBhY3R1YWxbYWN0dWFsLmxlbmd0aCAtIDFdXG4gICAgdmFsdWVzLnB1c2ggWyArIG5ldyBEYXRlKCkgLSBzdGFydCwgbGFzdC5wb2ludHMgXVxuXG4gICAgIyBodHRwOi8vY2xhc3Nyb29tLnN5bm9ueW0uY29tL2NhbGN1bGF0ZS10cmVuZGxpbmUtMjcwOS5odG1sXG4gICAgYjEgPSAwIDsgZSA9IDAgOyBjMSA9IDBcbiAgICBhID0gKGwgPSB2YWx1ZXMubGVuZ3RoKSAqIF8ucmVkdWNlKHZhbHVlcywgKHN1bSwgWyBhLCBiIF0pIC0+XG4gICAgICBiMSArPSBhIDsgZSArPSBiXG4gICAgICBjMSArPSBNYXRoLnBvdyhhLCAyKVxuICAgICAgc3VtICsgKGEgKiBiKVxuICAgICwgMClcblxuICAgIHNsb3BlID0gKGEgLSAoYjEgKiBlKSkgLyAoKGwgKiBjMSkgLSAoTWF0aC5wb3coYjEsIDIpKSlcbiAgICBpbnRlcmNlcHQgPSAoZSAtIChzbG9wZSAqIGIxKSkgLyBsXG4gICAgZm4gPSAoeCkgLT4gc2xvcGUgKiB4ICsgaW50ZXJjZXB0XG5cbiAgICAjIE1pbGVzdG9uZSBhbHdheXMgaGFzIGEgY3JlYXRpb24gZGF0ZS5cbiAgICBjcmVhdGVkX2F0ID0gbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICMgRHVlIGRhdGUgY2FuIGJlIGVtcHR5LlxuICAgIGR1ZV9vbiA9IGlmIGR1ZV9vbiB0aGVuIG5ldyBEYXRlKGR1ZV9vbikgZWxzZSBuZXcgRGF0ZSgpXG5cbiAgICBhID0gY3JlYXRlZF9hdCAtIHN0YXJ0XG4gICAgYiA9IGR1ZV9vbiAtIHN0YXJ0XG5cbiAgICBbXG4gICAgICB7XG4gICAgICAgICdkYXRlJzogY3JlYXRlZF9hdFxuICAgICAgICAncG9pbnRzJzogZm4oYSlcbiAgICAgIH0sIHtcbiAgICAgICAgJ2RhdGUnOiBkdWVfb25cbiAgICAgICAgJ3BvaW50cyc6IGZuKGIpXG4gICAgICB9XG4gICAgXSIsInsgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbiMhL3Vzci9iaW4vZW52IGNvZmZlZVxuY29uZmlnICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGlzc3VlcyBmb3IgYSBtaWxlc3RvbmUuXG4gIGZldGNoQWxsOiAocmVwbywgY2IpIC0+XG4gICAgIyBDYWxjdWxhdGUgc2l6ZSBvZiBlaXRoZXIgb3BlbiBvciBjbG9zZWQgaXNzdWVzLlxuICAgICMgTW9kaWZpZXMgaXNzdWVzIGJ5IHJlZi5cbiAgICBjYWxjU2l6ZSA9IChsaXN0LCBjYikgLT5cbiAgICAgIHN3aXRjaCBjb25maWcuZGF0YS5jaGFydC5wb2ludHNcbiAgICAgICAgd2hlbiAnT05FX1NJWkUnXG4gICAgICAgICAgc2l6ZSA9IGxpc3QubGVuZ3RoXG5cbiAgICAgICAgICAoIGlzc3VlLnNpemUgPSAxIGZvciBpc3N1ZSBpbiBsaXN0IClcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG4gICAgICAgIFxuICAgICAgICB3aGVuICdMQUJFTFMnXG4gICAgICAgICAgc2l6ZSA9IDBcblxuICAgICAgICAgIGxpc3QgPSBfLmZpbHRlciBsaXN0LCAoaXNzdWUpIC0+XG4gICAgICAgICAgICAjIFNraXAgaWYgbm8gbGFiZWxzIGV4aXN0LlxuICAgICAgICAgICAgcmV0dXJuIG5vIHVubGVzcyBsYWJlbHMgPSBpc3N1ZS5sYWJlbHNcblxuICAgICAgICAgICAgIyBEZXRlcm1pbmUgdGhlIHRvdGFsIGlzc3VlIHNpemUgZnJvbSBhbGwgbGFiZWxzLlxuICAgICAgICAgICAgaXNzdWUuc2l6ZSA9IF8ucmVkdWNlIGxhYmVscywgKHN1bSwgbGFiZWwpIC0+XG4gICAgICAgICAgICAgICMgTm90IG1hdGNoaW5nLlxuICAgICAgICAgICAgICByZXR1cm4gc3VtIHVubGVzcyBtYXRjaGVzID0gbGFiZWwubmFtZS5tYXRjaCBjb25maWcuZGF0YS5jaGFydC5zaXplX2xhYmVsXG4gICAgICAgICAgICAgICMgSW5jcmVhc2Ugc3VtLlxuICAgICAgICAgICAgICBzdW0gKz0gcGFyc2VJbnQgbWF0Y2hlc1sxXVxuICAgICAgICAgICAgLCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgSW5jcmVhc2UgdGhlIHRvdGFsLlxuICAgICAgICAgICAgc2l6ZSArPSBpc3N1ZS5zaXplXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQXJlIHdlIHNhdmluZyBpdD9cbiAgICAgICAgICAgICEhaXNzdWUuc2l6ZVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cblxuICAgICMgRm9yIGVhY2ggc3RhdGUuLi5cbiAgICBvbmVTdGF0dXMgPSAoc3RhdGUsIGNiKSAtPlxuICAgICAgIyBDb25jYXQgdGhlbSBoZXJlLlxuICAgICAgcmVzdWx0cyA9IFtdXG5cbiAgICAgICMgT25lIHBhZ2VmdWwgZmV0Y2ggKG5leHQgcGFnZXMgaW4gc2VyaWVzKS5cbiAgICAgIGRvIGZldGNoUGFnZSA9IChwYWdlPTEpIC0+XG4gICAgICAgIHJlcXVlc3QuYWxsSXNzdWVzIHJlcG8sIHsgc3RhdGUsIHBhZ2UgfSwgKGVyciwgZGF0YSkgLT5cbiAgICAgICAgICAjIEVycm9ycz9cbiAgICAgICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICAgICAgICMgRW1wdHk/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgICAgICAgIyBDb25jYXQgc29ydGVkIChhcGkgZG9lcyBub3Qgc29ydCBvbiBjbG9zZWRfYXQhKS5cbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQgXy5zb3J0QnkgZGF0YSwgJ2Nsb3NlZF9hdCdcbiAgICAgICAgICAjIDwgMTAwIHJlc3VsdHM/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgaWYgZGF0YS5sZW5ndGggPCAxMDBcbiAgICAgICAgICAjIEZldGNoIHRoZSBuZXh0IHBhZ2UgdGhlbi5cbiAgICAgICAgICBmZXRjaFBhZ2UgcGFnZSArIDFcblxuICAgICMgRm9yIGVhY2ggYG9wZW5gIGFuZCBgY2xvc2VkYCBpc3N1ZXMgaW4gcGFyYWxsZWwuXG4gICAgYXN5bmMucGFyYWxsZWwgW1xuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnb3BlbicpLCAgIGNhbGNTaXplIF1cbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ2Nsb3NlZCcpLCBjYWxjU2l6ZSBdXG4gICAgXSwgKGVyciwgWyBvcGVuLCBjbG9zZWQgXSkgLT5cbiAgICAgIGNiIGVyciwgeyBvcGVuLCBjbG9zZWQgfSIsIiMhL3Vzci9iaW4vZW52IGNvZmZlZVxucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGEgbWlsZXN0b25lLlxuICAnZmV0Y2gnOiByZXF1ZXN0Lm9uZU1pbGVzdG9uZVxuXG4gICMgRmV0Y2ggYWxsIG1pbGVzdG9uZXMuXG4gICdmZXRjaEFsbCc6IHJlcXVlc3QuYWxsTWlsZXN0b25lc1xuXG4gICAgIyAjIEdldCB0aGUgY3VycmVudCBtaWxlc3RvbmUgb3V0IG9mIG1hbnkuXG4gICAgIyBlbHNlXG4gICAgIyAgIHJlcXVlc3QuYWxsTWlsZXN0b25lcyByZXBvLCAoZXJyLCBkYXRhKSAtPlxuICAgICMgICAgICMgRXJyb3JzP1xuICAgICMgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgIyAgICAgIyBFbXB0eSB3YXJuaW5nP1xuICAgICMgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIG9wZW4gbWlsZXN0b25lcyBmb3IgcmVwbyAje3JlcG8ucGF0aH1cIiB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LlxuICAgICMgICAgIG0gPSBkYXRhWzBdXG4gICAgIyAgICAgIyBGaWx0ZXIgbWlsZXN0b25lcyB3aXRob3V0IGR1ZSBkYXRlLlxuICAgICMgICAgIG0gPSBfLnJlc3QgZGF0YSwgeyAnZHVlX29uJyA6IG51bGwgfVxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuIFByZWZlciBtaWxlc3RvbmVzIHdpdGggZHVlIGRhdGVzLlxuICAgICMgICAgIG0gPSBpZiBtWzBdIHRoZW4gbVswXSBlbHNlIGRhdGFbMF1cbiAgICAjICAgICAjIEVtcHR5IG1pbGVzdG9uZT9cbiAgICAjICAgICBpZiBtLm9wZW5faXNzdWVzICsgbS5jbG9zZWRfaXNzdWVzIGlzIDBcbiAgICAjICAgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIGlzc3VlcyBmb3IgbWlsZXN0b25lIGAje20udGl0bGV9YFwiXG5cbiAgICAjICAgICBjYiBudWxsLCBudWxsLCBtIiwieyBfLCBTdXBlckFnZW50IH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG51c2VyID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuXG4jIEN1c3RvbSBKU09OIHBhcnNlci5cblN1cGVyQWdlbnQucGFyc2UgPVxuICAnYXBwbGljYXRpb24vanNvbic6IChyZXMpIC0+XG4gICAgdHJ5XG4gICAgICBKU09OLnBhcnNlIHJlc1xuICAgIGNhdGNoIGVcbiAgICAgIHt9ICMgaXQgd2FzIG5vdCB0byBiZS4uLlxuXG4jIERlZmF1bHQgYXJncy5cbmRlZmF1bHRzID1cbiAgJ2dpdGh1Yic6XG4gICAgJ2hvc3QnOiAnYXBpLmdpdGh1Yi5jb20nXG4gICAgJ3Byb3RvY29sJzogJ2h0dHBzJ1xuXG4jIFB1YmxpYyBhcGkuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFxuICAjIEdldCBhIHJlcG8uXG4gIHJlcG86ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9XCJcbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgb3BlbiBtaWxlc3RvbmVzLlxuICBhbGxNaWxlc3RvbmVzOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT4gXG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lc1wiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuICBcbiAgIyBHZXQgb25lIG9wZW4gbWlsZXN0b25lLlxuICBvbmVNaWxlc3RvbmU6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzLyN7bWlsZXN0b25lfVwiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBpc3N1ZXMgZm9yIGEgc3RhdGUuXG4gIGFsbElzc3VlczogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBxdWVyeSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9pc3N1ZXNcIlxuICAgICAgICAncXVlcnknOiAgXy5leHRlbmQgcXVlcnksIHsgbWlsZXN0b25lLCAncGVyX3BhZ2UnOiAnMTAwJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiMgTWFrZSBhIHJlcXVlc3QgdXNpbmcgU3VwZXJBZ2VudC5cbnJlcXVlc3QgPSAoeyBwcm90b2NvbCwgaG9zdCwgcGF0aCwgcXVlcnksIGhlYWRlcnMgfSwgY2IpIC0+XG4gIGV4aXRlZCA9IG5vXG5cbiAgIyBNYWtlIHRoZSBxdWVyeSBwYXJhbXMuXG4gIHEgPSBpZiBxdWVyeSB0aGVuICc/JyArICggXCIje2t9PSN7dn1cIiBmb3IgaywgdiBvZiBxdWVyeSApLmpvaW4oJyYnKSBlbHNlICcnXG5cbiAgIyBUaGUgVVJJLlxuICByZXEgPSBTdXBlckFnZW50LmdldChcIiN7cHJvdG9jb2x9Oi8vI3tob3N0fSN7cGF0aH0je3F9XCIpXG4gICMgQWRkIGhlYWRlcnMuXG4gICggcmVxLnNldChrLCB2KSBmb3IgaywgdiBvZiBoZWFkZXJzIClcbiAgXG4gICMgVGltZW91dCBmb3IgcmVxdWVzdHMgdGhhdCBkbyBub3QgZmluaXNoLi4uIHNlZSAjMzIuXG4gIHRpbWVvdXQgPSBzZXRUaW1lb3V0IC0+XG4gICAgZXhpdGVkID0geWVzXG4gICAgY2IgJ1JlcXVlc3QgaGFzIHRpbWVkIG91dCdcbiAgLCAxZTQgIyBnaXZlIHVzIDEwc1xuXG4gICMgU2VuZC5cbiAgcmVxLmVuZCAoZXJyLCBkYXRhKSAtPlxuICAgICMgQXJyaXZlZCB0b28gbGF0ZS5cbiAgICByZXR1cm4gaWYgZXhpdGVkXG4gICAgIyBBbGwgZmluZS5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjbGVhclRpbWVvdXQgdGltZW91dFxuICAgICMgQWN0dWFsbHkgcHJvY2VzcyB0aGUgcmVzcG9uc2UuXG4gICAgcmVzcG9uc2UgZXJyLCBkYXRhLCBjYlxuXG4jIEhvdyBkbyB3ZSByZXNwb25kIHRvIGEgcmVzcG9uc2U/XG5yZXNwb25zZSA9IChlcnIsIGRhdGEsIGNiKSAtPlxuICByZXR1cm4gY2IgZXJyb3IgZXJyIGlmIGVyclxuICAjIDJ4eD9cbiAgaWYgZGF0YS5zdGF0dXNUeXBlIGlzbnQgMlxuICAgICMgRG8gd2UgaGF2ZSBhIG1lc3NhZ2UgZnJvbSBHaXRIdWI/XG4gICAgcmV0dXJuIGNiIGRhdGEuYm9keS5tZXNzYWdlIGlmIGRhdGE/LmJvZHk/Lm1lc3NhZ2U/XG4gICAgIyBVc2UgU0Egb25lLlxuICAgIHJldHVybiBjYiBkYXRhLmVycm9yLm1lc3NhZ2VcbiAgIyBBbGwgZ29vZC5cbiAgY2IgbnVsbCwgZGF0YS5ib2R5XG5cbiMgR2l2ZSB1cyBoZWFkZXJzLlxuaGVhZGVycyA9ICh0b2tlbikgLT5cbiAgIyBUaGUgZGVmYXVsdHMuXG4gIGggPVxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMnXG4gICMgQWRkIHRva2VuP1xuICBoLkF1dGhvcml6YXRpb24gPSBcInRva2VuICN7dG9rZW59XCIgaWYgdG9rZW4/XG4gIGhcblxuaXNWYWxpZCA9IChvYmopIC0+XG4gIHJ1bGVzID1cbiAgICAnb3duZXInOiAgICAgKHZhbCkgLT4gdmFsP1xuICAgICduYW1lJzogICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ21pbGVzdG9uZSc6ICh2YWwpIC0+IF8uaXNJbnQgdmFsXG4gIFxuICAoIHJldHVybiBubyBmb3Iga2V5LCB2YWwgb2Ygb2JqIHdoZW4ga2V5IG9mIHJ1bGVzIGFuZCBub3QgcnVsZXNba2V5XSh2YWwpIClcblxuICB5ZXNcblxuIyBTd2l0Y2ggd2hlbiB1c2VyIGlzIHJlYWR5LlxuaXNSZWFkeSA9IHVzZXIuZGF0YS5yZWFkeVxuXG4jIEEgc3RhY2sgb2YgcmVxdWVzdHMgdG8gZXhlY3V0ZSBvbmNlIHJlYWR5Llxuc3RhY2sgPSBbXVxucmVhZHkgPSAoY2IpIC0+XG4gIGlmIGlzUmVhZHkgdGhlbiBkbyBjYiBlbHNlIHN0YWNrLnB1c2ggY2JcblxuIyBPYnNlcnZlIHVzZXIncyByZWFkaW5lc3MuXG51c2VyLm9ic2VydmUgJ3JlYWR5JywgKHZhbCkgLT5cbiAgaXNSZWFkeSA9IHZhbFxuICAjIENsZWFyIHRoZSBzdGFjaz9cbiAgKCBkbyBzdGFjay5zaGlmdCgpIHdoaWxlIHN0YWNrLmxlbmd0aCApIGlmIHZhbFxuXG4jIFBhcnNlIGFuIGVycm9yLlxuZXJyb3IgPSAoZXJyKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIF8uaXNTdHJpbmcgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyXG4gICAgd2hlbiBfLmlzQXJyYXkgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyWzFdXG4gICAgd2hlbiBfLmlzT2JqZWN0KGVycikgYW5kIF8uaXNTdHJpbmcoZXJyLm1lc3NhZ2UpXG4gICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcblxuICB1bmxlc3MgbWVzc2FnZVxuICAgIHRyeVxuICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVyclxuICAgIGNhdGNoXG4gICAgICBtZXNzYWdlID0gZG8gZXJyLnRvU3RyaW5nXG5cbiAgbWVzc2FnZSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5NZWRpYXRvciA9IFJhY3RpdmUuZXh0ZW5kIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1lZGlhdG9yKCkiLCJ7IF8sIGRpcmVjdG9yIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuXG5lbCA9ICcjcGFnZSdcblxucGFnZXMgPVxuICBcImluZGV4XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWVcIlxuICBcIm1pbGVzdG9uZVwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbWlsZXN0b25lLmNvZmZlZVwiXG4gIFwibmV3XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9uZXcuY29mZmVlXCJcbiAgXCJwcm9qZWN0XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9wcm9qZWN0LmNvZmZlZVwiXG5cbiMgQWRkIGEgcHJvamVjdCBmcm9tIGEgcm91dGUuXG5hZGRQcm9qZWN0ID0gKHBhZ2UsIG93bmVyLCBuYW1lKSAtPlxuICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvYWRkJywgeyBvd25lciwgbmFtZSB9XG5cbiMgUHJlYXBwbHkgYWxsIGZ1bmN0aW9ucyB3aXRoIG91ciBwYWdlIG5hbWUvY29udGV4dC5cbmMgPSAobmFtZSwgZm5zPVtdKSAtPlxuICAoIF8ucGFydGlhbCBmbiwgbmFtZSBmb3IgZm4gaW4gZm5zIClcblxudmlldyA9IG51bGxcbnJvdXRlID0gKHBhZ2UsIGFyZ3MuLi4pIC0+XG4gICMgVW5yZW5kZXIgdGhlIHByZXZpb3VzIG9uZS5cbiAgZG8gdmlldz8udGVhcmRvd25cbiAgIyBIaWRlIGFueSBub3RpZmljYXRpb25zLlxuICBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeS9oaWRlJ1xuICAjIFJlcXVpcmUgdGhlIG5ldyBvbmUuXG4gIFBhZ2UgPSBwYWdlc1twYWdlXVxuICAjIFJlbmRlciBpdC5cbiAgdmlldyA9IG5ldyBQYWdlIHsgZWwsICdkYXRhJzogeyAncm91dGUnOiBhcmdzIH0gfVxuXG5yb3V0ZXMgPVxuICAnLyc6ICAgICAgICAgICAgICAgICAgICAgICAgYyAnaW5kZXgnLCBbIHJvdXRlIF1cbiAgJy9uZXcvcHJvamVjdCc6ICAgICAgICAgICAgIGMgJ25ldycsICAgWyByb3V0ZSBdXG4gICMgVGhlIGZvbGxvd2luZyB0d28gcm91dGVzIGFkZCBhIHByb2plY3QgaW4gdGhlIGJhY2tncm91bmQuXG4gICcvOm93bmVyLzpuYW1lJzogICAgICAgICAgICBjICdwcm9qZWN0JywgICBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgJy86b3duZXIvOm5hbWUvOm1pbGVzdG9uZSc6IGMgJ21pbGVzdG9uZScsIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAjIFRPRE86IHJlbW92ZSBpbiBwcm9kdWN0aW9uLlxuICAnL3Jlc2V0JzogLT5cbiAgICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvY2xlYXInXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuIyBGbGF0aXJvbiBEaXJlY3RvciByb3V0ZXIuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yLlJvdXRlcihyb3V0ZXMpLmNvbmZpZ3VyZVxuICAnc3RyaWN0Jzogbm8gIyBhbGxvdyB0cmFpbGluZyBzbGFzaGVzXG4gIG5vdGZvdW5kOiAtPlxuICAgIHRocm93IDQwNCIsInsgbW9tZW50IH0gID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG4jIFByb2dyZXNzIGluICUuXG5wcm9ncmVzcyA9IChhLCBiKSAtPiAxMDAgKiAoYSAvIChiICsgYSkpXG5cbiMgQ2FsY3VsYXRlIHRoZSBzdGF0cyBmb3IgYSBtaWxlc3RvbmUuXG4jICBJcyBpdCBvbiB0aW1lPyBXaGF0IGlzIHRoZSBwcm9ncmVzcz9cbm1vZHVsZS5leHBvcnRzID0gKG1pbGVzdG9uZSkgLT5cbiAgICBpc0RvbmUgPSBubyA7IGlzT25UaW1lID0geWVzIDsgaXNPdmVyZHVlID0gbm9cblxuICAgICMgUHJvZ3Jlc3MgaW4gcG9pbnRzLlxuICAgIHBvaW50cyA9IHByb2dyZXNzIG1pbGVzdG9uZS5pc3N1ZXMuY2xvc2VkLnNpemUsIG1pbGVzdG9uZS5pc3N1ZXMub3Blbi5zaXplICAgIFxuICAgIGlzRG9uZSA9IHllcyBpZiBwb2ludHMgaXMgMTAwXG5cbiAgICAjIE1pbGVzdG9uZXMgd2l0aCBubyBkdWUgZGF0ZSBhcmUgYWx3YXlzIG9uIHRyYWNrLlxuICAgIHJldHVybiB7IGlzT3ZlcmR1ZSwgaXNPblRpbWUsIGlzRG9uZSwgJ3Byb2dyZXNzJzogeyBwb2ludHMgfSB9IHVubGVzcyBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICBhID0gK25ldyBEYXRlIG1pbGVzdG9uZS5jcmVhdGVkX2F0XG4gICAgYiA9ICtuZXcgRGF0ZVxuICAgIGMgPSArbmV3IERhdGUgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgIyBPdmVyZHVlP1xuICAgIGlzT3ZlcmR1ZSA9IHllcyBpZiBiID4gY1xuXG4gICAgIyBQcm9ncmVzcyBpbiB0aW1lLlxuICAgIHRpbWUgPSBwcm9ncmVzcyBiIC0gYSwgYyAtIGJcblxuICAgICMgSG93IG1hbnkgZGF5cyBpcyAxJSBvZiB0aGUgdGltZT9cbiAgICBkYXlzID0gKG1vbWVudChiKS5kaWZmKG1vbWVudChhKSwgJ2RheXMnKSkgLyAxMDBcblxuICAgICMgQXJlIHdlIG9uIHRpbWU/XG4gICAgaXNPblRpbWUgPSBwb2ludHMgPiB0aW1lXG5cbiAgICB7XG4gICAgICBpc0RvbmUsIGRheXMsIGlzT25UaW1lLCBpc092ZXJkdWVcbiAgICAgICdwcm9ncmVzcyc6IHsgcG9pbnRzLCB0aW1lIH1cbiAgICB9IiwiIyBBbGwgb3VyIHZlbmRvciBkZXBlbmRlbmNpZXMgaW4gb25lIHBsYWNlLlxubW9kdWxlLmV4cG9ydHMgPVxuICAnXyc6IHdpbmRvdy5fXG4gICdSYWN0aXZlJzogd2luZG93LlJhY3RpdmVcbiAgJ0ZpcmViYXNlJzogd2luZG93LkZpcmViYXNlXG4gICdGaXJlYmFzZVNpbXBsZUxvZ2luJzogd2luZG93LkZpcmViYXNlU2ltcGxlTG9naW5cbiAgJ1N1cGVyQWdlbnQnOiB3aW5kb3cuc3VwZXJhZ2VudFxuICAnYXN5bmMnOiB3aW5kb3cuYXN5bmNcbiAgJ21vbWVudCc6IHdpbmRvdy5tb21lbnRcbiAgJ2QzJzogd2luZG93LmQzXG4gICdtYXJrZWQnOiB3aW5kb3cubWFya2VkXG4gICdkaXJlY3Rvcic6XG4gICAgJ1JvdXRlcic6IHdpbmRvdy5Sb3V0ZXJcbiAgJ2xzY2FjaGUnOiB3aW5kb3cubHNjYWNoZVxuICAnc29ydGVkSW5kZXhDbXAnOiB3aW5kb3cuc29ydGVkSW5kZXhcbiAgJ3NlbXZlcic6IHJlcXVpcmUgJ3NlbXZlciciLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYXBwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIk5vdGlmeVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkhlYWRlclwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwYWdlXCJ9LFwiZlwiOltdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W1wiJmNvcHk7IDIwMTItMjAxNCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCJodHRwOi8vY2xvdWRmaS5yZVwifSxcImZcIjpbXCJDbG91ZGZpcmUgU3lzdGVtc1wiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjaGFydFwifX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJoZWFkXCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInVzZXJcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJyaWdodFwifSxcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwiZGlzcGxheU5hbWVcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJkaXNwbGF5TmFtZVwifSxcIiBsb2dnZWQgaW5cIl19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwiZ2l0aHViXCJ9LFwidlwiOntcImNsaWNrXCI6XCIhbG9naW5cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJnaXRodWJcIn19LFwiIFNpZ24gSW5cIl19XSxcInJcIjpcImRpc3BsYXlOYW1lXCJ9XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImlkXCI6XCJpY29uXCIsXCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInVsXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwicGx1cy1jaXJjbGVkXCJ9fSxcIiBBZGQgYSBQcm9qZWN0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcImZhcVwifSxcImZcIjpbXCJGQVFcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjcmVzZXRcIn0sXCJmXCI6W1wiREIgUmVzZXRcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVyb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY29udGVudFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImFkZHJlc3NcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJTZWUgeW91ciBwcm9qZWN0IHByb2dyZXNzXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJOb3Qgc3VyZSB3aGVyZSB0byBzdGFydD8gSnVzdCBhZGQgYSBkZW1vIHJlcG8gdG8gc2VlIGEgY2hhcnQuIFRoZXJlIGFyZSBtYW55IHZhcmlhdGlvbnMgb2YgcGFzc2FnZXMgb2YgTG9yZW0gSXBzdW0gYXZhaWxhYmxlLCBidXQgdGhlIG1ham9yaXR5IGhhdmUgc3VmZmVyZWQgYWx0ZXJhdGlvbiBpbiBzb21lIGZvcm0sIGJ5IGluamVjdGVkIGh1bW91ciwgb3IgcmFuZG9taXNlZCB3b3JkcyB3aGljaCBkb24ndCBsb29rIGV2ZW4gc2xpZ2h0bHkgYmVsaWV2YWJsZS5cIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImN0YVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwicHJpbWFyeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIHlvdXIgcHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNlY29uZGFyeVwifSxcImZcIjpbXCJSZWFkIHRoZSBHdWlkZVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcImNvZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpY29uIFwiLHtcInRcIjoyLFwiclwiOlwiaWNvblwifV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiY29kZVwiXSxcInNcIjpcIlxcXCImI1xcXCIrXzArXFxcIjtcXFwiXCJ9fV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInRleHRcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJzeXN0ZW1cIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn0sXCIgc3lzdGVtXCJdLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJyXCI6XCJ0b3BcIn0sXCIlXCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9XSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJ0b3BcIl0sXCJzXCI6XCItXzBcIn19LFwicHhcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiY2xvc2VcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcImNsb3NlXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dLFwiclwiOlwic3lzdGVtXCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiUHJvamVjdHNcIixcImFcIjp7XCJwcm9qZWN0c1wiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RzXCJ9XX19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkhlcm9cIn1dLFwiclwiOlwicHJvamVjdHMubGlzdFwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS50aXRsZVwiXSxcInNcIjpcIl8wLnRpdGxlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwic3ViXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImFcIjp7XCJjbGFzc1wiOlwiZGVzY3JpcHRpb25cIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kZXNjcmlwdGlvblwiXSxcInNcIjpcIl8wLm1hcmtkb3duKF8xKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiQ2hhcnRcIixcImFcIjp7XCJtaWxlc3RvbmVcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmVcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJBZGQgYSBQcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJUeXBlIGluIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IGFzIHlvdSB3b3VsZCBub3JtYWxseS4gSWYgeW91J2QgbGlrZSB0byBhZGQgYSBwcml2YXRlIEdpdEh1YiBwcm9qZWN0LCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOltcIlNpZ24gSW5cIl19LFwiIGZpcnN0LlwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb3JtXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImlucHV0XCIsXCJhXCI6e1widHlwZVwiOlwidGV4dFwiLFwicGxhY2Vob2xkZXJcIjpcInVzZXIvcmVwb1wiLFwiYXV0b2NvbXBsZXRlXCI6XCJvZmZcIixcInZhbHVlXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfSxcInZcIjp7XCJrZXl1cFwiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJ2XCI6e1wiY2xpY2tcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fSxcImZcIjpbXCJBZGRcIl19XX1dfV19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJyb3V0ZVwiXSxcInNcIjpcIl8wLmpvaW4oXFxcIi9cXFwiKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTWlsZXN0b25lc1wiLFwiYVwiOntcInByb2plY3RcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0XCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInNvcnRcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcInNvcnRCeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInNvcnQtYWxwaGFiZXRcIn19LFwiIFNvcnRlZCBieSBcIix7XCJ0XCI6MixcInJcIjpcInByb2plY3RzLnNvcnRCeVwifV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJNaWxlc3RvbmVzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5pbmRleFwiLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiLlwiXSxcInNcIjpcIntpbmRleDpfMH1cIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4wXCIsXCJwcm9qZWN0cy5saXN0XCJdLFwic1wiOlwie3A6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJ4XCI6e1wiclwiOltcInAub3duZXJcIixcInByb2plY3Qub3duZXJcIixcInAubmFtZVwiLFwicHJvamVjdC5uYW1lXCJdLFwic1wiOlwiXzA9PV8xJiZfMj09XzNcIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4xXCIsXCJwcm9qZWN0Lm1pbGVzdG9uZXNcIl0sXCJzXCI6XCJ7bWlsZXN0b25lOl8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImFcIjp7XCJjbGFzc1wiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc0RvbmVcIixcImZcIjpbXCJkb25lXCJdfV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS50aXRsZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcInN0eWxlXCI6XCJ3aWR0aDoxJVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvZ3Jlc3NcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJwZXJjZW50XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiZHVlIFwiLHtcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzT3ZlcmR1ZVwiLFwiZlwiOltcInJlZFwiXX1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwic29ydFwifSxcInZcIjp7XCJjbGlja1wiOlwic29ydEJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IFwiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdHMuc29ydEJ5XCJ9XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlByb2plY3RzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwiZXJyb3JzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNvbHNwYW5cIjpcIjNcIixcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZXJyb3JcIixcInRpdGxlXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJlcnJvcnNcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCJcXFxcblxcXCIpXCJ9fV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYXR0ZW50aW9uXCJ9fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cHJvamVjdDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInByb2plY3RcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiYVwiOntcImNsYXNzXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzRG9uZVwiLFwiZlwiOltcImRvbmVcIl19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJjbGFzc1wiOlwicmVwb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5udW1iZXJcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUudGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOltcImR1ZSBcIix7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc092ZXJkdWVcIixcImZcIjpbXCJyZWRcIl19XX0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLmlzT25UaW1lXCJdLFwic1wiOlwiKF8wKT9cXFwiZ3JlZW5cXFwiOlxcXCJyZWRcXFwiXCJ9fV0sXCJzdHlsZVwiOltcIndpZHRoOlwiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfV19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImNvZ1wifX0sXCIgRWRpdFwiXX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIG5vdzogLT4gbmV3IERhdGUoKS50b0pTT04oKSIsInsgXywgbW9tZW50LCBtYXJrZWQgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgVGltZSBmcm9tIG5vdy5cbiAgZnJvbU5vdzogXy5tZW1vaXplIChqc29uRGF0ZSkgLT5cbiAgICBtb21lbnQobmV3IERhdGUoanNvbkRhdGUpKS5mcm9tTm93KClcblxuICAjIFdoZW4gaXMgYSBtaWxlc3RvbmUgZHVlP1xuICBkdWU6IChqc29uRGF0ZSkgLT5cbiAgICByZXR1cm4gJyZuYnNwOycgdW5sZXNzIGpzb25EYXRlXG4gICAgWyAnZHVlJywgQGZyb21Ob3cganNvbkRhdGUgXS5qb2luKCcgJylcblxuICAjIE1hcmtkb3duIGZvcm1hdHRpbmcuXG4gIG1hcmtkb3duOiAobWFya3VwKSAtPlxuICAgIG1hcmtlZCBtYXJrdXBcblxuICAjIEZvcm1hdCBtaWxlc3RvbmUgdGl0bGUuXG4gIHRpdGxlOiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbWlsZXN0b25lJykgPiAtMVxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIFsgJ01pbGVzdG9uZScsIHRleHQgXS5qb2luKCcgJylcblxuICAjIEhleCB0byBkZWNpbWFsLlxuICBoZXhUb0RlYzogKGhleCkgLT5cbiAgICBwYXJzZUludCBoZXgsIDE2IiwibW9kdWxlLmV4cG9ydHMgPVxuICBpczogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwudHlwZSBpbiBbICdrZXl1cCcsICdrZXlkb3duJyBdXG5cbiAgaXNFbnRlcjogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwud2hpY2ggaXMgMTMiLCJ7IF8gfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuXy5taXhpblxuICAncGx1Y2tNYW55JzogKHNvdXJjZSwga2V5cykgLT5cbiAgICB0aHJvdyAnYGtleXNgIG5lZWRzIHRvIGJlIGFuIEFycmF5JyB1bmxlc3MgXy5pc0FycmF5IGtleXNcbiAgICBfLm1hcCBzb3VyY2UsIChpdGVtKSAtPlxuICAgICAgb2JqID0ge31cbiAgICAgIF8uZWFjaCBrZXlzLCAoa2V5KSAtPlxuICAgICAgICBvYmpba2V5XSA9IGl0ZW1ba2V5XVxuICAgICAgb2JqXG5cbiAgJ2lzSW50JzogKHZhbCkgLT5cbiAgICBub3QgaXNOYU4odmFsKSBhbmQgcGFyc2VJbnQoTnVtYmVyKHZhbCkpIGlzIHZhbCBhbmQgbm90IGlzTmFOKHBhcnNlSW50KHZhbCwgMTApKSIsInsgUmFjdGl2ZSwgXyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuXG4jIEFuIFJhY3RpdmUgdGhhdCBzdWJzY3JpYmVzIGFuZCBsaXN0ZW5zIHRvIG1lc3NhZ2VzIG9uIGBtZWRpYXRvcmAgZXZlbnQgYnVzLlxuIyBVc2FnZTogdGhpcy5zdWJzY3JpYmUoJyFldmVudCcsIGZ1bmN0aW9uKCkgeyAvKiBsaXN0ZW5lciAqLyB9LCBjb250ZXh0KTtcbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICBzdWJzY3JpYmU6IChuYW1lLCBjYiwgY3R4KSAtPlxuICAgIGN0eCA/PSBAXG4gICAgQF9zdWJzID0gW10gdW5sZXNzIF8uaXNBcnJheSBAX3N1YnNcbiAgICBpZiBfLmlzRnVuY3Rpb24gY2JcbiAgICAgIEBfc3Vicy5wdXNoIG1lZGlhdG9yLm9uIG5hbWUsIF8uYmluZCBjYiwgY3R4XG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCJXYXJuaW5nOiBgY2JgIGlzIG5vdCBhIGZ1bmN0aW9uXCJcblxuICBwdWJsaXNoOiAtPlxuICAgIG1lZGlhdG9yLmZpcmUuYXBwbHkgbWVkaWF0b3IsIGFyZ3VtZW50c1xuXG4gIG9udGVhcmRvd246IC0+XG4gICAgaWYgXy5pc0FycmF5IEBfc3Vic1xuICAgICAgZm9yIHN1YiBpbiBAX3N1YnNcbiAgICAgICAgaWYgXy5pc0Z1bmN0aW9uIHN1Yi5jYW5jZWxcbiAgICAgICAgICBkbyBzdWIuY2FuY2VsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIldhcm5pbmc6IGBzdWIuY2FuY2VsYCBpcyBub3QgYSBmdW5jdGlvblwiIiwiRXZlbnRmdWwgPSByZXF1aXJlICcuL2V2ZW50ZnVsLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0cykgLT5cbiAgTW9kZWwgPSBFdmVudGZ1bC5leHRlbmQob3B0cylcbiAgbW9kZWwgPSBuZXcgTW9kZWwoKVxuICBtb2RlbC5yZW5kZXIoKVxuICBtb2RlbCIsInsgUmFjdGl2ZSwgZDMgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubGluZXMgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSdcbmF4ZXMgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9jaGFydC5odG1sJ1xuXG4gIG9uY29tcGxldGU6IC0+XG4gICAgbWlsZXN0b25lID0gQGRhdGEubWlsZXN0b25lXG4gICAgaXNzdWVzID0gbWlsZXN0b25lLmlzc3Vlc1xuICAgICMgVG90YWwgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgbWlsZXN0b25lLlxuICAgIHRvdGFsID0gaXNzdWVzLm9wZW4uc2l6ZSArIGlzc3Vlcy5jbG9zZWQuc2l6ZVxuXG5cbiAgICAjIEFuIGlzc3VlIG1heSBoYXZlIGJlZW4gY2xvc2VkIGJlZm9yZSB0aGUgc3RhcnQgb2YgYSBtaWxlc3RvbmUuXG4gICAgaGVhZCA9IGlzc3Vlcy5jbG9zZWQubGlzdFswXS5jbG9zZWRfYXRcbiAgICBpZiBpc3N1ZXMubGVuZ3RoIGFuZCBtaWxlc3RvbmUuY3JlYXRlZF9hdCA+IGhlYWRcbiAgICAgICMgVGhpcyBpcyB0aGUgbmV3IHN0YXJ0LlxuICAgICAgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPSBoZWFkXG5cbiAgICAjIEFjdHVhbCwgaWRlYWwgJiB0cmVuZCBsaW5lcy5cbiAgICBhY3R1YWwgPSBsaW5lcy5hY3R1YWwgaXNzdWVzLmNsb3NlZC5saXN0LCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgdG90YWxcbiAgICBpZGVhbCAgPSBsaW5lcy5pZGVhbCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vbiwgdG90YWxcbiAgICB0cmVuZCAgPSBsaW5lcy50cmVuZCBhY3R1YWwsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIEdldCBhdmFpbGFibGUgc3BhY2UuXG4gICAgeyBoZWlnaHQsIHdpZHRoIH0gPSBkbyBAZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cbiAgICBtYXJnaW4gPSB7ICd0b3AnOiAzMCwgJ3JpZ2h0JzogMzAsICdib3R0b20nOiA0MCwgJ2xlZnQnOiA1MCB9XG4gICAgd2lkdGggLT0gbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHRcbiAgICBoZWlnaHQgLT0gbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b21cblxuICAgICMgU2NhbGVzLlxuICAgIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWyAwLCB3aWR0aCBdKVxuICAgIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbIGhlaWdodCwgMCBdKVxuXG4gICAgIyBBeGVzLlxuICAgIHhBeGlzID0gYXhlcy5ob3Jpem9udGFsIGhlaWdodCwgeFxuICAgIHlBeGlzID0gYXhlcy52ZXJ0aWNhbCB3aWR0aCwgeVxuXG4gICAgIyBMaW5lIGdlbmVyYXRvci5cbiAgICBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC5pbnRlcnBvbGF0ZShcImxpbmVhclwiKVxuICAgIC54KCAoZCkgLT4geChkLmRhdGUpIClcbiAgICAueSggKGQpIC0+IHkoZC5wb2ludHMpIClcblxuICAgICMgR2V0IHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIGRhdGUsIGFuZCBpbml0aWFsIHBvaW50cy5cbiAgICB4LmRvbWFpbihbIGlkZWFsWzBdLmRhdGUsIGlkZWFsW2lkZWFsLmxlbmd0aCAtIDFdLmRhdGUgXSlcbiAgICB5LmRvbWFpbihbIDAsIGlkZWFsWzBdLnBvaW50cyBdKS5uaWNlKClcblxuICAgICMgQWRkIGFuIFNWRyBlbGVtZW50IHdpdGggdGhlIGRlc2lyZWQgZGltZW5zaW9ucyBhbmQgbWFyZ2luLlxuICAgIHN2ZyA9IGQzLnNlbGVjdCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJyNjaGFydCcpKS5hcHBlbmQoXCJzdmdcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXG5cbiAgICAjIEFkZCB0aGUgZGF5cyB4LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIGRheVwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKHhBeGlzKVxuXG4gICAgIyBBZGQgdGhlIG1vbnRocyB4LWF4aXMuXG4gICAgbSA9IFtcbiAgICAgICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsXG4gICAgICAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXG4gICAgXVxuXG4gICAgbUF4aXMgPSB4QXhpc1xuICAgIC5vcmllbnQoXCJ0b3BcIilcbiAgICAudGlja1NpemUoaGVpZ2h0KVxuICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gbVtkLmdldE1vbnRoKCldIClcbiAgICAudGlja3MoMilcbiAgICBcbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgbW9udGhcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbChtQXhpcylcblxuICAgICMgQWRkIHRoZSB5LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieSBheGlzXCIpXG4gICAgLmNhbGwoeUF4aXMpXG5cbiAgICAjIEFkZCBhIGxpbmUgc2hvd2luZyB3aGVyZSB3ZSBhcmUgbm93LlxuICAgIHN2Zy5hcHBlbmQoXCJzdmc6bGluZVwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheVwiKVxuICAgIC5hdHRyKFwieDFcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkxXCIsIDApXG4gICAgLmF0dHIoXCJ4MlwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KVxuXG4gICAgIyBBZGQgdGhlIGlkZWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJpZGVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJiYXNpc1wiKShpZGVhbCkpXG5cbiAgICAjIEFkZCB0aGUgdHJlbmRsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidHJlbmRsaW5lIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKSh0cmVuZCkpXG5cbiAgICAjIEFkZCB0aGUgYWN0dWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJhY3R1YWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpLnkoIChkKSAtPiB5KGQucG9pbnRzKSApKGFjdHVhbCkpXG5cbiAgICAjIENvbGxlY3QgdGhlIHRvb2x0aXAgaGVyZS5cbiAgICB0b29sdGlwID0gZDMudGlwKCkuYXR0cignY2xhc3MnLCAnZDMtdGlwJykuaHRtbCAoeyBudW1iZXIsIHRpdGxlIH0pIC0+XG4gICAgICBcIiMje251bWJlcn06ICN7dGl0bGV9XCJcblxuICAgIHN2Zy5jYWxsKHRvb2x0aXApXG5cbiAgICAjIFNob3cgd2hlbiB3ZSBjbG9zZWQgYW4gaXNzdWUuXG4gICAgc3ZnLnNlbGVjdEFsbChcImEuaXNzdWVcIilcbiAgICAuZGF0YShhY3R1YWwuc2xpY2UoMSkpICMgc2tpcCB0aGUgc3RhcnRpbmcgcG9pbnRcbiAgICAuZW50ZXIoKVxuICAgICMgQSB3cmFwcGluZyBsaW5rLlxuICAgIC5hcHBlbmQoJ3N2ZzphJylcbiAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgKHsgaHRtbF91cmwgfSkgLT4gaHRtbF91cmwgKVxuICAgIC5hdHRyKFwieGxpbms6c2hvd1wiLCAnbmV3JylcbiAgICAuYXBwZW5kKCdzdmc6Y2lyY2xlJylcbiAgICAuYXR0cihcImN4XCIsICh7IGRhdGUgfSkgLT4geCBkYXRlIClcbiAgICAuYXR0cihcImN5XCIsICh7IHBvaW50cyB9KSAtPiB5IHBvaW50cyApXG4gICAgLmF0dHIoXCJyXCIsICAoeyByYWRpdXMgfSkgLT4gNSApICMgZml4ZWQgZm9yIG5vd1xuICAgIC5vbignbW91c2VvdmVyJywgdG9vbHRpcC5zaG93KVxuICAgIC5vbignbW91c2VvdXQnLCB0b29sdGlwLmhpZGUpXG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxueyBzeXN0ZW0gfSA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuZmlyZWJhc2UgICA9IHJlcXVpcmUgJy4uL21vZGVscy9maXJlYmFzZS5jb2ZmZWUnXG51c2VyICAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuSWNvbnMgICAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVhZGVyJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9oZWFkZXIuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3VzZXInOiB1c2VyXG4gICAgIyBEZWZhdWx0IGFwcCBpY29uLlxuICAgICdpY29uJzogJ2ZpcmUtc3RhdGlvbidcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgTG9naW4gdXNlci5cbiAgICBAb24gJyFsb2dpbicsIC0+XG4gICAgICBmaXJlYmFzZS5sb2dpbiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTd2l0Y2ggbG9hZGluZyBpY29uIHdpdGggYXBwIGljb24uXG4gICAgc3lzdGVtLm9ic2VydmUgJ2xvYWRpbmcnLCAoeWEpID0+XG4gICAgICBAc2V0ICdpY29uJywgaWYgeWEgdGhlbiAnc3Bpbm5lcjEnIGVsc2UgJ2ZpcmUtc3RhdGlvbiciLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuSWNvbnMgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlcm8nXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlcm8uaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuZm9ybWF0ID0gcmVxdWlyZSAnLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxuIyBGb250ZWxsbyBpY29uIGhleCBjb2Rlcy5cbmNvZGVzID1cbiAgJ2NvZyc6ICAgICAgICAgICAnXFxlODAwJ1xuICAnc2VhcmNoJzogICAgICAgICdcXGU4MDEnXG4gICdnaXRodWInOiAgICAgICAgJ1xcZTgwMidcbiAgJ2FkZHJlc3MnOiAgICAgICAnXFxlODAzJ1xuICAncGx1cy1jaXJjbGVkJzogICdcXGU4MDQnXG4gICdmaXJlLXN0YXRpb24nOiAgJ1xcZTgwNSdcbiAgJ3NvcnQtYWxwaGFiZXQnOiAnXFxlODA2J1xuICAnZG93bi1vcGVuJzogICAgICdcXGU4MDcnXG4gICdzcGluNic6ICAgICAgICAgJ1xcZTgwOCdcbiAgJ21lZ2FwaG9uZSc6ICAgICAnXFxlODA5J1xuICAnc3BpbjQnOiAgICAgICAgICdcXGU4MGEnXG4gICdzcGlubmVyMSc6ICAgICAgJ1xcZTgwYidcbiAgJ2F0dGVudGlvbic6ICAgICAnXFxlODBjJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaWNvbnMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2ljb25zLmh0bWwnXG5cbiAgJ2lzb2xhdGVkJzogeWVzXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgQG9ic2VydmUgJ2ljb24nLCAoaWNvbikgLT5cbiAgICAgIGlmIGljb24gYW5kIGhleCA9IGNvZGVzW2ljb25dXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBmb3JtYXQuaGV4VG9EZWMgaGV4XG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBudWxsIiwieyBSYWN0aXZlLCBfLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5FdmVudGZ1bCA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxuSEVJR0hUID0gNjggIyBoZWlnaHQgb2YgZGl2IGluIHB4XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRmdWwuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3Mvbm90aWZ5J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9ub3RpZnkuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3RvcCc6IEhFSUdIVFxuICAgICdoaWRkZW4nOiB5ZXNcbiAgICAnZGVmYXVsdHMnOlxuICAgICAgJ3RleHQnOiAnJ1xuICAgICAgJ3R5cGUnOiAnJyAjIGJsYW5kIGdyZXkgc3R5bGVcbiAgICAgICdzeXN0ZW0nOiBub1xuICAgICAgJ2ljb24nOiAnbWVnYXBob25lJ1xuICAgICAgJ3R0bCc6ICA1ZTNcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gICMgU2hvdyBhIG5vdGlmaWNhdGlvbi5cbiAgc2hvdzogKG9wdHMpIC0+XG4gICAgQHNldCAnaGlkZGVuJywgbm8gICAgXG4gICAgIyBTZXQgdGhlIG9wdHMuXG4gICAgQHNldCBvcHRzID0gXy5kZWZhdWx0cyBvcHRzLCBAZGF0YS5kZWZhdWx0c1xuICAgICMgV2hpY2ggcG9zaXRpb24gdG8gc2xpZGUgdG8/XG4gICAgcG9zID0gWyAwLCA1MCBdWyArb3B0cy5zeXN0ZW0gXSAjIDBweCBvciA1MCUgZnJvbSB0b3BcbiAgICAjIFNsaWRlIGludG8gdmlldy5cbiAgICBAYW5pbWF0ZSAndG9wJywgcG9zLFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JvdW5jZScpXG4gICAgICAnZHVyYXRpb24nOiA4MDBcbiAgICBcbiAgICAjIElmIG5vIHR0bCB0aGVuIHNob3cgcGVybWFuZW50bHkuXG4gICAgcmV0dXJuIHVubGVzcyBvcHRzLnR0bFxuXG4gICAgIyBTbGlkZSBvdXQgb2YgdGhlIHZpZXcuXG4gICAgXy5kZWxheSBfLmJpbmQoQGhpZGUsIEApLCBvcHRzLnR0bFxuXG4gICMgSGlkZSBhIG5vdGlmaWNhdGlvbi5cbiAgaGlkZTogLT5cbiAgICByZXR1cm4gaWYgQGRhdGEuaGlkZGVuXG4gICAgQHNldCAnaGlkZGVuJywgeWVzXG5cbiAgICBAYW5pbWF0ZSAndG9wJywgSEVJR0hULFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JhY2snKVxuICAgICAgJ2NvbXBsZXRlJzogPT5cbiAgICAgICAgIyBSZXNldCB0aGUgdGV4dCB3aGVuIGFsbCBpcyBkb25lLlxuICAgICAgICBAc2V0ICd0ZXh0JywgbnVsbFxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBPbiBvdXRzaWRlIG1lc3NhZ2VzLlxuICAgIEBzdWJzY3JpYmUgJyFhcHAvbm90aWZ5JywgQHNob3csIEBcbiAgICBAc3Vic2NyaWJlICchYXBwL25vdGlmeS9oaWRlJywgQGhpZGUsIEBcblxuICAgICMgQ2xvc2UgdXMgcHJlbWF0dXJlbHkuLi5cbiAgICBAb24gJ2Nsb3NlJywgQGhpZGUiLCJ7IFJhY3RpdmUsIF8sIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkhlcm8gICAgID0gcmVxdWlyZSAnLi4vaGVyby5jb2ZmZWUnXG5Qcm9qZWN0cyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9wcm9qZWN0cy5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9pbmRleCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvaW5kZXguaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSGVybywgUHJvamVjdHMgfVxuXG4gICdkYXRhJzpcbiAgICAncHJvamVjdHMnOiBwcm9qZWN0c1xuICAgICdyZWFkeSc6IG5vXG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gIG9ucmVuZGVyOiAtPlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0J1cm5jaGFydDogR2l0SHViIEJ1cm5kb3duIENoYXJ0IGFzIGEgU2VydmljZSdcblxuICAgICMgUXVpdCBpZiB3ZSBoYXZlIG5vIHByb2plY3RzLlxuICAgIHJldHVybiBAc2V0KCdyZWFkeScsIHllcykgdW5sZXNzIHByb2plY3RzLmxpc3QubGVuZ3RoXG5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICAjIEZvciBhbGwgcHJvamVjdHMuXG4gICAgYXN5bmMubWFwIHByb2plY3RzLmRhdGEubGlzdCwgKHByb2plY3QsIGNiKSAtPlxuICAgICAgIyBGZXRjaCB0aGVpciBtaWxlc3RvbmVzLlxuICAgICAgbWlsZXN0b25lcy5mZXRjaEFsbCBwcm9qZWN0LCAoZXJyLCBsaXN0KSAtPlxuICAgICAgICAjIFNhdmUgdGhlIGVycm9yIGlmIHByb2plY3QgZG9lcyBub3QgZXhpc3QuXG4gICAgICAgIGlmIGVyclxuICAgICAgICAgIHByb2plY3RzLnNhdmVFcnJvciBwcm9qZWN0LCBlcnJcbiAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAjIE5vdyBhZGQgaW4gdGhlIGlzc3Vlcy5cbiAgICAgICAgYXN5bmMuZWFjaCBsaXN0LCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCBpZiBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCAoeyBudW1iZXIgfSkgLT5cbiAgICAgICAgICAgIG1pbGVzdG9uZS5udW1iZXIgaXMgbnVtYmVyXG4gICAgICAgICAgXG4gICAgICAgICAgIyBPSyBmZXRjaCBhbGwgdGhlIGlzc3VlcyBmb3IgdGhpcyBtaWxlc3RvbmUgdGhlbi5cbiAgICAgICAgICBpc3N1ZXMuZmV0Y2hBbGxcbiAgICAgICAgICAgICdvd25lcic6IHByb2plY3Qub3duZXJcbiAgICAgICAgICAgICduYW1lJzogcHJvamVjdC5uYW1lXG4gICAgICAgICAgICAnbWlsZXN0b25lJzogbWlsZXN0b25lLm51bWJlclxuICAgICAgICAgICwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgICAgIyBTYXZlIGFueSBlcnJvcnMgb24gdGhlIHByb2plY3QuXG4gICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAgICAgIyBBZGQgaW4gdGhlIGlzc3VlcyB0byB0aGUgbWlsZXN0b25lLlxuICAgICAgICAgICAgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdpc3N1ZXMnOiBvYmogfVxuICAgICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgbWlsZXN0b25lXG4gICAgICAgICAgICAjIERvbmVcbiAgICAgICAgICAgIGRvIGNiXG4gICAgICAgIFxuICAgICAgICAsIGNiXG5cbiAgICAsID0+XG4gICAgICBkbyBkb25lXG4gICAgICBAc2V0ICdyZWFkeScsIHllcyIsInsgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuQ2hhcnQgPSByZXF1aXJlICcuLi9jaGFydC5jb2ZmZWUnXG5cbkV2ZW50ZnVsICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9yYWN0aXZlL2V2ZW50ZnVsLmNvZmZlZSdcbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5mb3JtYXQgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGZ1bC5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbWlsZXN0b25lLmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IENoYXJ0IH1cblxuICAnZGF0YSc6XG4gICAgJ2Zvcm1hdCc6IGZvcm1hdFxuICAgICdyZWFkeSc6IG5vXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgWyBvd25lciwgbmFtZSwgbWlsZXN0b25lIF0gPSBAZ2V0ICdyb3V0ZSdcbiAgXG4gICAgbWlsZXN0b25lID0gcGFyc2VJbnQgbWlsZXN0b25lXG5cbiAgICBkb2N1bWVudC50aXRsZSA9IFwiI3tvd25lcn0vI3tuYW1lfS8je21pbGVzdG9uZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBwcm9qZWN0ID0gcHJvamVjdHMuZmluZCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgU2hvdWxkIG5vdCBoYXBwZW4uLi5cbiAgICB0aHJvdyA1MDAgdW5sZXNzIHByb2plY3RcblxuICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgIG9iaiA9IF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsIHsgJ251bWJlcic6IG1pbGVzdG9uZSB9XG4gICAgcmV0dXJuIEBzZXQgeyAnbWlsZXN0b25lJzogb2JqLCAncmVhZHknOiB5ZXMgfSBpZiBvYmo/XG5cbiAgICAjIFdlIGFyZSBsb2FkaW5nIHRoZSBtaWxlc3RvbmVzIHRoZW4uXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgZmV0Y2hNaWxlc3RvbmUgPSAoY2IpIC0+XG4gICAgICBtaWxlc3RvbmVzLmZldGNoIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYlxuXG4gICAgZmV0Y2hJc3N1ZXMgPSAoZGF0YSwgY2IpIC0+XG4gICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIChlcnIsIG9iaikgLT5cbiAgICAgICAgY2IgZXJyLCBfLmV4dGVuZCBkYXRhLCB7ICdpc3N1ZXMnOiBvYmogfVxuXG4gICAgYXN5bmMud2F0ZXJmYWxsIFtcbiAgICAgICMgR2V0IHRoZSBtaWxlc3RvbmUuXG4gICAgICBmZXRjaE1pbGVzdG9uZSxcbiAgICAgICMgVGhlbiBhbGwgaXRzIGlzc3Vlcy5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVyciwgZGF0YSkgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBAcHVibGlzaCAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBkYXRhXG5cbiAgICAgICMgRG9uZT9cbiAgICAgIEBwdWJsaXNoICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiAnVGhlIG1pbGVzdG9uZSBpcyBjb21wbGV0ZSdcbiAgICAgICAgJ3R5cGUnOiAnc3VjY2VzcydcbiAgICAgIH0gaWYgZGF0YS5zdGF0cy5pc0RvbmVcblxuICAgICAgIyBPdmVyZHVlP1xuICAgICAgQHB1Ymxpc2ggJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6ICdUaGUgbWlsZXN0b25lIGlzIG92ZXJkdWUnXG4gICAgICAgICd0eXBlJzogJ3dhcm4nXG4gICAgICB9IGlmIGRhdGEuc3RhdHMuaXNPdmVyZHVlXG5cbiAgICAgICMgU2hvdyB0aGUgcGFnZS5cbiAgICAgIEBzZXRcbiAgICAgICAgJ21pbGVzdG9uZSc6IGRhdGFcbiAgICAgICAgJ3JlYWR5JzogeWVzIiwieyBfLCBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkV2ZW50ZnVsICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9yYWN0aXZlL2V2ZW50ZnVsLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG51c2VyICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcbmtleSAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMva2V5LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGZ1bC5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9uZXcnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL25ldy5odG1sJ1xuXG4gICdkYXRhJzogeyAndmFsdWUnOiAncmFkZWtzdGVwYW4vZGlzcG9zYWJsZScsIHVzZXIgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICAjIExpc3RlbiB0byBFbnRlciBrZXlwcmVzcyBvciBTdWJtaXQgYnV0dG9uIGNsaWNrLlxuICBzdWJtaXQ6IChldnQsIHZhbHVlKSAtPlxuICAgIHJldHVybiBpZiBrZXkuaXMoZXZ0KSBhbmQgbm90IGtleS5pc0VudGVyKGV2dClcblxuICAgIFsgb3duZXIsIG5hbWUgXSA9IHZhbHVlLnNwbGl0ICcvJ1xuXG4gICAgIyBTYXZlIHJlcG8uXG4gICAgQHB1Ymxpc2ggJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgUmVkaXJlY3QgdG8gdGhlIGRhc2hib2FyZC5cbiAgICAjIFRPRE86IHRyaWdnZXIgYSBuYW1lZCByb3V0ZVxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQWRkIGEgbmV3IHByb2plY3QnXG5cbiAgICAjIFRPRE86IGF1dG9jb21wbGV0ZSBvbiBvdXIgdXNlcm5hbWUgaWYgd2UgYXJlIGxvZ2dlZCBpbiBvciBiYXNlZFxuICAgICMgIG9uIHJlcG9zIHdlIGFscmVhZHkgaGF2ZS5cbiAgICBhdXRvY29tcGxldGUgPSAodmFsdWUpIC0+XG5cbiAgICBAb2JzZXJ2ZSAndmFsdWUnLCBfLmRlYm91bmNlKGF1dG9jb21wbGV0ZSwgMjAwKSwgeyAnaW5pdCc6IG5vIH1cblxuICAgICMgRm9jdXMgb24gdGhlIGlucHV0IGZpZWxkLlxuICAgIGRvIEBlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLmZvY3VzXG5cbiAgICBAb24gJ3N1Ym1pdCcsIEBzdWJtaXQiLCJ7IF8sIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi90YWJsZXMvbWlsZXN0b25lcy5jb2ZmZWUnXG5cbkV2ZW50ZnVsICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9yYWN0aXZlL2V2ZW50ZnVsLmNvZmZlZSdcbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRmdWwuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvcHJvamVjdCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBNaWxlc3RvbmVzIH1cblxuICAnZGF0YSc6XG4gICAgJ3Byb2plY3RzJzogcHJvamVjdHNcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUgXSA9IEBnZXQgJ3JvdXRlJ1xuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBAc2V0ICdwcm9qZWN0JywgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIFdlIGRvbid0IGtub3cgaWYgd2UgaGF2ZSBhbGwgbWlsZXN0b25lcywgc28gZmV0Y2ggdGhlbS5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmaW5kTWlsZXN0b25lID0gKG51bWJlcikgLT5cbiAgICAgIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMgb3IgW10sIHsgbnVtYmVyIH1cblxuICAgIGZldGNoTWlsZXN0b25lcyA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGFsbE1pbGVzdG9uZXMsIGNiKSAtPlxuICAgICAgcmV0dXJuIGNiICdUaGUgcHJvamVjdCBoYXMgbm8gbWlsZXN0b25lcycgdW5sZXNzIGFsbE1pbGVzdG9uZXMubGVuZ3RoXG5cbiAgICAgIGFzeW5jLmVhY2ggYWxsTWlsZXN0b25lcywgKG1pbGVzdG9uZSwgY2IpIC0+XG4gICAgICAgICMgTWF5YmUgd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICByZXR1cm4gY2IgbnVsbCBpZiBmaW5kTWlsZXN0b25lIG1pbGVzdG9uZS5udW1iZXJcbiAgICAgICAgIyBOZWVkIHRvIGZldGNoIHRoZSBpc3N1ZXMgdGhlbi5cbiAgICAgICAgaXNzdWVzLmZldGNoQWxsIHsgb3duZXIsIG5hbWUsICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyIH0sIChlcnIsIG9iaikgLT5cbiAgICAgICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lIHdpdGggaXNzdWVzLlxuICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgIyBOZXh0LlxuICAgICAgICAgIGRvIGNiXG4gICAgICAsIGNiXG5cbiAgICAjIFJ1biBpdC5cbiAgICBhc3luYy53YXRlcmZhbGwgW1xuICAgICAgIyBGaXJzdCBnZXQgYWxsIHRoZSBtaWxlc3RvbmVzLlxuICAgICAgZmV0Y2hNaWxlc3RvbmVzLFxuICAgICAgIyBUaGVuIGFsbCB0aGUgaXNzdWVzIHBlciBtaWxlc3RvbmUuXG4gICAgICBmZXRjaElzc3Vlc1xuICAgIF0sIChlcnIpID0+XG4gICAgICBkbyBkb25lXG4gICAgICByZXR1cm4gQHB1Ymxpc2ggJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6IGRvIGVyci50b1N0cmluZ1xuICAgICAgICAndHlwZSc6ICdhbGVydCdcbiAgICAgICAgJ3N5c3RlbSc6IHllc1xuICAgICAgICAndHRsJzogbnVsbFxuICAgICAgfSBpZiBlcnJcblxuICAgICAgIyBTYXkgd2UgYXJlIHJlYWR5LlxuICAgICAgQHNldCAncmVhZHknLCB5ZXMiLCJUYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL21pbGVzdG9uZXMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9taWxlc3RvbmVzLmh0bWwnIiwiVGFibGUgPSByZXF1aXJlICcuL3RhYmxlLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJsZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wcm9qZWN0cydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwnIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xucHJvamVjdHMgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvdGFibGUnXG5cbiAgJ2RhdGEnOiB7IGZvcm1hdCB9XG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBDaGFuZ2Ugc29ydCBvcmRlci5cbiAgICBAb24gJ3NvcnRCeScsIC0+XG4gICAgICBmbnMgPSBwcm9qZWN0cy5kYXRhLnNvcnRGbnNcblxuICAgICAgaWR4ID0gMSArIGZucy5pbmRleE9mIHByb2plY3RzLmRhdGEuc29ydEJ5XG4gICAgICBpZHggPSAwIGlmIGlkeCBpcyBmbnMubGVuZ3RoXG5cbiAgICAgIHByb2plY3RzLnNldCAnc29ydEJ5JywgZm5zW2lkeF0iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gZXhwb3J0IHRoZSBjbGFzcyBpZiB3ZSBhcmUgaW4gYSBOb2RlLWxpa2Ugc3lzdGVtLlxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzID09PSBleHBvcnRzKVxuICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBTZW1WZXI7XG5cbi8vIFRoZSBkZWJ1ZyBmdW5jdGlvbiBpcyBleGNsdWRlZCBlbnRpcmVseSBmcm9tIHRoZSBtaW5pZmllZCB2ZXJzaW9uLlxuLyogbm9taW4gKi8gdmFyIGRlYnVnO1xuLyogbm9taW4gKi8gaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52ICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyAmJlxuICAgIC8qIG5vbWluICovIC9cXGJzZW12ZXJcXGIvaS50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpKVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8qIG5vbWluICovIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAvKiBub21pbiAqLyBhcmdzLnVuc2hpZnQoJ1NFTVZFUicpO1xuICAgIC8qIG5vbWluICovIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICAgIC8qIG5vbWluICovIH07XG4vKiBub21pbiAqLyBlbHNlXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcblxuLy8gTm90ZTogdGhpcyBpcyB0aGUgc2VtdmVyLm9yZyB2ZXJzaW9uIG9mIHRoZSBzcGVjIHRoYXQgaXQgaW1wbGVtZW50c1xuLy8gTm90IG5lY2Vzc2FyaWx5IHRoZSBwYWNrYWdlIHZlcnNpb24gb2YgdGhpcyBjb2RlLlxuZXhwb3J0cy5TRU1WRVJfU1BFQ19WRVJTSU9OID0gJzIuMC4wJztcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBUaWxkZSByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwicmVhc29uYWJseSBhdCBvciBncmVhdGVyIHRoYW5cIlxudmFyIExPTkVUSUxERSA9IFIrKztcbnNyY1tMT05FVElMREVdID0gJyg/On4+PyknO1xuXG52YXIgVElMREVUUklNID0gUisrO1xuc3JjW1RJTERFVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVUSUxERV0gKyAnXFxcXHMrJztcbnJlW1RJTERFVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tUSUxERVRSSU1dLCAnZycpO1xudmFyIHRpbGRlVHJpbVJlcGxhY2UgPSAnJDF+JztcblxudmFyIFRJTERFID0gUisrO1xuc3JjW1RJTERFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBUSUxERUxPT1NFID0gUisrO1xuc3JjW1RJTERFTE9PU0VdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIENhcmV0IHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJhdCBsZWFzdCBhbmQgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aFwiXG52YXIgTE9ORUNBUkVUID0gUisrO1xuc3JjW0xPTkVDQVJFVF0gPSAnKD86XFxcXF4pJztcblxudmFyIENBUkVUVFJJTSA9IFIrKztcbnNyY1tDQVJFVFRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FQ0FSRVRdICsgJ1xcXFxzKyc7XG5yZVtDQVJFVFRSSU1dID0gbmV3IFJlZ0V4cChzcmNbQ0FSRVRUUklNXSwgJ2cnKTtcbnZhciBjYXJldFRyaW1SZXBsYWNlID0gJyQxXic7XG5cbnZhciBDQVJFVCA9IFIrKztcbnNyY1tDQVJFVF0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgQ0FSRVRMT09TRSA9IFIrKztcbnNyY1tDQVJFVExPT1NFXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBBIHNpbXBsZSBndC9sdC9lcSB0aGluZywgb3IganVzdCBcIlwiIHRvIGluZGljYXRlIFwiYW55IHZlcnNpb25cIlxudmFyIENPTVBBUkFUT1JMT09TRSA9IFIrKztcbnNyY1tDT01QQVJBVE9STE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICcpJHxeJCc7XG52YXIgQ09NUEFSQVRPUiA9IFIrKztcbnNyY1tDT01QQVJBVE9SXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIEZVTExQTEFJTiArICcpJHxeJCc7XG5cblxuLy8gQW4gZXhwcmVzc2lvbiB0byBzdHJpcCBhbnkgd2hpdGVzcGFjZSBiZXR3ZWVuIHRoZSBndGx0IGFuZCB0aGUgdGhpbmdcbi8vIGl0IG1vZGlmaWVzLCBzbyB0aGF0IGA+IDEuMi4zYCA9PT4gYD4xLjIuM2BcbnZhciBDT01QQVJBVE9SVFJJTSA9IFIrKztcbnNyY1tDT01QQVJBVE9SVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0dUTFRdICtcbiAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJ3wnICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJztcblxuLy8gdGhpcyBvbmUgaGFzIHRvIHVzZSB0aGUgL2cgZmxhZ1xucmVbQ09NUEFSQVRPUlRSSU1dID0gbmV3IFJlZ0V4cChzcmNbQ09NUEFSQVRPUlRSSU1dLCAnZycpO1xudmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9ICckMSQyJDMnO1xuXG5cbi8vIFNvbWV0aGluZyBsaWtlIGAxLjIuMyAtIDEuMi40YFxuLy8gTm90ZSB0aGF0IHRoZXNlIGFsbCB1c2UgdGhlIGxvb3NlIGZvcm0sIGJlY2F1c2UgdGhleSdsbCBiZVxuLy8gY2hlY2tlZCBhZ2FpbnN0IGVpdGhlciB0aGUgc3RyaWN0IG9yIGxvb3NlIGNvbXBhcmF0b3IgZm9ybVxuLy8gbGF0ZXIuXG52YXIgSFlQSEVOUkFOR0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG52YXIgSFlQSEVOUkFOR0VMT09TRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRUxPT1NFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbi8vIFN0YXIgcmFuZ2VzIGJhc2ljYWxseSBqdXN0IGFsbG93IGFueXRoaW5nIGF0IGFsbC5cbnZhciBTVEFSID0gUisrO1xuc3JjW1NUQVJdID0gJyg8fD4pPz0/XFxcXHMqXFxcXConO1xuXG4vLyBDb21waWxlIHRvIGFjdHVhbCByZWdleHAgb2JqZWN0cy5cbi8vIEFsbCBhcmUgZmxhZy1mcmVlLCB1bmxlc3MgdGhleSB3ZXJlIGNyZWF0ZWQgYWJvdmUgd2l0aCBhIGZsYWcuXG5mb3IgKHZhciBpID0gMDsgaSA8IFI7IGkrKykge1xuICBkZWJ1ZyhpLCBzcmNbaV0pO1xuICBpZiAoIXJlW2ldKVxuICAgIHJlW2ldID0gbmV3IFJlZ0V4cChzcmNbaV0pO1xufVxuXG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5mdW5jdGlvbiBwYXJzZSh2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgciA9IGxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF07XG4gIHJldHVybiAoci50ZXN0KHZlcnNpb24pKSA/IG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpIDogbnVsbDtcbn1cblxuZXhwb3J0cy52YWxpZCA9IHZhbGlkO1xuZnVuY3Rpb24gdmFsaWQodmVyc2lvbiwgbG9vc2UpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBsb29zZSk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbDtcbn1cblxuXG5leHBvcnRzLmNsZWFuID0gY2xlYW47XG5mdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sICcnKSwgbG9vc2UpO1xuICByZXR1cm4gcyA/IHMudmVyc2lvbiA6IG51bGw7XG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyO1xuXG5mdW5jdGlvbiBTZW1WZXIodmVyc2lvbiwgbG9vc2UpIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gbG9vc2UpXG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICBlbHNlXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpO1xuXG4gIGRlYnVnKCdTZW1WZXInLCB2ZXJzaW9uLCBsb29zZSk7XG4gIHRoaXMubG9vc2UgPSBsb29zZTtcbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChsb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAoL15bMC05XSskLy50ZXN0KGlkKSkgPyAraWQgOiBpZDtcbiAgICB9KTtcblxuICB0aGlzLmJ1aWxkID0gbVs1XSA/IG1bNV0uc3BsaXQoJy4nKSA6IFtdO1xuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2g7XG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHRoaXMudmVyc2lvbiArPSAnLScgKyB0aGlzLnByZXJlbGVhc2Uuam9pbignLicpO1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnPFNlbVZlciBcIicgKyB0aGlzICsgJ1wiPic7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZlcnNpb247XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICBkZWJ1ZygnU2VtVmVyLmNvbXBhcmUnLCB0aGlzLnZlcnNpb24sIHRoaXMubG9vc2UsIG90aGVyKTtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZU1haW4ob3RoZXIpIHx8IHRoaXMuY29tcGFyZVByZShvdGhlcik7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1pbm9yLCBvdGhlci5taW5vcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLnBhdGNoLCBvdGhlci5wYXRjaCk7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVQcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgaSA9IDA7XG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXTtcbiAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDA7XG4gICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIGVsc2UgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICB9IHdoaWxlICgrK2kpO1xufTtcblxuLy8gcHJlbWlub3Igd2lsbCBidW1wIHRoZSB2ZXJzaW9uIHVwIHRvIHRoZSBuZXh0IG1pbm9yIHJlbGVhc2UsIGFuZCBpbW1lZGlhdGVseVxuLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuU2VtVmVyLnByb3RvdHlwZS5pbmMgPSBmdW5jdGlvbihyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21ham9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgIC8vIDEuMS4wIGJ1bXBzIHRvIDIuMC4wXG4gICAgICBpZiAodGhpcy5taW5vciAhPT0gMCB8fCB0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcmVyZWxlYXNlW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApO1xuICAgICAgfVxuICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgLy8gMS4yLjAtYmV0YS5mb29ibHogb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKVxuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSk7XG4gIH1cbiAgdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5leHBvcnRzLmluYyA9IGluYztcbmZ1bmN0aW9uIGluYyh2ZXJzaW9uLCByZWxlYXNlLCBsb29zZSwgaWRlbnRpZmllcikge1xuICBpZiAodHlwZW9mKGxvb3NlKSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZGVudGlmaWVyID0gbG9vc2U7XG4gICAgbG9vc2UgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvbjtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLmNvbXBhcmVJZGVudGlmaWVycyA9IGNvbXBhcmVJZGVudGlmaWVycztcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvO1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIChhbnVtICYmICFibnVtKSA/IC0xIDpcbiAgICAgICAgIChibnVtICYmICFhbnVtKSA/IDEgOlxuICAgICAgICAgYSA8IGIgPyAtMSA6XG4gICAgICAgICBhID4gYiA/IDEgOlxuICAgICAgICAgMDtcbn1cblxuZXhwb3J0cy5yY29tcGFyZUlkZW50aWZpZXJzID0gcmNvbXBhcmVJZGVudGlmaWVycztcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGIsIGEpO1xufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlO1xuZnVuY3Rpb24gY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShiKTtcbn1cblxuZXhwb3J0cy5jb21wYXJlTG9vc2UgPSBjb21wYXJlTG9vc2U7XG5mdW5jdGlvbiBjb21wYXJlTG9vc2UoYSwgYikge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKTtcbn1cblxuZXhwb3J0cy5yY29tcGFyZSA9IHJjb21wYXJlO1xuZnVuY3Rpb24gcmNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpO1xufVxuXG5leHBvcnRzLnNvcnQgPSBzb3J0O1xuZnVuY3Rpb24gc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMucnNvcnQgPSByc29ydDtcbmZ1bmN0aW9uIHJzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLnJjb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMuZ3QgPSBndDtcbmZ1bmN0aW9uIGd0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+IDA7XG59XG5cbmV4cG9ydHMubHQgPSBsdDtcbmZ1bmN0aW9uIGx0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8IDA7XG59XG5cbmV4cG9ydHMuZXEgPSBlcTtcbmZ1bmN0aW9uIGVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA9PT0gMDtcbn1cblxuZXhwb3J0cy5uZXEgPSBuZXE7XG5mdW5jdGlvbiBuZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpICE9PSAwO1xufVxuXG5leHBvcnRzLmd0ZSA9IGd0ZTtcbmZ1bmN0aW9uIGd0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPj0gMDtcbn1cblxuZXhwb3J0cy5sdGUgPSBsdGU7XG5mdW5jdGlvbiBsdGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDw9IDA7XG59XG5cbmV4cG9ydHMuY21wID0gY21wO1xuZnVuY3Rpb24gY21wKGEsIG9wLCBiLCBsb29zZSkge1xuICB2YXIgcmV0O1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnPT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSA9PT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyE9PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgIT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICcnOiBjYXNlICc9JzogY2FzZSAnPT0nOiByZXQgPSBlcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJyE9JzogcmV0ID0gbmVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPic6IHJldCA9IGd0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPj0nOiByZXQgPSBndGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8JzogcmV0ID0gbHQoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8PSc6IHJldCA9IGx0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb3BlcmF0b3I6ICcgKyBvcCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbmZ1bmN0aW9uIENvbXBhcmF0b3IoY29tcCwgbG9vc2UpIHtcbiAgaWYgKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgaWYgKGNvbXAubG9vc2UgPT09IGxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcblxuICBkZWJ1ZygnY29tcGFyYXRvcicsIGNvbXAsIGxvb3NlKTtcbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuICB0aGlzLnBhcnNlKGNvbXApO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHRoaXMudmFsdWUgPSAnJztcbiAgZWxzZVxuICAgIHRoaXMudmFsdWUgPSB0aGlzLm9wZXJhdG9yICsgdGhpcy5zZW12ZXIudmVyc2lvbjtcblxuICBkZWJ1ZygnY29tcCcsIHRoaXMpO1xufVxuXG52YXIgQU5ZID0ge307XG5Db21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGNvbXApIHtcbiAgdmFyIHIgPSB0aGlzLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJzxTZW1WZXIgQ29tcGFyYXRvciBcIicgKyB0aGlzICsgJ1wiPic7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLmxvb3NlKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIHJldHVybiBjbXAodmVyc2lvbiwgdGhpcy5vcGVyYXRvciwgdGhpcy5zZW12ZXIsIHRoaXMubG9vc2UpO1xufTtcblxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2U7XG5mdW5jdGlvbiBSYW5nZShyYW5nZSwgbG9vc2UpIHtcbiAgaWYgKChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSAmJiByYW5nZS5sb29zZSA9PT0gbG9vc2UpXG4gICAgcmV0dXJuIHJhbmdlO1xuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSYW5nZSkpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpO1xuXG4gIHRoaXMubG9vc2UgPSBsb29zZTtcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlO1xuICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKTtcbiAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoO1xuICB9KTtcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpO1xuICB9XG5cbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuUmFuZ2UucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICc8U2VtVmVyIFJhbmdlIFwiJyArIHRoaXMucmFuZ2UgKyAnXCI+Jztcbn07XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMubG9vc2U7XG4gIHJhbmdlID0gcmFuZ2UudHJpbSgpO1xuICBkZWJ1ZygncmFuZ2UnLCByYW5nZSwgbG9vc2UpO1xuICAvLyBgMS4yLjMgLSAxLjIuNGAgPT4gYD49MS4yLjMgPD0xLjIuNGBcbiAgdmFyIGhyID0gbG9vc2UgPyByZVtIWVBIRU5SQU5HRUxPT1NFXSA6IHJlW0hZUEhFTlJBTkdFXTtcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKTtcbiAgZGVidWcoJ2h5cGhlbiByZXBsYWNlJywgcmFuZ2UpO1xuICAvLyBgPiAxLjIuMyA8IDEuMi41YCA9PiBgPjEuMi4zIDwxLjIuNWBcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NPTVBBUkFUT1JUUklNXSwgY29tcGFyYXRvclRyaW1SZXBsYWNlKTtcbiAgZGVidWcoJ2NvbXBhcmF0b3IgdHJpbScsIHJhbmdlLCByZVtDT01QQVJBVE9SVFJJTV0pO1xuXG4gIC8vIGB+IDEuMi4zYCA9PiBgfjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbVElMREVUUklNXSwgdGlsZGVUcmltUmVwbGFjZSk7XG5cbiAgLy8gYF4gMS4yLjNgID0+IGBeMS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDQVJFVFRSSU1dLCBjYXJldFRyaW1SZXBsYWNlKTtcblxuICAvLyBub3JtYWxpemUgc3BhY2VzXG4gIHJhbmdlID0gcmFuZ2Uuc3BsaXQoL1xccysvKS5qb2luKCcgJyk7XG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIHJhbmdlIGlzIGNvbXBsZXRlbHkgdHJpbW1lZCBhbmRcbiAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVtDT01QQVJBVE9STE9PU0VdIDogcmVbQ09NUEFSQVRPUl07XG4gIHZhciBzZXQgPSByYW5nZS5zcGxpdCgnICcpLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHBhcnNlQ29tcGFyYXRvcihjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5sb29zZSkge1xuICAgIC8vIGluIGxvb3NlIG1vZGUsIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHZhbGlkIGNvbXBhcmF0b3JzXG4gICAgc2V0ID0gc2V0LmZpbHRlcihmdW5jdGlvbihjb21wKSB7XG4gICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSk7XG4gICAgfSk7XG4gIH1cbiAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cbi8vIE1vc3RseSBqdXN0IGZvciB0ZXN0aW5nIGFuZCBsZWdhY3kgQVBJIHJlYXNvbnNcbmV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzKHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSkuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcbiAgfSk7XG59XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmZ1bmN0aW9uIHBhcnNlQ29tcGFyYXRvcihjb21wLCBsb29zZSkge1xuICBkZWJ1ZygnY29tcCcsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVRpbGRlcyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3hyYW5nZScsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3N0YXJzJywgY29tcCk7XG4gIHJldHVybiBjb21wO1xufVxuXG5mdW5jdGlvbiBpc1goaWQpIHtcbiAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSAneCcgfHwgaWQgPT09ICcqJztcbn1cblxuLy8gfiwgfj4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyB+MiwgfjIueCwgfjIueC54LCB+PjIsIH4+Mi54IH4+Mi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyB+Mi4wLCB+Mi4wLngsIH4+Mi4wLCB+PjIuMC54IC0tPiA+PTIuMC4wIDwyLjEuMFxuLy8gfjEuMiwgfjEuMi54LCB+PjEuMiwgfj4xLjIueCAtLT4gPj0xLjIuMCA8MS4zLjBcbi8vIH4xLjIuMywgfj4xLjIuMyAtLT4gPj0xLjIuMyA8MS4zLjBcbi8vIH4xLjIuMCwgfj4xLjIuMCAtLT4gPj0xLjIuMCA8MS4zLjBcbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZXMoY29tcCwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUoY29tcCwgbG9vc2UpIHtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW1RJTERFTE9PU0VdIDogcmVbVElMREVdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3RpbGRlJywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSlcbiAgICAgIC8vIH4xLjIgPT0gPj0xLjIuMC0gPDEuMy4wLVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXQoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgbG9vc2UpO1xuICB2YXIgciA9IGxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBsb29zZSk7XG4gIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSkge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIHZhciByID0gbG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCdcbiAgICAgICAgaWYgKHhtKVxuICAgICAgICAgIE0gPSArTSArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG0gPSArbSArIDFcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgbG9vc2UpO1xuICAvLyBMb29zZW5lc3MgaXMgaWdub3JlZCBoZXJlLiAgc3RhciBpcyBhbHdheXMgYXMgbG9vc2UgYXMgaXQgZ2V0cyFcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbU1RBUl0sICcnKTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBwYXNzZWQgdG8gc3RyaW5nLnJlcGxhY2UocmVbSFlQSEVOUkFOR0VdKVxuLy8gTSwgbSwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkXG4vLyAxLjIgLSAzLjQuNSA9PiA+PTEuMi4wIDw9My40LjVcbi8vIDEuMi4zIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjBcbmZ1bmN0aW9uIGh5cGhlblJlcGxhY2UoJDAsXG4gICAgICAgICAgICAgICAgICAgICAgIGZyb20sIGZNLCBmbSwgZnAsIGZwciwgZmIsXG4gICAgICAgICAgICAgICAgICAgICAgIHRvLCB0TSwgdG0sIHRwLCB0cHIsIHRiKSB7XG5cbiAgaWYgKGlzWChmTSkpXG4gICAgZnJvbSA9ICcnO1xuICBlbHNlIGlmIChpc1goZm0pKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWChmcCkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuJyArIGZtICsgJy4wJztcbiAgZWxzZVxuICAgIGZyb20gPSAnPj0nICsgZnJvbTtcblxuICBpZiAoaXNYKHRNKSlcbiAgICB0byA9ICcnO1xuICBlbHNlIGlmIChpc1godG0pKVxuICAgIHRvID0gJzwnICsgKCt0TSArIDEpICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1godHApKVxuICAgIHRvID0gJzwnICsgdE0gKyAnLicgKyAoK3RtICsgMSkgKyAnLjAnO1xuICBlbHNlIGlmICh0cHIpXG4gICAgdG8gPSAnPD0nICsgdE0gKyAnLicgKyB0bSArICcuJyArIHRwICsgJy0nICsgdHByO1xuICBlbHNlXG4gICAgdG8gPSAnPD0nICsgdG87XG5cbiAgcmV0dXJuIChmcm9tICsgJyAnICsgdG8pLnRyaW0oKTtcbn1cblxuXG4vLyBpZiBBTlkgb2YgdGhlIHNldHMgbWF0Y2ggQUxMIG9mIGl0cyBjb21wYXJhdG9ycywgdGhlbiBwYXNzXG5SYW5nZS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbikpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJhbmdlLnRlc3QodmVyc2lvbik7XG59XG5cbmV4cG9ydHMubWF4U2F0aXNmeWluZyA9IG1heFNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtYXhTYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgbG9vc2UpIHtcbiAgcmV0dXJuIHZlcnNpb25zLmZpbHRlcihmdW5jdGlvbih2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgbG9vc2UpO1xuICB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gcmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KVswXSB8fCBudWxsO1xufVxuXG5leHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlO1xuZnVuY3Rpb24gdmFsaWRSYW5nZShyYW5nZSwgbG9vc2UpIHtcbiAgdHJ5IHtcbiAgICAvLyBSZXR1cm4gJyonIGluc3RlYWQgb2YgJycgc28gdGhhdCB0cnV0aGluZXNzIHdvcmtzLlxuICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBpZiBpdCdzIGludmFsaWQgYW55d2F5XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpLnJhbmdlIHx8ICcqJztcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmV4cG9ydHMubHRyID0gbHRyO1xuZnVuY3Rpb24gbHRyKHZlcnNpb24sIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJzwnLCBsb29zZSk7XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZS5cbmV4cG9ydHMuZ3RyID0gZ3RyO1xuZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBsb29zZSk7XG59XG5cbmV4cG9ydHMub3V0c2lkZSA9IG91dHNpZGU7XG5mdW5jdGlvbiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCBoaWxvLCBsb29zZSkge1xuICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSk7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG5cbiAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcDtcbiAgc3dpdGNoIChoaWxvKSB7XG4gICAgY2FzZSAnPic6XG4gICAgICBndGZuID0gZ3Q7XG4gICAgICBsdGVmbiA9IGx0ZTtcbiAgICAgIGx0Zm4gPSBsdDtcbiAgICAgIGNvbXAgPSAnPic7XG4gICAgICBlY29tcCA9ICc+PSc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICc8JzpcbiAgICAgIGd0Zm4gPSBsdDtcbiAgICAgIGx0ZWZuID0gZ3RlO1xuICAgICAgbHRmbiA9IGd0O1xuICAgICAgY29tcCA9ICc8JztcbiAgICAgIGVjb21wID0gJzw9JztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IHByb3ZpZGUgYSBoaWxvIHZhbCBvZiBcIjxcIiBvciBcIj5cIicpO1xuICB9XG5cbiAgLy8gSWYgaXQgc2F0aXNpZmVzIHRoZSByYW5nZSBpdCBpcyBub3Qgb3V0c2lkZVxuICBpZiAoc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBsb29zZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGcm9tIG5vdyBvbiwgdmFyaWFibGUgdGVybXMgYXJlIGFzIGlmIHdlJ3JlIGluIFwiZ3RyXCIgbW9kZS5cbiAgLy8gYnV0IG5vdGUgdGhhdCBldmVyeXRoaW5nIGlzIGZsaXBwZWQgZm9yIHRoZSBcImx0clwiIGZ1bmN0aW9uLlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgdmFyIGhpZ2ggPSBudWxsO1xuICAgIHZhciBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaChmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICBoaWdoID0gaGlnaCB8fCBjb21wYXJhdG9yO1xuICAgICAgbG93ID0gbG93IHx8IGNvbXBhcmF0b3I7XG4gICAgICBpZiAoZ3Rmbihjb21wYXJhdG9yLnNlbXZlciwgaGlnaC5zZW12ZXIsIGxvb3NlKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgbG9vc2UpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBVc2UgdGhlIGRlZmluZSgpIGZ1bmN0aW9uIGlmIHdlJ3JlIGluIEFNRCBsYW5kXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuICBkZWZpbmUoZXhwb3J0cyk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSJdfQ==
