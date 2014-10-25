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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvYXBwLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9jb25maWcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvc3lzdGVtLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy91c2VyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL3JlcXVlc3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3JvdXRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3N0YXRzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvdmVuZG9yLmNvZmZlZSIsInNyYy90ZW1wbGF0ZXMvYXBwLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2NoYXJ0Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL3RlbXBsYXRlcy9oZXJvLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2ljb25zLmh0bWwiLCJzcmMvdGVtcGxhdGVzL25vdGlmeS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9kYXRlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2Zvcm1hdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9rZXkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbWl4aW5zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvcmFjdGl2ZS9tb2RlbC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9jaGFydC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZWFkZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaGVyby5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9pY29ucy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9ub3RpZnkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvaW5kZXguY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbWlsZXN0b25lLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL25ldy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9wcm9qZWN0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvdGFibGUuY29mZmVlIiwidmVuZG9yL25vZGUtc2VtdmVyL3NlbXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhbk11dGF0aW9uT2JzZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgaWYgKGNhbk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdmFyIGhpZGRlbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZUxpc3QgPSBxdWV1ZS5zbGljZSgpO1xuICAgICAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHF1ZXVlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShoaWRkZW5EaXYsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIGlmICghcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgneWVzJywgJ25vJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG4jIExvZGFzaCBtaXhpbnMuXG5yZXF1aXJlICcuL3V0aWxzL21peGlucy5jb2ZmZWUnXG4jIFdpbGwgbG9hZCBwcm9qZWN0cyBmcm9tIGxvY2FsU3RvcmFnZS5cbnJlcXVpcmUgJy4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcblxuSGVhZGVyID0gcmVxdWlyZSAnLi92aWV3cy9oZWFkZXIuY29mZmVlJ1xuTm90aWZ5ID0gcmVxdWlyZSAnLi92aWV3cy9ub3RpZnkuY29mZmVlJ1xucm91dGVyID0gcmVxdWlyZSAnLi9tb2R1bGVzL3JvdXRlci5jb2ZmZWUnXG5cbm5ldyBSYWN0aXZlXG4gIFxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuL3RlbXBsYXRlcy9hcHAuaHRtbCdcblxuICAnZWwnOiAnYm9keSdcblxuICAnY29tcG9uZW50cyc6IHsgSGVhZGVyLCBOb3RpZnkgfVxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU3RhcnQgdGhlIHJvdXRlci5cbiAgICByb3V0ZXIuaW5pdCAnLyciLCJNb2RlbCA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvbW9kZWwuY29mZmVlJ1xudXNlciAgID0gcmVxdWlyZSAnLi91c2VyLmNvZmZlZSdcbmNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvZmlyZWJhc2UnXG5cbiAgYXV0aDogLT5cbiAgICB0aHJvdyAnTm90IG92ZXJyaWRlbidcblxuICAjIExvZ2luIGEgdXNlci5cbiAgbG9naW46IChjYikgLT5cbiAgICAjIExvZ2luLlxuICAgIEBhdXRoLmxvZ2luIGNvbmZpZy5kYXRhLnByb3ZpZGVyLFxuICAgICAgJ3JlbWVtYmVyTWUnOiB5ZXNcbiAgICAgICdzY29wZSc6ICdwcml2YXRlX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSwgc29ydGVkSW5kZXhDbXAsIHNlbXZlciB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvbW9kZWwuY29mZmVlJ1xuY29uZmlnICAgPSByZXF1aXJlICcuLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbnN0YXRzICAgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9zdGF0cy5jb2ZmZWUnXG5kYXRlICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL2RhdGUuY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9wcm9qZWN0cydcblxuICAnZGF0YSc6XG4gICAgIyBDdXJyZW50IHNvcnQgb3JkZXIuXG4gICAgJ3NvcnRCeSc6ICdwcmlvcml0eSdcbiAgICAjIFNvcnQgZnVuY3Rpb25zLlxuICAgICdzb3J0Rm5zJzogWyAncHJvZ3Jlc3MnLCAncHJpb3JpdHknLCAnbmFtZScgXVxuXG4gICMgUmV0dXJuIGEgc29ydCBvcmRlciBjb21wYXJhdG9yLlxuICBjb21wYXJhdG9yOiAtPlxuICAgIHsgbGlzdCwgc29ydEJ5IH0gPSBAZGF0YVxuXG4gICAgIyBDb252ZXJ0IGV4aXN0aW5nIGluZGV4IGludG8gYWN0dWFsIHByb2plY3QgbWlsZXN0b25lLlxuICAgIGRlSWR4ID0gKGZuKSA9PlxuICAgICAgKFsgaSwgaiBdLCByZXN0Li4uKSA9PlxuICAgICAgICBmbi5hcHBseSBALCBbIFsgbGlzdFtpXSwgbGlzdFtpXS5taWxlc3RvbmVzW2pdIF0gXS5jb25jYXQgcmVzdFxuXG4gICAgIyBTZXQgZGVmYXVsdCBmaWVsZHMsIGluIHBsYWNlLlxuICAgIGRlZmF1bHRzID0gKGFyciwgaGFzaCkgLT5cbiAgICAgIGZvciBpdGVtIGluIGFyclxuICAgICAgICBmb3IgaywgdiBvZiBoYXNoXG4gICAgICAgICAgcmVmID0gaXRlbVxuICAgICAgICAgIGZvciBwLCBpIGluIGtleXMgPSBrLnNwbGl0ICcuJ1xuICAgICAgICAgICAgaWYgaSBpcyBrZXlzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgcmVmW3BdID89IHZcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmVmID0gcmVmW3BdID89IHt9XG5cbiAgICAjIFRoZSBhY3R1YWwgZm4gc2VsZWN0aW9uLlxuICAgIHN3aXRjaCBzb3J0QnlcbiAgICAgICMgRnJvbSBoaWdoZXN0IHByb2dyZXNzIHBvaW50cy5cbiAgICAgIHdoZW4gJ3Byb2dyZXNzJyB0aGVuIGRlSWR4IChbIGFQLCBhTSBdLCBbIGJQLCBiTSBdKSAtPlxuICAgICAgICBkZWZhdWx0cyBbIGFNLCBiTSBdLCB7ICdzdGF0cy5wcm9ncmVzcy5wb2ludHMnOiAwIH1cbiAgICAgICAgIyBTaW1wbGUgcG9pbnRzIGRpZmZlcmVuY2UuXG4gICAgICAgIGFNLnN0YXRzLnByb2dyZXNzLnBvaW50cyAtIGJNLnN0YXRzLnByb2dyZXNzLnBvaW50c1xuXG4gICAgICAjIEZyb20gbW9zdCBkZWxheWVkIGluIGRheXMuXG4gICAgICB3aGVuICdwcmlvcml0eScgdGhlbiBkZUlkeCAoWyBhUCwgYU0gXSwgWyBiUCwgYk0gXSkgLT5cbiAgICAgICAgIyBNaWxlc3RvbmVzIHdpdGggbm8gZGVhZGxpbmUgYXJlIGFsd2F5cyBhdCB0aGUgXCJiZWdpbm5pbmdcIi5cbiAgICAgICAgZGVmYXVsdHMgWyBhTSwgYk0gXSwgeyAnc3RhdHMucHJvZ3Jlc3MudGltZSc6IDAsICdzdGF0cy5kYXlzJzogMWUzIH1cbiAgICAgICAgIyAlIGRpZmZlcmVuY2UgaW4gcHJvZ3Jlc3MgdGltZXMgdGhlIG51bWJlciBvZiBkYXlzIGFoZWFkIG9yIGJlaGluZC5cbiAgICAgICAgWyAkYSwgJGIgXSA9IF8ubWFwIFsgYU0sIGJNIF0sICh7IHN0YXRzIH0pIC0+XG4gICAgICAgICAgKHN0YXRzLnByb2dyZXNzLnBvaW50cyAtIHN0YXRzLnByb2dyZXNzLnRpbWUpICogc3RhdHMuZGF5c1xuXG4gICAgICAgICRiIC0gJGFcblxuICAgICAgIyBCYXNlZCBvbiBwcm9qZWN0IHRoZW4gbWlsZXN0b25lIG5hbWUgaW5jbHVkaW5nIHNlbXZlci5cbiAgICAgIHdoZW4gJ25hbWUnIHRoZW4gZGVJZHggKFsgYVAsIGFNIF0sIFsgYlAsIGJNIF0pIC0+XG4gICAgICAgIHJldHVybiBvd25lciBpZiBvd25lciA9IGJQLm93bmVyLmxvY2FsZUNvbXBhcmUgYVAub3duZXJcbiAgICAgICAgcmV0dXJuIG5hbWUgaWYgbmFtZSA9IGJQLm5hbWUubG9jYWxlQ29tcGFyZSBhUC5uYW1lXG4gICAgICAgICMgVHJ5IHNlbXZlci5cbiAgICAgICAgaWYgc2VtdmVyLnZhbGlkKGJNLnRpdGxlKSBhbmQgc2VtdmVyLnZhbGlkKGFNLnRpdGxlKVxuICAgICAgICAgIHNlbXZlci5ndCBiTS50aXRsZSwgYU0udGl0bGVcbiAgICAgICAgIyBCYWNrIHRvIHN0cmluZyBjb21wYXJlLlxuICAgICAgICBlbHNlXG4gICAgICAgICAgYk0udGl0bGUubG9jYWxlQ29tcGFyZSBhTS50aXRsZVxuXG4gICAgICAjIFRoZSBcIndoYXRldmVyXCIgc29ydCBvcmRlci4uLlxuICAgICAgZWxzZSAtPiAwXG5cbiAgZmluZDogKHByb2plY3QpIC0+XG4gICAgXy5maW5kIEBkYXRhLmxpc3QsIHByb2plY3RcblxuICBleGlzdHM6IC0+XG4gICAgISFAZmluZC5hcHBseSBALCBhcmd1bWVudHNcblxuICAjIFB1c2ggdG8gdGhlIHN0YWNrIHVubGVzcyBpdCBleGlzdHMgYWxyZWFkeS5cbiAgYWRkOiAocHJvamVjdCkgLT5cbiAgICBAcHVzaCAnbGlzdCcsIHByb2plY3QgdW5sZXNzIEBleGlzdHMgcHJvamVjdFxuXG4gICMgRmluZCBpbmRleCBvZiBhIHByb2plY3QuXG4gIGZpbmRJbmRleDogKHsgb3duZXIsIG5hbWUgfSkgLT5cbiAgICBfLmZpbmRJbmRleCBAZGF0YS5saXN0LCB7IG93bmVyLCBuYW1lIH1cblxuICAjIEFkZCBhIG1pbGVzdG9uZSBmb3IgYSBwcm9qZWN0LlxuICBhZGRNaWxlc3RvbmU6IChwcm9qZWN0LCBtaWxlc3RvbmUpIC0+XG4gICAgIyBBZGQgaW4gdGhlIHN0YXRzLlxuICAgIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnc3RhdHMnOiBzdGF0cyhtaWxlc3RvbmUpIH1cbiAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgIHRocm93IDUwMCBpZiAoaSA9IEBmaW5kSW5kZXgocHJvamVjdCkpIDwgMCBcblxuICAgICMgSGF2ZSBtaWxlc3RvbmVzIGFscmVhZHk/XG4gICAgaWYgcHJvamVjdC5taWxlc3RvbmVzP1xuICAgICAgQHB1c2ggXCJsaXN0LiN7aX0ubWlsZXN0b25lc1wiLCBtaWxlc3RvbmVcbiAgICAgIGogPSBAZGF0YS5saXN0W2ldLm1pbGVzdG9uZXMubGVuZ3RoIC0gMSAjIGluZGV4IGluIG1pbGVzdG9uZXNcbiAgICBlbHNlXG4gICAgICBAc2V0IFwibGlzdC4je2l9Lm1pbGVzdG9uZXNcIiwgWyBtaWxlc3RvbmUgXVxuICAgICAgaiA9IDAgICMgaW5kZXggaW4gbWlsZXN0b25lc1xuXG4gICAgIyBOb3cgaW5kZXggdGhpcyBtaWxlc3RvbmUuXG4gICAgQHNvcnQgWyBpLCBqIF0sIFsgcHJvamVjdCwgbWlsZXN0b25lIF1cblxuICAjIFNhdmUgYW4gZXJyb3IgZnJvbSBsb2FkaW5nIG1pbGVzdG9uZXMgb3IgaXNzdWVzXG4gIHNhdmVFcnJvcjogKHByb2plY3QsIGVycikgLT5cbiAgICBpZiAoaWR4ID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPiAtMVxuICAgICAgaWYgcHJvamVjdC5lcnJvcnM/XG4gICAgICAgIEBwdXNoIFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIGVyclxuICAgICAgZWxzZVxuICAgICAgICBAc2V0IFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIFsgZXJyIF1cbiAgICBlbHNlXG4gICAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgICAgdGhyb3cgNTAwICBcblxuICBjbGVhcjogLT5cbiAgICBAc2V0ICdsaXN0JzogW10sICdpbmRleCc6IFtdXG5cbiAgIyBTb3J0L29yIGluc2VydCBpbnRvIGFuIGFscmVhZHkgc29ydGVkIGluZGV4LlxuICBzb3J0OiAocmVmLCBkYXRhKSAtPlxuICAgICMgR2V0IG9yIGluaXRpYWxpemUgdGhlIGluZGV4LlxuICAgIGluZGV4ID0gQGRhdGEuaW5kZXggb3IgW11cblxuICAgICMgRG8gb25lLlxuICAgIGlmIHJlZlxuICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIGRhdGEsIGRvIEBjb21wYXJhdG9yXG4gICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCByZWZcbiAgICAjIERvIGFsbC5cbiAgICBlbHNlXG4gICAgICBmb3IgcCwgaSBpbiBAZGF0YS5saXN0XG4gICAgICAgICMgVE9ETzogbmVlZCB0byBzaG93IHByb2plY3RzIHRoYXQgZmFpbGVkIHRvby4uLlxuICAgICAgICBjb250aW51ZSB1bmxlc3MgcC5taWxlc3RvbmVzP1xuICAgICAgICBmb3IgbSwgaiBpbiBwLm1pbGVzdG9uZXNcbiAgICAgICAgICAjIFJ1biBhIGNvbXBhcmF0b3IgaGVyZSBpbnNlcnRpbmcgaW50byBpbmRleC5cbiAgICAgICAgICBpZHggPSBzb3J0ZWRJbmRleENtcCBpbmRleCwgWyBwLCBtIF0sIGRvIEBjb21wYXJhdG9yXG4gICAgICAgICAgIyBMb2cuXG4gICAgICAgICAgaW5kZXguc3BsaWNlIGlkeCwgMCwgWyBpLCBqIF1cblxuICAgICMgU2F2ZSB0aGUgaW5kZXguXG4gICAgQHNldCAnaW5kZXgnLCBpbmRleFxuXG4gIG9uY29uc3RydWN0OiAtPlxuICAgIEBzdWJzY3JpYmUgJyFwcm9qZWN0cy9hZGQnLCAgICBAYWRkLCBAXG4gICAgQHN1YnNjcmliZSAnIXByb2plY3RzL2NsZWFyJywgIEBjbGVhciwgQFxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgSW5pdCB0aGUgcHJvamVjdHMuXG4gICAgQHNldCAnbGlzdCcsIGxzY2FjaGUuZ2V0KCdwcm9qZWN0cycpIG9yIFtdXG5cbiAgICAjIFBlcnNpc3QgcHJvamVjdHMgaW4gbG9jYWwgc3RvcmFnZSAoc2FucyBtaWxlc3RvbmVzKS5cbiAgICBAb2JzZXJ2ZSAnbGlzdCcsIChwcm9qZWN0cykgLT5cbiAgICAgIGxzY2FjaGUuc2V0ICdwcm9qZWN0cycsIF8ucGx1Y2tNYW55IHByb2plY3RzLCBbICdvd25lcicsICduYW1lJyBdXG4gICAgLCAnaW5pdCc6IG5vXG5cbiAgICAjIFJlc2V0IG91ciBpbmRleCBhbmQgcmUtc29ydC5cbiAgICBAb2JzZXJ2ZSAnc29ydEJ5JywgLT5cbiAgICAgICMgVXNlIHBvcCBhcyBSYWN0aXZlIGlzIGdsaXRjaHkgd2hlbiByZXNldHRpbmcgYXJyYXlzLlxuICAgICAgQHNldCAnaW5kZXgnLCBudWxsXG4gICAgICAjwqBSdW4gdGhlIHNvcnQgYWdhaW4uXG4gICAgICBkbyBAc29ydFxuICAgICwgJ2luaXQnOiBubyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvcmFjdGl2ZS9tb2RlbC5jb2ZmZWUnXG5cbiMgU3lzdGVtIHN0YXRlLlxuc3lzdGVtID0gbmV3IE1vZGVsXG4gIFxuICAnbmFtZSc6ICdtb2RlbHMvc3lzdGVtJ1xuXG4gICdkYXRhJzpcbiAgICAnbG9hZGluZyc6IG5vXG5cbmNvdW50ZXIgPSAwXG5hc3luYyA9IC0+XG4gIGNvdW50ZXIgKz0gMVxuICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgeWVzXG4gIC0+XG4gICAgY291bnRlciAtPSAxXG4gICAgc3lzdGVtLnNldCAnbG9hZGluZycsICtjb3VudGVyXG5cbm1vZHVsZS5leHBvcnRzID0geyBzeXN0ZW0sIGFzeW5jIH0iLCJNb2RlbCA9IHJlcXVpcmUgJy4uL3V0aWxzL3JhY3RpdmUvbW9kZWwuY29mZmVlJ1xuXG4jIEN1cnJlbnRseSBsb2dnZWQtaW4gdXNlci5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL3VzZXInXG5cbiAgIyBEZWZhdWx0IHRvIGEgbG9jYWwgdXNlci5cbiAgJ2RhdGEnOlxuICAgICdwcm92aWRlcic6ICBcImxvY2FsXCJcbiAgICAnaWQnOiAgICAgICAgXCIwXCJcbiAgICAndWlkJzogICAgICAgXCJsb2NhbDowXCJcbiAgICAndG9rZW4nOiAgICAgbnVsbCIsInsgZDMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBob3Jpem9udGFsOiAoaGVpZ2h0LCB4KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeClcbiAgICAgIC5vcmllbnQoXCJib3R0b21cIilcbiAgICAgICMgU2hvdyB2ZXJ0aWNhbCBsaW5lcy4uLlxuICAgICAgLnRpY2tTaXplKC1oZWlnaHQpXG4gICAgICAjIC4uLndpdGggZGF5IG9mIHRoZSBtb250aC4uLlxuICAgICAgLnRpY2tGb3JtYXQoIChkKSAtPiBkLmdldERhdGUoKSApXG4gICAgICAjIC4uLmFuZCBnaXZlIHVzIGEgc3BhY2VyLlxuICAgICAgLnRpY2tQYWRkaW5nKDEwKVxuXG4gIHZlcnRpY2FsOiAod2lkdGgsIHkpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh5KVxuICAgICAgLm9yaWVudChcImxlZnRcIilcbiAgICAgIC50aWNrU2l6ZSgtd2lkdGgpXG4gICAgICAudGlja3MoNSlcbiAgICAgIC50aWNrUGFkZGluZygxMCkiLCJ7IF8sIGQzIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmNvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBBIGdyYXBoIG9mIGNsb3NlZCBpc3N1ZXMuXG4gICMgYGlzc3Vlc2A6ICAgICBpc3N1ZXMgbGlzdFxuICAjIGBjcmVhdGVkX2F0YDogbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgdG90YWxgOiAgICB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgYWN0dWFsOiAoaXNzdWVzLCBjcmVhdGVkX2F0LCB0b3RhbCkgLT5cbiAgICBoZWFkID0gWyB7XG4gICAgICAnZGF0ZSc6IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAgICdwb2ludHMnOiB0b3RhbFxuICAgIH0gXVxuICAgIFxuICAgIG1pbiA9ICtJbmZpbml0eSA7IG1heCA9IC1JbmZpbml0eVxuXG4gICAgIyBHZW5lcmF0ZSB0aGUgYWN0dWFsIGNsb3Nlcy5cbiAgICByZXN0ID0gXy5tYXAgaXNzdWVzLCAoaXNzdWUpIC0+XG4gICAgICB7IHNpemUsIGNsb3NlZF9hdCB9ID0gaXNzdWVcbiAgICAgICMgRGV0ZXJtaW5lIHRoZSByYW5nZS5cbiAgICAgIG1pbiA9IHNpemUgaWYgc2l6ZSA8IG1pblxuICAgICAgbWF4ID0gc2l6ZSBpZiBzaXplID4gbWF4XG5cbiAgICAgICMgRHJvcHBpbmcgcG9pbnRzIHJlbWFpbmluZy5cbiAgICAgIGlzc3VlLmRhdGUgPSBuZXcgRGF0ZSBjbG9zZWRfYXRcbiAgICAgIGlzc3VlLnBvaW50cyA9IHRvdGFsIC09IHNpemVcbiAgICAgIGlzc3VlXG4gICAgXG4gICAgIyBOb3cgYWRkIGEgcmFkaXVzIGluIGEgcmFuZ2UgKHdpbGwgYmUgdXNlZCBmb3IgYSBjaXJjbGUpLlxuICAgIHJhbmdlID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFsgbWluLCBtYXggXSkucmFuZ2UoWyA1LCA4IF0pXG5cbiAgICByZXN0ID0gXy5tYXAgcmVzdCwgKGlzc3VlKSAtPlxuICAgICAgaXNzdWUucmFkaXVzID0gcmFuZ2UgaXNzdWUuc2l6ZVxuICAgICAgaXNzdWVcblxuICAgIFtdLmNvbmNhdCBoZWFkLCByZXN0XG5cbiAgIyBBIGdyYXBoIG9mIGFuIGlkZWFsIHByb2dyZXNzaW9uLi5cbiAgIyBgYWA6ICAgbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgYmA6ICAgbWlsZXN0b25lIGVuZCBkYXRlXG4gICMgYHRvdGFsYDogdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGlkZWFsOiAoYSwgYiwgdG90YWwpIC0+XG4gICAgIyBTd2FwP1xuICAgIFsgYiwgYSBdID0gWyBhLCBiIF0gaWYgYiA8IGFcblxuICAgICMgV2Ugc3RhcnQgaGVyZSBhZGRpbmcgZGF5cyB0byBgZGAuXG4gICAgWyB5LCBtLCBkIF0gPSBfLm1hcCBhLm1hdGNoKGNvbmZpZy5kYXRhLmNoYXJ0LmRhdGV0aW1lKVsxXS5zcGxpdCgnLScpLCAodikgLT4gcGFyc2VJbnQgdlxuICAgICMgV2Ugd2FudCB0byBlbmQgaGVyZS5cbiAgICBjdXRvZmYgPSBuZXcgRGF0ZShiKVxuXG4gICAgIyBHbyB0aHJvdWdoIHRoZSBiZWdpbm5pbmcgdG8gdGhlIGVuZCBza2lwcGluZyBvZmYgZGF5cy5cbiAgICBkYXlzID0gW10gOyBsZW5ndGggPSAwXG4gICAgZG8gb25jZSA9IChpbmMgPSAwKSAtPlxuICAgICAgIyBBIG5ldyBkYXkuXG4gICAgICBkYXkgPSBuZXcgRGF0ZSB5LCBtIC0gMSwgZCArIGluY1xuICAgICAgXG4gICAgICAjIERvZXMgdGhpcyBkYXkgY291bnQ/XG4gICAgICBkYXlfb2YgPSA3IGlmICFkYXlfb2YgPSBkYXkuZ2V0RGF5KClcbiAgICAgIGlmIGRheV9vZiBpbiBjb25maWcuZGF0YS5jaGFydC5vZmZfZGF5c1xuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXksIG9mZl9kYXk6IHllcyB9XG4gICAgICBlbHNlXG4gICAgICAgIGxlbmd0aCArPSAxXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSB9XG4gICAgICBcbiAgICAgICMgR28gYWdhaW4/XG4gICAgICBvbmNlKGluYyArIDEpIHVubGVzcyBkYXkgPiBjdXRvZmZcblxuICAgICMgTWFwIHBvaW50cyBvbiB0aGUgYXJyYXkgb2YgZGF5cyBub3cuXG4gICAgdmVsb2NpdHkgPSB0b3RhbCAvIChsZW5ndGggLSAxKVxuXG4gICAgZGF5cyA9IF8ubWFwIGRheXMsIChkYXksIGkpIC0+XG4gICAgICBkYXkucG9pbnRzID0gdG90YWxcbiAgICAgIHRvdGFsIC09IHZlbG9jaXR5IGlmIGRheXNbaV0gYW5kIG5vdCBkYXlzW2ldLm9mZl9kYXlcbiAgICAgIGRheVxuXG4gICAgIyBEbyB3ZSBuZWVkIHRvIG1ha2UgYSBsaW5rIHRvIHJpZ2h0IG5vdz9cbiAgICBkYXlzLnB1c2ggeyBkYXRlOiBub3csIHBvaW50czogMCB9IGlmIChub3cgPSBuZXcgRGF0ZSgpKSA+IGN1dG9mZlxuXG4gICAgZGF5c1xuXG4gICMgR3JhcGggcmVwcmVzZW50aW5nIGEgdHJlbmRsaW5nIG9mIGFjdHVhbCBpc3N1ZXMuXG4gIHRyZW5kOiAoYWN0dWFsLCBjcmVhdGVkX2F0LCBkdWVfb24pIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3R1YWwubGVuZ3RoXG5cbiAgICBzdGFydCA9ICthY3R1YWxbMF0uZGF0ZVxuXG4gICAgIyBWYWx1ZXMgaXMgYSBsaXN0IG9mIHRpbWUgZnJvbSB0aGUgc3RhcnQgYW5kIHBvaW50cyByZW1haW5pbmcuXG4gICAgdmFsdWVzID0gXy5tYXAgYWN0dWFsLCAoeyBkYXRlLCBwb2ludHMgfSkgLT5cbiAgICAgIFsgK2RhdGUgLSBzdGFydCwgcG9pbnRzIF1cblxuICAgICMgTm93IGlzIGFuIGFjdHVhbCBwb2ludCB0b28uXG4gICAgbGFzdCA9IGFjdHVhbFthY3R1YWwubGVuZ3RoIC0gMV1cbiAgICB2YWx1ZXMucHVzaCBbICsgbmV3IERhdGUoKSAtIHN0YXJ0LCBsYXN0LnBvaW50cyBdXG5cbiAgICAjIGh0dHA6Ly9jbGFzc3Jvb20uc3lub255bS5jb20vY2FsY3VsYXRlLXRyZW5kbGluZS0yNzA5Lmh0bWxcbiAgICBiMSA9IDAgOyBlID0gMCA7IGMxID0gMFxuICAgIGEgPSAobCA9IHZhbHVlcy5sZW5ndGgpICogXy5yZWR1Y2UodmFsdWVzLCAoc3VtLCBbIGEsIGIgXSkgLT5cbiAgICAgIGIxICs9IGEgOyBlICs9IGJcbiAgICAgIGMxICs9IE1hdGgucG93KGEsIDIpXG4gICAgICBzdW0gKyAoYSAqIGIpXG4gICAgLCAwKVxuXG4gICAgc2xvcGUgPSAoYSAtIChiMSAqIGUpKSAvICgobCAqIGMxKSAtIChNYXRoLnBvdyhiMSwgMikpKVxuICAgIGludGVyY2VwdCA9IChlIC0gKHNsb3BlICogYjEpKSAvIGxcbiAgICBmbiA9ICh4KSAtPiBzbG9wZSAqIHggKyBpbnRlcmNlcHRcblxuICAgICMgTWlsZXN0b25lIGFsd2F5cyBoYXMgYSBjcmVhdGlvbiBkYXRlLlxuICAgIGNyZWF0ZWRfYXQgPSBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgIyBEdWUgZGF0ZSBjYW4gYmUgZW1wdHkuXG4gICAgZHVlX29uID0gaWYgZHVlX29uIHRoZW4gbmV3IERhdGUoZHVlX29uKSBlbHNlIG5ldyBEYXRlKClcblxuICAgIGEgPSBjcmVhdGVkX2F0IC0gc3RhcnRcbiAgICBiID0gZHVlX29uIC0gc3RhcnRcblxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgJ2RhdGUnOiBjcmVhdGVkX2F0XG4gICAgICAgICdwb2ludHMnOiBmbihhKVxuICAgICAgfSwge1xuICAgICAgICAnZGF0ZSc6IGR1ZV9vblxuICAgICAgICAncG9pbnRzJzogZm4oYilcbiAgICAgIH1cbiAgICBdIiwieyBfLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxuIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5jb25maWcgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggaXNzdWVzIGZvciBhIG1pbGVzdG9uZS5cbiAgZmV0Y2hBbGw6IChyZXBvLCBjYikgLT5cbiAgICAjIENhbGN1bGF0ZSBzaXplIG9mIGVpdGhlciBvcGVuIG9yIGNsb3NlZCBpc3N1ZXMuXG4gICAgIyBNb2RpZmllcyBpc3N1ZXMgYnkgcmVmLlxuICAgIGNhbGNTaXplID0gKGxpc3QsIGNiKSAtPlxuICAgICAgc3dpdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnBvaW50c1xuICAgICAgICB3aGVuICdPTkVfU0laRSdcbiAgICAgICAgICBzaXplID0gbGlzdC5sZW5ndGhcblxuICAgICAgICAgICggaXNzdWUuc2l6ZSA9IDEgZm9yIGlzc3VlIGluIGxpc3QgKVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cbiAgICAgICAgXG4gICAgICAgIHdoZW4gJ0xBQkVMUydcbiAgICAgICAgICBzaXplID0gMFxuXG4gICAgICAgICAgbGlzdCA9IF8uZmlsdGVyIGxpc3QsIChpc3N1ZSkgLT5cbiAgICAgICAgICAgICMgU2tpcCBpZiBubyBsYWJlbHMgZXhpc3QuXG4gICAgICAgICAgICByZXR1cm4gbm8gdW5sZXNzIGxhYmVscyA9IGlzc3VlLmxhYmVsc1xuXG4gICAgICAgICAgICAjIERldGVybWluZSB0aGUgdG90YWwgaXNzdWUgc2l6ZSBmcm9tIGFsbCBsYWJlbHMuXG4gICAgICAgICAgICBpc3N1ZS5zaXplID0gXy5yZWR1Y2UgbGFiZWxzLCAoc3VtLCBsYWJlbCkgLT5cbiAgICAgICAgICAgICAgIyBOb3QgbWF0Y2hpbmcuXG4gICAgICAgICAgICAgIHJldHVybiBzdW0gdW5sZXNzIG1hdGNoZXMgPSBsYWJlbC5uYW1lLm1hdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnNpemVfbGFiZWxcbiAgICAgICAgICAgICAgIyBJbmNyZWFzZSBzdW0uXG4gICAgICAgICAgICAgIHN1bSArPSBwYXJzZUludCBtYXRjaGVzWzFdXG4gICAgICAgICAgICAsIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBJbmNyZWFzZSB0aGUgdG90YWwuXG4gICAgICAgICAgICBzaXplICs9IGlzc3VlLnNpemVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBcmUgd2Ugc2F2aW5nIGl0P1xuICAgICAgICAgICAgISFpc3N1ZS5zaXplXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuXG4gICAgIyBGb3IgZWFjaCBzdGF0ZS4uLlxuICAgIG9uZVN0YXR1cyA9IChzdGF0ZSwgY2IpIC0+XG4gICAgICAjIENvbmNhdCB0aGVtIGhlcmUuXG4gICAgICByZXN1bHRzID0gW11cblxuICAgICAgIyBPbmUgcGFnZWZ1bCBmZXRjaCAobmV4dCBwYWdlcyBpbiBzZXJpZXMpLlxuICAgICAgZG8gZmV0Y2hQYWdlID0gKHBhZ2U9MSkgLT5cbiAgICAgICAgcmVxdWVzdC5hbGxJc3N1ZXMgcmVwbywgeyBzdGF0ZSwgcGFnZSB9LCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICMgRXJyb3JzP1xuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBFbXB0eT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAgICAgICAjIENvbmNhdCBzb3J0ZWQgKGFwaSBkb2VzIG5vdCBzb3J0IG9uIGNsb3NlZF9hdCEpLlxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBfLnNvcnRCeSBkYXRhLCAnY2xvc2VkX2F0J1xuICAgICAgICAgICMgPCAxMDAgcmVzdWx0cz9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyBpZiBkYXRhLmxlbmd0aCA8IDEwMFxuICAgICAgICAgICMgRmV0Y2ggdGhlIG5leHQgcGFnZSB0aGVuLlxuICAgICAgICAgIGZldGNoUGFnZSBwYWdlICsgMVxuXG4gICAgIyBGb3IgZWFjaCBgb3BlbmAgYW5kIGBjbG9zZWRgIGlzc3VlcyBpbiBwYXJhbGxlbC5cbiAgICBhc3luYy5wYXJhbGxlbCBbXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdvcGVuJyksICAgY2FsY1NpemUgXVxuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnY2xvc2VkJyksIGNhbGNTaXplIF1cbiAgICBdLCAoZXJyLCBbIG9wZW4sIGNsb3NlZCBdKSAtPlxuICAgICAgY2IgZXJyLCB7IG9wZW4sIGNsb3NlZCB9IiwiIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggYSBtaWxlc3RvbmUuXG4gICdmZXRjaCc6IHJlcXVlc3Qub25lTWlsZXN0b25lXG5cbiAgIyBGZXRjaCBhbGwgbWlsZXN0b25lcy5cbiAgJ2ZldGNoQWxsJzogcmVxdWVzdC5hbGxNaWxlc3RvbmVzXG5cbiAgICAjICMgR2V0IHRoZSBjdXJyZW50IG1pbGVzdG9uZSBvdXQgb2YgbWFueS5cbiAgICAjIGVsc2VcbiAgICAjICAgcmVxdWVzdC5hbGxNaWxlc3RvbmVzIHJlcG8sIChlcnIsIGRhdGEpIC0+XG4gICAgIyAgICAgIyBFcnJvcnM/XG4gICAgIyAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAjICAgICAjIEVtcHR5IHdhcm5pbmc/XG4gICAgIyAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gb3BlbiBtaWxlc3RvbmVzIGZvciByZXBvICN7cmVwby5wYXRofVwiIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuXG4gICAgIyAgICAgbSA9IGRhdGFbMF1cbiAgICAjICAgICAjIEZpbHRlciBtaWxlc3RvbmVzIHdpdGhvdXQgZHVlIGRhdGUuXG4gICAgIyAgICAgbSA9IF8ucmVzdCBkYXRhLCB7ICdkdWVfb24nIDogbnVsbCB9XG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC4gUHJlZmVyIG1pbGVzdG9uZXMgd2l0aCBkdWUgZGF0ZXMuXG4gICAgIyAgICAgbSA9IGlmIG1bMF0gdGhlbiBtWzBdIGVsc2UgZGF0YVswXVxuICAgICMgICAgICMgRW1wdHkgbWlsZXN0b25lP1xuICAgICMgICAgIGlmIG0ub3Blbl9pc3N1ZXMgKyBtLmNsb3NlZF9pc3N1ZXMgaXMgMFxuICAgICMgICAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gaXNzdWVzIGZvciBtaWxlc3RvbmUgYCN7bS50aXRsZX1gXCJcblxuICAgICMgICAgIGNiIG51bGwsIG51bGwsIG0iLCJ7IF8sIFN1cGVyQWdlbnQgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbnVzZXIgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5cbiMgQ3VzdG9tIEpTT04gcGFyc2VyLlxuU3VwZXJBZ2VudC5wYXJzZSA9XG4gICdhcHBsaWNhdGlvbi9qc29uJzogKHJlcykgLT5cbiAgICB0cnlcbiAgICAgIEpTT04ucGFyc2UgcmVzXG4gICAgY2F0Y2ggZVxuICAgICAge30gIyBpdCB3YXMgbm90IHRvIGJlLi4uXG5cbiMgRGVmYXVsdCBhcmdzLlxuZGVmYXVsdHMgPVxuICAnZ2l0aHViJzpcbiAgICAnaG9zdCc6ICdhcGkuZ2l0aHViLmNvbSdcbiAgICAncHJvdG9jb2wnOiAnaHR0cHMnXG5cbiMgUHVibGljIGFwaS5cbm1vZHVsZS5leHBvcnRzID1cbiAgXG4gICMgR2V0IGEgcmVwby5cbiAgcmVwbzogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX1cIlxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBvcGVuIG1pbGVzdG9uZXMuXG4gIGFsbE1pbGVzdG9uZXM6ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPiBcbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG4gIFxuICAjIEdldCBvbmUgb3BlbiBtaWxlc3RvbmUuXG4gIG9uZU1pbGVzdG9uZTogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXMvI3ttaWxlc3RvbmV9XCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIGlzc3VlcyBmb3IgYSBzdGF0ZS5cbiAgYWxsSXNzdWVzOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIHF1ZXJ5LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L2lzc3Vlc1wiXG4gICAgICAgICdxdWVyeSc6ICBfLmV4dGVuZCBxdWVyeSwgeyBtaWxlc3RvbmUsICdwZXJfcGFnZSc6ICcxMDAnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuIyBNYWtlIGEgcmVxdWVzdCB1c2luZyBTdXBlckFnZW50LlxucmVxdWVzdCA9ICh7IHByb3RvY29sLCBob3N0LCBwYXRoLCBxdWVyeSwgaGVhZGVycyB9LCBjYikgLT5cbiAgZXhpdGVkID0gbm9cblxuICAjIE1ha2UgdGhlIHF1ZXJ5IHBhcmFtcy5cbiAgcSA9IGlmIHF1ZXJ5IHRoZW4gJz8nICsgKCBcIiN7a309I3t2fVwiIGZvciBrLCB2IG9mIHF1ZXJ5ICkuam9pbignJicpIGVsc2UgJydcblxuICAjIFRoZSBVUkkuXG4gIHJlcSA9IFN1cGVyQWdlbnQuZ2V0KFwiI3twcm90b2NvbH06Ly8je2hvc3R9I3twYXRofSN7cX1cIilcbiAgIyBBZGQgaGVhZGVycy5cbiAgKCByZXEuc2V0KGssIHYpIGZvciBrLCB2IG9mIGhlYWRlcnMgKVxuICBcbiAgIyBUaW1lb3V0IGZvciByZXF1ZXN0cyB0aGF0IGRvIG5vdCBmaW5pc2guLi4gc2VlICMzMi5cbiAgdGltZW91dCA9IHNldFRpbWVvdXQgLT5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjYiAnUmVxdWVzdCBoYXMgdGltZWQgb3V0J1xuICAsIDFlNCAjIGdpdmUgdXMgMTBzXG5cbiAgIyBTZW5kLlxuICByZXEuZW5kIChlcnIsIGRhdGEpIC0+XG4gICAgIyBBcnJpdmVkIHRvbyBsYXRlLlxuICAgIHJldHVybiBpZiBleGl0ZWRcbiAgICAjIEFsbCBmaW5lLlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNsZWFyVGltZW91dCB0aW1lb3V0XG4gICAgIyBBY3R1YWxseSBwcm9jZXNzIHRoZSByZXNwb25zZS5cbiAgICByZXNwb25zZSBlcnIsIGRhdGEsIGNiXG5cbiMgSG93IGRvIHdlIHJlc3BvbmQgdG8gYSByZXNwb25zZT9cbnJlc3BvbnNlID0gKGVyciwgZGF0YSwgY2IpIC0+XG4gIHJldHVybiBjYiBlcnJvciBlcnIgaWYgZXJyXG4gICMgMnh4P1xuICBpZiBkYXRhLnN0YXR1c1R5cGUgaXNudCAyXG4gICAgIyBEbyB3ZSBoYXZlIGEgbWVzc2FnZSBmcm9tIEdpdEh1Yj9cbiAgICByZXR1cm4gY2IgZGF0YS5ib2R5Lm1lc3NhZ2UgaWYgZGF0YT8uYm9keT8ubWVzc2FnZT9cbiAgICAjIFVzZSBTQSBvbmUuXG4gICAgcmV0dXJuIGNiIGRhdGEuZXJyb3IubWVzc2FnZVxuICAjIEFsbCBnb29kLlxuICBjYiBudWxsLCBkYXRhLmJvZHlcblxuIyBHaXZlIHVzIGhlYWRlcnMuXG5oZWFkZXJzID0gKHRva2VuKSAtPlxuICAjIFRoZSBkZWZhdWx0cy5cbiAgaCA9XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52MydcbiAgIyBBZGQgdG9rZW4/XG4gIGguQXV0aG9yaXphdGlvbiA9IFwidG9rZW4gI3t0b2tlbn1cIiBpZiB0b2tlbj9cbiAgaFxuXG5pc1ZhbGlkID0gKG9iaikgLT5cbiAgcnVsZXMgPVxuICAgICdvd25lcic6ICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ25hbWUnOiAgICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbWlsZXN0b25lJzogKHZhbCkgLT4gXy5pc0ludCB2YWxcbiAgXG4gICggcmV0dXJuIG5vIGZvciBrZXksIHZhbCBvZiBvYmogd2hlbiBrZXkgb2YgcnVsZXMgYW5kIG5vdCBydWxlc1trZXldKHZhbCkgKVxuXG4gIHllc1xuXG4jIFN3aXRjaCB3aGVuIHVzZXIgaXMgcmVhZHkuXG5pc1JlYWR5ID0gdXNlci5kYXRhLnJlYWR5XG5cbiMgQSBzdGFjayBvZiByZXF1ZXN0cyB0byBleGVjdXRlIG9uY2UgcmVhZHkuXG5zdGFjayA9IFtdXG5yZWFkeSA9IChjYikgLT5cbiAgaWYgaXNSZWFkeSB0aGVuIGRvIGNiIGVsc2Ugc3RhY2sucHVzaCBjYlxuXG4jIE9ic2VydmUgdXNlcidzIHJlYWRpbmVzcy5cbnVzZXIub2JzZXJ2ZSAncmVhZHknLCAodmFsKSAtPlxuICBpc1JlYWR5ID0gdmFsXG4gICMgQ2xlYXIgdGhlIHN0YWNrP1xuICAoIGRvIHN0YWNrLnNoaWZ0KCkgd2hpbGUgc3RhY2subGVuZ3RoICkgaWYgdmFsXG5cbiMgUGFyc2UgYW4gZXJyb3IuXG5lcnJvciA9IChlcnIpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gXy5pc1N0cmluZyBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJcbiAgICB3aGVuIF8uaXNBcnJheSBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJbMV1cbiAgICB3aGVuIF8uaXNPYmplY3QoZXJyKSBhbmQgXy5pc1N0cmluZyhlcnIubWVzc2FnZSlcbiAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuXG4gIHVubGVzcyBtZXNzYWdlXG4gICAgdHJ5XG4gICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkgZXJyXG4gICAgY2F0Y2hcbiAgICAgIG1lc3NhZ2UgPSBkbyBlcnIudG9TdHJpbmdcblxuICBtZXNzYWdlIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbk1lZGlhdG9yID0gUmFjdGl2ZS5leHRlbmQge31cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWVkaWF0b3IoKSIsInsgXywgZGlyZWN0b3IgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuL21lZGlhdG9yLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5cbmVsID0gJyNwYWdlJ1xuXG5wYWdlcyA9XG4gIFwiaW5kZXhcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL2luZGV4LmNvZmZlZVwiXG4gIFwibWlsZXN0b25lXCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlXCJcbiAgXCJuZXdcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL25ldy5jb2ZmZWVcIlxuICBcInByb2plY3RcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlXCJcblxuIyBBZGQgYSBwcm9qZWN0IGZyb20gYSByb3V0ZS5cbmFkZFByb2plY3QgPSAocGFnZSwgb3duZXIsIG5hbWUpIC0+XG4gIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH1cblxuIyBQcmVhcHBseSBhbGwgZnVuY3Rpb25zIHdpdGggb3VyIHBhZ2UgbmFtZS9jb250ZXh0LlxuYyA9IChuYW1lLCBmbnM9W10pIC0+XG4gICggXy5wYXJ0aWFsIGZuLCBuYW1lIGZvciBmbiBpbiBmbnMgKVxuXG52aWV3ID0gbnVsbFxucm91dGUgPSAocGFnZSwgYXJncy4uLikgLT5cbiAgIyBVbnJlbmRlciB0aGUgcHJldmlvdXMgb25lLlxuICBkbyB2aWV3Py50ZWFyZG93blxuICAjIEhpZGUgYW55IG5vdGlmaWNhdGlvbnMuXG4gIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5L2hpZGUnXG4gICMgUmVxdWlyZSB0aGUgbmV3IG9uZS5cbiAgUGFnZSA9IHBhZ2VzW3BhZ2VdXG4gICMgUmVuZGVyIGl0LlxuICB2aWV3ID0gbmV3IFBhZ2UgeyBlbCwgJ2RhdGEnOiB7ICdyb3V0ZSc6IGFyZ3MgfSB9XG5cbnJvdXRlcyA9XG4gICcvJzogICAgICAgICAgICAgICAgICAgICAgICBjICdpbmRleCcsIFsgcm91dGUgXVxuICAnL25ldy9wcm9qZWN0JzogICAgICAgICAgICAgYyAnbmV3JywgICBbIHJvdXRlIF1cbiAgIyBUaGUgZm9sbG93aW5nIHR3byByb3V0ZXMgYWRkIGEgcHJvamVjdCBpbiB0aGUgYmFja2dyb3VuZC5cbiAgJy86b3duZXIvOm5hbWUnOiAgICAgICAgICAgIGMgJ3Byb2plY3QnLCAgIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAnLzpvd25lci86bmFtZS86bWlsZXN0b25lJzogYyAnbWlsZXN0b25lJywgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICMgVE9ETzogcmVtb3ZlIGluIHByb2R1Y3Rpb24uXG4gICcvcmVzZXQnOiAtPlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9jbGVhcidcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJ1xuXG4jIEZsYXRpcm9uIERpcmVjdG9yIHJvdXRlci5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3IuUm91dGVyKHJvdXRlcykuY29uZmlndXJlXG4gICdzdHJpY3QnOiBubyAjIGFsbG93IHRyYWlsaW5nIHNsYXNoZXNcbiAgbm90Zm91bmQ6IC0+XG4gICAgdGhyb3cgNDA0IiwieyBtb21lbnQgfSAgPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbiMgUHJvZ3Jlc3MgaW4gJS5cbnByb2dyZXNzID0gKGEsIGIpIC0+IDEwMCAqIChhIC8gKGIgKyBhKSlcblxuIyBDYWxjdWxhdGUgdGhlIHN0YXRzIGZvciBhIG1pbGVzdG9uZS5cbiMgIElzIGl0IG9uIHRpbWU/IFdoYXQgaXMgdGhlIHByb2dyZXNzP1xubW9kdWxlLmV4cG9ydHMgPSAobWlsZXN0b25lKSAtPlxuICAgIGlzRG9uZSA9IG5vIDsgaXNPblRpbWUgPSB5ZXMgOyBpc092ZXJkdWUgPSBub1xuXG4gICAgIyBQcm9ncmVzcyBpbiBwb2ludHMuXG4gICAgcG9pbnRzID0gcHJvZ3Jlc3MgbWlsZXN0b25lLmlzc3Vlcy5jbG9zZWQuc2l6ZSwgbWlsZXN0b25lLmlzc3Vlcy5vcGVuLnNpemUgICAgXG4gICAgaXNEb25lID0geWVzIGlmIHBvaW50cyBpcyAxMDBcblxuICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGR1ZSBkYXRlIGFyZSBhbHdheXMgb24gdHJhY2suXG4gICAgcmV0dXJuIHsgaXNPdmVyZHVlLCBpc09uVGltZSwgaXNEb25lLCAncHJvZ3Jlc3MnOiB7IHBvaW50cyB9IH0gdW5sZXNzIG1pbGVzdG9uZS5kdWVfb25cblxuICAgIGEgPSArbmV3IERhdGUgbWlsZXN0b25lLmNyZWF0ZWRfYXRcbiAgICBiID0gK25ldyBEYXRlXG4gICAgYyA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIE92ZXJkdWU/XG4gICAgaXNPdmVyZHVlID0geWVzIGlmIGIgPiBjXG5cbiAgICAjIFByb2dyZXNzIGluIHRpbWUuXG4gICAgdGltZSA9IHByb2dyZXNzIGIgLSBhLCBjIC0gYlxuXG4gICAgIyBIb3cgbWFueSBkYXlzIGlzIDElIG9mIHRoZSB0aW1lP1xuICAgIGRheXMgPSAobW9tZW50KGIpLmRpZmYobW9tZW50KGEpLCAnZGF5cycpKSAvIDEwMFxuXG4gICAgIyBBcmUgd2Ugb24gdGltZT9cbiAgICBpc09uVGltZSA9IHBvaW50cyA+IHRpbWVcblxuICAgIHtcbiAgICAgIGlzRG9uZSwgZGF5cywgaXNPblRpbWUsIGlzT3ZlcmR1ZVxuICAgICAgJ3Byb2dyZXNzJzogeyBwb2ludHMsIHRpbWUgfVxuICAgIH0iLCIjIEFsbCBvdXIgdmVuZG9yIGRlcGVuZGVuY2llcyBpbiBvbmUgcGxhY2UuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICdfJzogd2luZG93Ll9cbiAgJ1JhY3RpdmUnOiB3aW5kb3cuUmFjdGl2ZVxuICAnRmlyZWJhc2UnOiB3aW5kb3cuRmlyZWJhc2VcbiAgJ0ZpcmViYXNlU2ltcGxlTG9naW4nOiB3aW5kb3cuRmlyZWJhc2VTaW1wbGVMb2dpblxuICAnU3VwZXJBZ2VudCc6IHdpbmRvdy5zdXBlcmFnZW50XG4gICdhc3luYyc6IHdpbmRvdy5hc3luY1xuICAnbW9tZW50Jzogd2luZG93Lm1vbWVudFxuICAnZDMnOiB3aW5kb3cuZDNcbiAgJ21hcmtlZCc6IHdpbmRvdy5tYXJrZWRcbiAgJ2RpcmVjdG9yJzpcbiAgICAnUm91dGVyJzogd2luZG93LlJvdXRlclxuICAnbHNjYWNoZSc6IHdpbmRvdy5sc2NhY2hlXG4gICdzb3J0ZWRJbmRleENtcCc6IHdpbmRvdy5zb3J0ZWRJbmRleFxuICAnc2VtdmVyJzogcmVxdWlyZSAnc2VtdmVyJyIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJhcHBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTm90aWZ5XCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiSGVhZGVyXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInBhZ2VcIn0sXCJmXCI6W119LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbXCImY29weTsgMjAxMi0yMDE0IFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcImh0dHA6Ly9jbG91ZGZpLnJlXCJ9LFwiZlwiOltcIkNsb3VkZmlyZSBTeXN0ZW1zXCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNoYXJ0XCJ9fV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImhlYWRcIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUzLFwiclwiOlwidXNlclwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInJpZ2h0XCJ9LFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJkaXNwbGF5TmFtZVwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcImRpc3BsYXlOYW1lXCJ9LFwiIGxvZ2dlZCBpblwiXX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJnaXRodWJcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcIiFsb2dpblwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImdpdGh1YlwifX0sXCIgU2lnbiBJblwiXX1dLFwiclwiOlwiZGlzcGxheU5hbWVcIn1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaWRcIjpcImljb25cIixcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidWxcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbmV3L3Byb2plY3RcIixcImNsYXNzXCI6XCJhZGRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJwbHVzLWNpcmNsZWRcIn19LFwiIEFkZCBhIFByb2plY3RcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwiZmFxXCJ9LFwiZlwiOltcIkZBUVwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNyZXNldFwifSxcImZcIjpbXCJEQiBSZXNldFwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJoZXJvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJjb250ZW50XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYWRkcmVzc1wifX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlNlZSB5b3VyIHByb2plY3QgcHJvZ3Jlc3NcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOltcIk5vdCBzdXJlIHdoZXJlIHRvIHN0YXJ0PyBKdXN0IGFkZCBhIGRlbW8gcmVwbyB0byBzZWUgYSBjaGFydC4gVGhlcmUgYXJlIG1hbnkgdmFyaWF0aW9ucyBvZiBwYXNzYWdlcyBvZiBMb3JlbSBJcHN1bSBhdmFpbGFibGUsIGJ1dCB0aGUgbWFqb3JpdHkgaGF2ZSBzdWZmZXJlZCBhbHRlcmF0aW9uIGluIHNvbWUgZm9ybSwgYnkgaW5qZWN0ZWQgaHVtb3VyLCBvciByYW5kb21pc2VkIHdvcmRzIHdoaWNoIGRvbid0IGxvb2sgZXZlbiBzbGlnaHRseSBiZWxpZXZhYmxlLlwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY3RhXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbmV3L3Byb2plY3RcIixcImNsYXNzXCI6XCJwcmltYXJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwicGx1cy1jaXJjbGVkXCJ9fSxcIiBBZGQgeW91ciBwcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwic2Vjb25kYXJ5XCJ9LFwiZlwiOltcIlJlYWQgdGhlIEd1aWRlXCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwiY29kZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOltcImljb24gXCIse1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJjb2RlXCJdLFwic1wiOlwiXFxcIiYjXFxcIitfMCtcXFwiO1xcXCJcIn19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwidGV4dFwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInN5c3RlbVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJub3RpZnlcIixcImNsYXNzXCI6W3tcInRcIjoyLFwiclwiOlwidHlwZVwifSxcIiBzeXN0ZW1cIl0sXCJzdHlsZVwiOltcInRvcDpcIix7XCJ0XCI6MixcInJcIjpcInRvcFwifSxcIiVcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn1dLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJ4XCI6e1wiclwiOltcInRvcFwiXSxcInNcIjpcIi1fMFwifX0sXCJweFwiXX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJjbG9zZVwifSxcInZcIjp7XCJjbGlja1wiOlwiY2xvc2VcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJ0ZXh0XCJ9XX1dfV0sXCJyXCI6XCJzeXN0ZW1cIn1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcInByb2plY3RzLmxpc3RcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJQcm9qZWN0c1wiLFwiYVwiOntcInByb2plY3RzXCI6W3tcInRcIjoyLFwiclwiOlwicHJvamVjdHNcIn1dfX1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSGVyb1wifV0sXCJyXCI6XCJwcm9qZWN0cy5saXN0XCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiYVwiOntcImNsYXNzXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLnRpdGxlXCJdLFwic1wiOlwiXzAudGl0bGUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJzdWJcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiYVwiOntcImNsYXNzXCI6XCJkZXNjcmlwdGlvblwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmRlc2NyaXB0aW9uXCJdLFwic1wiOlwiXzAubWFya2Rvd24oXzEpXCJ9fV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJDaGFydFwiLFwiYVwiOntcIm1pbGVzdG9uZVwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZVwifV19fV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJhZGRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIkFkZCBhIFByb2plY3RcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOltcIlR5cGUgaW4gdGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgYXMgeW91IHdvdWxkIG5vcm1hbGx5LiBJZiB5b3UnZCBsaWtlIHRvIGFkZCBhIHByaXZhdGUgR2l0SHViIHByb2plY3QsIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W1wiU2lnbiBJblwiXX0sXCIgZmlyc3QuXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvcm1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaW5wdXRcIixcImFcIjp7XCJ0eXBlXCI6XCJ0ZXh0XCIsXCJwbGFjZWhvbGRlclwiOlwidXNlci9yZXBvXCIsXCJhdXRvY29tcGxldGVcIjpcIm9mZlwiLFwidmFsdWVcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19LFwidlwiOntcImtleXVwXCI6e1wiblwiOlwic3VibWl0XCIsXCJkXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcInZcIjp7XCJjbGlja1wiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19LFwiZlwiOltcIkFkZFwiXX1dfV19XX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiYVwiOntcImNsYXNzXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcInJvdXRlXCJdLFwic1wiOlwiXzAuam9pbihcXFwiL1xcXCIpXCJ9fV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJNaWxlc3RvbmVzXCIsXCJhXCI6e1wicHJvamVjdFwiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwic29ydFwifSxcInZcIjp7XCJjbGlja1wiOlwic29ydEJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IFwiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdHMuc29ydEJ5XCJ9XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIk1pbGVzdG9uZXNcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInhcIjp7XCJyXCI6W1wicC5vd25lclwiLFwicHJvamVjdC5vd25lclwiLFwicC5uYW1lXCIsXCJwcm9qZWN0Lm5hbWVcIl0sXCJzXCI6XCJfMD09XzEmJl8yPT1fM1wifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiYVwiOntcImNsYXNzXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzRG9uZVwiLFwiZlwiOltcImRvbmVcIl19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcInByb2plY3Qub3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm5hbWVcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUubnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnRpdGxlXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wic3R5bGVcIjpcIndpZHRoOjElXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9ncmVzc1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInBlcmNlbnRcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJdLFwic1wiOlwiTWF0aC5mbG9vcihfMClcIn19LFwiJVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJkdWUgXCIse1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMuaXNPdmVyZHVlXCIsXCJmXCI6W1wicmVkXCJdfV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJvdXRlciBiYXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpbm5lciBiYXIgXCIse1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIn0sXCIlXCJdfX1dfV19XX1dfV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJjb2dcIn19LFwiIEVkaXRcIl19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInByb2plY3RzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJzb3J0XCJ9LFwidlwiOntcImNsaWNrXCI6XCJzb3J0QnlcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJzb3J0LWFscGhhYmV0XCJ9fSxcIiBTb3J0ZWQgYnkgXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0cy5zb3J0QnlcIn1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiUHJvamVjdHNcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmxpc3RcIixcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJlcnJvcnNcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wiY29sc3BhblwiOlwiM1wiLFwiY2xhc3NcIjpcInJlcG9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIn0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJlcnJvclwiLFwidGl0bGVcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcImVycm9yc1wiXSxcInNcIjpcIl8wLmpvaW4oXFxcIlxcXFxuXFxcIilcIn19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJhdHRlbnRpb25cIn19XX1dfV19XX1dfV19LFwiIFwiLHtcInRcIjo0LFwiclwiOlwicHJvamVjdHMuaW5kZXhcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcIi5cIl0sXCJzXCI6XCJ7aW5kZXg6XzB9XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMFwiLFwicHJvamVjdHMubGlzdFwiXSxcInNcIjpcIntwcm9qZWN0Ol8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUzLFwiclwiOlwicHJvamVjdFwiLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMVwiLFwicHJvamVjdC5taWxlc3RvbmVzXCJdLFwic1wiOlwie21pbGVzdG9uZTpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJhXCI6e1wiY2xhc3NcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMuaXNEb25lXCIsXCJmXCI6W1wiZG9uZVwiXX1dfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvamVjdFwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwibWlsZXN0b25lXCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS50aXRsZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcInN0eWxlXCI6XCJ3aWR0aDoxJVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvZ3Jlc3NcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJwZXJjZW50XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiZHVlIFwiLHtcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzT3ZlcmR1ZVwiLFwiZlwiOltcInJlZFwiXX1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzID1cbiAgbm93OiAtPiBuZXcgRGF0ZSgpLnRvSlNPTigpIiwieyBfLCBtb21lbnQsIG1hcmtlZCB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBUaW1lIGZyb20gbm93LlxuICBmcm9tTm93OiBfLm1lbW9pemUgKGpzb25EYXRlKSAtPlxuICAgIG1vbWVudChuZXcgRGF0ZShqc29uRGF0ZSkpLmZyb21Ob3coKVxuXG4gICMgV2hlbiBpcyBhIG1pbGVzdG9uZSBkdWU/XG4gIGR1ZTogKGpzb25EYXRlKSAtPlxuICAgIHJldHVybiAnJm5ic3A7JyB1bmxlc3MganNvbkRhdGVcbiAgICBbICdkdWUnLCBAZnJvbU5vdyBqc29uRGF0ZSBdLmpvaW4oJyAnKVxuXG4gICMgTWFya2Rvd24gZm9ybWF0dGluZy5cbiAgbWFya2Rvd246IChtYXJrdXApIC0+XG4gICAgbWFya2VkIG1hcmt1cFxuXG4gICMgRm9ybWF0IG1pbGVzdG9uZSB0aXRsZS5cbiAgdGl0bGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtaWxlc3RvbmUnKSA+IC0xXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgWyAnTWlsZXN0b25lJywgdGV4dCBdLmpvaW4oJyAnKVxuXG4gICMgSGV4IHRvIGRlY2ltYWwuXG4gIGhleFRvRGVjOiAoaGV4KSAtPlxuICAgIHBhcnNlSW50IGhleCwgMTYiLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGlzOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC50eXBlIGluIFsgJ2tleXVwJywgJ2tleWRvd24nIF1cblxuICBpc0VudGVyOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC53aGljaCBpcyAxMyIsInsgXyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5fLm1peGluXG4gICdwbHVja01hbnknOiAoc291cmNlLCBrZXlzKSAtPlxuICAgIHRocm93ICdga2V5c2AgbmVlZHMgdG8gYmUgYW4gQXJyYXknIHVubGVzcyBfLmlzQXJyYXkga2V5c1xuICAgIF8ubWFwIHNvdXJjZSwgKGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgXy5lYWNoIGtleXMsIChrZXkpIC0+XG4gICAgICAgIG9ialtrZXldID0gaXRlbVtrZXldXG4gICAgICBvYmpcblxuICAnaXNJbnQnOiAodmFsKSAtPlxuICAgIG5vdCBpc05hTih2YWwpIGFuZCBwYXJzZUludChOdW1iZXIodmFsKSkgaXMgdmFsIGFuZCBub3QgaXNOYU4ocGFyc2VJbnQodmFsLCAxMCkpIiwieyBSYWN0aXZlLCBfIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5cbiMgQW4gUmFjdGl2ZSB0aGF0IHN1YnNjcmliZXMgYW5kIGxpc3RlbnMgdG8gbWVzc2FnZXMgb24gYG1lZGlhdG9yYCBldmVudCBidXMuXG4jIFVzYWdlOiB0aGlzLnN1YnNjcmliZSgnIWV2ZW50JywgZnVuY3Rpb24oKSB7IC8qIGxpc3RlbmVyICovIH0sIGNvbnRleHQpO1xubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gIHN1YnNjcmliZTogKG5hbWUsIGNiLCBjdHgpIC0+XG4gICAgY3R4ID89IEBcbiAgICBAX3N1YnMgPSBbXSB1bmxlc3MgXy5pc0FycmF5IEBfc3Vic1xuICAgIGlmIF8uaXNGdW5jdGlvbiBjYlxuICAgICAgQF9zdWJzLnB1c2ggbWVkaWF0b3Iub24gbmFtZSwgXy5iaW5kIGNiLCBjdHhcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcIldhcm5pbmc6IGBjYmAgaXMgbm90IGEgZnVuY3Rpb25cIlxuXG4gIHB1Ymxpc2g6IC0+XG4gICAgbWVkaWF0b3IuZmlyZS5hcHBseSBtZWRpYXRvciwgYXJndW1lbnRzXG5cbiAgb250ZWFyZG93bjogLT5cbiAgICBpZiBfLmlzQXJyYXkgQF9zdWJzXG4gICAgICBmb3Igc3ViIGluIEBfc3Vic1xuICAgICAgICBpZiBfLmlzRnVuY3Rpb24gc3ViLmNhbmNlbFxuICAgICAgICAgIGRvIHN1Yi5jYW5jZWxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiV2FybmluZzogYHN1Yi5jYW5jZWxgIGlzIG5vdCBhIGZ1bmN0aW9uXCIiLCJFdmVudGZ1bCA9IHJlcXVpcmUgJy4vZXZlbnRmdWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRzKSAtPlxuICBNb2RlbCA9IEV2ZW50ZnVsLmV4dGVuZChvcHRzKVxuICBtb2RlbCA9IG5ldyBNb2RlbCgpXG4gIG1vZGVsLnJlbmRlcigpXG4gIG1vZGVsIiwieyBSYWN0aXZlLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5saW5lcyA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlJ1xuYXhlcyAgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2F4ZXMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2NoYXJ0Lmh0bWwnXG5cbiAgb25jb21wbGV0ZTogLT5cbiAgICBtaWxlc3RvbmUgPSBAZGF0YS5taWxlc3RvbmVcbiAgICBpc3N1ZXMgPSBtaWxlc3RvbmUuaXNzdWVzXG4gICAgIyBUb3RhbCBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBtaWxlc3RvbmUuXG4gICAgdG90YWwgPSBpc3N1ZXMub3Blbi5zaXplICsgaXNzdWVzLmNsb3NlZC5zaXplXG5cblxuICAgICMgQW4gaXNzdWUgbWF5IGhhdmUgYmVlbiBjbG9zZWQgYmVmb3JlIHRoZSBzdGFydCBvZiBhIG1pbGVzdG9uZS5cbiAgICBoZWFkID0gaXNzdWVzLmNsb3NlZC5saXN0WzBdLmNsb3NlZF9hdFxuICAgIGlmIGlzc3Vlcy5sZW5ndGggYW5kIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID4gaGVhZFxuICAgICAgIyBUaGlzIGlzIHRoZSBuZXcgc3RhcnQuXG4gICAgICBtaWxlc3RvbmUuY3JlYXRlZF9hdCA9IGhlYWRcblxuICAgICMgQWN0dWFsLCBpZGVhbCAmIHRyZW5kIGxpbmVzLlxuICAgIGFjdHVhbCA9IGxpbmVzLmFjdHVhbCBpc3N1ZXMuY2xvc2VkLmxpc3QsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCB0b3RhbFxuICAgIGlkZWFsICA9IGxpbmVzLmlkZWFsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uLCB0b3RhbFxuICAgIHRyZW5kICA9IGxpbmVzLnRyZW5kIGFjdHVhbCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgR2V0IGF2YWlsYWJsZSBzcGFjZS5cbiAgICB7IGhlaWdodCwgd2lkdGggfSA9IGRvIEBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3RcblxuICAgIG1hcmdpbiA9IHsgJ3RvcCc6IDMwLCAncmlnaHQnOiAzMCwgJ2JvdHRvbSc6IDQwLCAnbGVmdCc6IDUwIH1cbiAgICB3aWR0aCAtPSBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodFxuICAgIGhlaWdodCAtPSBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbVxuXG4gICAgIyBTY2FsZXMuXG4gICAgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbIDAsIHdpZHRoIF0pXG4gICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpLnJhbmdlKFsgaGVpZ2h0LCAwIF0pXG5cbiAgICAjIEF4ZXMuXG4gICAgeEF4aXMgPSBheGVzLmhvcml6b250YWwgaGVpZ2h0LCB4XG4gICAgeUF4aXMgPSBheGVzLnZlcnRpY2FsIHdpZHRoLCB5XG5cbiAgICAjIExpbmUgZ2VuZXJhdG9yLlxuICAgIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgLmludGVycG9sYXRlKFwibGluZWFyXCIpXG4gICAgLngoIChkKSAtPiB4KGQuZGF0ZSkgKVxuICAgIC55KCAoZCkgLT4geShkLnBvaW50cykgKVxuXG4gICAgIyBHZXQgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gZGF0ZSwgYW5kIGluaXRpYWwgcG9pbnRzLlxuICAgIHguZG9tYWluKFsgaWRlYWxbMF0uZGF0ZSwgaWRlYWxbaWRlYWwubGVuZ3RoIC0gMV0uZGF0ZSBdKVxuICAgIHkuZG9tYWluKFsgMCwgaWRlYWxbMF0ucG9pbnRzIF0pLm5pY2UoKVxuXG4gICAgIyBBZGQgYW4gU1ZHIGVsZW1lbnQgd2l0aCB0aGUgZGVzaXJlZCBkaW1lbnNpb25zIGFuZCBtYXJnaW4uXG4gICAgc3ZnID0gZDMuc2VsZWN0KHRoaXMuZWwucXVlcnlTZWxlY3RvcignI2NoYXJ0JykpLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcblxuICAgICMgQWRkIHRoZSBkYXlzIHgtYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgZGF5XCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwoeEF4aXMpXG5cbiAgICAjIEFkZCB0aGUgbW9udGhzIHgtYXhpcy5cbiAgICBtID0gW1xuICAgICAgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJyxcbiAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYydcbiAgICBdXG5cbiAgICBtQXhpcyA9IHhBeGlzXG4gICAgLm9yaWVudChcInRvcFwiKVxuICAgIC50aWNrU2l6ZShoZWlnaHQpXG4gICAgLnRpY2tGb3JtYXQoIChkKSAtPiBtW2QuZ2V0TW9udGgoKV0gKVxuICAgIC50aWNrcygyKVxuICAgIFxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBtb250aFwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKG1BeGlzKVxuXG4gICAgIyBBZGQgdGhlIHktYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAuY2FsbCh5QXhpcylcblxuICAgICMgQWRkIGEgbGluZSBzaG93aW5nIHdoZXJlIHdlIGFyZSBub3cuXG4gICAgc3ZnLmFwcGVuZChcInN2ZzpsaW5lXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5XCIpXG4gICAgLmF0dHIoXCJ4MVwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTFcIiwgMClcbiAgICAuYXR0cihcIngyXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHQpXG5cbiAgICAjIEFkZCB0aGUgaWRlYWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImlkZWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImJhc2lzXCIpKGlkZWFsKSlcblxuICAgICMgQWRkIHRoZSB0cmVuZGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVuZGxpbmUgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpKHRyZW5kKSlcblxuICAgICMgQWRkIHRoZSBhY3R1YWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImFjdHVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikueSggKGQpIC0+IHkoZC5wb2ludHMpICkoYWN0dWFsKSlcblxuICAgICMgQ29sbGVjdCB0aGUgdG9vbHRpcCBoZXJlLlxuICAgIHRvb2x0aXAgPSBkMy50aXAoKS5hdHRyKCdjbGFzcycsICdkMy10aXAnKS5odG1sICh7IG51bWJlciwgdGl0bGUgfSkgLT5cbiAgICAgIFwiIyN7bnVtYmVyfTogI3t0aXRsZX1cIlxuXG4gICAgc3ZnLmNhbGwodG9vbHRpcClcblxuICAgICMgU2hvdyB3aGVuIHdlIGNsb3NlZCBhbiBpc3N1ZS5cbiAgICBzdmcuc2VsZWN0QWxsKFwiYS5pc3N1ZVwiKVxuICAgIC5kYXRhKGFjdHVhbC5zbGljZSgxKSkgIyBza2lwIHRoZSBzdGFydGluZyBwb2ludFxuICAgIC5lbnRlcigpXG4gICAgIyBBIHdyYXBwaW5nIGxpbmsuXG4gICAgLmFwcGVuZCgnc3ZnOmEnKVxuICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCAoeyBodG1sX3VybCB9KSAtPiBodG1sX3VybCApXG4gICAgLmF0dHIoXCJ4bGluazpzaG93XCIsICduZXcnKVxuICAgIC5hcHBlbmQoJ3N2ZzpjaXJjbGUnKVxuICAgIC5hdHRyKFwiY3hcIiwgKHsgZGF0ZSB9KSAtPiB4IGRhdGUgKVxuICAgIC5hdHRyKFwiY3lcIiwgKHsgcG9pbnRzIH0pIC0+IHkgcG9pbnRzIClcbiAgICAuYXR0cihcInJcIiwgICh7IHJhZGl1cyB9KSAtPiA1ICkgIyBmaXhlZCBmb3Igbm93XG4gICAgLm9uKCdtb3VzZW92ZXInLCB0b29sdGlwLnNob3cpXG4gICAgLm9uKCdtb3VzZW91dCcsIHRvb2x0aXAuaGlkZSlcbiIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG57IHN5c3RlbSB9ID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5maXJlYmFzZSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSdcbnVzZXIgICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5JY29ucyAgICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9oZWFkZXInXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlYWRlci5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndXNlcic6IHVzZXJcbiAgICAjIERlZmF1bHQgYXBwIGljb24uXG4gICAgJ2ljb24nOiAnZmlyZS1zdGF0aW9uJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBMb2dpbiB1c2VyLlxuICAgIEBvbiAnIWxvZ2luJywgLT5cbiAgICAgIGZpcmViYXNlLmxvZ2luIChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyciBpZiBlcnJcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFN3aXRjaCBsb2FkaW5nIGljb24gd2l0aCBhcHAgaWNvbi5cbiAgICBzeXN0ZW0ub2JzZXJ2ZSAnbG9hZGluZycsICh5YSkgPT5cbiAgICAgIEBzZXQgJ2ljb24nLCBpZiB5YSB0aGVuICdzcGlubmVyMScgZWxzZSAnZmlyZS1zdGF0aW9uJyIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5JY29ucyA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVybydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVyby5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5mb3JtYXQgPSByZXF1aXJlICcuLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG4jIEZvbnRlbGxvIGljb24gaGV4IGNvZGVzLlxuY29kZXMgPVxuICAnY29nJzogICAgICAgICAgICdcXGU4MDAnXG4gICdzZWFyY2gnOiAgICAgICAgJ1xcZTgwMSdcbiAgJ2dpdGh1Yic6ICAgICAgICAnXFxlODAyJ1xuICAnYWRkcmVzcyc6ICAgICAgICdcXGU4MDMnXG4gICdwbHVzLWNpcmNsZWQnOiAgJ1xcZTgwNCdcbiAgJ2ZpcmUtc3RhdGlvbic6ICAnXFxlODA1J1xuICAnc29ydC1hbHBoYWJldCc6ICdcXGU4MDYnXG4gICdkb3duLW9wZW4nOiAgICAgJ1xcZTgwNydcbiAgJ3NwaW42JzogICAgICAgICAnXFxlODA4J1xuICAnbWVnYXBob25lJzogICAgICdcXGU4MDknXG4gICdzcGluNCc6ICAgICAgICAgJ1xcZTgwYSdcbiAgJ3NwaW5uZXIxJzogICAgICAnXFxlODBiJ1xuICAnYXR0ZW50aW9uJzogICAgICdcXGU4MGMnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9pY29ucydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaWNvbnMuaHRtbCdcblxuICAnaXNvbGF0ZWQnOiB5ZXNcblxuICBvbnJlbmRlcjogLT5cbiAgICBAb2JzZXJ2ZSAnaWNvbicsIChpY29uKSAtPlxuICAgICAgaWYgaWNvbiBhbmQgaGV4ID0gY29kZXNbaWNvbl1cbiAgICAgICAgQHNldCAnY29kZScsIGZvcm1hdC5oZXhUb0RlYyBoZXhcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCAnY29kZScsIG51bGwiLCJ7IFJhY3RpdmUsIF8sIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkV2ZW50ZnVsID0gcmVxdWlyZSAnLi4vdXRpbHMvcmFjdGl2ZS9ldmVudGZ1bC5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5IRUlHSFQgPSA2OCAjIGhlaWdodCBvZiBkaXYgaW4gcHhcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGZ1bC5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9ub3RpZnknXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL25vdGlmeS5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndG9wJzogSEVJR0hUXG4gICAgJ2hpZGRlbic6IHllc1xuICAgICdkZWZhdWx0cyc6XG4gICAgICAndGV4dCc6ICcnXG4gICAgICAndHlwZSc6ICcnICMgYmxhbmQgZ3JleSBzdHlsZVxuICAgICAgJ3N5c3RlbSc6IG5vXG4gICAgICAnaWNvbic6ICdtZWdhcGhvbmUnXG4gICAgICAndHRsJzogIDVlM1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgIyBTaG93IGEgbm90aWZpY2F0aW9uLlxuICBzaG93OiAob3B0cykgLT5cbiAgICBAc2V0ICdoaWRkZW4nLCBubyAgICBcbiAgICAjIFNldCB0aGUgb3B0cy5cbiAgICBAc2V0IG9wdHMgPSBfLmRlZmF1bHRzIG9wdHMsIEBkYXRhLmRlZmF1bHRzXG4gICAgIyBXaGljaCBwb3NpdGlvbiB0byBzbGlkZSB0bz9cbiAgICBwb3MgPSBbIDAsIDUwIF1bICtvcHRzLnN5c3RlbSBdICMgMHB4IG9yIDUwJSBmcm9tIHRvcFxuICAgICMgU2xpZGUgaW50byB2aWV3LlxuICAgIEBhbmltYXRlICd0b3AnLCBwb3MsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYm91bmNlJylcbiAgICAgICdkdXJhdGlvbic6IDgwMFxuICAgIFxuICAgICMgSWYgbm8gdHRsIHRoZW4gc2hvdyBwZXJtYW5lbnRseS5cbiAgICByZXR1cm4gdW5sZXNzIG9wdHMudHRsXG5cbiAgICAjIFNsaWRlIG91dCBvZiB0aGUgdmlldy5cbiAgICBfLmRlbGF5IF8uYmluZChAaGlkZSwgQCksIG9wdHMudHRsXG5cbiAgIyBIaWRlIGEgbm90aWZpY2F0aW9uLlxuICBoaWRlOiAtPlxuICAgIHJldHVybiBpZiBAZGF0YS5oaWRkZW5cbiAgICBAc2V0ICdoaWRkZW4nLCB5ZXNcblxuICAgIEBhbmltYXRlICd0b3AnLCBIRUlHSFQsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYmFjaycpXG4gICAgICAnY29tcGxldGUnOiA9PlxuICAgICAgICAjIFJlc2V0IHRoZSB0ZXh0IHdoZW4gYWxsIGlzIGRvbmUuXG4gICAgICAgIEBzZXQgJ3RleHQnLCBudWxsXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIE9uIG91dHNpZGUgbWVzc2FnZXMuXG4gICAgQHN1YnNjcmliZSAnIWFwcC9ub3RpZnknLCBAc2hvdywgQFxuICAgIEBzdWJzY3JpYmUgJyFhcHAvbm90aWZ5L2hpZGUnLCBAaGlkZSwgQFxuXG4gICAgIyBDbG9zZSB1cyBwcmVtYXR1cmVseS4uLlxuICAgIEBvbiAnY2xvc2UnLCBAaGlkZSIsInsgUmFjdGl2ZSwgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuSGVybyAgICAgPSByZXF1aXJlICcuLi9oZXJvLmNvZmZlZSdcblByb2plY3RzID0gcmVxdWlyZSAnLi4vdGFibGVzL3Byb2plY3RzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2luZGV4J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBIZXJvLCBQcm9qZWN0cyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQnVybmNoYXJ0OiBHaXRIdWIgQnVybmRvd24gQ2hhcnQgYXMgYSBTZXJ2aWNlJ1xuXG4gICAgIyBRdWl0IGlmIHdlIGhhdmUgbm8gcHJvamVjdHMuXG4gICAgcmV0dXJuIEBzZXQoJ3JlYWR5JywgeWVzKSB1bmxlc3MgcHJvamVjdHMubGlzdC5sZW5ndGhcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgRm9yIGFsbCBwcm9qZWN0cy5cbiAgICBhc3luYy5tYXAgcHJvamVjdHMuZGF0YS5saXN0LCAocHJvamVjdCwgY2IpIC0+XG4gICAgICAjIEZldGNoIHRoZWlyIG1pbGVzdG9uZXMuXG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIChlcnIsIGxpc3QpIC0+XG4gICAgICAgICMgU2F2ZSB0aGUgZXJyb3IgaWYgcHJvamVjdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICMgTm93IGFkZCBpbiB0aGUgaXNzdWVzLlxuICAgICAgICBhc3luYy5lYWNoIGxpc3QsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsIGlmIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsICh7IG51bWJlciB9KSAtPlxuICAgICAgICAgICAgbWlsZXN0b25lLm51bWJlciBpcyBudW1iZXJcbiAgICAgICAgICBcbiAgICAgICAgICAjIE9LIGZldGNoIGFsbCB0aGUgaXNzdWVzIGZvciB0aGlzIG1pbGVzdG9uZSB0aGVuLlxuICAgICAgICAgIGlzc3Vlcy5mZXRjaEFsbFxuICAgICAgICAgICAgJ293bmVyJzogcHJvamVjdC5vd25lclxuICAgICAgICAgICAgJ25hbWUnOiBwcm9qZWN0Lm5hbWVcbiAgICAgICAgICAgICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICAgLCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgICAjIFNhdmUgYW55IGVycm9ycyBvbiB0aGUgcHJvamVjdC5cbiAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICAgICAjIEFkZCBpbiB0aGUgaXNzdWVzIHRvIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBtaWxlc3RvbmVcbiAgICAgICAgICAgICMgRG9uZVxuICAgICAgICAgICAgZG8gY2JcbiAgICAgICAgXG4gICAgICAgICwgY2JcblxuICAgICwgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwieyBfLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5DaGFydCA9IHJlcXVpcmUgJy4uL2NoYXJ0LmNvZmZlZSdcblxuRXZlbnRmdWwgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlJ1xucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbmZvcm1hdCAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50ZnVsLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgQ2hhcnQgfVxuXG4gICdkYXRhJzpcbiAgICAnZm9ybWF0JzogZm9ybWF0XG4gICAgJ3JlYWR5Jzogbm9cblxuICBvbnJlbmRlcjogLT5cbiAgICBbIG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgXSA9IEBnZXQgJ3JvdXRlJ1xuICBcbiAgICBtaWxlc3RvbmUgPSBwYXJzZUludCBtaWxlc3RvbmVcblxuICAgIGRvY3VtZW50LnRpdGxlID0gXCIje293bmVyfS8je25hbWV9LyN7bWlsZXN0b25lfVwiXG5cbiAgICAjIEdldCB0aGUgYXNzb2NpYXRlZCBwcm9qZWN0LlxuICAgIHByb2plY3QgPSBwcm9qZWN0cy5maW5kIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBTaG91bGQgbm90IGhhcHBlbi4uLlxuICAgIHRocm93IDUwMCB1bmxlc3MgcHJvamVjdFxuXG4gICAgIyBEbyB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgb2JqID0gXy5maW5kIHByb2plY3QubWlsZXN0b25lcywgeyAnbnVtYmVyJzogbWlsZXN0b25lIH1cbiAgICByZXR1cm4gQHNldCB7ICdtaWxlc3RvbmUnOiBvYmosICdyZWFkeSc6IHllcyB9IGlmIG9iaj9cblxuICAgICMgV2UgYXJlIGxvYWRpbmcgdGhlIG1pbGVzdG9uZXMgdGhlbi5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmZXRjaE1pbGVzdG9uZSA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2ggeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiXG5cbiAgICBmZXRjaElzc3VlcyA9IChkYXRhLCBjYikgLT5cbiAgICAgIGlzc3Vlcy5mZXRjaEFsbCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICBjYiBlcnIsIF8uZXh0ZW5kIGRhdGEsIHsgJ2lzc3Vlcyc6IG9iaiB9XG5cbiAgICBhc3luYy53YXRlcmZhbGwgW1xuICAgICAgIyBHZXQgdGhlIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoTWlsZXN0b25lLFxuICAgICAgIyBUaGVuIGFsbCBpdHMgaXNzdWVzLlxuICAgICAgZmV0Y2hJc3N1ZXNcbiAgICBdLCAoZXJyLCBkYXRhKSA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgcmV0dXJuIEBwdWJsaXNoICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lIHdpdGggaXNzdWVzLlxuICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIGRhdGFcblxuICAgICAgIyBTaG93IHRoZSBwYWdlLlxuICAgICAgQHNldFxuICAgICAgICAnbWlsZXN0b25lJzogZGF0YVxuICAgICAgICAncmVhZHknOiB5ZXMiLCJ7IF8sIFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuRXZlbnRmdWwgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbnVzZXIgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xua2V5ICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9rZXkuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50ZnVsLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL25ldydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwnXG5cbiAgJ2RhdGEnOiB7ICd2YWx1ZSc6ICdyYWRla3N0ZXBhbi9kaXNwb3NhYmxlJywgdXNlciB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gICMgTGlzdGVuIHRvIEVudGVyIGtleXByZXNzIG9yIFN1Ym1pdCBidXR0b24gY2xpY2suXG4gIHN1Ym1pdDogKGV2dCwgdmFsdWUpIC0+XG4gICAgcmV0dXJuIGlmIGtleS5pcyhldnQpIGFuZCBub3Qga2V5LmlzRW50ZXIoZXZ0KVxuXG4gICAgWyBvd25lciwgbmFtZSBdID0gdmFsdWUuc3BsaXQgJy8nXG5cbiAgICAjIFNhdmUgcmVwby5cbiAgICBAcHVibGlzaCAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBSZWRpcmVjdCB0byB0aGUgZGFzaGJvYXJkLlxuICAgICMgVE9ETzogdHJpZ2dlciBhIG5hbWVkIHJvdXRlXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdBZGQgYSBuZXcgcHJvamVjdCdcblxuICAgICMgVE9ETzogYXV0b2NvbXBsZXRlIG9uIG91ciB1c2VybmFtZSBpZiB3ZSBhcmUgbG9nZ2VkIGluIG9yIGJhc2VkXG4gICAgIyAgb24gcmVwb3Mgd2UgYWxyZWFkeSBoYXZlLlxuICAgIGF1dG9jb21wbGV0ZSA9ICh2YWx1ZSkgLT5cblxuICAgIEBvYnNlcnZlICd2YWx1ZScsIF8uZGVib3VuY2UoYXV0b2NvbXBsZXRlLCAyMDApLCB7ICdpbml0Jzogbm8gfVxuXG4gICAgIyBGb2N1cyBvbiB0aGUgaW5wdXQgZmllbGQuXG4gICAgZG8gQGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXNcblxuICAgIEBvbiAnc3VibWl0JywgQHN1Ym1pdCIsInsgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSdcblxuRXZlbnRmdWwgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL3JhY3RpdmUvZXZlbnRmdWwuY29mZmVlJ1xucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGZ1bC5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9wcm9qZWN0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9wcm9qZWN0Lmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IE1pbGVzdG9uZXMgfVxuXG4gICdkYXRhJzpcbiAgICAncHJvamVjdHMnOiBwcm9qZWN0c1xuICAgICdyZWFkeSc6IG5vXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgWyBvd25lciwgbmFtZSBdID0gQGdldCAncm91dGUnXG5cbiAgICBkb2N1bWVudC50aXRsZSA9IFwiI3tvd25lcn0vI3tuYW1lfVwiXG5cbiAgICAjIEdldCB0aGUgYXNzb2NpYXRlZCBwcm9qZWN0LlxuICAgIEBzZXQgJ3Byb2plY3QnLCBwcm9qZWN0ID0gcHJvamVjdHMuZmluZCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgU2hvdWxkIG5vdCBoYXBwZW4uLi5cbiAgICB0aHJvdyA1MDAgdW5sZXNzIHByb2plY3RcblxuICAgICMgV2UgZG9uJ3Qga25vdyBpZiB3ZSBoYXZlIGFsbCBtaWxlc3RvbmVzLCBzbyBmZXRjaCB0aGVtLlxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgIGZpbmRNaWxlc3RvbmUgPSAobnVtYmVyKSAtPlxuICAgICAgXy5maW5kIHByb2plY3QubWlsZXN0b25lcyBvciBbXSwgeyBudW1iZXIgfVxuXG4gICAgZmV0Y2hNaWxlc3RvbmVzID0gKGNiKSAtPlxuICAgICAgbWlsZXN0b25lcy5mZXRjaEFsbCBwcm9qZWN0LCBjYlxuXG4gICAgZmV0Y2hJc3N1ZXMgPSAoYWxsTWlsZXN0b25lcywgY2IpIC0+XG4gICAgICByZXR1cm4gY2IgJ1RoZSBwcm9qZWN0IGhhcyBubyBtaWxlc3RvbmVzJyB1bmxlc3MgYWxsTWlsZXN0b25lcy5sZW5ndGhcblxuICAgICAgYXN5bmMuZWFjaCBhbGxNaWxlc3RvbmVzLCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgIyBNYXliZSB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgIHJldHVybiBjYiBudWxsIGlmIGZpbmRNaWxlc3RvbmUgbWlsZXN0b25lLm51bWJlclxuICAgICAgICAjIE5lZWQgdG8gZmV0Y2ggdGhlIGlzc3VlcyB0aGVuLlxuICAgICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXIgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAjIE5leHQuXG4gICAgICAgICAgZG8gY2JcbiAgICAgICwgY2JcblxuICAgICMgUnVuIGl0LlxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEZpcnN0IGdldCBhbGwgdGhlIG1pbGVzdG9uZXMuXG4gICAgICBmZXRjaE1pbGVzdG9uZXMsXG4gICAgICAjIFRoZW4gYWxsIHRoZSBpc3N1ZXMgcGVyIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVycikgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBAcHVibGlzaCAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNheSB3ZSBhcmUgcmVhZHkuXG4gICAgICBAc2V0ICdyZWFkeScsIHllcyIsIlRhYmxlID0gcmVxdWlyZSAnLi90YWJsZS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gVGFibGUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvbWlsZXN0b25lcydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCciLCJUYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3Byb2plY3RzJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCciLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuZm9ybWF0ICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuLi9pY29ucy5jb2ZmZWUnXG5wcm9qZWN0cyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy90YWJsZSdcblxuICAnZGF0YSc6IHsgZm9ybWF0IH1cblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIENoYW5nZSBzb3J0IG9yZGVyLlxuICAgIEBvbiAnc29ydEJ5JywgLT5cbiAgICAgIGZucyA9IHByb2plY3RzLmRhdGEuc29ydEZuc1xuXG4gICAgICBpZHggPSAxICsgZm5zLmluZGV4T2YgcHJvamVjdHMuZGF0YS5zb3J0QnlcbiAgICAgIGlkeCA9IDAgaWYgaWR4IGlzIGZucy5sZW5ndGhcblxuICAgICAgcHJvamVjdHMuc2V0ICdzb3J0QnknLCBmbnNbaWR4XSIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyBleHBvcnQgdGhlIGNsYXNzIGlmIHdlIGFyZSBpbiBhIE5vZGUtbGlrZSBzeXN0ZW0uXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgPT09IGV4cG9ydHMpXG4gIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdO1xudmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG52YXIgUiA9IDA7XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbnZhciBOVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKic7XG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnO1xuXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnZhciBOT05OVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gPSAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKic7XG5cblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbnZhciBNQUlOVkVSU0lPTiA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIE1BSU5WRVJTSU9OTE9PU0UgPSBSKys7XG5zcmNbTUFJTlZFUlNJT05MT09TRV0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKSc7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRV0gPSAnKD86LSgnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJztcblxudmFyIFBSRVJFTEVBU0VMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG52YXIgQlVJTERJREVOVElGSUVSID0gUisrO1xuc3JjW0JVSUxESURFTlRJRklFUl0gPSAnWzAtOUEtWmEtei1dKyc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKys7XG5zcmNbQlVJTERdID0gJyg/OlxcXFwrKCcgKyBzcmNbQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tCVUlMRElERU5USUZJRVJdICsgJykqKSknO1xuXG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG52YXIgRlVMTCA9IFIrKztcbnZhciBGVUxMUExBSU4gPSAndj8nICsgc3JjW01BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCc7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnZhciBMT09TRVBMQUlOID0gJ1t2PVxcXFxzXSonICsgc3JjW01BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG52YXIgTE9PU0UgPSBSKys7XG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJztcblxudmFyIEdUTFQgPSBSKys7XG5zcmNbR1RMVF0gPSAnKCg/Ojx8Pik/PT8pJztcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdID0gc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConO1xudmFyIFhSQU5HRUlERU5USUZJRVIgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConO1xuXG52YXIgWFJBTkdFUExBSU4gPSBSKys7XG5zcmNbWFJBTkdFUExBSU5dID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFID0gUisrO1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgWFJBTkdFTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFTE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciByID0gbG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXTtcbiAgcmV0dXJuIChyLnRlc3QodmVyc2lvbikpID8gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkgOiBudWxsO1xufVxuXG5leHBvcnRzLnZhbGlkID0gdmFsaWQ7XG5mdW5jdGlvbiB2YWxpZCh2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgdiA9IHBhcnNlKHZlcnNpb24sIGxvb3NlKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsO1xufVxuXG5cbmV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbmZ1bmN0aW9uIGNsZWFuKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciBzID0gcGFyc2UodmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBsb29zZSk7XG4gIHJldHVybiBzID8gcy52ZXJzaW9uIDogbnVsbDtcbn1cblxuZXhwb3J0cy5TZW1WZXIgPSBTZW1WZXI7XG5cbmZ1bmN0aW9uIFNlbVZlcih2ZXJzaW9uLCBsb29zZSkge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIGlmICh2ZXJzaW9uLmxvb3NlID09PSBsb29zZSlcbiAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIGVsc2VcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnZlcnNpb247XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSk7XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIGxvb3NlKTtcbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuICB2YXIgbSA9IHZlcnNpb24udHJpbSgpLm1hdGNoKGxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF0pO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcblxuICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdO1xuICB0aGlzLm1pbm9yID0gK21bMl07XG4gIHRoaXMucGF0Y2ggPSArbVszXTtcblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICBlbHNlXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICgvXlswLTldKyQvLnRlc3QoaWQpKSA/ICtpZCA6IGlkO1xuICAgIH0pO1xuXG4gIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdCgnLicpIDogW107XG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblNlbVZlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudmVyc2lvbiA9IHRoaXMubWFqb3IgKyAnLicgKyB0aGlzLm1pbm9yICsgJy4nICsgdGhpcy5wYXRjaDtcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgdGhpcy52ZXJzaW9uICs9ICctJyArIHRoaXMucHJlcmVsZWFzZS5qb2luKCcuJyk7XG4gIHJldHVybiB0aGlzLnZlcnNpb247XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICc8U2VtVmVyIFwiJyArIHRoaXMgKyAnXCI+Jztcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5sb29zZSwgb3RoZXIpO1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMubG9vc2UpO1xuXG4gIC8vIE5PVCBoYXZpbmcgYSBwcmVyZWxlYXNlIGlzID4gaGF2aW5nIG9uZVxuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIC0xO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiBvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAwO1xuXG4gIHZhciBpID0gMDtcbiAgZG8ge1xuICAgIHZhciBhID0gdGhpcy5wcmVyZWxlYXNlW2ldO1xuICAgIHZhciBiID0gb3RoZXIucHJlcmVsZWFzZVtpXTtcbiAgICBkZWJ1ZygncHJlcmVsZWFzZSBjb21wYXJlJywgaSwgYSwgYik7XG4gICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMDtcbiAgICBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gLTE7XG4gICAgZWxzZSBpZiAoYSA9PT0gYilcbiAgICAgIGNvbnRpbnVlO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYik7XG4gIH0gd2hpbGUgKCsraSk7XG59O1xuXG4vLyBwcmVtaW5vciB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgbWlub3IgcmVsZWFzZSwgYW5kIGltbWVkaWF0ZWx5XG4vLyBkb3duIHRvIHByZS1yZWxlYXNlLiBwcmVtYWpvciBhbmQgcHJlcGF0Y2ggd29yayB0aGUgc2FtZSB3YXkuXG5TZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgc3dpdGNoIChyZWxlYXNlKSB7XG4gICAgY2FzZSAncHJlbWFqb3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlbWlub3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZXBhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYWxyZWFkeSBhIHByZXJlbGVhc2UsIGl0IHdpbGwgYnVtcCB0byB0aGUgbmV4dCB2ZXJzaW9uXG4gICAgICAvLyBkcm9wIGFueSBwcmVyZWxlYXNlcyB0aGF0IG1pZ2h0IGFscmVhZHkgZXhpc3QsIHNpbmNlIHRoZXkgYXJlIG5vdFxuICAgICAgLy8gcmVsZXZhbnQgYXQgdGhpcyBwb2ludC5cbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXNcbiAgICAvLyBwcmVwYXRjaC5cbiAgICBjYXNlICdwcmVyZWxlYXNlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbWFqb3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1tYWpvciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGlmICh0aGlzLm1pbm9yICE9PSAwIHx8IHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWlub3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1taW5vciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1pbm9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1pbm9yLlxuICAgICAgLy8gMS4yLjAtNSBidW1wcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjEgYnVtcHMgdG8gMS4zLjBcbiAgICAgIGlmICh0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIG5vdCBhIHByZS1yZWxlYXNlIHZlcnNpb24sIGl0IHdpbGwgaW5jcmVtZW50IHRoZSBwYXRjaC5cbiAgICAgIC8vIElmIGl0IGlzIGEgcHJlLXJlbGVhc2UgaXQgd2lsbCBidW1wIHVwIHRvIHRoZSBzYW1lIHBhdGNoIHZlcnNpb24uXG4gICAgICAvLyAxLjIuMC01IHBhdGNoZXMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4wIHBhdGNoZXMgdG8gMS4yLjFcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnBhdGNoKys7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGJlIHVzZWQgcHVibGljbHkuXG4gICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgIGNhc2UgJ3ByZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gWzBdO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2VbaV0rKztcbiAgICAgICAgICAgIGkgPSAtMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IC0xKSAvLyBkaWRuJ3QgaW5jcmVtZW50IGFueXRoaW5nXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICB9XG4gICAgICBpZiAoaWRlbnRpZmllcikge1xuICAgICAgICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAgICAgICAvLyAxLjIuMC1iZXRhLmZvb2JseiBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMucHJlcmVsZWFzZVsxXSkpXG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmNyZW1lbnQgYXJndW1lbnQ6ICcgKyByZWxlYXNlKTtcbiAgfVxuICB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydHMuaW5jID0gaW5jO1xuZnVuY3Rpb24gaW5jKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZTtcbiAgICBsb29zZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKS52ZXJzaW9uO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzO1xuXG52YXIgbnVtZXJpYyA9IC9eWzAtOV0rJC87XG5mdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICB2YXIgYW51bSA9IG51bWVyaWMudGVzdChhKTtcbiAgdmFyIGJudW0gPSBudW1lcmljLnRlc3QoYik7XG5cbiAgaWYgKGFudW0gJiYgYm51bSkge1xuICAgIGEgPSArYTtcbiAgICBiID0gK2I7XG4gIH1cblxuICByZXR1cm4gKGFudW0gJiYgIWJudW0pID8gLTEgOlxuICAgICAgICAgKGJudW0gJiYgIWFudW0pID8gMSA6XG4gICAgICAgICBhIDwgYiA/IC0xIDpcbiAgICAgICAgIGEgPiBiID8gMSA6XG4gICAgICAgICAwO1xufVxuXG5leHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzO1xuZnVuY3Rpb24gcmNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYiwgYSk7XG59XG5cbmV4cG9ydHMuY29tcGFyZSA9IGNvbXBhcmU7XG5mdW5jdGlvbiBjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5jb21wYXJlKGIpO1xufVxuXG5leHBvcnRzLmNvbXBhcmVMb29zZSA9IGNvbXBhcmVMb29zZTtcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIHRydWUpO1xufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmU7XG5mdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSk7XG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnQ7XG5mdW5jdGlvbiBzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0O1xuZnVuY3Rpb24gcnNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5ndCA9IGd0O1xuZnVuY3Rpb24gZ3QoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMDtcbn1cblxuZXhwb3J0cy5sdCA9IGx0O1xuZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMDtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuZnVuY3Rpb24gZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xufVxuXG5leHBvcnRzLm5lcSA9IG5lcTtcbmZ1bmN0aW9uIG5lcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDA7XG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlO1xuZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwO1xufVxuXG5leHBvcnRzLmx0ZSA9IGx0ZTtcbmZ1bmN0aW9uIGx0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXA7XG5mdW5jdGlvbiBjbXAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHZhciByZXQ7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhID09PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSAhPT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyc6IGNhc2UgJz0nOiBjYXNlICc9PSc6IHJldCA9IGVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnIT0nOiByZXQgPSBuZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+JzogcmV0ID0gZ3QoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+PSc6IHJldCA9IGd0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzwnOiByZXQgPSBsdChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzw9JzogcmV0ID0gbHRlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvcGVyYXRvcjogJyArIG9wKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuZnVuY3Rpb24gQ29tcGFyYXRvcihjb21wLCBsb29zZSkge1xuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gbG9vc2UpXG4gICAgICByZXR1cm4gY29tcDtcbiAgICBlbHNlXG4gICAgICBjb21wID0gY29tcC52YWx1ZTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSlcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgbG9vc2UpO1xuXG4gIGRlYnVnKCdjb21wYXJhdG9yJywgY29tcCwgbG9vc2UpO1xuICB0aGlzLmxvb3NlID0gbG9vc2U7XG4gIHRoaXMucGFyc2UoY29tcCk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgdGhpcy52YWx1ZSA9ICcnO1xuICBlbHNlXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuXG4gIGRlYnVnKCdjb21wJywgdGhpcyk7XG59XG5cbnZhciBBTlkgPSB7fTtcbkNvbXBhcmF0b3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oY29tcCkge1xuICB2YXIgciA9IHRoaXMubG9vc2UgPyByZVtDT01QQVJBVE9STE9PU0VdIDogcmVbQ09NUEFSQVRPUl07XG4gIHZhciBtID0gY29tcC5tYXRjaChyKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjb21wYXJhdG9yOiAnICsgY29tcCk7XG5cbiAgdGhpcy5vcGVyYXRvciA9IG1bMV07XG4gIGlmICh0aGlzLm9wZXJhdG9yID09PSAnPScpXG4gICAgdGhpcy5vcGVyYXRvciA9ICcnO1xuXG4gIC8vIGlmIGl0IGxpdGVyYWxseSBpcyBqdXN0ICc+JyBvciAnJyB0aGVuIGFsbG93IGFueXRoaW5nLlxuICBpZiAoIW1bMl0pXG4gICAgdGhpcy5zZW12ZXIgPSBBTlk7XG4gIGVsc2VcbiAgICB0aGlzLnNlbXZlciA9IG5ldyBTZW1WZXIobVsyXSwgdGhpcy5sb29zZSk7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnPFNlbVZlciBDb21wYXJhdG9yIFwiJyArIHRoaXMgKyAnXCI+Jztcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgZGVidWcoJ0NvbXBhcmF0b3IudGVzdCcsIHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5sb29zZSk7XG59O1xuXG5cbmV4cG9ydHMuUmFuZ2UgPSBSYW5nZTtcbmZ1bmN0aW9uIFJhbmdlKHJhbmdlLCBsb29zZSkge1xuICBpZiAoKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpICYmIHJhbmdlLmxvb3NlID09PSBsb29zZSlcbiAgICByZXR1cm4gcmFuZ2U7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG5cbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuXG4gIC8vIEZpcnN0LCBzcGxpdCBiYXNlZCBvbiBib29sZWFuIG9yIHx8XG4gIHRoaXMucmF3ID0gcmFuZ2U7XG4gIHRoaXMuc2V0ID0gcmFuZ2Uuc3BsaXQoL1xccypcXHxcXHxcXHMqLykubWFwKGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZShyYW5nZS50cmltKCkpO1xuICB9LCB0aGlzKS5maWx0ZXIoZnVuY3Rpb24oYykge1xuICAgIC8vIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHJlbGV2YW50IGZvciB3aGF0ZXZlciByZWFzb25cbiAgICByZXR1cm4gYy5sZW5ndGg7XG4gIH0pO1xuXG4gIGlmICghdGhpcy5zZXQubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBTZW1WZXIgUmFuZ2U6ICcgKyByYW5nZSk7XG4gIH1cblxuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5SYW5nZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJzxTZW1WZXIgUmFuZ2UgXCInICsgdGhpcy5yYW5nZSArICdcIj4nO1xufTtcblxuUmFuZ2UucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKCk7XG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpO1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5wYXJzZVJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5sb29zZTtcbiAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG4gIGRlYnVnKCdyYW5nZScsIHJhbmdlLCBsb29zZSk7XG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW0hZUEhFTlJBTkdFTE9PU0VdIDogcmVbSFlQSEVOUkFOR0VdO1xuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpO1xuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSk7XG4gIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICBkZWJ1ZygnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlW0NPTVBBUkFUT1JUUklNXSk7XG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKTtcblxuICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpO1xuXG4gIC8vIG5vcm1hbGl6ZSBzcGFjZXNcbiAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpLnNwbGl0KC9cXHMrLyk7XG4gIGlmICh0aGlzLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHJldHVybiAhIWNvbXAubWF0Y2goY29tcFJlKTtcbiAgICB9KTtcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgbG9vc2UpO1xuICB9KTtcblxuICByZXR1cm4gc2V0O1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKS5zZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gY29tcC5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfSkuam9pbignICcpLnRyaW0oKS5zcGxpdCgnICcpO1xuICB9KTtcbn1cblxuLy8gY29tcHJpc2VkIG9mIHhyYW5nZXMsIHRpbGRlcywgc3RhcnMsIGFuZCBndGx0J3MgYXQgdGhpcyBwb2ludC5cbi8vIGFscmVhZHkgcmVwbGFjZWQgdGhlIGh5cGhlbiByYW5nZXNcbi8vIHR1cm4gaW50byBhIHNldCBvZiBKVVNUIGNvbXBhcmF0b3JzLlxuZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3RpbGRlcycsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVhSYW5nZXMoY29tcCwgbG9vc2UpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgbG9vc2UpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBsb29zZSkge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlVGlsZGUoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBsb29zZSkge1xuICB2YXIgciA9IGxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wLSA8MS4zLjAtXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZVRpbGRlIHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIH0gZWxzZVxuICAgICAgLy8gfjEuMi4zID09ID49MS4yLjMgPDEuMy4wXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuXG4gICAgZGVidWcoJ3RpbGRlIHJldHVybicsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIF4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyBeMiwgXjIueCwgXjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gXjIuMCwgXjIuMC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gXjEuMiwgXjEuMi54IC0tPiA+PTEuMi4wIDwyLjAuMFxuLy8gXjEuMi4zIC0tPiA+PTEuMi4zIDwyLjAuMFxuLy8gXjEuMi4wIC0tPiA+PTEuMi4wIDwyLjAuMFxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0cyhjb21wLCBsb29zZSkge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldChjb21wLCBsb29zZSkge1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBsb29zZSk7XG4gIHZhciByID0gbG9vc2UgPyByZVtDQVJFVExPT1NFXSA6IHJlW0NBUkVUXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCdjYXJldCcsIGNvbXAsIF8sIE0sIG0sIHAsIHByKTtcbiAgICB2YXIgcmV0O1xuXG4gICAgaWYgKGlzWChNKSlcbiAgICAgIHJldCA9ICcnO1xuICAgIGVsc2UgaWYgKGlzWChtKSlcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICBlbHNlIGlmIChpc1gocCkpIHtcbiAgICAgIGlmIChNID09PSAnMCcpXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlQ2FyZXQgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Zygnbm8gcHInKTtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ2NhcmV0IHJldHVybicsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2VzKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIGxvb3NlKTtcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlKGNvbXAsIGxvb3NlKSB7XG4gIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW1hSQU5HRUxPT1NFXSA6IHJlW1hSQU5HRV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24ocmV0LCBndGx0LCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCd4UmFuZ2UnLCBjb21wLCByZXQsIGd0bHQsIE0sIG0sIHAsIHByKTtcbiAgICB2YXIgeE0gPSBpc1goTSk7XG4gICAgdmFyIHhtID0geE0gfHwgaXNYKG0pO1xuICAgIHZhciB4cCA9IHhtIHx8IGlzWChwKTtcbiAgICB2YXIgYW55WCA9IHhwO1xuXG4gICAgaWYgKGd0bHQgPT09ICc9JyAmJiBhbnlYKVxuICAgICAgZ3RsdCA9ICcnO1xuXG4gICAgaWYgKHhNKSB7XG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nIHx8IGd0bHQgPT09ICc8Jykge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgcmV0ID0gJzwwLjAuMCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGZvcmJpZGRlblxuICAgICAgICByZXQgPSAnKic7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChndGx0ICYmIGFueVgpIHtcbiAgICAgIC8vIHJlcGxhY2UgWCB3aXRoIDBcbiAgICAgIGlmICh4bSlcbiAgICAgICAgbSA9IDA7XG4gICAgICBpZiAoeHApXG4gICAgICAgIHAgPSAwO1xuXG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nKSB7XG4gICAgICAgIC8vID4xID0+ID49Mi4wLjBcbiAgICAgICAgLy8gPjEuMiA9PiA+PTEuMy4wXG4gICAgICAgIC8vID4xLjIuMyA9PiA+PSAxLjIuNFxuICAgICAgICBndGx0ID0gJz49JztcbiAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgICBtID0gMDtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZ3RsdCA9PT0gJzw9Jykge1xuICAgICAgICAvLyA8PTAuNy54IGlzIGFjdHVhbGx5IDwwLjguMCwgc2luY2UgYW55IDAuNy54IHNob3VsZFxuICAgICAgICAvLyBwYXNzLiAgU2ltaWxhcmx5LCA8PTcueCBpcyBhY3R1YWxseSA8OC4wLjAsIGV0Yy5cbiAgICAgICAgZ3RsdCA9ICc8J1xuICAgICAgICBpZiAoeG0pXG4gICAgICAgICAgTSA9ICtNICsgMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMVxuICAgICAgfVxuXG4gICAgICByZXQgPSBndGx0ICsgTSArICcuJyArIG0gKyAnLicgKyBwO1xuICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCd4UmFuZ2UgcmV0dXJuJywgcmV0KTtcblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBCZWNhdXNlICogaXMgQU5ELWVkIHdpdGggZXZlcnl0aGluZyBlbHNlIGluIHRoZSBjb21wYXJhdG9yLFxuLy8gYW5kICcnIG1lYW5zIFwiYW55IHZlcnNpb25cIiwganVzdCByZW1vdmUgdGhlICpzIGVudGlyZWx5LlxuZnVuY3Rpb24gcmVwbGFjZVN0YXJzKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBsb29zZSk7XG4gIC8vIExvb3NlbmVzcyBpcyBpZ25vcmVkIGhlcmUuICBzdGFyIGlzIGFsd2F5cyBhcyBsb29zZSBhcyBpdCBnZXRzIVxuICByZXR1cm4gY29tcC50cmltKCkucmVwbGFjZShyZVtTVEFSXSwgJycpO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVtIWVBIRU5SQU5HRV0pXG4vLyBNLCBtLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGRcbi8vIDEuMiAtIDMuNC41ID0+ID49MS4yLjAgPD0zLjQuNVxuLy8gMS4yLjMgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAgQW55IDMuNC54IHdpbGwgZG9cbi8vIDEuMiAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMFxuZnVuY3Rpb24gaHlwaGVuUmVwbGFjZSgkMCxcbiAgICAgICAgICAgICAgICAgICAgICAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgICAgICAgICAgICAgICAgICAgICAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpIHtcblxuICBpZiAoaXNYKGZNKSlcbiAgICBmcm9tID0gJyc7XG4gIGVsc2UgaWYgKGlzWChmbSkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKGZwKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4nICsgZm0gKyAnLjAnO1xuICBlbHNlXG4gICAgZnJvbSA9ICc+PScgKyBmcm9tO1xuXG4gIGlmIChpc1godE0pKVxuICAgIHRvID0gJyc7XG4gIGVsc2UgaWYgKGlzWCh0bSkpXG4gICAgdG8gPSAnPCcgKyAoK3RNICsgMSkgKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWCh0cCkpXG4gICAgdG8gPSAnPCcgKyB0TSArICcuJyArICgrdG0gKyAxKSArICcuMCc7XG4gIGVsc2UgaWYgKHRwcilcbiAgICB0byA9ICc8PScgKyB0TSArICcuJyArIHRtICsgJy4nICsgdHAgKyAnLScgKyB0cHI7XG4gIGVsc2VcbiAgICB0byA9ICc8PScgKyB0bztcblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpO1xufVxuXG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0U2V0KHRoaXMuc2V0W2ldLCB2ZXJzaW9uKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHRlc3RTZXQoc2V0LCB2ZXJzaW9uKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgLy8gRmluZCB0aGUgc2V0IG9mIHZlcnNpb25zIHRoYXQgYXJlIGFsbG93ZWQgdG8gaGF2ZSBwcmVyZWxlYXNlc1xuICAgIC8vIEZvciBleGFtcGxlLCBeMS4yLjMtcHIuMSBkZXN1Z2FycyB0byA+PTEuMi4zLXByLjEgPDIuMC4wXG4gICAgLy8gVGhhdCBzaG91bGQgYWxsb3cgYDEuMi4zLXByLjJgIHRvIHBhc3MuXG4gICAgLy8gSG93ZXZlciwgYDEuMi40LWFscGhhLm5vdHJlYWR5YCBzaG91bGQgTk9UIGJlIGFsbG93ZWQsXG4gICAgLy8gZXZlbiB0aG91Z2ggaXQncyB3aXRoaW4gdGhlIHJhbmdlIHNldCBieSB0aGUgY29tcGFyYXRvcnMuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlYnVnKHNldFtpXS5zZW12ZXIpO1xuICAgICAgaWYgKHNldFtpXS5zZW12ZXIgPT09IEFOWSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgYWxsb3dlZCA9IHNldFtpXS5zZW12ZXI7XG4gICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLm1pbm9yID09PSB2ZXJzaW9uLm1pbm9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLnBhdGNoID09PSB2ZXJzaW9uLnBhdGNoKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcnNpb24gaGFzIGEgLXByZSwgYnV0IGl0J3Mgbm90IG9uZSBvZiB0aGUgb25lcyB3ZSBsaWtlLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnNhdGlzZmllcyA9IHNhdGlzZmllcztcbmZ1bmN0aW9uIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgbG9vc2UpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKTtcbn1cblxuZXhwb3J0cy5tYXhTYXRpc2Z5aW5nID0gbWF4U2F0aXNmeWluZztcbmZ1bmN0aW9uIG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gdmVyc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBsb29zZSk7XG4gIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiByY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pWzBdIHx8IG51bGw7XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBsb29zZSkge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSkucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIGxvb3NlKTtcbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuZXhwb3J0cy5ndHIgPSBndHI7XG5mdW5jdGlvbiBndHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIGxvb3NlKSB7XG4gIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaV07XG5cbiAgICB2YXIgaGlnaCA9IG51bGw7XG4gICAgdmFyIGxvdyA9IG51bGw7XG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgbG9vc2UpKSB7XG4gICAgICAgIGhpZ2ggPSBjb21wYXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChsdGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBsb3cuc2VtdmVyLCBsb29zZSkpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChsb3cub3BlcmF0b3IgPT09IGVjb21wICYmIGx0Zm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIFVzZSB0aGUgZGVmaW5lKCkgZnVuY3Rpb24gaWYgd2UncmUgaW4gQU1EIGxhbmRcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG4gIGRlZmluZShleHBvcnRzKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpIl19
