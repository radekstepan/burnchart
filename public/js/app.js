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
var Header, Notify, Ractive, app, router;

Ractive = require('./modules/vendor.coffee').Ractive;

require('./utils/mixins.coffee');

require('./models/projects.coffee');

Header = require('./views/header.coffee');

Notify = require('./views/notify.coffee');

router = require('./modules/router.coffee');

app = new Ractive({
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

Model = require('../utils/model.coffee');

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



},{"../utils/model.coffee":"/home/radek/dev/burnchart.io/src/utils/model.coffee"}],"/home/radek/dev/burnchart.io/src/models/firebase.coffee":[function(require,module,exports){
var Firebase, FirebaseSimpleLogin, Model, config, user, _ref;

_ref = require('../modules/vendor.coffee'), Firebase = _ref.Firebase, FirebaseSimpleLogin = _ref.FirebaseSimpleLogin;

Model = require('../utils/model.coffee');

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



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../utils/model.coffee":"/home/radek/dev/burnchart.io/src/utils/model.coffee","./config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","./user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee"}],"/home/radek/dev/burnchart.io/src/models/projects.coffee":[function(require,module,exports){
var Model, config, date, lscache, mediator, semver, sortedIndexCmp, stats, user, _, _ref,
  __slice = [].slice;

_ref = require('../modules/vendor.coffee'), _ = _ref._, lscache = _ref.lscache, sortedIndexCmp = _ref.sortedIndexCmp, semver = _ref.semver;

config = require('../models/config.coffee');

mediator = require('../modules/mediator.coffee');

stats = require('../modules/stats.coffee');

Model = require('../utils/model.coffee');

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
    mediator.on('!projects/add', _.bind(this.add, this));
    return mediator.on('!projects/clear', _.bind(this.clear, this));
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



},{"../models/config.coffee":"/home/radek/dev/burnchart.io/src/models/config.coffee","../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../modules/stats.coffee":"/home/radek/dev/burnchart.io/src/modules/stats.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../utils/date.coffee":"/home/radek/dev/burnchart.io/src/utils/date.coffee","../utils/model.coffee":"/home/radek/dev/burnchart.io/src/utils/model.coffee","./user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee"}],"/home/radek/dev/burnchart.io/src/models/system.coffee":[function(require,module,exports){
var Model, async, counter, mediator, system;

mediator = require('../modules/mediator.coffee');

Model = require('../utils/model.coffee');

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



},{"../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../utils/model.coffee":"/home/radek/dev/burnchart.io/src/utils/model.coffee"}],"/home/radek/dev/burnchart.io/src/models/user.coffee":[function(require,module,exports){
var Model, mediator;

mediator = require('../modules/mediator.coffee');

Model = require('../utils/model.coffee');

module.exports = new Model({
  'name': 'models/user',
  'data': {
    'provider': "local",
    'id': "0",
    'uid': "local:0",
    'token': null
  }
});



},{"../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../utils/model.coffee":"/home/radek/dev/burnchart.io/src/utils/model.coffee"}],"/home/radek/dev/burnchart.io/src/modules/chart/axes.coffee":[function(require,module,exports){
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
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"head"},"f":[{"t":4,"n":53,"r":"user","f":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","a":{"class":"right"},"t1":"fade","f":[{"t":4,"r":"displayName","f":[{"t":2,"r":"displayName"}," logged in"]},{"t":4,"n":51,"f":[{"t":7,"e":"a","a":{"class":"github"},"v":{"click":"!login"},"f":[{"t":7,"e":"Icons","a":{"icon":"github"}}," Sign In"]}],"r":"displayName"}]}]}]}," ",{"t":7,"e":"a","a":{"id":"icon","href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}]}," ",{"t":7,"e":"ul","f":[{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#new/project","class":"add"},"f":[{"t":7,"e":"Icons","a":{"icon":"plus-circled"}}," Add a Project"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#","class":"faq"},"f":["FAQ"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#reset"},"f":["DB Reset"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#notify"},"f":["Notify"]}]}]}]}]}
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



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/utils/model.coffee":[function(require,module,exports){
var Ractive;

Ractive = require('../modules/vendor.coffee').Ractive;

module.exports = function(opts) {
  var Model, model;
  Model = Ractive.extend(opts);
  model = new Model();
  model.render();
  return model;
};



},{"../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee"}],"/home/radek/dev/burnchart.io/src/views/chart.coffee":[function(require,module,exports){
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
var Icons, Ractive, mediator;

Ractive = require('../modules/vendor.coffee').Ractive;

mediator = require('../modules/mediator.coffee');

Icons = require('./icons.coffee');

module.exports = Ractive.extend({
  'name': 'views/hero',
  'template': require('../templates/hero.html'),
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive]
});



},{"../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/hero.html":"/home/radek/dev/burnchart.io/src/templates/hero.html","./icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/icons.coffee":[function(require,module,exports){
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
var HEIGHT, Icons, Ractive, d3, mediator, _, _ref;

_ref = require('../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive, d3 = _ref.d3;

mediator = require('../modules/mediator.coffee');

Icons = require('./icons.coffee');

HEIGHT = 68;

module.exports = Ractive.extend({
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
    mediator.on('!app/notify', _.bind(this.show, this));
    mediator.on('!app/notify/hide', _.bind(this.hide, this));
    return this.on('close', this.hide);
  }
});



},{"../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../templates/notify.html":"/home/radek/dev/burnchart.io/src/templates/notify.html","./icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/index.coffee":[function(require,module,exports){
var Hero, Projects, Ractive, async, issues, mediator, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive, async = _ref.async;

Hero = require('../hero.coffee');

Projects = require('../tables/projects.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

mediator = require('../../modules/mediator.coffee');

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



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/index.html":"/home/radek/dev/burnchart.io/src/templates/pages/index.html","../hero.coffee":"/home/radek/dev/burnchart.io/src/views/hero.coffee","../tables/projects.coffee":"/home/radek/dev/burnchart.io/src/views/tables/projects.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/milestone.coffee":[function(require,module,exports){
var Chart, Ractive, async, format, issues, mediator, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive, async = _ref.async;

Chart = require('../chart.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

mediator = require('../../modules/mediator.coffee');

format = require('../../utils/format.coffee');

module.exports = Ractive.extend({
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
          return mediator.fire('!app/notify', {
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



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/milestone.html":"/home/radek/dev/burnchart.io/src/templates/pages/milestone.html","../../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee","../chart.coffee":"/home/radek/dev/burnchart.io/src/views/chart.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/new.coffee":[function(require,module,exports){
var Ractive, key, mediator, system, user, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive;

mediator = require('../../modules/mediator.coffee');

system = require('../../models/system.coffee');

user = require('../../models/user.coffee');

key = require('../../utils/key.coffee');

module.exports = Ractive.extend({
  'name': 'views/pages/new',
  'template': require('../../templates/pages/new.html'),
  'data': {
    'value': 'radekstepan/disposable',
    user: user
  },
  'adapt': [Ractive.adaptors.Ractive],
  submit: function(evt, value) {
    var done, name, owner, _ref1;
    if (key.is(evt) && !key.isEnter(evt)) {
      return;
    }
    _ref1 = value.split('/'), owner = _ref1[0], name = _ref1[1];
    done = system.async();
    return mediator.fire('!projects/add', {
      owner: owner,
      name: name
    }, function(err) {
      done();
      mediator.fire('!app/notify', {
        'text': err || ("Project " + value + " saved."),
        'type': err ? 'error' : 'success'
      });
      return window.location.hash = '#';
    });
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



},{"../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../models/user.coffee":"/home/radek/dev/burnchart.io/src/models/user.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/new.html":"/home/radek/dev/burnchart.io/src/templates/pages/new.html","../../utils/key.coffee":"/home/radek/dev/burnchart.io/src/utils/key.coffee"}],"/home/radek/dev/burnchart.io/src/views/pages/project.coffee":[function(require,module,exports){
var Milestones, Ractive, async, issues, mediator, milestones, projects, system, _, _ref;

_ref = require('../../modules/vendor.coffee'), _ = _ref._, Ractive = _ref.Ractive, async = _ref.async;

Milestones = require('../tables/milestones.coffee');

projects = require('../../models/projects.coffee');

system = require('../../models/system.coffee');

milestones = require('../../modules/github/milestones.coffee');

issues = require('../../modules/github/issues.coffee');

mediator = require('../../modules/mediator.coffee');

module.exports = Ractive.extend({
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
          return mediator.fire('!app/notify', {
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



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../models/system.coffee":"/home/radek/dev/burnchart.io/src/models/system.coffee","../../modules/github/issues.coffee":"/home/radek/dev/burnchart.io/src/modules/github/issues.coffee","../../modules/github/milestones.coffee":"/home/radek/dev/burnchart.io/src/modules/github/milestones.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/pages/project.html":"/home/radek/dev/burnchart.io/src/templates/pages/project.html","../tables/milestones.coffee":"/home/radek/dev/burnchart.io/src/views/tables/milestones.coffee"}],"/home/radek/dev/burnchart.io/src/views/tables/milestones.coffee":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvYXBwLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9jb25maWcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvc3lzdGVtLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy91c2VyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL3JlcXVlc3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3JvdXRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3N0YXRzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvdmVuZG9yLmNvZmZlZSIsInNyYy90ZW1wbGF0ZXMvYXBwLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2NoYXJ0Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL3RlbXBsYXRlcy9oZXJvLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2ljb25zLmh0bWwiLCJzcmMvdGVtcGxhdGVzL25vdGlmeS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9kYXRlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2Zvcm1hdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9rZXkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbWl4aW5zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL21vZGVsLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2NoYXJ0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlYWRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZXJvLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2ljb25zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL25vdGlmeS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbmV3LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy90YWJsZS5jb2ZmZWUiLCJ2ZW5kb3Ivbm9kZS1zZW12ZXIvc2VtdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcbiMgTG9kYXNoIG1peGlucy5cbnJlcXVpcmUgJy4vdXRpbHMvbWl4aW5zLmNvZmZlZSdcbiMgV2lsbCBsb2FkIHByb2plY3RzIGZyb20gbG9jYWxTdG9yYWdlLlxucmVxdWlyZSAnLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5IZWFkZXIgPSByZXF1aXJlICcuL3ZpZXdzL2hlYWRlci5jb2ZmZWUnXG5Ob3RpZnkgPSByZXF1aXJlICcuL3ZpZXdzL25vdGlmeS5jb2ZmZWUnXG5yb3V0ZXIgPSByZXF1aXJlICcuL21vZHVsZXMvcm91dGVyLmNvZmZlZSdcblxuYXBwID0gbmV3IFJhY3RpdmVcbiAgXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2FwcC5odG1sJ1xuXG4gICdlbCc6ICdib2R5J1xuXG4gICdjb21wb25lbnRzJzogeyBIZWFkZXIsIE5vdGlmeSB9XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTdGFydCB0aGUgcm91dGVyLlxuICAgIHJvdXRlci5pbml0ICcvJyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHJpdmF0ZV9yZXBvJ1xuXG4gICMgTG9nb3V0IGEgdXNlci5cbiAgbG9nb3V0OiAtPlxuICAgIEBhdXRoPy5sb2dvdXRcbiAgICBkbyB1c2VyLnJlc2V0XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTZXR1cCBhIG5ldyBjbGllbnQuXG4gICAgQHNldCAnY2xpZW50JywgY2xpZW50ID0gbmV3IEZpcmViYXNlIFwiaHR0cHM6Ly8je2NvbmZpZy5kYXRhLmZpcmViYXNlfS5maXJlYmFzZWlvLmNvbVwiXG4gICAgXG4gICAgIyBDaGVjayBpZiB3ZSBoYXZlIGEgdXNlciBpbiBzZXNzaW9uLlxuICAgIEBhdXRoID0gbmV3IEZpcmViYXNlU2ltcGxlTG9naW4gY2xpZW50LCAoZXJyLCBvYmopIC0+XG4gICAgICB0aHJvdyBlcnIgaWYgZXJyXG4gICAgICBcbiAgICAgICMgU2F2ZSB1c2VyLlxuICAgICAgdXNlci5zZXQgb2JqIGlmIG9ialxuICAgICAgIyBTYXkgd2UgYXJlIGRvbmUuXG4gICAgICB1c2VyLnNldCAncmVhZHknLCB5ZXMiLCJ7IF8sIGxzY2FjaGUsIHNvcnRlZEluZGV4Q21wLCBzZW12ZXIgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnICAgPSByZXF1aXJlICcuLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zdGF0cyAgICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvc3RhdHMuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5kYXRlICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL2RhdGUuY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9wcm9qZWN0cydcblxuICAnZGF0YSc6XG4gICAgIyBDdXJyZW50IHNvcnQgb3JkZXIuXG4gICAgJ3NvcnRCeSc6ICdwcmlvcml0eSdcbiAgICAjIFNvcnQgZnVuY3Rpb25zLlxuICAgICdzb3J0Rm5zJzogWyAncHJvZ3Jlc3MnLCAncHJpb3JpdHknLCAnbmFtZScgXVxuXG4gICMgUmV0dXJuIGEgc29ydCBvcmRlciBjb21wYXJhdG9yLlxuICBjb21wYXJhdG9yOiAtPlxuICAgIHsgbGlzdCwgc29ydEJ5IH0gPSBAZGF0YVxuXG4gICAgIyBDb252ZXJ0IGV4aXN0aW5nIGluZGV4IGludG8gYWN0dWFsIHByb2plY3QgbWlsZXN0b25lLlxuICAgIGRlSWR4ID0gKGZuKSA9PlxuICAgICAgKFsgaSwgaiBdLCByZXN0Li4uKSA9PlxuICAgICAgICBmbi5hcHBseSBALCBbIFsgbGlzdFtpXSwgbGlzdFtpXS5taWxlc3RvbmVzW2pdIF0gXS5jb25jYXQgcmVzdFxuXG4gICAgIyBTZXQgZGVmYXVsdCBmaWVsZHMsIGluIHBsYWNlLlxuICAgIGRlZmF1bHRzID0gKGFyciwgaGFzaCkgLT5cbiAgICAgIGZvciBpdGVtIGluIGFyclxuICAgICAgICBmb3IgaywgdiBvZiBoYXNoXG4gICAgICAgICAgcmVmID0gaXRlbVxuICAgICAgICAgIGZvciBwLCBpIGluIGtleXMgPSBrLnNwbGl0ICcuJ1xuICAgICAgICAgICAgaWYgaSBpcyBrZXlzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgcmVmW3BdID89IHZcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmVmID0gcmVmW3BdID89IHt9XG5cbiAgICAjIFRoZSBhY3R1YWwgZm4gc2VsZWN0aW9uLlxuICAgIHN3aXRjaCBzb3J0QnlcbiAgICAgICMgRnJvbSBoaWdoZXN0IHByb2dyZXNzIHBvaW50cy5cbiAgICAgIHdoZW4gJ3Byb2dyZXNzJyB0aGVuIGRlSWR4IChbIGFQLCBhTSBdLCBbIGJQLCBiTSBdKSAtPlxuICAgICAgICBkZWZhdWx0cyBbIGFNLCBiTSBdLCB7ICdzdGF0cy5wcm9ncmVzcy5wb2ludHMnOiAwIH1cbiAgICAgICAgIyBTaW1wbGUgcG9pbnRzIGRpZmZlcmVuY2UuXG4gICAgICAgIGFNLnN0YXRzLnByb2dyZXNzLnBvaW50cyAtIGJNLnN0YXRzLnByb2dyZXNzLnBvaW50c1xuXG4gICAgICAjIEZyb20gbW9zdCBkZWxheWVkIGluIGRheXMuXG4gICAgICB3aGVuICdwcmlvcml0eScgdGhlbiBkZUlkeCAoWyBhUCwgYU0gXSwgWyBiUCwgYk0gXSkgLT5cbiAgICAgICAgIyBNaWxlc3RvbmVzIHdpdGggbm8gZGVhZGxpbmUgYXJlIGFsd2F5cyBhdCB0aGUgXCJiZWdpbm5pbmdcIi5cbiAgICAgICAgZGVmYXVsdHMgWyBhTSwgYk0gXSwgeyAnc3RhdHMucHJvZ3Jlc3MudGltZSc6IDAsICdzdGF0cy5kYXlzJzogMWUzIH1cbiAgICAgICAgIyAlIGRpZmZlcmVuY2UgaW4gcHJvZ3Jlc3MgdGltZXMgdGhlIG51bWJlciBvZiBkYXlzIGFoZWFkIG9yIGJlaGluZC5cbiAgICAgICAgWyAkYSwgJGIgXSA9IF8ubWFwIFsgYU0sIGJNIF0sICh7IHN0YXRzIH0pIC0+XG4gICAgICAgICAgKHN0YXRzLnByb2dyZXNzLnBvaW50cyAtIHN0YXRzLnByb2dyZXNzLnRpbWUpICogc3RhdHMuZGF5c1xuXG4gICAgICAgICRiIC0gJGFcblxuICAgICAgIyBCYXNlZCBvbiBwcm9qZWN0IHRoZW4gbWlsZXN0b25lIG5hbWUgaW5jbHVkaW5nIHNlbXZlci5cbiAgICAgIHdoZW4gJ25hbWUnIHRoZW4gZGVJZHggKFsgYVAsIGFNIF0sIFsgYlAsIGJNIF0pIC0+XG4gICAgICAgIHJldHVybiBvd25lciBpZiBvd25lciA9IGJQLm93bmVyLmxvY2FsZUNvbXBhcmUgYVAub3duZXJcbiAgICAgICAgcmV0dXJuIG5hbWUgaWYgbmFtZSA9IGJQLm5hbWUubG9jYWxlQ29tcGFyZSBhUC5uYW1lXG4gICAgICAgICMgVHJ5IHNlbXZlci5cbiAgICAgICAgaWYgc2VtdmVyLnZhbGlkKGJNLnRpdGxlKSBhbmQgc2VtdmVyLnZhbGlkKGFNLnRpdGxlKVxuICAgICAgICAgIHNlbXZlci5ndCBiTS50aXRsZSwgYU0udGl0bGVcbiAgICAgICAgIyBCYWNrIHRvIHN0cmluZyBjb21wYXJlLlxuICAgICAgICBlbHNlXG4gICAgICAgICAgYk0udGl0bGUubG9jYWxlQ29tcGFyZSBhTS50aXRsZVxuXG4gICAgICAjIFRoZSBcIndoYXRldmVyXCIgc29ydCBvcmRlci4uLlxuICAgICAgZWxzZSAtPiAwXG5cbiAgZmluZDogKHByb2plY3QpIC0+XG4gICAgXy5maW5kIEBkYXRhLmxpc3QsIHByb2plY3RcblxuICBleGlzdHM6IC0+XG4gICAgISFAZmluZC5hcHBseSBALCBhcmd1bWVudHNcblxuICAjIFB1c2ggdG8gdGhlIHN0YWNrIHVubGVzcyBpdCBleGlzdHMgYWxyZWFkeS5cbiAgYWRkOiAocHJvamVjdCkgLT5cbiAgICBAcHVzaCAnbGlzdCcsIHByb2plY3QgdW5sZXNzIEBleGlzdHMgcHJvamVjdFxuXG4gICMgRmluZCBpbmRleCBvZiBhIHByb2plY3QuXG4gIGZpbmRJbmRleDogKHsgb3duZXIsIG5hbWUgfSkgLT5cbiAgICBfLmZpbmRJbmRleCBAZGF0YS5saXN0LCB7IG93bmVyLCBuYW1lIH1cblxuICAjIEFkZCBhIG1pbGVzdG9uZSBmb3IgYSBwcm9qZWN0LlxuICBhZGRNaWxlc3RvbmU6IChwcm9qZWN0LCBtaWxlc3RvbmUpIC0+XG4gICAgIyBBZGQgaW4gdGhlIHN0YXRzLlxuICAgIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnc3RhdHMnOiBzdGF0cyhtaWxlc3RvbmUpIH1cbiAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgIHRocm93IDUwMCBpZiAoaSA9IEBmaW5kSW5kZXgocHJvamVjdCkpIDwgMCBcblxuICAgICMgSGF2ZSBtaWxlc3RvbmVzIGFscmVhZHk/XG4gICAgaWYgcHJvamVjdC5taWxlc3RvbmVzP1xuICAgICAgQHB1c2ggXCJsaXN0LiN7aX0ubWlsZXN0b25lc1wiLCBtaWxlc3RvbmVcbiAgICAgIGogPSBAZGF0YS5saXN0W2ldLm1pbGVzdG9uZXMubGVuZ3RoIC0gMSAjIGluZGV4IGluIG1pbGVzdG9uZXNcbiAgICBlbHNlXG4gICAgICBAc2V0IFwibGlzdC4je2l9Lm1pbGVzdG9uZXNcIiwgWyBtaWxlc3RvbmUgXVxuICAgICAgaiA9IDAgICMgaW5kZXggaW4gbWlsZXN0b25lc1xuXG4gICAgIyBOb3cgaW5kZXggdGhpcyBtaWxlc3RvbmUuXG4gICAgQHNvcnQgWyBpLCBqIF0sIFsgcHJvamVjdCwgbWlsZXN0b25lIF1cblxuICAjIFNhdmUgYW4gZXJyb3IgZnJvbSBsb2FkaW5nIG1pbGVzdG9uZXMgb3IgaXNzdWVzXG4gIHNhdmVFcnJvcjogKHByb2plY3QsIGVycikgLT5cbiAgICBpZiAoaWR4ID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPiAtMVxuICAgICAgaWYgcHJvamVjdC5lcnJvcnM/XG4gICAgICAgIEBwdXNoIFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIGVyclxuICAgICAgZWxzZVxuICAgICAgICBAc2V0IFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIFsgZXJyIF1cbiAgICBlbHNlXG4gICAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgICAgdGhyb3cgNTAwICBcblxuICBjbGVhcjogLT5cbiAgICBAc2V0ICdsaXN0JzogW10sICdpbmRleCc6IFtdXG5cbiAgIyBTb3J0L29yIGluc2VydCBpbnRvIGFuIGFscmVhZHkgc29ydGVkIGluZGV4LlxuICBzb3J0OiAocmVmLCBkYXRhKSAtPlxuICAgICMgR2V0IG9yIGluaXRpYWxpemUgdGhlIGluZGV4LlxuICAgIGluZGV4ID0gQGRhdGEuaW5kZXggb3IgW11cblxuICAgICMgRG8gb25lLlxuICAgIGlmIHJlZlxuICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIGRhdGEsIGRvIEBjb21wYXJhdG9yXG4gICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCByZWZcbiAgICAjIERvIGFsbC5cbiAgICBlbHNlXG4gICAgICBmb3IgcCwgaSBpbiBAZGF0YS5saXN0XG4gICAgICAgICMgVE9ETzogbmVlZCB0byBzaG93IHByb2plY3RzIHRoYXQgZmFpbGVkIHRvby4uLlxuICAgICAgICBjb250aW51ZSB1bmxlc3MgcC5taWxlc3RvbmVzP1xuICAgICAgICBmb3IgbSwgaiBpbiBwLm1pbGVzdG9uZXNcbiAgICAgICAgICAjIFJ1biBhIGNvbXBhcmF0b3IgaGVyZSBpbnNlcnRpbmcgaW50byBpbmRleC5cbiAgICAgICAgICBpZHggPSBzb3J0ZWRJbmRleENtcCBpbmRleCwgWyBwLCBtIF0sIGRvIEBjb21wYXJhdG9yXG4gICAgICAgICAgIyBMb2cuXG4gICAgICAgICAgaW5kZXguc3BsaWNlIGlkeCwgMCwgWyBpLCBqIF1cblxuICAgICMgU2F2ZSB0aGUgaW5kZXguXG4gICAgQHNldCAnaW5kZXgnLCBpbmRleFxuXG4gIG9uY29uc3RydWN0OiAtPlxuICAgIG1lZGlhdG9yLm9uICchcHJvamVjdHMvYWRkJywgICAgXy5iaW5kIEBhZGQsIEBcbiAgICBtZWRpYXRvci5vbiAnIXByb2plY3RzL2NsZWFyJywgIF8uYmluZCBAY2xlYXIsIEBcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIEluaXQgdGhlIHByb2plY3RzLlxuICAgIEBzZXQgJ2xpc3QnLCBsc2NhY2hlLmdldCgncHJvamVjdHMnKSBvciBbXVxuXG4gICAgIyBQZXJzaXN0IHByb2plY3RzIGluIGxvY2FsIHN0b3JhZ2UgKHNhbnMgbWlsZXN0b25lcykuXG4gICAgQG9ic2VydmUgJ2xpc3QnLCAocHJvamVjdHMpIC0+XG4gICAgICBsc2NhY2hlLnNldCAncHJvamVjdHMnLCBfLnBsdWNrTWFueSBwcm9qZWN0cywgWyAnb3duZXInLCAnbmFtZScgXVxuICAgICwgJ2luaXQnOiBub1xuXG4gICAgIyBSZXNldCBvdXIgaW5kZXggYW5kIHJlLXNvcnQuXG4gICAgQG9ic2VydmUgJ3NvcnRCeScsIC0+XG4gICAgICAjIFVzZSBwb3AgYXMgUmFjdGl2ZSBpcyBnbGl0Y2h5IHdoZW4gcmVzZXR0aW5nIGFycmF5cy5cbiAgICAgIEBzZXQgJ2luZGV4JywgbnVsbFxuICAgICAgI8KgUnVuIHRoZSBzb3J0IGFnYWluLlxuICAgICAgZG8gQHNvcnRcbiAgICAsICdpbml0Jzogbm8iLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgU3lzdGVtIHN0YXRlLlxuc3lzdGVtID0gbmV3IE1vZGVsXG4gIFxuICAnbmFtZSc6ICdtb2RlbHMvc3lzdGVtJ1xuXG4gICdkYXRhJzpcbiAgICAnbG9hZGluZyc6IG5vXG5cbmNvdW50ZXIgPSAwXG5hc3luYyA9IC0+XG4gIGNvdW50ZXIgKz0gMVxuICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgeWVzXG4gIC0+XG4gICAgY291bnRlciAtPSAxXG4gICAgc3lzdGVtLnNldCAnbG9hZGluZycsICtjb3VudGVyXG5cbm1vZHVsZS5leHBvcnRzID0geyBzeXN0ZW0sIGFzeW5jIH0iLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgQ3VycmVudGx5IGxvZ2dlZC1pbiB1c2VyLlxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvdXNlcidcblxuICAjIERlZmF1bHQgdG8gYSBsb2NhbCB1c2VyLlxuICAnZGF0YSc6XG4gICAgJ3Byb3ZpZGVyJzogIFwibG9jYWxcIlxuICAgICdpZCc6ICAgICAgICBcIjBcIlxuICAgICd1aWQnOiAgICAgICBcImxvY2FsOjBcIlxuICAgICd0b2tlbic6ICAgICBudWxsIiwieyBkMyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGhvcml6b250YWw6IChoZWlnaHQsIHgpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh4KVxuICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxuICAgICAgIyBTaG93IHZlcnRpY2FsIGxpbmVzLi4uXG4gICAgICAudGlja1NpemUoLWhlaWdodClcbiAgICAgICMgLi4ud2l0aCBkYXkgb2YgdGhlIG1vbnRoLi4uXG4gICAgICAudGlja0Zvcm1hdCggKGQpIC0+IGQuZ2V0RGF0ZSgpIClcbiAgICAgICMgLi4uYW5kIGdpdmUgdXMgYSBzcGFjZXIuXG4gICAgICAudGlja1BhZGRpbmcoMTApXG5cbiAgdmVydGljYWw6ICh3aWR0aCwgeSkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHkpXG4gICAgICAub3JpZW50KFwibGVmdFwiKVxuICAgICAgLnRpY2tTaXplKC13aWR0aClcbiAgICAgIC50aWNrcyg1KVxuICAgICAgLnRpY2tQYWRkaW5nKDEwKSIsInsgXywgZDMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEEgZ3JhcGggb2YgY2xvc2VkIGlzc3Vlcy5cbiAgIyBgaXNzdWVzYDogICAgIGlzc3VlcyBsaXN0XG4gICMgYGNyZWF0ZWRfYXRgOiBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGB0b3RhbGA6ICAgIHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBhY3R1YWw6IChpc3N1ZXMsIGNyZWF0ZWRfYXQsIHRvdGFsKSAtPlxuICAgIGhlYWQgPSBbIHtcbiAgICAgICdkYXRlJzogbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICAgJ3BvaW50cyc6IHRvdGFsXG4gICAgfSBdXG4gICAgXG4gICAgbWluID0gK0luZmluaXR5IDsgbWF4ID0gLUluZmluaXR5XG5cbiAgICAjIEdlbmVyYXRlIHRoZSBhY3R1YWwgY2xvc2VzLlxuICAgIHJlc3QgPSBfLm1hcCBpc3N1ZXMsIChpc3N1ZSkgLT5cbiAgICAgIHsgc2l6ZSwgY2xvc2VkX2F0IH0gPSBpc3N1ZVxuICAgICAgIyBEZXRlcm1pbmUgdGhlIHJhbmdlLlxuICAgICAgbWluID0gc2l6ZSBpZiBzaXplIDwgbWluXG4gICAgICBtYXggPSBzaXplIGlmIHNpemUgPiBtYXhcblxuICAgICAgIyBEcm9wcGluZyBwb2ludHMgcmVtYWluaW5nLlxuICAgICAgaXNzdWUuZGF0ZSA9IG5ldyBEYXRlIGNsb3NlZF9hdFxuICAgICAgaXNzdWUucG9pbnRzID0gdG90YWwgLT0gc2l6ZVxuICAgICAgaXNzdWVcbiAgICBcbiAgICAjIE5vdyBhZGQgYSByYWRpdXMgaW4gYSByYW5nZSAod2lsbCBiZSB1c2VkIGZvciBhIGNpcmNsZSkuXG4gICAgcmFuZ2UgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oWyBtaW4sIG1heCBdKS5yYW5nZShbIDUsIDggXSlcblxuICAgIHJlc3QgPSBfLm1hcCByZXN0LCAoaXNzdWUpIC0+XG4gICAgICBpc3N1ZS5yYWRpdXMgPSByYW5nZSBpc3N1ZS5zaXplXG4gICAgICBpc3N1ZVxuXG4gICAgW10uY29uY2F0IGhlYWQsIHJlc3RcblxuICAjIEEgZ3JhcGggb2YgYW4gaWRlYWwgcHJvZ3Jlc3Npb24uLlxuICAjIGBhYDogICBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGBiYDogICBtaWxlc3RvbmUgZW5kIGRhdGVcbiAgIyBgdG90YWxgOiB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgaWRlYWw6IChhLCBiLCB0b3RhbCkgLT5cbiAgICAjIFN3YXA/XG4gICAgWyBiLCBhIF0gPSBbIGEsIGIgXSBpZiBiIDwgYVxuXG4gICAgIyBXZSBzdGFydCBoZXJlIGFkZGluZyBkYXlzIHRvIGBkYC5cbiAgICBbIHksIG0sIGQgXSA9IF8ubWFwIGEubWF0Y2goY29uZmlnLmRhdGEuY2hhcnQuZGF0ZXRpbWUpWzFdLnNwbGl0KCctJyksICh2KSAtPiBwYXJzZUludCB2XG4gICAgIyBXZSB3YW50IHRvIGVuZCBoZXJlLlxuICAgIGN1dG9mZiA9IG5ldyBEYXRlKGIpXG5cbiAgICAjIEdvIHRocm91Z2ggdGhlIGJlZ2lubmluZyB0byB0aGUgZW5kIHNraXBwaW5nIG9mZiBkYXlzLlxuICAgIGRheXMgPSBbXSA7IGxlbmd0aCA9IDBcbiAgICBkbyBvbmNlID0gKGluYyA9IDApIC0+XG4gICAgICAjIEEgbmV3IGRheS5cbiAgICAgIGRheSA9IG5ldyBEYXRlIHksIG0gLSAxLCBkICsgaW5jXG4gICAgICBcbiAgICAgICMgRG9lcyB0aGlzIGRheSBjb3VudD9cbiAgICAgIGRheV9vZiA9IDcgaWYgIWRheV9vZiA9IGRheS5nZXREYXkoKVxuICAgICAgaWYgZGF5X29mIGluIGNvbmZpZy5kYXRhLmNoYXJ0Lm9mZl9kYXlzXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSwgb2ZmX2RheTogeWVzIH1cbiAgICAgIGVsc2VcbiAgICAgICAgbGVuZ3RoICs9IDFcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5IH1cbiAgICAgIFxuICAgICAgIyBHbyBhZ2Fpbj9cbiAgICAgIG9uY2UoaW5jICsgMSkgdW5sZXNzIGRheSA+IGN1dG9mZlxuXG4gICAgIyBNYXAgcG9pbnRzIG9uIHRoZSBhcnJheSBvZiBkYXlzIG5vdy5cbiAgICB2ZWxvY2l0eSA9IHRvdGFsIC8gKGxlbmd0aCAtIDEpXG5cbiAgICBkYXlzID0gXy5tYXAgZGF5cywgKGRheSwgaSkgLT5cbiAgICAgIGRheS5wb2ludHMgPSB0b3RhbFxuICAgICAgdG90YWwgLT0gdmVsb2NpdHkgaWYgZGF5c1tpXSBhbmQgbm90IGRheXNbaV0ub2ZmX2RheVxuICAgICAgZGF5XG5cbiAgICAjIERvIHdlIG5lZWQgdG8gbWFrZSBhIGxpbmsgdG8gcmlnaHQgbm93P1xuICAgIGRheXMucHVzaCB7IGRhdGU6IG5vdywgcG9pbnRzOiAwIH0gaWYgKG5vdyA9IG5ldyBEYXRlKCkpID4gY3V0b2ZmXG5cbiAgICBkYXlzXG5cbiAgIyBHcmFwaCByZXByZXNlbnRpbmcgYSB0cmVuZGxpbmcgb2YgYWN0dWFsIGlzc3Vlcy5cbiAgdHJlbmQ6IChhY3R1YWwsIGNyZWF0ZWRfYXQsIGR1ZV9vbikgLT5cbiAgICByZXR1cm4gW10gdW5sZXNzIGFjdHVhbC5sZW5ndGhcblxuICAgIHN0YXJ0ID0gK2FjdHVhbFswXS5kYXRlXG5cbiAgICAjIFZhbHVlcyBpcyBhIGxpc3Qgb2YgdGltZSBmcm9tIHRoZSBzdGFydCBhbmQgcG9pbnRzIHJlbWFpbmluZy5cbiAgICB2YWx1ZXMgPSBfLm1hcCBhY3R1YWwsICh7IGRhdGUsIHBvaW50cyB9KSAtPlxuICAgICAgWyArZGF0ZSAtIHN0YXJ0LCBwb2ludHMgXVxuXG4gICAgIyBOb3cgaXMgYW4gYWN0dWFsIHBvaW50IHRvby5cbiAgICBsYXN0ID0gYWN0dWFsW2FjdHVhbC5sZW5ndGggLSAxXVxuICAgIHZhbHVlcy5wdXNoIFsgKyBuZXcgRGF0ZSgpIC0gc3RhcnQsIGxhc3QucG9pbnRzIF1cblxuICAgICMgaHR0cDovL2NsYXNzcm9vbS5zeW5vbnltLmNvbS9jYWxjdWxhdGUtdHJlbmRsaW5lLTI3MDkuaHRtbFxuICAgIGIxID0gMCA7IGUgPSAwIDsgYzEgPSAwXG4gICAgYSA9IChsID0gdmFsdWVzLmxlbmd0aCkgKiBfLnJlZHVjZSh2YWx1ZXMsIChzdW0sIFsgYSwgYiBdKSAtPlxuICAgICAgYjEgKz0gYSA7IGUgKz0gYlxuICAgICAgYzEgKz0gTWF0aC5wb3coYSwgMilcbiAgICAgIHN1bSArIChhICogYilcbiAgICAsIDApXG5cbiAgICBzbG9wZSA9IChhIC0gKGIxICogZSkpIC8gKChsICogYzEpIC0gKE1hdGgucG93KGIxLCAyKSkpXG4gICAgaW50ZXJjZXB0ID0gKGUgLSAoc2xvcGUgKiBiMSkpIC8gbFxuICAgIGZuID0gKHgpIC0+IHNsb3BlICogeCArIGludGVyY2VwdFxuXG4gICAgIyBNaWxlc3RvbmUgYWx3YXlzIGhhcyBhIGNyZWF0aW9uIGRhdGUuXG4gICAgY3JlYXRlZF9hdCA9IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAjIER1ZSBkYXRlIGNhbiBiZSBlbXB0eS5cbiAgICBkdWVfb24gPSBpZiBkdWVfb24gdGhlbiBuZXcgRGF0ZShkdWVfb24pIGVsc2UgbmV3IERhdGUoKVxuXG4gICAgYSA9IGNyZWF0ZWRfYXQgLSBzdGFydFxuICAgIGIgPSBkdWVfb24gLSBzdGFydFxuXG4gICAgW1xuICAgICAge1xuICAgICAgICAnZGF0ZSc6IGNyZWF0ZWRfYXRcbiAgICAgICAgJ3BvaW50cyc6IGZuKGEpXG4gICAgICB9LCB7XG4gICAgICAgICdkYXRlJzogZHVlX29uXG4gICAgICAgICdwb2ludHMnOiBmbihiKVxuICAgICAgfVxuICAgIF0iLCJ7IF8sIGFzeW5jIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG4jIS91c3IvYmluL2VudiBjb2ZmZWVcbmNvbmZpZyAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBpc3N1ZXMgZm9yIGEgbWlsZXN0b25lLlxuICBmZXRjaEFsbDogKHJlcG8sIGNiKSAtPlxuICAgICMgQ2FsY3VsYXRlIHNpemUgb2YgZWl0aGVyIG9wZW4gb3IgY2xvc2VkIGlzc3Vlcy5cbiAgICAjIE1vZGlmaWVzIGlzc3VlcyBieSByZWYuXG4gICAgY2FsY1NpemUgPSAobGlzdCwgY2IpIC0+XG4gICAgICBzd2l0Y2ggY29uZmlnLmRhdGEuY2hhcnQucG9pbnRzXG4gICAgICAgIHdoZW4gJ09ORV9TSVpFJ1xuICAgICAgICAgIHNpemUgPSBsaXN0Lmxlbmd0aFxuXG4gICAgICAgICAgKCBpc3N1ZS5zaXplID0gMSBmb3IgaXNzdWUgaW4gbGlzdCApXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuICAgICAgICBcbiAgICAgICAgd2hlbiAnTEFCRUxTJ1xuICAgICAgICAgIHNpemUgPSAwXG5cbiAgICAgICAgICBsaXN0ID0gXy5maWx0ZXIgbGlzdCwgKGlzc3VlKSAtPlxuICAgICAgICAgICAgIyBTa2lwIGlmIG5vIGxhYmVscyBleGlzdC5cbiAgICAgICAgICAgIHJldHVybiBubyB1bmxlc3MgbGFiZWxzID0gaXNzdWUubGFiZWxzXG5cbiAgICAgICAgICAgICMgRGV0ZXJtaW5lIHRoZSB0b3RhbCBpc3N1ZSBzaXplIGZyb20gYWxsIGxhYmVscy5cbiAgICAgICAgICAgIGlzc3VlLnNpemUgPSBfLnJlZHVjZSBsYWJlbHMsIChzdW0sIGxhYmVsKSAtPlxuICAgICAgICAgICAgICAjIE5vdCBtYXRjaGluZy5cbiAgICAgICAgICAgICAgcmV0dXJuIHN1bSB1bmxlc3MgbWF0Y2hlcyA9IGxhYmVsLm5hbWUubWF0Y2ggY29uZmlnLmRhdGEuY2hhcnQuc2l6ZV9sYWJlbFxuICAgICAgICAgICAgICAjIEluY3JlYXNlIHN1bS5cbiAgICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEluY3JlYXNlIHRoZSB0b3RhbC5cbiAgICAgICAgICAgIHNpemUgKz0gaXNzdWUuc2l6ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFyZSB3ZSBzYXZpbmcgaXQ/XG4gICAgICAgICAgICAhIWlzc3VlLnNpemVcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG5cbiAgICAjIEZvciBlYWNoIHN0YXRlLi4uXG4gICAgb25lU3RhdHVzID0gKHN0YXRlLCBjYikgLT5cbiAgICAgICMgQ29uY2F0IHRoZW0gaGVyZS5cbiAgICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgICAjIE9uZSBwYWdlZnVsIGZldGNoIChuZXh0IHBhZ2VzIGluIHNlcmllcykuXG4gICAgICBkbyBmZXRjaFBhZ2UgPSAocGFnZT0xKSAtPlxuICAgICAgICByZXF1ZXN0LmFsbElzc3VlcyByZXBvLCB7IHN0YXRlLCBwYWdlIH0sIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgIyBFcnJvcnM/XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICAjIEVtcHR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICAgICAgICMgQ29uY2F0IHNvcnRlZCAoYXBpIGRvZXMgbm90IHNvcnQgb24gY2xvc2VkX2F0ISkuXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IF8uc29ydEJ5IGRhdGEsICdjbG9zZWRfYXQnXG4gICAgICAgICAgIyA8IDEwMCByZXN1bHRzP1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIGlmIGRhdGEubGVuZ3RoIDwgMTAwXG4gICAgICAgICAgIyBGZXRjaCB0aGUgbmV4dCBwYWdlIHRoZW4uXG4gICAgICAgICAgZmV0Y2hQYWdlIHBhZ2UgKyAxXG5cbiAgICAjIEZvciBlYWNoIGBvcGVuYCBhbmQgYGNsb3NlZGAgaXNzdWVzIGluIHBhcmFsbGVsLlxuICAgIGFzeW5jLnBhcmFsbGVsIFtcbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ29wZW4nKSwgICBjYWxjU2l6ZSBdXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdjbG9zZWQnKSwgY2FsY1NpemUgXVxuICAgIF0sIChlcnIsIFsgb3BlbiwgY2xvc2VkIF0pIC0+XG4gICAgICBjYiBlcnIsIHsgb3BlbiwgY2xvc2VkIH0iLCIjIS91c3IvYmluL2VudiBjb2ZmZWVcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBhIG1pbGVzdG9uZS5cbiAgJ2ZldGNoJzogcmVxdWVzdC5vbmVNaWxlc3RvbmVcblxuICAjIEZldGNoIGFsbCBtaWxlc3RvbmVzLlxuICAnZmV0Y2hBbGwnOiByZXF1ZXN0LmFsbE1pbGVzdG9uZXNcblxuICAgICMgIyBHZXQgdGhlIGN1cnJlbnQgbWlsZXN0b25lIG91dCBvZiBtYW55LlxuICAgICMgZWxzZVxuICAgICMgICByZXF1ZXN0LmFsbE1pbGVzdG9uZXMgcmVwbywgKGVyciwgZGF0YSkgLT5cbiAgICAjICAgICAjIEVycm9ycz9cbiAgICAjICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICMgICAgICMgRW1wdHkgd2FybmluZz9cbiAgICAjICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBvcGVuIG1pbGVzdG9uZXMgZm9yIHJlcG8gI3tyZXBvLnBhdGh9XCIgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC5cbiAgICAjICAgICBtID0gZGF0YVswXVxuICAgICMgICAgICMgRmlsdGVyIG1pbGVzdG9uZXMgd2l0aG91dCBkdWUgZGF0ZS5cbiAgICAjICAgICBtID0gXy5yZXN0IGRhdGEsIHsgJ2R1ZV9vbicgOiBudWxsIH1cbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LiBQcmVmZXIgbWlsZXN0b25lcyB3aXRoIGR1ZSBkYXRlcy5cbiAgICAjICAgICBtID0gaWYgbVswXSB0aGVuIG1bMF0gZWxzZSBkYXRhWzBdXG4gICAgIyAgICAgIyBFbXB0eSBtaWxlc3RvbmU/XG4gICAgIyAgICAgaWYgbS5vcGVuX2lzc3VlcyArIG0uY2xvc2VkX2lzc3VlcyBpcyAwXG4gICAgIyAgICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBpc3N1ZXMgZm9yIG1pbGVzdG9uZSBgI3ttLnRpdGxlfWBcIlxuXG4gICAgIyAgICAgY2IgbnVsbCwgbnVsbCwgbSIsInsgXywgU3VwZXJBZ2VudCB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxudXNlciA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcblxuIyBDdXN0b20gSlNPTiBwYXJzZXIuXG5TdXBlckFnZW50LnBhcnNlID1cbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiAocmVzKSAtPlxuICAgIHRyeVxuICAgICAgSlNPTi5wYXJzZSByZXNcbiAgICBjYXRjaCBlXG4gICAgICB7fSAjIGl0IHdhcyBub3QgdG8gYmUuLi5cblxuIyBEZWZhdWx0IGFyZ3MuXG5kZWZhdWx0cyA9XG4gICdnaXRodWInOlxuICAgICdob3N0JzogJ2FwaS5naXRodWIuY29tJ1xuICAgICdwcm90b2NvbCc6ICdodHRwcydcblxuIyBQdWJsaWMgYXBpLlxubW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgIyBHZXQgYSByZXBvLlxuICByZXBvOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfVwiXG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIG9wZW4gbWlsZXN0b25lcy5cbiAgYWxsTWlsZXN0b25lczogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+IFxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXNcIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcbiAgXG4gICMgR2V0IG9uZSBvcGVuIG1pbGVzdG9uZS5cbiAgb25lTWlsZXN0b25lOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lcy8je21pbGVzdG9uZX1cIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgaXNzdWVzIGZvciBhIHN0YXRlLlxuICBhbGxJc3N1ZXM6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgcXVlcnksIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vaXNzdWVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIF8uZXh0ZW5kIHF1ZXJ5LCB7IG1pbGVzdG9uZSwgJ3Blcl9wYWdlJzogJzEwMCcgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4jIE1ha2UgYSByZXF1ZXN0IHVzaW5nIFN1cGVyQWdlbnQuXG5yZXF1ZXN0ID0gKHsgcHJvdG9jb2wsIGhvc3QsIHBhdGgsIHF1ZXJ5LCBoZWFkZXJzIH0sIGNiKSAtPlxuICBleGl0ZWQgPSBub1xuXG4gICMgTWFrZSB0aGUgcXVlcnkgcGFyYW1zLlxuICBxID0gaWYgcXVlcnkgdGhlbiAnPycgKyAoIFwiI3trfT0je3Z9XCIgZm9yIGssIHYgb2YgcXVlcnkgKS5qb2luKCcmJykgZWxzZSAnJ1xuXG4gICMgVGhlIFVSSS5cbiAgcmVxID0gU3VwZXJBZ2VudC5nZXQoXCIje3Byb3RvY29sfTovLyN7aG9zdH0je3BhdGh9I3txfVwiKVxuICAjIEFkZCBoZWFkZXJzLlxuICAoIHJlcS5zZXQoaywgdikgZm9yIGssIHYgb2YgaGVhZGVycyApXG4gIFxuICAjIFRpbWVvdXQgZm9yIHJlcXVlc3RzIHRoYXQgZG8gbm90IGZpbmlzaC4uLiBzZWUgIzMyLlxuICB0aW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNiICdSZXF1ZXN0IGhhcyB0aW1lZCBvdXQnXG4gICwgMWU0ICMgZ2l2ZSB1cyAxMHNcblxuICAjIFNlbmQuXG4gIHJlcS5lbmQgKGVyciwgZGF0YSkgLT5cbiAgICAjIEFycml2ZWQgdG9vIGxhdGUuXG4gICAgcmV0dXJuIGlmIGV4aXRlZFxuICAgICMgQWxsIGZpbmUuXG4gICAgZXhpdGVkID0geWVzXG4gICAgY2xlYXJUaW1lb3V0IHRpbWVvdXRcbiAgICAjIEFjdHVhbGx5IHByb2Nlc3MgdGhlIHJlc3BvbnNlLlxuICAgIHJlc3BvbnNlIGVyciwgZGF0YSwgY2JcblxuIyBIb3cgZG8gd2UgcmVzcG9uZCB0byBhIHJlc3BvbnNlP1xucmVzcG9uc2UgPSAoZXJyLCBkYXRhLCBjYikgLT5cbiAgcmV0dXJuIGNiIGVycm9yIGVyciBpZiBlcnJcbiAgIyAyeHg/XG4gIGlmIGRhdGEuc3RhdHVzVHlwZSBpc250IDJcbiAgICAjIERvIHdlIGhhdmUgYSBtZXNzYWdlIGZyb20gR2l0SHViP1xuICAgIHJldHVybiBjYiBkYXRhLmJvZHkubWVzc2FnZSBpZiBkYXRhPy5ib2R5Py5tZXNzYWdlP1xuICAgICMgVXNlIFNBIG9uZS5cbiAgICByZXR1cm4gY2IgZGF0YS5lcnJvci5tZXNzYWdlXG4gICMgQWxsIGdvb2QuXG4gIGNiIG51bGwsIGRhdGEuYm9keVxuXG4jIEdpdmUgdXMgaGVhZGVycy5cbmhlYWRlcnMgPSAodG9rZW4pIC0+XG4gICMgVGhlIGRlZmF1bHRzLlxuICBoID1cbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzJ1xuICAjIEFkZCB0b2tlbj9cbiAgaC5BdXRob3JpemF0aW9uID0gXCJ0b2tlbiAje3Rva2VufVwiIGlmIHRva2VuP1xuICBoXG5cbmlzVmFsaWQgPSAob2JqKSAtPlxuICBydWxlcyA9XG4gICAgJ293bmVyJzogICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbmFtZSc6ICAgICAgKHZhbCkgLT4gdmFsP1xuICAgICdtaWxlc3RvbmUnOiAodmFsKSAtPiBfLmlzSW50IHZhbFxuICBcbiAgKCByZXR1cm4gbm8gZm9yIGtleSwgdmFsIG9mIG9iaiB3aGVuIGtleSBvZiBydWxlcyBhbmQgbm90IHJ1bGVzW2tleV0odmFsKSApXG5cbiAgeWVzXG5cbiMgU3dpdGNoIHdoZW4gdXNlciBpcyByZWFkeS5cbmlzUmVhZHkgPSB1c2VyLmRhdGEucmVhZHlcblxuIyBBIHN0YWNrIG9mIHJlcXVlc3RzIHRvIGV4ZWN1dGUgb25jZSByZWFkeS5cbnN0YWNrID0gW11cbnJlYWR5ID0gKGNiKSAtPlxuICBpZiBpc1JlYWR5IHRoZW4gZG8gY2IgZWxzZSBzdGFjay5wdXNoIGNiXG5cbiMgT2JzZXJ2ZSB1c2VyJ3MgcmVhZGluZXNzLlxudXNlci5vYnNlcnZlICdyZWFkeScsICh2YWwpIC0+XG4gIGlzUmVhZHkgPSB2YWxcbiAgIyBDbGVhciB0aGUgc3RhY2s/XG4gICggZG8gc3RhY2suc2hpZnQoKSB3aGlsZSBzdGFjay5sZW5ndGggKSBpZiB2YWxcblxuIyBQYXJzZSBhbiBlcnJvci5cbmVycm9yID0gKGVycikgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBfLmlzU3RyaW5nIGVyclxuICAgICAgbWVzc2FnZSA9IGVyclxuICAgIHdoZW4gXy5pc0FycmF5IGVyclxuICAgICAgbWVzc2FnZSA9IGVyclsxXVxuICAgIHdoZW4gXy5pc09iamVjdChlcnIpIGFuZCBfLmlzU3RyaW5nKGVyci5tZXNzYWdlKVxuICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG5cbiAgdW5sZXNzIG1lc3NhZ2VcbiAgICB0cnlcbiAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSBlcnJcbiAgICBjYXRjaFxuICAgICAgbWVzc2FnZSA9IGRvIGVyci50b1N0cmluZ1xuXG4gIG1lc3NhZ2UiLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuTWVkaWF0b3IgPSBSYWN0aXZlLmV4dGVuZCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNZWRpYXRvcigpIiwieyBfLCBkaXJlY3RvciB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4vbWVkaWF0b3IuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcblxuZWwgPSAnI3BhZ2UnXG5cbnBhZ2VzID1cbiAgXCJpbmRleFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvaW5kZXguY29mZmVlXCJcbiAgXCJtaWxlc3RvbmVcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL21pbGVzdG9uZS5jb2ZmZWVcIlxuICBcIm5ld1wiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbmV3LmNvZmZlZVwiXG4gIFwicHJvamVjdFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvcHJvamVjdC5jb2ZmZWVcIlxuXG4jIEFkZCBhIHByb2plY3QgZnJvbSBhIHJvdXRlLlxuYWRkUHJvamVjdCA9IChwYWdlLCBvd25lciwgbmFtZSkgLT5cbiAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfVxuXG4jIFByZWFwcGx5IGFsbCBmdW5jdGlvbnMgd2l0aCBvdXIgcGFnZSBuYW1lL2NvbnRleHQuXG5jID0gKG5hbWUsIGZucz1bXSkgLT5cbiAgKCBfLnBhcnRpYWwgZm4sIG5hbWUgZm9yIGZuIGluIGZucyApXG5cbnZpZXcgPSBudWxsXG5yb3V0ZSA9IChwYWdlLCBhcmdzLi4uKSAtPlxuICAjIFVucmVuZGVyIHRoZSBwcmV2aW91cyBvbmUuXG4gIGRvIHZpZXc/LnRlYXJkb3duXG4gICMgSGlkZSBhbnkgbm90aWZpY2F0aW9ucy5cbiAgbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnkvaGlkZSdcbiAgIyBSZXF1aXJlIHRoZSBuZXcgb25lLlxuICBQYWdlID0gcGFnZXNbcGFnZV1cbiAgIyBSZW5kZXIgaXQuXG4gIHZpZXcgPSBuZXcgUGFnZSB7IGVsLCAnZGF0YSc6IHsgJ3JvdXRlJzogYXJncyB9IH1cblxucm91dGVzID1cbiAgJy8nOiAgICAgICAgICAgICAgICAgICAgICAgIGMgJ2luZGV4JywgWyByb3V0ZSBdXG4gICcvbmV3L3Byb2plY3QnOiAgICAgICAgICAgICBjICduZXcnLCAgIFsgcm91dGUgXVxuICAjIFRoZSBmb2xsb3dpbmcgdHdvIHJvdXRlcyBhZGQgYSBwcm9qZWN0IGluIHRoZSBiYWNrZ3JvdW5kLlxuICAnLzpvd25lci86bmFtZSc6ICAgICAgICAgICAgYyAncHJvamVjdCcsICAgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICcvOm93bmVyLzpuYW1lLzptaWxlc3RvbmUnOiBjICdtaWxlc3RvbmUnLCBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgIyBUT0RPOiByZW1vdmUgaW4gcHJvZHVjdGlvbi5cbiAgJy9yZXNldCc6IC0+XG4gICAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2NsZWFyJ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiMgRmxhdGlyb24gRGlyZWN0b3Igcm91dGVyLlxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3Rvci5Sb3V0ZXIocm91dGVzKS5jb25maWd1cmVcbiAgJ3N0cmljdCc6IG5vICMgYWxsb3cgdHJhaWxpbmcgc2xhc2hlc1xuICBub3Rmb3VuZDogLT5cbiAgICB0aHJvdyA0MDQiLCJ7IG1vbWVudCB9ICA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuIyBQcm9ncmVzcyBpbiAlLlxucHJvZ3Jlc3MgPSAoYSwgYikgLT4gMTAwICogKGEgLyAoYiArIGEpKVxuXG4jIENhbGN1bGF0ZSB0aGUgc3RhdHMgZm9yIGEgbWlsZXN0b25lLlxuIyAgSXMgaXQgb24gdGltZT8gV2hhdCBpcyB0aGUgcHJvZ3Jlc3M/XG5tb2R1bGUuZXhwb3J0cyA9IChtaWxlc3RvbmUpIC0+XG4gICAgaXNEb25lID0gbm8gOyBpc09uVGltZSA9IHllcyA7IGlzT3ZlcmR1ZSA9IG5vXG5cbiAgICAjIFByb2dyZXNzIGluIHBvaW50cy5cbiAgICBwb2ludHMgPSBwcm9ncmVzcyBtaWxlc3RvbmUuaXNzdWVzLmNsb3NlZC5zaXplLCBtaWxlc3RvbmUuaXNzdWVzLm9wZW4uc2l6ZSAgICBcbiAgICBpc0RvbmUgPSB5ZXMgaWYgcG9pbnRzIGlzIDEwMFxuXG4gICAgIyBNaWxlc3RvbmVzIHdpdGggbm8gZHVlIGRhdGUgYXJlIGFsd2F5cyBvbiB0cmFjay5cbiAgICByZXR1cm4geyBpc092ZXJkdWUsIGlzT25UaW1lLCBpc0RvbmUsICdwcm9ncmVzcyc6IHsgcG9pbnRzIH0gfSB1bmxlc3MgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgYSA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuY3JlYXRlZF9hdFxuICAgIGIgPSArbmV3IERhdGVcbiAgICBjID0gK25ldyBEYXRlIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgT3ZlcmR1ZT9cbiAgICBpc092ZXJkdWUgPSB5ZXMgaWYgYiA+IGNcblxuICAgICMgUHJvZ3Jlc3MgaW4gdGltZS5cbiAgICB0aW1lID0gcHJvZ3Jlc3MgYiAtIGEsIGMgLSBiXG5cbiAgICAjIEhvdyBtYW55IGRheXMgaXMgMSUgb2YgdGhlIHRpbWU/XG4gICAgZGF5cyA9IChtb21lbnQoYikuZGlmZihtb21lbnQoYSksICdkYXlzJykpIC8gMTAwXG5cbiAgICAjIEFyZSB3ZSBvbiB0aW1lP1xuICAgIGlzT25UaW1lID0gcG9pbnRzID4gdGltZVxuXG4gICAge1xuICAgICAgaXNEb25lLCBkYXlzLCBpc09uVGltZSwgaXNPdmVyZHVlXG4gICAgICAncHJvZ3Jlc3MnOiB7IHBvaW50cywgdGltZSB9XG4gICAgfSIsIiMgQWxsIG91ciB2ZW5kb3IgZGVwZW5kZW5jaWVzIGluIG9uZSBwbGFjZS5cbm1vZHVsZS5leHBvcnRzID1cbiAgJ18nOiB3aW5kb3cuX1xuICAnUmFjdGl2ZSc6IHdpbmRvdy5SYWN0aXZlXG4gICdGaXJlYmFzZSc6IHdpbmRvdy5GaXJlYmFzZVxuICAnRmlyZWJhc2VTaW1wbGVMb2dpbic6IHdpbmRvdy5GaXJlYmFzZVNpbXBsZUxvZ2luXG4gICdTdXBlckFnZW50Jzogd2luZG93LnN1cGVyYWdlbnRcbiAgJ2FzeW5jJzogd2luZG93LmFzeW5jXG4gICdtb21lbnQnOiB3aW5kb3cubW9tZW50XG4gICdkMyc6IHdpbmRvdy5kM1xuICAnbWFya2VkJzogd2luZG93Lm1hcmtlZFxuICAnZGlyZWN0b3InOlxuICAgICdSb3V0ZXInOiB3aW5kb3cuUm91dGVyXG4gICdsc2NhY2hlJzogd2luZG93LmxzY2FjaGVcbiAgJ3NvcnRlZEluZGV4Q21wJzogd2luZG93LnNvcnRlZEluZGV4XG4gICdzZW12ZXInOiByZXF1aXJlICdzZW12ZXInIiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFwcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJOb3RpZnlcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJIZWFkZXJcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicGFnZVwifSxcImZcIjpbXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOltcIiZjb3B5OyAyMDEyLTIwMTQgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiaHR0cDovL2Nsb3VkZmkucmVcIn0sXCJmXCI6W1wiQ2xvdWRmaXJlIFN5c3RlbXNcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY2hhcnRcIn19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVhZFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTMsXCJyXCI6XCJ1c2VyXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicmlnaHRcIn0sXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcImRpc3BsYXlOYW1lXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwiZGlzcGxheU5hbWVcIn0sXCIgbG9nZ2VkIGluXCJdfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcImdpdGh1YlwifSxcInZcIjp7XCJjbGlja1wiOlwiIWxvZ2luXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiZ2l0aHViXCJ9fSxcIiBTaWduIEluXCJdfV0sXCJyXCI6XCJkaXNwbGF5TmFtZVwifV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJpZFwiOlwiaWNvblwiLFwiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ1bFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIGEgUHJvamVjdFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJmYXFcIn0sXCJmXCI6W1wiRkFRXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI3Jlc2V0XCJ9LFwiZlwiOltcIkRCIFJlc2V0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25vdGlmeVwifSxcImZcIjpbXCJOb3RpZnlcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVyb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY29udGVudFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImFkZHJlc3NcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJTZWUgeW91ciBwcm9qZWN0IHByb2dyZXNzXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJOb3Qgc3VyZSB3aGVyZSB0byBzdGFydD8gSnVzdCBhZGQgYSBkZW1vIHJlcG8gdG8gc2VlIGEgY2hhcnQuIFRoZXJlIGFyZSBtYW55IHZhcmlhdGlvbnMgb2YgcGFzc2FnZXMgb2YgTG9yZW0gSXBzdW0gYXZhaWxhYmxlLCBidXQgdGhlIG1ham9yaXR5IGhhdmUgc3VmZmVyZWQgYWx0ZXJhdGlvbiBpbiBzb21lIGZvcm0sIGJ5IGluamVjdGVkIGh1bW91ciwgb3IgcmFuZG9taXNlZCB3b3JkcyB3aGljaCBkb24ndCBsb29rIGV2ZW4gc2xpZ2h0bHkgYmVsaWV2YWJsZS5cIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImN0YVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwicHJpbWFyeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIHlvdXIgcHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNlY29uZGFyeVwifSxcImZcIjpbXCJSZWFkIHRoZSBHdWlkZVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcImNvZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpY29uIFwiLHtcInRcIjoyLFwiclwiOlwiaWNvblwifV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiY29kZVwiXSxcInNcIjpcIlxcXCImI1xcXCIrXzArXFxcIjtcXFwiXCJ9fV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInRleHRcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJzeXN0ZW1cIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn0sXCIgc3lzdGVtXCJdLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJyXCI6XCJ0b3BcIn0sXCIlXCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9XSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJ0b3BcIl0sXCJzXCI6XCItXzBcIn19LFwicHhcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiY2xvc2VcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcImNsb3NlXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dLFwiclwiOlwic3lzdGVtXCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiUHJvamVjdHNcIixcImFcIjp7XCJwcm9qZWN0c1wiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RzXCJ9XX19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkhlcm9cIn1dLFwiclwiOlwicHJvamVjdHMubGlzdFwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS50aXRsZVwiXSxcInNcIjpcIl8wLnRpdGxlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwic3ViXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImFcIjp7XCJjbGFzc1wiOlwiZGVzY3JpcHRpb25cIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kZXNjcmlwdGlvblwiXSxcInNcIjpcIl8wLm1hcmtkb3duKF8xKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiQ2hhcnRcIixcImFcIjp7XCJtaWxlc3RvbmVcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmVcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJBZGQgYSBQcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJUeXBlIGluIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IGFzIHlvdSB3b3VsZCBub3JtYWxseS4gSWYgeW91J2QgbGlrZSB0byBhZGQgYSBwcml2YXRlIEdpdEh1YiBwcm9qZWN0LCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOltcIlNpZ24gSW5cIl19LFwiIGZpcnN0LlwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb3JtXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImlucHV0XCIsXCJhXCI6e1widHlwZVwiOlwidGV4dFwiLFwicGxhY2Vob2xkZXJcIjpcInVzZXIvcmVwb1wiLFwiYXV0b2NvbXBsZXRlXCI6XCJvZmZcIixcInZhbHVlXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfSxcInZcIjp7XCJrZXl1cFwiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJ2XCI6e1wiY2xpY2tcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fSxcImZcIjpbXCJBZGRcIl19XX1dfV19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJyb3V0ZVwiXSxcInNcIjpcIl8wLmpvaW4oXFxcIi9cXFwiKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTWlsZXN0b25lc1wiLFwiYVwiOntcInByb2plY3RcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0XCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInNvcnRcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcInNvcnRCeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInNvcnQtYWxwaGFiZXRcIn19LFwiIFNvcnRlZCBieSBcIix7XCJ0XCI6MixcInJcIjpcInByb2plY3RzLnNvcnRCeVwifV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJNaWxlc3RvbmVzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5pbmRleFwiLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiLlwiXSxcInNcIjpcIntpbmRleDpfMH1cIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4wXCIsXCJwcm9qZWN0cy5saXN0XCJdLFwic1wiOlwie3A6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJ4XCI6e1wiclwiOltcInAub3duZXJcIixcInByb2plY3Qub3duZXJcIixcInAubmFtZVwiLFwicHJvamVjdC5uYW1lXCJdLFwic1wiOlwiXzA9PV8xJiZfMj09XzNcIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4xXCIsXCJwcm9qZWN0Lm1pbGVzdG9uZXNcIl0sXCJzXCI6XCJ7bWlsZXN0b25lOl8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImFcIjp7XCJjbGFzc1wiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc0RvbmVcIixcImZcIjpbXCJkb25lXCJdfV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS50aXRsZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcInN0eWxlXCI6XCJ3aWR0aDoxJVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvZ3Jlc3NcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJwZXJjZW50XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiZHVlIFwiLHtcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzT3ZlcmR1ZVwiLFwiZlwiOltcInJlZFwiXX1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwic29ydFwifSxcInZcIjp7XCJjbGlja1wiOlwic29ydEJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IFwiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdHMuc29ydEJ5XCJ9XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlByb2plY3RzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwiZXJyb3JzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNvbHNwYW5cIjpcIjNcIixcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZXJyb3JcIixcInRpdGxlXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJlcnJvcnNcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCJcXFxcblxcXCIpXCJ9fV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYXR0ZW50aW9uXCJ9fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cHJvamVjdDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInByb2plY3RcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiYVwiOntcImNsYXNzXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzRG9uZVwiLFwiZlwiOltcImRvbmVcIl19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJjbGFzc1wiOlwicmVwb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5udW1iZXJcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUudGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOltcImR1ZSBcIix7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc092ZXJkdWVcIixcImZcIjpbXCJyZWRcIl19XX0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLmlzT25UaW1lXCJdLFwic1wiOlwiKF8wKT9cXFwiZ3JlZW5cXFwiOlxcXCJyZWRcXFwiXCJ9fV0sXCJzdHlsZVwiOltcIndpZHRoOlwiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfV19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImNvZ1wifX0sXCIgRWRpdFwiXX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIG5vdzogLT4gbmV3IERhdGUoKS50b0pTT04oKSIsInsgXywgbW9tZW50LCBtYXJrZWQgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgVGltZSBmcm9tIG5vdy5cbiAgZnJvbU5vdzogXy5tZW1vaXplIChqc29uRGF0ZSkgLT5cbiAgICBtb21lbnQobmV3IERhdGUoanNvbkRhdGUpKS5mcm9tTm93KClcblxuICAjIFdoZW4gaXMgYSBtaWxlc3RvbmUgZHVlP1xuICBkdWU6IChqc29uRGF0ZSkgLT5cbiAgICByZXR1cm4gJyZuYnNwOycgdW5sZXNzIGpzb25EYXRlXG4gICAgWyAnZHVlJywgQGZyb21Ob3cganNvbkRhdGUgXS5qb2luKCcgJylcblxuICAjIE1hcmtkb3duIGZvcm1hdHRpbmcuXG4gIG1hcmtkb3duOiAobWFya3VwKSAtPlxuICAgIG1hcmtlZCBtYXJrdXBcblxuICAjIEZvcm1hdCBtaWxlc3RvbmUgdGl0bGUuXG4gIHRpdGxlOiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbWlsZXN0b25lJykgPiAtMVxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIFsgJ01pbGVzdG9uZScsIHRleHQgXS5qb2luKCcgJylcblxuICAjIEhleCB0byBkZWNpbWFsLlxuICBoZXhUb0RlYzogKGhleCkgLT5cbiAgICBwYXJzZUludCBoZXgsIDE2IiwibW9kdWxlLmV4cG9ydHMgPVxuICBpczogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwudHlwZSBpbiBbICdrZXl1cCcsICdrZXlkb3duJyBdXG5cbiAgaXNFbnRlcjogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwud2hpY2ggaXMgMTMiLCJ7IF8gfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuXy5taXhpblxuICAncGx1Y2tNYW55JzogKHNvdXJjZSwga2V5cykgLT5cbiAgICB0aHJvdyAnYGtleXNgIG5lZWRzIHRvIGJlIGFuIEFycmF5JyB1bmxlc3MgXy5pc0FycmF5IGtleXNcbiAgICBfLm1hcCBzb3VyY2UsIChpdGVtKSAtPlxuICAgICAgb2JqID0ge31cbiAgICAgIF8uZWFjaCBrZXlzLCAoa2V5KSAtPlxuICAgICAgICBvYmpba2V5XSA9IGl0ZW1ba2V5XVxuICAgICAgb2JqXG5cbiAgJ2lzSW50JzogKHZhbCkgLT5cbiAgICBub3QgaXNOYU4odmFsKSBhbmQgcGFyc2VJbnQoTnVtYmVyKHZhbCkpIGlzIHZhbCBhbmQgbm90IGlzTmFOKHBhcnNlSW50KHZhbCwgMTApKSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRzKSAtPlxuICBNb2RlbCA9IFJhY3RpdmUuZXh0ZW5kKG9wdHMpXG4gIG1vZGVsID0gbmV3IE1vZGVsKClcbiAgbW9kZWwucmVuZGVyKClcbiAgbW9kZWwiLCJ7IFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmxpbmVzID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9saW5lcy5jb2ZmZWUnXG5heGVzICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvY2hhcnQuaHRtbCdcblxuICBvbmNvbXBsZXRlOiAtPlxuICAgIG1pbGVzdG9uZSA9IEBkYXRhLm1pbGVzdG9uZVxuICAgIGlzc3VlcyA9IG1pbGVzdG9uZS5pc3N1ZXNcbiAgICAjIFRvdGFsIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIG1pbGVzdG9uZS5cbiAgICB0b3RhbCA9IGlzc3Vlcy5vcGVuLnNpemUgKyBpc3N1ZXMuY2xvc2VkLnNpemVcblxuXG4gICAgIyBBbiBpc3N1ZSBtYXkgaGF2ZSBiZWVuIGNsb3NlZCBiZWZvcmUgdGhlIHN0YXJ0IG9mIGEgbWlsZXN0b25lLlxuICAgIGhlYWQgPSBpc3N1ZXMuY2xvc2VkLmxpc3RbMF0uY2xvc2VkX2F0XG4gICAgaWYgaXNzdWVzLmxlbmd0aCBhbmQgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPiBoZWFkXG4gICAgICAjIFRoaXMgaXMgdGhlIG5ldyBzdGFydC5cbiAgICAgIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID0gaGVhZFxuXG4gICAgIyBBY3R1YWwsIGlkZWFsICYgdHJlbmQgbGluZXMuXG4gICAgYWN0dWFsID0gbGluZXMuYWN0dWFsIGlzc3Vlcy5jbG9zZWQubGlzdCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIHRvdGFsXG4gICAgaWRlYWwgID0gbGluZXMuaWRlYWwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb24sIHRvdGFsXG4gICAgdHJlbmQgID0gbGluZXMudHJlbmQgYWN0dWFsLCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgIyBHZXQgYXZhaWxhYmxlIHNwYWNlLlxuICAgIHsgaGVpZ2h0LCB3aWR0aCB9ID0gZG8gQGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXG4gICAgbWFyZ2luID0geyAndG9wJzogMzAsICdyaWdodCc6IDMwLCAnYm90dG9tJzogNDAsICdsZWZ0JzogNTAgfVxuICAgIHdpZHRoIC09IG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0XG4gICAgaGVpZ2h0IC09IG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tXG5cbiAgICAjIFNjYWxlcy5cbiAgICB4ID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFsgMCwgd2lkdGggXSlcbiAgICB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoWyBoZWlnaHQsIDAgXSlcblxuICAgICMgQXhlcy5cbiAgICB4QXhpcyA9IGF4ZXMuaG9yaXpvbnRhbCBoZWlnaHQsIHhcbiAgICB5QXhpcyA9IGF4ZXMudmVydGljYWwgd2lkdGgsIHlcblxuICAgICMgTGluZSBnZW5lcmF0b3IuXG4gICAgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIilcbiAgICAueCggKGQpIC0+IHgoZC5kYXRlKSApXG4gICAgLnkoIChkKSAtPiB5KGQucG9pbnRzKSApXG5cbiAgICAjIEdldCB0aGUgbWluaW11bSBhbmQgbWF4aW11bSBkYXRlLCBhbmQgaW5pdGlhbCBwb2ludHMuXG4gICAgeC5kb21haW4oWyBpZGVhbFswXS5kYXRlLCBpZGVhbFtpZGVhbC5sZW5ndGggLSAxXS5kYXRlIF0pXG4gICAgeS5kb21haW4oWyAwLCBpZGVhbFswXS5wb2ludHMgXSkubmljZSgpXG5cbiAgICAjIEFkZCBhbiBTVkcgZWxlbWVudCB3aXRoIHRoZSBkZXNpcmVkIGRpbWVuc2lvbnMgYW5kIG1hcmdpbi5cbiAgICBzdmcgPSBkMy5zZWxlY3QodGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcjY2hhcnQnKSkuYXBwZW5kKFwic3ZnXCIpXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxuXG4gICAgIyBBZGQgdGhlIGRheXMgeC1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBkYXlcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbCh4QXhpcylcblxuICAgICMgQWRkIHRoZSBtb250aHMgeC1heGlzLlxuICAgIG0gPSBbXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLFxuICAgICAgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ1xuICAgIF1cblxuICAgIG1BeGlzID0geEF4aXNcbiAgICAub3JpZW50KFwidG9wXCIpXG4gICAgLnRpY2tTaXplKGhlaWdodClcbiAgICAudGlja0Zvcm1hdCggKGQpIC0+IG1bZC5nZXRNb250aCgpXSApXG4gICAgLnRpY2tzKDIpXG4gICAgXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIG1vbnRoXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwobUF4aXMpXG5cbiAgICAjIEFkZCB0aGUgeS1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgIC5jYWxsKHlBeGlzKVxuXG4gICAgIyBBZGQgYSBsaW5lIHNob3dpbmcgd2hlcmUgd2UgYXJlIG5vdy5cbiAgICBzdmcuYXBwZW5kKFwic3ZnOmxpbmVcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXlcIilcbiAgICAuYXR0cihcIngxXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MVwiLCAwKVxuICAgIC5hdHRyKFwieDJcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkyXCIsIGhlaWdodClcblxuICAgICMgQWRkIHRoZSBpZGVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiaWRlYWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwiYmFzaXNcIikoaWRlYWwpKVxuXG4gICAgIyBBZGQgdGhlIHRyZW5kbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRyZW5kbGluZSBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikodHJlbmQpKVxuXG4gICAgIyBBZGQgdGhlIGFjdHVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiYWN0dWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKS55KCAoZCkgLT4geShkLnBvaW50cykgKShhY3R1YWwpKVxuXG4gICAgIyBDb2xsZWN0IHRoZSB0b29sdGlwIGhlcmUuXG4gICAgdG9vbHRpcCA9IGQzLnRpcCgpLmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpLmh0bWwgKHsgbnVtYmVyLCB0aXRsZSB9KSAtPlxuICAgICAgXCIjI3tudW1iZXJ9OiAje3RpdGxlfVwiXG5cbiAgICBzdmcuY2FsbCh0b29sdGlwKVxuXG4gICAgIyBTaG93IHdoZW4gd2UgY2xvc2VkIGFuIGlzc3VlLlxuICAgIHN2Zy5zZWxlY3RBbGwoXCJhLmlzc3VlXCIpXG4gICAgLmRhdGEoYWN0dWFsLnNsaWNlKDEpKSAjIHNraXAgdGhlIHN0YXJ0aW5nIHBvaW50XG4gICAgLmVudGVyKClcbiAgICAjIEEgd3JhcHBpbmcgbGluay5cbiAgICAuYXBwZW5kKCdzdmc6YScpXG4gICAgLmF0dHIoXCJ4bGluazpocmVmXCIsICh7IGh0bWxfdXJsIH0pIC0+IGh0bWxfdXJsIClcbiAgICAuYXR0cihcInhsaW5rOnNob3dcIiwgJ25ldycpXG4gICAgLmFwcGVuZCgnc3ZnOmNpcmNsZScpXG4gICAgLmF0dHIoXCJjeFwiLCAoeyBkYXRlIH0pIC0+IHggZGF0ZSApXG4gICAgLmF0dHIoXCJjeVwiLCAoeyBwb2ludHMgfSkgLT4geSBwb2ludHMgKVxuICAgIC5hdHRyKFwiclwiLCAgKHsgcmFkaXVzIH0pIC0+IDUgKSAjIGZpeGVkIGZvciBub3dcbiAgICAub24oJ21vdXNlb3ZlcicsIHRvb2x0aXAuc2hvdylcbiAgICAub24oJ21vdXNlb3V0JywgdG9vbHRpcC5oaWRlKVxuIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbnsgc3lzdGVtIH0gPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbmZpcmViYXNlICAgPSByZXF1aXJlICcuLi9tb2RlbHMvZmlyZWJhc2UuY29mZmVlJ1xudXNlciAgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy91c2VyLmNvZmZlZSdcbkljb25zICAgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlYWRlcidcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd1c2VyJzogdXNlclxuICAgICMgRGVmYXVsdCBhcHAgaWNvbi5cbiAgICAnaWNvbic6ICdmaXJlLXN0YXRpb24nXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIExvZ2luIHVzZXIuXG4gICAgQG9uICchbG9naW4nLCAtPlxuICAgICAgZmlyZWJhc2UubG9naW4gKGVycikgLT5cbiAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU3dpdGNoIGxvYWRpbmcgaWNvbiB3aXRoIGFwcCBpY29uLlxuICAgIHN5c3RlbS5vYnNlcnZlICdsb2FkaW5nJywgKHlhKSA9PlxuICAgICAgQHNldCAnaWNvbicsIGlmIHlhIHRoZW4gJ3NwaW5uZXIxJyBlbHNlICdmaXJlLXN0YXRpb24nIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVybydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVyby5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5mb3JtYXQgPSByZXF1aXJlICcuLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG4jIEZvbnRlbGxvIGljb24gaGV4IGNvZGVzLlxuY29kZXMgPVxuICAnY29nJzogICAgICAgICAgICdcXGU4MDAnXG4gICdzZWFyY2gnOiAgICAgICAgJ1xcZTgwMSdcbiAgJ2dpdGh1Yic6ICAgICAgICAnXFxlODAyJ1xuICAnYWRkcmVzcyc6ICAgICAgICdcXGU4MDMnXG4gICdwbHVzLWNpcmNsZWQnOiAgJ1xcZTgwNCdcbiAgJ2ZpcmUtc3RhdGlvbic6ICAnXFxlODA1J1xuICAnc29ydC1hbHBoYWJldCc6ICdcXGU4MDYnXG4gICdkb3duLW9wZW4nOiAgICAgJ1xcZTgwNydcbiAgJ3NwaW42JzogICAgICAgICAnXFxlODA4J1xuICAnbWVnYXBob25lJzogICAgICdcXGU4MDknXG4gICdzcGluNCc6ICAgICAgICAgJ1xcZTgwYSdcbiAgJ3NwaW5uZXIxJzogICAgICAnXFxlODBiJ1xuICAnYXR0ZW50aW9uJzogICAgICdcXGU4MGMnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9pY29ucydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaWNvbnMuaHRtbCdcblxuICAnaXNvbGF0ZWQnOiB5ZXNcblxuICBvbnJlbmRlcjogLT5cbiAgICBAb2JzZXJ2ZSAnaWNvbicsIChpY29uKSAtPlxuICAgICAgaWYgaWNvbiBhbmQgaGV4ID0gY29kZXNbaWNvbl1cbiAgICAgICAgQHNldCAnY29kZScsIGZvcm1hdC5oZXhUb0RlYyBoZXhcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCAnY29kZScsIG51bGwiLCJ7IF8sIFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5IRUlHSFQgPSA2OCAjIGhlaWdodCBvZiBkaXYgaW4gcHhcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL25vdGlmeSdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd0b3AnOiBIRUlHSFRcbiAgICAnaGlkZGVuJzogeWVzXG4gICAgJ2RlZmF1bHRzJzpcbiAgICAgICd0ZXh0JzogJydcbiAgICAgICd0eXBlJzogJycgIyBibGFuZCBncmV5IHN0eWxlXG4gICAgICAnc3lzdGVtJzogbm9cbiAgICAgICdpY29uJzogJ21lZ2FwaG9uZSdcbiAgICAgICd0dGwnOiAgNWUzXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICAjIFNob3cgYSBub3RpZmljYXRpb24uXG4gIHNob3c6IChvcHRzKSAtPlxuICAgIEBzZXQgJ2hpZGRlbicsIG5vICAgIFxuICAgICMgU2V0IHRoZSBvcHRzLlxuICAgIEBzZXQgb3B0cyA9IF8uZGVmYXVsdHMgb3B0cywgQGRhdGEuZGVmYXVsdHNcbiAgICAjIFdoaWNoIHBvc2l0aW9uIHRvIHNsaWRlIHRvP1xuICAgIHBvcyA9IFsgMCwgNTAgXVsgK29wdHMuc3lzdGVtIF0gIyAwcHggb3IgNTAlIGZyb20gdG9wXG4gICAgIyBTbGlkZSBpbnRvIHZpZXcuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIHBvcyxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdib3VuY2UnKVxuICAgICAgJ2R1cmF0aW9uJzogODAwXG4gICAgXG4gICAgIyBJZiBubyB0dGwgdGhlbiBzaG93IHBlcm1hbmVudGx5LlxuICAgIHJldHVybiB1bmxlc3Mgb3B0cy50dGxcblxuICAgICMgU2xpZGUgb3V0IG9mIHRoZSB2aWV3LlxuICAgIF8uZGVsYXkgXy5iaW5kKEBoaWRlLCBAKSwgb3B0cy50dGxcblxuICAjIEhpZGUgYSBub3RpZmljYXRpb24uXG4gIGhpZGU6IC0+XG4gICAgcmV0dXJuIGlmIEBkYXRhLmhpZGRlblxuICAgIEBzZXQgJ2hpZGRlbicsIHllc1xuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIEhFSUdIVCxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdiYWNrJylcbiAgICAgICdjb21wbGV0ZSc6ID0+XG4gICAgICAgICMgUmVzZXQgdGhlIHRleHQgd2hlbiBhbGwgaXMgZG9uZS5cbiAgICAgICAgQHNldCAndGV4dCcsIG51bGxcbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgT24gb3V0c2lkZSBtZXNzYWdlcy5cbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnknLCBfLmJpbmQgQHNob3csIEBcbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnkvaGlkZScsIF8uYmluZCBAaGlkZSwgQFxuXG4gICAgIyBDbG9zZSB1cyBwcmVtYXR1cmVseS4uLlxuICAgIEBvbiAnY2xvc2UnLCBAaGlkZSIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuSGVybyAgICAgPSByZXF1aXJlICcuLi9oZXJvLmNvZmZlZSdcblByb2plY3RzID0gcmVxdWlyZSAnLi4vdGFibGVzL3Byb2plY3RzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2luZGV4J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBIZXJvLCBQcm9qZWN0cyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQnVybmNoYXJ0OiBHaXRIdWIgQnVybmRvd24gQ2hhcnQgYXMgYSBTZXJ2aWNlJ1xuXG4gICAgIyBRdWl0IGlmIHdlIGhhdmUgbm8gcHJvamVjdHMuXG4gICAgcmV0dXJuIEBzZXQoJ3JlYWR5JywgeWVzKSB1bmxlc3MgcHJvamVjdHMubGlzdC5sZW5ndGhcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgRm9yIGFsbCBwcm9qZWN0cy5cbiAgICBhc3luYy5tYXAgcHJvamVjdHMuZGF0YS5saXN0LCAocHJvamVjdCwgY2IpIC0+XG4gICAgICAjIEZldGNoIHRoZWlyIG1pbGVzdG9uZXMuXG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIChlcnIsIGxpc3QpIC0+XG4gICAgICAgICMgU2F2ZSB0aGUgZXJyb3IgaWYgcHJvamVjdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICMgTm93IGFkZCBpbiB0aGUgaXNzdWVzLlxuICAgICAgICBhc3luYy5lYWNoIGxpc3QsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsIGlmIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsICh7IG51bWJlciB9KSAtPlxuICAgICAgICAgICAgbWlsZXN0b25lLm51bWJlciBpcyBudW1iZXJcbiAgICAgICAgICBcbiAgICAgICAgICAjIE9LIGZldGNoIGFsbCB0aGUgaXNzdWVzIGZvciB0aGlzIG1pbGVzdG9uZSB0aGVuLlxuICAgICAgICAgIGlzc3Vlcy5mZXRjaEFsbFxuICAgICAgICAgICAgJ293bmVyJzogcHJvamVjdC5vd25lclxuICAgICAgICAgICAgJ25hbWUnOiBwcm9qZWN0Lm5hbWVcbiAgICAgICAgICAgICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICAgLCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgICAjIFNhdmUgYW55IGVycm9ycyBvbiB0aGUgcHJvamVjdC5cbiAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICAgICAjIEFkZCBpbiB0aGUgaXNzdWVzIHRvIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBtaWxlc3RvbmVcbiAgICAgICAgICAgICMgRG9uZVxuICAgICAgICAgICAgZG8gY2JcbiAgICAgICAgXG4gICAgICAgICwgY2JcblxuICAgICwgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5DaGFydCA9IHJlcXVpcmUgJy4uL2NoYXJ0LmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbmZvcm1hdCAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBDaGFydCB9XG5cbiAgJ2RhdGEnOlxuICAgICdmb3JtYXQnOiBmb3JtYXRcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSBdID0gQGdldCAncm91dGUnXG4gIFxuICAgIG1pbGVzdG9uZSA9IHBhcnNlSW50IG1pbGVzdG9uZVxuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX0vI3ttaWxlc3RvbmV9XCJcblxuICAgICMgR2V0IHRoZSBhc3NvY2lhdGVkIHByb2plY3QuXG4gICAgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICBvYmogPSBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCB7ICdudW1iZXInOiBtaWxlc3RvbmUgfVxuICAgIHJldHVybiBAc2V0IHsgJ21pbGVzdG9uZSc6IG9iaiwgJ3JlYWR5JzogeWVzIH0gaWYgb2JqP1xuXG4gICAgIyBXZSBhcmUgbG9hZGluZyB0aGUgbWlsZXN0b25lcyB0aGVuLlxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgIGZldGNoTWlsZXN0b25lID0gKGNiKSAtPlxuICAgICAgbWlsZXN0b25lcy5mZXRjaCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGRhdGEsIGNiKSAtPlxuICAgICAgaXNzdWVzLmZldGNoQWxsIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCAoZXJyLCBvYmopIC0+XG4gICAgICAgIGNiIGVyciwgXy5leHRlbmQgZGF0YSwgeyAnaXNzdWVzJzogb2JqIH1cblxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEdldCB0aGUgbWlsZXN0b25lLlxuICAgICAgZmV0Y2hNaWxlc3RvbmUsXG4gICAgICAjIFRoZW4gYWxsIGl0cyBpc3N1ZXMuXG4gICAgICBmZXRjaElzc3Vlc1xuICAgIF0sIChlcnIsIGRhdGEpID0+XG4gICAgICBkbyBkb25lXG4gICAgICByZXR1cm4gbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBkYXRhXG5cbiAgICAgICMgU2hvdyB0aGUgcGFnZS5cbiAgICAgIEBzZXRcbiAgICAgICAgJ21pbGVzdG9uZSc6IGRhdGFcbiAgICAgICAgJ3JlYWR5JzogeWVzIiwieyBfLCBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5rZXkgICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2tleS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9uZXcnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL25ldy5odG1sJ1xuXG4gICdkYXRhJzogeyAndmFsdWUnOiAncmFkZWtzdGVwYW4vZGlzcG9zYWJsZScsIHVzZXIgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICAjIExpc3RlbiB0byBFbnRlciBrZXlwcmVzcyBvciBTdWJtaXQgYnV0dG9uIGNsaWNrLlxuICBzdWJtaXQ6IChldnQsIHZhbHVlKSAtPlxuICAgIHJldHVybiBpZiBrZXkuaXMoZXZ0KSBhbmQgbm90IGtleS5pc0VudGVyKGV2dClcblxuICAgIFsgb3duZXIsIG5hbWUgXSA9IHZhbHVlLnNwbGl0KCcvJylcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgU2F2ZSByZXBvLlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH0sIChlcnIpIC0+XG4gICAgICBkbyBkb25lXG5cbiAgICAgIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5JyxcbiAgICAgICAgJ3RleHQnOiBlcnIgb3IgXCJQcm9qZWN0ICN7dmFsdWV9IHNhdmVkLlwiXG4gICAgICAgICd0eXBlJzogaWYgZXJyIHRoZW4gJ2Vycm9yJyBlbHNlICdzdWNjZXNzJ1xuXG4gICAgICAjIFJlZGlyZWN0IHRvIHRoZSBkYXNoYm9hcmQuXG4gICAgICAjIFRPRE86IHRyaWdnZXIgYSBuYW1lZCByb3V0ZVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdBZGQgYSBuZXcgcHJvamVjdCdcblxuICAgICMgVE9ETzogYXV0b2NvbXBsZXRlIG9uIG91ciB1c2VybmFtZSBpZiB3ZSBhcmUgbG9nZ2VkIGluIG9yIGJhc2VkXG4gICAgIyAgb24gcmVwb3Mgd2UgYWxyZWFkeSBoYXZlLlxuICAgIGF1dG9jb21wbGV0ZSA9ICh2YWx1ZSkgLT5cblxuICAgIEBvYnNlcnZlICd2YWx1ZScsIF8uZGVib3VuY2UoYXV0b2NvbXBsZXRlLCAyMDApLCB7ICdpbml0Jzogbm8gfVxuXG4gICAgIyBGb2N1cyBvbiB0aGUgaW5wdXQgZmllbGQuXG4gICAgZG8gQGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXNcblxuICAgIEBvbiAnc3VibWl0JywgQHN1Ym1pdCIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL3Byb2plY3QnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgTWlsZXN0b25lcyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICBvbnJlbmRlcjogLT5cbiAgICBbIG93bmVyLCBuYW1lIF0gPSBAZ2V0ICdyb3V0ZSdcblxuICAgIGRvY3VtZW50LnRpdGxlID0gXCIje293bmVyfS8je25hbWV9XCJcblxuICAgICMgR2V0IHRoZSBhc3NvY2lhdGVkIHByb2plY3QuXG4gICAgQHNldCAncHJvamVjdCcsIHByb2plY3QgPSBwcm9qZWN0cy5maW5kIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBTaG91bGQgbm90IGhhcHBlbi4uLlxuICAgIHRocm93IDUwMCB1bmxlc3MgcHJvamVjdFxuXG4gICAgIyBXZSBkb24ndCBrbm93IGlmIHdlIGhhdmUgYWxsIG1pbGVzdG9uZXMsIHNvIGZldGNoIHRoZW0uXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgZmluZE1pbGVzdG9uZSA9IChudW1iZXIpIC0+XG4gICAgICBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzIG9yIFtdLCB7IG51bWJlciB9XG5cbiAgICBmZXRjaE1pbGVzdG9uZXMgPSAoY2IpIC0+XG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIGNiXG5cbiAgICBmZXRjaElzc3VlcyA9IChhbGxNaWxlc3RvbmVzLCBjYikgLT5cbiAgICAgIHJldHVybiBjYiAnVGhlIHByb2plY3QgaGFzIG5vIG1pbGVzdG9uZXMnIHVubGVzcyBhbGxNaWxlc3RvbmVzLmxlbmd0aFxuXG4gICAgICBhc3luYy5lYWNoIGFsbE1pbGVzdG9uZXMsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAjIE1heWJlIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICAgICAgcmV0dXJuIGNiIG51bGwgaWYgZmluZE1pbGVzdG9uZSBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICMgTmVlZCB0byBmZXRjaCB0aGUgaXNzdWVzIHRoZW4uXG4gICAgICAgIGlzc3Vlcy5mZXRjaEFsbCB7IG93bmVyLCBuYW1lLCAnbWlsZXN0b25lJzogbWlsZXN0b25lLm51bWJlciB9LCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdpc3N1ZXMnOiBvYmogfVxuICAgICAgICAgICMgTmV4dC5cbiAgICAgICAgICBkbyBjYlxuICAgICAgLCBjYlxuXG4gICAgIyBSdW4gaXQuXG4gICAgYXN5bmMud2F0ZXJmYWxsIFtcbiAgICAgICMgRmlyc3QgZ2V0IGFsbCB0aGUgbWlsZXN0b25lcy5cbiAgICAgIGZldGNoTWlsZXN0b25lcyxcbiAgICAgICMgVGhlbiBhbGwgdGhlIGlzc3VlcyBwZXIgbWlsZXN0b25lLlxuICAgICAgZmV0Y2hJc3N1ZXNcbiAgICBdLCAoZXJyKSA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgcmV0dXJuIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6IGRvIGVyci50b1N0cmluZ1xuICAgICAgICAndHlwZSc6ICdhbGVydCdcbiAgICAgICAgJ3N5c3RlbSc6IHllc1xuICAgICAgICAndHRsJzogbnVsbFxuICAgICAgfSBpZiBlcnJcblxuICAgICAgIyBTYXkgd2UgYXJlIHJlYWR5LlxuICAgICAgQHNldCAncmVhZHknLCB5ZXMiLCJUYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL21pbGVzdG9uZXMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9taWxlc3RvbmVzLmh0bWwnIiwiVGFibGUgPSByZXF1aXJlICcuL3RhYmxlLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJsZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wcm9qZWN0cydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwnIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xucHJvamVjdHMgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvdGFibGUnXG5cbiAgJ2RhdGEnOiB7IGZvcm1hdCB9XG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBDaGFuZ2Ugc29ydCBvcmRlci5cbiAgICBAb24gJ3NvcnRCeScsIC0+XG4gICAgICBmbnMgPSBwcm9qZWN0cy5kYXRhLnNvcnRGbnNcblxuICAgICAgaWR4ID0gMSArIGZucy5pbmRleE9mIHByb2plY3RzLmRhdGEuc29ydEJ5XG4gICAgICBpZHggPSAwIGlmIGlkeCBpcyBmbnMubGVuZ3RoXG5cbiAgICAgIHByb2plY3RzLnNldCAnc29ydEJ5JywgZm5zW2lkeF0iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gZXhwb3J0IHRoZSBjbGFzcyBpZiB3ZSBhcmUgaW4gYSBOb2RlLWxpa2Ugc3lzdGVtLlxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzID09PSBleHBvcnRzKVxuICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBTZW1WZXI7XG5cbi8vIFRoZSBkZWJ1ZyBmdW5jdGlvbiBpcyBleGNsdWRlZCBlbnRpcmVseSBmcm9tIHRoZSBtaW5pZmllZCB2ZXJzaW9uLlxuLyogbm9taW4gKi8gdmFyIGRlYnVnO1xuLyogbm9taW4gKi8gaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52ICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyAmJlxuICAgIC8qIG5vbWluICovIC9cXGJzZW12ZXJcXGIvaS50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpKVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8qIG5vbWluICovIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAvKiBub21pbiAqLyBhcmdzLnVuc2hpZnQoJ1NFTVZFUicpO1xuICAgIC8qIG5vbWluICovIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICAgIC8qIG5vbWluICovIH07XG4vKiBub21pbiAqLyBlbHNlXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcblxuLy8gTm90ZTogdGhpcyBpcyB0aGUgc2VtdmVyLm9yZyB2ZXJzaW9uIG9mIHRoZSBzcGVjIHRoYXQgaXQgaW1wbGVtZW50c1xuLy8gTm90IG5lY2Vzc2FyaWx5IHRoZSBwYWNrYWdlIHZlcnNpb24gb2YgdGhpcyBjb2RlLlxuZXhwb3J0cy5TRU1WRVJfU1BFQ19WRVJTSU9OID0gJzIuMC4wJztcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBUaWxkZSByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwicmVhc29uYWJseSBhdCBvciBncmVhdGVyIHRoYW5cIlxudmFyIExPTkVUSUxERSA9IFIrKztcbnNyY1tMT05FVElMREVdID0gJyg/On4+PyknO1xuXG52YXIgVElMREVUUklNID0gUisrO1xuc3JjW1RJTERFVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVUSUxERV0gKyAnXFxcXHMrJztcbnJlW1RJTERFVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tUSUxERVRSSU1dLCAnZycpO1xudmFyIHRpbGRlVHJpbVJlcGxhY2UgPSAnJDF+JztcblxudmFyIFRJTERFID0gUisrO1xuc3JjW1RJTERFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBUSUxERUxPT1NFID0gUisrO1xuc3JjW1RJTERFTE9PU0VdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIENhcmV0IHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJhdCBsZWFzdCBhbmQgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aFwiXG52YXIgTE9ORUNBUkVUID0gUisrO1xuc3JjW0xPTkVDQVJFVF0gPSAnKD86XFxcXF4pJztcblxudmFyIENBUkVUVFJJTSA9IFIrKztcbnNyY1tDQVJFVFRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FQ0FSRVRdICsgJ1xcXFxzKyc7XG5yZVtDQVJFVFRSSU1dID0gbmV3IFJlZ0V4cChzcmNbQ0FSRVRUUklNXSwgJ2cnKTtcbnZhciBjYXJldFRyaW1SZXBsYWNlID0gJyQxXic7XG5cbnZhciBDQVJFVCA9IFIrKztcbnNyY1tDQVJFVF0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgQ0FSRVRMT09TRSA9IFIrKztcbnNyY1tDQVJFVExPT1NFXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBBIHNpbXBsZSBndC9sdC9lcSB0aGluZywgb3IganVzdCBcIlwiIHRvIGluZGljYXRlIFwiYW55IHZlcnNpb25cIlxudmFyIENPTVBBUkFUT1JMT09TRSA9IFIrKztcbnNyY1tDT01QQVJBVE9STE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICcpJHxeJCc7XG52YXIgQ09NUEFSQVRPUiA9IFIrKztcbnNyY1tDT01QQVJBVE9SXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIEZVTExQTEFJTiArICcpJHxeJCc7XG5cblxuLy8gQW4gZXhwcmVzc2lvbiB0byBzdHJpcCBhbnkgd2hpdGVzcGFjZSBiZXR3ZWVuIHRoZSBndGx0IGFuZCB0aGUgdGhpbmdcbi8vIGl0IG1vZGlmaWVzLCBzbyB0aGF0IGA+IDEuMi4zYCA9PT4gYD4xLjIuM2BcbnZhciBDT01QQVJBVE9SVFJJTSA9IFIrKztcbnNyY1tDT01QQVJBVE9SVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0dUTFRdICtcbiAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJ3wnICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJztcblxuLy8gdGhpcyBvbmUgaGFzIHRvIHVzZSB0aGUgL2cgZmxhZ1xucmVbQ09NUEFSQVRPUlRSSU1dID0gbmV3IFJlZ0V4cChzcmNbQ09NUEFSQVRPUlRSSU1dLCAnZycpO1xudmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9ICckMSQyJDMnO1xuXG5cbi8vIFNvbWV0aGluZyBsaWtlIGAxLjIuMyAtIDEuMi40YFxuLy8gTm90ZSB0aGF0IHRoZXNlIGFsbCB1c2UgdGhlIGxvb3NlIGZvcm0sIGJlY2F1c2UgdGhleSdsbCBiZVxuLy8gY2hlY2tlZCBhZ2FpbnN0IGVpdGhlciB0aGUgc3RyaWN0IG9yIGxvb3NlIGNvbXBhcmF0b3IgZm9ybVxuLy8gbGF0ZXIuXG52YXIgSFlQSEVOUkFOR0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG52YXIgSFlQSEVOUkFOR0VMT09TRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRUxPT1NFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbi8vIFN0YXIgcmFuZ2VzIGJhc2ljYWxseSBqdXN0IGFsbG93IGFueXRoaW5nIGF0IGFsbC5cbnZhciBTVEFSID0gUisrO1xuc3JjW1NUQVJdID0gJyg8fD4pPz0/XFxcXHMqXFxcXConO1xuXG4vLyBDb21waWxlIHRvIGFjdHVhbCByZWdleHAgb2JqZWN0cy5cbi8vIEFsbCBhcmUgZmxhZy1mcmVlLCB1bmxlc3MgdGhleSB3ZXJlIGNyZWF0ZWQgYWJvdmUgd2l0aCBhIGZsYWcuXG5mb3IgKHZhciBpID0gMDsgaSA8IFI7IGkrKykge1xuICBkZWJ1ZyhpLCBzcmNbaV0pO1xuICBpZiAoIXJlW2ldKVxuICAgIHJlW2ldID0gbmV3IFJlZ0V4cChzcmNbaV0pO1xufVxuXG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5mdW5jdGlvbiBwYXJzZSh2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgciA9IGxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF07XG4gIHJldHVybiAoci50ZXN0KHZlcnNpb24pKSA/IG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpIDogbnVsbDtcbn1cblxuZXhwb3J0cy52YWxpZCA9IHZhbGlkO1xuZnVuY3Rpb24gdmFsaWQodmVyc2lvbiwgbG9vc2UpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBsb29zZSk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbDtcbn1cblxuXG5leHBvcnRzLmNsZWFuID0gY2xlYW47XG5mdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sICcnKSwgbG9vc2UpO1xuICByZXR1cm4gcyA/IHMudmVyc2lvbiA6IG51bGw7XG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyO1xuXG5mdW5jdGlvbiBTZW1WZXIodmVyc2lvbiwgbG9vc2UpIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gbG9vc2UpXG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICBlbHNlXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpO1xuXG4gIGRlYnVnKCdTZW1WZXInLCB2ZXJzaW9uLCBsb29zZSk7XG4gIHRoaXMubG9vc2UgPSBsb29zZTtcbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChsb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiAoL15bMC05XSskLy50ZXN0KGlkKSkgPyAraWQgOiBpZDtcbiAgICB9KTtcblxuICB0aGlzLmJ1aWxkID0gbVs1XSA/IG1bNV0uc3BsaXQoJy4nKSA6IFtdO1xuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2g7XG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHRoaXMudmVyc2lvbiArPSAnLScgKyB0aGlzLnByZXJlbGVhc2Uuam9pbignLicpO1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnPFNlbVZlciBcIicgKyB0aGlzICsgJ1wiPic7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZlcnNpb247XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICBkZWJ1ZygnU2VtVmVyLmNvbXBhcmUnLCB0aGlzLnZlcnNpb24sIHRoaXMubG9vc2UsIG90aGVyKTtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZU1haW4ob3RoZXIpIHx8IHRoaXMuY29tcGFyZVByZShvdGhlcik7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1pbm9yLCBvdGhlci5taW5vcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLnBhdGNoLCBvdGhlci5wYXRjaCk7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVQcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgaSA9IDA7XG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXTtcbiAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDA7XG4gICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIGVsc2UgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICB9IHdoaWxlICgrK2kpO1xufTtcblxuLy8gcHJlbWlub3Igd2lsbCBidW1wIHRoZSB2ZXJzaW9uIHVwIHRvIHRoZSBuZXh0IG1pbm9yIHJlbGVhc2UsIGFuZCBpbW1lZGlhdGVseVxuLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuU2VtVmVyLnByb3RvdHlwZS5pbmMgPSBmdW5jdGlvbihyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21ham9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgIC8vIDEuMS4wIGJ1bXBzIHRvIDIuMC4wXG4gICAgICBpZiAodGhpcy5taW5vciAhPT0gMCB8fCB0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcmVyZWxlYXNlW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApO1xuICAgICAgfVxuICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgLy8gMS4yLjAtYmV0YS5mb29ibHogb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKVxuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSk7XG4gIH1cbiAgdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5leHBvcnRzLmluYyA9IGluYztcbmZ1bmN0aW9uIGluYyh2ZXJzaW9uLCByZWxlYXNlLCBsb29zZSwgaWRlbnRpZmllcikge1xuICBpZiAodHlwZW9mKGxvb3NlKSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZGVudGlmaWVyID0gbG9vc2U7XG4gICAgbG9vc2UgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvbjtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLmNvbXBhcmVJZGVudGlmaWVycyA9IGNvbXBhcmVJZGVudGlmaWVycztcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvO1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIChhbnVtICYmICFibnVtKSA/IC0xIDpcbiAgICAgICAgIChibnVtICYmICFhbnVtKSA/IDEgOlxuICAgICAgICAgYSA8IGIgPyAtMSA6XG4gICAgICAgICBhID4gYiA/IDEgOlxuICAgICAgICAgMDtcbn1cblxuZXhwb3J0cy5yY29tcGFyZUlkZW50aWZpZXJzID0gcmNvbXBhcmVJZGVudGlmaWVycztcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGIsIGEpO1xufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlO1xuZnVuY3Rpb24gY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShiKTtcbn1cblxuZXhwb3J0cy5jb21wYXJlTG9vc2UgPSBjb21wYXJlTG9vc2U7XG5mdW5jdGlvbiBjb21wYXJlTG9vc2UoYSwgYikge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKTtcbn1cblxuZXhwb3J0cy5yY29tcGFyZSA9IHJjb21wYXJlO1xuZnVuY3Rpb24gcmNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpO1xufVxuXG5leHBvcnRzLnNvcnQgPSBzb3J0O1xuZnVuY3Rpb24gc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMucnNvcnQgPSByc29ydDtcbmZ1bmN0aW9uIHJzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLnJjb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMuZ3QgPSBndDtcbmZ1bmN0aW9uIGd0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+IDA7XG59XG5cbmV4cG9ydHMubHQgPSBsdDtcbmZ1bmN0aW9uIGx0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8IDA7XG59XG5cbmV4cG9ydHMuZXEgPSBlcTtcbmZ1bmN0aW9uIGVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA9PT0gMDtcbn1cblxuZXhwb3J0cy5uZXEgPSBuZXE7XG5mdW5jdGlvbiBuZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpICE9PSAwO1xufVxuXG5leHBvcnRzLmd0ZSA9IGd0ZTtcbmZ1bmN0aW9uIGd0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPj0gMDtcbn1cblxuZXhwb3J0cy5sdGUgPSBsdGU7XG5mdW5jdGlvbiBsdGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDw9IDA7XG59XG5cbmV4cG9ydHMuY21wID0gY21wO1xuZnVuY3Rpb24gY21wKGEsIG9wLCBiLCBsb29zZSkge1xuICB2YXIgcmV0O1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnPT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSA9PT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyE9PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgIT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICcnOiBjYXNlICc9JzogY2FzZSAnPT0nOiByZXQgPSBlcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJyE9JzogcmV0ID0gbmVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPic6IHJldCA9IGd0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPj0nOiByZXQgPSBndGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8JzogcmV0ID0gbHQoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8PSc6IHJldCA9IGx0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb3BlcmF0b3I6ICcgKyBvcCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbmZ1bmN0aW9uIENvbXBhcmF0b3IoY29tcCwgbG9vc2UpIHtcbiAgaWYgKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgaWYgKGNvbXAubG9vc2UgPT09IGxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcblxuICBkZWJ1ZygnY29tcGFyYXRvcicsIGNvbXAsIGxvb3NlKTtcbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuICB0aGlzLnBhcnNlKGNvbXApO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHRoaXMudmFsdWUgPSAnJztcbiAgZWxzZVxuICAgIHRoaXMudmFsdWUgPSB0aGlzLm9wZXJhdG9yICsgdGhpcy5zZW12ZXIudmVyc2lvbjtcblxuICBkZWJ1ZygnY29tcCcsIHRoaXMpO1xufVxuXG52YXIgQU5ZID0ge307XG5Db21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGNvbXApIHtcbiAgdmFyIHIgPSB0aGlzLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJzxTZW1WZXIgQ29tcGFyYXRvciBcIicgKyB0aGlzICsgJ1wiPic7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLmxvb3NlKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIHJldHVybiBjbXAodmVyc2lvbiwgdGhpcy5vcGVyYXRvciwgdGhpcy5zZW12ZXIsIHRoaXMubG9vc2UpO1xufTtcblxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2U7XG5mdW5jdGlvbiBSYW5nZShyYW5nZSwgbG9vc2UpIHtcbiAgaWYgKChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSAmJiByYW5nZS5sb29zZSA9PT0gbG9vc2UpXG4gICAgcmV0dXJuIHJhbmdlO1xuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSYW5nZSkpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpO1xuXG4gIHRoaXMubG9vc2UgPSBsb29zZTtcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlO1xuICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKTtcbiAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoO1xuICB9KTtcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpO1xuICB9XG5cbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuUmFuZ2UucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICc8U2VtVmVyIFJhbmdlIFwiJyArIHRoaXMucmFuZ2UgKyAnXCI+Jztcbn07XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMubG9vc2U7XG4gIHJhbmdlID0gcmFuZ2UudHJpbSgpO1xuICBkZWJ1ZygncmFuZ2UnLCByYW5nZSwgbG9vc2UpO1xuICAvLyBgMS4yLjMgLSAxLjIuNGAgPT4gYD49MS4yLjMgPD0xLjIuNGBcbiAgdmFyIGhyID0gbG9vc2UgPyByZVtIWVBIRU5SQU5HRUxPT1NFXSA6IHJlW0hZUEhFTlJBTkdFXTtcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKTtcbiAgZGVidWcoJ2h5cGhlbiByZXBsYWNlJywgcmFuZ2UpO1xuICAvLyBgPiAxLjIuMyA8IDEuMi41YCA9PiBgPjEuMi4zIDwxLjIuNWBcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NPTVBBUkFUT1JUUklNXSwgY29tcGFyYXRvclRyaW1SZXBsYWNlKTtcbiAgZGVidWcoJ2NvbXBhcmF0b3IgdHJpbScsIHJhbmdlLCByZVtDT01QQVJBVE9SVFJJTV0pO1xuXG4gIC8vIGB+IDEuMi4zYCA9PiBgfjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbVElMREVUUklNXSwgdGlsZGVUcmltUmVwbGFjZSk7XG5cbiAgLy8gYF4gMS4yLjNgID0+IGBeMS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDQVJFVFRSSU1dLCBjYXJldFRyaW1SZXBsYWNlKTtcblxuICAvLyBub3JtYWxpemUgc3BhY2VzXG4gIHJhbmdlID0gcmFuZ2Uuc3BsaXQoL1xccysvKS5qb2luKCcgJyk7XG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIHJhbmdlIGlzIGNvbXBsZXRlbHkgdHJpbW1lZCBhbmRcbiAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVtDT01QQVJBVE9STE9PU0VdIDogcmVbQ09NUEFSQVRPUl07XG4gIHZhciBzZXQgPSByYW5nZS5zcGxpdCgnICcpLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHBhcnNlQ29tcGFyYXRvcihjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5sb29zZSkge1xuICAgIC8vIGluIGxvb3NlIG1vZGUsIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHZhbGlkIGNvbXBhcmF0b3JzXG4gICAgc2V0ID0gc2V0LmZpbHRlcihmdW5jdGlvbihjb21wKSB7XG4gICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSk7XG4gICAgfSk7XG4gIH1cbiAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cbi8vIE1vc3RseSBqdXN0IGZvciB0ZXN0aW5nIGFuZCBsZWdhY3kgQVBJIHJlYXNvbnNcbmV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzKHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSkuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcbiAgfSk7XG59XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmZ1bmN0aW9uIHBhcnNlQ29tcGFyYXRvcihjb21wLCBsb29zZSkge1xuICBkZWJ1ZygnY29tcCcsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVRpbGRlcyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3hyYW5nZScsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3N0YXJzJywgY29tcCk7XG4gIHJldHVybiBjb21wO1xufVxuXG5mdW5jdGlvbiBpc1goaWQpIHtcbiAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSAneCcgfHwgaWQgPT09ICcqJztcbn1cblxuLy8gfiwgfj4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyB+MiwgfjIueCwgfjIueC54LCB+PjIsIH4+Mi54IH4+Mi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyB+Mi4wLCB+Mi4wLngsIH4+Mi4wLCB+PjIuMC54IC0tPiA+PTIuMC4wIDwyLjEuMFxuLy8gfjEuMiwgfjEuMi54LCB+PjEuMiwgfj4xLjIueCAtLT4gPj0xLjIuMCA8MS4zLjBcbi8vIH4xLjIuMywgfj4xLjIuMyAtLT4gPj0xLjIuMyA8MS4zLjBcbi8vIH4xLjIuMCwgfj4xLjIuMCAtLT4gPj0xLjIuMCA8MS4zLjBcbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZXMoY29tcCwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUoY29tcCwgbG9vc2UpIHtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW1RJTERFTE9PU0VdIDogcmVbVElMREVdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3RpbGRlJywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSlcbiAgICAgIC8vIH4xLjIgPT0gPj0xLjIuMC0gPDEuMy4wLVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXQoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgbG9vc2UpO1xuICB2YXIgciA9IGxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBsb29zZSk7XG4gIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSkge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIHZhciByID0gbG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCdcbiAgICAgICAgaWYgKHhtKVxuICAgICAgICAgIE0gPSArTSArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG0gPSArbSArIDFcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgbG9vc2UpO1xuICAvLyBMb29zZW5lc3MgaXMgaWdub3JlZCBoZXJlLiAgc3RhciBpcyBhbHdheXMgYXMgbG9vc2UgYXMgaXQgZ2V0cyFcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbU1RBUl0sICcnKTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBwYXNzZWQgdG8gc3RyaW5nLnJlcGxhY2UocmVbSFlQSEVOUkFOR0VdKVxuLy8gTSwgbSwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkXG4vLyAxLjIgLSAzLjQuNSA9PiA+PTEuMi4wIDw9My40LjVcbi8vIDEuMi4zIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjBcbmZ1bmN0aW9uIGh5cGhlblJlcGxhY2UoJDAsXG4gICAgICAgICAgICAgICAgICAgICAgIGZyb20sIGZNLCBmbSwgZnAsIGZwciwgZmIsXG4gICAgICAgICAgICAgICAgICAgICAgIHRvLCB0TSwgdG0sIHRwLCB0cHIsIHRiKSB7XG5cbiAgaWYgKGlzWChmTSkpXG4gICAgZnJvbSA9ICcnO1xuICBlbHNlIGlmIChpc1goZm0pKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWChmcCkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuJyArIGZtICsgJy4wJztcbiAgZWxzZVxuICAgIGZyb20gPSAnPj0nICsgZnJvbTtcblxuICBpZiAoaXNYKHRNKSlcbiAgICB0byA9ICcnO1xuICBlbHNlIGlmIChpc1godG0pKVxuICAgIHRvID0gJzwnICsgKCt0TSArIDEpICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1godHApKVxuICAgIHRvID0gJzwnICsgdE0gKyAnLicgKyAoK3RtICsgMSkgKyAnLjAnO1xuICBlbHNlIGlmICh0cHIpXG4gICAgdG8gPSAnPD0nICsgdE0gKyAnLicgKyB0bSArICcuJyArIHRwICsgJy0nICsgdHByO1xuICBlbHNlXG4gICAgdG8gPSAnPD0nICsgdG87XG5cbiAgcmV0dXJuIChmcm9tICsgJyAnICsgdG8pLnRyaW0oKTtcbn1cblxuXG4vLyBpZiBBTlkgb2YgdGhlIHNldHMgbWF0Y2ggQUxMIG9mIGl0cyBjb21wYXJhdG9ycywgdGhlbiBwYXNzXG5SYW5nZS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbikpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJhbmdlLnRlc3QodmVyc2lvbik7XG59XG5cbmV4cG9ydHMubWF4U2F0aXNmeWluZyA9IG1heFNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtYXhTYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgbG9vc2UpIHtcbiAgcmV0dXJuIHZlcnNpb25zLmZpbHRlcihmdW5jdGlvbih2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgbG9vc2UpO1xuICB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gcmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KVswXSB8fCBudWxsO1xufVxuXG5leHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlO1xuZnVuY3Rpb24gdmFsaWRSYW5nZShyYW5nZSwgbG9vc2UpIHtcbiAgdHJ5IHtcbiAgICAvLyBSZXR1cm4gJyonIGluc3RlYWQgb2YgJycgc28gdGhhdCB0cnV0aGluZXNzIHdvcmtzLlxuICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBpZiBpdCdzIGludmFsaWQgYW55d2F5XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpLnJhbmdlIHx8ICcqJztcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmV4cG9ydHMubHRyID0gbHRyO1xuZnVuY3Rpb24gbHRyKHZlcnNpb24sIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJzwnLCBsb29zZSk7XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZS5cbmV4cG9ydHMuZ3RyID0gZ3RyO1xuZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBsb29zZSk7XG59XG5cbmV4cG9ydHMub3V0c2lkZSA9IG91dHNpZGU7XG5mdW5jdGlvbiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCBoaWxvLCBsb29zZSkge1xuICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSk7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG5cbiAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcDtcbiAgc3dpdGNoIChoaWxvKSB7XG4gICAgY2FzZSAnPic6XG4gICAgICBndGZuID0gZ3Q7XG4gICAgICBsdGVmbiA9IGx0ZTtcbiAgICAgIGx0Zm4gPSBsdDtcbiAgICAgIGNvbXAgPSAnPic7XG4gICAgICBlY29tcCA9ICc+PSc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICc8JzpcbiAgICAgIGd0Zm4gPSBsdDtcbiAgICAgIGx0ZWZuID0gZ3RlO1xuICAgICAgbHRmbiA9IGd0O1xuICAgICAgY29tcCA9ICc8JztcbiAgICAgIGVjb21wID0gJzw9JztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IHByb3ZpZGUgYSBoaWxvIHZhbCBvZiBcIjxcIiBvciBcIj5cIicpO1xuICB9XG5cbiAgLy8gSWYgaXQgc2F0aXNpZmVzIHRoZSByYW5nZSBpdCBpcyBub3Qgb3V0c2lkZVxuICBpZiAoc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBsb29zZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGcm9tIG5vdyBvbiwgdmFyaWFibGUgdGVybXMgYXJlIGFzIGlmIHdlJ3JlIGluIFwiZ3RyXCIgbW9kZS5cbiAgLy8gYnV0IG5vdGUgdGhhdCBldmVyeXRoaW5nIGlzIGZsaXBwZWQgZm9yIHRoZSBcImx0clwiIGZ1bmN0aW9uLlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgdmFyIGhpZ2ggPSBudWxsO1xuICAgIHZhciBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaChmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICBoaWdoID0gaGlnaCB8fCBjb21wYXJhdG9yO1xuICAgICAgbG93ID0gbG93IHx8IGNvbXBhcmF0b3I7XG4gICAgICBpZiAoZ3Rmbihjb21wYXJhdG9yLnNlbXZlciwgaGlnaC5zZW12ZXIsIGxvb3NlKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgbG9vc2UpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBVc2UgdGhlIGRlZmluZSgpIGZ1bmN0aW9uIGlmIHdlJ3JlIGluIEFNRCBsYW5kXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuICBkZWZpbmUoZXhwb3J0cyk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKSJdfQ==
