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
  var a, b, c, days, points, time;
  points = progress(milestone.issues.closed.size, milestone.issues.open.size);
  if (!milestone.due_on) {
    return {
      'isOnTime': true,
      'progress': {
        points: points
      }
    };
  }
  a = +new Date(milestone.created_at);
  b = +(new Date);
  c = +new Date(milestone.due_on);
  time = progress(b - a, c - b);
  days = (moment(b).diff(moment(a), 'days')) / 100;
  return {
    'isOnTime': points > time,
    'progress': {
      points: points,
      time: time
    },
    'days': days
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
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"class":"sort"},"v":{"click":"sortBy"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by ",{"t":2,"r":"projects.sortBy"}]}," ",{"t":7,"e":"h2","f":["Milestones"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{p:_1[_0]}"},"f":[{"t":4,"n":50,"x":{"r":["p.owner","project.owner","p.name","project.name"],"s":"_0==_1&&_2==_3"},"f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"project.owner"},"/",{"t":2,"r":"project.name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/tables/projects.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"class":"sort"},"v":{"click":"sortBy"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by ",{"t":2,"r":"projects.sortBy"}]}," ",{"t":7,"e":"h2","f":["Projects"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.list","f":[{"t":4,"n":50,"r":"errors","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"colspan":"3","class":"repo"},"f":[{"t":7,"e":"div","a":{"class":"project"},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}," ",{"t":7,"e":"span","a":{"class":"error","title":[{"t":2,"x":{"r":["errors"],"s":"_0.join(\"\\n\")"}}]},"f":[{"t":7,"e":"Icons","a":{"icon":"attention"}}]}]}]}]}]}]}," ",{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{project:_1[_0]}"},"f":[{"t":4,"n":53,"r":"project","f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"class":"repo"},"f":[{"t":7,"e":"a","a":{"class":"project","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvYXBwLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9jb25maWcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvc3lzdGVtLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy91c2VyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL3JlcXVlc3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3JvdXRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL3N0YXRzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvdmVuZG9yLmNvZmZlZSIsInNyYy90ZW1wbGF0ZXMvYXBwLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2NoYXJ0Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL3RlbXBsYXRlcy9oZXJvLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2ljb25zLmh0bWwiLCJzcmMvdGVtcGxhdGVzL25vdGlmeS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9kYXRlLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2Zvcm1hdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9rZXkuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbWl4aW5zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL21vZGVsLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2NoYXJ0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlYWRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZXJvLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2ljb25zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL25vdGlmeS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbmV3LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3RhYmxlcy90YWJsZS5jb2ZmZWUiLCJ2ZW5kb3Ivbm9kZS1zZW12ZXIvc2VtdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhbk11dGF0aW9uT2JzZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgaWYgKGNhbk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdmFyIGhpZGRlbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZUxpc3QgPSBxdWV1ZS5zbGljZSgpO1xuICAgICAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHF1ZXVlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShoaWRkZW5EaXYsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIGlmICghcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgneWVzJywgJ25vJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuIyBMb2Rhc2ggbWl4aW5zLlxucmVxdWlyZSAnLi91dGlscy9taXhpbnMuY29mZmVlJ1xuIyBXaWxsIGxvYWQgcHJvamVjdHMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5yZXF1aXJlICcuL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5cbkhlYWRlciA9IHJlcXVpcmUgJy4vdmlld3MvaGVhZGVyLmNvZmZlZSdcbk5vdGlmeSA9IHJlcXVpcmUgJy4vdmlld3Mvbm90aWZ5LmNvZmZlZSdcbnJvdXRlciA9IHJlcXVpcmUgJy4vbW9kdWxlcy9yb3V0ZXIuY29mZmVlJ1xuXG5hcHAgPSBuZXcgUmFjdGl2ZVxuICBcbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi90ZW1wbGF0ZXMvYXBwLmh0bWwnXG5cbiAgJ2VsJzogJ2JvZHknXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEhlYWRlciwgTm90aWZ5IH1cblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFN0YXJ0IHRoZSByb3V0ZXIuXG4gICAgcm91dGVyLmluaXQgJy8nIiwiTW9kZWwgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2NvbmZpZydcblxuICBcImRhdGFcIjpcbiAgICAjIEZpcmViYXNlIGFwcCBuYW1lLlxuICAgIFwiZmlyZWJhc2VcIjogXCJidXJuY2hhcnRcIlxuICAgICMgRGF0YSBzb3VyY2UgcHJvdmlkZXIuXG4gICAgXCJwcm92aWRlclwiOiBcImdpdGh1YlwiXG4gICAgIyBGaWVsZHMgdG8ga2VlcCBmcm9tIEdIIHJlc3BvbnNlcy5cbiAgICBcImZpZWxkc1wiOlxuICAgICAgXCJtaWxlc3RvbmVcIjogW1xuICAgICAgICBcImNsb3NlZF9pc3N1ZXNcIlxuICAgICAgICBcImNyZWF0ZWRfYXRcIlxuICAgICAgICBcImRlc2NyaXB0aW9uXCJcbiAgICAgICAgXCJkdWVfb25cIlxuICAgICAgICBcIm51bWJlclwiXG4gICAgICAgIFwib3Blbl9pc3N1ZXNcIlxuICAgICAgICBcInRpdGxlXCJcbiAgICAgICAgXCJ1cGRhdGVkX2F0XCJcbiAgICAgIF1cbiAgICAjIENoYXJ0IGNvbmZpZ3VyYXRpb24uXG4gICAgXCJjaGFydFwiOlxuICAgICAgIyBEYXlzIHdlIGFyZSBub3Qgd29ya2luZy5cbiAgICAgIFwib2ZmX2RheXNcIjogWyBdXG4gICAgICAjIEhvdyBkbyB3ZSBwYXJzZSBHaXRIdWIgZGF0ZXM/XG4gICAgICBcImRhdGV0aW1lXCI6IC9eKFxcZHs0fS1cXGR7Mn0tXFxkezJ9KVQoLiopL1xuICAgICAgIyBIb3cgZG9lcyBhIHNpemUgbGFiZWwgbG9vayBsaWtlP1xuICAgICAgXCJzaXplX2xhYmVsXCI6IC9ec2l6ZSAoXFxkKykkL1xuICAgICAgIyBIb3cgZG8gd2Ugc3BlY2lmeSB3aGljaCB1c2VyL3JlcG8vKG1pbGVzdG9uZSkgd2Ugd2FudD9cbiAgICAgIFwibG9jYXRpb25cIjogL14jISgoXFwvW15cXC9dKyl7MiwzfSkkL1xuICAgICAgIyBQcm9jZXNzIGFsbCBpc3N1ZXMgYXMgb25lIHNpemUgKE9ORV9TSVpFKSBvciB1c2UgbGFiZWxzIChMQUJFTFMpLlxuICAgICAgXCJwb2ludHNcIjogJ09ORV9TSVpFJyIsInsgRmlyZWJhc2UsIEZpcmViYXNlU2ltcGxlTG9naW4gfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTW9kZWwgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xudXNlciAgID0gcmVxdWlyZSAnLi91c2VyLmNvZmZlZSdcbmNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvZmlyZWJhc2UnXG5cbiAgYXV0aDogLT5cbiAgICB0aHJvdyAnTm90IG92ZXJyaWRlbidcblxuICAjIExvZ2luIGEgdXNlci5cbiAgbG9naW46IChjYikgLT5cbiAgICAjIExvZ2luLlxuICAgIEBhdXRoLmxvZ2luIGNvbmZpZy5kYXRhLnByb3ZpZGVyLFxuICAgICAgJ3JlbWVtYmVyTWUnOiB5ZXNcbiAgICAgICdzY29wZSc6ICdwcml2YXRlX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSwgc29ydGVkSW5kZXhDbXAsIHNlbXZlciB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5jb25maWcgICA9IHJlcXVpcmUgJy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnN0YXRzICAgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9zdGF0cy5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbmRhdGUgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvZGF0ZS5jb2ZmZWUnXG51c2VyICAgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL3Byb2plY3RzJ1xuXG4gICdkYXRhJzpcbiAgICAjIEN1cnJlbnQgc29ydCBvcmRlci5cbiAgICAnc29ydEJ5JzogJ3ByaW9yaXR5J1xuICAgICMgU29ydCBmdW5jdGlvbnMuXG4gICAgJ3NvcnRGbnMnOiBbICdwcm9ncmVzcycsICdwcmlvcml0eScsICduYW1lJyBdXG5cbiAgIyBSZXR1cm4gYSBzb3J0IG9yZGVyIGNvbXBhcmF0b3IuXG4gIGNvbXBhcmF0b3I6IC0+XG4gICAgeyBsaXN0LCBzb3J0QnkgfSA9IEBkYXRhXG5cbiAgICAjIENvbnZlcnQgZXhpc3RpbmcgaW5kZXggaW50byBhY3R1YWwgcHJvamVjdCBtaWxlc3RvbmUuXG4gICAgZGVJZHggPSAoZm4pID0+XG4gICAgICAoWyBpLCBqIF0sIHJlc3QuLi4pID0+XG4gICAgICAgIGZuLmFwcGx5IEAsIFsgWyBsaXN0W2ldLCBsaXN0W2ldLm1pbGVzdG9uZXNbal0gXSBdLmNvbmNhdCByZXN0XG5cbiAgICAjIFNldCBkZWZhdWx0IGZpZWxkcywgaW4gcGxhY2UuXG4gICAgZGVmYXVsdHMgPSAoYXJyLCBoYXNoKSAtPlxuICAgICAgZm9yIGl0ZW0gaW4gYXJyXG4gICAgICAgIGZvciBrLCB2IG9mIGhhc2hcbiAgICAgICAgICByZWYgPSBpdGVtXG4gICAgICAgICAgZm9yIHAsIGkgaW4ga2V5cyA9IGsuc3BsaXQgJy4nXG4gICAgICAgICAgICBpZiBpIGlzIGtleXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICByZWZbcF0gPz0gdlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZWYgPSByZWZbcF0gPz0ge31cblxuICAgICMgVGhlIGFjdHVhbCBmbiBzZWxlY3Rpb24uXG4gICAgc3dpdGNoIHNvcnRCeVxuICAgICAgIyBGcm9tIGhpZ2hlc3QgcHJvZ3Jlc3MgcG9pbnRzLlxuICAgICAgd2hlbiAncHJvZ3Jlc3MnIHRoZW4gZGVJZHggKFsgYVAsIGFNIF0sIFsgYlAsIGJNIF0pIC0+XG4gICAgICAgIGRlZmF1bHRzIFsgYU0sIGJNIF0sIHsgJ3N0YXRzLnByb2dyZXNzLnBvaW50cyc6IDAgfVxuICAgICAgICAjIFNpbXBsZSBwb2ludHMgZGlmZmVyZW5jZS5cbiAgICAgICAgYU0uc3RhdHMucHJvZ3Jlc3MucG9pbnRzIC0gYk0uc3RhdHMucHJvZ3Jlc3MucG9pbnRzXG5cbiAgICAgICMgRnJvbSBtb3N0IGRlbGF5ZWQgaW4gZGF5cy5cbiAgICAgIHdoZW4gJ3ByaW9yaXR5JyB0aGVuIGRlSWR4IChbIGFQLCBhTSBdLCBbIGJQLCBiTSBdKSAtPlxuICAgICAgICAjIE1pbGVzdG9uZXMgd2l0aCBubyBkZWFkbGluZSBhcmUgYWx3YXlzIGF0IHRoZSBcImJlZ2lubmluZ1wiLlxuICAgICAgICBkZWZhdWx0cyBbIGFNLCBiTSBdLCB7ICdzdGF0cy5wcm9ncmVzcy50aW1lJzogMCwgJ3N0YXRzLmRheXMnOiAxZTMgfVxuICAgICAgICAjICUgZGlmZmVyZW5jZSBpbiBwcm9ncmVzcyB0aW1lcyB0aGUgbnVtYmVyIG9mIGRheXMgYWhlYWQgb3IgYmVoaW5kLlxuICAgICAgICBbICRhLCAkYiBdID0gXy5tYXAgWyBhTSwgYk0gXSwgKHsgc3RhdHMgfSkgLT5cbiAgICAgICAgICAoc3RhdHMucHJvZ3Jlc3MucG9pbnRzIC0gc3RhdHMucHJvZ3Jlc3MudGltZSkgKiBzdGF0cy5kYXlzXG5cbiAgICAgICAgJGIgLSAkYVxuXG4gICAgICAjIEJhc2VkIG9uIHByb2plY3QgdGhlbiBtaWxlc3RvbmUgbmFtZSBpbmNsdWRpbmcgc2VtdmVyLlxuICAgICAgd2hlbiAnbmFtZScgdGhlbiBkZUlkeCAoWyBhUCwgYU0gXSwgWyBiUCwgYk0gXSkgLT5cbiAgICAgICAgcmV0dXJuIG93bmVyIGlmIG93bmVyID0gYlAub3duZXIubG9jYWxlQ29tcGFyZSBhUC5vd25lclxuICAgICAgICByZXR1cm4gbmFtZSBpZiBuYW1lID0gYlAubmFtZS5sb2NhbGVDb21wYXJlIGFQLm5hbWVcbiAgICAgICAgIyBUcnkgc2VtdmVyLlxuICAgICAgICBpZiBzZW12ZXIudmFsaWQoYk0udGl0bGUpIGFuZCBzZW12ZXIudmFsaWQoYU0udGl0bGUpXG4gICAgICAgICAgc2VtdmVyLmd0IGJNLnRpdGxlLCBhTS50aXRsZVxuICAgICAgICAjIEJhY2sgdG8gc3RyaW5nIGNvbXBhcmUuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBiTS50aXRsZS5sb2NhbGVDb21wYXJlIGFNLnRpdGxlXG5cbiAgICAgICMgVGhlIFwid2hhdGV2ZXJcIiBzb3J0IG9yZGVyLi4uXG4gICAgICBlbHNlIC0+IDBcblxuICBmaW5kOiAocHJvamVjdCkgLT5cbiAgICBfLmZpbmQgQGRhdGEubGlzdCwgcHJvamVjdFxuXG4gIGV4aXN0czogLT5cbiAgICAhIUBmaW5kLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICMgUHVzaCB0byB0aGUgc3RhY2sgdW5sZXNzIGl0IGV4aXN0cyBhbHJlYWR5LlxuICBhZGQ6IChwcm9qZWN0KSAtPlxuICAgIEBwdXNoICdsaXN0JywgcHJvamVjdCB1bmxlc3MgQGV4aXN0cyBwcm9qZWN0XG5cbiAgIyBGaW5kIGluZGV4IG9mIGEgcHJvamVjdC5cbiAgZmluZEluZGV4OiAoeyBvd25lciwgbmFtZSB9KSAtPlxuICAgIF8uZmluZEluZGV4IEBkYXRhLmxpc3QsIHsgb3duZXIsIG5hbWUgfVxuXG4gICMgQWRkIGEgbWlsZXN0b25lIGZvciBhIHByb2plY3QuXG4gIGFkZE1pbGVzdG9uZTogKHByb2plY3QsIG1pbGVzdG9uZSkgLT5cbiAgICAjIEFkZCBpbiB0aGUgc3RhdHMuXG4gICAgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdzdGF0cyc6IHN0YXRzKG1pbGVzdG9uZSkgfVxuICAgICMgV2UgYXJlIHN1cHBvc2VkIHRvIGV4aXN0IGFscmVhZHkuXG4gICAgdGhyb3cgNTAwIGlmIChpID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPCAwIFxuXG4gICAgIyBIYXZlIG1pbGVzdG9uZXMgYWxyZWFkeT9cbiAgICBpZiBwcm9qZWN0Lm1pbGVzdG9uZXM/XG4gICAgICBAcHVzaCBcImxpc3QuI3tpfS5taWxlc3RvbmVzXCIsIG1pbGVzdG9uZVxuICAgICAgaiA9IEBkYXRhLmxpc3RbaV0ubWlsZXN0b25lcy5sZW5ndGggLSAxICMgaW5kZXggaW4gbWlsZXN0b25lc1xuICAgIGVsc2VcbiAgICAgIEBzZXQgXCJsaXN0LiN7aX0ubWlsZXN0b25lc1wiLCBbIG1pbGVzdG9uZSBdXG4gICAgICBqID0gMCAgIyBpbmRleCBpbiBtaWxlc3RvbmVzXG5cbiAgICAjIE5vdyBpbmRleCB0aGlzIG1pbGVzdG9uZS5cbiAgICBAc29ydCBbIGksIGogXSwgWyBwcm9qZWN0LCBtaWxlc3RvbmUgXVxuXG4gICMgU2F2ZSBhbiBlcnJvciBmcm9tIGxvYWRpbmcgbWlsZXN0b25lcyBvciBpc3N1ZXNcbiAgc2F2ZUVycm9yOiAocHJvamVjdCwgZXJyKSAtPlxuICAgIGlmIChpZHggPSBAZmluZEluZGV4KHByb2plY3QpKSA+IC0xXG4gICAgICBpZiBwcm9qZWN0LmVycm9ycz9cbiAgICAgICAgQHB1c2ggXCJsaXN0LiN7aWR4fS5lcnJvcnNcIiwgZXJyXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgXCJsaXN0LiN7aWR4fS5lcnJvcnNcIiwgWyBlcnIgXVxuICAgIGVsc2VcbiAgICAgICMgV2UgYXJlIHN1cHBvc2VkIHRvIGV4aXN0IGFscmVhZHkuXG4gICAgICB0aHJvdyA1MDAgIFxuXG4gIGNsZWFyOiAtPlxuICAgIEBzZXQgJ2xpc3QnLCBbXVxuXG4gICMgU29ydC9vciBpbnNlcnQgaW50byBhbiBhbHJlYWR5IHNvcnRlZCBpbmRleC5cbiAgc29ydDogKHJlZiwgZGF0YSkgLT5cbiAgICAjIEdldCBvciBpbml0aWFsaXplIHRoZSBpbmRleC5cbiAgICBpbmRleCA9IEBkYXRhLmluZGV4IG9yIFtdXG5cbiAgICAjIERvIG9uZS5cbiAgICBpZiByZWZcbiAgICAgIGlkeCA9IHNvcnRlZEluZGV4Q21wIGluZGV4LCBkYXRhLCBkbyBAY29tcGFyYXRvclxuICAgICAgaW5kZXguc3BsaWNlIGlkeCwgMCwgcmVmXG4gICAgIyBEbyBhbGwuXG4gICAgZWxzZVxuICAgICAgZm9yIHAsIGkgaW4gQGRhdGEubGlzdFxuICAgICAgICAjIFRPRE86IG5lZWQgdG8gc2hvdyBwcm9qZWN0cyB0aGF0IGZhaWxlZCB0b28uLi5cbiAgICAgICAgY29udGludWUgdW5sZXNzIHAubWlsZXN0b25lcz9cbiAgICAgICAgZm9yIG0sIGogaW4gcC5taWxlc3RvbmVzXG4gICAgICAgICAgIyBSdW4gYSBjb21wYXJhdG9yIGhlcmUgaW5zZXJ0aW5nIGludG8gaW5kZXguXG4gICAgICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIFsgcCwgbSBdLCBkbyBAY29tcGFyYXRvclxuICAgICAgICAgICMgTG9nLlxuICAgICAgICAgIGluZGV4LnNwbGljZSBpZHgsIDAsIFsgaSwgaiBdXG5cbiAgICAjIFNhdmUgdGhlIGluZGV4LlxuICAgIEBzZXQgJ2luZGV4JywgaW5kZXhcblxuICBvbmNvbnN0cnVjdDogLT5cbiAgICBtZWRpYXRvci5vbiAnIXByb2plY3RzL2FkZCcsICAgIF8uYmluZCBAYWRkLCBAXG4gICAgbWVkaWF0b3Iub24gJyFwcm9qZWN0cy9jbGVhcicsICBfLmJpbmQgQGNsZWFyLCBAXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBJbml0IHRoZSBwcm9qZWN0cy5cbiAgICBAc2V0ICdsaXN0JywgbHNjYWNoZS5nZXQoJ3Byb2plY3RzJykgb3IgW11cblxuICAgICMgUGVyc2lzdCBwcm9qZWN0cyBpbiBsb2NhbCBzdG9yYWdlIChzYW5zIG1pbGVzdG9uZXMpLlxuICAgIEBvYnNlcnZlICdsaXN0JywgKHByb2plY3RzKSAtPlxuICAgICAgbHNjYWNoZS5zZXQgJ3Byb2plY3RzJywgXy5wbHVja01hbnkgcHJvamVjdHMsIFsgJ293bmVyJywgJ25hbWUnIF1cbiAgICAsICdpbml0Jzogbm9cblxuICAgICMgUmVzZXQgb3VyIGluZGV4IGFuZCByZS1zb3J0LlxuICAgIEBvYnNlcnZlICdzb3J0QnknLCAtPlxuICAgICAgIyBVc2UgcG9wIGFzIFJhY3RpdmUgaXMgZ2xpdGNoeSB3aGVuIHJlc2V0dGluZyBhcnJheXMuXG4gICAgICBAc2V0ICdpbmRleCcsIG51bGxcbiAgICAgICPCoFJ1biB0aGUgc29ydCBhZ2Fpbi5cbiAgICAgIGRvIEBzb3J0XG4gICAgLCAnaW5pdCc6IG5vIiwibWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbk1vZGVsICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG4jIFN5c3RlbSBzdGF0ZS5cbnN5c3RlbSA9IG5ldyBNb2RlbFxuICBcbiAgJ25hbWUnOiAnbW9kZWxzL3N5c3RlbSdcblxuICAnZGF0YSc6XG4gICAgJ2xvYWRpbmcnOiBub1xuXG5jb3VudGVyID0gMFxuYXN5bmMgPSAtPlxuICBjb3VudGVyICs9IDFcbiAgc3lzdGVtLnNldCAnbG9hZGluZycsIHllc1xuICAtPlxuICAgIGNvdW50ZXIgLT0gMVxuICAgIHN5c3RlbS5zZXQgJ2xvYWRpbmcnLCArY291bnRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgc3lzdGVtLCBhc3luYyB9IiwibWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbk1vZGVsICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG4jIEN1cnJlbnRseSBsb2dnZWQtaW4gdXNlci5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL3VzZXInXG5cbiAgIyBEZWZhdWx0IHRvIGEgbG9jYWwgdXNlci5cbiAgJ2RhdGEnOlxuICAgICdwcm92aWRlcic6ICBcImxvY2FsXCJcbiAgICAnaWQnOiAgICAgICAgXCIwXCJcbiAgICAndWlkJzogICAgICAgXCJsb2NhbDowXCJcbiAgICAndG9rZW4nOiAgICAgbnVsbCIsInsgZDMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBob3Jpem9udGFsOiAoaGVpZ2h0LCB4KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeClcbiAgICAgIC5vcmllbnQoXCJib3R0b21cIilcbiAgICAgICMgU2hvdyB2ZXJ0aWNhbCBsaW5lcy4uLlxuICAgICAgLnRpY2tTaXplKC1oZWlnaHQpXG4gICAgICAjIC4uLndpdGggZGF5IG9mIHRoZSBtb250aC4uLlxuICAgICAgLnRpY2tGb3JtYXQoIChkKSAtPiBkLmdldERhdGUoKSApXG4gICAgICAjIC4uLmFuZCBnaXZlIHVzIGEgc3BhY2VyLlxuICAgICAgLnRpY2tQYWRkaW5nKDEwKVxuXG4gIHZlcnRpY2FsOiAod2lkdGgsIHkpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh5KVxuICAgICAgLm9yaWVudChcImxlZnRcIilcbiAgICAgIC50aWNrU2l6ZSgtd2lkdGgpXG4gICAgICAudGlja3MoNSlcbiAgICAgIC50aWNrUGFkZGluZygxMCkiLCJ7IF8sIGQzIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmNvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBBIGdyYXBoIG9mIGNsb3NlZCBpc3N1ZXMuXG4gICMgYGlzc3Vlc2A6ICAgICBpc3N1ZXMgbGlzdFxuICAjIGBjcmVhdGVkX2F0YDogbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgdG90YWxgOiAgICB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgYWN0dWFsOiAoaXNzdWVzLCBjcmVhdGVkX2F0LCB0b3RhbCkgLT5cbiAgICBoZWFkID0gWyB7XG4gICAgICAnZGF0ZSc6IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAgICdwb2ludHMnOiB0b3RhbFxuICAgIH0gXVxuICAgIFxuICAgIG1pbiA9ICtJbmZpbml0eSA7IG1heCA9IC1JbmZpbml0eVxuXG4gICAgIyBHZW5lcmF0ZSB0aGUgYWN0dWFsIGNsb3Nlcy5cbiAgICByZXN0ID0gXy5tYXAgaXNzdWVzLCAoaXNzdWUpIC0+XG4gICAgICB7IHNpemUsIGNsb3NlZF9hdCB9ID0gaXNzdWVcbiAgICAgICMgRGV0ZXJtaW5lIHRoZSByYW5nZS5cbiAgICAgIG1pbiA9IHNpemUgaWYgc2l6ZSA8IG1pblxuICAgICAgbWF4ID0gc2l6ZSBpZiBzaXplID4gbWF4XG5cbiAgICAgICMgRHJvcHBpbmcgcG9pbnRzIHJlbWFpbmluZy5cbiAgICAgIGlzc3VlLmRhdGUgPSBuZXcgRGF0ZSBjbG9zZWRfYXRcbiAgICAgIGlzc3VlLnBvaW50cyA9IHRvdGFsIC09IHNpemVcbiAgICAgIGlzc3VlXG4gICAgXG4gICAgIyBOb3cgYWRkIGEgcmFkaXVzIGluIGEgcmFuZ2UgKHdpbGwgYmUgdXNlZCBmb3IgYSBjaXJjbGUpLlxuICAgIHJhbmdlID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFsgbWluLCBtYXggXSkucmFuZ2UoWyA1LCA4IF0pXG5cbiAgICByZXN0ID0gXy5tYXAgcmVzdCwgKGlzc3VlKSAtPlxuICAgICAgaXNzdWUucmFkaXVzID0gcmFuZ2UgaXNzdWUuc2l6ZVxuICAgICAgaXNzdWVcblxuICAgIFtdLmNvbmNhdCBoZWFkLCByZXN0XG5cbiAgIyBBIGdyYXBoIG9mIGFuIGlkZWFsIHByb2dyZXNzaW9uLi5cbiAgIyBgYWA6ICAgbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgYmA6ICAgbWlsZXN0b25lIGVuZCBkYXRlXG4gICMgYHRvdGFsYDogdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGlkZWFsOiAoYSwgYiwgdG90YWwpIC0+XG4gICAgIyBTd2FwP1xuICAgIFsgYiwgYSBdID0gWyBhLCBiIF0gaWYgYiA8IGFcblxuICAgICMgV2Ugc3RhcnQgaGVyZSBhZGRpbmcgZGF5cyB0byBgZGAuXG4gICAgWyB5LCBtLCBkIF0gPSBfLm1hcCBhLm1hdGNoKGNvbmZpZy5kYXRhLmNoYXJ0LmRhdGV0aW1lKVsxXS5zcGxpdCgnLScpLCAodikgLT4gcGFyc2VJbnQgdlxuICAgICMgV2Ugd2FudCB0byBlbmQgaGVyZS5cbiAgICBjdXRvZmYgPSBuZXcgRGF0ZShiKVxuXG4gICAgIyBHbyB0aHJvdWdoIHRoZSBiZWdpbm5pbmcgdG8gdGhlIGVuZCBza2lwcGluZyBvZmYgZGF5cy5cbiAgICBkYXlzID0gW10gOyBsZW5ndGggPSAwXG4gICAgZG8gb25jZSA9IChpbmMgPSAwKSAtPlxuICAgICAgIyBBIG5ldyBkYXkuXG4gICAgICBkYXkgPSBuZXcgRGF0ZSB5LCBtIC0gMSwgZCArIGluY1xuICAgICAgXG4gICAgICAjIERvZXMgdGhpcyBkYXkgY291bnQ/XG4gICAgICBkYXlfb2YgPSA3IGlmICFkYXlfb2YgPSBkYXkuZ2V0RGF5KClcbiAgICAgIGlmIGRheV9vZiBpbiBjb25maWcuZGF0YS5jaGFydC5vZmZfZGF5c1xuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXksIG9mZl9kYXk6IHllcyB9XG4gICAgICBlbHNlXG4gICAgICAgIGxlbmd0aCArPSAxXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSB9XG4gICAgICBcbiAgICAgICMgR28gYWdhaW4/XG4gICAgICBvbmNlKGluYyArIDEpIHVubGVzcyBkYXkgPiBjdXRvZmZcblxuICAgICMgTWFwIHBvaW50cyBvbiB0aGUgYXJyYXkgb2YgZGF5cyBub3cuXG4gICAgdmVsb2NpdHkgPSB0b3RhbCAvIChsZW5ndGggLSAxKVxuXG4gICAgZGF5cyA9IF8ubWFwIGRheXMsIChkYXksIGkpIC0+XG4gICAgICBkYXkucG9pbnRzID0gdG90YWxcbiAgICAgIHRvdGFsIC09IHZlbG9jaXR5IGlmIGRheXNbaV0gYW5kIG5vdCBkYXlzW2ldLm9mZl9kYXlcbiAgICAgIGRheVxuXG4gICAgIyBEbyB3ZSBuZWVkIHRvIG1ha2UgYSBsaW5rIHRvIHJpZ2h0IG5vdz9cbiAgICBkYXlzLnB1c2ggeyBkYXRlOiBub3csIHBvaW50czogMCB9IGlmIChub3cgPSBuZXcgRGF0ZSgpKSA+IGN1dG9mZlxuXG4gICAgZGF5c1xuXG4gICMgR3JhcGggcmVwcmVzZW50aW5nIGEgdHJlbmRsaW5nIG9mIGFjdHVhbCBpc3N1ZXMuXG4gIHRyZW5kOiAoYWN0dWFsLCBjcmVhdGVkX2F0LCBkdWVfb24pIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3R1YWwubGVuZ3RoXG5cbiAgICBzdGFydCA9ICthY3R1YWxbMF0uZGF0ZVxuXG4gICAgIyBWYWx1ZXMgaXMgYSBsaXN0IG9mIHRpbWUgZnJvbSB0aGUgc3RhcnQgYW5kIHBvaW50cyByZW1haW5pbmcuXG4gICAgdmFsdWVzID0gXy5tYXAgYWN0dWFsLCAoeyBkYXRlLCBwb2ludHMgfSkgLT5cbiAgICAgIFsgK2RhdGUgLSBzdGFydCwgcG9pbnRzIF1cblxuICAgICMgTm93IGlzIGFuIGFjdHVhbCBwb2ludCB0b28uXG4gICAgbGFzdCA9IGFjdHVhbFthY3R1YWwubGVuZ3RoIC0gMV1cbiAgICB2YWx1ZXMucHVzaCBbICsgbmV3IERhdGUoKSAtIHN0YXJ0LCBsYXN0LnBvaW50cyBdXG5cbiAgICAjIGh0dHA6Ly9jbGFzc3Jvb20uc3lub255bS5jb20vY2FsY3VsYXRlLXRyZW5kbGluZS0yNzA5Lmh0bWxcbiAgICBiMSA9IDAgOyBlID0gMCA7IGMxID0gMFxuICAgIGEgPSAobCA9IHZhbHVlcy5sZW5ndGgpICogXy5yZWR1Y2UodmFsdWVzLCAoc3VtLCBbIGEsIGIgXSkgLT5cbiAgICAgIGIxICs9IGEgOyBlICs9IGJcbiAgICAgIGMxICs9IE1hdGgucG93KGEsIDIpXG4gICAgICBzdW0gKyAoYSAqIGIpXG4gICAgLCAwKVxuXG4gICAgc2xvcGUgPSAoYSAtIChiMSAqIGUpKSAvICgobCAqIGMxKSAtIChNYXRoLnBvdyhiMSwgMikpKVxuICAgIGludGVyY2VwdCA9IChlIC0gKHNsb3BlICogYjEpKSAvIGxcbiAgICBmbiA9ICh4KSAtPiBzbG9wZSAqIHggKyBpbnRlcmNlcHRcblxuICAgICMgTWlsZXN0b25lIGFsd2F5cyBoYXMgYSBjcmVhdGlvbiBkYXRlLlxuICAgIGNyZWF0ZWRfYXQgPSBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgIyBEdWUgZGF0ZSBjYW4gYmUgZW1wdHkuXG4gICAgZHVlX29uID0gaWYgZHVlX29uIHRoZW4gbmV3IERhdGUoZHVlX29uKSBlbHNlIG5ldyBEYXRlKClcblxuICAgIGEgPSBjcmVhdGVkX2F0IC0gc3RhcnRcbiAgICBiID0gZHVlX29uIC0gc3RhcnRcblxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgJ2RhdGUnOiBjcmVhdGVkX2F0XG4gICAgICAgICdwb2ludHMnOiBmbihhKVxuICAgICAgfSwge1xuICAgICAgICAnZGF0ZSc6IGR1ZV9vblxuICAgICAgICAncG9pbnRzJzogZm4oYilcbiAgICAgIH1cbiAgICBdIiwieyBfLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxuIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5jb25maWcgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggaXNzdWVzIGZvciBhIG1pbGVzdG9uZS5cbiAgZmV0Y2hBbGw6IChyZXBvLCBjYikgLT5cbiAgICAjIENhbGN1bGF0ZSBzaXplIG9mIGVpdGhlciBvcGVuIG9yIGNsb3NlZCBpc3N1ZXMuXG4gICAgIyBNb2RpZmllcyBpc3N1ZXMgYnkgcmVmLlxuICAgIGNhbGNTaXplID0gKGxpc3QsIGNiKSAtPlxuICAgICAgc3dpdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnBvaW50c1xuICAgICAgICB3aGVuICdPTkVfU0laRSdcbiAgICAgICAgICBzaXplID0gbGlzdC5sZW5ndGhcblxuICAgICAgICAgICggaXNzdWUuc2l6ZSA9IDEgZm9yIGlzc3VlIGluIGxpc3QgKVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cbiAgICAgICAgXG4gICAgICAgIHdoZW4gJ0xBQkVMUydcbiAgICAgICAgICBzaXplID0gMFxuXG4gICAgICAgICAgbGlzdCA9IF8uZmlsdGVyIGxpc3QsIChpc3N1ZSkgLT5cbiAgICAgICAgICAgICMgU2tpcCBpZiBubyBsYWJlbHMgZXhpc3QuXG4gICAgICAgICAgICByZXR1cm4gbm8gdW5sZXNzIGxhYmVscyA9IGlzc3VlLmxhYmVsc1xuXG4gICAgICAgICAgICAjIERldGVybWluZSB0aGUgdG90YWwgaXNzdWUgc2l6ZSBmcm9tIGFsbCBsYWJlbHMuXG4gICAgICAgICAgICBpc3N1ZS5zaXplID0gXy5yZWR1Y2UgbGFiZWxzLCAoc3VtLCBsYWJlbCkgLT5cbiAgICAgICAgICAgICAgIyBOb3QgbWF0Y2hpbmcuXG4gICAgICAgICAgICAgIHJldHVybiBzdW0gdW5sZXNzIG1hdGNoZXMgPSBsYWJlbC5uYW1lLm1hdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnNpemVfbGFiZWxcbiAgICAgICAgICAgICAgIyBJbmNyZWFzZSBzdW0uXG4gICAgICAgICAgICAgIHN1bSArPSBwYXJzZUludCBtYXRjaGVzWzFdXG4gICAgICAgICAgICAsIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBJbmNyZWFzZSB0aGUgdG90YWwuXG4gICAgICAgICAgICBzaXplICs9IGlzc3VlLnNpemVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBcmUgd2Ugc2F2aW5nIGl0P1xuICAgICAgICAgICAgISFpc3N1ZS5zaXplXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuXG4gICAgIyBGb3IgZWFjaCBzdGF0ZS4uLlxuICAgIG9uZVN0YXR1cyA9IChzdGF0ZSwgY2IpIC0+XG4gICAgICAjIENvbmNhdCB0aGVtIGhlcmUuXG4gICAgICByZXN1bHRzID0gW11cblxuICAgICAgIyBPbmUgcGFnZWZ1bCBmZXRjaCAobmV4dCBwYWdlcyBpbiBzZXJpZXMpLlxuICAgICAgZG8gZmV0Y2hQYWdlID0gKHBhZ2U9MSkgLT5cbiAgICAgICAgcmVxdWVzdC5hbGxJc3N1ZXMgcmVwbywgeyBzdGF0ZSwgcGFnZSB9LCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICMgRXJyb3JzP1xuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBFbXB0eT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAgICAgICAjIENvbmNhdCBzb3J0ZWQgKGFwaSBkb2VzIG5vdCBzb3J0IG9uIGNsb3NlZF9hdCEpLlxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBfLnNvcnRCeSBkYXRhLCAnY2xvc2VkX2F0J1xuICAgICAgICAgICMgPCAxMDAgcmVzdWx0cz9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyBpZiBkYXRhLmxlbmd0aCA8IDEwMFxuICAgICAgICAgICMgRmV0Y2ggdGhlIG5leHQgcGFnZSB0aGVuLlxuICAgICAgICAgIGZldGNoUGFnZSBwYWdlICsgMVxuXG4gICAgIyBGb3IgZWFjaCBgb3BlbmAgYW5kIGBjbG9zZWRgIGlzc3VlcyBpbiBwYXJhbGxlbC5cbiAgICBhc3luYy5wYXJhbGxlbCBbXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdvcGVuJyksICAgY2FsY1NpemUgXVxuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnY2xvc2VkJyksIGNhbGNTaXplIF1cbiAgICBdLCAoZXJyLCBbIG9wZW4sIGNsb3NlZCBdKSAtPlxuICAgICAgY2IgZXJyLCB7IG9wZW4sIGNsb3NlZCB9IiwiIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggYSBtaWxlc3RvbmUuXG4gICdmZXRjaCc6IHJlcXVlc3Qub25lTWlsZXN0b25lXG5cbiAgIyBGZXRjaCBhbGwgbWlsZXN0b25lcy5cbiAgJ2ZldGNoQWxsJzogcmVxdWVzdC5hbGxNaWxlc3RvbmVzXG5cbiAgICAjICMgR2V0IHRoZSBjdXJyZW50IG1pbGVzdG9uZSBvdXQgb2YgbWFueS5cbiAgICAjIGVsc2VcbiAgICAjICAgcmVxdWVzdC5hbGxNaWxlc3RvbmVzIHJlcG8sIChlcnIsIGRhdGEpIC0+XG4gICAgIyAgICAgIyBFcnJvcnM/XG4gICAgIyAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAjICAgICAjIEVtcHR5IHdhcm5pbmc/XG4gICAgIyAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gb3BlbiBtaWxlc3RvbmVzIGZvciByZXBvICN7cmVwby5wYXRofVwiIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuXG4gICAgIyAgICAgbSA9IGRhdGFbMF1cbiAgICAjICAgICAjIEZpbHRlciBtaWxlc3RvbmVzIHdpdGhvdXQgZHVlIGRhdGUuXG4gICAgIyAgICAgbSA9IF8ucmVzdCBkYXRhLCB7ICdkdWVfb24nIDogbnVsbCB9XG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC4gUHJlZmVyIG1pbGVzdG9uZXMgd2l0aCBkdWUgZGF0ZXMuXG4gICAgIyAgICAgbSA9IGlmIG1bMF0gdGhlbiBtWzBdIGVsc2UgZGF0YVswXVxuICAgICMgICAgICMgRW1wdHkgbWlsZXN0b25lP1xuICAgICMgICAgIGlmIG0ub3Blbl9pc3N1ZXMgKyBtLmNsb3NlZF9pc3N1ZXMgaXMgMFxuICAgICMgICAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gaXNzdWVzIGZvciBtaWxlc3RvbmUgYCN7bS50aXRsZX1gXCJcblxuICAgICMgICAgIGNiIG51bGwsIG51bGwsIG0iLCJ7IF8sIFN1cGVyQWdlbnQgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbnVzZXIgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5cbiMgQ3VzdG9tIEpTT04gcGFyc2VyLlxuU3VwZXJBZ2VudC5wYXJzZSA9XG4gICdhcHBsaWNhdGlvbi9qc29uJzogKHJlcykgLT5cbiAgICB0cnlcbiAgICAgIEpTT04ucGFyc2UgcmVzXG4gICAgY2F0Y2ggZVxuICAgICAge30gIyBpdCB3YXMgbm90IHRvIGJlLi4uXG5cbiMgRGVmYXVsdCBhcmdzLlxuZGVmYXVsdHMgPVxuICAnZ2l0aHViJzpcbiAgICAnaG9zdCc6ICdhcGkuZ2l0aHViLmNvbSdcbiAgICAncHJvdG9jb2wnOiAnaHR0cHMnXG5cbiMgUHVibGljIGFwaS5cbm1vZHVsZS5leHBvcnRzID1cbiAgXG4gICMgR2V0IGEgcmVwby5cbiAgcmVwbzogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX1cIlxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBvcGVuIG1pbGVzdG9uZXMuXG4gIGFsbE1pbGVzdG9uZXM6ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPiBcbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG4gIFxuICAjIEdldCBvbmUgb3BlbiBtaWxlc3RvbmUuXG4gIG9uZU1pbGVzdG9uZTogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXMvI3ttaWxlc3RvbmV9XCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIGlzc3VlcyBmb3IgYSBzdGF0ZS5cbiAgYWxsSXNzdWVzOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIHF1ZXJ5LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L2lzc3Vlc1wiXG4gICAgICAgICdxdWVyeSc6ICBfLmV4dGVuZCBxdWVyeSwgeyBtaWxlc3RvbmUsICdwZXJfcGFnZSc6ICcxMDAnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuIyBNYWtlIGEgcmVxdWVzdCB1c2luZyBTdXBlckFnZW50LlxucmVxdWVzdCA9ICh7IHByb3RvY29sLCBob3N0LCBwYXRoLCBxdWVyeSwgaGVhZGVycyB9LCBjYikgLT5cbiAgZXhpdGVkID0gbm9cblxuICAjIE1ha2UgdGhlIHF1ZXJ5IHBhcmFtcy5cbiAgcSA9IGlmIHF1ZXJ5IHRoZW4gJz8nICsgKCBcIiN7a309I3t2fVwiIGZvciBrLCB2IG9mIHF1ZXJ5ICkuam9pbignJicpIGVsc2UgJydcblxuICAjIFRoZSBVUkkuXG4gIHJlcSA9IFN1cGVyQWdlbnQuZ2V0KFwiI3twcm90b2NvbH06Ly8je2hvc3R9I3twYXRofSN7cX1cIilcbiAgIyBBZGQgaGVhZGVycy5cbiAgKCByZXEuc2V0KGssIHYpIGZvciBrLCB2IG9mIGhlYWRlcnMgKVxuICBcbiAgIyBUaW1lb3V0IGZvciByZXF1ZXN0cyB0aGF0IGRvIG5vdCBmaW5pc2guLi4gc2VlICMzMi5cbiAgdGltZW91dCA9IHNldFRpbWVvdXQgLT5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjYiAnUmVxdWVzdCBoYXMgdGltZWQgb3V0J1xuICAsIDFlNCAjIGdpdmUgdXMgMTBzXG5cbiAgIyBTZW5kLlxuICByZXEuZW5kIChlcnIsIGRhdGEpIC0+XG4gICAgIyBBcnJpdmVkIHRvbyBsYXRlLlxuICAgIHJldHVybiBpZiBleGl0ZWRcbiAgICAjIEFsbCBmaW5lLlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNsZWFyVGltZW91dCB0aW1lb3V0XG4gICAgIyBBY3R1YWxseSBwcm9jZXNzIHRoZSByZXNwb25zZS5cbiAgICByZXNwb25zZSBlcnIsIGRhdGEsIGNiXG5cbiMgSG93IGRvIHdlIHJlc3BvbmQgdG8gYSByZXNwb25zZT9cbnJlc3BvbnNlID0gKGVyciwgZGF0YSwgY2IpIC0+XG4gIHJldHVybiBjYiBlcnJvciBlcnIgaWYgZXJyXG4gICMgMnh4P1xuICBpZiBkYXRhLnN0YXR1c1R5cGUgaXNudCAyXG4gICAgIyBEbyB3ZSBoYXZlIGEgbWVzc2FnZSBmcm9tIEdpdEh1Yj9cbiAgICByZXR1cm4gY2IgZGF0YS5ib2R5Lm1lc3NhZ2UgaWYgZGF0YT8uYm9keT8ubWVzc2FnZT9cbiAgICAjIFVzZSBTQSBvbmUuXG4gICAgcmV0dXJuIGNiIGRhdGEuZXJyb3IubWVzc2FnZVxuICAjIEFsbCBnb29kLlxuICBjYiBudWxsLCBkYXRhLmJvZHlcblxuIyBHaXZlIHVzIGhlYWRlcnMuXG5oZWFkZXJzID0gKHRva2VuKSAtPlxuICAjIFRoZSBkZWZhdWx0cy5cbiAgaCA9XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52MydcbiAgIyBBZGQgdG9rZW4/XG4gIGguQXV0aG9yaXphdGlvbiA9IFwidG9rZW4gI3t0b2tlbn1cIiBpZiB0b2tlbj9cbiAgaFxuXG5pc1ZhbGlkID0gKG9iaikgLT5cbiAgcnVsZXMgPVxuICAgICdvd25lcic6ICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ25hbWUnOiAgICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbWlsZXN0b25lJzogKHZhbCkgLT4gXy5pc0ludCB2YWxcbiAgXG4gICggcmV0dXJuIG5vIGZvciBrZXksIHZhbCBvZiBvYmogd2hlbiBrZXkgb2YgcnVsZXMgYW5kIG5vdCBydWxlc1trZXldKHZhbCkgKVxuXG4gIHllc1xuXG4jIFN3aXRjaCB3aGVuIHVzZXIgaXMgcmVhZHkuXG5pc1JlYWR5ID0gdXNlci5kYXRhLnJlYWR5XG5cbiMgQSBzdGFjayBvZiByZXF1ZXN0cyB0byBleGVjdXRlIG9uY2UgcmVhZHkuXG5zdGFjayA9IFtdXG5yZWFkeSA9IChjYikgLT5cbiAgaWYgaXNSZWFkeSB0aGVuIGRvIGNiIGVsc2Ugc3RhY2sucHVzaCBjYlxuXG4jIE9ic2VydmUgdXNlcidzIHJlYWRpbmVzcy5cbnVzZXIub2JzZXJ2ZSAncmVhZHknLCAodmFsKSAtPlxuICBpc1JlYWR5ID0gdmFsXG4gICMgQ2xlYXIgdGhlIHN0YWNrP1xuICAoIGRvIHN0YWNrLnNoaWZ0KCkgd2hpbGUgc3RhY2subGVuZ3RoICkgaWYgdmFsXG5cbiMgUGFyc2UgYW4gZXJyb3IuXG5lcnJvciA9IChlcnIpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gXy5pc1N0cmluZyBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJcbiAgICB3aGVuIF8uaXNBcnJheSBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJbMV1cbiAgICB3aGVuIF8uaXNPYmplY3QoZXJyKSBhbmQgXy5pc1N0cmluZyhlcnIubWVzc2FnZSlcbiAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuXG4gIHVubGVzcyBtZXNzYWdlXG4gICAgdHJ5XG4gICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkgZXJyXG4gICAgY2F0Y2hcbiAgICAgIG1lc3NhZ2UgPSBkbyBlcnIudG9TdHJpbmdcblxuICBtZXNzYWdlIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbk1lZGlhdG9yID0gUmFjdGl2ZS5leHRlbmQge31cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWVkaWF0b3IoKSIsInsgXywgZGlyZWN0b3IgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuL21lZGlhdG9yLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5cbmVsID0gJyNwYWdlJ1xuXG5wYWdlcyA9XG4gIFwiaW5kZXhcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL2luZGV4LmNvZmZlZVwiXG4gIFwibWlsZXN0b25lXCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlXCJcbiAgXCJuZXdcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL25ldy5jb2ZmZWVcIlxuICBcInByb2plY3RcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlXCJcblxuIyBBZGQgYSBwcm9qZWN0IGZyb20gYSByb3V0ZS5cbmFkZFByb2plY3QgPSAocGFnZSwgb3duZXIsIG5hbWUpIC0+XG4gIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH1cblxuIyBQcmVhcHBseSBhbGwgZnVuY3Rpb25zIHdpdGggb3VyIHBhZ2UgbmFtZS9jb250ZXh0LlxuYyA9IChuYW1lLCBmbnM9W10pIC0+XG4gICggXy5wYXJ0aWFsIGZuLCBuYW1lIGZvciBmbiBpbiBmbnMgKVxuXG52aWV3ID0gbnVsbFxucm91dGUgPSAocGFnZSwgYXJncy4uLikgLT5cbiAgIyBVbnJlbmRlciB0aGUgcHJldmlvdXMgb25lLlxuICBkbyB2aWV3Py50ZWFyZG93blxuICAjIEhpZGUgYW55IG5vdGlmaWNhdGlvbnMuXG4gIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5L2hpZGUnXG4gICMgUmVxdWlyZSB0aGUgbmV3IG9uZS5cbiAgUGFnZSA9IHBhZ2VzW3BhZ2VdXG4gICMgUmVuZGVyIGl0LlxuICB2aWV3ID0gbmV3IFBhZ2UgeyBlbCwgJ2RhdGEnOiB7ICdyb3V0ZSc6IGFyZ3MgfSB9XG5cbnJvdXRlcyA9XG4gICcvJzogICAgICAgICAgICAgICAgICAgICAgICBjICdpbmRleCcsIFsgcm91dGUgXVxuICAnL25ldy9wcm9qZWN0JzogICAgICAgICAgICAgYyAnbmV3JywgICBbIHJvdXRlIF1cbiAgIyBUaGUgZm9sbG93aW5nIHR3byByb3V0ZXMgYWRkIGEgcHJvamVjdCBpbiB0aGUgYmFja2dyb3VuZC5cbiAgJy86b3duZXIvOm5hbWUnOiAgICAgICAgICAgIGMgJ3Byb2plY3QnLCAgIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAnLzpvd25lci86bmFtZS86bWlsZXN0b25lJzogYyAnbWlsZXN0b25lJywgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICMgVE9ETzogcmVtb3ZlIGluIHByb2R1Y3Rpb24uXG4gICcvcmVzZXQnOiAtPlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9jbGVhcidcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJ1xuXG4jIEZsYXRpcm9uIERpcmVjdG9yIHJvdXRlci5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3IuUm91dGVyKHJvdXRlcykuY29uZmlndXJlXG4gICdzdHJpY3QnOiBubyAjIGFsbG93IHRyYWlsaW5nIHNsYXNoZXNcbiAgbm90Zm91bmQ6IC0+XG4gICAgdGhyb3cgNDA0IiwieyBtb21lbnQgfSAgPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbiMgUHJvZ3Jlc3MgaW4gJS5cbnByb2dyZXNzID0gKGEsIGIpIC0+IDEwMCAqIChhIC8gKGIgKyBhKSlcblxuIyBDYWxjdWxhdGUgdGhlIHN0YXRzIGZvciBhIG1pbGVzdG9uZS5cbiMgIElzIGl0IG9uIHRpbWU/IFdoYXQgaXMgdGhlIHByb2dyZXNzP1xubW9kdWxlLmV4cG9ydHMgPSAobWlsZXN0b25lKSAtPlxuICAgICMgUHJvZ3Jlc3MgaW4gcG9pbnRzLlxuICAgIHBvaW50cyA9IHByb2dyZXNzIG1pbGVzdG9uZS5pc3N1ZXMuY2xvc2VkLnNpemUsIG1pbGVzdG9uZS5pc3N1ZXMub3Blbi5zaXplICAgIFxuICAgIFxuICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGR1ZSBkYXRlIGFyZSBhbHdheXMgb24gdHJhY2suXG4gICAgcmV0dXJuIHsgJ2lzT25UaW1lJzogeWVzLCAncHJvZ3Jlc3MnOiB7IHBvaW50cyB9IH0gdW5sZXNzIG1pbGVzdG9uZS5kdWVfb25cblxuICAgIGEgPSArbmV3IERhdGUgbWlsZXN0b25lLmNyZWF0ZWRfYXRcbiAgICBiID0gK25ldyBEYXRlXG4gICAgYyA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIFByb2dyZXNzIGluIHRpbWUuXG4gICAgdGltZSA9IHByb2dyZXNzIGIgLSBhLCBjIC0gYlxuXG4gICAgIyBIb3cgbWFueSBkYXlzIGlzIDElIG9mIHRoZSB0aW1lP1xuICAgIGRheXMgPSAobW9tZW50KGIpLmRpZmYobW9tZW50KGEpLCAnZGF5cycpKSAvIDEwMFxuXG4gICAge1xuICAgICAgJ2lzT25UaW1lJzogcG9pbnRzID4gdGltZVxuICAgICAgJ3Byb2dyZXNzJzogeyBwb2ludHMsIHRpbWUgfVxuICAgICAgJ2RheXMnOiAgICAgZGF5c1xuICAgIH0iLCIjIEFsbCBvdXIgdmVuZG9yIGRlcGVuZGVuY2llcyBpbiBvbmUgcGxhY2UuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICdfJzogd2luZG93Ll9cbiAgJ1JhY3RpdmUnOiB3aW5kb3cuUmFjdGl2ZVxuICAnRmlyZWJhc2UnOiB3aW5kb3cuRmlyZWJhc2VcbiAgJ0ZpcmViYXNlU2ltcGxlTG9naW4nOiB3aW5kb3cuRmlyZWJhc2VTaW1wbGVMb2dpblxuICAnU3VwZXJBZ2VudCc6IHdpbmRvdy5zdXBlcmFnZW50XG4gICdhc3luYyc6IHdpbmRvdy5hc3luY1xuICAnbW9tZW50Jzogd2luZG93Lm1vbWVudFxuICAnZDMnOiB3aW5kb3cuZDNcbiAgJ21hcmtlZCc6IHdpbmRvdy5tYXJrZWRcbiAgJ2RpcmVjdG9yJzpcbiAgICAnUm91dGVyJzogd2luZG93LlJvdXRlclxuICAnbHNjYWNoZSc6IHdpbmRvdy5sc2NhY2hlXG4gICdzb3J0ZWRJbmRleENtcCc6IHdpbmRvdy5zb3J0ZWRJbmRleFxuICAnc2VtdmVyJzogcmVxdWlyZSAnc2VtdmVyJyIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJhcHBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTm90aWZ5XCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiSGVhZGVyXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInBhZ2VcIn0sXCJmXCI6W119LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbXCImY29weTsgMjAxMi0yMDE0IFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcImh0dHA6Ly9jbG91ZGZpLnJlXCJ9LFwiZlwiOltcIkNsb3VkZmlyZSBTeXN0ZW1zXCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNoYXJ0XCJ9fV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImhlYWRcIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUzLFwiclwiOlwidXNlclwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInJpZ2h0XCJ9LFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJkaXNwbGF5TmFtZVwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcImRpc3BsYXlOYW1lXCJ9LFwiIGxvZ2dlZCBpblwiXX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJnaXRodWJcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcIiFsb2dpblwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImdpdGh1YlwifX0sXCIgU2lnbiBJblwiXX1dLFwiclwiOlwiZGlzcGxheU5hbWVcIn1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaWRcIjpcImljb25cIixcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidWxcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbmV3L3Byb2plY3RcIixcImNsYXNzXCI6XCJhZGRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJwbHVzLWNpcmNsZWRcIn19LFwiIEFkZCBhIFByb2plY3RcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwiZmFxXCJ9LFwiZlwiOltcIkZBUVwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNyZXNldFwifSxcImZcIjpbXCJEQiBSZXNldFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNub3RpZnlcIn0sXCJmXCI6W1wiTm90aWZ5XCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImhlcm9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImNvbnRlbnRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJhZGRyZXNzXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiU2VlIHlvdXIgcHJvamVjdCBwcm9ncmVzc1wiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W1wiTm90IHN1cmUgd2hlcmUgdG8gc3RhcnQ/IEp1c3QgYWRkIGEgZGVtbyByZXBvIHRvIHNlZSBhIGNoYXJ0LiBUaGVyZSBhcmUgbWFueSB2YXJpYXRpb25zIG9mIHBhc3NhZ2VzIG9mIExvcmVtIElwc3VtIGF2YWlsYWJsZSwgYnV0IHRoZSBtYWpvcml0eSBoYXZlIHN1ZmZlcmVkIGFsdGVyYXRpb24gaW4gc29tZSBmb3JtLCBieSBpbmplY3RlZCBodW1vdXIsIG9yIHJhbmRvbWlzZWQgd29yZHMgd2hpY2ggZG9uJ3QgbG9vayBldmVuIHNsaWdodGx5IGJlbGlldmFibGUuXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJjdGFcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcInByaW1hcnlcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJwbHVzLWNpcmNsZWRcIn19LFwiIEFkZCB5b3VyIHByb2plY3RcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJzZWNvbmRhcnlcIn0sXCJmXCI6W1wiUmVhZCB0aGUgR3VpZGVcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJjb2RlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiaWNvbiBcIix7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImNvZGVcIl0sXCJzXCI6XCJcXFwiJiNcXFwiK18wK1xcXCI7XFxcIlwifX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJ0ZXh0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwic3lzdGVtXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9LFwiIHN5c3RlbVwiXSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwiclwiOlwidG9wXCJ9LFwiJVwiXX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJ0ZXh0XCJ9XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJub3RpZnlcIixcImNsYXNzXCI6W3tcInRcIjoyLFwiclwiOlwidHlwZVwifV0sXCJzdHlsZVwiOltcInRvcDpcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1widG9wXCJdLFwic1wiOlwiLV8wXCJ9fSxcInB4XCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImNsb3NlXCJ9LFwidlwiOntcImNsaWNrXCI6XCJjbG9zZVwifX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XSxcInJcIjpcInN5c3RlbVwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwicHJvamVjdHMubGlzdFwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIlByb2plY3RzXCIsXCJhXCI6e1wicHJvamVjdHNcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0c1wifV19fV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJIZXJvXCJ9XSxcInJcIjpcInByb2plY3RzLmxpc3RcIn1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJhXCI6e1wiY2xhc3NcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUudGl0bGVcIl0sXCJzXCI6XCJfMC50aXRsZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInN1YlwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJhXCI6e1wiY2xhc3NcIjpcImRlc2NyaXB0aW9uXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZGVzY3JpcHRpb25cIl0sXCJzXCI6XCJfMC5tYXJrZG93bihfMSlcIn19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkNoYXJ0XCIsXCJhXCI6e1wibWlsZXN0b25lXCI6W3tcInRcIjoyLFwiclwiOlwibWlsZXN0b25lXCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiQWRkIGEgUHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W1wiVHlwZSBpbiB0aGUgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSBhcyB5b3Ugd291bGQgbm9ybWFsbHkuIElmIHlvdSdkIGxpa2UgdG8gYWRkIGEgcHJpdmF0ZSBHaXRIdWIgcHJvamVjdCwgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbXCJTaWduIEluXCJdfSxcIiBmaXJzdC5cIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9ybVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJpbnB1dFwiLFwiYVwiOntcInR5cGVcIjpcInRleHRcIixcInBsYWNlaG9sZGVyXCI6XCJ1c2VyL3JlcG9cIixcImF1dG9jb21wbGV0ZVwiOlwib2ZmXCIsXCJ2YWx1ZVwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX0sXCJ2XCI6e1wia2V5dXBcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwidlwiOntcImNsaWNrXCI6e1wiblwiOlwic3VibWl0XCIsXCJkXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfX0sXCJmXCI6W1wiQWRkXCJdfV19XX1dfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJhXCI6e1wiY2xhc3NcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wicm91dGVcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCIvXFxcIilcIn19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIk1pbGVzdG9uZXNcIixcImFcIjp7XCJwcm9qZWN0XCI6W3tcInRcIjoyLFwiclwiOlwicHJvamVjdFwifV19fV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInByb2plY3RzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJzb3J0XCJ9LFwidlwiOntcImNsaWNrXCI6XCJzb3J0QnlcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJzb3J0LWFscGhhYmV0XCJ9fSxcIiBTb3J0ZWQgYnkgXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0cy5zb3J0QnlcIn1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiTWlsZXN0b25lc1wiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicHJvamVjdHMuaW5kZXhcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcIi5cIl0sXCJzXCI6XCJ7aW5kZXg6XzB9XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMFwiLFwicHJvamVjdHMubGlzdFwiXSxcInNcIjpcIntwOl8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwieFwiOntcInJcIjpbXCJwLm93bmVyXCIsXCJwcm9qZWN0Lm93bmVyXCIsXCJwLm5hbWVcIixcInByb2plY3QubmFtZVwiXSxcInNcIjpcIl8wPT1fMSYmXzI9PV8zXCJ9LFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMVwiLFwicHJvamVjdC5taWxlc3RvbmVzXCJdLFwic1wiOlwie21pbGVzdG9uZTpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcInByb2plY3Qub3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm5hbWVcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUubnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnRpdGxlXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wic3R5bGVcIjpcIndpZHRoOjElXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9ncmVzc1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInBlcmNlbnRcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJdLFwic1wiOlwiTWF0aC5mbG9vcihfMClcIn19LFwiJVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImR1ZVwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwic29ydFwifSxcInZcIjp7XCJjbGlja1wiOlwic29ydEJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IFwiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdHMuc29ydEJ5XCJ9XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlByb2plY3RzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwiZXJyb3JzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNvbHNwYW5cIjpcIjNcIixcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZXJyb3JcIixcInRpdGxlXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJlcnJvcnNcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCJcXFxcblxcXCIpXCJ9fV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYXR0ZW50aW9uXCJ9fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cHJvamVjdDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInByb2plY3RcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wiY2xhc3NcIjpcInJlcG9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUubnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnRpdGxlXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wic3R5bGVcIjpcIndpZHRoOjElXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9ncmVzc1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInBlcmNlbnRcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJdLFwic1wiOlwiTWF0aC5mbG9vcihfMClcIn19LFwiJVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImR1ZVwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJ9LFwiJVwiXX19XX1dfV19XX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzID1cbiAgbm93OiAtPiBuZXcgRGF0ZSgpLnRvSlNPTigpIiwieyBfLCBtb21lbnQsIG1hcmtlZCB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBUaW1lIGZyb20gbm93LlxuICBmcm9tTm93OiBfLm1lbW9pemUgKGpzb25EYXRlKSAtPlxuICAgIG1vbWVudChuZXcgRGF0ZShqc29uRGF0ZSkpLmZyb21Ob3coKVxuXG4gICMgV2hlbiBpcyBhIG1pbGVzdG9uZSBkdWU/XG4gIGR1ZTogKGpzb25EYXRlKSAtPlxuICAgIHJldHVybiAnJm5ic3A7JyB1bmxlc3MganNvbkRhdGVcbiAgICBbICdkdWUnLCBAZnJvbU5vdyBqc29uRGF0ZSBdLmpvaW4oJyAnKVxuXG4gICMgTWFya2Rvd24gZm9ybWF0dGluZy5cbiAgbWFya2Rvd246IChtYXJrdXApIC0+XG4gICAgbWFya2VkIG1hcmt1cFxuXG4gICMgRm9ybWF0IG1pbGVzdG9uZSB0aXRsZS5cbiAgdGl0bGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtaWxlc3RvbmUnKSA+IC0xXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgWyAnTWlsZXN0b25lJywgdGV4dCBdLmpvaW4oJyAnKVxuXG4gICMgSGV4IHRvIGRlY2ltYWwuXG4gIGhleFRvRGVjOiAoaGV4KSAtPlxuICAgIHBhcnNlSW50IGhleCwgMTYiLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGlzOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC50eXBlIGluIFsgJ2tleXVwJywgJ2tleWRvd24nIF1cblxuICBpc0VudGVyOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC53aGljaCBpcyAxMyIsInsgXyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5fLm1peGluXG4gICdwbHVja01hbnknOiAoc291cmNlLCBrZXlzKSAtPlxuICAgIHRocm93ICdga2V5c2AgbmVlZHMgdG8gYmUgYW4gQXJyYXknIHVubGVzcyBfLmlzQXJyYXkga2V5c1xuICAgIF8ubWFwIHNvdXJjZSwgKGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgXy5lYWNoIGtleXMsIChrZXkpIC0+XG4gICAgICAgIG9ialtrZXldID0gaXRlbVtrZXldXG4gICAgICBvYmpcblxuICAnaXNJbnQnOiAodmFsKSAtPlxuICAgIG5vdCBpc05hTih2YWwpIGFuZCBwYXJzZUludChOdW1iZXIodmFsKSkgaXMgdmFsIGFuZCBub3QgaXNOYU4ocGFyc2VJbnQodmFsLCAxMCkpIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdHMpIC0+XG4gIE1vZGVsID0gUmFjdGl2ZS5leHRlbmQob3B0cylcbiAgbW9kZWwgPSBuZXcgTW9kZWwoKVxuICBtb2RlbC5yZW5kZXIoKVxuICBtb2RlbCIsInsgUmFjdGl2ZSwgZDMgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubGluZXMgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSdcbmF4ZXMgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9jaGFydC5odG1sJ1xuXG4gIG9uY29tcGxldGU6IC0+XG4gICAgbWlsZXN0b25lID0gQGRhdGEubWlsZXN0b25lXG4gICAgaXNzdWVzID0gbWlsZXN0b25lLmlzc3Vlc1xuICAgICMgVG90YWwgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgbWlsZXN0b25lLlxuICAgIHRvdGFsID0gaXNzdWVzLm9wZW4uc2l6ZSArIGlzc3Vlcy5jbG9zZWQuc2l6ZVxuXG5cbiAgICAjIEFuIGlzc3VlIG1heSBoYXZlIGJlZW4gY2xvc2VkIGJlZm9yZSB0aGUgc3RhcnQgb2YgYSBtaWxlc3RvbmUuXG4gICAgaGVhZCA9IGlzc3Vlcy5jbG9zZWQubGlzdFswXS5jbG9zZWRfYXRcbiAgICBpZiBpc3N1ZXMubGVuZ3RoIGFuZCBtaWxlc3RvbmUuY3JlYXRlZF9hdCA+IGhlYWRcbiAgICAgICMgVGhpcyBpcyB0aGUgbmV3IHN0YXJ0LlxuICAgICAgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPSBoZWFkXG5cbiAgICAjIEFjdHVhbCwgaWRlYWwgJiB0cmVuZCBsaW5lcy5cbiAgICBhY3R1YWwgPSBsaW5lcy5hY3R1YWwgaXNzdWVzLmNsb3NlZC5saXN0LCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgdG90YWxcbiAgICBpZGVhbCAgPSBsaW5lcy5pZGVhbCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vbiwgdG90YWxcbiAgICB0cmVuZCAgPSBsaW5lcy50cmVuZCBhY3R1YWwsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIEdldCBhdmFpbGFibGUgc3BhY2UuXG4gICAgeyBoZWlnaHQsIHdpZHRoIH0gPSBkbyBAZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cbiAgICBtYXJnaW4gPSB7ICd0b3AnOiAzMCwgJ3JpZ2h0JzogMzAsICdib3R0b20nOiA0MCwgJ2xlZnQnOiA1MCB9XG4gICAgd2lkdGggLT0gbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHRcbiAgICBoZWlnaHQgLT0gbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b21cblxuICAgICMgU2NhbGVzLlxuICAgIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWyAwLCB3aWR0aCBdKVxuICAgIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbIGhlaWdodCwgMCBdKVxuXG4gICAgIyBBeGVzLlxuICAgIHhBeGlzID0gYXhlcy5ob3Jpem9udGFsIGhlaWdodCwgeFxuICAgIHlBeGlzID0gYXhlcy52ZXJ0aWNhbCB3aWR0aCwgeVxuXG4gICAgIyBMaW5lIGdlbmVyYXRvci5cbiAgICBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC5pbnRlcnBvbGF0ZShcImxpbmVhclwiKVxuICAgIC54KCAoZCkgLT4geChkLmRhdGUpIClcbiAgICAueSggKGQpIC0+IHkoZC5wb2ludHMpIClcblxuICAgICMgR2V0IHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIGRhdGUsIGFuZCBpbml0aWFsIHBvaW50cy5cbiAgICB4LmRvbWFpbihbIGlkZWFsWzBdLmRhdGUsIGlkZWFsW2lkZWFsLmxlbmd0aCAtIDFdLmRhdGUgXSlcbiAgICB5LmRvbWFpbihbIDAsIGlkZWFsWzBdLnBvaW50cyBdKS5uaWNlKClcblxuICAgICMgQWRkIGFuIFNWRyBlbGVtZW50IHdpdGggdGhlIGRlc2lyZWQgZGltZW5zaW9ucyBhbmQgbWFyZ2luLlxuICAgIHN2ZyA9IGQzLnNlbGVjdCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJyNjaGFydCcpKS5hcHBlbmQoXCJzdmdcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXG5cbiAgICAjIEFkZCB0aGUgZGF5cyB4LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIGRheVwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKHhBeGlzKVxuXG4gICAgIyBBZGQgdGhlIG1vbnRocyB4LWF4aXMuXG4gICAgbSA9IFtcbiAgICAgICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsXG4gICAgICAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXG4gICAgXVxuXG4gICAgbUF4aXMgPSB4QXhpc1xuICAgIC5vcmllbnQoXCJ0b3BcIilcbiAgICAudGlja1NpemUoaGVpZ2h0KVxuICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gbVtkLmdldE1vbnRoKCldIClcbiAgICAudGlja3MoMilcbiAgICBcbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgbW9udGhcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbChtQXhpcylcblxuICAgICMgQWRkIHRoZSB5LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieSBheGlzXCIpXG4gICAgLmNhbGwoeUF4aXMpXG5cbiAgICAjIEFkZCBhIGxpbmUgc2hvd2luZyB3aGVyZSB3ZSBhcmUgbm93LlxuICAgIHN2Zy5hcHBlbmQoXCJzdmc6bGluZVwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheVwiKVxuICAgIC5hdHRyKFwieDFcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkxXCIsIDApXG4gICAgLmF0dHIoXCJ4MlwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KVxuXG4gICAgIyBBZGQgdGhlIGlkZWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJpZGVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJiYXNpc1wiKShpZGVhbCkpXG5cbiAgICAjIEFkZCB0aGUgdHJlbmRsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidHJlbmRsaW5lIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKSh0cmVuZCkpXG5cbiAgICAjIEFkZCB0aGUgYWN0dWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJhY3R1YWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpLnkoIChkKSAtPiB5KGQucG9pbnRzKSApKGFjdHVhbCkpXG5cbiAgICAjIENvbGxlY3QgdGhlIHRvb2x0aXAgaGVyZS5cbiAgICB0b29sdGlwID0gZDMudGlwKCkuYXR0cignY2xhc3MnLCAnZDMtdGlwJykuaHRtbCAoeyBudW1iZXIsIHRpdGxlIH0pIC0+XG4gICAgICBcIiMje251bWJlcn06ICN7dGl0bGV9XCJcblxuICAgIHN2Zy5jYWxsKHRvb2x0aXApXG5cbiAgICAjIFNob3cgd2hlbiB3ZSBjbG9zZWQgYW4gaXNzdWUuXG4gICAgc3ZnLnNlbGVjdEFsbChcImEuaXNzdWVcIilcbiAgICAuZGF0YShhY3R1YWwuc2xpY2UoMSkpICMgc2tpcCB0aGUgc3RhcnRpbmcgcG9pbnRcbiAgICAuZW50ZXIoKVxuICAgICMgQSB3cmFwcGluZyBsaW5rLlxuICAgIC5hcHBlbmQoJ3N2ZzphJylcbiAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgKHsgaHRtbF91cmwgfSkgLT4gaHRtbF91cmwgKVxuICAgIC5hdHRyKFwieGxpbms6c2hvd1wiLCAnbmV3JylcbiAgICAuYXBwZW5kKCdzdmc6Y2lyY2xlJylcbiAgICAuYXR0cihcImN4XCIsICh7IGRhdGUgfSkgLT4geCBkYXRlIClcbiAgICAuYXR0cihcImN5XCIsICh7IHBvaW50cyB9KSAtPiB5IHBvaW50cyApXG4gICAgLmF0dHIoXCJyXCIsICAoeyByYWRpdXMgfSkgLT4gNSApICMgZml4ZWQgZm9yIG5vd1xuICAgIC5vbignbW91c2VvdmVyJywgdG9vbHRpcC5zaG93KVxuICAgIC5vbignbW91c2VvdXQnLCB0b29sdGlwLmhpZGUpXG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxueyBzeXN0ZW0gfSA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuZmlyZWJhc2UgICA9IHJlcXVpcmUgJy4uL21vZGVscy9maXJlYmFzZS5jb2ZmZWUnXG51c2VyICAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuSWNvbnMgICAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVhZGVyJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9oZWFkZXIuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3VzZXInOiB1c2VyXG4gICAgIyBEZWZhdWx0IGFwcCBpY29uLlxuICAgICdpY29uJzogJ2ZpcmUtc3RhdGlvbidcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgTG9naW4gdXNlci5cbiAgICBAb24gJyFsb2dpbicsIC0+XG4gICAgICBmaXJlYmFzZS5sb2dpbiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTd2l0Y2ggbG9hZGluZyBpY29uIHdpdGggYXBwIGljb24uXG4gICAgc3lzdGVtLm9ic2VydmUgJ2xvYWRpbmcnLCAoeWEpID0+XG4gICAgICBAc2V0ICdpY29uJywgaWYgeWEgdGhlbiAnc3Bpbm5lcjEnIGVsc2UgJ2ZpcmUtc3RhdGlvbiciLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9oZXJvJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9oZXJvLmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmZvcm1hdCA9IHJlcXVpcmUgJy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5cbiMgRm9udGVsbG8gaWNvbiBoZXggY29kZXMuXG5jb2RlcyA9XG4gICdjb2cnOiAgICAgICAgICAgJ1xcZTgwMCdcbiAgJ3NlYXJjaCc6ICAgICAgICAnXFxlODAxJ1xuICAnZ2l0aHViJzogICAgICAgICdcXGU4MDInXG4gICdhZGRyZXNzJzogICAgICAgJ1xcZTgwMydcbiAgJ3BsdXMtY2lyY2xlZCc6ICAnXFxlODA0J1xuICAnZmlyZS1zdGF0aW9uJzogICdcXGU4MDUnXG4gICdzb3J0LWFscGhhYmV0JzogJ1xcZTgwNidcbiAgJ2Rvd24tb3Blbic6ICAgICAnXFxlODA3J1xuICAnc3BpbjYnOiAgICAgICAgICdcXGU4MDgnXG4gICdtZWdhcGhvbmUnOiAgICAgJ1xcZTgwOSdcbiAgJ3NwaW40JzogICAgICAgICAnXFxlODBhJ1xuICAnc3Bpbm5lcjEnOiAgICAgICdcXGU4MGInXG4gICdhdHRlbnRpb24nOiAgICAgJ1xcZTgwYydcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2ljb25zJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9pY29ucy5odG1sJ1xuXG4gICdpc29sYXRlZCc6IHllc1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIEBvYnNlcnZlICdpY29uJywgKGljb24pIC0+XG4gICAgICBpZiBpY29uIGFuZCBoZXggPSBjb2Rlc1tpY29uXVxuICAgICAgICBAc2V0ICdjb2RlJywgZm9ybWF0LmhleFRvRGVjIGhleFxuICAgICAgZWxzZVxuICAgICAgICBAc2V0ICdjb2RlJywgbnVsbCIsInsgXywgUmFjdGl2ZSwgZDMgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbkhFSUdIVCA9IDY4ICMgaGVpZ2h0IG9mIGRpdiBpbiBweFxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3Mvbm90aWZ5J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9ub3RpZnkuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3RvcCc6IEhFSUdIVFxuICAgICdoaWRkZW4nOiB5ZXNcbiAgICAnZGVmYXVsdHMnOlxuICAgICAgJ3RleHQnOiAnJ1xuICAgICAgJ3R5cGUnOiAnJyAjIGJsYW5kIGdyZXkgc3R5bGVcbiAgICAgICdzeXN0ZW0nOiBub1xuICAgICAgJ2ljb24nOiAnbWVnYXBob25lJ1xuICAgICAgJ3R0bCc6ICA1ZTNcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gICMgU2hvdyBhIG5vdGlmaWNhdGlvbi5cbiAgc2hvdzogKG9wdHMpIC0+XG4gICAgQHNldCAnaGlkZGVuJywgbm8gICAgXG4gICAgIyBTZXQgdGhlIG9wdHMuXG4gICAgQHNldCBvcHRzID0gXy5kZWZhdWx0cyBvcHRzLCBAZGF0YS5kZWZhdWx0c1xuICAgICMgV2hpY2ggcG9zaXRpb24gdG8gc2xpZGUgdG8/XG4gICAgcG9zID0gWyAwLCA1MCBdWyArb3B0cy5zeXN0ZW0gXSAjIDBweCBvciA1MCUgZnJvbSB0b3BcbiAgICAjIFNsaWRlIGludG8gdmlldy5cbiAgICBAYW5pbWF0ZSAndG9wJywgcG9zLFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JvdW5jZScpXG4gICAgICAnZHVyYXRpb24nOiA4MDBcbiAgICBcbiAgICAjIElmIG5vIHR0bCB0aGVuIHNob3cgcGVybWFuZW50bHkuXG4gICAgcmV0dXJuIHVubGVzcyBvcHRzLnR0bFxuXG4gICAgIyBTbGlkZSBvdXQgb2YgdGhlIHZpZXcuXG4gICAgXy5kZWxheSBfLmJpbmQoQGhpZGUsIEApLCBvcHRzLnR0bFxuXG4gICMgSGlkZSBhIG5vdGlmaWNhdGlvbi5cbiAgaGlkZTogLT5cbiAgICByZXR1cm4gaWYgQGRhdGEuaGlkZGVuXG4gICAgQHNldCAnaGlkZGVuJywgeWVzXG5cbiAgICBAYW5pbWF0ZSAndG9wJywgSEVJR0hULFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JhY2snKVxuICAgICAgJ2NvbXBsZXRlJzogPT5cbiAgICAgICAgIyBSZXNldCB0aGUgdGV4dCB3aGVuIGFsbCBpcyBkb25lLlxuICAgICAgICBAc2V0ICd0ZXh0JywgbnVsbFxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBPbiBvdXRzaWRlIG1lc3NhZ2VzLlxuICAgIG1lZGlhdG9yLm9uICchYXBwL25vdGlmeScsIF8uYmluZCBAc2hvdywgQFxuICAgIG1lZGlhdG9yLm9uICchYXBwL25vdGlmeS9oaWRlJywgXy5iaW5kIEBoaWRlLCBAXG5cbiAgICAjIENsb3NlIHVzIHByZW1hdHVyZWx5Li4uXG4gICAgQG9uICdjbG9zZScsIEBoaWRlIiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5IZXJvICAgICA9IHJlcXVpcmUgJy4uL2hlcm8uY29mZmVlJ1xuUHJvamVjdHMgPSByZXF1aXJlICcuLi90YWJsZXMvcHJvamVjdHMuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvaW5kZXgnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEhlcm8sIFByb2plY3RzIH1cblxuICAnZGF0YSc6XG4gICAgJ3Byb2plY3RzJzogcHJvamVjdHNcbiAgICAncmVhZHknOiBub1xuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdCdXJuY2hhcnQ6IEdpdEh1YiBCdXJuZG93biBDaGFydCBhcyBhIFNlcnZpY2UnXG5cbiAgICAjIFF1aXQgaWYgd2UgaGF2ZSBubyBwcm9qZWN0cy5cbiAgICByZXR1cm4gQHNldCgncmVhZHknLCB5ZXMpIHVubGVzcyBwcm9qZWN0cy5saXN0Lmxlbmd0aFxuXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgIyBGb3IgYWxsIHByb2plY3RzLlxuICAgIGFzeW5jLm1hcCBwcm9qZWN0cy5kYXRhLmxpc3QsIChwcm9qZWN0LCBjYikgLT5cbiAgICAgICMgRmV0Y2ggdGhlaXIgbWlsZXN0b25lcy5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgKGVyciwgbGlzdCkgLT5cbiAgICAgICAgIyBTYXZlIHRoZSBlcnJvciBpZiBwcm9qZWN0IGRvZXMgbm90IGV4aXN0LlxuICAgICAgICBpZiBlcnJcbiAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgcmV0dXJuIGRvIGNiXG5cbiAgICAgICAgIyBOb3cgYWRkIGluIHRoZSBpc3N1ZXMuXG4gICAgICAgIGFzeW5jLmVhY2ggbGlzdCwgKG1pbGVzdG9uZSwgY2IpIC0+XG4gICAgICAgICAgIyBEbyB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwgaWYgXy5maW5kIHByb2plY3QubWlsZXN0b25lcywgKHsgbnVtYmVyIH0pIC0+XG4gICAgICAgICAgICBtaWxlc3RvbmUubnVtYmVyIGlzIG51bWJlclxuICAgICAgICAgIFxuICAgICAgICAgICMgT0sgZmV0Y2ggYWxsIHRoZSBpc3N1ZXMgZm9yIHRoaXMgbWlsZXN0b25lIHRoZW4uXG4gICAgICAgICAgaXNzdWVzLmZldGNoQWxsXG4gICAgICAgICAgICAnb3duZXInOiBwcm9qZWN0Lm93bmVyXG4gICAgICAgICAgICAnbmFtZSc6IHByb2plY3QubmFtZVxuICAgICAgICAgICAgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXJcbiAgICAgICAgICAsIChlcnIsIG9iaikgLT5cbiAgICAgICAgICAgICMgU2F2ZSBhbnkgZXJyb3JzIG9uIHRoZSBwcm9qZWN0LlxuICAgICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICAgIHByb2plY3RzLnNhdmVFcnJvciBwcm9qZWN0LCBlcnJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvIGNiXG5cbiAgICAgICAgICAgICMgQWRkIGluIHRoZSBpc3N1ZXMgdG8gdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lLlxuICAgICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIG1pbGVzdG9uZVxuICAgICAgICAgICAgIyBEb25lXG4gICAgICAgICAgICBkbyBjYlxuICAgICAgICBcbiAgICAgICAgLCBjYlxuXG4gICAgLCA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgQHNldCAncmVhZHknLCB5ZXMiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkNoYXJ0ID0gcmVxdWlyZSAnLi4vY2hhcnQuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuZm9ybWF0ICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbWlsZXN0b25lLmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IENoYXJ0IH1cblxuICAnZGF0YSc6XG4gICAgJ2Zvcm1hdCc6IGZvcm1hdFxuICAgICdyZWFkeSc6IG5vXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgWyBvd25lciwgbmFtZSwgbWlsZXN0b25lIF0gPSBAZ2V0ICdyb3V0ZSdcbiAgXG4gICAgbWlsZXN0b25lID0gcGFyc2VJbnQgbWlsZXN0b25lXG5cbiAgICBkb2N1bWVudC50aXRsZSA9IFwiI3tvd25lcn0vI3tuYW1lfS8je21pbGVzdG9uZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBwcm9qZWN0ID0gcHJvamVjdHMuZmluZCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgU2hvdWxkIG5vdCBoYXBwZW4uLi5cbiAgICB0aHJvdyA1MDAgdW5sZXNzIHByb2plY3RcblxuICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgIG9iaiA9IF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsIHsgJ251bWJlcic6IG1pbGVzdG9uZSB9XG4gICAgcmV0dXJuIEBzZXQgeyAnbWlsZXN0b25lJzogb2JqLCAncmVhZHknOiB5ZXMgfSBpZiBvYmo/XG5cbiAgICAjIFdlIGFyZSBsb2FkaW5nIHRoZSBtaWxlc3RvbmVzIHRoZW4uXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgZmV0Y2hNaWxlc3RvbmUgPSAoY2IpIC0+XG4gICAgICBtaWxlc3RvbmVzLmZldGNoIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYlxuXG4gICAgZmV0Y2hJc3N1ZXMgPSAoZGF0YSwgY2IpIC0+XG4gICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIChlcnIsIG9iaikgLT5cbiAgICAgICAgY2IgZXJyLCBfLmV4dGVuZCBkYXRhLCB7ICdpc3N1ZXMnOiBvYmogfVxuXG4gICAgYXN5bmMud2F0ZXJmYWxsIFtcbiAgICAgICMgR2V0IHRoZSBtaWxlc3RvbmUuXG4gICAgICBmZXRjaE1pbGVzdG9uZSxcbiAgICAgICMgVGhlbiBhbGwgaXRzIGlzc3Vlcy5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVyciwgZGF0YSkgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lIHdpdGggaXNzdWVzLlxuICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIGRhdGFcblxuICAgICAgIyBTaG93IHRoZSBwYWdlLlxuICAgICAgQHNldFxuICAgICAgICAnbWlsZXN0b25lJzogZGF0YVxuICAgICAgICAncmVhZHknOiB5ZXMiLCJ7IF8sIFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG51c2VyICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcbmtleSAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMva2V5LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL25ldydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwnXG5cbiAgJ2RhdGEnOiB7ICd2YWx1ZSc6ICdyYWRla3N0ZXBhbi9kaXNwb3NhYmxlJywgdXNlciB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gICMgTGlzdGVuIHRvIEVudGVyIGtleXByZXNzIG9yIFN1Ym1pdCBidXR0b24gY2xpY2suXG4gIHN1Ym1pdDogKGV2dCwgdmFsdWUpIC0+XG4gICAgcmV0dXJuIGlmIGtleS5pcyhldnQpIGFuZCBub3Qga2V5LmlzRW50ZXIoZXZ0KVxuXG4gICAgWyBvd25lciwgbmFtZSBdID0gdmFsdWUuc3BsaXQoJy8nKVxuXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgIyBTYXZlIHJlcG8uXG4gICAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfSwgKGVycikgLT5cbiAgICAgIGRvIGRvbmVcblxuICAgICAgbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLFxuICAgICAgICAndGV4dCc6IGVyciBvciBcIlByb2plY3QgI3t2YWx1ZX0gc2F2ZWQuXCJcbiAgICAgICAgJ3R5cGUnOiBpZiBlcnIgdGhlbiAnZXJyb3InIGVsc2UgJ3N1Y2Nlc3MnXG5cbiAgICAgICMgUmVkaXJlY3QgdG8gdGhlIGRhc2hib2FyZC5cbiAgICAgICMgVE9ETzogdHJpZ2dlciBhIG5hbWVkIHJvdXRlXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJ1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0FkZCBhIG5ldyBwcm9qZWN0J1xuXG4gICAgIyBUT0RPOiBhdXRvY29tcGxldGUgb24gb3VyIHVzZXJuYW1lIGlmIHdlIGFyZSBsb2dnZWQgaW4gb3IgYmFzZWRcbiAgICAjICBvbiByZXBvcyB3ZSBhbHJlYWR5IGhhdmUuXG4gICAgYXV0b2NvbXBsZXRlID0gKHZhbHVlKSAtPlxuXG4gICAgQG9ic2VydmUgJ3ZhbHVlJywgXy5kZWJvdW5jZShhdXRvY29tcGxldGUsIDIwMCksIHsgJ2luaXQnOiBubyB9XG5cbiAgICAjIEZvY3VzIG9uIHRoZSBpbnB1dCBmaWVsZC5cbiAgICBkbyBAZWwucXVlcnlTZWxlY3RvcignaW5wdXQnKS5mb2N1c1xuXG4gICAgQG9uICdzdWJtaXQnLCBAc3VibWl0IiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5NaWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vdGFibGVzL21pbGVzdG9uZXMuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvcHJvamVjdCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBNaWxlc3RvbmVzIH1cblxuICAnZGF0YSc6XG4gICAgJ3Byb2plY3RzJzogcHJvamVjdHNcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUgXSA9IEBnZXQgJ3JvdXRlJ1xuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBAc2V0ICdwcm9qZWN0JywgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIFdlIGRvbid0IGtub3cgaWYgd2UgaGF2ZSBhbGwgbWlsZXN0b25lcywgc28gZmV0Y2ggdGhlbS5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmaW5kTWlsZXN0b25lID0gKG51bWJlcikgLT5cbiAgICAgIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMgb3IgW10sIHsgbnVtYmVyIH1cblxuICAgIGZldGNoTWlsZXN0b25lcyA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGFsbE1pbGVzdG9uZXMsIGNiKSAtPlxuICAgICAgYXN5bmMuZWFjaCBhbGxNaWxlc3RvbmVzLCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgIyBNYXliZSB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgIHJldHVybiBjYiBudWxsIGlmIGZpbmRNaWxlc3RvbmUgbWlsZXN0b25lLm51bWJlclxuICAgICAgICAjIE5lZWQgdG8gZmV0Y2ggdGhlIGlzc3VlcyB0aGVuLlxuICAgICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXIgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAjIE5leHQuXG4gICAgICAgICAgZG8gY2JcbiAgICAgICwgY2JcblxuICAgICMgUnVuIGl0LlxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEZpcnN0IGdldCBhbGwgdGhlIG1pbGVzdG9uZXMuXG4gICAgICBmZXRjaE1pbGVzdG9uZXMsXG4gICAgICAjIFRoZW4gYWxsIHRoZSBpc3N1ZXMgcGVyIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVycikgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F5IHdlIGFyZSByZWFkeS5cbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwiVGFibGUgPSByZXF1aXJlICcuL3RhYmxlLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJsZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9taWxlc3RvbmVzJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sJyIsIlRhYmxlID0gcmVxdWlyZSAnLi90YWJsZS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gVGFibGUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcHJvamVjdHMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9wcm9qZWN0cy5odG1sJyIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5mb3JtYXQgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4uL2ljb25zLmNvZmZlZSdcbnByb2plY3RzID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3RhYmxlJ1xuXG4gICdkYXRhJzogeyBmb3JtYXQgfVxuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgQ2hhbmdlIHNvcnQgb3JkZXIuXG4gICAgQG9uICdzb3J0QnknLCAtPlxuICAgICAgZm5zID0gcHJvamVjdHMuZGF0YS5zb3J0Rm5zXG5cbiAgICAgIGlkeCA9IDEgKyBmbnMuaW5kZXhPZiBwcm9qZWN0cy5kYXRhLnNvcnRCeVxuICAgICAgaWR4ID0gMCBpZiBpZHggaXMgZm5zLmxlbmd0aFxuXG4gICAgICBwcm9qZWN0cy5zZXQgJ3NvcnRCeScsIGZuc1tpZHhdIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8vIGV4cG9ydCB0aGUgY2xhc3MgaWYgd2UgYXJlIGluIGEgTm9kZS1saWtlIHN5c3RlbS5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyA9PT0gZXhwb3J0cylcbiAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gU2VtVmVyO1xuXG4vLyBUaGUgZGVidWcgZnVuY3Rpb24gaXMgZXhjbHVkZWQgZW50aXJlbHkgZnJvbSB0aGUgbWluaWZpZWQgdmVyc2lvbi5cbi8qIG5vbWluICovIHZhciBkZWJ1Zztcbi8qIG5vbWluICovIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudiAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgICAvKiBub21pbiAqLyAvXFxic2VtdmVyXFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSlcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAvKiBub21pbiAqLyB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgLyogbm9taW4gKi8gYXJncy51bnNoaWZ0KCdTRU1WRVInKTtcbiAgICAvKiBub21pbiAqLyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAvKiBub21pbiAqLyB9O1xuLyogbm9taW4gKi8gZWxzZVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmV4cG9ydHMuU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCc7XG5cbi8vIFRoZSBhY3R1YWwgcmVnZXhwcyBnbyBvbiBleHBvcnRzLnJlXG52YXIgcmUgPSBleHBvcnRzLnJlID0gW107XG52YXIgc3JjID0gZXhwb3J0cy5zcmMgPSBbXTtcbnZhciBSID0gMDtcblxuLy8gVGhlIGZvbGxvd2luZyBSZWd1bGFyIEV4cHJlc3Npb25zIGNhbiBiZSB1c2VkIGZvciB0b2tlbml6aW5nLFxuLy8gdmFsaWRhdGluZywgYW5kIHBhcnNpbmcgU2VtVmVyIHZlcnNpb24gc3RyaW5ncy5cblxuLy8gIyMgTnVtZXJpYyBJZGVudGlmaWVyXG4vLyBBIHNpbmdsZSBgMGAsIG9yIGEgbm9uLXplcm8gZGlnaXQgZm9sbG93ZWQgYnkgemVybyBvciBtb3JlIGRpZ2l0cy5cblxudmFyIE5VTUVSSUNJREVOVElGSUVSID0gUisrO1xuc3JjW05VTUVSSUNJREVOVElGSUVSXSA9ICcwfFsxLTldXFxcXGQqJztcbnZhciBOVU1FUklDSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdID0gJ1swLTldKyc7XG5cblxuLy8gIyMgTm9uLW51bWVyaWMgSWRlbnRpZmllclxuLy8gWmVybyBvciBtb3JlIGRpZ2l0cywgZm9sbG93ZWQgYnkgYSBsZXR0ZXIgb3IgaHlwaGVuLCBhbmQgdGhlbiB6ZXJvIG9yXG4vLyBtb3JlIGxldHRlcnMsIGRpZ2l0cywgb3IgaHlwaGVucy5cblxudmFyIE5PTk5VTUVSSUNJREVOVElGSUVSID0gUisrO1xuc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSA9ICdcXFxcZCpbYS16QS1aLV1bYS16QS1aMC05LV0qJztcblxuXG4vLyAjIyBNYWluIFZlcnNpb25cbi8vIFRocmVlIGRvdC1zZXBhcmF0ZWQgbnVtZXJpYyBpZGVudGlmaWVycy5cblxudmFyIE1BSU5WRVJTSU9OID0gUisrO1xuc3JjW01BSU5WRVJTSU9OXSA9ICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG52YXIgTUFJTlZFUlNJT05MT09TRSA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTkxPT1NFXSA9ICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICcpJztcblxuLy8gIyMgUHJlLXJlbGVhc2UgVmVyc2lvbiBJZGVudGlmaWVyXG4vLyBBIG51bWVyaWMgaWRlbnRpZmllciwgb3IgYSBub24tbnVtZXJpYyBpZGVudGlmaWVyLlxuXG52YXIgUFJFUkVMRUFTRUlERU5USUZJRVIgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG52YXIgUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cblxuLy8gIyMgUHJlLXJlbGVhc2UgVmVyc2lvblxuLy8gSHlwaGVuLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBkb3Qtc2VwYXJhdGVkIHByZS1yZWxlYXNlIHZlcnNpb25cbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgUFJFUkVMRUFTRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFXSA9ICcoPzotKCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdICtcbiAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdICsgJykqKSknO1xuXG52YXIgUFJFUkVMRUFTRUxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VMT09TRV0gPSAnKD86LT8oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gKyAnKSopKSc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhIElkZW50aWZpZXJcbi8vIEFueSBjb21iaW5hdGlvbiBvZiBkaWdpdHMsIGxldHRlcnMsIG9yIGh5cGhlbnMuXG5cbnZhciBCVUlMRElERU5USUZJRVIgPSBSKys7XG5zcmNbQlVJTERJREVOVElGSUVSXSA9ICdbMC05QS1aYS16LV0rJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGFcbi8vIFBsdXMgc2lnbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgcGVyaW9kLXNlcGFyYXRlZCBidWlsZCBtZXRhZGF0YVxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBCVUlMRCA9IFIrKztcbnNyY1tCVUlMRF0gPSAnKD86XFxcXCsoJyArIHNyY1tCVUlMRElERU5USUZJRVJdICtcbiAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW0JVSUxESURFTlRJRklFUl0gKyAnKSopKSc7XG5cblxuLy8gIyMgRnVsbCBWZXJzaW9uIFN0cmluZ1xuLy8gQSBtYWluIHZlcnNpb24sIGZvbGxvd2VkIG9wdGlvbmFsbHkgYnkgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uIGFuZFxuLy8gYnVpbGQgbWV0YWRhdGEuXG5cbi8vIE5vdGUgdGhhdCB0aGUgb25seSBtYWpvciwgbWlub3IsIHBhdGNoLCBhbmQgcHJlLXJlbGVhc2Ugc2VjdGlvbnMgb2Zcbi8vIHRoZSB2ZXJzaW9uIHN0cmluZyBhcmUgY2FwdHVyaW5nIGdyb3Vwcy4gIFRoZSBidWlsZCBtZXRhZGF0YSBpcyBub3QgYVxuLy8gY2FwdHVyaW5nIGdyb3VwLCBiZWNhdXNlIGl0IHNob3VsZCBub3QgZXZlciBiZSB1c2VkIGluIHZlcnNpb25cbi8vIGNvbXBhcmlzb24uXG5cbnZhciBGVUxMID0gUisrO1xudmFyIEZVTExQTEFJTiA9ICd2PycgKyBzcmNbTUFJTlZFUlNJT05dICtcbiAgICAgICAgICAgICAgICBzcmNbUFJFUkVMRUFTRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPyc7XG5cbnNyY1tGVUxMXSA9ICdeJyArIEZVTExQTEFJTiArICckJztcblxuLy8gbGlrZSBmdWxsLCBidXQgYWxsb3dzIHYxLjIuMyBhbmQgPTEuMi4zLCB3aGljaCBwZW9wbGUgZG8gc29tZXRpbWVzLlxuLy8gYWxzbywgMS4wLjBhbHBoYTEgKHByZXJlbGVhc2Ugd2l0aG91dCB0aGUgaHlwaGVuKSB3aGljaCBpcyBwcmV0dHlcbi8vIGNvbW1vbiBpbiB0aGUgbnBtIHJlZ2lzdHJ5LlxudmFyIExPT1NFUExBSU4gPSAnW3Y9XFxcXHNdKicgKyBzcmNbTUFJTlZFUlNJT05MT09TRV0gK1xuICAgICAgICAgICAgICAgICBzcmNbUFJFUkVMRUFTRUxPT1NFXSArICc/JyArXG4gICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPyc7XG5cbnZhciBMT09TRSA9IFIrKztcbnNyY1tMT09TRV0gPSAnXicgKyBMT09TRVBMQUlOICsgJyQnO1xuXG52YXIgR1RMVCA9IFIrKztcbnNyY1tHVExUXSA9ICcoKD86PHw+KT89PyknO1xuXG4vLyBTb21ldGhpbmcgbGlrZSBcIjIuKlwiIG9yIFwiMS4yLnhcIi5cbi8vIE5vdGUgdGhhdCBcIngueFwiIGlzIGEgdmFsaWQgeFJhbmdlIGlkZW50aWZlciwgbWVhbmluZyBcImFueSB2ZXJzaW9uXCJcbi8vIE9ubHkgdGhlIGZpcnN0IGl0ZW0gaXMgc3RyaWN0bHkgcmVxdWlyZWQuXG52YXIgWFJBTkdFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnfHh8WHxcXFxcKic7XG52YXIgWFJBTkdFSURFTlRJRklFUiA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnfHh8WHxcXFxcKic7XG5cbnZhciBYUkFOR0VQTEFJTiA9IFIrKztcbnNyY1tYUkFOR0VQTEFJTl0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JyArXG4gICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFUExBSU5MT09TRSA9IFIrKztcbnNyY1tYUkFOR0VQTEFJTkxPT1NFXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRUxPT1NFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0UgPSBSKys7XG5zcmNbWFJBTkdFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBYUkFOR0VMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gVGlsZGUgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcInJlYXNvbmFibHkgYXQgb3IgZ3JlYXRlciB0aGFuXCJcbnZhciBMT05FVElMREUgPSBSKys7XG5zcmNbTE9ORVRJTERFXSA9ICcoPzp+Pj8pJztcblxudmFyIFRJTERFVFJJTSA9IFIrKztcbnNyY1tUSUxERVRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FVElMREVdICsgJ1xcXFxzKyc7XG5yZVtUSUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbVElMREVUUklNXSwgJ2cnKTtcbnZhciB0aWxkZVRyaW1SZXBsYWNlID0gJyQxfic7XG5cbnZhciBUSUxERSA9IFIrKztcbnNyY1tUSUxERV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgVElMREVMT09TRSA9IFIrKztcbnNyY1tUSUxERUxPT1NFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDYXJldCByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwiYXQgbGVhc3QgYW5kIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGhcIlxudmFyIExPTkVDQVJFVCA9IFIrKztcbnNyY1tMT05FQ0FSRVRdID0gJyg/OlxcXFxeKSc7XG5cbnZhciBDQVJFVFRSSU0gPSBSKys7XG5zcmNbQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORUNBUkVUXSArICdcXFxccysnO1xucmVbQ0FSRVRUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NBUkVUVFJJTV0sICdnJyk7XG52YXIgY2FyZXRUcmltUmVwbGFjZSA9ICckMV4nO1xuXG52YXIgQ0FSRVQgPSBSKys7XG5zcmNbQ0FSRVRdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIENBUkVUTE9PU0UgPSBSKys7XG5zcmNbQ0FSRVRMT09TRV0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQSBzaW1wbGUgZ3QvbHQvZXEgdGhpbmcsIG9yIGp1c3QgXCJcIiB0byBpbmRpY2F0ZSBcImFueSB2ZXJzaW9uXCJcbnZhciBDT01QQVJBVE9STE9PU0UgPSBSKys7XG5zcmNbQ09NUEFSQVRPUkxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnKSR8XiQnO1xudmFyIENPTVBBUkFUT1IgPSBSKys7XG5zcmNbQ09NUEFSQVRPUl0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBGVUxMUExBSU4gKyAnKSR8XiQnO1xuXG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG52YXIgQ09NUEFSQVRPUlRSSU0gPSBSKys7XG5zcmNbQ09NUEFSQVRPUlRSSU1dID0gJyhcXFxccyopJyArIHNyY1tHVExUXSArXG4gICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICd8JyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKSc7XG5cbi8vIHRoaXMgb25lIGhhcyB0byB1c2UgdGhlIC9nIGZsYWdcbnJlW0NPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NPTVBBUkFUT1JUUklNXSwgJ2cnKTtcbnZhciBjb21wYXJhdG9yVHJpbVJlcGxhY2UgPSAnJDEkMiQzJztcblxuXG4vLyBTb21ldGhpbmcgbGlrZSBgMS4yLjMgLSAxLjIuNGBcbi8vIE5vdGUgdGhhdCB0aGVzZSBhbGwgdXNlIHRoZSBsb29zZSBmb3JtLCBiZWNhdXNlIHRoZXknbGwgYmVcbi8vIGNoZWNrZWQgYWdhaW5zdCBlaXRoZXIgdGhlIHN0cmljdCBvciBsb29zZSBjb21wYXJhdG9yIGZvcm1cbi8vIGxhdGVyLlxudmFyIEhZUEhFTlJBTkdFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxudmFyIEhZUEhFTlJBTkdFTE9PU0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VMT09TRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG4vLyBTdGFyIHJhbmdlcyBiYXNpY2FsbHkganVzdCBhbGxvdyBhbnl0aGluZyBhdCBhbGwuXG52YXIgU1RBUiA9IFIrKztcbnNyY1tTVEFSXSA9ICcoPHw+KT89P1xcXFxzKlxcXFwqJztcblxuLy8gQ29tcGlsZSB0byBhY3R1YWwgcmVnZXhwIG9iamVjdHMuXG4vLyBBbGwgYXJlIGZsYWctZnJlZSwgdW5sZXNzIHRoZXkgd2VyZSBjcmVhdGVkIGFib3ZlIHdpdGggYSBmbGFnLlxuZm9yICh2YXIgaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgZGVidWcoaSwgc3JjW2ldKTtcbiAgaWYgKCFyZVtpXSlcbiAgICByZVtpXSA9IG5ldyBSZWdFeHAoc3JjW2ldKTtcbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgbG9vc2UpIHtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdO1xuICByZXR1cm4gKHIudGVzdCh2ZXJzaW9uKSkgPyBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKSA6IG51bGw7XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZDtcbmZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgbG9vc2UpO1xuICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGw7XG59XG5cblxuZXhwb3J0cy5jbGVhbiA9IGNsZWFuO1xuZnVuY3Rpb24gY2xlYW4odmVyc2lvbiwgbG9vc2UpIHtcbiAgdmFyIHMgPSBwYXJzZSh2ZXJzaW9uLnRyaW0oKS5yZXBsYWNlKC9eWz12XSsvLCAnJyksIGxvb3NlKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsO1xufVxuXG5leHBvcnRzLlNlbVZlciA9IFNlbVZlcjtcblxuZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIGxvb3NlKSB7XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgaWYgKHZlcnNpb24ubG9vc2UgPT09IGxvb3NlKVxuICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgZWxzZVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKTtcblxuICBkZWJ1ZygnU2VtVmVyJywgdmVyc2lvbiwgbG9vc2UpO1xuICB0aGlzLmxvb3NlID0gbG9vc2U7XG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gobG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXSk7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuXG4gIHRoaXMucmF3ID0gdmVyc2lvbjtcblxuICAvLyB0aGVzZSBhcmUgYWN0dWFsbHkgbnVtYmVyc1xuICB0aGlzLm1ham9yID0gK21bMV07XG4gIHRoaXMubWlub3IgPSArbVsyXTtcbiAgdGhpcy5wYXRjaCA9ICttWzNdO1xuXG4gIC8vIG51bWJlcmlmeSBhbnkgcHJlcmVsZWFzZSBudW1lcmljIGlkc1xuICBpZiAoIW1bNF0pXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gIGVsc2VcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBtWzRdLnNwbGl0KCcuJykubWFwKGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gKC9eWzAtOV0rJC8udGVzdChpZCkpID8gK2lkIDogaWQ7XG4gICAgfSk7XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXTtcbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoO1xuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKTtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJzxTZW1WZXIgXCInICsgdGhpcyArICdcIj4nO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgZGVidWcoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLmxvb3NlLCBvdGhlcik7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMubG9vc2UpO1xuXG4gIHJldHVybiB0aGlzLmNvbXBhcmVNYWluKG90aGVyKSB8fCB0aGlzLmNvbXBhcmVQcmUob3RoZXIpO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlTWFpbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMubG9vc2UpO1xuXG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnModGhpcy5tYWpvciwgb3RoZXIubWFqb3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5taW5vciwgb3RoZXIubWlub3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5sb29zZSk7XG5cbiAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAxO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDA7XG5cbiAgdmFyIGkgPSAwO1xuICBkbyB7XG4gICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaV07XG4gICAgdmFyIGIgPSBvdGhlci5wcmVyZWxlYXNlW2ldO1xuICAgIGRlYnVnKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAwO1xuICAgIGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAtMTtcbiAgICBlbHNlIGlmIChhID09PSBiKVxuICAgICAgY29udGludWU7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgfSB3aGlsZSAoKytpKTtcbn07XG5cbi8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbi8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cblNlbVZlci5wcm90b3R5cGUuaW5jID0gZnVuY3Rpb24ocmVsZWFzZSwgaWRlbnRpZmllcikge1xuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlICdwcmVtYWpvcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVtaW5vcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSwgaXQgd2lsbCBidW1wIHRvIHRoZSBuZXh0IHZlcnNpb25cbiAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIElmIHRoZSBpbnB1dCBpcyBhIG5vbi1wcmVyZWxlYXNlIHZlcnNpb24sIHRoaXMgYWN0cyB0aGUgc2FtZSBhc1xuICAgIC8vIHByZXBhdGNoLlxuICAgIGNhc2UgJ3ByZXJlbGVhc2UnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtYWpvcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAvLyAxLjAuMC01IGJ1bXBzIHRvIDEuMC4wXG4gICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtaW5vcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWlub3IuXG4gICAgICAvLyAxLjIuMC01IGJ1bXBzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMSBidW1wcyB0byAxLjMuMFxuICAgICAgaWYgKHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucGF0Y2grKztcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAvLyAxLjAuMCBcInByZVwiIHdvdWxkIGJlY29tZSAxLjAuMC0wIHdoaWNoIGlzIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgY2FzZSAncHJlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF07XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrO1xuICAgICAgICAgICAgaSA9IC0yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gLTEpIC8vIGRpZG4ndCBpbmNyZW1lbnQgYW55dGhpbmdcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgIC8vIDEuMi4wLWJldGEuMSBidW1wcyB0byAxLjIuMC1iZXRhLjIsXG4gICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wcmVyZWxlYXNlWzFdKSlcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluY3JlbWVudCBhcmd1bWVudDogJyArIHJlbGVhc2UpO1xuICB9XG4gIHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5pbmMgPSBpbmM7XG5mdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgaWYgKHR5cGVvZihsb29zZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgIGxvb3NlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb247XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0cy5jb21wYXJlSWRlbnRpZmllcnMgPSBjb21wYXJlSWRlbnRpZmllcnM7XG5cbnZhciBudW1lcmljID0gL15bMC05XSskLztcbmZ1bmN0aW9uIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHZhciBhbnVtID0gbnVtZXJpYy50ZXN0KGEpO1xuICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcblxuICBpZiAoYW51bSAmJiBibnVtKSB7XG4gICAgYSA9ICthO1xuICAgIGIgPSArYjtcbiAgfVxuXG4gIHJldHVybiAoYW51bSAmJiAhYm51bSkgPyAtMSA6XG4gICAgICAgICAoYm51bSAmJiAhYW51bSkgPyAxIDpcbiAgICAgICAgIGEgPCBiID8gLTEgOlxuICAgICAgICAgYSA+IGIgPyAxIDpcbiAgICAgICAgIDA7XG59XG5cbmV4cG9ydHMucmNvbXBhcmVJZGVudGlmaWVycyA9IHJjb21wYXJlSWRlbnRpZmllcnM7XG5mdW5jdGlvbiByY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbn1cblxuZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLmNvbXBhcmUoYik7XG59XG5cbmV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuZnVuY3Rpb24gY29tcGFyZUxvb3NlKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgdHJ1ZSk7XG59XG5cbmV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbmZ1bmN0aW9uIHJjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGIsIGEsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5zb3J0ID0gc29ydDtcbmZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLnJzb3J0ID0gcnNvcnQ7XG5mdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5yY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLmd0ID0gZ3Q7XG5mdW5jdGlvbiBndChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xufVxuXG5leHBvcnRzLmx0ID0gbHQ7XG5mdW5jdGlvbiBsdChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPCAwO1xufVxuXG5leHBvcnRzLmVxID0gZXE7XG5mdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPT09IDA7XG59XG5cbmV4cG9ydHMubmVxID0gbmVxO1xuZnVuY3Rpb24gbmVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbn1cblxuZXhwb3J0cy5ndGUgPSBndGU7XG5mdW5jdGlvbiBndGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID49IDA7XG59XG5cbmV4cG9ydHMubHRlID0gbHRlO1xuZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8PSAwO1xufVxuXG5leHBvcnRzLmNtcCA9IGNtcDtcbmZ1bmN0aW9uIGNtcChhLCBvcCwgYiwgbG9vc2UpIHtcbiAgdmFyIHJldDtcbiAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgJz09PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgPT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhICE9PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnJzogY2FzZSAnPSc6IGNhc2UgJz09JzogcmV0ID0gZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICchPSc6IHJldCA9IG5lcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz4nOiByZXQgPSBndChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz49JzogcmV0ID0gZ3RlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPCc6IHJldCA9IGx0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPD0nOiByZXQgPSBsdGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9wZXJhdG9yOiAnICsgb3ApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydHMuQ29tcGFyYXRvciA9IENvbXBhcmF0b3I7XG5mdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKSB7XG4gIGlmIChjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIGlmIChjb21wLmxvb3NlID09PSBsb29zZSlcbiAgICAgIHJldHVybiBjb21wO1xuICAgIGVsc2VcbiAgICAgIGNvbXAgPSBjb21wLnZhbHVlO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbXBhcmF0b3IpKVxuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCBsb29zZSk7XG5cbiAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBsb29zZSk7XG4gIHRoaXMubG9vc2UgPSBsb29zZTtcbiAgdGhpcy5wYXJzZShjb21wKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICB0aGlzLnZhbHVlID0gJyc7XG4gIGVsc2VcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG5cbiAgZGVidWcoJ2NvbXAnLCB0aGlzKTtcbn1cblxudmFyIEFOWSA9IHt9O1xuQ29tcGFyYXRvci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihjb21wKSB7XG4gIHZhciByID0gdGhpcy5sb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKTtcblxuICB0aGlzLm9wZXJhdG9yID0gbVsxXTtcbiAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9JylcbiAgICB0aGlzLm9wZXJhdG9yID0gJyc7XG5cbiAgLy8gaWYgaXQgbGl0ZXJhbGx5IGlzIGp1c3QgJz4nIG9yICcnIHRoZW4gYWxsb3cgYW55dGhpbmcuXG4gIGlmICghbVsyXSlcbiAgICB0aGlzLnNlbXZlciA9IEFOWTtcbiAgZWxzZVxuICAgIHRoaXMuc2VtdmVyID0gbmV3IFNlbVZlcihtWzJdLCB0aGlzLmxvb3NlKTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICc8U2VtVmVyIENvbXBhcmF0b3IgXCInICsgdGhpcyArICdcIj4nO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLmxvb3NlKTtcbn07XG5cblxuZXhwb3J0cy5SYW5nZSA9IFJhbmdlO1xuZnVuY3Rpb24gUmFuZ2UocmFuZ2UsIGxvb3NlKSB7XG4gIGlmICgocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkgJiYgcmFuZ2UubG9vc2UgPT09IGxvb3NlKVxuICAgIHJldHVybiByYW5nZTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZ2UpKVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcblxuICB0aGlzLmxvb3NlID0gbG9vc2U7XG5cbiAgLy8gRmlyc3QsIHNwbGl0IGJhc2VkIG9uIGJvb2xlYW4gb3IgfHxcbiAgdGhpcy5yYXcgPSByYW5nZTtcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSk7XG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgLy8gdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHdoYXRldmVyIHJlYXNvblxuICAgIHJldHVybiBjLmxlbmd0aDtcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKTtcbiAgfVxuXG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblJhbmdlLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnPFNlbVZlciBSYW5nZSBcIicgKyB0aGlzLnJhbmdlICsgJ1wiPic7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmFuZ2UgPSB0aGlzLnNldC5tYXAoZnVuY3Rpb24oY29tcHMpIHtcbiAgICByZXR1cm4gY29tcHMuam9pbignICcpLnRyaW0oKTtcbiAgfSkuam9pbignfHwnKS50cmltKCk7XG4gIHJldHVybiB0aGlzLnJhbmdlO1xufTtcblxuUmFuZ2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnJhbmdlO1xufTtcblxuUmFuZ2UucHJvdG90eXBlLnBhcnNlUmFuZ2UgPSBmdW5jdGlvbihyYW5nZSkge1xuICB2YXIgbG9vc2UgPSB0aGlzLmxvb3NlO1xuICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgZGVidWcoJ3JhbmdlJywgcmFuZ2UsIGxvb3NlKTtcbiAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gIHZhciBociA9IGxvb3NlID8gcmVbSFlQSEVOUkFOR0VMT09TRV0gOiByZVtIWVBIRU5SQU5HRV07XG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShociwgaHlwaGVuUmVwbGFjZSk7XG4gIGRlYnVnKCdoeXBoZW4gcmVwbGFjZScsIHJhbmdlKTtcbiAgLy8gYD4gMS4yLjMgPCAxLjIuNWAgPT4gYD4xLjIuMyA8MS4yLjVgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSk7XG4gIGRlYnVnKCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmVbQ09NUEFSQVRPUlRSSU1dKTtcblxuICAvLyBgfiAxLjIuM2AgPT4gYH4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW1RJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuXG4gIC8vIGBeIDEuMi4zYCA9PiBgXjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG5cbiAgLy8gbm9ybWFsaXplIHNwYWNlc1xuICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbignICcpO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gIC8vIHJlYWR5IHRvIGJlIHNwbGl0IGludG8gY29tcGFyYXRvcnMuXG5cbiAgdmFyIGNvbXBSZSA9IGxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgc2V0ID0gcmFuZ2Uuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJykuc3BsaXQoL1xccysvKTtcbiAgaWYgKHRoaXMubG9vc2UpIHtcbiAgICAvLyBpbiBsb29zZSBtb2RlLCB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCB2YWxpZCBjb21wYXJhdG9yc1xuICAgIHNldCA9IHNldC5maWx0ZXIoZnVuY3Rpb24oY29tcCkge1xuICAgICAgcmV0dXJuICEhY29tcC5tYXRjaChjb21wUmUpO1xuICAgIH0pO1xuICB9XG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCBsb29zZSk7XG4gIH0pO1xuXG4gIHJldHVybiBzZXQ7XG59O1xuXG4vLyBNb3N0bHkganVzdCBmb3IgdGVzdGluZyBhbmQgbGVnYWN5IEFQSSByZWFzb25zXG5leHBvcnRzLnRvQ29tcGFyYXRvcnMgPSB0b0NvbXBhcmF0b3JzO1xuZnVuY3Rpb24gdG9Db21wYXJhdG9ycyhyYW5nZSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpLnNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9KS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJyk7XG4gIH0pO1xufVxuXG4vLyBjb21wcmlzZWQgb2YgeHJhbmdlcywgdGlsZGVzLCBzdGFycywgYW5kIGd0bHQncyBhdCB0aGlzIHBvaW50LlxuLy8gYWxyZWFkeSByZXBsYWNlZCB0aGUgaHlwaGVuIHJhbmdlc1xuLy8gdHVybiBpbnRvIGEgc2V0IG9mIEpVU1QgY29tcGFyYXRvcnMuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ2NvbXAnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VDYXJldHMoY29tcCwgbG9vc2UpO1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VUaWxkZXMoY29tcCwgbG9vc2UpO1xuICBkZWJ1ZygndGlsZGVzJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlWFJhbmdlcyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCd4cmFuZ2UnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VTdGFycyhjb21wLCBsb29zZSk7XG4gIGRlYnVnKCdzdGFycycsIGNvbXApO1xuICByZXR1cm4gY29tcDtcbn1cblxuZnVuY3Rpb24gaXNYKGlkKSB7XG4gIHJldHVybiAhaWQgfHwgaWQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnIHx8IGlkID09PSAnKic7XG59XG5cbi8vIH4sIH4+IC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gfjIsIH4yLngsIH4yLngueCwgfj4yLCB+PjIueCB+PjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gfjIuMCwgfjIuMC54LCB+PjIuMCwgfj4yLjAueCAtLT4gPj0yLjAuMCA8Mi4xLjBcbi8vIH4xLjIsIH4xLjIueCwgfj4xLjIsIH4+MS4yLnggLS0+ID49MS4yLjAgPDEuMy4wXG4vLyB+MS4yLjMsIH4+MS4yLjMgLS0+ID49MS4yLjMgPDEuMy4wXG4vLyB+MS4yLjAsIH4+MS4yLjAgLS0+ID49MS4yLjAgPDEuMy4wXG5mdW5jdGlvbiByZXBsYWNlVGlsZGVzKGNvbXAsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlKGNvbXAsIGxvb3NlKSB7XG4gIHZhciByID0gbG9vc2UgPyByZVtUSUxERUxPT1NFXSA6IHJlW1RJTERFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCd0aWxkZScsIGNvbXAsIF8sIE0sIG0sIHAsIHByKTtcbiAgICB2YXIgcmV0O1xuXG4gICAgaWYgKGlzWChNKSlcbiAgICAgIHJldCA9ICcnO1xuICAgIGVsc2UgaWYgKGlzWChtKSlcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICBlbHNlIGlmIChpc1gocCkpXG4gICAgICAvLyB+MS4yID09ID49MS4yLjAtIDwxLjMuMC1cbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlVGlsZGUgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfSBlbHNlXG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG5cbiAgICBkZWJ1ZygndGlsZGUgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMS4yLCBeMS4yLnggLS0+ID49MS4yLjAgPDIuMC4wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VDYXJldChjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0KGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXAsIGxvb3NlKTtcbiAgdmFyIHIgPSBsb29zZSA/IHJlW0NBUkVUTE9PU0VdIDogcmVbQ0FSRVRdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ2NhcmV0JywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgaWYgKE0gPT09ICcwJylcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ3JlcGxhY2VYUmFuZ2VzJywgY29tcCwgbG9vc2UpO1xuICByZXR1cm4gY29tcC5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VYUmFuZ2UoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2UoY29tcCwgbG9vc2UpIHtcbiAgY29tcCA9IGNvbXAudHJpbSgpO1xuICB2YXIgciA9IGxvb3NlID8gcmVbWFJBTkdFTE9PU0VdIDogcmVbWFJBTkdFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgIHZhciB4TSA9IGlzWChNKTtcbiAgICB2YXIgeG0gPSB4TSB8fCBpc1gobSk7XG4gICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgIHZhciBhbnlYID0geHA7XG5cbiAgICBpZiAoZ3RsdCA9PT0gJz0nICYmIGFueVgpXG4gICAgICBndGx0ID0gJyc7XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZm9yYmlkZGVuXG4gICAgICAgIHJldCA9ICcqJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGd0bHQgJiYgYW55WCkge1xuICAgICAgLy8gcmVwbGFjZSBYIHdpdGggMFxuICAgICAgaWYgKHhtKVxuICAgICAgICBtID0gMDtcbiAgICAgIGlmICh4cClcbiAgICAgICAgcCA9IDA7XG5cbiAgICAgIGlmIChndGx0ID09PSAnPicpIHtcbiAgICAgICAgLy8gPjEgPT4gPj0yLjAuMFxuICAgICAgICAvLyA+MS4yID0+ID49MS4zLjBcbiAgICAgICAgLy8gPjEuMi4zID0+ID49IDEuMi40XG4gICAgICAgIGd0bHQgPSAnPj0nO1xuICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnXG4gICAgICAgIGlmICh4bSlcbiAgICAgICAgICBNID0gK00gKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtID0gK20gKyAxXG4gICAgICB9XG5cbiAgICAgIHJldCA9IGd0bHQgKyBNICsgJy4nICsgbSArICcuJyArIHA7XG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ3hSYW5nZSByZXR1cm4nLCByZXQpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIEJlY2F1c2UgKiBpcyBBTkQtZWQgd2l0aCBldmVyeXRoaW5nIGVsc2UgaW4gdGhlIGNvbXBhcmF0b3IsXG4vLyBhbmQgJycgbWVhbnMgXCJhbnkgdmVyc2lvblwiLCBqdXN0IHJlbW92ZSB0aGUgKnMgZW50aXJlbHkuXG5mdW5jdGlvbiByZXBsYWNlU3RhcnMoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ3JlcGxhY2VTdGFycycsIGNvbXAsIGxvb3NlKTtcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlW1NUQVJdLCAnJyk7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcGFzc2VkIHRvIHN0cmluZy5yZXBsYWNlKHJlW0hZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMCBBbnkgMy40Lnggd2lsbCBkb1xuLy8gMS4yIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wXG5mdW5jdGlvbiBoeXBoZW5SZXBsYWNlKCQwLFxuICAgICAgICAgICAgICAgICAgICAgICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICAgICAgICAgICAgICAgICAgICAgICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuXG4gIGlmIChpc1goZk0pKVxuICAgIGZyb20gPSAnJztcbiAgZWxzZSBpZiAoaXNYKGZtKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1goZnApKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCc7XG4gIGVsc2VcbiAgICBmcm9tID0gJz49JyArIGZyb207XG5cbiAgaWYgKGlzWCh0TSkpXG4gICAgdG8gPSAnJztcbiAgZWxzZSBpZiAoaXNYKHRtKSlcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKHRwKSlcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJztcbiAgZWxzZSBpZiAodHByKVxuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwcjtcbiAgZWxzZVxuICAgIHRvID0gJzw9JyArIHRvO1xuXG4gIHJldHVybiAoZnJvbSArICcgJyArIHRvKS50cmltKCk7XG59XG5cblxuLy8gaWYgQU5ZIG9mIHRoZSBzZXRzIG1hdGNoIEFMTCBvZiBpdHMgY29tcGFyYXRvcnMsIHRoZW4gcGFzc1xuUmFuZ2UucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLmxvb3NlKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RTZXQodGhpcy5zZXRbaV0sIHZlcnNpb24pKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gdGVzdFNldChzZXQsIHZlcnNpb24pIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXNldFtpXS50ZXN0KHZlcnNpb24pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgICAgZGVidWcoc2V0W2ldLnNlbXZlcik7XG4gICAgICBpZiAoc2V0W2ldLnNlbXZlciA9PT0gQU5ZKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhbGxvd2VkID0gc2V0W2ldLnNlbXZlcjtcbiAgICAgICAgaWYgKGFsbG93ZWQubWFqb3IgPT09IHZlcnNpb24ubWFqb3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQucGF0Y2ggPT09IHZlcnNpb24ucGF0Y2gpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiBoYXMgYSAtcHJlLCBidXQgaXQncyBub3Qgb25lIG9mIHRoZSBvbmVzIHdlIGxpa2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuZnVuY3Rpb24gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBsb29zZSkge1xuICB0cnkge1xuICAgIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByYW5nZS50ZXN0KHZlcnNpb24pO1xufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nO1xuZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiB2ZXJzaW9ucy5maWx0ZXIoZnVuY3Rpb24odmVyc2lvbikge1xuICAgIHJldHVybiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKTtcbiAgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIHJjb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSlbMF0gfHwgbnVsbDtcbn1cblxuZXhwb3J0cy52YWxpZFJhbmdlID0gdmFsaWRSYW5nZTtcbmZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIGxvb3NlKSB7XG4gIHRyeSB7XG4gICAgLy8gUmV0dXJuICcqJyBpbnN0ZWFkIG9mICcnIHNvIHRoYXQgdHJ1dGhpbmVzcyB3b3Jrcy5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgaWYgaXQncyBpbnZhbGlkIGFueXdheVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKS5yYW5nZSB8fCAnKic7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgbGVzcyB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlXG5leHBvcnRzLmx0ciA9IGx0cjtcbmZ1bmN0aW9uIGx0cih2ZXJzaW9uLCByYW5nZSwgbG9vc2UpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8JywgbG9vc2UpO1xufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBncmVhdGVyIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2UuXG5leHBvcnRzLmd0ciA9IGd0cjtcbmZ1bmN0aW9uIGd0cih2ZXJzaW9uLCByYW5nZSwgbG9vc2UpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc+JywgbG9vc2UpO1xufVxuXG5leHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuZnVuY3Rpb24gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgaGlsbywgbG9vc2UpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpO1xuICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgbG9vc2UpO1xuXG4gIHZhciBndGZuLCBsdGVmbiwgbHRmbiwgY29tcCwgZWNvbXA7XG4gIHN3aXRjaCAoaGlsbykge1xuICAgIGNhc2UgJz4nOlxuICAgICAgZ3RmbiA9IGd0O1xuICAgICAgbHRlZm4gPSBsdGU7XG4gICAgICBsdGZuID0gbHQ7XG4gICAgICBjb21wID0gJz4nO1xuICAgICAgZWNvbXAgPSAnPj0nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnPCc6XG4gICAgICBndGZuID0gbHQ7XG4gICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgIGx0Zm4gPSBndDtcbiAgICAgIGNvbXAgPSAnPCc7XG4gICAgICBlY29tcCA9ICc8PSc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwcm92aWRlIGEgaGlsbyB2YWwgb2YgXCI8XCIgb3IgXCI+XCInKTtcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgbG9vc2UpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRnJvbSBub3cgb24sIHZhcmlhYmxlIHRlcm1zIGFyZSBhcyBpZiB3ZSdyZSBpbiBcImd0clwiIG1vZGUuXG4gIC8vIGJ1dCBub3RlIHRoYXQgZXZlcnl0aGluZyBpcyBmbGlwcGVkIGZvciB0aGUgXCJsdHJcIiBmdW5jdGlvbi5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjb21wYXJhdG9ycyA9IHJhbmdlLnNldFtpXTtcblxuICAgIHZhciBoaWdoID0gbnVsbDtcbiAgICB2YXIgbG93ID0gbnVsbDtcblxuICAgIGNvbXBhcmF0b3JzLmZvckVhY2goZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgIGxvdyA9IGxvdyB8fCBjb21wYXJhdG9yO1xuICAgICAgaWYgKGd0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGhpZ2guc2VtdmVyLCBsb29zZSkpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIGxvb3NlKSkge1xuICAgICAgICBsb3cgPSBjb21wYXJhdG9yO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIGVkZ2UgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhIG9wZXJhdG9yIHRoZW4gb3VyIHZlcnNpb25cbiAgICAvLyBpc24ndCBvdXRzaWRlIGl0XG4gICAgaWYgKGhpZ2gub3BlcmF0b3IgPT09IGNvbXAgfHwgaGlnaC5vcGVyYXRvciA9PT0gZWNvbXApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbG93ZXN0IHZlcnNpb24gY29tcGFyYXRvciBoYXMgYW4gb3BlcmF0b3IgYW5kIG91ciB2ZXJzaW9uXG4gICAgLy8gaXMgbGVzcyB0aGFuIGl0IHRoZW4gaXQgaXNuJ3QgaGlnaGVyIHRoYW4gdGhlIHJhbmdlXG4gICAgaWYgKCghbG93Lm9wZXJhdG9yIHx8IGxvdy5vcGVyYXRvciA9PT0gY29tcCkgJiZcbiAgICAgICAgbHRlZm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gVXNlIHRoZSBkZWZpbmUoKSBmdW5jdGlvbiBpZiB3ZSdyZSBpbiBBTUQgbGFuZFxuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcbiAgZGVmaW5lKGV4cG9ydHMpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSkiXX0=
