(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/radek/dev/burnchart.io/src/app.coffee":[function(require,module,exports){
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
      'scope': 'public_repo'
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
var Model, config, date, lscache, mediator, sortedIndexCmp, stats, user, _, _ref;

_ref = require('../modules/vendor.coffee'), _ = _ref._, lscache = _ref.lscache, sortedIndexCmp = _ref.sortedIndexCmp;

config = require('../models/config.coffee');

mediator = require('../modules/mediator.coffee');

stats = require('../modules/stats.coffee');

Model = require('../utils/model.coffee');

date = require('../utils/date.coffee');

user = require('./user.coffee');

module.exports = new Model({
  'name': 'models/projects',
  'data': {
    'sortBy': 'progress'
  },
  comparator: function() {
    var deIdx, list, sortBy, _ref1;
    _ref1 = this.data, list = _ref1.list, sortBy = _ref1.sortBy;
    deIdx = (function(_this) {
      return function(fn) {
        return function(_arg, b) {
          var i, j;
          i = _arg[0], j = _arg[1];
          return fn(list[i].milestones[j], b);
        };
      };
    })(this);
    switch (sortBy) {
      case 'progress':
        return deIdx(function(a, b) {
          var $;
          $ = {
            'progress': {
              'points': 0
            }
          };
          if (a.stats == null) {
            a.stats = $;
          }
          if (b.progress == null) {
            b.progress = $;
          }
          return a.stats.progress.points - b.stats.progress.points;
        });
      case 'priority':
        return deIdx(function(a, b) {
          throw 'Not implemented';
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
    return this.sort([i, j], milestone);
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
  sort: function(ref, m) {
    var i, idx, index, j, p, _i, _j, _len, _len1, _ref1, _ref2;
    index = this.data.index || [];
    if (m) {
      idx = sortedIndexCmp(index, m, this.comparator());
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
          idx = sortedIndexCmp(index, m, this.comparator());
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
      if (this.data.index != null) {
        while (this.data.index.length) {
          this.pop('index');
        }
      }
      return this.sort();
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
  days = (moment(a).diff(moment(b), 'days')) / 100;
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
  'sortedIndexCmp': window.sortedIndex
};



},{}],"/home/radek/dev/burnchart.io/src/templates/app.html":[function(require,module,exports){
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
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"href":"#","class":"sort"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by priority"]}," ",{"t":7,"e":"h2","f":["Milestones"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{p:_1[_0]}"},"f":[{"t":4,"n":50,"x":{"r":["p.owner","project.owner","p.name","project.name"],"s":"_0==_1&&_2==_3"},"f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"project.owner"},"/",{"t":2,"r":"project.name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],"/home/radek/dev/burnchart.io/src/templates/tables/projects.html":[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"href":"#","class":"sort"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by priority"]}," ",{"t":7,"e":"h2","f":["Projects"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{project:_1[_0]}"},"f":[{"t":4,"n":53,"r":"project","f":[{"t":4,"n":50,"r":"errors","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"colspan":"3","class":"repo"},"f":[{"t":7,"e":"div","a":{"class":"project"},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}," ",{"t":7,"e":"span","a":{"class":"error","title":[{"t":2,"x":{"r":["errors"],"s":"_0.join(\"\\n\")"}}]},"f":[{"t":7,"e":"Icons","a":{"icon":"attention"}}]}]}]}]}]},{"t":4,"n":51,"f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"class":"repo"},"f":[{"t":7,"e":"a","a":{"class":"project","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"milestone.title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}],"r":"errors"}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
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
var Icons, Ractive, format, mediator, projects;

Ractive = require('../../modules/vendor.coffee').Ractive;

mediator = require('../../modules/mediator.coffee');

projects = require('../../models/projects.coffee');

format = require('../../utils/format.coffee');

Icons = require('../icons.coffee');

module.exports = Ractive.extend({
  'name': 'views/milestones',
  'template': require('../../templates/tables/milestones.html'),
  'data': {
    format: format
  },
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive]
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/tables/milestones.html":"/home/radek/dev/burnchart.io/src/templates/tables/milestones.html","../../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee","../icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}],"/home/radek/dev/burnchart.io/src/views/tables/projects.coffee":[function(require,module,exports){
var Icons, Ractive, format, mediator, projects;

Ractive = require('../../modules/vendor.coffee').Ractive;

mediator = require('../../modules/mediator.coffee');

format = require('../../utils/format.coffee');

Icons = require('../icons.coffee');

projects = require('../../models/projects.coffee');

module.exports = Ractive.extend({
  'name': 'views/projects',
  'template': require('../../templates/tables/projects.html'),
  'data': {
    format: format
  },
  'components': {
    Icons: Icons
  },
  'adapt': [Ractive.adaptors.Ractive]
});



},{"../../models/projects.coffee":"/home/radek/dev/burnchart.io/src/models/projects.coffee","../../modules/mediator.coffee":"/home/radek/dev/burnchart.io/src/modules/mediator.coffee","../../modules/vendor.coffee":"/home/radek/dev/burnchart.io/src/modules/vendor.coffee","../../templates/tables/projects.html":"/home/radek/dev/burnchart.io/src/templates/tables/projects.html","../../utils/format.coffee":"/home/radek/dev/burnchart.io/src/utils/format.coffee","../icons.coffee":"/home/radek/dev/burnchart.io/src/views/icons.coffee"}]},{},["/home/radek/dev/burnchart.io/src/app.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9hcHAuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2NvbmZpZy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvZmlyZWJhc2UuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9zeXN0ZW0uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3VzZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvcmVxdWVzdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvcm91dGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvc3RhdHMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy92ZW5kb3IuY29mZmVlIiwic3JjL3RlbXBsYXRlcy9hcHAuaHRtbCIsInNyYy90ZW1wbGF0ZXMvY2hhcnQuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlcm8uaHRtbCIsInNyYy90ZW1wbGF0ZXMvaWNvbnMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2RhdGUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvZm9ybWF0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2tleS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9taXhpbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbW9kZWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvY2hhcnQuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaGVhZGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlcm8uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaWNvbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3Mvbm90aWZ5LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL2luZGV4LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL21pbGVzdG9uZS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9uZXcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvcHJvamVjdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvbWlsZXN0b25lcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvcHJvamVjdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxvQ0FBQTs7QUFBQSxVQUFjLE9BQUEsQ0FBUSx5QkFBUixFQUFaLE9BQUYsQ0FBQTs7QUFBQSxPQUVBLENBQVEsdUJBQVIsQ0FGQSxDQUFBOztBQUFBLE9BSUEsQ0FBUSwwQkFBUixDQUpBLENBQUE7O0FBQUEsTUFNQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQU5ULENBQUE7O0FBQUEsTUFPQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQVBULENBQUE7O0FBQUEsTUFRQSxHQUFTLE9BQUEsQ0FBUSx5QkFBUixDQVJULENBQUE7O0FBQUEsR0FVQSxHQUFVLElBQUEsT0FBQSxDQUVSO0FBQUEsRUFBQSxVQUFBLEVBQVksT0FBQSxDQUFRLHNCQUFSLENBQVo7QUFBQSxFQUVBLElBQUEsRUFBTSxNQUZOO0FBQUEsRUFJQSxZQUFBLEVBQWM7QUFBQSxJQUFFLFFBQUEsTUFBRjtBQUFBLElBQVUsUUFBQSxNQUFWO0dBSmQ7QUFBQSxFQU1B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LElBQUEsMENBQUE7O0FBQUEsVUFBYyxPQUFBLENBQVEsNkJBQVIsRUFBWixPQUFGLENBQUE7O0FBQUEsUUFFQSxHQUFXLE9BQUEsQ0FBUSwrQkFBUixDQUZYLENBQUE7O0FBQUEsTUFHQSxHQUFXLE9BQUEsQ0FBUSwyQkFBUixDQUhYLENBQUE7O0FBQUEsS0FJQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUpYLENBQUE7O0FBQUEsUUFLQSxHQUFXLE9BQUEsQ0FBUSw4QkFBUixDQUxYLENBQUE7O0FBQUEsTUFPTSxDQUFDLE9BQVAsR0FBaUIsT0FBTyxDQUFDLE1BQVIsQ0FFZjtBQUFBLEVBQUEsTUFBQSxFQUFRLGdCQUFSO0FBQUEsRUFFQSxVQUFBLEVBQVksT0FBQSxDQUFRLHNDQUFSLENBRlo7QUFBQSxFQUlBLE1BQUEsRUFBUTtBQUFBLElBQUUsUUFBQSxNQUFGO0dBSlI7QUFBQSxFQU1BLFlBQUEsRUFBYztBQUFBLElBQUUsT0FBQSxLQUFGO0dBTmQ7QUFBQSxFQVFBLE9BQUEsRUFBUyxDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FSVDtDQUZlLENBUGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcbiMgTG9kYXNoIG1peGlucy5cbnJlcXVpcmUgJy4vdXRpbHMvbWl4aW5zLmNvZmZlZSdcbiMgV2lsbCBsb2FkIHByb2plY3RzIGZyb20gbG9jYWxTdG9yYWdlLlxucmVxdWlyZSAnLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5IZWFkZXIgPSByZXF1aXJlICcuL3ZpZXdzL2hlYWRlci5jb2ZmZWUnXG5Ob3RpZnkgPSByZXF1aXJlICcuL3ZpZXdzL25vdGlmeS5jb2ZmZWUnXG5yb3V0ZXIgPSByZXF1aXJlICcuL21vZHVsZXMvcm91dGVyLmNvZmZlZSdcblxuYXBwID0gbmV3IFJhY3RpdmVcbiAgXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2FwcC5odG1sJ1xuXG4gICdlbCc6ICdib2R5J1xuXG4gICdjb21wb25lbnRzJzogeyBIZWFkZXIsIE5vdGlmeSB9XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTdGFydCB0aGUgcm91dGVyLlxuICAgIHJvdXRlci5pbml0ICcvJyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHVibGljX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSwgc29ydGVkSW5kZXhDbXAgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnICAgPSByZXF1aXJlICcuLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zdGF0cyAgICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvc3RhdHMuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5kYXRlICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL2RhdGUuY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9wcm9qZWN0cydcblxuICAnZGF0YSc6XG4gICAgJ3NvcnRCeSc6ICdwcm9ncmVzcydcblxuICAjIFJldHVybiBhIHNvcnQgb3JkZXIgY29tcGFyYXRvci5cbiAgY29tcGFyYXRvcjogLT5cbiAgICB7IGxpc3QsIHNvcnRCeSB9ID0gQGRhdGFcblxuICAgICMgQ29udmVydCBleGlzdGluZyBpbmRleCBpbnRvIGFjdHVhbCBwcm9qZWN0IG1pbGVzdG9uZS5cbiAgICBkZUlkeCA9IChmbikgPT5cbiAgICAgIChbIGksIGogXSwgYikgPT5cbiAgICAgICAgZm4gbGlzdFtpXS5taWxlc3RvbmVzW2pdLCBiXG5cbiAgICBzd2l0Y2ggc29ydEJ5XG4gICAgICAjIEZyb20gaGlnaGVzdCBwcm9ncmVzcyBwb2ludHMuXG4gICAgICB3aGVuICdwcm9ncmVzcycgdGhlbiBkZUlkeCAoYSwgYikgLT5cbiAgICAgICAgJCA9IHsgJ3Byb2dyZXNzJzogeyAncG9pbnRzJzogMCB9IH1cbiAgICAgICAgYS5zdGF0cyA/PSAkIDsgYi5wcm9ncmVzcyA/PSAkXG5cbiAgICAgICAgYS5zdGF0cy5wcm9ncmVzcy5wb2ludHMgLSBiLnN0YXRzLnByb2dyZXNzLnBvaW50c1xuXG4gICAgICAjIEZyb20gbW9zdCBkZWxheWVkIGluIGRheXMuXG4gICAgICB3aGVuICdwcmlvcml0eScgdGhlbiBkZUlkeCAoYSwgYikgLT5cbiAgICAgICAgdGhyb3cgJ05vdCBpbXBsZW1lbnRlZCdcblxuICAgICAgIyBUaGUgXCJ3aGF0ZXZlclwiIHNvcnQgb3JkZXIuLi5cbiAgICAgIGVsc2UgLT4gMFxuXG4gIGZpbmQ6IChwcm9qZWN0KSAtPlxuICAgIF8uZmluZCBAZGF0YS5saXN0LCBwcm9qZWN0XG5cbiAgZXhpc3RzOiAtPlxuICAgICEhQGZpbmQuYXBwbHkgQCwgYXJndW1lbnRzXG5cbiAgIyBQdXNoIHRvIHRoZSBzdGFjayB1bmxlc3MgaXQgZXhpc3RzIGFscmVhZHkuXG4gIGFkZDogKHByb2plY3QpIC0+XG4gICAgQHB1c2ggJ2xpc3QnLCBwcm9qZWN0IHVubGVzcyBAZXhpc3RzIHByb2plY3RcblxuICAjIEZpbmQgaW5kZXggb2YgYSBwcm9qZWN0LlxuICBmaW5kSW5kZXg6ICh7IG93bmVyLCBuYW1lIH0pIC0+XG4gICAgXy5maW5kSW5kZXggQGRhdGEubGlzdCwgeyBvd25lciwgbmFtZSB9XG5cbiAgIyBBZGQgYSBtaWxlc3RvbmUgZm9yIGEgcHJvamVjdC5cbiAgYWRkTWlsZXN0b25lOiAocHJvamVjdCwgbWlsZXN0b25lKSAtPlxuICAgICMgQWRkIGluIHRoZSBzdGF0cy5cbiAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ3N0YXRzJzogc3RhdHMobWlsZXN0b25lKSB9XG4gICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICB0aHJvdyA1MDAgaWYgKGkgPSBAZmluZEluZGV4KHByb2plY3QpKSA8IDAgXG5cbiAgICAjIEhhdmUgbWlsZXN0b25lcyBhbHJlYWR5P1xuICAgIGlmIHByb2plY3QubWlsZXN0b25lcz9cbiAgICAgIEBwdXNoIFwibGlzdC4je2l9Lm1pbGVzdG9uZXNcIiwgbWlsZXN0b25lXG4gICAgICBqID0gQGRhdGEubGlzdFtpXS5taWxlc3RvbmVzLmxlbmd0aCAtIDEgIyBpbmRleCBpbiBtaWxlc3RvbmVzXG4gICAgZWxzZVxuICAgICAgQHNldCBcImxpc3QuI3tpfS5taWxlc3RvbmVzXCIsIFsgbWlsZXN0b25lIF1cbiAgICAgIGogPSAwICAjIGluZGV4IGluIG1pbGVzdG9uZXNcblxuICAgICMgTm93IGluZGV4IHRoaXMgbWlsZXN0b25lLlxuICAgIEBzb3J0IFsgaSwgaiBdLCBtaWxlc3RvbmVcblxuICAjIFNhdmUgYW4gZXJyb3IgZnJvbSBsb2FkaW5nIG1pbGVzdG9uZXMgb3IgaXNzdWVzXG4gIHNhdmVFcnJvcjogKHByb2plY3QsIGVycikgLT5cbiAgICBpZiAoaWR4ID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPiAtMVxuICAgICAgaWYgcHJvamVjdC5lcnJvcnM/XG4gICAgICAgIEBwdXNoIFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIGVyclxuICAgICAgZWxzZVxuICAgICAgICBAc2V0IFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIFsgZXJyIF1cbiAgICBlbHNlXG4gICAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgICAgdGhyb3cgNTAwICBcblxuICBjbGVhcjogLT5cbiAgICBAc2V0ICdsaXN0JywgW11cblxuICAjIFNvcnQvb3IgaW5zZXJ0IGludG8gYW4gYWxyZWFkeSBzb3J0ZWQgaW5kZXguXG4gIHNvcnQ6IChyZWYsIG0pIC0+XG4gICAgIyBHZXQgb3IgaW5pdGlhbGl6ZSB0aGUgaW5kZXguXG4gICAgaW5kZXggPSBAZGF0YS5pbmRleCBvciBbXVxuXG4gICAgIyBEbyBvbmUuXG4gICAgaWYgbVxuICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIG0sIGRvIEBjb21wYXJhdG9yXG4gICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCByZWZcbiAgICAjIERvIGFsbC5cbiAgICBlbHNlXG4gICAgICBmb3IgcCwgaSBpbiBAZGF0YS5saXN0XG4gICAgICAgICMgVE9ETzogbmVlZCB0byBzaG93IHByb2plY3RzIHRoYXQgZmFpbGVkIHRvby4uLlxuICAgICAgICBjb250aW51ZSB1bmxlc3MgcC5taWxlc3RvbmVzP1xuICAgICAgICBmb3IgbSwgaiBpbiBwLm1pbGVzdG9uZXNcbiAgICAgICAgICAjIFJ1biBhIGNvbXBhcmF0b3IgaGVyZSBpbnNlcnRpbmcgaW50byBpbmRleC5cbiAgICAgICAgICBpZHggPSBzb3J0ZWRJbmRleENtcCBpbmRleCwgbSwgZG8gQGNvbXBhcmF0b3JcbiAgICAgICAgICAjIExvZy5cbiAgICAgICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCBbIGksIGogXVxuXG4gICAgIyBTYXZlIHRoZSBpbmRleC5cbiAgICBAc2V0ICdpbmRleCcsIGluZGV4XG5cbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgbWVkaWF0b3Iub24gJyFwcm9qZWN0cy9hZGQnLCAgICBfLmJpbmQgQGFkZCwgQFxuICAgIG1lZGlhdG9yLm9uICchcHJvamVjdHMvY2xlYXInLCAgXy5iaW5kIEBjbGVhciwgQFxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgSW5pdCB0aGUgcHJvamVjdHMuXG4gICAgQHNldCAnbGlzdCcsIGxzY2FjaGUuZ2V0KCdwcm9qZWN0cycpIG9yIFtdXG5cbiAgICAjIFBlcnNpc3QgcHJvamVjdHMgaW4gbG9jYWwgc3RvcmFnZSAoc2FucyBtaWxlc3RvbmVzKS5cbiAgICBAb2JzZXJ2ZSAnbGlzdCcsIChwcm9qZWN0cykgLT5cbiAgICAgIGxzY2FjaGUuc2V0ICdwcm9qZWN0cycsIF8ucGx1Y2tNYW55IHByb2plY3RzLCBbICdvd25lcicsICduYW1lJyBdXG4gICAgLCAnaW5pdCc6IG5vXG5cbiAgICAjIFJlc2V0IG91ciBpbmRleCBhbmQgcmUtc29ydC5cbiAgICBAb2JzZXJ2ZSAnc29ydEJ5JywgLT5cbiAgICAgICMgVXNlIHBvcCBhcyBSYWN0aXZlIGlzIGdsaXRjaHkgd2hlbiByZXNldHRpbmcgYXJyYXlzLlxuICAgICAgKCBAcG9wICdpbmRleCcgd2hpbGUgQGRhdGEuaW5kZXgubGVuZ3RoICkgaWYgQGRhdGEuaW5kZXg/XG4gICAgICAjwqBSdW4gdGhlIHNvcnQgYWdhaW4uXG4gICAgICBkbyBAc29ydCIsIm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcblxuIyBTeXN0ZW0gc3RhdGUuXG5zeXN0ZW0gPSBuZXcgTW9kZWxcbiAgXG4gICduYW1lJzogJ21vZGVscy9zeXN0ZW0nXG5cbiAgJ2RhdGEnOlxuICAgICdsb2FkaW5nJzogbm9cblxuY291bnRlciA9IDBcbmFzeW5jID0gLT5cbiAgY291bnRlciArPSAxXG4gIHN5c3RlbS5zZXQgJ2xvYWRpbmcnLCB5ZXNcbiAgLT5cbiAgICBjb3VudGVyIC09IDFcbiAgICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgK2NvdW50ZXJcblxubW9kdWxlLmV4cG9ydHMgPSB7IHN5c3RlbSwgYXN5bmMgfSIsIm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcblxuIyBDdXJyZW50bHkgbG9nZ2VkLWluIHVzZXIuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy91c2VyJ1xuXG4gICMgRGVmYXVsdCB0byBhIGxvY2FsIHVzZXIuXG4gICdkYXRhJzpcbiAgICAncHJvdmlkZXInOiAgXCJsb2NhbFwiXG4gICAgJ2lkJzogICAgICAgIFwiMFwiXG4gICAgJ3VpZCc6ICAgICAgIFwibG9jYWw6MFwiXG4gICAgJ3Rva2VuJzogICAgIG51bGwiLCJ7IGQzIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgaG9yaXpvbnRhbDogKGhlaWdodCwgeCkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHgpXG4gICAgICAub3JpZW50KFwiYm90dG9tXCIpXG4gICAgICAjIFNob3cgdmVydGljYWwgbGluZXMuLi5cbiAgICAgIC50aWNrU2l6ZSgtaGVpZ2h0KVxuICAgICAgIyAuLi53aXRoIGRheSBvZiB0aGUgbW9udGguLi5cbiAgICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gZC5nZXREYXRlKCkgKVxuICAgICAgIyAuLi5hbmQgZ2l2ZSB1cyBhIHNwYWNlci5cbiAgICAgIC50aWNrUGFkZGluZygxMClcblxuICB2ZXJ0aWNhbDogKHdpZHRoLCB5KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeSlcbiAgICAgIC5vcmllbnQoXCJsZWZ0XCIpXG4gICAgICAudGlja1NpemUoLXdpZHRoKVxuICAgICAgLnRpY2tzKDUpXG4gICAgICAudGlja1BhZGRpbmcoMTApIiwieyBfLCBkMyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5jb25maWcgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgQSBncmFwaCBvZiBjbG9zZWQgaXNzdWVzLlxuICAjIGBpc3N1ZXNgOiAgICAgaXNzdWVzIGxpc3RcbiAgIyBgY3JlYXRlZF9hdGA6IG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYHRvdGFsYDogICAgdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGFjdHVhbDogKGlzc3VlcywgY3JlYXRlZF9hdCwgdG90YWwpIC0+XG4gICAgaGVhZCA9IFsge1xuICAgICAgJ2RhdGUnOiBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgICAncG9pbnRzJzogdG90YWxcbiAgICB9IF1cbiAgICBcbiAgICBtaW4gPSArSW5maW5pdHkgOyBtYXggPSAtSW5maW5pdHlcblxuICAgICMgR2VuZXJhdGUgdGhlIGFjdHVhbCBjbG9zZXMuXG4gICAgcmVzdCA9IF8ubWFwIGlzc3VlcywgKGlzc3VlKSAtPlxuICAgICAgeyBzaXplLCBjbG9zZWRfYXQgfSA9IGlzc3VlXG4gICAgICAjIERldGVybWluZSB0aGUgcmFuZ2UuXG4gICAgICBtaW4gPSBzaXplIGlmIHNpemUgPCBtaW5cbiAgICAgIG1heCA9IHNpemUgaWYgc2l6ZSA+IG1heFxuXG4gICAgICAjIERyb3BwaW5nIHBvaW50cyByZW1haW5pbmcuXG4gICAgICBpc3N1ZS5kYXRlID0gbmV3IERhdGUgY2xvc2VkX2F0XG4gICAgICBpc3N1ZS5wb2ludHMgPSB0b3RhbCAtPSBzaXplXG4gICAgICBpc3N1ZVxuICAgIFxuICAgICMgTm93IGFkZCBhIHJhZGl1cyBpbiBhIHJhbmdlICh3aWxsIGJlIHVzZWQgZm9yIGEgY2lyY2xlKS5cbiAgICByYW5nZSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbIG1pbiwgbWF4IF0pLnJhbmdlKFsgNSwgOCBdKVxuXG4gICAgcmVzdCA9IF8ubWFwIHJlc3QsIChpc3N1ZSkgLT5cbiAgICAgIGlzc3VlLnJhZGl1cyA9IHJhbmdlIGlzc3VlLnNpemVcbiAgICAgIGlzc3VlXG5cbiAgICBbXS5jb25jYXQgaGVhZCwgcmVzdFxuXG4gICMgQSBncmFwaCBvZiBhbiBpZGVhbCBwcm9ncmVzc2lvbi4uXG4gICMgYGFgOiAgIG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYGJgOiAgIG1pbGVzdG9uZSBlbmQgZGF0ZVxuICAjIGB0b3RhbGA6IHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBpZGVhbDogKGEsIGIsIHRvdGFsKSAtPlxuICAgICMgU3dhcD9cbiAgICBbIGIsIGEgXSA9IFsgYSwgYiBdIGlmIGIgPCBhXG5cbiAgICAjIFdlIHN0YXJ0IGhlcmUgYWRkaW5nIGRheXMgdG8gYGRgLlxuICAgIFsgeSwgbSwgZCBdID0gXy5tYXAgYS5tYXRjaChjb25maWcuZGF0YS5jaGFydC5kYXRldGltZSlbMV0uc3BsaXQoJy0nKSwgKHYpIC0+IHBhcnNlSW50IHZcbiAgICAjIFdlIHdhbnQgdG8gZW5kIGhlcmUuXG4gICAgY3V0b2ZmID0gbmV3IERhdGUoYilcblxuICAgICMgR28gdGhyb3VnaCB0aGUgYmVnaW5uaW5nIHRvIHRoZSBlbmQgc2tpcHBpbmcgb2ZmIGRheXMuXG4gICAgZGF5cyA9IFtdIDsgbGVuZ3RoID0gMFxuICAgIGRvIG9uY2UgPSAoaW5jID0gMCkgLT5cbiAgICAgICMgQSBuZXcgZGF5LlxuICAgICAgZGF5ID0gbmV3IERhdGUgeSwgbSAtIDEsIGQgKyBpbmNcbiAgICAgIFxuICAgICAgIyBEb2VzIHRoaXMgZGF5IGNvdW50P1xuICAgICAgZGF5X29mID0gNyBpZiAhZGF5X29mID0gZGF5LmdldERheSgpXG4gICAgICBpZiBkYXlfb2YgaW4gY29uZmlnLmRhdGEuY2hhcnQub2ZmX2RheXNcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5LCBvZmZfZGF5OiB5ZXMgfVxuICAgICAgZWxzZVxuICAgICAgICBsZW5ndGggKz0gMVxuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXkgfVxuICAgICAgXG4gICAgICAjIEdvIGFnYWluP1xuICAgICAgb25jZShpbmMgKyAxKSB1bmxlc3MgZGF5ID4gY3V0b2ZmXG5cbiAgICAjIE1hcCBwb2ludHMgb24gdGhlIGFycmF5IG9mIGRheXMgbm93LlxuICAgIHZlbG9jaXR5ID0gdG90YWwgLyAobGVuZ3RoIC0gMSlcblxuICAgIGRheXMgPSBfLm1hcCBkYXlzLCAoZGF5LCBpKSAtPlxuICAgICAgZGF5LnBvaW50cyA9IHRvdGFsXG4gICAgICB0b3RhbCAtPSB2ZWxvY2l0eSBpZiBkYXlzW2ldIGFuZCBub3QgZGF5c1tpXS5vZmZfZGF5XG4gICAgICBkYXlcblxuICAgICMgRG8gd2UgbmVlZCB0byBtYWtlIGEgbGluayB0byByaWdodCBub3c/XG4gICAgZGF5cy5wdXNoIHsgZGF0ZTogbm93LCBwb2ludHM6IDAgfSBpZiAobm93ID0gbmV3IERhdGUoKSkgPiBjdXRvZmZcblxuICAgIGRheXNcblxuICAjIEdyYXBoIHJlcHJlc2VudGluZyBhIHRyZW5kbGluZyBvZiBhY3R1YWwgaXNzdWVzLlxuICB0cmVuZDogKGFjdHVhbCwgY3JlYXRlZF9hdCwgZHVlX29uKSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgYWN0dWFsLmxlbmd0aFxuXG4gICAgc3RhcnQgPSArYWN0dWFsWzBdLmRhdGVcblxuICAgICMgVmFsdWVzIGlzIGEgbGlzdCBvZiB0aW1lIGZyb20gdGhlIHN0YXJ0IGFuZCBwb2ludHMgcmVtYWluaW5nLlxuICAgIHZhbHVlcyA9IF8ubWFwIGFjdHVhbCwgKHsgZGF0ZSwgcG9pbnRzIH0pIC0+XG4gICAgICBbICtkYXRlIC0gc3RhcnQsIHBvaW50cyBdXG5cbiAgICAjIE5vdyBpcyBhbiBhY3R1YWwgcG9pbnQgdG9vLlxuICAgIGxhc3QgPSBhY3R1YWxbYWN0dWFsLmxlbmd0aCAtIDFdXG4gICAgdmFsdWVzLnB1c2ggWyArIG5ldyBEYXRlKCkgLSBzdGFydCwgbGFzdC5wb2ludHMgXVxuXG4gICAgIyBodHRwOi8vY2xhc3Nyb29tLnN5bm9ueW0uY29tL2NhbGN1bGF0ZS10cmVuZGxpbmUtMjcwOS5odG1sXG4gICAgYjEgPSAwIDsgZSA9IDAgOyBjMSA9IDBcbiAgICBhID0gKGwgPSB2YWx1ZXMubGVuZ3RoKSAqIF8ucmVkdWNlKHZhbHVlcywgKHN1bSwgWyBhLCBiIF0pIC0+XG4gICAgICBiMSArPSBhIDsgZSArPSBiXG4gICAgICBjMSArPSBNYXRoLnBvdyhhLCAyKVxuICAgICAgc3VtICsgKGEgKiBiKVxuICAgICwgMClcblxuICAgIHNsb3BlID0gKGEgLSAoYjEgKiBlKSkgLyAoKGwgKiBjMSkgLSAoTWF0aC5wb3coYjEsIDIpKSlcbiAgICBpbnRlcmNlcHQgPSAoZSAtIChzbG9wZSAqIGIxKSkgLyBsXG4gICAgZm4gPSAoeCkgLT4gc2xvcGUgKiB4ICsgaW50ZXJjZXB0XG5cbiAgICAjIE1pbGVzdG9uZSBhbHdheXMgaGFzIGEgY3JlYXRpb24gZGF0ZS5cbiAgICBjcmVhdGVkX2F0ID0gbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICMgRHVlIGRhdGUgY2FuIGJlIGVtcHR5LlxuICAgIGR1ZV9vbiA9IGlmIGR1ZV9vbiB0aGVuIG5ldyBEYXRlKGR1ZV9vbikgZWxzZSBuZXcgRGF0ZSgpXG5cbiAgICBhID0gY3JlYXRlZF9hdCAtIHN0YXJ0XG4gICAgYiA9IGR1ZV9vbiAtIHN0YXJ0XG5cbiAgICBbXG4gICAgICB7XG4gICAgICAgICdkYXRlJzogY3JlYXRlZF9hdFxuICAgICAgICAncG9pbnRzJzogZm4oYSlcbiAgICAgIH0sIHtcbiAgICAgICAgJ2RhdGUnOiBkdWVfb25cbiAgICAgICAgJ3BvaW50cyc6IGZuKGIpXG4gICAgICB9XG4gICAgXSIsInsgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbiMhL3Vzci9iaW4vZW52IGNvZmZlZVxuY29uZmlnICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGlzc3VlcyBmb3IgYSBtaWxlc3RvbmUuXG4gIGZldGNoQWxsOiAocmVwbywgY2IpIC0+XG4gICAgIyBDYWxjdWxhdGUgc2l6ZSBvZiBlaXRoZXIgb3BlbiBvciBjbG9zZWQgaXNzdWVzLlxuICAgICMgTW9kaWZpZXMgaXNzdWVzIGJ5IHJlZi5cbiAgICBjYWxjU2l6ZSA9IChsaXN0LCBjYikgLT5cbiAgICAgIHN3aXRjaCBjb25maWcuZGF0YS5jaGFydC5wb2ludHNcbiAgICAgICAgd2hlbiAnT05FX1NJWkUnXG4gICAgICAgICAgc2l6ZSA9IGxpc3QubGVuZ3RoXG5cbiAgICAgICAgICAoIGlzc3VlLnNpemUgPSAxIGZvciBpc3N1ZSBpbiBsaXN0IClcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG4gICAgICAgIFxuICAgICAgICB3aGVuICdMQUJFTFMnXG4gICAgICAgICAgc2l6ZSA9IDBcblxuICAgICAgICAgIGxpc3QgPSBfLmZpbHRlciBsaXN0LCAoaXNzdWUpIC0+XG4gICAgICAgICAgICAjIFNraXAgaWYgbm8gbGFiZWxzIGV4aXN0LlxuICAgICAgICAgICAgcmV0dXJuIG5vIHVubGVzcyBsYWJlbHMgPSBpc3N1ZS5sYWJlbHNcblxuICAgICAgICAgICAgIyBEZXRlcm1pbmUgdGhlIHRvdGFsIGlzc3VlIHNpemUgZnJvbSBhbGwgbGFiZWxzLlxuICAgICAgICAgICAgaXNzdWUuc2l6ZSA9IF8ucmVkdWNlIGxhYmVscywgKHN1bSwgbGFiZWwpIC0+XG4gICAgICAgICAgICAgICMgTm90IG1hdGNoaW5nLlxuICAgICAgICAgICAgICByZXR1cm4gc3VtIHVubGVzcyBtYXRjaGVzID0gbGFiZWwubmFtZS5tYXRjaCBjb25maWcuZGF0YS5jaGFydC5zaXplX2xhYmVsXG4gICAgICAgICAgICAgICMgSW5jcmVhc2Ugc3VtLlxuICAgICAgICAgICAgICBzdW0gKz0gcGFyc2VJbnQgbWF0Y2hlc1sxXVxuICAgICAgICAgICAgLCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgSW5jcmVhc2UgdGhlIHRvdGFsLlxuICAgICAgICAgICAgc2l6ZSArPSBpc3N1ZS5zaXplXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQXJlIHdlIHNhdmluZyBpdD9cbiAgICAgICAgICAgICEhaXNzdWUuc2l6ZVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cblxuICAgICMgRm9yIGVhY2ggc3RhdGUuLi5cbiAgICBvbmVTdGF0dXMgPSAoc3RhdGUsIGNiKSAtPlxuICAgICAgIyBDb25jYXQgdGhlbSBoZXJlLlxuICAgICAgcmVzdWx0cyA9IFtdXG5cbiAgICAgICMgT25lIHBhZ2VmdWwgZmV0Y2ggKG5leHQgcGFnZXMgaW4gc2VyaWVzKS5cbiAgICAgIGRvIGZldGNoUGFnZSA9IChwYWdlPTEpIC0+XG4gICAgICAgIHJlcXVlc3QuYWxsSXNzdWVzIHJlcG8sIHsgc3RhdGUsIHBhZ2UgfSwgKGVyciwgZGF0YSkgLT5cbiAgICAgICAgICAjIEVycm9ycz9cbiAgICAgICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICAgICAgICMgRW1wdHk/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgICAgICAgIyBDb25jYXQgc29ydGVkIChhcGkgZG9lcyBub3Qgc29ydCBvbiBjbG9zZWRfYXQhKS5cbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQgXy5zb3J0QnkgZGF0YSwgJ2Nsb3NlZF9hdCdcbiAgICAgICAgICAjIDwgMTAwIHJlc3VsdHM/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgaWYgZGF0YS5sZW5ndGggPCAxMDBcbiAgICAgICAgICAjIEZldGNoIHRoZSBuZXh0IHBhZ2UgdGhlbi5cbiAgICAgICAgICBmZXRjaFBhZ2UgcGFnZSArIDFcblxuICAgICMgRm9yIGVhY2ggYG9wZW5gIGFuZCBgY2xvc2VkYCBpc3N1ZXMgaW4gcGFyYWxsZWwuXG4gICAgYXN5bmMucGFyYWxsZWwgW1xuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnb3BlbicpLCAgIGNhbGNTaXplIF1cbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ2Nsb3NlZCcpLCBjYWxjU2l6ZSBdXG4gICAgXSwgKGVyciwgWyBvcGVuLCBjbG9zZWQgXSkgLT5cbiAgICAgIGNiIGVyciwgeyBvcGVuLCBjbG9zZWQgfSIsIiMhL3Vzci9iaW4vZW52IGNvZmZlZVxucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGEgbWlsZXN0b25lLlxuICAnZmV0Y2gnOiByZXF1ZXN0Lm9uZU1pbGVzdG9uZVxuXG4gICMgRmV0Y2ggYWxsIG1pbGVzdG9uZXMuXG4gICdmZXRjaEFsbCc6IHJlcXVlc3QuYWxsTWlsZXN0b25lc1xuXG4gICAgIyAjIEdldCB0aGUgY3VycmVudCBtaWxlc3RvbmUgb3V0IG9mIG1hbnkuXG4gICAgIyBlbHNlXG4gICAgIyAgIHJlcXVlc3QuYWxsTWlsZXN0b25lcyByZXBvLCAoZXJyLCBkYXRhKSAtPlxuICAgICMgICAgICMgRXJyb3JzP1xuICAgICMgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgIyAgICAgIyBFbXB0eSB3YXJuaW5nP1xuICAgICMgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIG9wZW4gbWlsZXN0b25lcyBmb3IgcmVwbyAje3JlcG8ucGF0aH1cIiB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LlxuICAgICMgICAgIG0gPSBkYXRhWzBdXG4gICAgIyAgICAgIyBGaWx0ZXIgbWlsZXN0b25lcyB3aXRob3V0IGR1ZSBkYXRlLlxuICAgICMgICAgIG0gPSBfLnJlc3QgZGF0YSwgeyAnZHVlX29uJyA6IG51bGwgfVxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuIFByZWZlciBtaWxlc3RvbmVzIHdpdGggZHVlIGRhdGVzLlxuICAgICMgICAgIG0gPSBpZiBtWzBdIHRoZW4gbVswXSBlbHNlIGRhdGFbMF1cbiAgICAjICAgICAjIEVtcHR5IG1pbGVzdG9uZT9cbiAgICAjICAgICBpZiBtLm9wZW5faXNzdWVzICsgbS5jbG9zZWRfaXNzdWVzIGlzIDBcbiAgICAjICAgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIGlzc3VlcyBmb3IgbWlsZXN0b25lIGAje20udGl0bGV9YFwiXG5cbiAgICAjICAgICBjYiBudWxsLCBudWxsLCBtIiwieyBfLCBTdXBlckFnZW50IH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG51c2VyID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuXG4jIEN1c3RvbSBKU09OIHBhcnNlci5cblN1cGVyQWdlbnQucGFyc2UgPVxuICAnYXBwbGljYXRpb24vanNvbic6IChyZXMpIC0+XG4gICAgdHJ5XG4gICAgICBKU09OLnBhcnNlIHJlc1xuICAgIGNhdGNoIGVcbiAgICAgIHt9ICMgaXQgd2FzIG5vdCB0byBiZS4uLlxuXG4jIERlZmF1bHQgYXJncy5cbmRlZmF1bHRzID1cbiAgJ2dpdGh1Yic6XG4gICAgJ2hvc3QnOiAnYXBpLmdpdGh1Yi5jb20nXG4gICAgJ3Byb3RvY29sJzogJ2h0dHBzJ1xuXG4jIFB1YmxpYyBhcGkuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFxuICAjIEdldCBhIHJlcG8uXG4gIHJlcG86ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9XCJcbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgb3BlbiBtaWxlc3RvbmVzLlxuICBhbGxNaWxlc3RvbmVzOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT4gXG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lc1wiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuICBcbiAgIyBHZXQgb25lIG9wZW4gbWlsZXN0b25lLlxuICBvbmVNaWxlc3RvbmU6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzLyN7bWlsZXN0b25lfVwiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBpc3N1ZXMgZm9yIGEgc3RhdGUuXG4gIGFsbElzc3VlczogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBxdWVyeSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9pc3N1ZXNcIlxuICAgICAgICAncXVlcnknOiAgXy5leHRlbmQgcXVlcnksIHsgbWlsZXN0b25lLCAncGVyX3BhZ2UnOiAnMTAwJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiMgTWFrZSBhIHJlcXVlc3QgdXNpbmcgU3VwZXJBZ2VudC5cbnJlcXVlc3QgPSAoeyBwcm90b2NvbCwgaG9zdCwgcGF0aCwgcXVlcnksIGhlYWRlcnMgfSwgY2IpIC0+XG4gIGV4aXRlZCA9IG5vXG5cbiAgIyBNYWtlIHRoZSBxdWVyeSBwYXJhbXMuXG4gIHEgPSBpZiBxdWVyeSB0aGVuICc/JyArICggXCIje2t9PSN7dn1cIiBmb3IgaywgdiBvZiBxdWVyeSApLmpvaW4oJyYnKSBlbHNlICcnXG5cbiAgIyBUaGUgVVJJLlxuICByZXEgPSBTdXBlckFnZW50LmdldChcIiN7cHJvdG9jb2x9Oi8vI3tob3N0fSN7cGF0aH0je3F9XCIpXG4gICMgQWRkIGhlYWRlcnMuXG4gICggcmVxLnNldChrLCB2KSBmb3IgaywgdiBvZiBoZWFkZXJzIClcbiAgXG4gICMgVGltZW91dCBmb3IgcmVxdWVzdHMgdGhhdCBkbyBub3QgZmluaXNoLi4uIHNlZSAjMzIuXG4gIHRpbWVvdXQgPSBzZXRUaW1lb3V0IC0+XG4gICAgZXhpdGVkID0geWVzXG4gICAgY2IgJ1JlcXVlc3QgaGFzIHRpbWVkIG91dCdcbiAgLCAxZTQgIyBnaXZlIHVzIDEwc1xuXG4gICMgU2VuZC5cbiAgcmVxLmVuZCAoZXJyLCBkYXRhKSAtPlxuICAgICMgQXJyaXZlZCB0b28gbGF0ZS5cbiAgICByZXR1cm4gaWYgZXhpdGVkXG4gICAgIyBBbGwgZmluZS5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjbGVhclRpbWVvdXQgdGltZW91dFxuICAgICMgQWN0dWFsbHkgcHJvY2VzcyB0aGUgcmVzcG9uc2UuXG4gICAgcmVzcG9uc2UgZXJyLCBkYXRhLCBjYlxuXG4jIEhvdyBkbyB3ZSByZXNwb25kIHRvIGEgcmVzcG9uc2U/XG5yZXNwb25zZSA9IChlcnIsIGRhdGEsIGNiKSAtPlxuICByZXR1cm4gY2IgZXJyb3IgZXJyIGlmIGVyclxuICAjIDJ4eD9cbiAgaWYgZGF0YS5zdGF0dXNUeXBlIGlzbnQgMlxuICAgICMgRG8gd2UgaGF2ZSBhIG1lc3NhZ2UgZnJvbSBHaXRIdWI/XG4gICAgcmV0dXJuIGNiIGRhdGEuYm9keS5tZXNzYWdlIGlmIGRhdGE/LmJvZHk/Lm1lc3NhZ2U/XG4gICAgIyBVc2UgU0Egb25lLlxuICAgIHJldHVybiBjYiBkYXRhLmVycm9yLm1lc3NhZ2VcbiAgIyBBbGwgZ29vZC5cbiAgY2IgbnVsbCwgZGF0YS5ib2R5XG5cbiMgR2l2ZSB1cyBoZWFkZXJzLlxuaGVhZGVycyA9ICh0b2tlbikgLT5cbiAgIyBUaGUgZGVmYXVsdHMuXG4gIGggPVxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMnXG4gICMgQWRkIHRva2VuP1xuICBoLkF1dGhvcml6YXRpb24gPSBcInRva2VuICN7dG9rZW59XCIgaWYgdG9rZW4/XG4gIGhcblxuaXNWYWxpZCA9IChvYmopIC0+XG4gIHJ1bGVzID1cbiAgICAnb3duZXInOiAgICAgKHZhbCkgLT4gdmFsP1xuICAgICduYW1lJzogICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ21pbGVzdG9uZSc6ICh2YWwpIC0+IF8uaXNJbnQgdmFsXG4gIFxuICAoIHJldHVybiBubyBmb3Iga2V5LCB2YWwgb2Ygb2JqIHdoZW4ga2V5IG9mIHJ1bGVzIGFuZCBub3QgcnVsZXNba2V5XSh2YWwpIClcblxuICB5ZXNcblxuIyBTd2l0Y2ggd2hlbiB1c2VyIGlzIHJlYWR5LlxuaXNSZWFkeSA9IHVzZXIuZGF0YS5yZWFkeVxuXG4jIEEgc3RhY2sgb2YgcmVxdWVzdHMgdG8gZXhlY3V0ZSBvbmNlIHJlYWR5Llxuc3RhY2sgPSBbXVxucmVhZHkgPSAoY2IpIC0+XG4gIGlmIGlzUmVhZHkgdGhlbiBkbyBjYiBlbHNlIHN0YWNrLnB1c2ggY2JcblxuIyBPYnNlcnZlIHVzZXIncyByZWFkaW5lc3MuXG51c2VyLm9ic2VydmUgJ3JlYWR5JywgKHZhbCkgLT5cbiAgaXNSZWFkeSA9IHZhbFxuICAjIENsZWFyIHRoZSBzdGFjaz9cbiAgKCBkbyBzdGFjay5zaGlmdCgpIHdoaWxlIHN0YWNrLmxlbmd0aCApIGlmIHZhbFxuXG4jIFBhcnNlIGFuIGVycm9yLlxuZXJyb3IgPSAoZXJyKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIF8uaXNTdHJpbmcgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyXG4gICAgd2hlbiBfLmlzQXJyYXkgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyWzFdXG4gICAgd2hlbiBfLmlzT2JqZWN0KGVycikgYW5kIF8uaXNTdHJpbmcoZXJyLm1lc3NhZ2UpXG4gICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcblxuICB1bmxlc3MgbWVzc2FnZVxuICAgIHRyeVxuICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVyclxuICAgIGNhdGNoXG4gICAgICBtZXNzYWdlID0gZG8gZXJyLnRvU3RyaW5nXG5cbiAgbWVzc2FnZSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5NZWRpYXRvciA9IFJhY3RpdmUuZXh0ZW5kIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1lZGlhdG9yKCkiLCJ7IF8sIGRpcmVjdG9yIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuXG5lbCA9ICcjcGFnZSdcblxucGFnZXMgPVxuICBcImluZGV4XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWVcIlxuICBcIm1pbGVzdG9uZVwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbWlsZXN0b25lLmNvZmZlZVwiXG4gIFwibmV3XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9uZXcuY29mZmVlXCJcbiAgXCJwcm9qZWN0XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9wcm9qZWN0LmNvZmZlZVwiXG5cbiMgQWRkIGEgcHJvamVjdCBmcm9tIGEgcm91dGUuXG5hZGRQcm9qZWN0ID0gKHBhZ2UsIG93bmVyLCBuYW1lKSAtPlxuICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvYWRkJywgeyBvd25lciwgbmFtZSB9XG5cbiMgUHJlYXBwbHkgYWxsIGZ1bmN0aW9ucyB3aXRoIG91ciBwYWdlIG5hbWUvY29udGV4dC5cbmMgPSAobmFtZSwgZm5zPVtdKSAtPlxuICAoIF8ucGFydGlhbCBmbiwgbmFtZSBmb3IgZm4gaW4gZm5zIClcblxudmlldyA9IG51bGxcbnJvdXRlID0gKHBhZ2UsIGFyZ3MuLi4pIC0+XG4gICMgVW5yZW5kZXIgdGhlIHByZXZpb3VzIG9uZS5cbiAgZG8gdmlldz8udGVhcmRvd25cbiAgIyBIaWRlIGFueSBub3RpZmljYXRpb25zLlxuICBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeS9oaWRlJ1xuICAjIFJlcXVpcmUgdGhlIG5ldyBvbmUuXG4gIFBhZ2UgPSBwYWdlc1twYWdlXVxuICAjIFJlbmRlciBpdC5cbiAgdmlldyA9IG5ldyBQYWdlIHsgZWwsICdkYXRhJzogeyAncm91dGUnOiBhcmdzIH0gfVxuXG5yb3V0ZXMgPVxuICAnLyc6ICAgICAgICAgICAgICAgICAgICAgICAgYyAnaW5kZXgnLCBbIHJvdXRlIF1cbiAgJy9uZXcvcHJvamVjdCc6ICAgICAgICAgICAgIGMgJ25ldycsICAgWyByb3V0ZSBdXG4gICMgVGhlIGZvbGxvd2luZyB0d28gcm91dGVzIGFkZCBhIHByb2plY3QgaW4gdGhlIGJhY2tncm91bmQuXG4gICcvOm93bmVyLzpuYW1lJzogICAgICAgICAgICBjICdwcm9qZWN0JywgICBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgJy86b3duZXIvOm5hbWUvOm1pbGVzdG9uZSc6IGMgJ21pbGVzdG9uZScsIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAjIFRPRE86IHJlbW92ZSBpbiBwcm9kdWN0aW9uLlxuICAnL3Jlc2V0JzogLT5cbiAgICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvY2xlYXInXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuIyBGbGF0aXJvbiBEaXJlY3RvciByb3V0ZXIuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yLlJvdXRlcihyb3V0ZXMpLmNvbmZpZ3VyZVxuICAnc3RyaWN0Jzogbm8gIyBhbGxvdyB0cmFpbGluZyBzbGFzaGVzXG4gIG5vdGZvdW5kOiAtPlxuICAgIHRocm93IDQwNCIsInsgbW9tZW50IH0gID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG4jIFByb2dyZXNzIGluICUuXG5wcm9ncmVzcyA9IChhLCBiKSAtPiAxMDAgKiAoYSAvIChiICsgYSkpXG5cbiMgQ2FsY3VsYXRlIHRoZSBzdGF0cyBmb3IgYSBtaWxlc3RvbmUuXG4jICBJcyBpdCBvbiB0aW1lPyBXaGF0IGlzIHRoZSBwcm9ncmVzcz9cbm1vZHVsZS5leHBvcnRzID0gKG1pbGVzdG9uZSkgLT5cbiAgICAjIFByb2dyZXNzIGluIHBvaW50cy5cbiAgICBwb2ludHMgPSBwcm9ncmVzcyBtaWxlc3RvbmUuaXNzdWVzLmNsb3NlZC5zaXplLCBtaWxlc3RvbmUuaXNzdWVzLm9wZW4uc2l6ZSAgICBcbiAgICBcbiAgICAjIE1pbGVzdG9uZXMgd2l0aCBubyBkdWUgZGF0ZSBhcmUgYWx3YXlzIG9uIHRyYWNrLlxuICAgIHJldHVybiB7ICdpc09uVGltZSc6IHllcywgJ3Byb2dyZXNzJzogeyBwb2ludHMgfSB9IHVubGVzcyBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICBhID0gK25ldyBEYXRlIG1pbGVzdG9uZS5jcmVhdGVkX2F0XG4gICAgYiA9ICtuZXcgRGF0ZVxuICAgIGMgPSArbmV3IERhdGUgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgIyBQcm9ncmVzcyBpbiB0aW1lLlxuICAgIHRpbWUgPSBwcm9ncmVzcyBiIC0gYSwgYyAtIGJcblxuICAgICMgSG93IG1hbnkgZGF5cyBpcyAxJSBvZiB0aGUgdGltZT9cbiAgICBkYXlzID0gKG1vbWVudChhKS5kaWZmKG1vbWVudChiKSwgJ2RheXMnKSkgLyAxMDBcblxuICAgIHtcbiAgICAgICdpc09uVGltZSc6IHBvaW50cyA+IHRpbWVcbiAgICAgICdwcm9ncmVzcyc6IHsgcG9pbnRzLCB0aW1lIH1cbiAgICAgICdkYXlzJzogICAgIGRheXNcbiAgICB9IiwiIyBBbGwgb3VyIHZlbmRvciBkZXBlbmRlbmNpZXMgaW4gb25lIHBsYWNlLlxubW9kdWxlLmV4cG9ydHMgPVxuICAnXyc6IHdpbmRvdy5fXG4gICdSYWN0aXZlJzogd2luZG93LlJhY3RpdmVcbiAgJ0ZpcmViYXNlJzogd2luZG93LkZpcmViYXNlXG4gICdGaXJlYmFzZVNpbXBsZUxvZ2luJzogd2luZG93LkZpcmViYXNlU2ltcGxlTG9naW5cbiAgJ1N1cGVyQWdlbnQnOiB3aW5kb3cuc3VwZXJhZ2VudFxuICAnYXN5bmMnOiB3aW5kb3cuYXN5bmNcbiAgJ21vbWVudCc6IHdpbmRvdy5tb21lbnRcbiAgJ2QzJzogd2luZG93LmQzXG4gICdtYXJrZWQnOiB3aW5kb3cubWFya2VkXG4gICdkaXJlY3Rvcic6XG4gICAgJ1JvdXRlcic6IHdpbmRvdy5Sb3V0ZXJcbiAgJ2xzY2FjaGUnOiB3aW5kb3cubHNjYWNoZVxuICAnc29ydGVkSW5kZXhDbXAnOiB3aW5kb3cuc29ydGVkSW5kZXgiLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYXBwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIk5vdGlmeVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkhlYWRlclwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwYWdlXCJ9LFwiZlwiOltdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W1wiJmNvcHk7IDIwMTItMjAxNCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCJodHRwOi8vY2xvdWRmaS5yZVwifSxcImZcIjpbXCJDbG91ZGZpcmUgU3lzdGVtc1wiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjaGFydFwifX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJoZWFkXCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInVzZXJcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJyaWdodFwifSxcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwiZGlzcGxheU5hbWVcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJkaXNwbGF5TmFtZVwifSxcIiBsb2dnZWQgaW5cIl19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwiZ2l0aHViXCJ9LFwidlwiOntcImNsaWNrXCI6XCIhbG9naW5cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJnaXRodWJcIn19LFwiIFNpZ24gSW5cIl19XSxcInJcIjpcImRpc3BsYXlOYW1lXCJ9XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImlkXCI6XCJpY29uXCIsXCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInVsXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwicGx1cy1jaXJjbGVkXCJ9fSxcIiBBZGQgYSBQcm9qZWN0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcImZhcVwifSxcImZcIjpbXCJGQVFcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjcmVzZXRcIn0sXCJmXCI6W1wiREIgUmVzZXRcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbm90aWZ5XCJ9LFwiZlwiOltcIk5vdGlmeVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJoZXJvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJjb250ZW50XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYWRkcmVzc1wifX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlNlZSB5b3VyIHByb2plY3QgcHJvZ3Jlc3NcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOltcIk5vdCBzdXJlIHdoZXJlIHRvIHN0YXJ0PyBKdXN0IGFkZCBhIGRlbW8gcmVwbyB0byBzZWUgYSBjaGFydC4gVGhlcmUgYXJlIG1hbnkgdmFyaWF0aW9ucyBvZiBwYXNzYWdlcyBvZiBMb3JlbSBJcHN1bSBhdmFpbGFibGUsIGJ1dCB0aGUgbWFqb3JpdHkgaGF2ZSBzdWZmZXJlZCBhbHRlcmF0aW9uIGluIHNvbWUgZm9ybSwgYnkgaW5qZWN0ZWQgaHVtb3VyLCBvciByYW5kb21pc2VkIHdvcmRzIHdoaWNoIGRvbid0IGxvb2sgZXZlbiBzbGlnaHRseSBiZWxpZXZhYmxlLlwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY3RhXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbmV3L3Byb2plY3RcIixcImNsYXNzXCI6XCJwcmltYXJ5XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwicGx1cy1jaXJjbGVkXCJ9fSxcIiBBZGQgeW91ciBwcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwic2Vjb25kYXJ5XCJ9LFwiZlwiOltcIlJlYWQgdGhlIEd1aWRlXCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwiY29kZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOltcImljb24gXCIse1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJjb2RlXCJdLFwic1wiOlwiXFxcIiYjXFxcIitfMCtcXFwiO1xcXCJcIn19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwidGV4dFwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInN5c3RlbVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJub3RpZnlcIixcImNsYXNzXCI6W3tcInRcIjoyLFwiclwiOlwidHlwZVwifSxcIiBzeXN0ZW1cIl0sXCJzdHlsZVwiOltcInRvcDpcIix7XCJ0XCI6MixcInJcIjpcInRvcFwifSxcIiVcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn1dLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJ4XCI6e1wiclwiOltcInRvcFwiXSxcInNcIjpcIi1fMFwifX0sXCJweFwiXX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJjbG9zZVwifSxcInZcIjp7XCJjbGlja1wiOlwiY2xvc2VcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJ0ZXh0XCJ9XX1dfV0sXCJyXCI6XCJzeXN0ZW1cIn1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcInByb2plY3RzLmxpc3RcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJQcm9qZWN0c1wiLFwiYVwiOntcInByb2plY3RzXCI6W3tcInRcIjoyLFwiclwiOlwicHJvamVjdHNcIn1dfX1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSGVyb1wifV0sXCJyXCI6XCJwcm9qZWN0cy5saXN0XCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiYVwiOntcImNsYXNzXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLnRpdGxlXCJdLFwic1wiOlwiXzAudGl0bGUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJzdWJcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiYVwiOntcImNsYXNzXCI6XCJkZXNjcmlwdGlvblwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmRlc2NyaXB0aW9uXCJdLFwic1wiOlwiXzAubWFya2Rvd24oXzEpXCJ9fV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJDaGFydFwiLFwiYVwiOntcIm1pbGVzdG9uZVwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZVwifV19fV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJhZGRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIkFkZCBhIFByb2plY3RcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOltcIlR5cGUgaW4gdGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgYXMgeW91IHdvdWxkIG5vcm1hbGx5LiBJZiB5b3UnZCBsaWtlIHRvIGFkZCBhIHByaXZhdGUgR2l0SHViIHByb2plY3QsIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W1wiU2lnbiBJblwiXX0sXCIgZmlyc3QuXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvcm1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaW5wdXRcIixcImFcIjp7XCJ0eXBlXCI6XCJ0ZXh0XCIsXCJwbGFjZWhvbGRlclwiOlwidXNlci9yZXBvXCIsXCJhdXRvY29tcGxldGVcIjpcIm9mZlwiLFwidmFsdWVcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19LFwidlwiOntcImtleXVwXCI6e1wiblwiOlwic3VibWl0XCIsXCJkXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcInZcIjp7XCJjbGlja1wiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19LFwiZlwiOltcIkFkZFwiXX1dfV19XX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJoMlwiLFwiYVwiOntcImNsYXNzXCI6XCJ0aXRsZVwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcInJvdXRlXCJdLFwic1wiOlwiXzAuam9pbihcXFwiL1xcXCIpXCJ9fV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJNaWxlc3RvbmVzXCIsXCJhXCI6e1wicHJvamVjdFwiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwic29ydFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInNvcnQtYWxwaGFiZXRcIn19LFwiIFNvcnRlZCBieSBwcmlvcml0eVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIk1pbGVzdG9uZXNcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInhcIjp7XCJyXCI6W1wicC5vd25lclwiLFwicHJvamVjdC5vd25lclwiLFwicC5uYW1lXCIsXCJwcm9qZWN0Lm5hbWVcIl0sXCJzXCI6XCJfMD09XzEmJl8yPT1fM1wifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS50aXRsZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcInN0eWxlXCI6XCJ3aWR0aDoxJVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvZ3Jlc3NcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJwZXJjZW50XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJkdWVcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLmlzT25UaW1lXCJdLFwic1wiOlwiKF8wKT9cXFwiZ3JlZW5cXFwiOlxcXCJyZWRcXFwiXCJ9fV0sXCJzdHlsZVwiOltcIndpZHRoOlwiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfV19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImNvZ1wifX0sXCIgRWRpdFwiXX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNvcnRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJzb3J0LWFscGhhYmV0XCJ9fSxcIiBTb3J0ZWQgYnkgcHJpb3JpdHlcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJQcm9qZWN0c1wiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicHJvamVjdHMuaW5kZXhcIixcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcIi5cIl0sXCJzXCI6XCJ7aW5kZXg6XzB9XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMFwiLFwicHJvamVjdHMubGlzdFwiXSxcInNcIjpcIntwcm9qZWN0Ol8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUzLFwiclwiOlwicHJvamVjdFwiLFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MCxcInJcIjpcImVycm9yc1wiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJjb2xzcGFuXCI6XCIzXCIsXCJjbGFzc1wiOlwicmVwb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvamVjdFwifSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImVycm9yXCIsXCJ0aXRsZVwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wiZXJyb3JzXCJdLFwic1wiOlwiXzAuam9pbihcXFwiXFxcXG5cXFwiKVwifX1dfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImF0dGVudGlvblwifX1dfV19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiaW5kZXguMVwiLFwicHJvamVjdC5taWxlc3RvbmVzXCJdLFwic1wiOlwie21pbGVzdG9uZTpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJjbGFzc1wiOlwicmVwb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcIm1pbGVzdG9uZVwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5udW1iZXJcIn1dfSxcImZcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUudGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZHVlXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJvdXRlciBiYXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpbm5lciBiYXIgXCIse1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIn0sXCIlXCJdfX1dfV19XX1dfV19XSxcInJcIjpcImVycm9yc1wifV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzID1cbiAgbm93OiAtPiBuZXcgRGF0ZSgpLnRvSlNPTigpIiwieyBfLCBtb21lbnQsIG1hcmtlZCB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBUaW1lIGZyb20gbm93LlxuICBmcm9tTm93OiBfLm1lbW9pemUgKGpzb25EYXRlKSAtPlxuICAgIG1vbWVudChuZXcgRGF0ZShqc29uRGF0ZSkpLmZyb21Ob3coKVxuXG4gICMgV2hlbiBpcyBhIG1pbGVzdG9uZSBkdWU/XG4gIGR1ZTogKGpzb25EYXRlKSAtPlxuICAgIHJldHVybiAnJm5ic3A7JyB1bmxlc3MganNvbkRhdGVcbiAgICBbICdkdWUnLCBAZnJvbU5vdyBqc29uRGF0ZSBdLmpvaW4oJyAnKVxuXG4gICMgTWFya2Rvd24gZm9ybWF0dGluZy5cbiAgbWFya2Rvd246IChtYXJrdXApIC0+XG4gICAgbWFya2VkIG1hcmt1cFxuXG4gICMgRm9ybWF0IG1pbGVzdG9uZSB0aXRsZS5cbiAgdGl0bGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtaWxlc3RvbmUnKSA+IC0xXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgWyAnTWlsZXN0b25lJywgdGV4dCBdLmpvaW4oJyAnKVxuXG4gICMgSGV4IHRvIGRlY2ltYWwuXG4gIGhleFRvRGVjOiAoaGV4KSAtPlxuICAgIHBhcnNlSW50IGhleCwgMTYiLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGlzOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC50eXBlIGluIFsgJ2tleXVwJywgJ2tleWRvd24nIF1cblxuICBpc0VudGVyOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC53aGljaCBpcyAxMyIsInsgXyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5fLm1peGluXG4gICdwbHVja01hbnknOiAoc291cmNlLCBrZXlzKSAtPlxuICAgIHRocm93ICdga2V5c2AgbmVlZHMgdG8gYmUgYW4gQXJyYXknIHVubGVzcyBfLmlzQXJyYXkga2V5c1xuICAgIF8ubWFwIHNvdXJjZSwgKGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgXy5lYWNoIGtleXMsIChrZXkpIC0+XG4gICAgICAgIG9ialtrZXldID0gaXRlbVtrZXldXG4gICAgICBvYmpcblxuICAnaXNJbnQnOiAodmFsKSAtPlxuICAgIG5vdCBpc05hTih2YWwpIGFuZCBwYXJzZUludChOdW1iZXIodmFsKSkgaXMgdmFsIGFuZCBub3QgaXNOYU4ocGFyc2VJbnQodmFsLCAxMCkpIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdHMpIC0+XG4gIE1vZGVsID0gUmFjdGl2ZS5leHRlbmQob3B0cylcbiAgbW9kZWwgPSBuZXcgTW9kZWwoKVxuICBtb2RlbC5yZW5kZXIoKVxuICBtb2RlbCIsInsgUmFjdGl2ZSwgZDMgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubGluZXMgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2xpbmVzLmNvZmZlZSdcbmF4ZXMgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9jaGFydC5odG1sJ1xuXG4gIG9uY29tcGxldGU6IC0+XG4gICAgbWlsZXN0b25lID0gQGRhdGEubWlsZXN0b25lXG4gICAgaXNzdWVzID0gbWlsZXN0b25lLmlzc3Vlc1xuICAgICMgVG90YWwgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgbWlsZXN0b25lLlxuICAgIHRvdGFsID0gaXNzdWVzLm9wZW4uc2l6ZSArIGlzc3Vlcy5jbG9zZWQuc2l6ZVxuXG5cbiAgICAjIEFuIGlzc3VlIG1heSBoYXZlIGJlZW4gY2xvc2VkIGJlZm9yZSB0aGUgc3RhcnQgb2YgYSBtaWxlc3RvbmUuXG4gICAgaGVhZCA9IGlzc3Vlcy5jbG9zZWQubGlzdFswXS5jbG9zZWRfYXRcbiAgICBpZiBpc3N1ZXMubGVuZ3RoIGFuZCBtaWxlc3RvbmUuY3JlYXRlZF9hdCA+IGhlYWRcbiAgICAgICMgVGhpcyBpcyB0aGUgbmV3IHN0YXJ0LlxuICAgICAgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPSBoZWFkXG5cbiAgICAjIEFjdHVhbCwgaWRlYWwgJiB0cmVuZCBsaW5lcy5cbiAgICBhY3R1YWwgPSBsaW5lcy5hY3R1YWwgaXNzdWVzLmNsb3NlZC5saXN0LCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgdG90YWxcbiAgICBpZGVhbCAgPSBsaW5lcy5pZGVhbCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vbiwgdG90YWxcbiAgICB0cmVuZCAgPSBsaW5lcy50cmVuZCBhY3R1YWwsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIEdldCBhdmFpbGFibGUgc3BhY2UuXG4gICAgeyBoZWlnaHQsIHdpZHRoIH0gPSBkbyBAZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cbiAgICBtYXJnaW4gPSB7ICd0b3AnOiAzMCwgJ3JpZ2h0JzogMzAsICdib3R0b20nOiA0MCwgJ2xlZnQnOiA1MCB9XG4gICAgd2lkdGggLT0gbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHRcbiAgICBoZWlnaHQgLT0gbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b21cblxuICAgICMgU2NhbGVzLlxuICAgIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWyAwLCB3aWR0aCBdKVxuICAgIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbIGhlaWdodCwgMCBdKVxuXG4gICAgIyBBeGVzLlxuICAgIHhBeGlzID0gYXhlcy5ob3Jpem9udGFsIGhlaWdodCwgeFxuICAgIHlBeGlzID0gYXhlcy52ZXJ0aWNhbCB3aWR0aCwgeVxuXG4gICAgIyBMaW5lIGdlbmVyYXRvci5cbiAgICBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC5pbnRlcnBvbGF0ZShcImxpbmVhclwiKVxuICAgIC54KCAoZCkgLT4geChkLmRhdGUpIClcbiAgICAueSggKGQpIC0+IHkoZC5wb2ludHMpIClcblxuICAgICMgR2V0IHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIGRhdGUsIGFuZCBpbml0aWFsIHBvaW50cy5cbiAgICB4LmRvbWFpbihbIGlkZWFsWzBdLmRhdGUsIGlkZWFsW2lkZWFsLmxlbmd0aCAtIDFdLmRhdGUgXSlcbiAgICB5LmRvbWFpbihbIDAsIGlkZWFsWzBdLnBvaW50cyBdKS5uaWNlKClcblxuICAgICMgQWRkIGFuIFNWRyBlbGVtZW50IHdpdGggdGhlIGRlc2lyZWQgZGltZW5zaW9ucyBhbmQgbWFyZ2luLlxuICAgIHN2ZyA9IGQzLnNlbGVjdCh0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJyNjaGFydCcpKS5hcHBlbmQoXCJzdmdcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXG5cbiAgICAjIEFkZCB0aGUgZGF5cyB4LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIGRheVwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKHhBeGlzKVxuXG4gICAgIyBBZGQgdGhlIG1vbnRocyB4LWF4aXMuXG4gICAgbSA9IFtcbiAgICAgICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsXG4gICAgICAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXG4gICAgXVxuXG4gICAgbUF4aXMgPSB4QXhpc1xuICAgIC5vcmllbnQoXCJ0b3BcIilcbiAgICAudGlja1NpemUoaGVpZ2h0KVxuICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gbVtkLmdldE1vbnRoKCldIClcbiAgICAudGlja3MoMilcbiAgICBcbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgbW9udGhcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbChtQXhpcylcblxuICAgICMgQWRkIHRoZSB5LWF4aXMuXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieSBheGlzXCIpXG4gICAgLmNhbGwoeUF4aXMpXG5cbiAgICAjIEFkZCBhIGxpbmUgc2hvd2luZyB3aGVyZSB3ZSBhcmUgbm93LlxuICAgIHN2Zy5hcHBlbmQoXCJzdmc6bGluZVwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheVwiKVxuICAgIC5hdHRyKFwieDFcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkxXCIsIDApXG4gICAgLmF0dHIoXCJ4MlwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KVxuXG4gICAgIyBBZGQgdGhlIGlkZWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJpZGVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJiYXNpc1wiKShpZGVhbCkpXG5cbiAgICAjIEFkZCB0aGUgdHJlbmRsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidHJlbmRsaW5lIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKSh0cmVuZCkpXG5cbiAgICAjIEFkZCB0aGUgYWN0dWFsIGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJhY3R1YWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpLnkoIChkKSAtPiB5KGQucG9pbnRzKSApKGFjdHVhbCkpXG5cbiAgICAjIENvbGxlY3QgdGhlIHRvb2x0aXAgaGVyZS5cbiAgICB0b29sdGlwID0gZDMudGlwKCkuYXR0cignY2xhc3MnLCAnZDMtdGlwJykuaHRtbCAoeyBudW1iZXIsIHRpdGxlIH0pIC0+XG4gICAgICBcIiMje251bWJlcn06ICN7dGl0bGV9XCJcblxuICAgIHN2Zy5jYWxsKHRvb2x0aXApXG5cbiAgICAjIFNob3cgd2hlbiB3ZSBjbG9zZWQgYW4gaXNzdWUuXG4gICAgc3ZnLnNlbGVjdEFsbChcImEuaXNzdWVcIilcbiAgICAuZGF0YShhY3R1YWwuc2xpY2UoMSkpICMgc2tpcCB0aGUgc3RhcnRpbmcgcG9pbnRcbiAgICAuZW50ZXIoKVxuICAgICMgQSB3cmFwcGluZyBsaW5rLlxuICAgIC5hcHBlbmQoJ3N2ZzphJylcbiAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgKHsgaHRtbF91cmwgfSkgLT4gaHRtbF91cmwgKVxuICAgIC5hdHRyKFwieGxpbms6c2hvd1wiLCAnbmV3JylcbiAgICAuYXBwZW5kKCdzdmc6Y2lyY2xlJylcbiAgICAuYXR0cihcImN4XCIsICh7IGRhdGUgfSkgLT4geCBkYXRlIClcbiAgICAuYXR0cihcImN5XCIsICh7IHBvaW50cyB9KSAtPiB5IHBvaW50cyApXG4gICAgLmF0dHIoXCJyXCIsICAoeyByYWRpdXMgfSkgLT4gNSApICMgZml4ZWQgZm9yIG5vd1xuICAgIC5vbignbW91c2VvdmVyJywgdG9vbHRpcC5zaG93KVxuICAgIC5vbignbW91c2VvdXQnLCB0b29sdGlwLmhpZGUpXG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxueyBzeXN0ZW0gfSA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuZmlyZWJhc2UgICA9IHJlcXVpcmUgJy4uL21vZGVscy9maXJlYmFzZS5jb2ZmZWUnXG51c2VyICAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuSWNvbnMgICAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVhZGVyJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9oZWFkZXIuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3VzZXInOiB1c2VyXG4gICAgIyBEZWZhdWx0IGFwcCBpY29uLlxuICAgICdpY29uJzogJ2ZpcmUtc3RhdGlvbidcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgTG9naW4gdXNlci5cbiAgICBAb24gJyFsb2dpbicsIC0+XG4gICAgICBmaXJlYmFzZS5sb2dpbiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnIgaWYgZXJyXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTd2l0Y2ggbG9hZGluZyBpY29uIHdpdGggYXBwIGljb24uXG4gICAgc3lzdGVtLm9ic2VydmUgJ2xvYWRpbmcnLCAoeWEpID0+XG4gICAgICBAc2V0ICdpY29uJywgaWYgeWEgdGhlbiAnc3Bpbm5lcjEnIGVsc2UgJ2ZpcmUtc3RhdGlvbiciLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9oZXJvJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9oZXJvLmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmZvcm1hdCA9IHJlcXVpcmUgJy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5cbiMgRm9udGVsbG8gaWNvbiBoZXggY29kZXMuXG5jb2RlcyA9XG4gICdjb2cnOiAgICAgICAgICAgJ1xcZTgwMCdcbiAgJ3NlYXJjaCc6ICAgICAgICAnXFxlODAxJ1xuICAnZ2l0aHViJzogICAgICAgICdcXGU4MDInXG4gICdhZGRyZXNzJzogICAgICAgJ1xcZTgwMydcbiAgJ3BsdXMtY2lyY2xlZCc6ICAnXFxlODA0J1xuICAnZmlyZS1zdGF0aW9uJzogICdcXGU4MDUnXG4gICdzb3J0LWFscGhhYmV0JzogJ1xcZTgwNidcbiAgJ2Rvd24tb3Blbic6ICAgICAnXFxlODA3J1xuICAnc3BpbjYnOiAgICAgICAgICdcXGU4MDgnXG4gICdtZWdhcGhvbmUnOiAgICAgJ1xcZTgwOSdcbiAgJ3NwaW40JzogICAgICAgICAnXFxlODBhJ1xuICAnc3Bpbm5lcjEnOiAgICAgICdcXGU4MGInXG4gICdhdHRlbnRpb24nOiAgICAgJ1xcZTgwYydcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2ljb25zJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9pY29ucy5odG1sJ1xuXG4gICdpc29sYXRlZCc6IHllc1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIEBvYnNlcnZlICdpY29uJywgKGljb24pIC0+XG4gICAgICBpZiBpY29uIGFuZCBoZXggPSBjb2Rlc1tpY29uXVxuICAgICAgICBAc2V0ICdjb2RlJywgZm9ybWF0LmhleFRvRGVjIGhleFxuICAgICAgZWxzZVxuICAgICAgICBAc2V0ICdjb2RlJywgbnVsbCIsInsgXywgUmFjdGl2ZSwgZDMgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbkhFSUdIVCA9IDY4ICMgaGVpZ2h0IG9mIGRpdiBpbiBweFxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3Mvbm90aWZ5J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uL3RlbXBsYXRlcy9ub3RpZnkuaHRtbCdcblxuICAnZGF0YSc6XG4gICAgJ3RvcCc6IEhFSUdIVFxuICAgICdoaWRkZW4nOiB5ZXNcbiAgICAnZGVmYXVsdHMnOlxuICAgICAgJ3RleHQnOiAnJ1xuICAgICAgJ3R5cGUnOiAnJyAjIGJsYW5kIGdyZXkgc3R5bGVcbiAgICAgICdzeXN0ZW0nOiBub1xuICAgICAgJ2ljb24nOiAnbWVnYXBob25lJ1xuICAgICAgJ3R0bCc6ICA1ZTNcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cbiAgXG4gICMgU2hvdyBhIG5vdGlmaWNhdGlvbi5cbiAgc2hvdzogKG9wdHMpIC0+XG4gICAgQHNldCAnaGlkZGVuJywgbm8gICAgXG4gICAgIyBTZXQgdGhlIG9wdHMuXG4gICAgQHNldCBvcHRzID0gXy5kZWZhdWx0cyBvcHRzLCBAZGF0YS5kZWZhdWx0c1xuICAgICMgV2hpY2ggcG9zaXRpb24gdG8gc2xpZGUgdG8/XG4gICAgcG9zID0gWyAwLCA1MCBdWyArb3B0cy5zeXN0ZW0gXSAjIDBweCBvciA1MCUgZnJvbSB0b3BcbiAgICAjIFNsaWRlIGludG8gdmlldy5cbiAgICBAYW5pbWF0ZSAndG9wJywgcG9zLFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JvdW5jZScpXG4gICAgICAnZHVyYXRpb24nOiA4MDBcbiAgICBcbiAgICAjIElmIG5vIHR0bCB0aGVuIHNob3cgcGVybWFuZW50bHkuXG4gICAgcmV0dXJuIHVubGVzcyBvcHRzLnR0bFxuXG4gICAgIyBTbGlkZSBvdXQgb2YgdGhlIHZpZXcuXG4gICAgXy5kZWxheSBfLmJpbmQoQGhpZGUsIEApLCBvcHRzLnR0bFxuXG4gICMgSGlkZSBhIG5vdGlmaWNhdGlvbi5cbiAgaGlkZTogLT5cbiAgICByZXR1cm4gaWYgQGRhdGEuaGlkZGVuXG4gICAgQHNldCAnaGlkZGVuJywgeWVzXG5cbiAgICBAYW5pbWF0ZSAndG9wJywgSEVJR0hULFxuICAgICAgJ2Vhc2luZyc6IGQzLmVhc2UoJ2JhY2snKVxuICAgICAgJ2NvbXBsZXRlJzogPT5cbiAgICAgICAgIyBSZXNldCB0aGUgdGV4dCB3aGVuIGFsbCBpcyBkb25lLlxuICAgICAgICBAc2V0ICd0ZXh0JywgbnVsbFxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBPbiBvdXRzaWRlIG1lc3NhZ2VzLlxuICAgIG1lZGlhdG9yLm9uICchYXBwL25vdGlmeScsIF8uYmluZCBAc2hvdywgQFxuICAgIG1lZGlhdG9yLm9uICchYXBwL25vdGlmeS9oaWRlJywgXy5iaW5kIEBoaWRlLCBAXG5cbiAgICAjIENsb3NlIHVzIHByZW1hdHVyZWx5Li4uXG4gICAgQG9uICdjbG9zZScsIEBoaWRlIiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5IZXJvICAgICA9IHJlcXVpcmUgJy4uL2hlcm8uY29mZmVlJ1xuUHJvamVjdHMgPSByZXF1aXJlICcuLi90YWJsZXMvcHJvamVjdHMuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvaW5kZXgnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEhlcm8sIFByb2plY3RzIH1cblxuICAnZGF0YSc6XG4gICAgJ3Byb2plY3RzJzogcHJvamVjdHNcbiAgICAncmVhZHknOiBub1xuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdCdXJuY2hhcnQ6IEdpdEh1YiBCdXJuZG93biBDaGFydCBhcyBhIFNlcnZpY2UnXG5cbiAgICAjIFF1aXQgaWYgd2UgaGF2ZSBubyBwcm9qZWN0cy5cbiAgICByZXR1cm4gQHNldCgncmVhZHknLCB5ZXMpIHVubGVzcyBwcm9qZWN0cy5saXN0Lmxlbmd0aFxuXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgIyBGb3IgYWxsIHByb2plY3RzLlxuICAgIGFzeW5jLm1hcCBwcm9qZWN0cy5kYXRhLmxpc3QsIChwcm9qZWN0LCBjYikgLT5cbiAgICAgICMgRmV0Y2ggdGhlaXIgbWlsZXN0b25lcy5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgKGVyciwgbGlzdCkgLT5cbiAgICAgICAgIyBTYXZlIHRoZSBlcnJvciBpZiBwcm9qZWN0IGRvZXMgbm90IGV4aXN0LlxuICAgICAgICBpZiBlcnJcbiAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgcmV0dXJuIGRvIGNiXG5cbiAgICAgICAgIyBOb3cgYWRkIGluIHRoZSBpc3N1ZXMuXG4gICAgICAgIGFzeW5jLmVhY2ggbGlzdCwgKG1pbGVzdG9uZSwgY2IpIC0+XG4gICAgICAgICAgIyBEbyB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwgaWYgXy5maW5kIHByb2plY3QubWlsZXN0b25lcywgKHsgbnVtYmVyIH0pIC0+XG4gICAgICAgICAgICBtaWxlc3RvbmUubnVtYmVyIGlzIG51bWJlclxuICAgICAgICAgIFxuICAgICAgICAgICMgT0sgZmV0Y2ggYWxsIHRoZSBpc3N1ZXMgZm9yIHRoaXMgbWlsZXN0b25lIHRoZW4uXG4gICAgICAgICAgaXNzdWVzLmZldGNoQWxsXG4gICAgICAgICAgICAnb3duZXInOiBwcm9qZWN0Lm93bmVyXG4gICAgICAgICAgICAnbmFtZSc6IHByb2plY3QubmFtZVxuICAgICAgICAgICAgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXJcbiAgICAgICAgICAsIChlcnIsIG9iaikgLT5cbiAgICAgICAgICAgICMgU2F2ZSBhbnkgZXJyb3JzIG9uIHRoZSBwcm9qZWN0LlxuICAgICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICAgIHByb2plY3RzLnNhdmVFcnJvciBwcm9qZWN0LCBlcnJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvIGNiXG5cbiAgICAgICAgICAgICMgQWRkIGluIHRoZSBpc3N1ZXMgdG8gdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lLlxuICAgICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIG1pbGVzdG9uZVxuICAgICAgICAgICAgIyBEb25lXG4gICAgICAgICAgICBkbyBjYlxuICAgICAgICBcbiAgICAgICAgLCBjYlxuXG4gICAgLCA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgQHNldCAncmVhZHknLCB5ZXMiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkNoYXJ0ID0gcmVxdWlyZSAnLi4vY2hhcnQuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuZm9ybWF0ICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbWlsZXN0b25lLmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IENoYXJ0IH1cblxuICAnZGF0YSc6XG4gICAgJ2Zvcm1hdCc6IGZvcm1hdFxuICAgICdyZWFkeSc6IG5vXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgWyBvd25lciwgbmFtZSwgbWlsZXN0b25lIF0gPSBAZ2V0ICdyb3V0ZSdcbiAgXG4gICAgbWlsZXN0b25lID0gcGFyc2VJbnQgbWlsZXN0b25lXG5cbiAgICBkb2N1bWVudC50aXRsZSA9IFwiI3tvd25lcn0vI3tuYW1lfS8je21pbGVzdG9uZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBwcm9qZWN0ID0gcHJvamVjdHMuZmluZCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgU2hvdWxkIG5vdCBoYXBwZW4uLi5cbiAgICB0aHJvdyA1MDAgdW5sZXNzIHByb2plY3RcblxuICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgIG9iaiA9IF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsIHsgJ251bWJlcic6IG1pbGVzdG9uZSB9XG4gICAgcmV0dXJuIEBzZXQgeyAnbWlsZXN0b25lJzogb2JqLCAncmVhZHknOiB5ZXMgfSBpZiBvYmo/XG5cbiAgICAjIFdlIGFyZSBsb2FkaW5nIHRoZSBtaWxlc3RvbmVzIHRoZW4uXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgZmV0Y2hNaWxlc3RvbmUgPSAoY2IpIC0+XG4gICAgICBtaWxlc3RvbmVzLmZldGNoIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYlxuXG4gICAgZmV0Y2hJc3N1ZXMgPSAoZGF0YSwgY2IpIC0+XG4gICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIChlcnIsIG9iaikgLT5cbiAgICAgICAgY2IgZXJyLCBfLmV4dGVuZCBkYXRhLCB7ICdpc3N1ZXMnOiBvYmogfVxuXG4gICAgYXN5bmMud2F0ZXJmYWxsIFtcbiAgICAgICMgR2V0IHRoZSBtaWxlc3RvbmUuXG4gICAgICBmZXRjaE1pbGVzdG9uZSxcbiAgICAgICMgVGhlbiBhbGwgaXRzIGlzc3Vlcy5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVyciwgZGF0YSkgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F2ZSB0aGUgbWlsZXN0b25lIHdpdGggaXNzdWVzLlxuICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIGRhdGFcblxuICAgICAgIyBTaG93IHRoZSBwYWdlLlxuICAgICAgQHNldFxuICAgICAgICAnbWlsZXN0b25lJzogZGF0YVxuICAgICAgICAncmVhZHknOiB5ZXMiLCJ7IF8sIFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG51c2VyICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcbmtleSAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMva2V5LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL25ldydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvbmV3Lmh0bWwnXG5cbiAgJ2RhdGEnOiB7ICd2YWx1ZSc6ICdyYWRla3N0ZXBhbi9kaXNwb3NhYmxlJywgdXNlciB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gICMgTGlzdGVuIHRvIEVudGVyIGtleXByZXNzIG9yIFN1Ym1pdCBidXR0b24gY2xpY2suXG4gIHN1Ym1pdDogKGV2dCwgdmFsdWUpIC0+XG4gICAgcmV0dXJuIGlmIGtleS5pcyhldnQpIGFuZCBub3Qga2V5LmlzRW50ZXIoZXZ0KVxuXG4gICAgWyBvd25lciwgbmFtZSBdID0gdmFsdWUuc3BsaXQoJy8nKVxuXG4gICAgZG9uZSA9IGRvIHN5c3RlbS5hc3luY1xuXG4gICAgIyBTYXZlIHJlcG8uXG4gICAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfSwgKGVycikgLT5cbiAgICAgIGRvIGRvbmVcblxuICAgICAgbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLFxuICAgICAgICAndGV4dCc6IGVyciBvciBcIlByb2plY3QgI3t2YWx1ZX0gc2F2ZWQuXCJcbiAgICAgICAgJ3R5cGUnOiBpZiBlcnIgdGhlbiAnZXJyb3InIGVsc2UgJ3N1Y2Nlc3MnXG5cbiAgICAgICMgUmVkaXJlY3QgdG8gdGhlIGRhc2hib2FyZC5cbiAgICAgICMgVE9ETzogdHJpZ2dlciBhIG5hbWVkIHJvdXRlXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJ1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0FkZCBhIG5ldyBwcm9qZWN0J1xuXG4gICAgIyBUT0RPOiBhdXRvY29tcGxldGUgb24gb3VyIHVzZXJuYW1lIGlmIHdlIGFyZSBsb2dnZWQgaW4gb3IgYmFzZWRcbiAgICAjICBvbiByZXBvcyB3ZSBhbHJlYWR5IGhhdmUuXG4gICAgYXV0b2NvbXBsZXRlID0gKHZhbHVlKSAtPlxuXG4gICAgQG9ic2VydmUgJ3ZhbHVlJywgXy5kZWJvdW5jZShhdXRvY29tcGxldGUsIDIwMCksIHsgJ2luaXQnOiBubyB9XG5cbiAgICAjIEZvY3VzIG9uIHRoZSBpbnB1dCBmaWVsZC5cbiAgICBkbyBAZWwucXVlcnlTZWxlY3RvcignaW5wdXQnKS5mb2N1c1xuXG4gICAgQG9uICdzdWJtaXQnLCBAc3VibWl0IiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5NaWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vdGFibGVzL21pbGVzdG9uZXMuY29mZmVlJ1xuXG5wcm9qZWN0cyAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbnN5c3RlbSAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbm1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9taWxlc3RvbmVzLmNvZmZlZSdcbmlzc3VlcyAgICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL2dpdGh1Yi9pc3N1ZXMuY29mZmVlJ1xubWVkaWF0b3IgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvcHJvamVjdCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBNaWxlc3RvbmVzIH1cblxuICAnZGF0YSc6XG4gICAgJ3Byb2plY3RzJzogcHJvamVjdHNcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUgXSA9IEBnZXQgJ3JvdXRlJ1xuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBAc2V0ICdwcm9qZWN0JywgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIFdlIGRvbid0IGtub3cgaWYgd2UgaGF2ZSBhbGwgbWlsZXN0b25lcywgc28gZmV0Y2ggdGhlbS5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmaW5kTWlsZXN0b25lID0gKG51bWJlcikgLT5cbiAgICAgIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMgb3IgW10sIHsgbnVtYmVyIH1cblxuICAgIGZldGNoTWlsZXN0b25lcyA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGFsbE1pbGVzdG9uZXMsIGNiKSAtPlxuICAgICAgYXN5bmMuZWFjaCBhbGxNaWxlc3RvbmVzLCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgIyBNYXliZSB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgIHJldHVybiBjYiBudWxsIGlmIGZpbmRNaWxlc3RvbmUgbWlsZXN0b25lLm51bWJlclxuICAgICAgICAjIE5lZWQgdG8gZmV0Y2ggdGhlIGlzc3VlcyB0aGVuLlxuICAgICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXIgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAjIE5leHQuXG4gICAgICAgICAgZG8gY2JcbiAgICAgICwgY2JcblxuICAgICMgUnVuIGl0LlxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEZpcnN0IGdldCBhbGwgdGhlIG1pbGVzdG9uZXMuXG4gICAgICBmZXRjaE1pbGVzdG9uZXMsXG4gICAgICAjIFRoZW4gYWxsIHRoZSBpc3N1ZXMgcGVyIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVycikgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F5IHdlIGFyZSByZWFkeS5cbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5wcm9qZWN0cyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5mb3JtYXQgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4uL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL21pbGVzdG9uZXMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9taWxlc3RvbmVzLmh0bWwnXG5cbiAgJ2RhdGEnOiB7IGZvcm1hdCB9XG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5mb3JtYXQgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2Zvcm1hdC5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4uL2ljb25zLmNvZmZlZSdcbnByb2plY3RzID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3Byb2plY3RzJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCdcblxuICAnZGF0YSc6IHsgZm9ybWF0IH1cblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iXX0=
