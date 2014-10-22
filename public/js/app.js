(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



},{"./models/projects.coffee":4,"./modules/router.coffee":13,"./modules/vendor.coffee":15,"./templates/app.html":16,"./utils/mixins.coffee":31,"./views/header.coffee":34,"./views/notify.coffee":37}],2:[function(require,module,exports){
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



},{"../utils/model.coffee":32}],3:[function(require,module,exports){
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



},{"../modules/vendor.coffee":15,"../utils/model.coffee":32,"./config.coffee":2,"./user.coffee":6}],4:[function(require,module,exports){
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
    var deIdx, list;
    list = this.data.list;
    deIdx = (function(_this) {
      return function(fn) {
        return function(_arg, b) {
          var i, j;
          i = _arg[0], j = _arg[1];
          return fn(list[i].milestones[j], b);
        };
      };
    })(this);
    switch (this.data.sortBy) {
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
        return deIdx((function(_this) {
          return function(a, b) {
            return 0;
          };
        })(this));
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
    var idx;
    _.extend(milestone, {
      'stats': stats(milestone)
    });
    if ((idx = this.findIndex(project)) > -1) {
      if (project.milestones != null) {
        return this.push("list." + idx + ".milestones", milestone);
      } else {
        return this.set("list." + idx + ".milestones", [milestone]);
      }
    } else {
      throw 500;
    }
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
  sort: function() {
    var i, idx, index, j, m, p, _i, _j, _len, _len1, _ref1, _ref2;
    index = this.data.index || [];
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
    return this.set('index', index);
  },
  onconstruct: function() {
    mediator.on('!projects/add', _.bind(this.add, this));
    return mediator.on('!projects/clear', _.bind(this.clear, this));
  },
  onrender: function() {
    this.set('list', lscache.get('projects') || []);
    this.observe('list', function(projects) {
      lscache.set('projects', _.pluckMany(projects, ['owner', 'name']));
      return this.sort();
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



},{"../models/config.coffee":2,"../modules/mediator.coffee":12,"../modules/stats.coffee":14,"../modules/vendor.coffee":15,"../utils/date.coffee":28,"../utils/model.coffee":32,"./user.coffee":6}],5:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../utils/model.coffee":32}],6:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../utils/model.coffee":32}],7:[function(require,module,exports){
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



},{"../vendor.coffee":15}],8:[function(require,module,exports){
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



},{"../../models/config.coffee":2,"../../modules/vendor.coffee":15}],9:[function(require,module,exports){
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



},{"../../models/config.coffee":2,"../vendor.coffee":15,"./request.coffee":11}],10:[function(require,module,exports){
var request;

request = require('./request.coffee');

module.exports = {
  'fetch': request.oneMilestone,
  'fetchAll': request.allMilestones
};



},{"./request.coffee":11}],11:[function(require,module,exports){
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



},{"../../models/user.coffee":6,"../vendor.coffee":15}],12:[function(require,module,exports){
var Mediator, Ractive;

Ractive = require('./vendor.coffee').Ractive;

Mediator = Ractive.extend({});

module.exports = new Mediator();



},{"./vendor.coffee":15}],13:[function(require,module,exports){
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



},{"../models/system.coffee":5,"../views/pages/index.coffee":38,"../views/pages/milestone.coffee":39,"../views/pages/new.coffee":40,"../views/pages/project.coffee":41,"./mediator.coffee":12,"./vendor.coffee":15}],14:[function(require,module,exports){
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



},{"./vendor.coffee":15}],15:[function(require,module,exports){
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



},{}],16:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"app"},"f":[{"t":7,"e":"Notify"}," ",{"t":7,"e":"Header"}," ",{"t":7,"e":"div","a":{"id":"page"},"f":[]}," ",{"t":7,"e":"div","a":{"id":"footer"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":["&copy; 2012-2014 ",{"t":7,"e":"a","a":{"href":"http://cloudfi.re"},"f":["Cloudfire Systems"]}]}]}]}]}
},{}],17:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"chart"}}]}
},{}],18:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"head"},"f":[{"t":4,"n":53,"r":"user","f":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","a":{"class":"right"},"t1":"fade","f":[{"t":4,"r":"displayName","f":[{"t":2,"r":"displayName"}," logged in"]},{"t":4,"n":51,"f":[{"t":7,"e":"a","a":{"class":"github"},"v":{"click":"!login"},"f":[{"t":7,"e":"Icons","a":{"icon":"github"}}," Sign In"]}],"r":"displayName"}]}]}]}," ",{"t":7,"e":"a","a":{"id":"icon","href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}]}," ",{"t":7,"e":"ul","f":[{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#new/project","class":"add"},"f":[{"t":7,"e":"Icons","a":{"icon":"plus-circled"}}," Add a Project"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#","class":"faq"},"f":["FAQ"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#reset"},"f":["DB Reset"]}]}," ",{"t":7,"e":"li","f":[{"t":7,"e":"a","a":{"href":"#notify"},"f":["Notify"]}]}]}]}]}
},{}],19:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"hero"},"f":[{"t":7,"e":"div","a":{"class":"content"},"f":[{"t":7,"e":"Icons","a":{"icon":"address"}}," ",{"t":7,"e":"h2","f":["See your project progress"]}," ",{"t":7,"e":"p","f":["Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable."]}," ",{"t":7,"e":"div","a":{"class":"cta"},"f":[{"t":7,"e":"a","a":{"href":"#new/project","class":"primary"},"f":[{"t":7,"e":"Icons","a":{"icon":"plus-circled"}}," Add your project"]}," ",{"t":7,"e":"a","a":{"href":"#","class":"secondary"},"f":["Read the Guide"]}]}]}]}]}
},{}],20:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"code","f":[{"t":7,"e":"span","a":{"class":["icon ",{"t":2,"r":"icon"}]},"f":[{"t":3,"x":{"r":["code"],"s":"\"&#\"+_0+\";\""}}]}]}]}
},{}],21:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"text","f":[{"t":4,"r":"system","f":[{"t":7,"e":"div","a":{"id":"notify","class":[{"t":2,"r":"type"}," system"],"style":["top:",{"t":2,"r":"top"},"%"]},"f":[{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}," ",{"t":7,"e":"p","f":[{"t":2,"r":"text"}]}]}]},{"t":4,"n":51,"f":[{"t":7,"e":"div","a":{"id":"notify","class":[{"t":2,"r":"type"}],"style":["top:",{"t":2,"x":{"r":["top"],"s":"-_0"}},"px"]},"f":[{"t":7,"e":"span","a":{"class":"close"},"v":{"click":"close"}}," ",{"t":7,"e":"Icons","a":{"icon":[{"t":2,"r":"icon"}]}}," ",{"t":7,"e":"p","f":[{"t":2,"r":"text"}]}]}],"r":"system"}]}]}
},{}],22:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":4,"n":50,"r":"projects.list","f":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"Projects","a":{"projects":[{"t":2,"r":"projects"}]}}]}]}]},{"t":4,"n":51,"f":[{"t":7,"e":"Hero"}],"r":"projects.list"}]}]}
},{}],23:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"div","a":{"id":"title"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":[{"t":7,"e":"h2","a":{"class":"title"},"f":[{"t":2,"x":{"r":["format","milestone.title"],"s":"_0.title(_1)"}}]}," ",{"t":7,"e":"span","a":{"class":"sub"},"f":[{"t":3,"x":{"r":["format","milestone.due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"p","a":{"class":"description"},"f":[{"t":3,"x":{"r":["format","milestone.description"],"s":"_0.markdown(_1)"}}]}]}]}," ",{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"Chart","a":{"milestone":[{"t":2,"r":"milestone"}]}}]}]}]}]}
},{}],24:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"div","a":{"id":"add"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"h2","f":["Add a Project"]}," ",{"t":7,"e":"p","f":["Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, ",{"t":7,"e":"a","a":{"href":"#"},"f":["Sign In"]}," first."]}]}," ",{"t":7,"e":"div","a":{"class":"form"},"f":[{"t":7,"e":"table","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","f":[{"t":7,"e":"input","a":{"type":"text","placeholder":"user/repo","autocomplete":"off","value":[{"t":2,"r":"value"}]},"v":{"keyup":{"n":"submit","d":[{"t":2,"r":"value"}]}}}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","v":{"click":{"n":"submit","d":[{"t":2,"r":"value"}]}},"f":["Add"]}]}]}]}]}]}]}]}
},{}],25:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":4,"r":"ready","f":[{"t":7,"e":"div","t1":"fade","f":[{"t":7,"e":"div","a":{"id":"title"},"f":[{"t":7,"e":"div","a":{"class":"wrap"},"f":[{"t":7,"e":"h2","a":{"class":"title"},"f":[{"t":2,"x":{"r":["route"],"s":"_0.join(\"/\")"}}]}]}]}," ",{"t":7,"e":"div","a":{"id":"content","class":"wrap"},"f":[{"t":7,"e":"Milestones","a":{"project":[{"t":2,"r":"project"}]}}]}]}]}]}
},{}],26:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"href":"#","class":"sort"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by priority"]}," ",{"t":7,"e":"h2","f":["Milestones"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"project.milestones","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"project.owner"},"/",{"t":2,"r":"project.name"},"/",{"t":2,"r":"number"}]},"f":[{"t":2,"r":"title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"stats.progress.points"},"%"]}}]}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],27:[function(require,module,exports){
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"href":"#","class":"sort"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by priority"]}," ",{"t":7,"e":"h2","f":["Projects"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.index","f":[{"t":4,"x":{"r":["."],"s":"{index:_0}"},"f":[{"t":4,"x":{"r":["index.0","projects.list"],"s":"{project:_1[_0]}"},"f":[{"t":4,"n":53,"r":"project","f":[{"t":4,"n":50,"r":"errors","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"colspan":"3","class":"repo"},"f":[{"t":7,"e":"div","a":{"class":"project"},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}," ",{"t":7,"e":"span","a":{"class":"error","title":[{"t":2,"x":{"r":["errors"],"s":"_0.join(\"\\n\")"}}]},"f":[{"t":7,"e":"Icons","a":{"icon":"attention"}}]}]}]}]}]},{"t":4,"n":51,"f":[{"t":4,"x":{"r":["index.1","project.milestones"],"s":"{milestone:_1[_0]}"},"f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"class":"repo"},"f":[{"t":7,"e":"a","a":{"class":"project","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"},"/",{"t":2,"r":"milestone.number"}]},"f":[{"t":2,"r":"title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["milestone.stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["milestone.stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"milestone.stats.progress.points"},"%"]}}]}]}]}]}]}],"r":"errors"}]}]}]}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
},{}],28:[function(require,module,exports){
module.exports = {
  now: function() {
    return new Date().toJSON();
  }
};



},{}],29:[function(require,module,exports){
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



},{"../modules/vendor.coffee":15}],30:[function(require,module,exports){
module.exports = {
  is: function(evt) {
    var _ref;
    return (_ref = evt.original.type) === 'keyup' || _ref === 'keydown';
  },
  isEnter: function(evt) {
    return evt.original.which === 13;
  }
};



},{}],31:[function(require,module,exports){
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



},{"../modules/vendor.coffee":15}],32:[function(require,module,exports){
var Ractive;

Ractive = require('../modules/vendor.coffee').Ractive;

module.exports = function(opts) {
  var Model, model;
  Model = Ractive.extend(opts);
  model = new Model();
  model.render();
  return model;
};



},{"../modules/vendor.coffee":15}],33:[function(require,module,exports){
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



},{"../modules/chart/axes.coffee":7,"../modules/chart/lines.coffee":8,"../modules/vendor.coffee":15,"../templates/chart.html":17}],34:[function(require,module,exports){
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



},{"../models/firebase.coffee":3,"../models/system.coffee":5,"../models/user.coffee":6,"../modules/vendor.coffee":15,"../templates/header.html":18,"./icons.coffee":36}],35:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../modules/vendor.coffee":15,"../templates/hero.html":19,"./icons.coffee":36}],36:[function(require,module,exports){
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



},{"../modules/vendor.coffee":15,"../templates/icons.html":20,"../utils/format.coffee":29}],37:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../modules/vendor.coffee":15,"../templates/notify.html":21,"./icons.coffee":36}],38:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/index.html":22,"../hero.coffee":35,"../tables/projects.coffee":43}],39:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/milestone.html":23,"../../utils/format.coffee":29,"../chart.coffee":33}],40:[function(require,module,exports){
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



},{"../../models/system.coffee":5,"../../models/user.coffee":6,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/new.html":24,"../../utils/key.coffee":30}],41:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/project.html":25,"../tables/milestones.coffee":42}],42:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/tables/milestones.html":26,"../../utils/format.coffee":29,"../icons.coffee":36}],43:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/tables/projects.html":27,"../../utils/format.coffee":29,"../icons.coffee":36}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9hcHAuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2NvbmZpZy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvZmlyZWJhc2UuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9zeXN0ZW0uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3VzZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvcmVxdWVzdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvcm91dGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvc3RhdHMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy92ZW5kb3IuY29mZmVlIiwic3JjL3RlbXBsYXRlcy9hcHAuaHRtbCIsInNyYy90ZW1wbGF0ZXMvY2hhcnQuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlcm8uaHRtbCIsInNyYy90ZW1wbGF0ZXMvaWNvbnMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2RhdGUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvZm9ybWF0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2tleS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9taXhpbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbW9kZWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvY2hhcnQuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaGVhZGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlcm8uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvaWNvbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3Mvbm90aWZ5LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL2luZGV4LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL21pbGVzdG9uZS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9uZXcuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvcHJvamVjdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvbWlsZXN0b25lcy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy90YWJsZXMvcHJvamVjdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxvQ0FBQTs7QUFBQSxVQUFjLE9BQUEsQ0FBUSx5QkFBUixFQUFaLE9BQUYsQ0FBQTs7QUFBQSxPQUVBLENBQVEsdUJBQVIsQ0FGQSxDQUFBOztBQUFBLE9BSUEsQ0FBUSwwQkFBUixDQUpBLENBQUE7O0FBQUEsTUFNQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQU5ULENBQUE7O0FBQUEsTUFPQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQVBULENBQUE7O0FBQUEsTUFRQSxHQUFTLE9BQUEsQ0FBUSx5QkFBUixDQVJULENBQUE7O0FBQUEsR0FVQSxHQUFVLElBQUEsT0FBQSxDQUVSO0FBQUEsRUFBQSxVQUFBLEVBQVksT0FBQSxDQUFRLHNCQUFSLENBQVo7QUFBQSxFQUVBLElBQUEsRUFBTSxNQUZOO0FBQUEsRUFJQSxZQUFBLEVBQWM7QUFBQSxJQUFFLFFBQUEsTUFBRjtBQUFBLElBQVUsUUFBQSxNQUFWO0dBSmQ7QUFBQSxFQU1B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QUFBLElBQUUsUUFBQSxNQUFGO0dBSlI7QUFBQSxFQU1BLFlBQUEsRUFBYztBQUFBLElBQUUsT0FBQSxLQUFGO0dBTmQ7QUFBQSxFQVFBLE9BQUEsRUFBUyxDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FSVDtDQUZlLENBUGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcbiMgTG9kYXNoIG1peGlucy5cbnJlcXVpcmUgJy4vdXRpbHMvbWl4aW5zLmNvZmZlZSdcbiMgV2lsbCBsb2FkIHByb2plY3RzIGZyb20gbG9jYWxTdG9yYWdlLlxucmVxdWlyZSAnLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5IZWFkZXIgPSByZXF1aXJlICcuL3ZpZXdzL2hlYWRlci5jb2ZmZWUnXG5Ob3RpZnkgPSByZXF1aXJlICcuL3ZpZXdzL25vdGlmeS5jb2ZmZWUnXG5yb3V0ZXIgPSByZXF1aXJlICcuL21vZHVsZXMvcm91dGVyLmNvZmZlZSdcblxuYXBwID0gbmV3IFJhY3RpdmVcbiAgXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2FwcC5odG1sJ1xuXG4gICdlbCc6ICdib2R5J1xuXG4gICdjb21wb25lbnRzJzogeyBIZWFkZXIsIE5vdGlmeSB9XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTdGFydCB0aGUgcm91dGVyLlxuICAgIHJvdXRlci5pbml0ICcvJyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHVibGljX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSwgc29ydGVkSW5kZXhDbXAgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnICAgPSByZXF1aXJlICcuLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zdGF0cyAgICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvc3RhdHMuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5kYXRlICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL2RhdGUuY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9wcm9qZWN0cydcblxuICAnZGF0YSc6XG4gICAgJ3NvcnRCeSc6ICdwcm9ncmVzcydcblxuICAjIFJldHVybiBhIHNvcnQgb3JkZXIgY29tcGFyYXRvci5cbiAgY29tcGFyYXRvcjogLT5cbiAgICB7IGxpc3QgfSA9IEBkYXRhXG5cbiAgICAjIENvbnZlcnQgZXhpc3RpbmcgaW5kZXggaW50byBhY3R1YWwgcHJvamVjdCBtaWxlc3RvbmUuXG4gICAgZGVJZHggPSAoZm4pID0+XG4gICAgICAoWyBpLCBqIF0sIGIpID0+XG4gICAgICAgIGZuIGxpc3RbaV0ubWlsZXN0b25lc1tqXSwgYlxuXG4gICAgc3dpdGNoIEBkYXRhLnNvcnRCeVxuICAgICAgIyBGcm9tIGhpZ2hlc3QgcHJvZ3Jlc3MuXG4gICAgICB3aGVuICdwcm9ncmVzcycgdGhlbiBkZUlkeCAoYSwgYikgLT5cbiAgICAgICAgIyBCeSBwcm9ncmVzcyBwb2ludHMuXG4gICAgICAgICQgPSB7ICdwcm9ncmVzcyc6IHsgJ3BvaW50cyc6IDAgfSB9XG4gICAgICAgIGEuc3RhdHMgPz0gJCA7IGIucHJvZ3Jlc3MgPz0gJFxuXG4gICAgICAgIGEuc3RhdHMucHJvZ3Jlc3MucG9pbnRzIC0gYi5zdGF0cy5wcm9ncmVzcy5wb2ludHNcblxuICAgICAgIyBGcm9tIG1vc3QgZGVsYXllZCBpbiBkYXlzLlxuICAgICAgd2hlbiAncHJpb3JpdHknIHRoZW4gZGVJZHggKGEsIGIpID0+XG4gICAgICAgIDBcblxuICAgICAgIyBXaGF0ZXZlciBzb3J0IG9yZGVyLi4uXG4gICAgICBlbHNlIC0+IDBcblxuICBmaW5kOiAocHJvamVjdCkgLT5cbiAgICBfLmZpbmQgQGRhdGEubGlzdCwgcHJvamVjdFxuXG4gIGV4aXN0czogLT5cbiAgICAhIUBmaW5kLmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICMgUHVzaCB0byB0aGUgc3RhY2sgdW5sZXNzIGl0IGV4aXN0cyBhbHJlYWR5LlxuICBhZGQ6IChwcm9qZWN0KSAtPlxuICAgIEBwdXNoICdsaXN0JywgcHJvamVjdCB1bmxlc3MgQGV4aXN0cyBwcm9qZWN0XG5cbiAgIyBGaW5kIGluZGV4IG9mIGEgcHJvamVjdC5cbiAgZmluZEluZGV4OiAoeyBvd25lciwgbmFtZSB9KSAtPlxuICAgIF8uZmluZEluZGV4IEBkYXRhLmxpc3QsIHsgb3duZXIsIG5hbWUgfVxuXG4gIGFkZE1pbGVzdG9uZTogKHByb2plY3QsIG1pbGVzdG9uZSkgLT5cbiAgICAjIEFkZCBpbiB0aGUgc3RhdHMuXG4gICAgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdzdGF0cyc6IHN0YXRzKG1pbGVzdG9uZSkgfVxuXG4gICAgaWYgKGlkeCA9IEBmaW5kSW5kZXgocHJvamVjdCkpID4gLTFcbiAgICAgIGlmIHByb2plY3QubWlsZXN0b25lcz9cbiAgICAgICAgQHB1c2ggXCJsaXN0LiN7aWR4fS5taWxlc3RvbmVzXCIsIG1pbGVzdG9uZVxuICAgICAgZWxzZVxuICAgICAgICBAc2V0IFwibGlzdC4je2lkeH0ubWlsZXN0b25lc1wiLCBbIG1pbGVzdG9uZSBdXG4gICAgZWxzZVxuICAgICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICAgIHRocm93IDUwMFxuXG4gICMgU2F2ZSBhbiBlcnJvciBmcm9tIGxvYWRpbmcgbWlsZXN0b25lcyBvciBpc3N1ZXNcbiAgc2F2ZUVycm9yOiAocHJvamVjdCwgZXJyKSAtPlxuICAgIGlmIChpZHggPSBAZmluZEluZGV4KHByb2plY3QpKSA+IC0xXG4gICAgICBpZiBwcm9qZWN0LmVycm9ycz9cbiAgICAgICAgQHB1c2ggXCJsaXN0LiN7aWR4fS5lcnJvcnNcIiwgZXJyXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgXCJsaXN0LiN7aWR4fS5lcnJvcnNcIiwgWyBlcnIgXVxuICAgIGVsc2VcbiAgICAgICMgV2UgYXJlIHN1cHBvc2VkIHRvIGV4aXN0IGFscmVhZHkuXG4gICAgICB0aHJvdyA1MDAgIFxuXG4gIGNsZWFyOiAtPlxuICAgIEBzZXQgJ2xpc3QnLCBbXVxuXG4gICMgU29ydCBhbiBhbHJlYWR5IHNvcnRlZCBpbmRleC5cbiAgc29ydDogLT5cbiAgICAjIEdldCBvciBpbml0aWFsaXplIHRoZSBpbmRleC5cbiAgICBpbmRleCA9IEBkYXRhLmluZGV4IG9yIFtdXG5cbiAgICBmb3IgcCwgaSBpbiBAZGF0YS5saXN0XG4gICAgICBjb250aW51ZSB1bmxlc3MgcC5taWxlc3RvbmVzP1xuICAgICAgZm9yIG0sIGogaW4gcC5taWxlc3RvbmVzXG4gICAgICAgICMgUnVuIGEgY29tcGFyYXRvciBoZXJlIGluc2VydGluZyBpbnRvIGluZGV4LlxuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleENtcCBpbmRleCwgbSwgZG8gQGNvbXBhcmF0b3JcbiAgICAgICAgIyBMb2cuXG4gICAgICAgIGluZGV4LnNwbGljZSBpZHgsIDAsIFsgaSwgaiBdXG5cbiAgICAjIFNhdmUgdGhlIGluZGV4LlxuICAgIEBzZXQgJ2luZGV4JywgaW5kZXhcblxuICBvbmNvbnN0cnVjdDogLT5cbiAgICBtZWRpYXRvci5vbiAnIXByb2plY3RzL2FkZCcsICAgIF8uYmluZCBAYWRkLCBAXG4gICAgbWVkaWF0b3Iub24gJyFwcm9qZWN0cy9jbGVhcicsICBfLmJpbmQgQGNsZWFyLCBAXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBJbml0IHRoZSBwcm9qZWN0cy5cbiAgICBAc2V0ICdsaXN0JywgbHNjYWNoZS5nZXQoJ3Byb2plY3RzJykgb3IgW11cblxuICAgIEBvYnNlcnZlICdsaXN0JywgKHByb2plY3RzKSAtPlxuICAgICAgIyBQZXJzaXN0IHByb2plY3RzIGluIGxvY2FsIHN0b3JhZ2UgKHNhbnMgbWlsZXN0b25lcykuXG4gICAgICBsc2NhY2hlLnNldCAncHJvamVjdHMnLCBfLnBsdWNrTWFueSBwcm9qZWN0cywgWyAnb3duZXInLCAnbmFtZScgXVxuICAgICAgIyBVcGRhdGUgdGhlIGluZGV4LlxuICAgICAgZG8gQHNvcnRcbiAgICAsICdpbml0Jzogbm9cblxuICAgICMgUmVzZXQgb3VyIGluZGV4IGFuZCByZS1zb3J0LlxuICAgIEBvYnNlcnZlICdzb3J0QnknLCAtPlxuICAgICAgIyBVc2UgcG9wIGFzIFJhY3RpdmUgaXMgZ2xpdGNoeS5cbiAgICAgICggQHBvcCAnaW5kZXgnIHdoaWxlIEBkYXRhLmluZGV4Lmxlbmd0aCApIGlmIEBkYXRhLmluZGV4P1xuICAgICAgI8KgUnVuIHRoZSBzb3J0IGFnYWluLlxuICAgICAgZG8gQHNvcnQiLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgU3lzdGVtIHN0YXRlLlxuc3lzdGVtID0gbmV3IE1vZGVsXG4gIFxuICAnbmFtZSc6ICdtb2RlbHMvc3lzdGVtJ1xuXG4gICdkYXRhJzpcbiAgICAnbG9hZGluZyc6IG5vXG5cbmNvdW50ZXIgPSAwXG5hc3luYyA9IC0+XG4gIGNvdW50ZXIgKz0gMVxuICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgeWVzXG4gIC0+XG4gICAgY291bnRlciAtPSAxXG4gICAgc3lzdGVtLnNldCAnbG9hZGluZycsICtjb3VudGVyXG5cbm1vZHVsZS5leHBvcnRzID0geyBzeXN0ZW0sIGFzeW5jIH0iLCJtZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5cbiMgQ3VycmVudGx5IGxvZ2dlZC1pbiB1c2VyLlxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kZWxcblxuICAnbmFtZSc6ICdtb2RlbHMvdXNlcidcblxuICAjIERlZmF1bHQgdG8gYSBsb2NhbCB1c2VyLlxuICAnZGF0YSc6XG4gICAgJ3Byb3ZpZGVyJzogIFwibG9jYWxcIlxuICAgICdpZCc6ICAgICAgICBcIjBcIlxuICAgICd1aWQnOiAgICAgICBcImxvY2FsOjBcIlxuICAgICd0b2tlbic6ICAgICBudWxsIiwieyBkMyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGhvcml6b250YWw6IChoZWlnaHQsIHgpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh4KVxuICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxuICAgICAgIyBTaG93IHZlcnRpY2FsIGxpbmVzLi4uXG4gICAgICAudGlja1NpemUoLWhlaWdodClcbiAgICAgICMgLi4ud2l0aCBkYXkgb2YgdGhlIG1vbnRoLi4uXG4gICAgICAudGlja0Zvcm1hdCggKGQpIC0+IGQuZ2V0RGF0ZSgpIClcbiAgICAgICMgLi4uYW5kIGdpdmUgdXMgYSBzcGFjZXIuXG4gICAgICAudGlja1BhZGRpbmcoMTApXG5cbiAgdmVydGljYWw6ICh3aWR0aCwgeSkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHkpXG4gICAgICAub3JpZW50KFwibGVmdFwiKVxuICAgICAgLnRpY2tTaXplKC13aWR0aClcbiAgICAgIC50aWNrcyg1KVxuICAgICAgLnRpY2tQYWRkaW5nKDEwKSIsInsgXywgZDMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEEgZ3JhcGggb2YgY2xvc2VkIGlzc3Vlcy5cbiAgIyBgaXNzdWVzYDogICAgIGlzc3VlcyBsaXN0XG4gICMgYGNyZWF0ZWRfYXRgOiBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGB0b3RhbGA6ICAgIHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBhY3R1YWw6IChpc3N1ZXMsIGNyZWF0ZWRfYXQsIHRvdGFsKSAtPlxuICAgIGhlYWQgPSBbIHtcbiAgICAgICdkYXRlJzogbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICAgJ3BvaW50cyc6IHRvdGFsXG4gICAgfSBdXG4gICAgXG4gICAgbWluID0gK0luZmluaXR5IDsgbWF4ID0gLUluZmluaXR5XG5cbiAgICAjIEdlbmVyYXRlIHRoZSBhY3R1YWwgY2xvc2VzLlxuICAgIHJlc3QgPSBfLm1hcCBpc3N1ZXMsIChpc3N1ZSkgLT5cbiAgICAgIHsgc2l6ZSwgY2xvc2VkX2F0IH0gPSBpc3N1ZVxuICAgICAgIyBEZXRlcm1pbmUgdGhlIHJhbmdlLlxuICAgICAgbWluID0gc2l6ZSBpZiBzaXplIDwgbWluXG4gICAgICBtYXggPSBzaXplIGlmIHNpemUgPiBtYXhcblxuICAgICAgIyBEcm9wcGluZyBwb2ludHMgcmVtYWluaW5nLlxuICAgICAgaXNzdWUuZGF0ZSA9IG5ldyBEYXRlIGNsb3NlZF9hdFxuICAgICAgaXNzdWUucG9pbnRzID0gdG90YWwgLT0gc2l6ZVxuICAgICAgaXNzdWVcbiAgICBcbiAgICAjIE5vdyBhZGQgYSByYWRpdXMgaW4gYSByYW5nZSAod2lsbCBiZSB1c2VkIGZvciBhIGNpcmNsZSkuXG4gICAgcmFuZ2UgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oWyBtaW4sIG1heCBdKS5yYW5nZShbIDUsIDggXSlcblxuICAgIHJlc3QgPSBfLm1hcCByZXN0LCAoaXNzdWUpIC0+XG4gICAgICBpc3N1ZS5yYWRpdXMgPSByYW5nZSBpc3N1ZS5zaXplXG4gICAgICBpc3N1ZVxuXG4gICAgW10uY29uY2F0IGhlYWQsIHJlc3RcblxuICAjIEEgZ3JhcGggb2YgYW4gaWRlYWwgcHJvZ3Jlc3Npb24uLlxuICAjIGBhYDogICBtaWxlc3RvbmUgc3RhcnQgZGF0ZVxuICAjIGBiYDogICBtaWxlc3RvbmUgZW5kIGRhdGVcbiAgIyBgdG90YWxgOiB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgaWRlYWw6IChhLCBiLCB0b3RhbCkgLT5cbiAgICAjIFN3YXA/XG4gICAgWyBiLCBhIF0gPSBbIGEsIGIgXSBpZiBiIDwgYVxuXG4gICAgIyBXZSBzdGFydCBoZXJlIGFkZGluZyBkYXlzIHRvIGBkYC5cbiAgICBbIHksIG0sIGQgXSA9IF8ubWFwIGEubWF0Y2goY29uZmlnLmRhdGEuY2hhcnQuZGF0ZXRpbWUpWzFdLnNwbGl0KCctJyksICh2KSAtPiBwYXJzZUludCB2XG4gICAgIyBXZSB3YW50IHRvIGVuZCBoZXJlLlxuICAgIGN1dG9mZiA9IG5ldyBEYXRlKGIpXG5cbiAgICAjIEdvIHRocm91Z2ggdGhlIGJlZ2lubmluZyB0byB0aGUgZW5kIHNraXBwaW5nIG9mZiBkYXlzLlxuICAgIGRheXMgPSBbXSA7IGxlbmd0aCA9IDBcbiAgICBkbyBvbmNlID0gKGluYyA9IDApIC0+XG4gICAgICAjIEEgbmV3IGRheS5cbiAgICAgIGRheSA9IG5ldyBEYXRlIHksIG0gLSAxLCBkICsgaW5jXG4gICAgICBcbiAgICAgICMgRG9lcyB0aGlzIGRheSBjb3VudD9cbiAgICAgIGRheV9vZiA9IDcgaWYgIWRheV9vZiA9IGRheS5nZXREYXkoKVxuICAgICAgaWYgZGF5X29mIGluIGNvbmZpZy5kYXRhLmNoYXJ0Lm9mZl9kYXlzXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSwgb2ZmX2RheTogeWVzIH1cbiAgICAgIGVsc2VcbiAgICAgICAgbGVuZ3RoICs9IDFcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5IH1cbiAgICAgIFxuICAgICAgIyBHbyBhZ2Fpbj9cbiAgICAgIG9uY2UoaW5jICsgMSkgdW5sZXNzIGRheSA+IGN1dG9mZlxuXG4gICAgIyBNYXAgcG9pbnRzIG9uIHRoZSBhcnJheSBvZiBkYXlzIG5vdy5cbiAgICB2ZWxvY2l0eSA9IHRvdGFsIC8gKGxlbmd0aCAtIDEpXG5cbiAgICBkYXlzID0gXy5tYXAgZGF5cywgKGRheSwgaSkgLT5cbiAgICAgIGRheS5wb2ludHMgPSB0b3RhbFxuICAgICAgdG90YWwgLT0gdmVsb2NpdHkgaWYgZGF5c1tpXSBhbmQgbm90IGRheXNbaV0ub2ZmX2RheVxuICAgICAgZGF5XG5cbiAgICAjIERvIHdlIG5lZWQgdG8gbWFrZSBhIGxpbmsgdG8gcmlnaHQgbm93P1xuICAgIGRheXMucHVzaCB7IGRhdGU6IG5vdywgcG9pbnRzOiAwIH0gaWYgKG5vdyA9IG5ldyBEYXRlKCkpID4gY3V0b2ZmXG5cbiAgICBkYXlzXG5cbiAgIyBHcmFwaCByZXByZXNlbnRpbmcgYSB0cmVuZGxpbmcgb2YgYWN0dWFsIGlzc3Vlcy5cbiAgdHJlbmQ6IChhY3R1YWwsIGNyZWF0ZWRfYXQsIGR1ZV9vbikgLT5cbiAgICByZXR1cm4gW10gdW5sZXNzIGFjdHVhbC5sZW5ndGhcblxuICAgIHN0YXJ0ID0gK2FjdHVhbFswXS5kYXRlXG5cbiAgICAjIFZhbHVlcyBpcyBhIGxpc3Qgb2YgdGltZSBmcm9tIHRoZSBzdGFydCBhbmQgcG9pbnRzIHJlbWFpbmluZy5cbiAgICB2YWx1ZXMgPSBfLm1hcCBhY3R1YWwsICh7IGRhdGUsIHBvaW50cyB9KSAtPlxuICAgICAgWyArZGF0ZSAtIHN0YXJ0LCBwb2ludHMgXVxuXG4gICAgIyBOb3cgaXMgYW4gYWN0dWFsIHBvaW50IHRvby5cbiAgICBsYXN0ID0gYWN0dWFsW2FjdHVhbC5sZW5ndGggLSAxXVxuICAgIHZhbHVlcy5wdXNoIFsgKyBuZXcgRGF0ZSgpIC0gc3RhcnQsIGxhc3QucG9pbnRzIF1cblxuICAgICMgaHR0cDovL2NsYXNzcm9vbS5zeW5vbnltLmNvbS9jYWxjdWxhdGUtdHJlbmRsaW5lLTI3MDkuaHRtbFxuICAgIGIxID0gMCA7IGUgPSAwIDsgYzEgPSAwXG4gICAgYSA9IChsID0gdmFsdWVzLmxlbmd0aCkgKiBfLnJlZHVjZSh2YWx1ZXMsIChzdW0sIFsgYSwgYiBdKSAtPlxuICAgICAgYjEgKz0gYSA7IGUgKz0gYlxuICAgICAgYzEgKz0gTWF0aC5wb3coYSwgMilcbiAgICAgIHN1bSArIChhICogYilcbiAgICAsIDApXG5cbiAgICBzbG9wZSA9IChhIC0gKGIxICogZSkpIC8gKChsICogYzEpIC0gKE1hdGgucG93KGIxLCAyKSkpXG4gICAgaW50ZXJjZXB0ID0gKGUgLSAoc2xvcGUgKiBiMSkpIC8gbFxuICAgIGZuID0gKHgpIC0+IHNsb3BlICogeCArIGludGVyY2VwdFxuXG4gICAgIyBNaWxlc3RvbmUgYWx3YXlzIGhhcyBhIGNyZWF0aW9uIGRhdGUuXG4gICAgY3JlYXRlZF9hdCA9IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAjIER1ZSBkYXRlIGNhbiBiZSBlbXB0eS5cbiAgICBkdWVfb24gPSBpZiBkdWVfb24gdGhlbiBuZXcgRGF0ZShkdWVfb24pIGVsc2UgbmV3IERhdGUoKVxuXG4gICAgYSA9IGNyZWF0ZWRfYXQgLSBzdGFydFxuICAgIGIgPSBkdWVfb24gLSBzdGFydFxuXG4gICAgW1xuICAgICAge1xuICAgICAgICAnZGF0ZSc6IGNyZWF0ZWRfYXRcbiAgICAgICAgJ3BvaW50cyc6IGZuKGEpXG4gICAgICB9LCB7XG4gICAgICAgICdkYXRlJzogZHVlX29uXG4gICAgICAgICdwb2ludHMnOiBmbihiKVxuICAgICAgfVxuICAgIF0iLCJ7IF8sIGFzeW5jIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG4jIS91c3IvYmluL2VudiBjb2ZmZWVcbmNvbmZpZyAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBpc3N1ZXMgZm9yIGEgbWlsZXN0b25lLlxuICBmZXRjaEFsbDogKHJlcG8sIGNiKSAtPlxuICAgICMgQ2FsY3VsYXRlIHNpemUgb2YgZWl0aGVyIG9wZW4gb3IgY2xvc2VkIGlzc3Vlcy5cbiAgICAjIE1vZGlmaWVzIGlzc3VlcyBieSByZWYuXG4gICAgY2FsY1NpemUgPSAobGlzdCwgY2IpIC0+XG4gICAgICBzd2l0Y2ggY29uZmlnLmRhdGEuY2hhcnQucG9pbnRzXG4gICAgICAgIHdoZW4gJ09ORV9TSVpFJ1xuICAgICAgICAgIHNpemUgPSBsaXN0Lmxlbmd0aFxuXG4gICAgICAgICAgKCBpc3N1ZS5zaXplID0gMSBmb3IgaXNzdWUgaW4gbGlzdCApXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuICAgICAgICBcbiAgICAgICAgd2hlbiAnTEFCRUxTJ1xuICAgICAgICAgIHNpemUgPSAwXG5cbiAgICAgICAgICBsaXN0ID0gXy5maWx0ZXIgbGlzdCwgKGlzc3VlKSAtPlxuICAgICAgICAgICAgIyBTa2lwIGlmIG5vIGxhYmVscyBleGlzdC5cbiAgICAgICAgICAgIHJldHVybiBubyB1bmxlc3MgbGFiZWxzID0gaXNzdWUubGFiZWxzXG5cbiAgICAgICAgICAgICMgRGV0ZXJtaW5lIHRoZSB0b3RhbCBpc3N1ZSBzaXplIGZyb20gYWxsIGxhYmVscy5cbiAgICAgICAgICAgIGlzc3VlLnNpemUgPSBfLnJlZHVjZSBsYWJlbHMsIChzdW0sIGxhYmVsKSAtPlxuICAgICAgICAgICAgICAjIE5vdCBtYXRjaGluZy5cbiAgICAgICAgICAgICAgcmV0dXJuIHN1bSB1bmxlc3MgbWF0Y2hlcyA9IGxhYmVsLm5hbWUubWF0Y2ggY29uZmlnLmRhdGEuY2hhcnQuc2l6ZV9sYWJlbFxuICAgICAgICAgICAgICAjIEluY3JlYXNlIHN1bS5cbiAgICAgICAgICAgICAgc3VtICs9IHBhcnNlSW50IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEluY3JlYXNlIHRoZSB0b3RhbC5cbiAgICAgICAgICAgIHNpemUgKz0gaXNzdWUuc2l6ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIEFyZSB3ZSBzYXZpbmcgaXQ/XG4gICAgICAgICAgICAhIWlzc3VlLnNpemVcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG5cbiAgICAjIEZvciBlYWNoIHN0YXRlLi4uXG4gICAgb25lU3RhdHVzID0gKHN0YXRlLCBjYikgLT5cbiAgICAgICMgQ29uY2F0IHRoZW0gaGVyZS5cbiAgICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgICAjIE9uZSBwYWdlZnVsIGZldGNoIChuZXh0IHBhZ2VzIGluIHNlcmllcykuXG4gICAgICBkbyBmZXRjaFBhZ2UgPSAocGFnZT0xKSAtPlxuICAgICAgICByZXF1ZXN0LmFsbElzc3VlcyByZXBvLCB7IHN0YXRlLCBwYWdlIH0sIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgIyBFcnJvcnM/XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICAjIEVtcHR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICAgICAgICMgQ29uY2F0IHNvcnRlZCAoYXBpIGRvZXMgbm90IHNvcnQgb24gY2xvc2VkX2F0ISkuXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IF8uc29ydEJ5IGRhdGEsICdjbG9zZWRfYXQnXG4gICAgICAgICAgIyA8IDEwMCByZXN1bHRzP1xuICAgICAgICAgIHJldHVybiBjYiBudWxsLCByZXN1bHRzIGlmIGRhdGEubGVuZ3RoIDwgMTAwXG4gICAgICAgICAgIyBGZXRjaCB0aGUgbmV4dCBwYWdlIHRoZW4uXG4gICAgICAgICAgZmV0Y2hQYWdlIHBhZ2UgKyAxXG5cbiAgICAjIEZvciBlYWNoIGBvcGVuYCBhbmQgYGNsb3NlZGAgaXNzdWVzIGluIHBhcmFsbGVsLlxuICAgIGFzeW5jLnBhcmFsbGVsIFtcbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ29wZW4nKSwgICBjYWxjU2l6ZSBdXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdjbG9zZWQnKSwgY2FsY1NpemUgXVxuICAgIF0sIChlcnIsIFsgb3BlbiwgY2xvc2VkIF0pIC0+XG4gICAgICBjYiBlcnIsIHsgb3BlbiwgY2xvc2VkIH0iLCIjIS91c3IvYmluL2VudiBjb2ZmZWVcbnJlcXVlc3QgPSByZXF1aXJlICcuL3JlcXVlc3QuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBGZXRjaCBhIG1pbGVzdG9uZS5cbiAgJ2ZldGNoJzogcmVxdWVzdC5vbmVNaWxlc3RvbmVcblxuICAjIEZldGNoIGFsbCBtaWxlc3RvbmVzLlxuICAnZmV0Y2hBbGwnOiByZXF1ZXN0LmFsbE1pbGVzdG9uZXNcblxuICAgICMgIyBHZXQgdGhlIGN1cnJlbnQgbWlsZXN0b25lIG91dCBvZiBtYW55LlxuICAgICMgZWxzZVxuICAgICMgICByZXF1ZXN0LmFsbE1pbGVzdG9uZXMgcmVwbywgKGVyciwgZGF0YSkgLT5cbiAgICAjICAgICAjIEVycm9ycz9cbiAgICAjICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICMgICAgICMgRW1wdHkgd2FybmluZz9cbiAgICAjICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBvcGVuIG1pbGVzdG9uZXMgZm9yIHJlcG8gI3tyZXBvLnBhdGh9XCIgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC5cbiAgICAjICAgICBtID0gZGF0YVswXVxuICAgICMgICAgICMgRmlsdGVyIG1pbGVzdG9uZXMgd2l0aG91dCBkdWUgZGF0ZS5cbiAgICAjICAgICBtID0gXy5yZXN0IGRhdGEsIHsgJ2R1ZV9vbicgOiBudWxsIH1cbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LiBQcmVmZXIgbWlsZXN0b25lcyB3aXRoIGR1ZSBkYXRlcy5cbiAgICAjICAgICBtID0gaWYgbVswXSB0aGVuIG1bMF0gZWxzZSBkYXRhWzBdXG4gICAgIyAgICAgIyBFbXB0eSBtaWxlc3RvbmU/XG4gICAgIyAgICAgaWYgbS5vcGVuX2lzc3VlcyArIG0uY2xvc2VkX2lzc3VlcyBpcyAwXG4gICAgIyAgICAgICByZXR1cm4gY2IgbnVsbCwgXCJObyBpc3N1ZXMgZm9yIG1pbGVzdG9uZSBgI3ttLnRpdGxlfWBcIlxuXG4gICAgIyAgICAgY2IgbnVsbCwgbnVsbCwgbSIsInsgXywgU3VwZXJBZ2VudCB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxudXNlciA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy91c2VyLmNvZmZlZSdcblxuIyBDdXN0b20gSlNPTiBwYXJzZXIuXG5TdXBlckFnZW50LnBhcnNlID1cbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiAocmVzKSAtPlxuICAgIHRyeVxuICAgICAgSlNPTi5wYXJzZSByZXNcbiAgICBjYXRjaCBlXG4gICAgICB7fSAjIGl0IHdhcyBub3QgdG8gYmUuLi5cblxuIyBEZWZhdWx0IGFyZ3MuXG5kZWZhdWx0cyA9XG4gICdnaXRodWInOlxuICAgICdob3N0JzogJ2FwaS5naXRodWIuY29tJ1xuICAgICdwcm90b2NvbCc6ICdodHRwcydcblxuIyBQdWJsaWMgYXBpLlxubW9kdWxlLmV4cG9ydHMgPVxuICBcbiAgIyBHZXQgYSByZXBvLlxuICByZXBvOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfVwiXG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIG9wZW4gbWlsZXN0b25lcy5cbiAgYWxsTWlsZXN0b25lczogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+IFxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXNcIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcbiAgXG4gICMgR2V0IG9uZSBvcGVuIG1pbGVzdG9uZS5cbiAgb25lTWlsZXN0b25lOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lcy8je21pbGVzdG9uZX1cIlxuICAgICAgICAncXVlcnknOiAgeyAnc3RhdGUnOiAnb3BlbicsICdzb3J0JzogJ2R1ZV9kYXRlJywgJ2RpcmVjdGlvbic6ICdhc2MnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgaXNzdWVzIGZvciBhIHN0YXRlLlxuICBhbGxJc3N1ZXM6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgcXVlcnksIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vaXNzdWVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIF8uZXh0ZW5kIHF1ZXJ5LCB7IG1pbGVzdG9uZSwgJ3Blcl9wYWdlJzogJzEwMCcgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4jIE1ha2UgYSByZXF1ZXN0IHVzaW5nIFN1cGVyQWdlbnQuXG5yZXF1ZXN0ID0gKHsgcHJvdG9jb2wsIGhvc3QsIHBhdGgsIHF1ZXJ5LCBoZWFkZXJzIH0sIGNiKSAtPlxuICBleGl0ZWQgPSBub1xuXG4gICMgTWFrZSB0aGUgcXVlcnkgcGFyYW1zLlxuICBxID0gaWYgcXVlcnkgdGhlbiAnPycgKyAoIFwiI3trfT0je3Z9XCIgZm9yIGssIHYgb2YgcXVlcnkgKS5qb2luKCcmJykgZWxzZSAnJ1xuXG4gICMgVGhlIFVSSS5cbiAgcmVxID0gU3VwZXJBZ2VudC5nZXQoXCIje3Byb3RvY29sfTovLyN7aG9zdH0je3BhdGh9I3txfVwiKVxuICAjIEFkZCBoZWFkZXJzLlxuICAoIHJlcS5zZXQoaywgdikgZm9yIGssIHYgb2YgaGVhZGVycyApXG4gIFxuICAjIFRpbWVvdXQgZm9yIHJlcXVlc3RzIHRoYXQgZG8gbm90IGZpbmlzaC4uLiBzZWUgIzMyLlxuICB0aW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNiICdSZXF1ZXN0IGhhcyB0aW1lZCBvdXQnXG4gICwgMWU0ICMgZ2l2ZSB1cyAxMHNcblxuICAjIFNlbmQuXG4gIHJlcS5lbmQgKGVyciwgZGF0YSkgLT5cbiAgICAjIEFycml2ZWQgdG9vIGxhdGUuXG4gICAgcmV0dXJuIGlmIGV4aXRlZFxuICAgICMgQWxsIGZpbmUuXG4gICAgZXhpdGVkID0geWVzXG4gICAgY2xlYXJUaW1lb3V0IHRpbWVvdXRcbiAgICAjIEFjdHVhbGx5IHByb2Nlc3MgdGhlIHJlc3BvbnNlLlxuICAgIHJlc3BvbnNlIGVyciwgZGF0YSwgY2JcblxuIyBIb3cgZG8gd2UgcmVzcG9uZCB0byBhIHJlc3BvbnNlP1xucmVzcG9uc2UgPSAoZXJyLCBkYXRhLCBjYikgLT5cbiAgcmV0dXJuIGNiIGVycm9yIGVyciBpZiBlcnJcbiAgIyAyeHg/XG4gIGlmIGRhdGEuc3RhdHVzVHlwZSBpc250IDJcbiAgICAjIERvIHdlIGhhdmUgYSBtZXNzYWdlIGZyb20gR2l0SHViP1xuICAgIHJldHVybiBjYiBkYXRhLmJvZHkubWVzc2FnZSBpZiBkYXRhPy5ib2R5Py5tZXNzYWdlP1xuICAgICMgVXNlIFNBIG9uZS5cbiAgICByZXR1cm4gY2IgZGF0YS5lcnJvci5tZXNzYWdlXG4gICMgQWxsIGdvb2QuXG4gIGNiIG51bGwsIGRhdGEuYm9keVxuXG4jIEdpdmUgdXMgaGVhZGVycy5cbmhlYWRlcnMgPSAodG9rZW4pIC0+XG4gICMgVGhlIGRlZmF1bHRzLlxuICBoID1cbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzJ1xuICAjIEFkZCB0b2tlbj9cbiAgaC5BdXRob3JpemF0aW9uID0gXCJ0b2tlbiAje3Rva2VufVwiIGlmIHRva2VuP1xuICBoXG5cbmlzVmFsaWQgPSAob2JqKSAtPlxuICBydWxlcyA9XG4gICAgJ293bmVyJzogICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbmFtZSc6ICAgICAgKHZhbCkgLT4gdmFsP1xuICAgICdtaWxlc3RvbmUnOiAodmFsKSAtPiBfLmlzSW50IHZhbFxuICBcbiAgKCByZXR1cm4gbm8gZm9yIGtleSwgdmFsIG9mIG9iaiB3aGVuIGtleSBvZiBydWxlcyBhbmQgbm90IHJ1bGVzW2tleV0odmFsKSApXG5cbiAgeWVzXG5cbiMgU3dpdGNoIHdoZW4gdXNlciBpcyByZWFkeS5cbmlzUmVhZHkgPSB1c2VyLmRhdGEucmVhZHlcblxuIyBBIHN0YWNrIG9mIHJlcXVlc3RzIHRvIGV4ZWN1dGUgb25jZSByZWFkeS5cbnN0YWNrID0gW11cbnJlYWR5ID0gKGNiKSAtPlxuICBpZiBpc1JlYWR5IHRoZW4gZG8gY2IgZWxzZSBzdGFjay5wdXNoIGNiXG5cbiMgT2JzZXJ2ZSB1c2VyJ3MgcmVhZGluZXNzLlxudXNlci5vYnNlcnZlICdyZWFkeScsICh2YWwpIC0+XG4gIGlzUmVhZHkgPSB2YWxcbiAgIyBDbGVhciB0aGUgc3RhY2s/XG4gICggZG8gc3RhY2suc2hpZnQoKSB3aGlsZSBzdGFjay5sZW5ndGggKSBpZiB2YWxcblxuIyBQYXJzZSBhbiBlcnJvci5cbmVycm9yID0gKGVycikgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBfLmlzU3RyaW5nIGVyclxuICAgICAgbWVzc2FnZSA9IGVyclxuICAgIHdoZW4gXy5pc0FycmF5IGVyclxuICAgICAgbWVzc2FnZSA9IGVyclsxXVxuICAgIHdoZW4gXy5pc09iamVjdChlcnIpIGFuZCBfLmlzU3RyaW5nKGVyci5tZXNzYWdlKVxuICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG5cbiAgdW5sZXNzIG1lc3NhZ2VcbiAgICB0cnlcbiAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSBlcnJcbiAgICBjYXRjaFxuICAgICAgbWVzc2FnZSA9IGRvIGVyci50b1N0cmluZ1xuXG4gIG1lc3NhZ2UiLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuTWVkaWF0b3IgPSBSYWN0aXZlLmV4dGVuZCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNZWRpYXRvcigpIiwieyBfLCBkaXJlY3RvciB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4vbWVkaWF0b3IuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcblxuZWwgPSAnI3BhZ2UnXG5cbnBhZ2VzID1cbiAgXCJpbmRleFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvaW5kZXguY29mZmVlXCJcbiAgXCJtaWxlc3RvbmVcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL21pbGVzdG9uZS5jb2ZmZWVcIlxuICBcIm5ld1wiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbmV3LmNvZmZlZVwiXG4gIFwicHJvamVjdFwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvcHJvamVjdC5jb2ZmZWVcIlxuXG4jIEFkZCBhIHByb2plY3QgZnJvbSBhIHJvdXRlLlxuYWRkUHJvamVjdCA9IChwYWdlLCBvd25lciwgbmFtZSkgLT5cbiAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2FkZCcsIHsgb3duZXIsIG5hbWUgfVxuXG4jIFByZWFwcGx5IGFsbCBmdW5jdGlvbnMgd2l0aCBvdXIgcGFnZSBuYW1lL2NvbnRleHQuXG5jID0gKG5hbWUsIGZucz1bXSkgLT5cbiAgKCBfLnBhcnRpYWwgZm4sIG5hbWUgZm9yIGZuIGluIGZucyApXG5cbnZpZXcgPSBudWxsXG5yb3V0ZSA9IChwYWdlLCBhcmdzLi4uKSAtPlxuICAjIFVucmVuZGVyIHRoZSBwcmV2aW91cyBvbmUuXG4gIGRvIHZpZXc/LnRlYXJkb3duXG4gICMgSGlkZSBhbnkgbm90aWZpY2F0aW9ucy5cbiAgbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnkvaGlkZSdcbiAgIyBSZXF1aXJlIHRoZSBuZXcgb25lLlxuICBQYWdlID0gcGFnZXNbcGFnZV1cbiAgIyBSZW5kZXIgaXQuXG4gIHZpZXcgPSBuZXcgUGFnZSB7IGVsLCAnZGF0YSc6IHsgJ3JvdXRlJzogYXJncyB9IH1cblxucm91dGVzID1cbiAgJy8nOiAgICAgICAgICAgICAgICAgICAgICAgIGMgJ2luZGV4JywgWyByb3V0ZSBdXG4gICcvbmV3L3Byb2plY3QnOiAgICAgICAgICAgICBjICduZXcnLCAgIFsgcm91dGUgXVxuICAjIFRoZSBmb2xsb3dpbmcgdHdvIHJvdXRlcyBhZGQgYSBwcm9qZWN0IGluIHRoZSBiYWNrZ3JvdW5kLlxuICAnLzpvd25lci86bmFtZSc6ICAgICAgICAgICAgYyAncHJvamVjdCcsICAgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICcvOm93bmVyLzpuYW1lLzptaWxlc3RvbmUnOiBjICdtaWxlc3RvbmUnLCBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgIyBUT0RPOiByZW1vdmUgaW4gcHJvZHVjdGlvbi5cbiAgJy9yZXNldCc6IC0+XG4gICAgbWVkaWF0b3IuZmlyZSAnIXByb2plY3RzL2NsZWFyJ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiMgRmxhdGlyb24gRGlyZWN0b3Igcm91dGVyLlxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3Rvci5Sb3V0ZXIocm91dGVzKS5jb25maWd1cmVcbiAgJ3N0cmljdCc6IG5vICMgYWxsb3cgdHJhaWxpbmcgc2xhc2hlc1xuICBub3Rmb3VuZDogLT5cbiAgICB0aHJvdyA0MDQiLCJ7IG1vbWVudCB9ICA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxuIyBQcm9ncmVzcyBpbiAlLlxucHJvZ3Jlc3MgPSAoYSwgYikgLT4gMTAwICogKGEgLyAoYiArIGEpKVxuXG4jIENhbGN1bGF0ZSB0aGUgc3RhdHMgZm9yIGEgbWlsZXN0b25lLlxuIyAgSXMgaXQgb24gdGltZT8gV2hhdCBpcyB0aGUgcHJvZ3Jlc3M/XG5tb2R1bGUuZXhwb3J0cyA9IChtaWxlc3RvbmUpIC0+XG4gICAgIyBQcm9ncmVzcyBpbiBwb2ludHMuXG4gICAgcG9pbnRzID0gcHJvZ3Jlc3MgbWlsZXN0b25lLmlzc3Vlcy5jbG9zZWQuc2l6ZSwgbWlsZXN0b25lLmlzc3Vlcy5vcGVuLnNpemUgICAgXG4gICAgXG4gICAgIyBNaWxlc3RvbmVzIHdpdGggbm8gZHVlIGRhdGUgYXJlIGFsd2F5cyBvbiB0cmFjay5cbiAgICByZXR1cm4geyAnaXNPblRpbWUnOiB5ZXMsICdwcm9ncmVzcyc6IHsgcG9pbnRzIH0gfSB1bmxlc3MgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgYSA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuY3JlYXRlZF9hdFxuICAgIGIgPSArbmV3IERhdGVcbiAgICBjID0gK25ldyBEYXRlIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgUHJvZ3Jlc3MgaW4gdGltZS5cbiAgICB0aW1lID0gcHJvZ3Jlc3MgYiAtIGEsIGMgLSBiXG5cbiAgICAjIEhvdyBtYW55IGRheXMgaXMgMSUgb2YgdGhlIHRpbWU/XG4gICAgZGF5cyA9IChtb21lbnQoYSkuZGlmZihtb21lbnQoYiksICdkYXlzJykpIC8gMTAwXG5cbiAgICB7XG4gICAgICAnaXNPblRpbWUnOiBwb2ludHMgPiB0aW1lXG4gICAgICAncHJvZ3Jlc3MnOiB7IHBvaW50cywgdGltZSB9XG4gICAgICAnZGF5cyc6ICAgICBkYXlzXG4gICAgfSIsIiMgQWxsIG91ciB2ZW5kb3IgZGVwZW5kZW5jaWVzIGluIG9uZSBwbGFjZS5cbm1vZHVsZS5leHBvcnRzID1cbiAgJ18nOiB3aW5kb3cuX1xuICAnUmFjdGl2ZSc6IHdpbmRvdy5SYWN0aXZlXG4gICdGaXJlYmFzZSc6IHdpbmRvdy5GaXJlYmFzZVxuICAnRmlyZWJhc2VTaW1wbGVMb2dpbic6IHdpbmRvdy5GaXJlYmFzZVNpbXBsZUxvZ2luXG4gICdTdXBlckFnZW50Jzogd2luZG93LnN1cGVyYWdlbnRcbiAgJ2FzeW5jJzogd2luZG93LmFzeW5jXG4gICdtb21lbnQnOiB3aW5kb3cubW9tZW50XG4gICdkMyc6IHdpbmRvdy5kM1xuICAnbWFya2VkJzogd2luZG93Lm1hcmtlZFxuICAnZGlyZWN0b3InOlxuICAgICdSb3V0ZXInOiB3aW5kb3cuUm91dGVyXG4gICdsc2NhY2hlJzogd2luZG93LmxzY2FjaGVcbiAgJ3NvcnRlZEluZGV4Q21wJzogd2luZG93LnNvcnRlZEluZGV4IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFwcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJOb3RpZnlcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJIZWFkZXJcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicGFnZVwifSxcImZcIjpbXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOltcIiZjb3B5OyAyMDEyLTIwMTQgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiaHR0cDovL2Nsb3VkZmkucmVcIn0sXCJmXCI6W1wiQ2xvdWRmaXJlIFN5c3RlbXNcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY2hhcnRcIn19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVhZFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTMsXCJyXCI6XCJ1c2VyXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicmlnaHRcIn0sXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcImRpc3BsYXlOYW1lXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwiZGlzcGxheU5hbWVcIn0sXCIgbG9nZ2VkIGluXCJdfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcImdpdGh1YlwifSxcInZcIjp7XCJjbGlja1wiOlwiIWxvZ2luXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiZ2l0aHViXCJ9fSxcIiBTaWduIEluXCJdfV0sXCJyXCI6XCJkaXNwbGF5TmFtZVwifV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJpZFwiOlwiaWNvblwiLFwiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ1bFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIGEgUHJvamVjdFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJmYXFcIn0sXCJmXCI6W1wiRkFRXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI3Jlc2V0XCJ9LFwiZlwiOltcIkRCIFJlc2V0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25vdGlmeVwifSxcImZcIjpbXCJOb3RpZnlcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVyb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY29udGVudFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImFkZHJlc3NcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJTZWUgeW91ciBwcm9qZWN0IHByb2dyZXNzXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJOb3Qgc3VyZSB3aGVyZSB0byBzdGFydD8gSnVzdCBhZGQgYSBkZW1vIHJlcG8gdG8gc2VlIGEgY2hhcnQuIFRoZXJlIGFyZSBtYW55IHZhcmlhdGlvbnMgb2YgcGFzc2FnZXMgb2YgTG9yZW0gSXBzdW0gYXZhaWxhYmxlLCBidXQgdGhlIG1ham9yaXR5IGhhdmUgc3VmZmVyZWQgYWx0ZXJhdGlvbiBpbiBzb21lIGZvcm0sIGJ5IGluamVjdGVkIGh1bW91ciwgb3IgcmFuZG9taXNlZCB3b3JkcyB3aGljaCBkb24ndCBsb29rIGV2ZW4gc2xpZ2h0bHkgYmVsaWV2YWJsZS5cIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImN0YVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwicHJpbWFyeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIHlvdXIgcHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNlY29uZGFyeVwifSxcImZcIjpbXCJSZWFkIHRoZSBHdWlkZVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcImNvZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpY29uIFwiLHtcInRcIjoyLFwiclwiOlwiaWNvblwifV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiY29kZVwiXSxcInNcIjpcIlxcXCImI1xcXCIrXzArXFxcIjtcXFwiXCJ9fV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInRleHRcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJzeXN0ZW1cIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn0sXCIgc3lzdGVtXCJdLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJyXCI6XCJ0b3BcIn0sXCIlXCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9XSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJ0b3BcIl0sXCJzXCI6XCItXzBcIn19LFwicHhcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiY2xvc2VcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcImNsb3NlXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dLFwiclwiOlwic3lzdGVtXCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiUHJvamVjdHNcIixcImFcIjp7XCJwcm9qZWN0c1wiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RzXCJ9XX19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkhlcm9cIn1dLFwiclwiOlwicHJvamVjdHMubGlzdFwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS50aXRsZVwiXSxcInNcIjpcIl8wLnRpdGxlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwic3ViXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImFcIjp7XCJjbGFzc1wiOlwiZGVzY3JpcHRpb25cIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kZXNjcmlwdGlvblwiXSxcInNcIjpcIl8wLm1hcmtkb3duKF8xKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiQ2hhcnRcIixcImFcIjp7XCJtaWxlc3RvbmVcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmVcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJBZGQgYSBQcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJUeXBlIGluIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IGFzIHlvdSB3b3VsZCBub3JtYWxseS4gSWYgeW91J2QgbGlrZSB0byBhZGQgYSBwcml2YXRlIEdpdEh1YiBwcm9qZWN0LCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOltcIlNpZ24gSW5cIl19LFwiIGZpcnN0LlwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb3JtXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImlucHV0XCIsXCJhXCI6e1widHlwZVwiOlwidGV4dFwiLFwicGxhY2Vob2xkZXJcIjpcInVzZXIvcmVwb1wiLFwiYXV0b2NvbXBsZXRlXCI6XCJvZmZcIixcInZhbHVlXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfSxcInZcIjp7XCJrZXl1cFwiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJ2XCI6e1wiY2xpY2tcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fSxcImZcIjpbXCJBZGRcIl19XX1dfV19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJyb3V0ZVwiXSxcInNcIjpcIl8wLmpvaW4oXFxcIi9cXFwiKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTWlsZXN0b25lc1wiLFwiYVwiOntcInByb2plY3RcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0XCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNvcnRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJzb3J0LWFscGhhYmV0XCJ9fSxcIiBTb3J0ZWQgYnkgcHJpb3JpdHlcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJNaWxlc3RvbmVzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0Lm1pbGVzdG9uZXNcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcInN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJkdWVcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcImR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJzdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcInN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJjb2dcIn19LFwiIEVkaXRcIl19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInByb2plY3RzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJzb3J0XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IHByaW9yaXR5XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiUHJvamVjdHNcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmluZGV4XCIsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCIuXCJdLFwic1wiOlwie2luZGV4Ol8wfVwifSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjBcIixcInByb2plY3RzLmxpc3RcIl0sXCJzXCI6XCJ7cHJvamVjdDpfMVtfMF19XCJ9LFwiZlwiOlt7XCJ0XCI6NCxcIm5cIjo1MyxcInJcIjpcInByb2plY3RcIixcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJlcnJvcnNcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wiY29sc3BhblwiOlwiM1wiLFwiY2xhc3NcIjpcInJlcG9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIn0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJlcnJvclwiLFwidGl0bGVcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcImVycm9yc1wiXSxcInNcIjpcIl8wLmpvaW4oXFxcIlxcXFxuXFxcIilcIn19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJhdHRlbnRpb25cIn19XX1dfV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjQsXCJ4XCI6e1wiclwiOltcImluZGV4LjFcIixcInByb2plY3QubWlsZXN0b25lc1wiXSxcInNcIjpcInttaWxlc3RvbmU6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wiY2xhc3NcIjpcInJlcG9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJvd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm5hbWVcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmUubnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZHVlXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJkdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wibWlsZXN0b25lLnN0YXRzLmlzT25UaW1lXCJdLFwic1wiOlwiKF8wKT9cXFwiZ3JlZW5cXFwiOlxcXCJyZWRcXFwiXCJ9fV0sXCJzdHlsZVwiOltcIndpZHRoOlwiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLnN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dLFwiclwiOlwiZXJyb3JzXCJ9XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJjb2dcIn19LFwiIEVkaXRcIl19XX1dfV19IiwibW9kdWxlLmV4cG9ydHMgPVxuICBub3c6IC0+IG5ldyBEYXRlKCkudG9KU09OKCkiLCJ7IF8sIG1vbWVudCwgbWFya2VkIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIFRpbWUgZnJvbSBub3cuXG4gIGZyb21Ob3c6IF8ubWVtb2l6ZSAoanNvbkRhdGUpIC0+XG4gICAgbW9tZW50KG5ldyBEYXRlKGpzb25EYXRlKSkuZnJvbU5vdygpXG5cbiAgIyBXaGVuIGlzIGEgbWlsZXN0b25lIGR1ZT9cbiAgZHVlOiAoanNvbkRhdGUpIC0+XG4gICAgcmV0dXJuICcmbmJzcDsnIHVubGVzcyBqc29uRGF0ZVxuICAgIFsgJ2R1ZScsIEBmcm9tTm93IGpzb25EYXRlIF0uam9pbignICcpXG5cbiAgIyBNYXJrZG93biBmb3JtYXR0aW5nLlxuICBtYXJrZG93bjogKG1hcmt1cCkgLT5cbiAgICBtYXJrZWQgbWFya3VwXG5cbiAgIyBGb3JtYXQgbWlsZXN0b25lIHRpdGxlLlxuICB0aXRsZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ21pbGVzdG9uZScpID4gLTFcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICBbICdNaWxlc3RvbmUnLCB0ZXh0IF0uam9pbignICcpXG5cbiAgIyBIZXggdG8gZGVjaW1hbC5cbiAgaGV4VG9EZWM6IChoZXgpIC0+XG4gICAgcGFyc2VJbnQgaGV4LCAxNiIsIm1vZHVsZS5leHBvcnRzID1cbiAgaXM6IChldnQpIC0+XG4gICAgZXZ0Lm9yaWdpbmFsLnR5cGUgaW4gWyAna2V5dXAnLCAna2V5ZG93bicgXVxuXG4gIGlzRW50ZXI6IChldnQpIC0+XG4gICAgZXZ0Lm9yaWdpbmFsLndoaWNoIGlzIDEzIiwieyBfIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbl8ubWl4aW5cbiAgJ3BsdWNrTWFueSc6IChzb3VyY2UsIGtleXMpIC0+XG4gICAgdGhyb3cgJ2BrZXlzYCBuZWVkcyB0byBiZSBhbiBBcnJheScgdW5sZXNzIF8uaXNBcnJheSBrZXlzXG4gICAgXy5tYXAgc291cmNlLCAoaXRlbSkgLT5cbiAgICAgIG9iaiA9IHt9XG4gICAgICBfLmVhY2gga2V5cywgKGtleSkgLT5cbiAgICAgICAgb2JqW2tleV0gPSBpdGVtW2tleV1cbiAgICAgIG9ialxuXG4gICdpc0ludCc6ICh2YWwpIC0+XG4gICAgbm90IGlzTmFOKHZhbCkgYW5kIHBhcnNlSW50KE51bWJlcih2YWwpKSBpcyB2YWwgYW5kIG5vdCBpc05hTihwYXJzZUludCh2YWwsIDEwKSkiLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0cykgLT5cbiAgTW9kZWwgPSBSYWN0aXZlLmV4dGVuZChvcHRzKVxuICBtb2RlbCA9IG5ldyBNb2RlbCgpXG4gIG1vZGVsLnJlbmRlcigpXG4gIG1vZGVsIiwieyBSYWN0aXZlLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5saW5lcyA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlJ1xuYXhlcyAgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2F4ZXMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2NoYXJ0Lmh0bWwnXG5cbiAgb25jb21wbGV0ZTogLT5cbiAgICBtaWxlc3RvbmUgPSBAZGF0YS5taWxlc3RvbmVcbiAgICBpc3N1ZXMgPSBtaWxlc3RvbmUuaXNzdWVzXG4gICAgIyBUb3RhbCBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBtaWxlc3RvbmUuXG4gICAgdG90YWwgPSBpc3N1ZXMub3Blbi5zaXplICsgaXNzdWVzLmNsb3NlZC5zaXplXG5cblxuICAgICMgQW4gaXNzdWUgbWF5IGhhdmUgYmVlbiBjbG9zZWQgYmVmb3JlIHRoZSBzdGFydCBvZiBhIG1pbGVzdG9uZS5cbiAgICBoZWFkID0gaXNzdWVzLmNsb3NlZC5saXN0WzBdLmNsb3NlZF9hdFxuICAgIGlmIGlzc3Vlcy5sZW5ndGggYW5kIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID4gaGVhZFxuICAgICAgIyBUaGlzIGlzIHRoZSBuZXcgc3RhcnQuXG4gICAgICBtaWxlc3RvbmUuY3JlYXRlZF9hdCA9IGhlYWRcblxuICAgICMgQWN0dWFsLCBpZGVhbCAmIHRyZW5kIGxpbmVzLlxuICAgIGFjdHVhbCA9IGxpbmVzLmFjdHVhbCBpc3N1ZXMuY2xvc2VkLmxpc3QsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCB0b3RhbFxuICAgIGlkZWFsICA9IGxpbmVzLmlkZWFsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uLCB0b3RhbFxuICAgIHRyZW5kICA9IGxpbmVzLnRyZW5kIGFjdHVhbCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgR2V0IGF2YWlsYWJsZSBzcGFjZS5cbiAgICB7IGhlaWdodCwgd2lkdGggfSA9IGRvIEBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3RcblxuICAgIG1hcmdpbiA9IHsgJ3RvcCc6IDMwLCAncmlnaHQnOiAzMCwgJ2JvdHRvbSc6IDQwLCAnbGVmdCc6IDUwIH1cbiAgICB3aWR0aCAtPSBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodFxuICAgIGhlaWdodCAtPSBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbVxuXG4gICAgIyBTY2FsZXMuXG4gICAgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbIDAsIHdpZHRoIF0pXG4gICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpLnJhbmdlKFsgaGVpZ2h0LCAwIF0pXG5cbiAgICAjIEF4ZXMuXG4gICAgeEF4aXMgPSBheGVzLmhvcml6b250YWwgaGVpZ2h0LCB4XG4gICAgeUF4aXMgPSBheGVzLnZlcnRpY2FsIHdpZHRoLCB5XG5cbiAgICAjIExpbmUgZ2VuZXJhdG9yLlxuICAgIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgLmludGVycG9sYXRlKFwibGluZWFyXCIpXG4gICAgLngoIChkKSAtPiB4KGQuZGF0ZSkgKVxuICAgIC55KCAoZCkgLT4geShkLnBvaW50cykgKVxuXG4gICAgIyBHZXQgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gZGF0ZSwgYW5kIGluaXRpYWwgcG9pbnRzLlxuICAgIHguZG9tYWluKFsgaWRlYWxbMF0uZGF0ZSwgaWRlYWxbaWRlYWwubGVuZ3RoIC0gMV0uZGF0ZSBdKVxuICAgIHkuZG9tYWluKFsgMCwgaWRlYWxbMF0ucG9pbnRzIF0pLm5pY2UoKVxuXG4gICAgIyBBZGQgYW4gU1ZHIGVsZW1lbnQgd2l0aCB0aGUgZGVzaXJlZCBkaW1lbnNpb25zIGFuZCBtYXJnaW4uXG4gICAgc3ZnID0gZDMuc2VsZWN0KHRoaXMuZWwucXVlcnlTZWxlY3RvcignI2NoYXJ0JykpLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcblxuICAgICMgQWRkIHRoZSBkYXlzIHgtYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgZGF5XCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwoeEF4aXMpXG5cbiAgICAjIEFkZCB0aGUgbW9udGhzIHgtYXhpcy5cbiAgICBtID0gW1xuICAgICAgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJyxcbiAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYydcbiAgICBdXG5cbiAgICBtQXhpcyA9IHhBeGlzXG4gICAgLm9yaWVudChcInRvcFwiKVxuICAgIC50aWNrU2l6ZShoZWlnaHQpXG4gICAgLnRpY2tGb3JtYXQoIChkKSAtPiBtW2QuZ2V0TW9udGgoKV0gKVxuICAgIC50aWNrcygyKVxuICAgIFxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBtb250aFwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKG1BeGlzKVxuXG4gICAgIyBBZGQgdGhlIHktYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAuY2FsbCh5QXhpcylcblxuICAgICMgQWRkIGEgbGluZSBzaG93aW5nIHdoZXJlIHdlIGFyZSBub3cuXG4gICAgc3ZnLmFwcGVuZChcInN2ZzpsaW5lXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5XCIpXG4gICAgLmF0dHIoXCJ4MVwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTFcIiwgMClcbiAgICAuYXR0cihcIngyXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHQpXG5cbiAgICAjIEFkZCB0aGUgaWRlYWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImlkZWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImJhc2lzXCIpKGlkZWFsKSlcblxuICAgICMgQWRkIHRoZSB0cmVuZGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVuZGxpbmUgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpKHRyZW5kKSlcblxuICAgICMgQWRkIHRoZSBhY3R1YWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImFjdHVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikueSggKGQpIC0+IHkoZC5wb2ludHMpICkoYWN0dWFsKSlcblxuICAgICMgQ29sbGVjdCB0aGUgdG9vbHRpcCBoZXJlLlxuICAgIHRvb2x0aXAgPSBkMy50aXAoKS5hdHRyKCdjbGFzcycsICdkMy10aXAnKS5odG1sICh7IG51bWJlciwgdGl0bGUgfSkgLT5cbiAgICAgIFwiIyN7bnVtYmVyfTogI3t0aXRsZX1cIlxuXG4gICAgc3ZnLmNhbGwodG9vbHRpcClcblxuICAgICMgU2hvdyB3aGVuIHdlIGNsb3NlZCBhbiBpc3N1ZS5cbiAgICBzdmcuc2VsZWN0QWxsKFwiYS5pc3N1ZVwiKVxuICAgIC5kYXRhKGFjdHVhbC5zbGljZSgxKSkgIyBza2lwIHRoZSBzdGFydGluZyBwb2ludFxuICAgIC5lbnRlcigpXG4gICAgIyBBIHdyYXBwaW5nIGxpbmsuXG4gICAgLmFwcGVuZCgnc3ZnOmEnKVxuICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCAoeyBodG1sX3VybCB9KSAtPiBodG1sX3VybCApXG4gICAgLmF0dHIoXCJ4bGluazpzaG93XCIsICduZXcnKVxuICAgIC5hcHBlbmQoJ3N2ZzpjaXJjbGUnKVxuICAgIC5hdHRyKFwiY3hcIiwgKHsgZGF0ZSB9KSAtPiB4IGRhdGUgKVxuICAgIC5hdHRyKFwiY3lcIiwgKHsgcG9pbnRzIH0pIC0+IHkgcG9pbnRzIClcbiAgICAuYXR0cihcInJcIiwgICh7IHJhZGl1cyB9KSAtPiA1ICkgIyBmaXhlZCBmb3Igbm93XG4gICAgLm9uKCdtb3VzZW92ZXInLCB0b29sdGlwLnNob3cpXG4gICAgLm9uKCdtb3VzZW91dCcsIHRvb2x0aXAuaGlkZSlcbiIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG57IHN5c3RlbSB9ID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5maXJlYmFzZSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSdcbnVzZXIgICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5JY29ucyAgICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9oZWFkZXInXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlYWRlci5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndXNlcic6IHVzZXJcbiAgICAjIERlZmF1bHQgYXBwIGljb24uXG4gICAgJ2ljb24nOiAnZmlyZS1zdGF0aW9uJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBMb2dpbiB1c2VyLlxuICAgIEBvbiAnIWxvZ2luJywgLT5cbiAgICAgIGZpcmViYXNlLmxvZ2luIChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyciBpZiBlcnJcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFN3aXRjaCBsb2FkaW5nIGljb24gd2l0aCBhcHAgaWNvbi5cbiAgICBzeXN0ZW0ub2JzZXJ2ZSAnbG9hZGluZycsICh5YSkgPT5cbiAgICAgIEBzZXQgJ2ljb24nLCBpZiB5YSB0aGVuICdzcGlubmVyMScgZWxzZSAnZmlyZS1zdGF0aW9uJyIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlcm8nXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlcm8uaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuZm9ybWF0ID0gcmVxdWlyZSAnLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxuIyBGb250ZWxsbyBpY29uIGhleCBjb2Rlcy5cbmNvZGVzID1cbiAgJ2NvZyc6ICAgICAgICAgICAnXFxlODAwJ1xuICAnc2VhcmNoJzogICAgICAgICdcXGU4MDEnXG4gICdnaXRodWInOiAgICAgICAgJ1xcZTgwMidcbiAgJ2FkZHJlc3MnOiAgICAgICAnXFxlODAzJ1xuICAncGx1cy1jaXJjbGVkJzogICdcXGU4MDQnXG4gICdmaXJlLXN0YXRpb24nOiAgJ1xcZTgwNSdcbiAgJ3NvcnQtYWxwaGFiZXQnOiAnXFxlODA2J1xuICAnZG93bi1vcGVuJzogICAgICdcXGU4MDcnXG4gICdzcGluNic6ICAgICAgICAgJ1xcZTgwOCdcbiAgJ21lZ2FwaG9uZSc6ICAgICAnXFxlODA5J1xuICAnc3BpbjQnOiAgICAgICAgICdcXGU4MGEnXG4gICdzcGlubmVyMSc6ICAgICAgJ1xcZTgwYidcbiAgJ2F0dGVudGlvbic6ICAgICAnXFxlODBjJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaWNvbnMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2ljb25zLmh0bWwnXG5cbiAgJ2lzb2xhdGVkJzogeWVzXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgQG9ic2VydmUgJ2ljb24nLCAoaWNvbikgLT5cbiAgICAgIGlmIGljb24gYW5kIGhleCA9IGNvZGVzW2ljb25dXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBmb3JtYXQuaGV4VG9EZWMgaGV4XG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBudWxsIiwieyBfLCBSYWN0aXZlLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxuSEVJR0hUID0gNjggIyBoZWlnaHQgb2YgZGl2IGluIHB4XG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9ub3RpZnknXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL25vdGlmeS5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndG9wJzogSEVJR0hUXG4gICAgJ2hpZGRlbic6IHllc1xuICAgICdkZWZhdWx0cyc6XG4gICAgICAndGV4dCc6ICcnXG4gICAgICAndHlwZSc6ICcnICMgYmxhbmQgZ3JleSBzdHlsZVxuICAgICAgJ3N5c3RlbSc6IG5vXG4gICAgICAnaWNvbic6ICdtZWdhcGhvbmUnXG4gICAgICAndHRsJzogIDVlM1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgIyBTaG93IGEgbm90aWZpY2F0aW9uLlxuICBzaG93OiAob3B0cykgLT5cbiAgICBAc2V0ICdoaWRkZW4nLCBubyAgICBcbiAgICAjIFNldCB0aGUgb3B0cy5cbiAgICBAc2V0IG9wdHMgPSBfLmRlZmF1bHRzIG9wdHMsIEBkYXRhLmRlZmF1bHRzXG4gICAgIyBXaGljaCBwb3NpdGlvbiB0byBzbGlkZSB0bz9cbiAgICBwb3MgPSBbIDAsIDUwIF1bICtvcHRzLnN5c3RlbSBdICMgMHB4IG9yIDUwJSBmcm9tIHRvcFxuICAgICMgU2xpZGUgaW50byB2aWV3LlxuICAgIEBhbmltYXRlICd0b3AnLCBwb3MsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYm91bmNlJylcbiAgICAgICdkdXJhdGlvbic6IDgwMFxuICAgIFxuICAgICMgSWYgbm8gdHRsIHRoZW4gc2hvdyBwZXJtYW5lbnRseS5cbiAgICByZXR1cm4gdW5sZXNzIG9wdHMudHRsXG5cbiAgICAjIFNsaWRlIG91dCBvZiB0aGUgdmlldy5cbiAgICBfLmRlbGF5IF8uYmluZChAaGlkZSwgQCksIG9wdHMudHRsXG5cbiAgIyBIaWRlIGEgbm90aWZpY2F0aW9uLlxuICBoaWRlOiAtPlxuICAgIHJldHVybiBpZiBAZGF0YS5oaWRkZW5cbiAgICBAc2V0ICdoaWRkZW4nLCB5ZXNcblxuICAgIEBhbmltYXRlICd0b3AnLCBIRUlHSFQsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYmFjaycpXG4gICAgICAnY29tcGxldGUnOiA9PlxuICAgICAgICAjIFJlc2V0IHRoZSB0ZXh0IHdoZW4gYWxsIGlzIGRvbmUuXG4gICAgICAgIEBzZXQgJ3RleHQnLCBudWxsXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIE9uIG91dHNpZGUgbWVzc2FnZXMuXG4gICAgbWVkaWF0b3Iub24gJyFhcHAvbm90aWZ5JywgXy5iaW5kIEBzaG93LCBAXG4gICAgbWVkaWF0b3Iub24gJyFhcHAvbm90aWZ5L2hpZGUnLCBfLmJpbmQgQGhpZGUsIEBcblxuICAgICMgQ2xvc2UgdXMgcHJlbWF0dXJlbHkuLi5cbiAgICBAb24gJ2Nsb3NlJywgQGhpZGUiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkhlcm8gICAgID0gcmVxdWlyZSAnLi4vaGVyby5jb2ZmZWUnXG5Qcm9qZWN0cyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9wcm9qZWN0cy5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9pbmRleCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvaW5kZXguaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSGVybywgUHJvamVjdHMgfVxuXG4gICdkYXRhJzpcbiAgICAncHJvamVjdHMnOiBwcm9qZWN0c1xuICAgICdyZWFkeSc6IG5vXG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gIG9ucmVuZGVyOiAtPlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0J1cm5jaGFydDogR2l0SHViIEJ1cm5kb3duIENoYXJ0IGFzIGEgU2VydmljZSdcblxuICAgICMgUXVpdCBpZiB3ZSBoYXZlIG5vIHByb2plY3RzLlxuICAgIHJldHVybiBAc2V0KCdyZWFkeScsIHllcykgdW5sZXNzIHByb2plY3RzLmxpc3QubGVuZ3RoXG5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICAjIEZvciBhbGwgcHJvamVjdHMuXG4gICAgYXN5bmMubWFwIHByb2plY3RzLmRhdGEubGlzdCwgKHByb2plY3QsIGNiKSAtPlxuICAgICAgIyBGZXRjaCB0aGVpciBtaWxlc3RvbmVzLlxuICAgICAgbWlsZXN0b25lcy5mZXRjaEFsbCBwcm9qZWN0LCAoZXJyLCBsaXN0KSAtPlxuICAgICAgICAjIFNhdmUgdGhlIGVycm9yIGlmIHByb2plY3QgZG9lcyBub3QgZXhpc3QuXG4gICAgICAgIGlmIGVyclxuICAgICAgICAgIHByb2plY3RzLnNhdmVFcnJvciBwcm9qZWN0LCBlcnJcbiAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAjIE5vdyBhZGQgaW4gdGhlIGlzc3Vlcy5cbiAgICAgICAgYXN5bmMuZWFjaCBsaXN0LCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCBpZiBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCAoeyBudW1iZXIgfSkgLT5cbiAgICAgICAgICAgIG1pbGVzdG9uZS5udW1iZXIgaXMgbnVtYmVyXG4gICAgICAgICAgXG4gICAgICAgICAgIyBPSyBmZXRjaCBhbGwgdGhlIGlzc3VlcyBmb3IgdGhpcyBtaWxlc3RvbmUgdGhlbi5cbiAgICAgICAgICBpc3N1ZXMuZmV0Y2hBbGxcbiAgICAgICAgICAgICdvd25lcic6IHByb2plY3Qub3duZXJcbiAgICAgICAgICAgICduYW1lJzogcHJvamVjdC5uYW1lXG4gICAgICAgICAgICAnbWlsZXN0b25lJzogbWlsZXN0b25lLm51bWJlclxuICAgICAgICAgICwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgICAgIyBTYXZlIGFueSBlcnJvcnMgb24gdGhlIHByb2plY3QuXG4gICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAgICAgIyBBZGQgaW4gdGhlIGlzc3VlcyB0byB0aGUgbWlsZXN0b25lLlxuICAgICAgICAgICAgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdpc3N1ZXMnOiBvYmogfVxuICAgICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgbWlsZXN0b25lXG4gICAgICAgICAgICAjIERvbmVcbiAgICAgICAgICAgIGRvIGNiXG4gICAgICAgIFxuICAgICAgICAsIGNiXG5cbiAgICAsID0+XG4gICAgICBkbyBkb25lXG4gICAgICBAc2V0ICdyZWFkeScsIHllcyIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuQ2hhcnQgPSByZXF1aXJlICcuLi9jaGFydC5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5mb3JtYXQgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgQ2hhcnQgfVxuXG4gICdkYXRhJzpcbiAgICAnZm9ybWF0JzogZm9ybWF0XG4gICAgJ3JlYWR5Jzogbm9cblxuICBvbnJlbmRlcjogLT5cbiAgICBbIG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgXSA9IEBnZXQgJ3JvdXRlJ1xuICBcbiAgICBtaWxlc3RvbmUgPSBwYXJzZUludCBtaWxlc3RvbmVcblxuICAgIGRvY3VtZW50LnRpdGxlID0gXCIje293bmVyfS8je25hbWV9LyN7bWlsZXN0b25lfVwiXG5cbiAgICAjIEdldCB0aGUgYXNzb2NpYXRlZCBwcm9qZWN0LlxuICAgIHByb2plY3QgPSBwcm9qZWN0cy5maW5kIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBTaG91bGQgbm90IGhhcHBlbi4uLlxuICAgIHRocm93IDUwMCB1bmxlc3MgcHJvamVjdFxuXG4gICAgIyBEbyB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgb2JqID0gXy5maW5kIHByb2plY3QubWlsZXN0b25lcywgeyAnbnVtYmVyJzogbWlsZXN0b25lIH1cbiAgICByZXR1cm4gQHNldCB7ICdtaWxlc3RvbmUnOiBvYmosICdyZWFkeSc6IHllcyB9IGlmIG9iaj9cblxuICAgICMgV2UgYXJlIGxvYWRpbmcgdGhlIG1pbGVzdG9uZXMgdGhlbi5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmZXRjaE1pbGVzdG9uZSA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2ggeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiXG5cbiAgICBmZXRjaElzc3VlcyA9IChkYXRhLCBjYikgLT5cbiAgICAgIGlzc3Vlcy5mZXRjaEFsbCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICBjYiBlcnIsIF8uZXh0ZW5kIGRhdGEsIHsgJ2lzc3Vlcyc6IG9iaiB9XG5cbiAgICBhc3luYy53YXRlcmZhbGwgW1xuICAgICAgIyBHZXQgdGhlIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoTWlsZXN0b25lLFxuICAgICAgIyBUaGVuIGFsbCBpdHMgaXNzdWVzLlxuICAgICAgZmV0Y2hJc3N1ZXNcbiAgICBdLCAoZXJyLCBkYXRhKSA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgcmV0dXJuIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6IGRvIGVyci50b1N0cmluZ1xuICAgICAgICAndHlwZSc6ICdhbGVydCdcbiAgICAgICAgJ3N5c3RlbSc6IHllc1xuICAgICAgICAndHRsJzogbnVsbFxuICAgICAgfSBpZiBlcnJcblxuICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgZGF0YVxuXG4gICAgICAjIFNob3cgdGhlIHBhZ2UuXG4gICAgICBAc2V0XG4gICAgICAgICdtaWxlc3RvbmUnOiBkYXRhXG4gICAgICAgICdyZWFkeSc6IHllcyIsInsgXywgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbnVzZXIgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xua2V5ICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9rZXkuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvbmV3J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCdcblxuICAnZGF0YSc6IHsgJ3ZhbHVlJzogJ3JhZGVrc3RlcGFuL2Rpc3Bvc2FibGUnLCB1c2VyIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgIyBMaXN0ZW4gdG8gRW50ZXIga2V5cHJlc3Mgb3IgU3VibWl0IGJ1dHRvbiBjbGljay5cbiAgc3VibWl0OiAoZXZ0LCB2YWx1ZSkgLT5cbiAgICByZXR1cm4gaWYga2V5LmlzKGV2dCkgYW5kIG5vdCBrZXkuaXNFbnRlcihldnQpXG5cbiAgICBbIG93bmVyLCBuYW1lIF0gPSB2YWx1ZS5zcGxpdCgnLycpXG5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICAjIFNhdmUgcmVwby5cbiAgICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvYWRkJywgeyBvd25lciwgbmFtZSB9LCAoZXJyKSAtPlxuICAgICAgZG8gZG9uZVxuXG4gICAgICBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsXG4gICAgICAgICd0ZXh0JzogZXJyIG9yIFwiUHJvamVjdCAje3ZhbHVlfSBzYXZlZC5cIlxuICAgICAgICAndHlwZSc6IGlmIGVyciB0aGVuICdlcnJvcicgZWxzZSAnc3VjY2VzcydcblxuICAgICAgIyBSZWRpcmVjdCB0byB0aGUgZGFzaGJvYXJkLlxuICAgICAgIyBUT0RPOiB0cmlnZ2VyIGEgbmFtZWQgcm91dGVcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQWRkIGEgbmV3IHByb2plY3QnXG5cbiAgICAjIFRPRE86IGF1dG9jb21wbGV0ZSBvbiBvdXIgdXNlcm5hbWUgaWYgd2UgYXJlIGxvZ2dlZCBpbiBvciBiYXNlZFxuICAgICMgIG9uIHJlcG9zIHdlIGFscmVhZHkgaGF2ZS5cbiAgICBhdXRvY29tcGxldGUgPSAodmFsdWUpIC0+XG5cbiAgICBAb2JzZXJ2ZSAndmFsdWUnLCBfLmRlYm91bmNlKGF1dG9jb21wbGV0ZSwgMjAwKSwgeyAnaW5pdCc6IG5vIH1cblxuICAgICMgRm9jdXMgb24gdGhlIGlucHV0IGZpZWxkLlxuICAgIGRvIEBlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLmZvY3VzXG5cbiAgICBAb24gJ3N1Ym1pdCcsIEBzdWJtaXQiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi90YWJsZXMvbWlsZXN0b25lcy5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9wcm9qZWN0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9wcm9qZWN0Lmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IE1pbGVzdG9uZXMgfVxuXG4gICdkYXRhJzpcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUgXSA9IEBnZXQgJ3JvdXRlJ1xuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBAc2V0ICdwcm9qZWN0JywgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIFdlIGRvbid0IGtub3cgaWYgd2UgaGF2ZSBhbGwgbWlsZXN0b25lcywgc28gZmV0Y2ggdGhlbS5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmaW5kTWlsZXN0b25lID0gKG51bWJlcikgLT5cbiAgICAgIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMgb3IgW10sIHsgbnVtYmVyIH1cblxuICAgIGZldGNoTWlsZXN0b25lcyA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGFsbE1pbGVzdG9uZXMsIGNiKSAtPlxuICAgICAgYXN5bmMuZWFjaCBhbGxNaWxlc3RvbmVzLCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgIyBNYXliZSB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgIHJldHVybiBjYiBudWxsIGlmIGZpbmRNaWxlc3RvbmUgbWlsZXN0b25lLm51bWJlclxuICAgICAgICAjIE5lZWQgdG8gZmV0Y2ggdGhlIGlzc3VlcyB0aGVuLlxuICAgICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXIgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAjIE5leHQuXG4gICAgICAgICAgZG8gY2JcbiAgICAgICwgY2JcblxuICAgICMgUnVuIGl0LlxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEZpcnN0IGdldCBhbGwgdGhlIG1pbGVzdG9uZXMuXG4gICAgICBmZXRjaE1pbGVzdG9uZXMsXG4gICAgICAjIFRoZW4gYWxsIHRoZSBpc3N1ZXMgcGVyIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVycikgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F5IHdlIGFyZSByZWFkeS5cbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzXG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnByb2plY3RzID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvbWlsZXN0b25lcydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCdcblxuICAnZGF0YSc6IHsgZm9ybWF0IH1cblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xucHJvamVjdHMgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcHJvamVjdHMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9wcm9qZWN0cy5odG1sJ1xuXG4gICdkYXRhJzogeyBmb3JtYXQgfVxuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSJdfQ==
