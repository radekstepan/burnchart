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
    return this.set('list', []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvYXBwLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9jb25maWcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvc3lzdGVtLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy91c2VyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL3JlcXVlc3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3JvdXRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3N0YXRzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvdmVuZG9yLmNvZmZlZSIsInNyYy90ZW1wbGF0ZXMvYXBwLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2NoYXJ0Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL3RlbXBsYXRlcy9oZXJvLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2ljb25zLmh0bWwiLCJzcmMvdGVtcGxhdGVzL25vdGlmeS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9kYXRlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2Zvcm1hdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9rZXkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbWl4aW5zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL21vZGVsLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2NoYXJ0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlYWRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZXJvLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2ljb25zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL25vdGlmeS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbmV3LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy90YWJsZS5jb2ZmZWUiLCJ2ZW5kb3Ivbm9kZS1zZW12ZXIvc2VtdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG4jIExvZGFzaCBtaXhpbnMuXG5yZXF1aXJlICcuL3V0aWxzL21peGlucy5jb2ZmZWUnXG4jIFdpbGwgbG9hZCBwcm9qZWN0cyBmcm9tIGxvY2FsU3RvcmFnZS5cbnJlcXVpcmUgJy4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcblxuSGVhZGVyID0gcmVxdWlyZSAnLi92aWV3cy9oZWFkZXIuY29mZmVlJ1xuTm90aWZ5ID0gcmVxdWlyZSAnLi92aWV3cy9ub3RpZnkuY29mZmVlJ1xucm91dGVyID0gcmVxdWlyZSAnLi9tb2R1bGVzL3JvdXRlci5jb2ZmZWUnXG5cbmFwcCA9IG5ldyBSYWN0aXZlXG4gIFxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuL3RlbXBsYXRlcy9hcHAuaHRtbCdcblxuICAnZWwnOiAnYm9keSdcblxuICAnY29tcG9uZW50cyc6IHsgSGVhZGVyLCBOb3RpZnkgfVxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU3RhcnQgdGhlIHJvdXRlci5cbiAgICByb3V0ZXIuaW5pdCAnLyciLCJNb2RlbCA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvY29uZmlnJ1xuXG4gIFwiZGF0YVwiOlxuICAgICMgRmlyZWJhc2UgYXBwIG5hbWUuXG4gICAgXCJmaXJlYmFzZVwiOiBcImJ1cm5jaGFydFwiXG4gICAgIyBEYXRhIHNvdXJjZSBwcm92aWRlci5cbiAgICBcInByb3ZpZGVyXCI6IFwiZ2l0aHViXCJcbiAgICAjIEZpZWxkcyB0byBrZWVwIGZyb20gR0ggcmVzcG9uc2VzLlxuICAgIFwiZmllbGRzXCI6XG4gICAgICBcIm1pbGVzdG9uZVwiOiBbXG4gICAgICAgIFwiY2xvc2VkX2lzc3Vlc1wiXG4gICAgICAgIFwiY3JlYXRlZF9hdFwiXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIlxuICAgICAgICBcImR1ZV9vblwiXG4gICAgICAgIFwibnVtYmVyXCJcbiAgICAgICAgXCJvcGVuX2lzc3Vlc1wiXG4gICAgICAgIFwidGl0bGVcIlxuICAgICAgICBcInVwZGF0ZWRfYXRcIlxuICAgICAgXVxuICAgICMgQ2hhcnQgY29uZmlndXJhdGlvbi5cbiAgICBcImNoYXJ0XCI6XG4gICAgICAjIERheXMgd2UgYXJlIG5vdCB3b3JraW5nLlxuICAgICAgXCJvZmZfZGF5c1wiOiBbIF1cbiAgICAgICMgSG93IGRvIHdlIHBhcnNlIEdpdEh1YiBkYXRlcz9cbiAgICAgIFwiZGF0ZXRpbWVcIjogL14oXFxkezR9LVxcZHsyfS1cXGR7Mn0pVCguKikvXG4gICAgICAjIEhvdyBkb2VzIGEgc2l6ZSBsYWJlbCBsb29rIGxpa2U/XG4gICAgICBcInNpemVfbGFiZWxcIjogL15zaXplIChcXGQrKSQvXG4gICAgICAjIEhvdyBkbyB3ZSBzcGVjaWZ5IHdoaWNoIHVzZXIvcmVwby8obWlsZXN0b25lKSB3ZSB3YW50P1xuICAgICAgXCJsb2NhdGlvblwiOiAvXiMhKChcXC9bXlxcL10rKXsyLDN9KSQvXG4gICAgICAjIFByb2Nlc3MgYWxsIGlzc3VlcyBhcyBvbmUgc2l6ZSAoT05FX1NJWkUpIG9yIHVzZSBsYWJlbHMgKExBQkVMUykuXG4gICAgICBcInBvaW50c1wiOiAnT05FX1NJWkUnIiwieyBGaXJlYmFzZSwgRmlyZWJhc2VTaW1wbGVMb2dpbiB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5Nb2RlbCAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG51c2VyICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuY29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9maXJlYmFzZSdcblxuICBhdXRoOiAtPlxuICAgIHRocm93ICdOb3Qgb3ZlcnJpZGVuJ1xuXG4gICMgTG9naW4gYSB1c2VyLlxuICBsb2dpbjogKGNiKSAtPlxuICAgICMgTG9naW4uXG4gICAgQGF1dGgubG9naW4gY29uZmlnLmRhdGEucHJvdmlkZXIsXG4gICAgICAncmVtZW1iZXJNZSc6IHllc1xuICAgICAgJ3Njb3BlJzogJ3ByaXZhdGVfcmVwbydcblxuICAjIExvZ291dCBhIHVzZXIuXG4gIGxvZ291dDogLT5cbiAgICBAYXV0aD8ubG9nb3V0XG4gICAgZG8gdXNlci5yZXNldFxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU2V0dXAgYSBuZXcgY2xpZW50LlxuICAgIEBzZXQgJ2NsaWVudCcsIGNsaWVudCA9IG5ldyBGaXJlYmFzZSBcImh0dHBzOi8vI3tjb25maWcuZGF0YS5maXJlYmFzZX0uZmlyZWJhc2Vpby5jb21cIlxuICAgIFxuICAgICMgQ2hlY2sgaWYgd2UgaGF2ZSBhIHVzZXIgaW4gc2Vzc2lvbi5cbiAgICBAYXV0aCA9IG5ldyBGaXJlYmFzZVNpbXBsZUxvZ2luIGNsaWVudCwgKGVyciwgb2JqKSAtPlxuICAgICAgdGhyb3cgZXJyIGlmIGVyclxuICAgICAgXG4gICAgICAjIFNhdmUgdXNlci5cbiAgICAgIHVzZXIuc2V0IG9iaiBpZiBvYmpcbiAgICAgICMgU2F5IHdlIGFyZSBkb25lLlxuICAgICAgdXNlci5zZXQgJ3JlYWR5JywgeWVzIiwieyBfLCBsc2NhY2hlLCBzb3J0ZWRJbmRleENtcCwgc2VtdmVyIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmNvbmZpZyAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuc3RhdHMgICAgPSByZXF1aXJlICcuLi9tb2R1bGVzL3N0YXRzLmNvZmZlZSdcbk1vZGVsICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuZGF0ZSAgICAgPSByZXF1aXJlICcuLi91dGlscy9kYXRlLmNvZmZlZSdcbnVzZXIgICAgID0gcmVxdWlyZSAnLi91c2VyLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvcHJvamVjdHMnXG5cbiAgJ2RhdGEnOlxuICAgICMgQ3VycmVudCBzb3J0IG9yZGVyLlxuICAgICdzb3J0QnknOiAncHJpb3JpdHknXG4gICAgIyBTb3J0IGZ1bmN0aW9ucy5cbiAgICAnc29ydEZucyc6IFsgJ3Byb2dyZXNzJywgJ3ByaW9yaXR5JywgJ25hbWUnIF1cblxuICAjIFJldHVybiBhIHNvcnQgb3JkZXIgY29tcGFyYXRvci5cbiAgY29tcGFyYXRvcjogLT5cbiAgICB7IGxpc3QsIHNvcnRCeSB9ID0gQGRhdGFcblxuICAgICMgQ29udmVydCBleGlzdGluZyBpbmRleCBpbnRvIGFjdHVhbCBwcm9qZWN0IG1pbGVzdG9uZS5cbiAgICBkZUlkeCA9IChmbikgPT5cbiAgICAgIChbIGksIGogXSwgcmVzdC4uLikgPT5cbiAgICAgICAgZm4uYXBwbHkgQCwgWyBbIGxpc3RbaV0sIGxpc3RbaV0ubWlsZXN0b25lc1tqXSBdIF0uY29uY2F0IHJlc3RcblxuICAgICMgU2V0IGRlZmF1bHQgZmllbGRzLCBpbiBwbGFjZS5cbiAgICBkZWZhdWx0cyA9IChhcnIsIGhhc2gpIC0+XG4gICAgICBmb3IgaXRlbSBpbiBhcnJcbiAgICAgICAgZm9yIGssIHYgb2YgaGFzaFxuICAgICAgICAgIHJlZiA9IGl0ZW1cbiAgICAgICAgICBmb3IgcCwgaSBpbiBrZXlzID0gay5zcGxpdCAnLidcbiAgICAgICAgICAgIGlmIGkgaXMga2V5cy5sZW5ndGggLSAxXG4gICAgICAgICAgICAgIHJlZltwXSA/PSB2XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJlZiA9IHJlZltwXSA/PSB7fVxuXG4gICAgIyBUaGUgYWN0dWFsIGZuIHNlbGVjdGlvbi5cbiAgICBzd2l0Y2ggc29ydEJ5XG4gICAgICAjIEZyb20gaGlnaGVzdCBwcm9ncmVzcyBwb2ludHMuXG4gICAgICB3aGVuICdwcm9ncmVzcycgdGhlbiBkZUlkeCAoWyBhUCwgYU0gXSwgWyBiUCwgYk0gXSkgLT5cbiAgICAgICAgZGVmYXVsdHMgWyBhTSwgYk0gXSwgeyAnc3RhdHMucHJvZ3Jlc3MucG9pbnRzJzogMCB9XG4gICAgICAgICMgU2ltcGxlIHBvaW50cyBkaWZmZXJlbmNlLlxuICAgICAgICBhTS5zdGF0cy5wcm9ncmVzcy5wb2ludHMgLSBiTS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcblxuICAgICAgIyBGcm9tIG1vc3QgZGVsYXllZCBpbiBkYXlzLlxuICAgICAgd2hlbiAncHJpb3JpdHknIHRoZW4gZGVJZHggKFsgYVAsIGFNIF0sIFsgYlAsIGJNIF0pIC0+XG4gICAgICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGRlYWRsaW5lIGFyZSBhbHdheXMgYXQgdGhlIFwiYmVnaW5uaW5nXCIuXG4gICAgICAgIGRlZmF1bHRzIFsgYU0sIGJNIF0sIHsgJ3N0YXRzLnByb2dyZXNzLnRpbWUnOiAwLCAnc3RhdHMuZGF5cyc6IDFlMyB9XG4gICAgICAgICMgJSBkaWZmZXJlbmNlIGluIHByb2dyZXNzIHRpbWVzIHRoZSBudW1iZXIgb2YgZGF5cyBhaGVhZCBvciBiZWhpbmQuXG4gICAgICAgIFsgJGEsICRiIF0gPSBfLm1hcCBbIGFNLCBiTSBdLCAoeyBzdGF0cyB9KSAtPlxuICAgICAgICAgIChzdGF0cy5wcm9ncmVzcy5wb2ludHMgLSBzdGF0cy5wcm9ncmVzcy50aW1lKSAqIHN0YXRzLmRheXNcblxuICAgICAgICAkYiAtICRhXG5cbiAgICAgICMgQmFzZWQgb24gcHJvamVjdCB0aGVuIG1pbGVzdG9uZSBuYW1lIGluY2x1ZGluZyBzZW12ZXIuXG4gICAgICB3aGVuICduYW1lJyB0aGVuIGRlSWR4IChbIGFQLCBhTSBdLCBbIGJQLCBiTSBdKSAtPlxuICAgICAgICByZXR1cm4gb3duZXIgaWYgb3duZXIgPSBiUC5vd25lci5sb2NhbGVDb21wYXJlIGFQLm93bmVyXG4gICAgICAgIHJldHVybiBuYW1lIGlmIG5hbWUgPSBiUC5uYW1lLmxvY2FsZUNvbXBhcmUgYVAubmFtZVxuICAgICAgICAjIFRyeSBzZW12ZXIuXG4gICAgICAgIGlmIHNlbXZlci52YWxpZChiTS50aXRsZSkgYW5kIHNlbXZlci52YWxpZChhTS50aXRsZSlcbiAgICAgICAgICBzZW12ZXIuZ3QgYk0udGl0bGUsIGFNLnRpdGxlXG4gICAgICAgICMgQmFjayB0byBzdHJpbmcgY29tcGFyZS5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGJNLnRpdGxlLmxvY2FsZUNvbXBhcmUgYU0udGl0bGVcblxuICAgICAgIyBUaGUgXCJ3aGF0ZXZlclwiIHNvcnQgb3JkZXIuLi5cbiAgICAgIGVsc2UgLT4gMFxuXG4gIGZpbmQ6IChwcm9qZWN0KSAtPlxuICAgIF8uZmluZCBAZGF0YS5saXN0LCBwcm9qZWN0XG5cbiAgZXhpc3RzOiAtPlxuICAgICEhQGZpbmQuYXBwbHkgQCwgYXJndW1lbnRzXG5cbiAgIyBQdXNoIHRvIHRoZSBzdGFjayB1bmxlc3MgaXQgZXhpc3RzIGFscmVhZHkuXG4gIGFkZDogKHByb2plY3QpIC0+XG4gICAgQHB1c2ggJ2xpc3QnLCBwcm9qZWN0IHVubGVzcyBAZXhpc3RzIHByb2plY3RcblxuICAjIEZpbmQgaW5kZXggb2YgYSBwcm9qZWN0LlxuICBmaW5kSW5kZXg6ICh7IG93bmVyLCBuYW1lIH0pIC0+XG4gICAgXy5maW5kSW5kZXggQGRhdGEubGlzdCwgeyBvd25lciwgbmFtZSB9XG5cbiAgIyBBZGQgYSBtaWxlc3RvbmUgZm9yIGEgcHJvamVjdC5cbiAgYWRkTWlsZXN0b25lOiAocHJvamVjdCwgbWlsZXN0b25lKSAtPlxuICAgICMgQWRkIGluIHRoZSBzdGF0cy5cbiAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ3N0YXRzJzogc3RhdHMobWlsZXN0b25lKSB9XG4gICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICB0aHJvdyA1MDAgaWYgKGkgPSBAZmluZEluZGV4KHByb2plY3QpKSA8IDAgXG5cbiAgICAjIEhhdmUgbWlsZXN0b25lcyBhbHJlYWR5P1xuICAgIGlmIHByb2plY3QubWlsZXN0b25lcz9cbiAgICAgIEBwdXNoIFwibGlzdC4je2l9Lm1pbGVzdG9uZXNcIiwgbWlsZXN0b25lXG4gICAgICBqID0gQGRhdGEubGlzdFtpXS5taWxlc3RvbmVzLmxlbmd0aCAtIDEgIyBpbmRleCBpbiBtaWxlc3RvbmVzXG4gICAgZWxzZVxuICAgICAgQHNldCBcImxpc3QuI3tpfS5taWxlc3RvbmVzXCIsIFsgbWlsZXN0b25lIF1cbiAgICAgIGogPSAwICAjIGluZGV4IGluIG1pbGVzdG9uZXNcblxuICAgICMgTm93IGluZGV4IHRoaXMgbWlsZXN0b25lLlxuICAgIEBzb3J0IFsgaSwgaiBdLCBbIHByb2plY3QsIG1pbGVzdG9uZSBdXG5cbiAgIyBTYXZlIGFuIGVycm9yIGZyb20gbG9hZGluZyBtaWxlc3RvbmVzIG9yIGlzc3Vlc1xuICBzYXZlRXJyb3I6IChwcm9qZWN0LCBlcnIpIC0+XG4gICAgaWYgKGlkeCA9IEBmaW5kSW5kZXgocHJvamVjdCkpID4gLTFcbiAgICAgIGlmIHByb2plY3QuZXJyb3JzP1xuICAgICAgICBAcHVzaCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBbIGVyciBdXG4gICAgZWxzZVxuICAgICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICAgIHRocm93IDUwMCAgXG5cbiAgY2xlYXI6IC0+XG4gICAgQHNldCAnbGlzdCcsIFtdXG5cbiAgIyBTb3J0L29yIGluc2VydCBpbnRvIGFuIGFscmVhZHkgc29ydGVkIGluZGV4LlxuICBzb3J0OiAocmVmLCBkYXRhKSAtPlxuICAgICMgR2V0IG9yIGluaXRpYWxpemUgdGhlIGluZGV4LlxuICAgIGluZGV4ID0gQGRhdGEuaW5kZXggb3IgW11cblxuICAgICMgRG8gb25lLlxuICAgIGlmIHJlZlxuICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIGRhdGEsIGRvIEBjb21wYXJhdG9yXG4gICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCByZWZcbiAgICAjIERvIGFsbC5cbiAgICBlbHNlXG4gICAgICBmb3IgcCwgaSBpbiBAZGF0YS5saXN0XG4gICAgICAgICMgVE9ETzogbmVlZCB0byBzaG93IHByb2plY3RzIHRoYXQgZmFpbGVkIHRvby4uLlxuICAgICAgICBjb250aW51ZSB1bmxlc3MgcC5taWxlc3RvbmVzP1xuICAgICAgICBmb3IgbSwgaiBpbiBwLm1pbGVzdG9uZXNcbiAgICAgICAgICAjIFJ1biBhIGNvbXBhcmF0b3IgaGVyZSBpbnNlcnRpbmcgaW50byBpbmRleC5cbiAgICAgICAgICBpZHggPSBzb3J0ZWRJbmRleENtcCBpbmRleCwgWyBwLCBtIF0sIGRvIEBjb21wYXJhdG9yXG4gICAgICAgICAgIyBMb2cuXG4gICAgICAgICAgaW5kZXguc3BsaWNlIGlkeCwgMCwgWyBpLCBqIF1cblxuICAgICMgU2F2ZSB0aGUgaW5kZXguXG4gICAgQHNldCAnaW5kZXgnLCBpbmRleFxuXG4gIG9uY29uc3RydWN0OiAtPlxuICAgIG1lZGlhdG9yLm9uICchcHJvamVjdHMvYWRkJywgICAgXy5iaW5kIEBhZGQsIEBcbiAgICBtZWRpYXRvci5vbiAnIXByb2plY3RzL2NsZWFyJywgIF8uYmluZCBAY2xlYXIsIEBcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIEluaXQgdGhlIHByb2plY3RzLlxuICAgIEBzZXQgJ2xpc3QnLCBsc2NhY2hlLmdldCgncHJvamVjdHMnKSBvciBbXVxuXG4gICAgIyBQZXJzaXN0IHByb2plY3RzIGluIGxvY2FsIHN0b3JhZ2UgKHNhbnMgbWlsZXN0b25lcykuXG4gICAgQG9ic2VydmUgJ2xpc3QnLCAocHJvamVjdHMpIC0+XG4gICAgICBsc2NhY2hlLnNldCAncHJvamVjdHMnLCBfLnBsdWNrTWFueSBwcm9qZWN0cywgWyAnb3duZXInLCAnbmFtZScgXVxuICAgICwgJ2luaXQnOiBub1xuXG4gICAgIyBSZXNldCBvdXIgaW5kZXggYW5kIHJlLXNvcnQuXG4gICAgQG9ic2VydmUgJ3NvcnRCeScsIC0+XG4gICAgICAjIFVzZSBwb3AgYXMgUmFjdGl2ZSBpcyBnbGl0Y2h5IHdoZW4gcmVzZXR0aW5nIGFycmF5cy5cbiAgICAgIEBzZXQgJ2luZGV4JywgbnVsbFxuICAgICAgI8KgUnVuIHRoZSBzb3J0IGFnYWluLlxuICAgICAgZG8gQHNvcnRcbiAgICAsICdpbml0Jzogbm8iLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgU3lzdGVtIHN0YXRlLlxuc3lzdGVtID0gbmV3IE1vZGVsXG4gIFxuICAnbmFtZSc6ICdtb2RlbHMvc3lzdGVtJ1xuXG4gICdkYXRhJzpcbiAgICAnbG9hZGluZyc6IG5vXG5cbmNvdW50ZXIgPSAwXG5hc3luYyA9IC0+XG4gIGNvdW50ZXIgKz0gMVxuICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgeWVzXG4gIC0+XG4gICAgY291bnRlciAtPSAxXG4gICAgc3lzdGVtLnNldCAnbG9hZGluZycsICtjb3VudGVyXG5cbm1vZHVsZS5leHBvcnRzID0geyBzeXN0ZW0sIGFzeW5jIH0iLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgQ3VycmVudGx5IGxvZ2dlZC1pbiB1c2VyLlxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvdXNlcidcblxuICAjIERlZmF1bHQgdG8gYSBsb2NhbCB1c2VyLlxuICAnZGF0YSc6XG4gICAgJ3Byb3ZpZGVyJzogIFwibG9jYWxcIlxuICAgICdpZCc6ICAgICAgICBcIjBcIlxuICAgICd1aWQnOiAgICAgICBcImxvY2FsOjBcIlxuICAgICd0b2tlbic6ICAgICBudWxsIiwieyBkMyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGhvcml6b250YWw6IChoZWlnaHQsIHgpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh4KVxuICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxuICAgICAgIyBTaG93IHZlcnRpY2FsIGxpbmVzLi4uXG4gICAgICAudGlja1NpemUoLWhlaWdodClcbiAgICAgICMgLi4ud2l0aCBkYXkgb2YgdGhlIG1vbnRoLi4uXG4gICAgICAudGlja0Zvcm1hdCggKGQpIC0+IGQuZ2V0RGF0ZSgpIClcbiAgICAgICMgLi4uYW5kIGdpdmUgdXMgYSBzcGFjZXIuXG4gICAgICAudGlja1BhZGRpbmcoMTApXG5cbiAgdmVydGljYWw6ICh3aWR0aCwgeSkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHkpXG4gICAgICAub3JpZW50KFwibGVmdFwiKVxuICAgICAgLnRpY2tTaXplKC13aWR0aClcbiAgICAgIC50aWNrcyg1KVxuICAgICAgLnRpY2tQYWRkaW5nKDEwKSIsInsgXywgZDMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEEgZ3JhcGggb2YgY2xvc2VkIGlzc3Vlcy5cbiAgIyBgaXNzdWVzYDogICAgIGlzc3VlcyBsaXN0XG4gICMgYGNyZWF0ZWRfYXRgOiBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGB0b3RhbGA6ICAgIHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBhY3R1YWw6IChpc3N1ZXMsIGNyZWF0ZWRfYXQsIHRvdGFsKSAtPlxuICAgIGhlYWQgPSBbIHtcbiAgICAgICdkYXRlJzogbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICAgJ3BvaW50cyc6IHRvdGFsXG4gICAgfSBdXG4gICAgXG4gICAgbWluID0gK0luZmluaXR5IDsgbWF4ID0gLUluZmluaXR5XG5cbiAgICAjIEdlbmVyYXRlIHRoZSBhY3R1YWwgY2xvc2VzLlxuICAgIHJlc3QgPSBfLm1hcCBpc3N1ZXMsIChpc3N1ZSkgLT5cbiAgICAgIHsgc2l6ZSwgY2xvc2VkX2F0IH0gPSBpc3N1ZVxuICAgICAgIyBEZXRlcm1pbmUgdGhlIHJhbmdlLlxuICAgICAgbWluID0gc2l6ZSBpZiBzaXplIDwgbWluXG4gICAgICBtYXggPSBzaXplIGlmIHNpemUgPiBtYXhcblxuICAgICAgIyBEcm9wcGluZyBwb2ludHMgcmVtYWluaW5nLlxuICAgICAgaXNzdWUuZGF0ZSA9IG5ldyBEYXRlIGNsb3NlZF9hdFxuICAgICAgaXNzdWUucG9pbnRzID0gdG90YWwgLT0gc2l6ZVxuICAgICAgaXNzdWVcbiAgICBcbiAgICAjIE5vdyBhZGQgYSByYWRpdXMgaW4gYSByYW5nZSAod2lsbCBiZSB1c2VkIGZvciBhIGNpcmNsZSkuXG4gICAgcmFuZ2UgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oWyBtaW4sIG1heCBdKS5yYW5nZShbIDUsIDggXSlcblxuICAgIHJlc3QgPSBfLm1hcCByZXN0LCAoaXNzdWUpIC0+XG4gICAgICBpc3N1ZS5yYWRpdXMgPSByYW5nZSBpc3N1ZS5zaXplXG4gICAgICBpc3N1ZVxuXG4gICAgW10uY29uY2F0IGhlYWQsIHJlc3RcblxuICAjIEEgZ3JhcGggb2YgYW4gaWRlYWwgcHJvZ3Jlc3Npb24uLlxuICAjIGBhYDogICBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGBiYDogICBtaWxlc3RvbmUgZW5kIGRhdGVcbiAgIyBgdG90YWxgOiB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgaWRlYWw6IChhLCBiLCB0b3RhbCkgLT5cbiAgICAjIFN3YXA/XG4gICAgWyBiLCBhIF0gPSBbIGEsIGIgXSBpZiBiIDwgYVxuXG4gICAgIyBXZSBzdGFydCBoZXJlIGFkZGluZyBkYXlzIHRvIGBkYC5cbiAgICBbIHksIG0sIGQgXSA9IF8ubWFwIGEubWF0Y2goY29uZmlnLmRhdGEuY2hhcnQuZGF0ZXRpbWUpWzFdLnNwbGl0KCctJyksICh2KSAtPiBwYXJzZUludCB2XG4gICAgIyBXZSB3YW50IHRvIGVuZCBoZXJlLlxuICAgIGN1dG9mZiA9IG5ldyBEYXRlKGIpXG5cbiAgICAjIEdvIHRocm91Z2ggdGhlIGJlZ2lubmluZyB0byB0aGUgZW5kIHNraXBwaW5nIG9mZiBkYXlzLlxuICAgIGRheXMgPSBbXSA7IGxlbmd0aCA9IDBcbiAgICBkbyBvbmNlID0gKGluYyA9IDApIC0+XG4gICAgICAjIEEgbmV3IGRheS5cbiAgICAgIGRheSA9IG5ldyBEYXRlIHksIG0gLSAxLCBkICsgaW5jXG4gICAgICBcbiAgICAgICMgRG9lcyB0aGlzIGRheSBjb3VudD9cbiAgICAgIGRheV9vZiA9IDcgaWYgIWRheV9vZiA9IGRheS5nZXREYXkoKVxuICAgICAgaWYgZGF5X29mIGluIGNvbmZpZy5kYXRhLmNoYXJ0Lm9mZl9kYXlzXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSwgb2ZmX2RheTogeWVzIH1cbiAgICAgIGVsc2VcbiAgICAgICAgbGVuZ3RoICs9IDFcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5IH1cbiAgICAgIFxuICAgICAgIyBHbyBhZ2Fpbj9cbiAgICAgIG9uY2UoaW5jICsgMSkgdW5sZXNzIGRheSA+IGN1dG9mZlxuXG4gICAgIyBNYXAgcG9pbnRzIG9uIHRoZSBhcnJheSBvZiBkYXlzIG5vdy5cbiAgICB2ZWxvY2l0eSA9IHRvdGFsIC8gKGxlbmd0aCAtIDEpXG5cbiAgICBkYXlzID0gXy5tYXAgZGF5cywgKGRheSwgaSkgLT5cbiAgICAgIGRheS5wb2ludHMgPSB0b3RhbFxuICAgICAgdG90YWwgLT0gdmVsb2NpdHkgaWYgZGF5c1tpXSBhbmQgbm90IGRheXNbaV0ub2ZmX2RheVxuICAgICAgZGF5XG5cbiAgICAjIERvIHdlIG5lZWQgdG8gbWFrZSBhIGxpbmsgdG8gcmlnaHQgbm93P1xuICAgIGRheXMucHVzaCB7IGRhdGU6IG5vdywgcG9pbnRzOiAwIH0gaWYgKG5vdyA9IG5ldyBEYXRlKCkpID4gY3V0b2ZmXG5cbiAgICBkYXlzXG5cbiAgIyBHcmFwaCByZXByZXNlbnRpbmcgYSB0cmVuZGxpbmcgb2YgYWN0dWFsIGlzc3Vlcy5cbiAgdHJlbmQ6IChhY3R1YWwsIGNyZWF0ZWRfYXQsIGR1ZV9vbikgLT5cbiAgICByZXR1cm4gW10gdW5sZXNzIGFjdHVhbC5sZW5ndGhcblxuICAgIHN0YXJ0ID0gK2FjdHVhbFswXS5kYXRlXG5cbiAgICAjIFZhbHVlcyBpcyBhIGxpc3Qgb2YgdGltZSBmcm9tIHRoZSBzdGFydCBhbmQgcG9pbnRzIHJlbWFpbmluZy5cbiAgICB2YWx1ZXMgPSBfLm1hcCBhY3R1YWwsICh7IGRhdGUsIHBvaW50cyB9KSAtPlxuICAgICAgWyArZGF0ZSAtIHN0YXJ0LCBwb2ludHMgXVxuXG4gICAgIyBOb3cgaXMgYW4gYWN0dWFsIHBvaW50IHRvby5cbiAgICBsYXN0ID0gYWN0dWFsW2FjdHVhbC5sZW5ndGggLSAxXVxuICAgIHZhbHVlcy5wdXNoIFsgKyBuZXcgRGF0ZSgpIC0gc3RhcnQsIGxhc3QucG9pbnRzIF1cblxuICAgICMgaHR0cDovL2NsYXNzcm9vbS5zeW5vbnltLmNvbS9jYWxjdWxhdGUtdHJlbmRsaW5lLTI3MDkuaHRtbFxuICAgIGIxID0gMCA7IGUgPSAwIDsgYzEgPSAwXG4gICAgYSA9IChsID0gdmFsdWVzLmxlbmd0aCkgKiBfLnJlZHVjZSh2YWx1ZXMsIChzdW0sIFsgYSwgYiBdKSAtPlxuICAgICAgYjEgKz0gYSA7IGUgKz0gYlxuICAgICAgYzEgKz0gTWF0aC5wb3coYSwgMilcbiAgICAgIHN1bSArIChhICogYilcbiAgICAsIDApXG5cbiAgICBzbG9wZSA9IChhIC0gKGIxICogZSkpIC8gKChsICogYzEpIC0gKE1hdGgucG93KGIxLCAyKSkpXG4gICAgaW50ZXJjZXB0ID0gKGUgLSAoc2xvcGUgKiBiMSkpIC8gbFxuICAgIGZuID0gKHgpIC0+IHNsb3BlICogeCArIGludGVyY2VwdFxuXG4gICAgIyBNaWxlc3RvbmUgYWx3YXlzIGhhcyBhIGNyZWF0aW9uIGRhdGUuXG4gICAgY3JlYXRlZF9hdCA9IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAjIER1ZSBkYXRlIGNhbiBiZSBlbXB0eS5cbiAgICBkdWVfb24gPSBpZiBkdWVfb24gdGhlbiBuZXcgRGF0ZShkdWVfb24pIGVsc2UgbmV3IERhdGUoKVxuXG4gICAgYSA9IGNyZWF0ZWRfYXQgLSBzdGFydFxuICAgIGIgPSBkdWVfb24gLSBzdGFydFxuXG4gICAgW1xuICAgICAge1xuICAgICAgICAnZGF0ZSc6IGNyZWF0ZWRfYXRcbiAgICAgICAgJ3BvaW50cyc6IGZuKGEpXG4gICAgICB9LCB7XG4gICAgICAgICdkYXRlJzogZHVlX29uXG4gICAgICAgICdwb2ludHMnOiBmbihiKVxuICAgICAgfVxuICAgIF0iLCJ7IF8sIGFzeW5jIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG4jIS91c3IvYmluL2VudiBjb2ZmZWVcbmNvbmZpZyAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBpc3N1ZXMgZm9yIGEgbWlsZXN0b25lLlxuICBmZXRjaEFsbDogKHJlcG8sIGNiKSAtPlxuICAgICMgQ2FsY3VsYXRlIHNpemUgb2YgZWl0aGVyIG9wZW4gb3IgY2xvc2VkIGlzc3Vlcy5cbiAgICAjIE1vZGlmaWVzIGlzc3VlcyBieSByZWYuXG4gICAgY2FsY1NpemUgPSAobGlzdCwgY2IpIC0+XG4gICAgICBzd2l0Y2ggY29uZmlnLmRhdGEuY2hhcnQucG9pbnRzXG4gICAgICAgIHdoZW4gJ09ORV9TSVpFJ1xuICAgICAgICAgIHNpemUgPSBsaXN0Lmxlbmd0aFxuXG4gICAgICAgICAgKCBpc3N1ZS5zaXplID0gMSBmb3IgaXNzdWUgaW4gbGlzdCApXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuICAgICAgICBcbiAgICAgICAgd2hlbiAnTEFCRUxTJ1xuICAgICAgICAgIHNpemUgPSAwXG5cbiAgICAgICAgICBsaXN0ID0gXy5maWx0ZXIgbGlzdCwgKGlzc3VlKSAtPlxuICAgICAgICAgICAgIyBTa2lwIGlmIG5vIGxhYmVscyBleGlzdC5cbiAgICAgICAgICAgIHJldHVybiBubyB1bmxlc3MgbGFiZWxzID0gaXNzdWUubGFiZWxzXG5cbiAgICAgICAgICAgICMgRGV0ZXJtaW5lIHRoZSB0b3RhbCBpc3N1ZSBzaXplIGZyb20gYWxsIGxhYmVscy5cbiAgICAgICAgICAgIGlzc3VlLnNpemUgPSBfLnJlZHVjZSBsYWJlbHMsIChzdW0sIGxhYmVsKSAtPlxuICAgICAgICAgICAgICAjIE5vdCBtYXRjaGluZy5cbiAgICAgICAgICAgICAgcmV0dXJuIHN1bSB1bmxlc3MgbWF0Y2hlcyA9IGxhYmVsLm5hbWUubWF0Y2ggY29uZmlnLmRhdGEuY2hhcnQuc2l6ZV9sYWJlbFxuICAgICAgICAgICAgICAjIEluY3JlYXNlIHN1bS5cbiAgICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEluY3JlYXNlIHRoZSB0b3RhbC5cbiAgICAgICAgICAgIHNpemUgKz0gaXNzdWUuc2l6ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFyZSB3ZSBzYXZpbmcgaXQ/XG4gICAgICAgICAgICAhIWlzc3VlLnNpemVcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG5cbiAgICAjIEZvciBlYWNoIHN0YXRlLi4uXG4gICAgb25lU3RhdHVzID0gKHN0YXRlLCBjYikgLT5cbiAgICAgICMgQ29uY2F0IHRoZW0gaGVyZS5cbiAgICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgICAjIE9uZSBwYWdlZnVsIGZldGNoIChuZXh0IHBhZ2VzIGluIHNlcmllcykuXG4gICAgICBkbyBmZXRjaFBhZ2UgPSAocGFnZT0xKSAtPlxuICAgICAgICByZXF1ZXN0LmFsbElzc3VlcyByZXBvLCB7IHN0YXRlLCBwYWdlIH0sIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgIyBFcnJvcnM/XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICAjIEVtcHR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICAgICAgICMgQ29uY2F0IHNvcnRlZCAoYXBpIGRvZXMgbm90IHNvcnQgb24gY2xvc2VkX2F0ISkuXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IF8uc29ydEJ5IGRhdGEsICdjbG9zZWRfYXQnXG4gICAgICAgICAgIyA8IDEwMCByZXN1bHRzP1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIGlmIGRhdGEubGVuZ3RoIDwgMTAwXG4gICAgICAgICAgIyBGZXRjaCB0aGUgbmV4dCBwYWdlIHRoZW4uXG4gICAgICAgICAgZmV0Y2hQYWdlIHBhZ2UgKyAxXG5cbiAgICAjIEZvciBlYWNoIGBvcGVuYCBhbmQgYGNsb3NlZGAgaXNzdWVzIGluIHBhcmFsbGVsLlxuICAgIGFzeW5jLnBhcmFsbGVsIFtcbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ29wZW4nKSwgICBjYWxjU2l6ZSBdXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdjbG9zZWQnKSwgY2FsY1NpemUgXVxuICAgIF0sIChlcnIsIFsgb3BlbiwgY2xvc2VkIF0pIC0+XG4gICAgICBjYiBlcnIsIHsgb3BlbiwgY2xvc2VkIH0iLCIjIS91c3IvYmluL2VudiBjb2ZmZWVcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBhIG1pbGVzdG9uZS5cbiAgJ2ZldGNoJzogcmVxdWVzdC5vbmVNaWxlc3RvbmVcblxuICAjIEZldGNoIGFsbCBtaWxlc3RvbmVzLlxuICAnZmV0Y2hBbGwnOiByZXF1ZXN0LmFsbE1pbGVzdG9uZXNcblxuICAgICMgIyBHZXQgdGhlIGN1cnJlbnQgbWlsZXN0b25lIG91dCBvZiBtYW55LlxuICAgICMgZWxzZVxuICAgICMgICByZXF1ZXN0LmFsbE1pbGVzdG9uZXMgcmVwbywgKGVyciwgZGF0YSkgLT5cbiAgICAjICAgICAjIEVycm9ycz9cbiAgICAjICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICMgICAgICMgRW1wdHkgd2FybmluZz9cbiAgICAjICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBvcGVuIG1pbGVzdG9uZXMgZm9yIHJlcG8gI3tyZXBvLnBhdGh9XCIgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC5cbiAgICAjICAgICBtID0gZGF0YVswXVxuICAgICMgICAgICMgRmlsdGVyIG1pbGVzdG9uZXMgd2l0aG91dCBkdWUgZGF0ZS5cbiAgICAjICAgICBtID0gXy5yZXN0IGRhdGEsIHsgJ2R1ZV9vbicgOiBudWxsIH1cbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LiBQcmVmZXIgbWlsZXN0b25lcyB3aXRoIGR1ZSBkYXRlcy5cbiAgICAjICAgICBtID0gaWYgbVswXSB0aGVuIG1bMF0gZWxzZSBkYXRhWzBdXG4gICAgIyAgICAgIyBFbXB0eSBtaWxlc3RvbmU/XG4gICAgIyAgICAgaWYgbS5vcGVuX2lzc3VlcyArIG0uY2xvc2VkX2lzc3VlcyBpcyAwXG4gICAgIyAgICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBpc3N1ZXMgZm9yIG1pbGVzdG9uZSBgI3ttLnRpdGxlfWBcIlxuXG4gICAgIyAgICAgY2IgbnVsbCwgbnVsbCwgbSIsInsgXywgU3VwZXJBZ2VudCB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxudXNlciA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcblxuIyBDdXN0b20gSlNPTiBwYXJzZXIuXG5TdXBlckFnZW50LnBhcnNlID1cbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiAocmVzKSAtPlxuICAgIHRyeVxuICAgICAgSlNPTi5wYXJzZSByZXNcbiAgICBjYXRjaCBlXG4gICAgICB7fSAjIGl0IHdhcyBub3QgdG8gYmUuLi5cblxuIyBEZWZhdWx0IGFyZ3MuXG5kZWZhdWx0cyA9XG4gICdnaXRodWInOlxuICAgICdob3N0JzogJ2FwaS5naXRodWIuY29tJ1xuICAgICdwcm90b2NvbCc6ICdodHRwcydcblxuIyBQdWJsaWMgYXBpLlxubW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgIyBHZXQgYSByZXBvLlxuICByZXBvOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfVwiXG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIG9wZW4gbWlsZXN0b25lcy5cbiAgYWxsTWlsZXN0b25lczogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+IFxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXNcIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcbiAgXG4gICMgR2V0IG9uZSBvcGVuIG1pbGVzdG9uZS5cbiAgb25lTWlsZXN0b25lOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lcy8je21pbGVzdG9uZX1cIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgaXNzdWVzIGZvciBhIHN0YXRlLlxuICBhbGxJc3N1ZXM6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgcXVlcnksIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vaXNzdWVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIF8uZXh0ZW5kIHF1ZXJ5LCB7IG1pbGVzdG9uZSwgJ3Blcl9wYWdlJzogJzEwMCcgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4jIE1ha2UgYSByZXF1ZXN0IHVzaW5nIFN1cGVyQWdlbnQuXG5yZXF1ZXN0ID0gKHsgcHJvdG9jb2wsIGhvc3QsIHBhdGgsIHF1ZXJ5LCBoZWFkZXJzIH0sIGNiKSAtPlxuICBleGl0ZWQgPSBub1xuXG4gICMgTWFrZSB0aGUgcXVlcnkgcGFyYW1zLlxuICBxID0gaWYgcXVlcnkgdGhlbiAnPycgKyAoIFwiI3trfT0je3Z9XCIgZm9yIGssIHYgb2YgcXVlcnkgKS5qb2luKCcmJykgZWxzZSAnJ1xuXG4gICMgVGhlIFVSSS5cbiAgcmVxID0gU3VwZXJBZ2VudC5nZXQoXCIje3Byb3RvY29sfTovLyN7aG9zdH0je3BhdGh9I3txfVwiKVxuICAjIEFkZCBoZWFkZXJzLlxuICAoIHJlcS5zZXQoaywgdikgZm9yIGssIHYgb2YgaGVhZGVycyApXG4gIFxuICAjIFRpbWVvdXQgZm9yIHJlcXVlc3RzIHRoYXQgZG8gbm90IGZpbmlzaC4uLiBzZWUgIzMyLlxuICB0aW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNiICdSZXF1ZXN0IGhhcyB0aW1lZCBvdXQnXG4gICwgMWU0ICMgZ2l2ZSB1cyAxMHNcblxuICAjIFNlbmQuXG4gIHJlcS5lbmQgKGVyciwgZGF0YSkgLT5cbiAgICAjIEFycml2ZWQgdG9vIGxhdGUuXG4gICAgcmV0dXJuIGlmIGV4aXRlZFxuICAgICMgQWxsIGZpbmUuXG4gICAgZXhpdGVkID0geWVzXG4gICAgY2xlYXJUaW1lb3V0IHRpbWVvdXRcbiAgICAjIEFjdHVhbGx5IHByb2Nlc3MgdGhlIHJlc3BvbnNlLlxuICAgIHJlc3BvbnNlIGVyciwgZGF0YSwgY2JcblxuIyBIb3cgZG8gd2UgcmVzcG9uZCB0byBhIHJlc3BvbnNlP1xucmVzcG9uc2UgPSAoZXJyLCBkYXRhLCBjYikgLT5cbiAgcmV0dXJuIGNiIGVycm9yIGVyciBpZiBlcnJcbiAgIyAyeHg/XG4gIGlmIGRhdGEuc3RhdHVzVHlwZSBpc250IDJcbiAgICAjIERvIHdlIGhhdmUgYSBtZXNzYWdlIGZyb20gR2l0SHViP1xuICAgIHJldHVybiBjYiBkYXRhLmJvZHkubWVzc2FnZSBpZiBkYXRhPy5ib2R5Py5tZXNzYWdlP1xuICAgICMgVXNlIFNBIG9uZS5cbiAgICByZXR1cm4gY2IgZGF0YS5lcnJvci5tZXNzYWdlXG4gICMgQWxsIGdvb2QuXG4gIGNiIG51bGwsIGRhdGEuYm9keVxuXG4jIEdpdmUgdXMgaGVhZGVycy5cbmhlYWRlcnMgPSAodG9rZW4pIC0+XG4gICMgVGhlIGRlZmF1bHRzLlxuICBoID1cbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzJ1xuICAjIEFkZCB0b2tlbj9cbiAgaC5BdXRob3JpemF0aW9uID0gXCJ0b2tlbiAje3Rva2VufVwiIGlmIHRva2VuP1xuICBoXG5cbmlzVmFsaWQgPSAob2JqKSAtPlxuICBydWxlcyA9XG4gICAgJ293bmVyJzogICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbmFtZSc6ICAgICAgKHZhbCkgLT4gdmFsP1xuICAgICdtaWxlc3RvbmUnOiAodmFsKSAtPiBfLmlzSW50IHZhbFxuICBcbiAgKCByZXR1cm4gbm8gZm9yIGtleSwgdmFsIG9mIG9iaiB3aGVuIGtleSBvZiBydWxlcyBhbmQgbm90IHJ1bGVzW2tleV0odmFsKSApXG5cbiAgeWVzXG5cbiMgU3dpdGNoIHdoZW4gdXNlciBpcyByZWFkeS5cbmlzUmVhZHkgPSB1c2VyLmRhdGEucmVhZHlcblxuIyBBIHN0YWNrIG9mIHJlcXVlc3RzIHRvIGV4ZWN1dGUgb25jZSByZWFkeS5cbnN0YWNrID0gW11cbnJlYWR5ID0gKGNiKSAtPlxuICBpZiBpc1JlYWR5IHRoZW4gZG8gY2IgZWxzZSBzdGFjay5wdXNoIGNiXG5cbiMgT2JzZXJ2ZSB1c2VyJ3MgcmVhZGluZXNzLlxudXNlci5vYnNlcnZlICdyZWFkeScsICh2YWwpIC0+XG4gIGlzUmVhZHkgPSB2YWxcbiAgIyBDbGVhciB0aGUgc3RhY2s/XG4gICggZG8gc3RhY2suc2hpZnQoKSB3aGlsZSBzdGFjay5sZW5ndGggKSBpZiB2YWxcblxuIyBQYXJzZSBhbiBlcnJvci5cbmVycm9yID0gKGVycikgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBfLmlzU3RyaW5nIGVyclxuICAgICAgbWVzc2FnZSA9IGVyclxuICAgIHdoZW4gXy5pc0FycmF5IGVyclxuICAgICAgbWVzc2FnZSA9IGVyclsxXVxuICAgIHdoZW4gXy5pc09iamVjdChlcnIpIGFuZCBfLmlzU3RyaW5nKGVyci5tZXNzYWdlKVxuICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG5cbiAgdW5sZXNzIG1lc3NhZ2VcbiAgICB0cnlcbiAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSBlcnJcbiAgICBjYXRjaFxuICAgICAgbWVzc2FnZSA9IGRvIGVyci50b1N0cmluZ1xuXG4gIG1lc3NhZ2UiLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuTWVkaWF0b3IgPSBSYWN0aXZlLmV4dGVuZCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNZWRpYXRvcigpIiwieyBfLCBkaXJlY3RvciB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4vbWVkaWF0b3IuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcblxuZWwgPSAnI3BhZ2UnXG5cbnBhZ2VzID1cbiAgXCJpbmRleFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvaW5kZXguY29mZmVlXCJcbiAgXCJtaWxlc3RvbmVcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL21pbGVzdG9uZS5jb2ZmZWVcIlxuICBcIm5ld1wiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbmV3LmNvZmZlZVwiXG4gIFwicHJvamVjdFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvcHJvamVjdC5jb2ZmZWVcIlxuXG4jIEFkZCBhIHByb2plY3QgZnJvbSBhIHJvdXRlLlxuYWRkUHJvamVjdCA9IChwYWdlLCBvd25lciwgbmFtZSkgLT5cbiAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfVxuXG4jIFByZWFwcGx5IGFsbCBmdW5jdGlvbnMgd2l0aCBvdXIgcGFnZSBuYW1lL2NvbnRleHQuXG5jID0gKG5hbWUsIGZucz1bXSkgLT5cbiAgKCBfLnBhcnRpYWwgZm4sIG5hbWUgZm9yIGZuIGluIGZucyApXG5cbnZpZXcgPSBudWxsXG5yb3V0ZSA9IChwYWdlLCBhcmdzLi4uKSAtPlxuICAjIFVucmVuZGVyIHRoZSBwcmV2aW91cyBvbmUuXG4gIGRvIHZpZXc/LnRlYXJkb3duXG4gICMgSGlkZSBhbnkgbm90aWZpY2F0aW9ucy5cbiAgbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnkvaGlkZSdcbiAgIyBSZXF1aXJlIHRoZSBuZXcgb25lLlxuICBQYWdlID0gcGFnZXNbcGFnZV1cbiAgIyBSZW5kZXIgaXQuXG4gIHZpZXcgPSBuZXcgUGFnZSB7IGVsLCAnZGF0YSc6IHsgJ3JvdXRlJzogYXJncyB9IH1cblxucm91dGVzID1cbiAgJy8nOiAgICAgICAgICAgICAgICAgICAgICAgIGMgJ2luZGV4JywgWyByb3V0ZSBdXG4gICcvbmV3L3Byb2plY3QnOiAgICAgICAgICAgICBjICduZXcnLCAgIFsgcm91dGUgXVxuICAjIFRoZSBmb2xsb3dpbmcgdHdvIHJvdXRlcyBhZGQgYSBwcm9qZWN0IGluIHRoZSBiYWNrZ3JvdW5kLlxuICAnLzpvd25lci86bmFtZSc6ICAgICAgICAgICAgYyAncHJvamVjdCcsICAgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICcvOm93bmVyLzpuYW1lLzptaWxlc3RvbmUnOiBjICdtaWxlc3RvbmUnLCBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgIyBUT0RPOiByZW1vdmUgaW4gcHJvZHVjdGlvbi5cbiAgJy9yZXNldCc6IC0+XG4gICAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2NsZWFyJ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiMgRmxhdGlyb24gRGlyZWN0b3Igcm91dGVyLlxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3Rvci5Sb3V0ZXIocm91dGVzKS5jb25maWd1cmVcbiAgJ3N0cmljdCc6IG5vICMgYWxsb3cgdHJhaWxpbmcgc2xhc2hlc1xuICBub3Rmb3VuZDogLT5cbiAgICB0aHJvdyA0MDQiLCJ7IG1vbWVudCB9ICA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuIyBQcm9ncmVzcyBpbiAlLlxucHJvZ3Jlc3MgPSAoYSwgYikgLT4gMTAwICogKGEgLyAoYiArIGEpKVxuXG4jIENhbGN1bGF0ZSB0aGUgc3RhdHMgZm9yIGEgbWlsZXN0b25lLlxuIyAgSXMgaXQgb24gdGltZT8gV2hhdCBpcyB0aGUgcHJvZ3Jlc3M/XG5tb2R1bGUuZXhwb3J0cyA9IChtaWxlc3RvbmUpIC0+XG4gICAgaXNEb25lID0gbm8gOyBpc09uVGltZSA9IHllcyA7IGlzT3ZlcmR1ZSA9IG5vXG5cbiAgICAjIFByb2dyZXNzIGluIHBvaW50cy5cbiAgICBwb2ludHMgPSBwcm9ncmVzcyBtaWxlc3RvbmUuaXNzdWVzLmNsb3NlZC5zaXplLCBtaWxlc3RvbmUuaXNzdWVzLm9wZW4uc2l6ZSAgICBcbiAgICBpc0RvbmUgPSB5ZXMgaWYgcG9pbnRzIGlzIDEwMFxuXG4gICAgIyBNaWxlc3RvbmVzIHdpdGggbm8gZHVlIGRhdGUgYXJlIGFsd2F5cyBvbiB0cmFjay5cbiAgICByZXR1cm4geyBpc092ZXJkdWUsIGlzT25UaW1lLCBpc0RvbmUsICdwcm9ncmVzcyc6IHsgcG9pbnRzIH0gfSB1bmxlc3MgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgYSA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuY3JlYXRlZF9hdFxuICAgIGIgPSArbmV3IERhdGVcbiAgICBjID0gK25ldyBEYXRlIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgT3ZlcmR1ZT9cbiAgICBpc092ZXJkdWUgPSB5ZXMgaWYgYiA+IGNcblxuICAgICMgUHJvZ3Jlc3MgaW4gdGltZS5cbiAgICB0aW1lID0gcHJvZ3Jlc3MgYiAtIGEsIGMgLSBiXG5cbiAgICAjIEhvdyBtYW55IGRheXMgaXMgMSUgb2YgdGhlIHRpbWU/XG4gICAgZGF5cyA9IChtb21lbnQoYikuZGlmZihtb21lbnQoYSksICdkYXlzJykpIC8gMTAwXG5cbiAgICAjIEFyZSB3ZSBvbiB0aW1lP1xuICAgIGlzT25UaW1lID0gcG9pbnRzID4gdGltZVxuXG4gICAge1xuICAgICAgaXNEb25lLCBkYXlzLCBpc09uVGltZSwgaXNPdmVyZHVlXG4gICAgICAncHJvZ3Jlc3MnOiB7IHBvaW50cywgdGltZSB9XG4gICAgfSIsIiMgQWxsIG91ciB2ZW5kb3IgZGVwZW5kZW5jaWVzIGluIG9uZSBwbGFjZS5cbm1vZHVsZS5leHBvcnRzID1cbiAgJ18nOiB3aW5kb3cuX1xuICAnUmFjdGl2ZSc6IHdpbmRvdy5SYWN0aXZlXG4gICdGaXJlYmFzZSc6IHdpbmRvdy5GaXJlYmFzZVxuICAnRmlyZWJhc2VTaW1wbGVMb2dpbic6IHdpbmRvdy5GaXJlYmFzZVNpbXBsZUxvZ2luXG4gICdTdXBlckFnZW50Jzogd2luZG93LnN1cGVyYWdlbnRcbiAgJ2FzeW5jJzogd2luZG93LmFzeW5jXG4gICdtb21lbnQnOiB3aW5kb3cubW9tZW50XG4gICdkMyc6IHdpbmRvdy5kM1xuICAnbWFya2VkJzogd2luZG93Lm1hcmtlZFxuICAnZGlyZWN0b3InOlxuICAgICdSb3V0ZXInOiB3aW5kb3cuUm91dGVyXG4gICdsc2NhY2hlJzogd2luZG93LmxzY2FjaGVcbiAgJ3NvcnRlZEluZGV4Q21wJzogd2luZG93LnNvcnRlZEluZGV4XG4gICdzZW12ZXInOiByZXF1aXJlICdzZW12ZXInIiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFwcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJOb3RpZnlcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJIZWFkZXJcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicGFnZVwifSxcImZcIjpbXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOltcIiZjb3B5OyAyMDEyLTIwMTQgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiaHR0cDovL2Nsb3VkZmkucmVcIn0sXCJmXCI6W1wiQ2xvdWRmaXJlIFN5c3RlbXNcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY2hhcnRcIn19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVhZFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTMsXCJyXCI6XCJ1c2VyXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicmlnaHRcIn0sXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcImRpc3BsYXlOYW1lXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwiZGlzcGxheU5hbWVcIn0sXCIgbG9nZ2VkIGluXCJdfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcImdpdGh1YlwifSxcInZcIjp7XCJjbGlja1wiOlwiIWxvZ2luXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiZ2l0aHViXCJ9fSxcIiBTaWduIEluXCJdfV0sXCJyXCI6XCJkaXNwbGF5TmFtZVwifV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJpZFwiOlwiaWNvblwiLFwiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ1bFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIGEgUHJvamVjdFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJmYXFcIn0sXCJmXCI6W1wiRkFRXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI3Jlc2V0XCJ9LFwiZlwiOltcIkRCIFJlc2V0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25vdGlmeVwifSxcImZcIjpbXCJOb3RpZnlcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVyb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY29udGVudFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImFkZHJlc3NcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJTZWUgeW91ciBwcm9qZWN0IHByb2dyZXNzXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJOb3Qgc3VyZSB3aGVyZSB0byBzdGFydD8gSnVzdCBhZGQgYSBkZW1vIHJlcG8gdG8gc2VlIGEgY2hhcnQuIFRoZXJlIGFyZSBtYW55IHZhcmlhdGlvbnMgb2YgcGFzc2FnZXMgb2YgTG9yZW0gSXBzdW0gYXZhaWxhYmxlLCBidXQgdGhlIG1ham9yaXR5IGhhdmUgc3VmZmVyZWQgYWx0ZXJhdGlvbiBpbiBzb21lIGZvcm0sIGJ5IGluamVjdGVkIGh1bW91ciwgb3IgcmFuZG9taXNlZCB3b3JkcyB3aGljaCBkb24ndCBsb29rIGV2ZW4gc2xpZ2h0bHkgYmVsaWV2YWJsZS5cIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImN0YVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwicHJpbWFyeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIHlvdXIgcHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNlY29uZGFyeVwifSxcImZcIjpbXCJSZWFkIHRoZSBHdWlkZVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcImNvZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpY29uIFwiLHtcInRcIjoyLFwiclwiOlwiaWNvblwifV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiY29kZVwiXSxcInNcIjpcIlxcXCImI1xcXCIrXzArXFxcIjtcXFwiXCJ9fV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInRleHRcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJzeXN0ZW1cIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn0sXCIgc3lzdGVtXCJdLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJyXCI6XCJ0b3BcIn0sXCIlXCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9XSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJ0b3BcIl0sXCJzXCI6XCItXzBcIn19LFwicHhcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiY2xvc2VcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcImNsb3NlXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dLFwiclwiOlwic3lzdGVtXCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiUHJvamVjdHNcIixcImFcIjp7XCJwcm9qZWN0c1wiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RzXCJ9XX19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkhlcm9cIn1dLFwiclwiOlwicHJvamVjdHMubGlzdFwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS50aXRsZVwiXSxcInNcIjpcIl8wLnRpdGxlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwic3ViXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImFcIjp7XCJjbGFzc1wiOlwiZGVzY3JpcHRpb25cIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kZXNjcmlwdGlvblwiXSxcInNcIjpcIl8wLm1hcmtkb3duKF8xKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiQ2hhcnRcIixcImFcIjp7XCJtaWxlc3RvbmVcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmVcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJBZGQgYSBQcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJUeXBlIGluIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IGFzIHlvdSB3b3VsZCBub3JtYWxseS4gSWYgeW91J2QgbGlrZSB0byBhZGQgYSBwcml2YXRlIEdpdEh1YiBwcm9qZWN0LCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOltcIlNpZ24gSW5cIl19LFwiIGZpcnN0LlwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb3JtXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImlucHV0XCIsXCJhXCI6e1widHlwZVwiOlwidGV4dFwiLFwicGxhY2Vob2xkZXJcIjpcInVzZXIvcmVwb1wiLFwiYXV0b2NvbXBsZXRlXCI6XCJvZmZcIixcInZhbHVlXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfSxcInZcIjp7XCJrZXl1cFwiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJ2XCI6e1wiY2xpY2tcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fSxcImZcIjpbXCJBZGRcIl19XX1dfV19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJyb3V0ZVwiXSxcInNcIjpcIl8wLmpvaW4oXFxcIi9cXFwiKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTWlsZXN0b25lc1wiLFwiYVwiOntcInByb2plY3RcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0XCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInNvcnRcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcInNvcnRCeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInNvcnQtYWxwaGFiZXRcIn19LFwiIFNvcnRlZCBieSBcIix7XCJ0XCI6MixcInJcIjpcInByb2plY3RzLnNvcnRCeVwifV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJNaWxlc3RvbmVzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5pbmRleFwiLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiLlwiXSxcInNcIjpcIntpbmRleDpfMH1cIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4wXCIsXCJwcm9qZWN0cy5saXN0XCJdLFwic1wiOlwie3A6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJ4XCI6e1wiclwiOltcInAub3duZXJcIixcInByb2plY3Qub3duZXJcIixcInAubmFtZVwiLFwicHJvamVjdC5uYW1lXCJdLFwic1wiOlwiXzA9PV8xJiZfMj09XzNcIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4xXCIsXCJwcm9qZWN0Lm1pbGVzdG9uZXNcIl0sXCJzXCI6XCJ7bWlsZXN0b25lOl8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImFcIjp7XCJjbGFzc1wiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc0RvbmVcIixcImZcIjpbXCJkb25lXCJdfV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS50aXRsZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcInN0eWxlXCI6XCJ3aWR0aDoxJVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvZ3Jlc3NcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJwZXJjZW50XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiZHVlIFwiLHtcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzT3ZlcmR1ZVwiLFwiZlwiOltcInJlZFwiXX1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwic29ydFwifSxcInZcIjp7XCJjbGlja1wiOlwic29ydEJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IFwiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdHMuc29ydEJ5XCJ9XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlByb2plY3RzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwiZXJyb3JzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNvbHNwYW5cIjpcIjNcIixcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZXJyb3JcIixcInRpdGxlXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJlcnJvcnNcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCJcXFxcblxcXCIpXCJ9fV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYXR0ZW50aW9uXCJ9fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cHJvamVjdDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInByb2plY3RcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiYVwiOntcImNsYXNzXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLmlzRG9uZVwiLFwiZlwiOltcImRvbmVcIl19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJjbGFzc1wiOlwicmVwb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5udW1iZXJcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUudGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOltcImR1ZSBcIix7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5pc092ZXJkdWVcIixcImZcIjpbXCJyZWRcIl19XX0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLmlzT25UaW1lXCJdLFwic1wiOlwiKF8wKT9cXFwiZ3JlZW5cXFwiOlxcXCJyZWRcXFwiXCJ9fV0sXCJzdHlsZVwiOltcIndpZHRoOlwiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfV19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImNvZ1wifX0sXCIgRWRpdFwiXX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIG5vdzogLT4gbmV3IERhdGUoKS50b0pTT04oKSIsInsgXywgbW9tZW50LCBtYXJrZWQgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgVGltZSBmcm9tIG5vdy5cbiAgZnJvbU5vdzogXy5tZW1vaXplIChqc29uRGF0ZSkgLT5cbiAgICBtb21lbnQobmV3IERhdGUoanNvbkRhdGUpKS5mcm9tTm93KClcblxuICAjIFdoZW4gaXMgYSBtaWxlc3RvbmUgZHVlP1xuICBkdWU6IChqc29uRGF0ZSkgLT5cbiAgICByZXR1cm4gJyZuYnNwOycgdW5sZXNzIGpzb25EYXRlXG4gICAgWyAnZHVlJywgQGZyb21Ob3cganNvbkRhdGUgXS5qb2luKCcgJylcblxuICAjIE1hcmtkb3duIGZvcm1hdHRpbmcuXG4gIG1hcmtkb3duOiAobWFya3VwKSAtPlxuICAgIG1hcmtlZCBtYXJrdXBcblxuICAjIEZvcm1hdCBtaWxlc3RvbmUgdGl0bGUuXG4gIHRpdGxlOiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbWlsZXN0b25lJykgPiAtMVxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIFsgJ01pbGVzdG9uZScsIHRleHQgXS5qb2luKCcgJylcblxuICAjIEhleCB0byBkZWNpbWFsLlxuICBoZXhUb0RlYzogKGhleCkgLT5cbiAgICBwYXJzZUludCBoZXgsIDE2IiwibW9kdWxlLmV4cG9ydHMgPVxuICBpczogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwudHlwZSBpbiBbICdrZXl1cCcsICdrZXlkb3duJyBdXG5cbiAgaXNFbnRlcjogKGV2dCkgLT5cbiAgICBldnQub3JpZ2luYWwud2hpY2ggaXMgMTMiLCJ7IF8gfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuXy5taXhpblxuICAncGx1Y2tNYW55JzogKHNvdXJjZSwga2V5cykgLT5cbiAgICB0aHJvdyAnYGtleXNgIG5lZWRzIHRvIGJlIGFuIEFycmF5JyB1bmxlc3MgXy5pc0FycmF5IGtleXNcbiAgICBfLm1hcCBzb3VyY2UsIChpdGVtKSAtPlxuICAgICAgb2JqID0ge31cbiAgICAgIF8uZWFjaCBrZXlzLCAoa2V5KSAtPlxuICAgICAgICBvYmpba2V5XSA9IGl0ZW1ba2V5XVxuICAgICAgb2JqXG5cbiAgJ2lzSW50JzogKHZhbCkgLT5cbiAgICBub3QgaXNOYU4odmFsKSBhbmQgcGFyc2VJbnQoTnVtYmVyKHZhbCkpIGlzIHZhbCBhbmQgbm90IGlzTmFOKHBhcnNlSW50KHZhbCwgMTApKSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRzKSAtPlxuICBNb2RlbCA9IFJhY3RpdmUuZXh0ZW5kKG9wdHMpXG4gIG1vZGVsID0gbmV3IE1vZGVsKClcbiAgbW9kZWwucmVuZGVyKClcbiAgbW9kZWwiLCJ7IFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmxpbmVzID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9saW5lcy5jb2ZmZWUnXG5heGVzICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvY2hhcnQuaHRtbCdcblxuICBvbmNvbXBsZXRlOiAtPlxuICAgIG1pbGVzdG9uZSA9IEBkYXRhLm1pbGVzdG9uZVxuICAgIGlzc3VlcyA9IG1pbGVzdG9uZS5pc3N1ZXNcbiAgICAjIFRvdGFsIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIG1pbGVzdG9uZS5cbiAgICB0b3RhbCA9IGlzc3Vlcy5vcGVuLnNpemUgKyBpc3N1ZXMuY2xvc2VkLnNpemVcblxuXG4gICAgIyBBbiBpc3N1ZSBtYXkgaGF2ZSBiZWVuIGNsb3NlZCBiZWZvcmUgdGhlIHN0YXJ0IG9mIGEgbWlsZXN0b25lLlxuICAgIGhlYWQgPSBpc3N1ZXMuY2xvc2VkLmxpc3RbMF0uY2xvc2VkX2F0XG4gICAgaWYgaXNzdWVzLmxlbmd0aCBhbmQgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPiBoZWFkXG4gICAgICAjIFRoaXMgaXMgdGhlIG5ldyBzdGFydC5cbiAgICAgIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID0gaGVhZFxuXG4gICAgIyBBY3R1YWwsIGlkZWFsICYgdHJlbmQgbGluZXMuXG4gICAgYWN0dWFsID0gbGluZXMuYWN0dWFsIGlzc3Vlcy5jbG9zZWQubGlzdCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIHRvdGFsXG4gICAgaWRlYWwgID0gbGluZXMuaWRlYWwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb24sIHRvdGFsXG4gICAgdHJlbmQgID0gbGluZXMudHJlbmQgYWN0dWFsLCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgIyBHZXQgYXZhaWxhYmxlIHNwYWNlLlxuICAgIHsgaGVpZ2h0LCB3aWR0aCB9ID0gZG8gQGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXG4gICAgbWFyZ2luID0geyAndG9wJzogMzAsICdyaWdodCc6IDMwLCAnYm90dG9tJzogNDAsICdsZWZ0JzogNTAgfVxuICAgIHdpZHRoIC09IG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0XG4gICAgaGVpZ2h0IC09IG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tXG5cbiAgICAjIFNjYWxlcy5cbiAgICB4ID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFsgMCwgd2lkdGggXSlcbiAgICB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoWyBoZWlnaHQsIDAgXSlcblxuICAgICMgQXhlcy5cbiAgICB4QXhpcyA9IGF4ZXMuaG9yaXpvbnRhbCBoZWlnaHQsIHhcbiAgICB5QXhpcyA9IGF4ZXMudmVydGljYWwgd2lkdGgsIHlcblxuICAgICMgTGluZSBnZW5lcmF0b3IuXG4gICAgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIilcbiAgICAueCggKGQpIC0+IHgoZC5kYXRlKSApXG4gICAgLnkoIChkKSAtPiB5KGQucG9pbnRzKSApXG5cbiAgICAjIEdldCB0aGUgbWluaW11bSBhbmQgbWF4aW11bSBkYXRlLCBhbmQgaW5pdGlhbCBwb2ludHMuXG4gICAgeC5kb21haW4oWyBpZGVhbFswXS5kYXRlLCBpZGVhbFtpZGVhbC5sZW5ndGggLSAxXS5kYXRlIF0pXG4gICAgeS5kb21haW4oWyAwLCBpZGVhbFswXS5wb2ludHMgXSkubmljZSgpXG5cbiAgICAjIEFkZCBhbiBTVkcgZWxlbWVudCB3aXRoIHRoZSBkZXNpcmVkIGRpbWVuc2lvbnMgYW5kIG1hcmdpbi5cbiAgICBzdmcgPSBkMy5zZWxlY3QodGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcjY2hhcnQnKSkuYXBwZW5kKFwic3ZnXCIpXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxuXG4gICAgIyBBZGQgdGhlIGRheXMgeC1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBkYXlcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbCh4QXhpcylcblxuICAgICMgQWRkIHRoZSBtb250aHMgeC1heGlzLlxuICAgIG0gPSBbXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLFxuICAgICAgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ1xuICAgIF1cblxuICAgIG1BeGlzID0geEF4aXNcbiAgICAub3JpZW50KFwidG9wXCIpXG4gICAgLnRpY2tTaXplKGhlaWdodClcbiAgICAudGlja0Zvcm1hdCggKGQpIC0+IG1bZC5nZXRNb250aCgpXSApXG4gICAgLnRpY2tzKDIpXG4gICAgXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIG1vbnRoXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwobUF4aXMpXG5cbiAgICAjIEFkZCB0aGUgeS1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgIC5jYWxsKHlBeGlzKVxuXG4gICAgIyBBZGQgYSBsaW5lIHNob3dpbmcgd2hlcmUgd2UgYXJlIG5vdy5cbiAgICBzdmcuYXBwZW5kKFwic3ZnOmxpbmVcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXlcIilcbiAgICAuYXR0cihcIngxXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MVwiLCAwKVxuICAgIC5hdHRyKFwieDJcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkyXCIsIGhlaWdodClcblxuICAgICMgQWRkIHRoZSBpZGVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiaWRlYWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwiYmFzaXNcIikoaWRlYWwpKVxuXG4gICAgIyBBZGQgdGhlIHRyZW5kbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRyZW5kbGluZSBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikodHJlbmQpKVxuXG4gICAgIyBBZGQgdGhlIGFjdHVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiYWN0dWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKS55KCAoZCkgLT4geShkLnBvaW50cykgKShhY3R1YWwpKVxuXG4gICAgIyBDb2xsZWN0IHRoZSB0b29sdGlwIGhlcmUuXG4gICAgdG9vbHRpcCA9IGQzLnRpcCgpLmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpLmh0bWwgKHsgbnVtYmVyLCB0aXRsZSB9KSAtPlxuICAgICAgXCIjI3tudW1iZXJ9OiAje3RpdGxlfVwiXG5cbiAgICBzdmcuY2FsbCh0b29sdGlwKVxuXG4gICAgIyBTaG93IHdoZW4gd2UgY2xvc2VkIGFuIGlzc3VlLlxuICAgIHN2Zy5zZWxlY3RBbGwoXCJhLmlzc3VlXCIpXG4gICAgLmRhdGEoYWN0dWFsLnNsaWNlKDEpKSAjIHNraXAgdGhlIHN0YXJ0aW5nIHBvaW50XG4gICAgLmVudGVyKClcbiAgICAjIEEgd3JhcHBpbmcgbGluay5cbiAgICAuYXBwZW5kKCdzdmc6YScpXG4gICAgLmF0dHIoXCJ4bGluazpocmVmXCIsICh7IGh0bWxfdXJsIH0pIC0+IGh0bWxfdXJsIClcbiAgICAuYXR0cihcInhsaW5rOnNob3dcIiwgJ25ldycpXG4gICAgLmFwcGVuZCgnc3ZnOmNpcmNsZScpXG4gICAgLmF0dHIoXCJjeFwiLCAoeyBkYXRlIH0pIC0+IHggZGF0ZSApXG4gICAgLmF0dHIoXCJjeVwiLCAoeyBwb2ludHMgfSkgLT4geSBwb2ludHMgKVxuICAgIC5hdHRyKFwiclwiLCAgKHsgcmFkaXVzIH0pIC0+IDUgKSAjIGZpeGVkIGZvciBub3dcbiAgICAub24oJ21vdXNlb3ZlcicsIHRvb2x0aXAuc2hvdylcbiAgICAub24oJ21vdXNlb3V0JywgdG9vbHRpcC5oaWRlKVxuIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbnsgc3lzdGVtIH0gPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbmZpcmViYXNlICAgPSByZXF1aXJlICcuLi9tb2RlbHMvZmlyZWJhc2UuY29mZmVlJ1xudXNlciAgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy91c2VyLmNvZmZlZSdcbkljb25zICAgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlYWRlcidcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd1c2VyJzogdXNlclxuICAgICMgRGVmYXVsdCBhcHAgaWNvbi5cbiAgICAnaWNvbic6ICdmaXJlLXN0YXRpb24nXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIExvZ2luIHVzZXIuXG4gICAgQG9uICchbG9naW4nLCAtPlxuICAgICAgZmlyZWJhc2UubG9naW4gKGVycikgLT5cbiAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU3dpdGNoIGxvYWRpbmcgaWNvbiB3aXRoIGFwcCBpY29uLlxuICAgIHN5c3RlbS5vYnNlcnZlICdsb2FkaW5nJywgKHlhKSA9PlxuICAgICAgQHNldCAnaWNvbicsIGlmIHlhIHRoZW4gJ3NwaW5uZXIxJyBlbHNlICdmaXJlLXN0YXRpb24nIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVybydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVyby5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5mb3JtYXQgPSByZXF1aXJlICcuLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG4jIEZvbnRlbGxvIGljb24gaGV4IGNvZGVzLlxuY29kZXMgPVxuICAnY29nJzogICAgICAgICAgICdcXGU4MDAnXG4gICdzZWFyY2gnOiAgICAgICAgJ1xcZTgwMSdcbiAgJ2dpdGh1Yic6ICAgICAgICAnXFxlODAyJ1xuICAnYWRkcmVzcyc6ICAgICAgICdcXGU4MDMnXG4gICdwbHVzLWNpcmNsZWQnOiAgJ1xcZTgwNCdcbiAgJ2ZpcmUtc3RhdGlvbic6ICAnXFxlODA1J1xuICAnc29ydC1hbHBoYWJldCc6ICdcXGU4MDYnXG4gICdkb3duLW9wZW4nOiAgICAgJ1xcZTgwNydcbiAgJ3NwaW42JzogICAgICAgICAnXFxlODA4J1xuICAnbWVnYXBob25lJzogICAgICdcXGU4MDknXG4gICdzcGluNCc6ICAgICAgICAgJ1xcZTgwYSdcbiAgJ3NwaW5uZXIxJzogICAgICAnXFxlODBiJ1xuICAnYXR0ZW50aW9uJzogICAgICdcXGU4MGMnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9pY29ucydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaWNvbnMuaHRtbCdcblxuICAnaXNvbGF0ZWQnOiB5ZXNcblxuICBvbnJlbmRlcjogLT5cbiAgICBAb2JzZXJ2ZSAnaWNvbicsIChpY29uKSAtPlxuICAgICAgaWYgaWNvbiBhbmQgaGV4ID0gY29kZXNbaWNvbl1cbiAgICAgICAgQHNldCAnY29kZScsIGZvcm1hdC5oZXhUb0RlYyBoZXhcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCAnY29kZScsIG51bGwiLCJ7IF8sIFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5IRUlHSFQgPSA2OCAjIGhlaWdodCBvZiBkaXYgaW4gcHhcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL25vdGlmeSdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd0b3AnOiBIRUlHSFRcbiAgICAnaGlkZGVuJzogeWVzXG4gICAgJ2RlZmF1bHRzJzpcbiAgICAgICd0ZXh0JzogJydcbiAgICAgICd0eXBlJzogJycgIyBibGFuZCBncmV5IHN0eWxlXG4gICAgICAnc3lzdGVtJzogbm9cbiAgICAgICdpY29uJzogJ21lZ2FwaG9uZSdcbiAgICAgICd0dGwnOiAgNWUzXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICAjIFNob3cgYSBub3RpZmljYXRpb24uXG4gIHNob3c6IChvcHRzKSAtPlxuICAgIEBzZXQgJ2hpZGRlbicsIG5vICAgIFxuICAgICMgU2V0IHRoZSBvcHRzLlxuICAgIEBzZXQgb3B0cyA9IF8uZGVmYXVsdHMgb3B0cywgQGRhdGEuZGVmYXVsdHNcbiAgICAjIFdoaWNoIHBvc2l0aW9uIHRvIHNsaWRlIHRvP1xuICAgIHBvcyA9IFsgMCwgNTAgXVsgK29wdHMuc3lzdGVtIF0gIyAwcHggb3IgNTAlIGZyb20gdG9wXG4gICAgIyBTbGlkZSBpbnRvIHZpZXcuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIHBvcyxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdib3VuY2UnKVxuICAgICAgJ2R1cmF0aW9uJzogODAwXG4gICAgXG4gICAgIyBJZiBubyB0dGwgdGhlbiBzaG93IHBlcm1hbmVudGx5LlxuICAgIHJldHVybiB1bmxlc3Mgb3B0cy50dGxcblxuICAgICMgU2xpZGUgb3V0IG9mIHRoZSB2aWV3LlxuICAgIF8uZGVsYXkgXy5iaW5kKEBoaWRlLCBAKSwgb3B0cy50dGxcblxuICAjIEhpZGUgYSBub3RpZmljYXRpb24uXG4gIGhpZGU6IC0+XG4gICAgcmV0dXJuIGlmIEBkYXRhLmhpZGRlblxuICAgIEBzZXQgJ2hpZGRlbicsIHllc1xuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIEhFSUdIVCxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdiYWNrJylcbiAgICAgICdjb21wbGV0ZSc6ID0+XG4gICAgICAgICMgUmVzZXQgdGhlIHRleHQgd2hlbiBhbGwgaXMgZG9uZS5cbiAgICAgICAgQHNldCAndGV4dCcsIG51bGxcbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgT24gb3V0c2lkZSBtZXNzYWdlcy5cbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnknLCBfLmJpbmQgQHNob3csIEBcbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnkvaGlkZScsIF8uYmluZCBAaGlkZSwgQFxuXG4gICAgIyBDbG9zZSB1cyBwcmVtYXR1cmVseS4uLlxuICAgIEBvbiAnY2xvc2UnLCBAaGlkZSIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuSGVybyAgICAgPSByZXF1aXJlICcuLi9oZXJvLmNvZmZlZSdcblByb2plY3RzID0gcmVxdWlyZSAnLi4vdGFibGVzL3Byb2plY3RzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2luZGV4J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBIZXJvLCBQcm9qZWN0cyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQnVybmNoYXJ0OiBHaXRIdWIgQnVybmRvd24gQ2hhcnQgYXMgYSBTZXJ2aWNlJ1xuXG4gICAgIyBRdWl0IGlmIHdlIGhhdmUgbm8gcHJvamVjdHMuXG4gICAgcmV0dXJuIEBzZXQoJ3JlYWR5JywgeWVzKSB1bmxlc3MgcHJvamVjdHMubGlzdC5sZW5ndGhcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgRm9yIGFsbCBwcm9qZWN0cy5cbiAgICBhc3luYy5tYXAgcHJvamVjdHMuZGF0YS5saXN0LCAocHJvamVjdCwgY2IpIC0+XG4gICAgICAjIEZldGNoIHRoZWlyIG1pbGVzdG9uZXMuXG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIChlcnIsIGxpc3QpIC0+XG4gICAgICAgICMgU2F2ZSB0aGUgZXJyb3IgaWYgcHJvamVjdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICMgTm93IGFkZCBpbiB0aGUgaXNzdWVzLlxuICAgICAgICBhc3luYy5lYWNoIGxpc3QsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsIGlmIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsICh7IG51bWJlciB9KSAtPlxuICAgICAgICAgICAgbWlsZXN0b25lLm51bWJlciBpcyBudW1iZXJcbiAgICAgICAgICBcbiAgICAgICAgICAjIE9LIGZldGNoIGFsbCB0aGUgaXNzdWVzIGZvciB0aGlzIG1pbGVzdG9uZSB0aGVuLlxuICAgICAgICAgIGlzc3Vlcy5mZXRjaEFsbFxuICAgICAgICAgICAgJ293bmVyJzogcHJvamVjdC5vd25lclxuICAgICAgICAgICAgJ25hbWUnOiBwcm9qZWN0Lm5hbWVcbiAgICAgICAgICAgICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICAgLCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgICAjIFNhdmUgYW55IGVycm9ycyBvbiB0aGUgcHJvamVjdC5cbiAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICAgICAjIEFkZCBpbiB0aGUgaXNzdWVzIHRvIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBtaWxlc3RvbmVcbiAgICAgICAgICAgICMgRG9uZVxuICAgICAgICAgICAgZG8gY2JcbiAgICAgICAgXG4gICAgICAgICwgY2JcblxuICAgICwgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5DaGFydCA9IHJlcXVpcmUgJy4uL2NoYXJ0LmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbmZvcm1hdCAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBDaGFydCB9XG5cbiAgJ2RhdGEnOlxuICAgICdmb3JtYXQnOiBmb3JtYXRcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSBdID0gQGdldCAncm91dGUnXG4gIFxuICAgIG1pbGVzdG9uZSA9IHBhcnNlSW50IG1pbGVzdG9uZVxuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX0vI3ttaWxlc3RvbmV9XCJcblxuICAgICMgR2V0IHRoZSBhc3NvY2lhdGVkIHByb2plY3QuXG4gICAgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICBvYmogPSBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCB7ICdudW1iZXInOiBtaWxlc3RvbmUgfVxuICAgIHJldHVybiBAc2V0IHsgJ21pbGVzdG9uZSc6IG9iaiwgJ3JlYWR5JzogeWVzIH0gaWYgb2JqP1xuXG4gICAgIyBXZSBhcmUgbG9hZGluZyB0aGUgbWlsZXN0b25lcyB0aGVuLlxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgIGZldGNoTWlsZXN0b25lID0gKGNiKSAtPlxuICAgICAgbWlsZXN0b25lcy5mZXRjaCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGRhdGEsIGNiKSAtPlxuICAgICAgaXNzdWVzLmZldGNoQWxsIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCAoZXJyLCBvYmopIC0+XG4gICAgICAgIGNiIGVyciwgXy5leHRlbmQgZGF0YSwgeyAnaXNzdWVzJzogb2JqIH1cblxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEdldCB0aGUgbWlsZXN0b25lLlxuICAgICAgZmV0Y2hNaWxlc3RvbmUsXG4gICAgICAjIFRoZW4gYWxsIGl0cyBpc3N1ZXMuXG4gICAgICBmZXRjaElzc3Vlc1xuICAgIF0sIChlcnIsIGRhdGEpID0+XG4gICAgICBkbyBkb25lXG4gICAgICByZXR1cm4gbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBkYXRhXG5cbiAgICAgICMgU2hvdyB0aGUgcGFnZS5cbiAgICAgIEBzZXRcbiAgICAgICAgJ21pbGVzdG9uZSc6IGRhdGFcbiAgICAgICAgJ3JlYWR5JzogeWVzIiwieyBfLCBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5rZXkgICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2tleS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9uZXcnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL25ldy5odG1sJ1xuXG4gICdkYXRhJzogeyAndmFsdWUnOiAncmFkZWtzdGVwYW4vZGlzcG9zYWJsZScsIHVzZXIgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICAjIExpc3RlbiB0byBFbnRlciBrZXlwcmVzcyBvciBTdWJtaXQgYnV0dG9uIGNsaWNrLlxuICBzdWJtaXQ6IChldnQsIHZhbHVlKSAtPlxuICAgIHJldHVybiBpZiBrZXkuaXMoZXZ0KSBhbmQgbm90IGtleS5pc0VudGVyKGV2dClcblxuICAgIFsgb3duZXIsIG5hbWUgXSA9IHZhbHVlLnNwbGl0KCcvJylcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgU2F2ZSByZXBvLlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH0sIChlcnIpIC0+XG4gICAgICBkbyBkb25lXG5cbiAgICAgIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5JyxcbiAgICAgICAgJ3RleHQnOiBlcnIgb3IgXCJQcm9qZWN0ICN7dmFsdWV9IHNhdmVkLlwiXG4gICAgICAgICd0eXBlJzogaWYgZXJyIHRoZW4gJ2Vycm9yJyBlbHNlICdzdWNjZXNzJ1xuXG4gICAgICAjIFJlZGlyZWN0IHRvIHRoZSBkYXNoYm9hcmQuXG4gICAgICAjIFRPRE86IHRyaWdnZXIgYSBuYW1lZCByb3V0ZVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdBZGQgYSBuZXcgcHJvamVjdCdcblxuICAgICMgVE9ETzogYXV0b2NvbXBsZXRlIG9uIG91ciB1c2VybmFtZSBpZiB3ZSBhcmUgbG9nZ2VkIGluIG9yIGJhc2VkXG4gICAgIyAgb24gcmVwb3Mgd2UgYWxyZWFkeSBoYXZlLlxuICAgIGF1dG9jb21wbGV0ZSA9ICh2YWx1ZSkgLT5cblxuICAgIEBvYnNlcnZlICd2YWx1ZScsIF8uZGVib3VuY2UoYXV0b2NvbXBsZXRlLCAyMDApLCB7ICdpbml0Jzogbm8gfVxuXG4gICAgIyBGb2N1cyBvbiB0aGUgaW5wdXQgZmllbGQuXG4gICAgZG8gQGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXNcblxuICAgIEBvbiAnc3VibWl0JywgQHN1Ym1pdCIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL3Byb2plY3QnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgTWlsZXN0b25lcyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICBvbnJlbmRlcjogLT5cbiAgICBbIG93bmVyLCBuYW1lIF0gPSBAZ2V0ICdyb3V0ZSdcblxuICAgIGRvY3VtZW50LnRpdGxlID0gXCIje293bmVyfS8je25hbWV9XCJcblxuICAgICMgR2V0IHRoZSBhc3NvY2lhdGVkIHByb2plY3QuXG4gICAgQHNldCAncHJvamVjdCcsIHByb2plY3QgPSBwcm9qZWN0cy5maW5kIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBTaG91bGQgbm90IGhhcHBlbi4uLlxuICAgIHRocm93IDUwMCB1bmxlc3MgcHJvamVjdFxuXG4gICAgIyBXZSBkb24ndCBrbm93IGlmIHdlIGhhdmUgYWxsIG1pbGVzdG9uZXMsIHNvIGZldGNoIHRoZW0uXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgZmluZE1pbGVzdG9uZSA9IChudW1iZXIpIC0+XG4gICAgICBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzIG9yIFtdLCB7IG51bWJlciB9XG5cbiAgICBmZXRjaE1pbGVzdG9uZXMgPSAoY2IpIC0+XG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIGNiXG5cbiAgICBmZXRjaElzc3VlcyA9IChhbGxNaWxlc3RvbmVzLCBjYikgLT5cbiAgICAgIGFzeW5jLmVhY2ggYWxsTWlsZXN0b25lcywgKG1pbGVzdG9uZSwgY2IpIC0+XG4gICAgICAgICMgTWF5YmUgd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICByZXR1cm4gY2IgbnVsbCBpZiBmaW5kTWlsZXN0b25lIG1pbGVzdG9uZS5udW1iZXJcbiAgICAgICAgIyBOZWVkIHRvIGZldGNoIHRoZSBpc3N1ZXMgdGhlbi5cbiAgICAgICAgaXNzdWVzLmZldGNoQWxsIHsgb3duZXIsIG5hbWUsICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyIH0sIChlcnIsIG9iaikgLT5cbiAgICAgICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lIHdpdGggaXNzdWVzLlxuICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgIyBOZXh0LlxuICAgICAgICAgIGRvIGNiXG4gICAgICAsIGNiXG5cbiAgICAjIFJ1biBpdC5cbiAgICBhc3luYy53YXRlcmZhbGwgW1xuICAgICAgIyBGaXJzdCBnZXQgYWxsIHRoZSBtaWxlc3RvbmVzLlxuICAgICAgZmV0Y2hNaWxlc3RvbmVzLFxuICAgICAgIyBUaGVuIGFsbCB0aGUgaXNzdWVzIHBlciBtaWxlc3RvbmUuXG4gICAgICBmZXRjaElzc3Vlc1xuICAgIF0sIChlcnIpID0+XG4gICAgICBkbyBkb25lXG4gICAgICByZXR1cm4gbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNheSB3ZSBhcmUgcmVhZHkuXG4gICAgICBAc2V0ICdyZWFkeScsIHllcyIsIlRhYmxlID0gcmVxdWlyZSAnLi90YWJsZS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gVGFibGUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvbWlsZXN0b25lcydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCciLCJUYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3Byb2plY3RzJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCciLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuZm9ybWF0ICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuLi9pY29ucy5jb2ZmZWUnXG5wcm9qZWN0cyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy90YWJsZSdcblxuICAnZGF0YSc6IHsgZm9ybWF0IH1cblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIENoYW5nZSBzb3J0IG9yZGVyLlxuICAgIEBvbiAnc29ydEJ5JywgLT5cbiAgICAgIGZucyA9IHByb2plY3RzLmRhdGEuc29ydEZuc1xuXG4gICAgICBpZHggPSAxICsgZm5zLmluZGV4T2YgcHJvamVjdHMuZGF0YS5zb3J0QnlcbiAgICAgIGlkeCA9IDAgaWYgaWR4IGlzIGZucy5sZW5ndGhcblxuICAgICAgcHJvamVjdHMuc2V0ICdzb3J0QnknLCBmbnNbaWR4XSIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyBleHBvcnQgdGhlIGNsYXNzIGlmIHdlIGFyZSBpbiBhIE5vZGUtbGlrZSBzeXN0ZW0uXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgPT09IGV4cG9ydHMpXG4gIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdO1xudmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG52YXIgUiA9IDA7XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbnZhciBOVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKic7XG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnO1xuXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnZhciBOT05OVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gPSAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKic7XG5cblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbnZhciBNQUlOVkVSU0lPTiA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIE1BSU5WRVJTSU9OTE9PU0UgPSBSKys7XG5zcmNbTUFJTlZFUlNJT05MT09TRV0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKSc7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRV0gPSAnKD86LSgnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJztcblxudmFyIFBSRVJFTEVBU0VMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG52YXIgQlVJTERJREVOVElGSUVSID0gUisrO1xuc3JjW0JVSUxESURFTlRJRklFUl0gPSAnWzAtOUEtWmEtei1dKyc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKys7XG5zcmNbQlVJTERdID0gJyg/OlxcXFwrKCcgKyBzcmNbQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tCVUlMRElERU5USUZJRVJdICsgJykqKSknO1xuXG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG52YXIgRlVMTCA9IFIrKztcbnZhciBGVUxMUExBSU4gPSAndj8nICsgc3JjW01BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCc7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnZhciBMT09TRVBMQUlOID0gJ1t2PVxcXFxzXSonICsgc3JjW01BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG52YXIgTE9PU0UgPSBSKys7XG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJztcblxudmFyIEdUTFQgPSBSKys7XG5zcmNbR1RMVF0gPSAnKCg/Ojx8Pik/PT8pJztcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdID0gc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConO1xudmFyIFhSQU5HRUlERU5USUZJRVIgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConO1xuXG52YXIgWFJBTkdFUExBSU4gPSBSKys7XG5zcmNbWFJBTkdFUExBSU5dID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFID0gUisrO1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgWFJBTkdFTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFTE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciByID0gbG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXTtcbiAgcmV0dXJuIChyLnRlc3QodmVyc2lvbikpID8gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkgOiBudWxsO1xufVxuXG5leHBvcnRzLnZhbGlkID0gdmFsaWQ7XG5mdW5jdGlvbiB2YWxpZCh2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgdiA9IHBhcnNlKHZlcnNpb24sIGxvb3NlKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsO1xufVxuXG5cbmV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbmZ1bmN0aW9uIGNsZWFuKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciBzID0gcGFyc2UodmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBsb29zZSk7XG4gIHJldHVybiBzID8gcy52ZXJzaW9uIDogbnVsbDtcbn1cblxuZXhwb3J0cy5TZW1WZXIgPSBTZW1WZXI7XG5cbmZ1bmN0aW9uIFNlbVZlcih2ZXJzaW9uLCBsb29zZSkge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIGlmICh2ZXJzaW9uLmxvb3NlID09PSBsb29zZSlcbiAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIGVsc2VcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnZlcnNpb247XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSk7XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIGxvb3NlKTtcbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuICB2YXIgbSA9IHZlcnNpb24udHJpbSgpLm1hdGNoKGxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF0pO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcblxuICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdO1xuICB0aGlzLm1pbm9yID0gK21bMl07XG4gIHRoaXMucGF0Y2ggPSArbVszXTtcblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICBlbHNlXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICgvXlswLTldKyQvLnRlc3QoaWQpKSA/ICtpZCA6IGlkO1xuICAgIH0pO1xuXG4gIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdCgnLicpIDogW107XG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblNlbVZlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudmVyc2lvbiA9IHRoaXMubWFqb3IgKyAnLicgKyB0aGlzLm1pbm9yICsgJy4nICsgdGhpcy5wYXRjaDtcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgdGhpcy52ZXJzaW9uICs9ICctJyArIHRoaXMucHJlcmVsZWFzZS5qb2luKCcuJyk7XG4gIHJldHVybiB0aGlzLnZlcnNpb247XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICc8U2VtVmVyIFwiJyArIHRoaXMgKyAnXCI+Jztcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5sb29zZSwgb3RoZXIpO1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMubG9vc2UpO1xuXG4gIC8vIE5PVCBoYXZpbmcgYSBwcmVyZWxlYXNlIGlzID4gaGF2aW5nIG9uZVxuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIC0xO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiBvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAwO1xuXG4gIHZhciBpID0gMDtcbiAgZG8ge1xuICAgIHZhciBhID0gdGhpcy5wcmVyZWxlYXNlW2ldO1xuICAgIHZhciBiID0gb3RoZXIucHJlcmVsZWFzZVtpXTtcbiAgICBkZWJ1ZygncHJlcmVsZWFzZSBjb21wYXJlJywgaSwgYSwgYik7XG4gICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMDtcbiAgICBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gLTE7XG4gICAgZWxzZSBpZiAoYSA9PT0gYilcbiAgICAgIGNvbnRpbnVlO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYik7XG4gIH0gd2hpbGUgKCsraSk7XG59O1xuXG4vLyBwcmVtaW5vciB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgbWlub3IgcmVsZWFzZSwgYW5kIGltbWVkaWF0ZWx5XG4vLyBkb3duIHRvIHByZS1yZWxlYXNlLiBwcmVtYWpvciBhbmQgcHJlcGF0Y2ggd29yayB0aGUgc2FtZSB3YXkuXG5TZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgc3dpdGNoIChyZWxlYXNlKSB7XG4gICAgY2FzZSAncHJlbWFqb3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlbWlub3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZXBhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYWxyZWFkeSBhIHByZXJlbGVhc2UsIGl0IHdpbGwgYnVtcCB0byB0aGUgbmV4dCB2ZXJzaW9uXG4gICAgICAvLyBkcm9wIGFueSBwcmVyZWxlYXNlcyB0aGF0IG1pZ2h0IGFscmVhZHkgZXhpc3QsIHNpbmNlIHRoZXkgYXJlIG5vdFxuICAgICAgLy8gcmVsZXZhbnQgYXQgdGhpcyBwb2ludC5cbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXNcbiAgICAvLyBwcmVwYXRjaC5cbiAgICBjYXNlICdwcmVyZWxlYXNlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbWFqb3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1tYWpvciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGlmICh0aGlzLm1pbm9yICE9PSAwIHx8IHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWlub3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1taW5vciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1pbm9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1pbm9yLlxuICAgICAgLy8gMS4yLjAtNSBidW1wcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjEgYnVtcHMgdG8gMS4zLjBcbiAgICAgIGlmICh0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIG5vdCBhIHByZS1yZWxlYXNlIHZlcnNpb24sIGl0IHdpbGwgaW5jcmVtZW50IHRoZSBwYXRjaC5cbiAgICAgIC8vIElmIGl0IGlzIGEgcHJlLXJlbGVhc2UgaXQgd2lsbCBidW1wIHVwIHRvIHRoZSBzYW1lIHBhdGNoIHZlcnNpb24uXG4gICAgICAvLyAxLjIuMC01IHBhdGNoZXMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4wIHBhdGNoZXMgdG8gMS4yLjFcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnBhdGNoKys7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGJlIHVzZWQgcHVibGljbHkuXG4gICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgIGNhc2UgJ3ByZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gWzBdO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2VbaV0rKztcbiAgICAgICAgICAgIGkgPSAtMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IC0xKSAvLyBkaWRuJ3QgaW5jcmVtZW50IGFueXRoaW5nXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICB9XG4gICAgICBpZiAoaWRlbnRpZmllcikge1xuICAgICAgICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAgICAgICAvLyAxLjIuMC1iZXRhLmZvb2JseiBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMucHJlcmVsZWFzZVsxXSkpXG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmNyZW1lbnQgYXJndW1lbnQ6ICcgKyByZWxlYXNlKTtcbiAgfVxuICB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydHMuaW5jID0gaW5jO1xuZnVuY3Rpb24gaW5jKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZTtcbiAgICBsb29zZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKS52ZXJzaW9uO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzO1xuXG52YXIgbnVtZXJpYyA9IC9eWzAtOV0rJC87XG5mdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICB2YXIgYW51bSA9IG51bWVyaWMudGVzdChhKTtcbiAgdmFyIGJudW0gPSBudW1lcmljLnRlc3QoYik7XG5cbiAgaWYgKGFudW0gJiYgYm51bSkge1xuICAgIGEgPSArYTtcbiAgICBiID0gK2I7XG4gIH1cblxuICByZXR1cm4gKGFudW0gJiYgIWJudW0pID8gLTEgOlxuICAgICAgICAgKGJudW0gJiYgIWFudW0pID8gMSA6XG4gICAgICAgICBhIDwgYiA/IC0xIDpcbiAgICAgICAgIGEgPiBiID8gMSA6XG4gICAgICAgICAwO1xufVxuXG5leHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzO1xuZnVuY3Rpb24gcmNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYiwgYSk7XG59XG5cbmV4cG9ydHMuY29tcGFyZSA9IGNvbXBhcmU7XG5mdW5jdGlvbiBjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5jb21wYXJlKGIpO1xufVxuXG5leHBvcnRzLmNvbXBhcmVMb29zZSA9IGNvbXBhcmVMb29zZTtcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIHRydWUpO1xufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmU7XG5mdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSk7XG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnQ7XG5mdW5jdGlvbiBzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0O1xuZnVuY3Rpb24gcnNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5ndCA9IGd0O1xuZnVuY3Rpb24gZ3QoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMDtcbn1cblxuZXhwb3J0cy5sdCA9IGx0O1xuZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMDtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuZnVuY3Rpb24gZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xufVxuXG5leHBvcnRzLm5lcSA9IG5lcTtcbmZ1bmN0aW9uIG5lcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDA7XG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlO1xuZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwO1xufVxuXG5leHBvcnRzLmx0ZSA9IGx0ZTtcbmZ1bmN0aW9uIGx0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXA7XG5mdW5jdGlvbiBjbXAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHZhciByZXQ7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhID09PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSAhPT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyc6IGNhc2UgJz0nOiBjYXNlICc9PSc6IHJldCA9IGVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnIT0nOiByZXQgPSBuZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+JzogcmV0ID0gZ3QoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+PSc6IHJldCA9IGd0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzwnOiByZXQgPSBsdChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzw9JzogcmV0ID0gbHRlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvcGVyYXRvcjogJyArIG9wKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuZnVuY3Rpb24gQ29tcGFyYXRvcihjb21wLCBsb29zZSkge1xuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gbG9vc2UpXG4gICAgICByZXR1cm4gY29tcDtcbiAgICBlbHNlXG4gICAgICBjb21wID0gY29tcC52YWx1ZTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSlcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgbG9vc2UpO1xuXG4gIGRlYnVnKCdjb21wYXJhdG9yJywgY29tcCwgbG9vc2UpO1xuICB0aGlzLmxvb3NlID0gbG9vc2U7XG4gIHRoaXMucGFyc2UoY29tcCk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgdGhpcy52YWx1ZSA9ICcnO1xuICBlbHNlXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuXG4gIGRlYnVnKCdjb21wJywgdGhpcyk7XG59XG5cbnZhciBBTlkgPSB7fTtcbkNvbXBhcmF0b3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oY29tcCkge1xuICB2YXIgciA9IHRoaXMubG9vc2UgPyByZVtDT01QQVJBVE9STE9PU0VdIDogcmVbQ09NUEFSQVRPUl07XG4gIHZhciBtID0gY29tcC5tYXRjaChyKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjb21wYXJhdG9yOiAnICsgY29tcCk7XG5cbiAgdGhpcy5vcGVyYXRvciA9IG1bMV07XG4gIGlmICh0aGlzLm9wZXJhdG9yID09PSAnPScpXG4gICAgdGhpcy5vcGVyYXRvciA9ICcnO1xuXG4gIC8vIGlmIGl0IGxpdGVyYWxseSBpcyBqdXN0ICc+JyBvciAnJyB0aGVuIGFsbG93IGFueXRoaW5nLlxuICBpZiAoIW1bMl0pXG4gICAgdGhpcy5zZW12ZXIgPSBBTlk7XG4gIGVsc2VcbiAgICB0aGlzLnNlbXZlciA9IG5ldyBTZW1WZXIobVsyXSwgdGhpcy5sb29zZSk7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnPFNlbVZlciBDb21wYXJhdG9yIFwiJyArIHRoaXMgKyAnXCI+Jztcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgZGVidWcoJ0NvbXBhcmF0b3IudGVzdCcsIHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5sb29zZSk7XG59O1xuXG5cbmV4cG9ydHMuUmFuZ2UgPSBSYW5nZTtcbmZ1bmN0aW9uIFJhbmdlKHJhbmdlLCBsb29zZSkge1xuICBpZiAoKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpICYmIHJhbmdlLmxvb3NlID09PSBsb29zZSlcbiAgICByZXR1cm4gcmFuZ2U7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG5cbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuXG4gIC8vIEZpcnN0LCBzcGxpdCBiYXNlZCBvbiBib29sZWFuIG9yIHx8XG4gIHRoaXMucmF3ID0gcmFuZ2U7XG4gIHRoaXMuc2V0ID0gcmFuZ2Uuc3BsaXQoL1xccypcXHxcXHxcXHMqLykubWFwKGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZShyYW5nZS50cmltKCkpO1xuICB9LCB0aGlzKS5maWx0ZXIoZnVuY3Rpb24oYykge1xuICAgIC8vIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHJlbGV2YW50IGZvciB3aGF0ZXZlciByZWFzb25cbiAgICByZXR1cm4gYy5sZW5ndGg7XG4gIH0pO1xuXG4gIGlmICghdGhpcy5zZXQubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBTZW1WZXIgUmFuZ2U6ICcgKyByYW5nZSk7XG4gIH1cblxuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5SYW5nZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJzxTZW1WZXIgUmFuZ2UgXCInICsgdGhpcy5yYW5nZSArICdcIj4nO1xufTtcblxuUmFuZ2UucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKCk7XG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpO1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5wYXJzZVJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5sb29zZTtcbiAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG4gIGRlYnVnKCdyYW5nZScsIHJhbmdlLCBsb29zZSk7XG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW0hZUEhFTlJBTkdFTE9PU0VdIDogcmVbSFlQSEVOUkFOR0VdO1xuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpO1xuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSk7XG4gIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICBkZWJ1ZygnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlW0NPTVBBUkFUT1JUUklNXSk7XG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKTtcblxuICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpO1xuXG4gIC8vIG5vcm1hbGl6ZSBzcGFjZXNcbiAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpLnNwbGl0KC9cXHMrLyk7XG4gIGlmICh0aGlzLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHJldHVybiAhIWNvbXAubWF0Y2goY29tcFJlKTtcbiAgICB9KTtcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgbG9vc2UpO1xuICB9KTtcblxuICByZXR1cm4gc2V0O1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKS5zZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gY29tcC5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfSkuam9pbignICcpLnRyaW0oKS5zcGxpdCgnICcpO1xuICB9KTtcbn1cblxuLy8gY29tcHJpc2VkIG9mIHhyYW5nZXMsIHRpbGRlcywgc3RhcnMsIGFuZCBndGx0J3MgYXQgdGhpcyBwb2ludC5cbi8vIGFscmVhZHkgcmVwbGFjZWQgdGhlIGh5cGhlbiByYW5nZXNcbi8vIHR1cm4gaW50byBhIHNldCBvZiBKVVNUIGNvbXBhcmF0b3JzLlxuZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3RpbGRlcycsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVhSYW5nZXMoY29tcCwgbG9vc2UpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgbG9vc2UpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBsb29zZSkge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlVGlsZGUoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBsb29zZSkge1xuICB2YXIgciA9IGxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wLSA8MS4zLjAtXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZVRpbGRlIHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIH0gZWxzZVxuICAgICAgLy8gfjEuMi4zID09ID49MS4yLjMgPDEuMy4wXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuXG4gICAgZGVidWcoJ3RpbGRlIHJldHVybicsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIF4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyBeMiwgXjIueCwgXjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gXjIuMCwgXjIuMC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gXjEuMiwgXjEuMi54IC0tPiA+PTEuMi4wIDwyLjAuMFxuLy8gXjEuMi4zIC0tPiA+PTEuMi4zIDwyLjAuMFxuLy8gXjEuMi4wIC0tPiA+PTEuMi4wIDwyLjAuMFxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0cyhjb21wLCBsb29zZSkge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldChjb21wLCBsb29zZSkge1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBsb29zZSk7XG4gIHZhciByID0gbG9vc2UgPyByZVtDQVJFVExPT1NFXSA6IHJlW0NBUkVUXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCdjYXJldCcsIGNvbXAsIF8sIE0sIG0sIHAsIHByKTtcbiAgICB2YXIgcmV0O1xuXG4gICAgaWYgKGlzWChNKSlcbiAgICAgIHJldCA9ICcnO1xuICAgIGVsc2UgaWYgKGlzWChtKSlcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICBlbHNlIGlmIChpc1gocCkpIHtcbiAgICAgIGlmIChNID09PSAnMCcpXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlQ2FyZXQgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Zygnbm8gcHInKTtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ2NhcmV0IHJldHVybicsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2VzKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIGxvb3NlKTtcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlKGNvbXAsIGxvb3NlKSB7XG4gIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW1hSQU5HRUxPT1NFXSA6IHJlW1hSQU5HRV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24ocmV0LCBndGx0LCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCd4UmFuZ2UnLCBjb21wLCByZXQsIGd0bHQsIE0sIG0sIHAsIHByKTtcbiAgICB2YXIgeE0gPSBpc1goTSk7XG4gICAgdmFyIHhtID0geE0gfHwgaXNYKG0pO1xuICAgIHZhciB4cCA9IHhtIHx8IGlzWChwKTtcbiAgICB2YXIgYW55WCA9IHhwO1xuXG4gICAgaWYgKGd0bHQgPT09ICc9JyAmJiBhbnlYKVxuICAgICAgZ3RsdCA9ICcnO1xuXG4gICAgaWYgKHhNKSB7XG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nIHx8IGd0bHQgPT09ICc8Jykge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgcmV0ID0gJzwwLjAuMCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGZvcmJpZGRlblxuICAgICAgICByZXQgPSAnKic7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChndGx0ICYmIGFueVgpIHtcbiAgICAgIC8vIHJlcGxhY2UgWCB3aXRoIDBcbiAgICAgIGlmICh4bSlcbiAgICAgICAgbSA9IDA7XG4gICAgICBpZiAoeHApXG4gICAgICAgIHAgPSAwO1xuXG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nKSB7XG4gICAgICAgIC8vID4xID0+ID49Mi4wLjBcbiAgICAgICAgLy8gPjEuMiA9PiA+PTEuMy4wXG4gICAgICAgIC8vID4xLjIuMyA9PiA+PSAxLjIuNFxuICAgICAgICBndGx0ID0gJz49JztcbiAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgICBtID0gMDtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZ3RsdCA9PT0gJzw9Jykge1xuICAgICAgICAvLyA8PTAuNy54IGlzIGFjdHVhbGx5IDwwLjguMCwgc2luY2UgYW55IDAuNy54IHNob3VsZFxuICAgICAgICAvLyBwYXNzLiAgU2ltaWxhcmx5LCA8PTcueCBpcyBhY3R1YWxseSA8OC4wLjAsIGV0Yy5cbiAgICAgICAgZ3RsdCA9ICc8J1xuICAgICAgICBpZiAoeG0pXG4gICAgICAgICAgTSA9ICtNICsgMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMVxuICAgICAgfVxuXG4gICAgICByZXQgPSBndGx0ICsgTSArICcuJyArIG0gKyAnLicgKyBwO1xuICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCd4UmFuZ2UgcmV0dXJuJywgcmV0KTtcblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBCZWNhdXNlICogaXMgQU5ELWVkIHdpdGggZXZlcnl0aGluZyBlbHNlIGluIHRoZSBjb21wYXJhdG9yLFxuLy8gYW5kICcnIG1lYW5zIFwiYW55IHZlcnNpb25cIiwganVzdCByZW1vdmUgdGhlICpzIGVudGlyZWx5LlxuZnVuY3Rpb24gcmVwbGFjZVN0YXJzKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBsb29zZSk7XG4gIC8vIExvb3NlbmVzcyBpcyBpZ25vcmVkIGhlcmUuICBzdGFyIGlzIGFsd2F5cyBhcyBsb29zZSBhcyBpdCBnZXRzIVxuICByZXR1cm4gY29tcC50cmltKCkucmVwbGFjZShyZVtTVEFSXSwgJycpO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVtIWVBIRU5SQU5HRV0pXG4vLyBNLCBtLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGRcbi8vIDEuMiAtIDMuNC41ID0+ID49MS4yLjAgPD0zLjQuNVxuLy8gMS4yLjMgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAgQW55IDMuNC54IHdpbGwgZG9cbi8vIDEuMiAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMFxuZnVuY3Rpb24gaHlwaGVuUmVwbGFjZSgkMCxcbiAgICAgICAgICAgICAgICAgICAgICAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgICAgICAgICAgICAgICAgICAgICAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpIHtcblxuICBpZiAoaXNYKGZNKSlcbiAgICBmcm9tID0gJyc7XG4gIGVsc2UgaWYgKGlzWChmbSkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKGZwKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4nICsgZm0gKyAnLjAnO1xuICBlbHNlXG4gICAgZnJvbSA9ICc+PScgKyBmcm9tO1xuXG4gIGlmIChpc1godE0pKVxuICAgIHRvID0gJyc7XG4gIGVsc2UgaWYgKGlzWCh0bSkpXG4gICAgdG8gPSAnPCcgKyAoK3RNICsgMSkgKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWCh0cCkpXG4gICAgdG8gPSAnPCcgKyB0TSArICcuJyArICgrdG0gKyAxKSArICcuMCc7XG4gIGVsc2UgaWYgKHRwcilcbiAgICB0byA9ICc8PScgKyB0TSArICcuJyArIHRtICsgJy4nICsgdHAgKyAnLScgKyB0cHI7XG4gIGVsc2VcbiAgICB0byA9ICc8PScgKyB0bztcblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpO1xufVxuXG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0U2V0KHRoaXMuc2V0W2ldLCB2ZXJzaW9uKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHRlc3RTZXQoc2V0LCB2ZXJzaW9uKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgLy8gRmluZCB0aGUgc2V0IG9mIHZlcnNpb25zIHRoYXQgYXJlIGFsbG93ZWQgdG8gaGF2ZSBwcmVyZWxlYXNlc1xuICAgIC8vIEZvciBleGFtcGxlLCBeMS4yLjMtcHIuMSBkZXN1Z2FycyB0byA+PTEuMi4zLXByLjEgPDIuMC4wXG4gICAgLy8gVGhhdCBzaG91bGQgYWxsb3cgYDEuMi4zLXByLjJgIHRvIHBhc3MuXG4gICAgLy8gSG93ZXZlciwgYDEuMi40LWFscGhhLm5vdHJlYWR5YCBzaG91bGQgTk9UIGJlIGFsbG93ZWQsXG4gICAgLy8gZXZlbiB0aG91Z2ggaXQncyB3aXRoaW4gdGhlIHJhbmdlIHNldCBieSB0aGUgY29tcGFyYXRvcnMuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlYnVnKHNldFtpXS5zZW12ZXIpO1xuICAgICAgaWYgKHNldFtpXS5zZW12ZXIgPT09IEFOWSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgYWxsb3dlZCA9IHNldFtpXS5zZW12ZXI7XG4gICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLm1pbm9yID09PSB2ZXJzaW9uLm1pbm9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLnBhdGNoID09PSB2ZXJzaW9uLnBhdGNoKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcnNpb24gaGFzIGEgLXByZSwgYnV0IGl0J3Mgbm90IG9uZSBvZiB0aGUgb25lcyB3ZSBsaWtlLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnNhdGlzZmllcyA9IHNhdGlzZmllcztcbmZ1bmN0aW9uIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgbG9vc2UpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKTtcbn1cblxuZXhwb3J0cy5tYXhTYXRpc2Z5aW5nID0gbWF4U2F0aXNmeWluZztcbmZ1bmN0aW9uIG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBsb29zZSkge1xuICByZXR1cm4gdmVyc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBsb29zZSk7XG4gIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiByY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pWzBdIHx8IG51bGw7XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBsb29zZSkge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSkucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIGxvb3NlKTtcbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuZXhwb3J0cy5ndHIgPSBndHI7XG5mdW5jdGlvbiBndHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIGxvb3NlKSB7XG4gIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaV07XG5cbiAgICB2YXIgaGlnaCA9IG51bGw7XG4gICAgdmFyIGxvdyA9IG51bGw7XG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgbG9vc2UpKSB7XG4gICAgICAgIGhpZ2ggPSBjb21wYXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChsdGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBsb3cuc2VtdmVyLCBsb29zZSkpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChsb3cub3BlcmF0b3IgPT09IGVjb21wICYmIGx0Zm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIFVzZSB0aGUgZGVmaW5lKCkgZnVuY3Rpb24gaWYgd2UncmUgaW4gQU1EIGxhbmRcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG4gIGRlZmluZShleHBvcnRzKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpIl19
