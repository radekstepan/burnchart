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



},{"./models/projects.coffee":4,"./modules/router.coffee":13,"./modules/vendor.coffee":15,"./templates/app.html":16,"./utils/mixins.coffee":31,"./views/header.coffee":35,"./views/notify.coffee":38}],2:[function(require,module,exports){
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
var Model, config, date, lscache, mediator, search, sortedIndexCmp, stats, user, _, _ref;

_ref = require('../modules/vendor.coffee'), _ = _ref._, lscache = _ref.lscache, sortedIndexCmp = _ref.sortedIndexCmp;

config = require('../models/config.coffee');

mediator = require('../modules/mediator.coffee');

stats = require('../modules/stats.coffee');

Model = require('../utils/model.coffee');

date = require('../utils/date.coffee');

search = require('../utils/search.coffee');

user = require('./user.coffee');

module.exports = new Model({
  'name': 'models/projects',
  'data': {
    'sortBy': 'priority'
  },
  comparator: function() {
    switch (this.data.sortBy) {
      case 'priority':
        return (function(_this) {
          return function(_arg, b) {
            var $, a, i, j;
            i = _arg[0], j = _arg[1];
            a = _this.data.list[i].milestones[j];
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
          };
        })(this);
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



},{"../models/config.coffee":2,"../modules/mediator.coffee":12,"../modules/stats.coffee":14,"../modules/vendor.coffee":15,"../utils/date.coffee":28,"../utils/model.coffee":32,"../utils/search.coffee":33,"./user.coffee":6}],5:[function(require,module,exports){
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



},{"../models/system.coffee":5,"../views/pages/index.coffee":39,"../views/pages/milestone.coffee":40,"../views/pages/new.coffee":41,"../views/pages/project.coffee":42,"./mediator.coffee":12,"./vendor.coffee":15}],14:[function(require,module,exports){
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
module.exports = function(arr, item, comparator) {
  var existing, index, maxIndex, minIndex, res;
  if (comparator == null) {
    comparator = function(a, b) {
      switch (false) {
        case !(a < b):
          return -1;
        case !(a >  b):
          return +1;
        default:
          return 0;
      }
    };
  }
  minIndex = 0;
  maxIndex = arr.length - 1;
  while (minIndex <= maxIndex) {
    index = (minIndex + maxIndex) / 2 | 0;
    existing = arr[index];
    res = comparator(existing, item);
    switch (false) {
      case !(result < 0):
        minIndex = index + 1;
        break;
      case !(result > 0):
        maxIndex = index - 1;
        break;
      default:
        return index;
    }
  }
  return -1;
};



},{}],34:[function(require,module,exports){
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



},{"../modules/chart/axes.coffee":7,"../modules/chart/lines.coffee":8,"../modules/vendor.coffee":15,"../templates/chart.html":17}],35:[function(require,module,exports){
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



},{"../models/firebase.coffee":3,"../models/system.coffee":5,"../models/user.coffee":6,"../modules/vendor.coffee":15,"../templates/header.html":18,"./icons.coffee":37}],36:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../modules/vendor.coffee":15,"../templates/hero.html":19,"./icons.coffee":37}],37:[function(require,module,exports){
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



},{"../modules/vendor.coffee":15,"../templates/icons.html":20,"../utils/format.coffee":29}],38:[function(require,module,exports){
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



},{"../modules/mediator.coffee":12,"../modules/vendor.coffee":15,"../templates/notify.html":21,"./icons.coffee":37}],39:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/index.html":22,"../hero.coffee":36,"../tables/projects.coffee":44}],40:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/milestone.html":23,"../../utils/format.coffee":29,"../chart.coffee":34}],41:[function(require,module,exports){
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



},{"../../models/system.coffee":5,"../../models/user.coffee":6,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/new.html":24,"../../utils/key.coffee":30}],42:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../models/system.coffee":5,"../../modules/github/issues.coffee":9,"../../modules/github/milestones.coffee":10,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/pages/project.html":25,"../tables/milestones.coffee":43}],43:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/tables/milestones.html":26,"../../utils/format.coffee":29,"../icons.coffee":37}],44:[function(require,module,exports){
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



},{"../../models/projects.coffee":4,"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/tables/projects.html":27,"../../utils/format.coffee":29,"../icons.coffee":37}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9hcHAuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2NvbmZpZy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvZmlyZWJhc2UuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9zeXN0ZW0uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3VzZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvcmVxdWVzdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvcm91dGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvc3RhdHMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy92ZW5kb3IuY29mZmVlIiwic3JjL3RlbXBsYXRlcy9hcHAuaHRtbCIsInNyYy90ZW1wbGF0ZXMvY2hhcnQuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlcm8uaHRtbCIsInNyYy90ZW1wbGF0ZXMvaWNvbnMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2RhdGUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvZm9ybWF0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2tleS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9taXhpbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbW9kZWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvc2VhcmNoLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2NoYXJ0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlYWRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZXJvLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2ljb25zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL25vdGlmeS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbmV3LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL3Byb2plY3RzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsb0NBQUE7O0FBQUEsVUFBYyxPQUFBLENBQVEseUJBQVIsRUFBWixPQUFGLENBQUE7O0FBQUEsT0FFQSxDQUFRLHVCQUFSLENBRkEsQ0FBQTs7QUFBQSxPQUlBLENBQVEsMEJBQVIsQ0FKQSxDQUFBOztBQUFBLE1BTUEsR0FBUyxPQUFBLENBQVEsdUJBQVIsQ0FOVCxDQUFBOztBQUFBLE1BT0EsR0FBUyxPQUFBLENBQVEsdUJBQVIsQ0FQVCxDQUFBOztBQUFBLE1BUUEsR0FBUyxPQUFBLENBQVEseUJBQVIsQ0FSVCxDQUFBOztBQUFBLEdBVUEsR0FBVSxJQUFBLE9BQUEsQ0FFUjtBQUFBLEVBQUEsVUFBQSxFQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaO0FBQUEsRUFFQSxJQUFBLEVBQU0sTUFGTjtBQUFBLEVBSUEsWUFBQSxFQUFj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QkFBUjtBQUFBLEVBRUEsVUFBQSxFQUFZLE9BQUEsQ0FBUSx3Q0FBUixDQUZaO0FBQUEsRUFJQSxNQUFBLEVBQVE7QUFBQSxJQUFFLFFBQUEsTUFBRjtHQUpSO0FBQUEsRUFNQSxZQUFBLEVBQWM7QUFBQSxJQUFFLE9BQUEsS0FBRjtHQU5kO0FBQUEsRUFRQSxPQUFBLEVBQVMsQ0FBRSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBUlQ7Q0FGZSxDQVBqQixDQUFBOzs7OztBQ0FBLElBQUEsMENBQUE7O0FBQUEsVUFBYyxPQUFBLENBQVEsNkJBQVIsRUFBWixPQUFGLENBQUE7O0FBQUEsUUFFQSxHQUFXLE9BQUEsQ0FBUSwrQkFBUixDQUZYLENBQUE7O0FBQUEsTUFHQSxHQUFXLE9BQUEsQ0FBUSwyQkFBUixDQUhYLENBQUE7O0FBQUEsS0FJQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUpYLENBQUE7O0FBQUEsUUFLQSxHQUFXLE9BQUEsQ0FBUSw4QkFBUixDQUxYLENBQUE7O0FBQUEsTUFPTSxDQUFDLE9BQVAsR0FBaUIsT0FBTyxDQUFDLE1BQVIsQ0FFZjtBQUFBLEVBQUEsTUFBQSxFQUFRLGdCQUFSO0FBQUEsRUFFQSxVQUFBLEVBQVksT0FBQSxDQUFRLHNDQUFSLENBRlo7QUFBQSxFQUlBLE1BQUEsRUFBUTtBQUFBLElBQUUsUUFBQSxNQUFGO0dBSlI7QUFBQSxFQU1BLFlBQUEsRUFBYztBQUFBLElBQUUsT0FBQSxLQUFGO0dBTmQ7QUFBQSxFQVFBLE9BQUEsRUFBUyxDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FSVDtDQUZlLENBUGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcbiMgTG9kYXNoIG1peGlucy5cbnJlcXVpcmUgJy4vdXRpbHMvbWl4aW5zLmNvZmZlZSdcbiMgV2lsbCBsb2FkIHByb2plY3RzIGZyb20gbG9jYWxTdG9yYWdlLlxucmVxdWlyZSAnLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5IZWFkZXIgPSByZXF1aXJlICcuL3ZpZXdzL2hlYWRlci5jb2ZmZWUnXG5Ob3RpZnkgPSByZXF1aXJlICcuL3ZpZXdzL25vdGlmeS5jb2ZmZWUnXG5yb3V0ZXIgPSByZXF1aXJlICcuL21vZHVsZXMvcm91dGVyLmNvZmZlZSdcblxuYXBwID0gbmV3IFJhY3RpdmVcbiAgXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2FwcC5odG1sJ1xuXG4gICdlbCc6ICdib2R5J1xuXG4gICdjb21wb25lbnRzJzogeyBIZWFkZXIsIE5vdGlmeSB9XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTdGFydCB0aGUgcm91dGVyLlxuICAgIHJvdXRlci5pbml0ICcvJyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHVibGljX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSwgc29ydGVkSW5kZXhDbXAgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuY29uZmlnICAgPSByZXF1aXJlICcuLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zdGF0cyAgICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvc3RhdHMuY29mZmVlJ1xuTW9kZWwgICAgPSByZXF1aXJlICcuLi91dGlscy9tb2RlbC5jb2ZmZWUnXG5kYXRlICAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL2RhdGUuY29mZmVlJ1xuc2VhcmNoICAgPSByZXF1aXJlICcuLi91dGlscy9zZWFyY2guY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuL3VzZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9wcm9qZWN0cydcblxuICAnZGF0YSc6XG4gICAgJ3NvcnRCeSc6ICdwcmlvcml0eSdcblxuICAjIFJldHVybiBhIHNvcnQgb3JkZXIgY29tcGFyYXRvci5cbiAgY29tcGFyYXRvcjogLT5cbiAgICBzd2l0Y2ggQGRhdGEuc29ydEJ5XG4gICAgICAjIFByaW9yaXR5IGNvbXBhcmF0b3IgZnJvbSBtb3N0IGRlbGF5ZWQgaW4gZGF5cy5cbiAgICAgIHdoZW4gJ3ByaW9yaXR5JyB0aGVuIChbIGksIGogXSwgYikgPT5cbiAgICAgICAgIyBDb252ZXJ0IGV4aXN0aW5nIGluZGV4IGludG8gYWN0dWFsIHByb2VqY3QgbWlsZXN0b25lLlxuICAgICAgICBhID0gQGRhdGEubGlzdFtpXS5taWxlc3RvbmVzW2pdXG4gICAgICAgICMgQnkgcHJvZ3Jlc3MgcG9pbnRzLlxuICAgICAgICAkID0geyAncHJvZ3Jlc3MnOiB7ICdwb2ludHMnOiAwIH0gfVxuICAgICAgICBhLnN0YXRzID89ICQgOyBiLnByb2dyZXNzID89ICRcblxuICAgICAgICBhLnN0YXRzLnByb2dyZXNzLnBvaW50cyAtIGIuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXG4gICAgICBcbiAgICAgICMgV2hhdGV2ZXIgc29ydCBvcmRlci4uLlxuICAgICAgZWxzZSAtPiAwXG5cbiAgZmluZDogKHByb2plY3QpIC0+XG4gICAgXy5maW5kIEBkYXRhLmxpc3QsIHByb2plY3RcblxuICBleGlzdHM6IC0+XG4gICAgISFAZmluZC5hcHBseSBALCBhcmd1bWVudHNcblxuICAjIFB1c2ggdG8gdGhlIHN0YWNrIHVubGVzcyBpdCBleGlzdHMgYWxyZWFkeS5cbiAgYWRkOiAocHJvamVjdCkgLT5cbiAgICBAcHVzaCAnbGlzdCcsIHByb2plY3QgdW5sZXNzIEBleGlzdHMgcHJvamVjdFxuXG4gICMgRmluZCBpbmRleCBvZiBhIHByb2plY3QuXG4gIGZpbmRJbmRleDogKHsgb3duZXIsIG5hbWUgfSkgLT5cbiAgICBfLmZpbmRJbmRleCBAZGF0YS5saXN0LCB7IG93bmVyLCBuYW1lIH1cblxuICBhZGRNaWxlc3RvbmU6IChwcm9qZWN0LCBtaWxlc3RvbmUpIC0+XG4gICAgIyBBZGQgaW4gdGhlIHN0YXRzLlxuICAgIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnc3RhdHMnOiBzdGF0cyhtaWxlc3RvbmUpIH1cblxuICAgIGlmIChpZHggPSBAZmluZEluZGV4KHByb2plY3QpKSA+IC0xXG4gICAgICBpZiBwcm9qZWN0Lm1pbGVzdG9uZXM/XG4gICAgICAgIEBwdXNoIFwibGlzdC4je2lkeH0ubWlsZXN0b25lc1wiLCBtaWxlc3RvbmVcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCBcImxpc3QuI3tpZHh9Lm1pbGVzdG9uZXNcIiwgWyBtaWxlc3RvbmUgXVxuICAgIGVsc2VcbiAgICAgICMgV2UgYXJlIHN1cHBvc2VkIHRvIGV4aXN0IGFscmVhZHkuXG4gICAgICB0aHJvdyA1MDBcblxuICAjIFNhdmUgYW4gZXJyb3IgZnJvbSBsb2FkaW5nIG1pbGVzdG9uZXMgb3IgaXNzdWVzXG4gIHNhdmVFcnJvcjogKHByb2plY3QsIGVycikgLT5cbiAgICBpZiAoaWR4ID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPiAtMVxuICAgICAgaWYgcHJvamVjdC5lcnJvcnM/XG4gICAgICAgIEBwdXNoIFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIGVyclxuICAgICAgZWxzZVxuICAgICAgICBAc2V0IFwibGlzdC4je2lkeH0uZXJyb3JzXCIsIFsgZXJyIF1cbiAgICBlbHNlXG4gICAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgICAgdGhyb3cgNTAwICBcblxuICBjbGVhcjogLT5cbiAgICBAc2V0ICdsaXN0JywgW11cblxuICAjIFNvcnQgYW4gYWxyZWFkeSBzb3J0ZWQgaW5kZXguXG4gIHNvcnQ6IC0+XG4gICAgIyBHZXQgb3IgaW5pdGlhbGl6ZSB0aGUgaW5kZXguXG4gICAgaW5kZXggPSBAZGF0YS5pbmRleCBvciBbXVxuXG4gICAgZm9yIHAsIGkgaW4gQGRhdGEubGlzdFxuICAgICAgY29udGludWUgdW5sZXNzIHAubWlsZXN0b25lcz9cbiAgICAgIGZvciBtLCBqIGluIHAubWlsZXN0b25lc1xuICAgICAgICAjIFJ1biBhIGNvbXBhcmF0b3IgaGVyZSBpbnNlcnRpbmcgaW50byBpbmRleC5cbiAgICAgICAgaWR4ID0gc29ydGVkSW5kZXhDbXAgaW5kZXgsIG0sIGRvIEBjb21wYXJhdG9yXG4gICAgICAgICMgTG9nLlxuICAgICAgICBpbmRleC5zcGxpY2UgaWR4LCAwLCBbIGksIGogXVxuXG4gICAgIyBTYXZlIHRoZSBpbmRleC5cbiAgICBAc2V0ICdpbmRleCcsIGluZGV4XG5cbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgbWVkaWF0b3Iub24gJyFwcm9qZWN0cy9hZGQnLCAgICBfLmJpbmQgQGFkZCwgQFxuICAgIG1lZGlhdG9yLm9uICchcHJvamVjdHMvY2xlYXInLCAgXy5iaW5kIEBjbGVhciwgQFxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgSW5pdCB0aGUgcHJvamVjdHMuXG4gICAgQHNldCAnbGlzdCcsIGxzY2FjaGUuZ2V0KCdwcm9qZWN0cycpIG9yIFtdXG5cbiAgICBAb2JzZXJ2ZSAnbGlzdCcsIChwcm9qZWN0cykgLT5cbiAgICAgICMgUGVyc2lzdCBwcm9qZWN0cyBpbiBsb2NhbCBzdG9yYWdlIChzYW5zIG1pbGVzdG9uZXMpLlxuICAgICAgbHNjYWNoZS5zZXQgJ3Byb2plY3RzJywgXy5wbHVja01hbnkgcHJvamVjdHMsIFsgJ293bmVyJywgJ25hbWUnIF1cbiAgICAgICMgVXBkYXRlIHRoZSBpbmRleC5cbiAgICAgIGRvIEBzb3J0XG4gICAgLCAnaW5pdCc6IG5vXG5cbiAgICAjIFJlc2V0IG91ciBpbmRleCBhbmQgcmUtc29ydC5cbiAgICBAb2JzZXJ2ZSAnc29ydEJ5JywgLT5cbiAgICAgICMgVXNlIHBvcCBhcyBSYWN0aXZlIGlzIGdsaXRjaHkuXG4gICAgICAoIEBwb3AgJ2luZGV4JyB3aGlsZSBAZGF0YS5pbmRleC5sZW5ndGggKSBpZiBAZGF0YS5pbmRleD9cbiAgICAgICPCoFJ1biB0aGUgc29ydCBhZ2Fpbi5cbiAgICAgIGRvIEBzb3J0IiwibWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbk1vZGVsICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG4jIFN5c3RlbSBzdGF0ZS5cbnN5c3RlbSA9IG5ldyBNb2RlbFxuICBcbiAgJ25hbWUnOiAnbW9kZWxzL3N5c3RlbSdcblxuICAnZGF0YSc6XG4gICAgJ2xvYWRpbmcnOiBub1xuXG5jb3VudGVyID0gMFxuYXN5bmMgPSAtPlxuICBjb3VudGVyICs9IDFcbiAgc3lzdGVtLnNldCAnbG9hZGluZycsIHllc1xuICAtPlxuICAgIGNvdW50ZXIgLT0gMVxuICAgIHN5c3RlbS5zZXQgJ2xvYWRpbmcnLCArY291bnRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgc3lzdGVtLCBhc3luYyB9IiwibWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbk1vZGVsICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG4jIEN1cnJlbnRseSBsb2dnZWQtaW4gdXNlci5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL3VzZXInXG5cbiAgIyBEZWZhdWx0IHRvIGEgbG9jYWwgdXNlci5cbiAgJ2RhdGEnOlxuICAgICdwcm92aWRlcic6ICBcImxvY2FsXCJcbiAgICAnaWQnOiAgICAgICAgXCIwXCJcbiAgICAndWlkJzogICAgICAgXCJsb2NhbDowXCJcbiAgICAndG9rZW4nOiAgICAgbnVsbCIsInsgZDMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBob3Jpem9udGFsOiAoaGVpZ2h0LCB4KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeClcbiAgICAgIC5vcmllbnQoXCJib3R0b21cIilcbiAgICAgICMgU2hvdyB2ZXJ0aWNhbCBsaW5lcy4uLlxuICAgICAgLnRpY2tTaXplKC1oZWlnaHQpXG4gICAgICAjIC4uLndpdGggZGF5IG9mIHRoZSBtb250aC4uLlxuICAgICAgLnRpY2tGb3JtYXQoIChkKSAtPiBkLmdldERhdGUoKSApXG4gICAgICAjIC4uLmFuZCBnaXZlIHVzIGEgc3BhY2VyLlxuICAgICAgLnRpY2tQYWRkaW5nKDEwKVxuXG4gIHZlcnRpY2FsOiAod2lkdGgsIHkpIC0+XG4gICAgZDMuc3ZnLmF4aXMoKS5zY2FsZSh5KVxuICAgICAgLm9yaWVudChcImxlZnRcIilcbiAgICAgIC50aWNrU2l6ZSgtd2lkdGgpXG4gICAgICAudGlja3MoNSlcbiAgICAgIC50aWNrUGFkZGluZygxMCkiLCJ7IF8sIGQzIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmNvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBBIGdyYXBoIG9mIGNsb3NlZCBpc3N1ZXMuXG4gICMgYGlzc3Vlc2A6ICAgICBpc3N1ZXMgbGlzdFxuICAjIGBjcmVhdGVkX2F0YDogbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgdG90YWxgOiAgICB0b3RhbCBudW1iZXIgb2YgcG9pbnRzIChvcGVuICYgY2xvc2VkIGlzc3VlcylcbiAgYWN0dWFsOiAoaXNzdWVzLCBjcmVhdGVkX2F0LCB0b3RhbCkgLT5cbiAgICBoZWFkID0gWyB7XG4gICAgICAnZGF0ZSc6IG5ldyBEYXRlIGNyZWF0ZWRfYXRcbiAgICAgICdwb2ludHMnOiB0b3RhbFxuICAgIH0gXVxuICAgIFxuICAgIG1pbiA9ICtJbmZpbml0eSA7IG1heCA9IC1JbmZpbml0eVxuXG4gICAgIyBHZW5lcmF0ZSB0aGUgYWN0dWFsIGNsb3Nlcy5cbiAgICByZXN0ID0gXy5tYXAgaXNzdWVzLCAoaXNzdWUpIC0+XG4gICAgICB7IHNpemUsIGNsb3NlZF9hdCB9ID0gaXNzdWVcbiAgICAgICMgRGV0ZXJtaW5lIHRoZSByYW5nZS5cbiAgICAgIG1pbiA9IHNpemUgaWYgc2l6ZSA8IG1pblxuICAgICAgbWF4ID0gc2l6ZSBpZiBzaXplID4gbWF4XG5cbiAgICAgICMgRHJvcHBpbmcgcG9pbnRzIHJlbWFpbmluZy5cbiAgICAgIGlzc3VlLmRhdGUgPSBuZXcgRGF0ZSBjbG9zZWRfYXRcbiAgICAgIGlzc3VlLnBvaW50cyA9IHRvdGFsIC09IHNpemVcbiAgICAgIGlzc3VlXG4gICAgXG4gICAgIyBOb3cgYWRkIGEgcmFkaXVzIGluIGEgcmFuZ2UgKHdpbGwgYmUgdXNlZCBmb3IgYSBjaXJjbGUpLlxuICAgIHJhbmdlID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFsgbWluLCBtYXggXSkucmFuZ2UoWyA1LCA4IF0pXG5cbiAgICByZXN0ID0gXy5tYXAgcmVzdCwgKGlzc3VlKSAtPlxuICAgICAgaXNzdWUucmFkaXVzID0gcmFuZ2UgaXNzdWUuc2l6ZVxuICAgICAgaXNzdWVcblxuICAgIFtdLmNvbmNhdCBoZWFkLCByZXN0XG5cbiAgIyBBIGdyYXBoIG9mIGFuIGlkZWFsIHByb2dyZXNzaW9uLi5cbiAgIyBgYWA6ICAgbWlsZXN0b25lIHN0YXJ0IGRhdGVcbiAgIyBgYmA6ICAgbWlsZXN0b25lIGVuZCBkYXRlXG4gICMgYHRvdGFsYDogdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGlkZWFsOiAoYSwgYiwgdG90YWwpIC0+XG4gICAgIyBTd2FwP1xuICAgIFsgYiwgYSBdID0gWyBhLCBiIF0gaWYgYiA8IGFcblxuICAgICMgV2Ugc3RhcnQgaGVyZSBhZGRpbmcgZGF5cyB0byBgZGAuXG4gICAgWyB5LCBtLCBkIF0gPSBfLm1hcCBhLm1hdGNoKGNvbmZpZy5kYXRhLmNoYXJ0LmRhdGV0aW1lKVsxXS5zcGxpdCgnLScpLCAodikgLT4gcGFyc2VJbnQgdlxuICAgICMgV2Ugd2FudCB0byBlbmQgaGVyZS5cbiAgICBjdXRvZmYgPSBuZXcgRGF0ZShiKVxuXG4gICAgIyBHbyB0aHJvdWdoIHRoZSBiZWdpbm5pbmcgdG8gdGhlIGVuZCBza2lwcGluZyBvZmYgZGF5cy5cbiAgICBkYXlzID0gW10gOyBsZW5ndGggPSAwXG4gICAgZG8gb25jZSA9IChpbmMgPSAwKSAtPlxuICAgICAgIyBBIG5ldyBkYXkuXG4gICAgICBkYXkgPSBuZXcgRGF0ZSB5LCBtIC0gMSwgZCArIGluY1xuICAgICAgXG4gICAgICAjIERvZXMgdGhpcyBkYXkgY291bnQ/XG4gICAgICBkYXlfb2YgPSA3IGlmICFkYXlfb2YgPSBkYXkuZ2V0RGF5KClcbiAgICAgIGlmIGRheV9vZiBpbiBjb25maWcuZGF0YS5jaGFydC5vZmZfZGF5c1xuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXksIG9mZl9kYXk6IHllcyB9XG4gICAgICBlbHNlXG4gICAgICAgIGxlbmd0aCArPSAxXG4gICAgICAgIGRheXMucHVzaCB7IGRhdGU6IGRheSB9XG4gICAgICBcbiAgICAgICMgR28gYWdhaW4/XG4gICAgICBvbmNlKGluYyArIDEpIHVubGVzcyBkYXkgPiBjdXRvZmZcblxuICAgICMgTWFwIHBvaW50cyBvbiB0aGUgYXJyYXkgb2YgZGF5cyBub3cuXG4gICAgdmVsb2NpdHkgPSB0b3RhbCAvIChsZW5ndGggLSAxKVxuXG4gICAgZGF5cyA9IF8ubWFwIGRheXMsIChkYXksIGkpIC0+XG4gICAgICBkYXkucG9pbnRzID0gdG90YWxcbiAgICAgIHRvdGFsIC09IHZlbG9jaXR5IGlmIGRheXNbaV0gYW5kIG5vdCBkYXlzW2ldLm9mZl9kYXlcbiAgICAgIGRheVxuXG4gICAgIyBEbyB3ZSBuZWVkIHRvIG1ha2UgYSBsaW5rIHRvIHJpZ2h0IG5vdz9cbiAgICBkYXlzLnB1c2ggeyBkYXRlOiBub3csIHBvaW50czogMCB9IGlmIChub3cgPSBuZXcgRGF0ZSgpKSA+IGN1dG9mZlxuXG4gICAgZGF5c1xuXG4gICMgR3JhcGggcmVwcmVzZW50aW5nIGEgdHJlbmRsaW5nIG9mIGFjdHVhbCBpc3N1ZXMuXG4gIHRyZW5kOiAoYWN0dWFsLCBjcmVhdGVkX2F0LCBkdWVfb24pIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBhY3R1YWwubGVuZ3RoXG5cbiAgICBzdGFydCA9ICthY3R1YWxbMF0uZGF0ZVxuXG4gICAgIyBWYWx1ZXMgaXMgYSBsaXN0IG9mIHRpbWUgZnJvbSB0aGUgc3RhcnQgYW5kIHBvaW50cyByZW1haW5pbmcuXG4gICAgdmFsdWVzID0gXy5tYXAgYWN0dWFsLCAoeyBkYXRlLCBwb2ludHMgfSkgLT5cbiAgICAgIFsgK2RhdGUgLSBzdGFydCwgcG9pbnRzIF1cblxuICAgICMgTm93IGlzIGFuIGFjdHVhbCBwb2ludCB0b28uXG4gICAgbGFzdCA9IGFjdHVhbFthY3R1YWwubGVuZ3RoIC0gMV1cbiAgICB2YWx1ZXMucHVzaCBbICsgbmV3IERhdGUoKSAtIHN0YXJ0LCBsYXN0LnBvaW50cyBdXG5cbiAgICAjIGh0dHA6Ly9jbGFzc3Jvb20uc3lub255bS5jb20vY2FsY3VsYXRlLXRyZW5kbGluZS0yNzA5Lmh0bWxcbiAgICBiMSA9IDAgOyBlID0gMCA7IGMxID0gMFxuICAgIGEgPSAobCA9IHZhbHVlcy5sZW5ndGgpICogXy5yZWR1Y2UodmFsdWVzLCAoc3VtLCBbIGEsIGIgXSkgLT5cbiAgICAgIGIxICs9IGEgOyBlICs9IGJcbiAgICAgIGMxICs9IE1hdGgucG93KGEsIDIpXG4gICAgICBzdW0gKyAoYSAqIGIpXG4gICAgLCAwKVxuXG4gICAgc2xvcGUgPSAoYSAtIChiMSAqIGUpKSAvICgobCAqIGMxKSAtIChNYXRoLnBvdyhiMSwgMikpKVxuICAgIGludGVyY2VwdCA9IChlIC0gKHNsb3BlICogYjEpKSAvIGxcbiAgICBmbiA9ICh4KSAtPiBzbG9wZSAqIHggKyBpbnRlcmNlcHRcblxuICAgICMgTWlsZXN0b25lIGFsd2F5cyBoYXMgYSBjcmVhdGlvbiBkYXRlLlxuICAgIGNyZWF0ZWRfYXQgPSBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgIyBEdWUgZGF0ZSBjYW4gYmUgZW1wdHkuXG4gICAgZHVlX29uID0gaWYgZHVlX29uIHRoZW4gbmV3IERhdGUoZHVlX29uKSBlbHNlIG5ldyBEYXRlKClcblxuICAgIGEgPSBjcmVhdGVkX2F0IC0gc3RhcnRcbiAgICBiID0gZHVlX29uIC0gc3RhcnRcblxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgJ2RhdGUnOiBjcmVhdGVkX2F0XG4gICAgICAgICdwb2ludHMnOiBmbihhKVxuICAgICAgfSwge1xuICAgICAgICAnZGF0ZSc6IGR1ZV9vblxuICAgICAgICAncG9pbnRzJzogZm4oYilcbiAgICAgIH1cbiAgICBdIiwieyBfLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vdmVuZG9yLmNvZmZlZSdcblxuIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5jb25maWcgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL2NvbmZpZy5jb2ZmZWUnXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggaXNzdWVzIGZvciBhIG1pbGVzdG9uZS5cbiAgZmV0Y2hBbGw6IChyZXBvLCBjYikgLT5cbiAgICAjIENhbGN1bGF0ZSBzaXplIG9mIGVpdGhlciBvcGVuIG9yIGNsb3NlZCBpc3N1ZXMuXG4gICAgIyBNb2RpZmllcyBpc3N1ZXMgYnkgcmVmLlxuICAgIGNhbGNTaXplID0gKGxpc3QsIGNiKSAtPlxuICAgICAgc3dpdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnBvaW50c1xuICAgICAgICB3aGVuICdPTkVfU0laRSdcbiAgICAgICAgICBzaXplID0gbGlzdC5sZW5ndGhcblxuICAgICAgICAgICggaXNzdWUuc2l6ZSA9IDEgZm9yIGlzc3VlIGluIGxpc3QgKVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cbiAgICAgICAgXG4gICAgICAgIHdoZW4gJ0xBQkVMUydcbiAgICAgICAgICBzaXplID0gMFxuXG4gICAgICAgICAgbGlzdCA9IF8uZmlsdGVyIGxpc3QsIChpc3N1ZSkgLT5cbiAgICAgICAgICAgICMgU2tpcCBpZiBubyBsYWJlbHMgZXhpc3QuXG4gICAgICAgICAgICByZXR1cm4gbm8gdW5sZXNzIGxhYmVscyA9IGlzc3VlLmxhYmVsc1xuXG4gICAgICAgICAgICAjIERldGVybWluZSB0aGUgdG90YWwgaXNzdWUgc2l6ZSBmcm9tIGFsbCBsYWJlbHMuXG4gICAgICAgICAgICBpc3N1ZS5zaXplID0gXy5yZWR1Y2UgbGFiZWxzLCAoc3VtLCBsYWJlbCkgLT5cbiAgICAgICAgICAgICAgIyBOb3QgbWF0Y2hpbmcuXG4gICAgICAgICAgICAgIHJldHVybiBzdW0gdW5sZXNzIG1hdGNoZXMgPSBsYWJlbC5uYW1lLm1hdGNoIGNvbmZpZy5kYXRhLmNoYXJ0LnNpemVfbGFiZWxcbiAgICAgICAgICAgICAgIyBJbmNyZWFzZSBzdW0uXG4gICAgICAgICAgICAgIHN1bSArPSBwYXJzZUludCBtYXRjaGVzWzFdXG4gICAgICAgICAgICAsIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBJbmNyZWFzZSB0aGUgdG90YWwuXG4gICAgICAgICAgICBzaXplICs9IGlzc3VlLnNpemVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBBcmUgd2Ugc2F2aW5nIGl0P1xuICAgICAgICAgICAgISFpc3N1ZS5zaXplXG5cbiAgICAgICAgICBjYiBudWxsLCB7IGxpc3QsIHNpemUgfVxuXG4gICAgIyBGb3IgZWFjaCBzdGF0ZS4uLlxuICAgIG9uZVN0YXR1cyA9IChzdGF0ZSwgY2IpIC0+XG4gICAgICAjIENvbmNhdCB0aGVtIGhlcmUuXG4gICAgICByZXN1bHRzID0gW11cblxuICAgICAgIyBPbmUgcGFnZWZ1bCBmZXRjaCAobmV4dCBwYWdlcyBpbiBzZXJpZXMpLlxuICAgICAgZG8gZmV0Y2hQYWdlID0gKHBhZ2U9MSkgLT5cbiAgICAgICAgcmVxdWVzdC5hbGxJc3N1ZXMgcmVwbywgeyBzdGF0ZSwgcGFnZSB9LCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICMgRXJyb3JzP1xuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBFbXB0eT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAgICAgICAjIENvbmNhdCBzb3J0ZWQgKGFwaSBkb2VzIG5vdCBzb3J0IG9uIGNsb3NlZF9hdCEpLlxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBfLnNvcnRCeSBkYXRhLCAnY2xvc2VkX2F0J1xuICAgICAgICAgICMgPCAxMDAgcmVzdWx0cz9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCwgcmVzdWx0cyBpZiBkYXRhLmxlbmd0aCA8IDEwMFxuICAgICAgICAgICMgRmV0Y2ggdGhlIG5leHQgcGFnZSB0aGVuLlxuICAgICAgICAgIGZldGNoUGFnZSBwYWdlICsgMVxuXG4gICAgIyBGb3IgZWFjaCBgb3BlbmAgYW5kIGBjbG9zZWRgIGlzc3VlcyBpbiBwYXJhbGxlbC5cbiAgICBhc3luYy5wYXJhbGxlbCBbXG4gICAgICBfLnBhcnRpYWwgYXN5bmMud2F0ZXJmYWxsLCBbIF8ucGFydGlhbChvbmVTdGF0dXMsICdvcGVuJyksICAgY2FsY1NpemUgXVxuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnY2xvc2VkJyksIGNhbGNTaXplIF1cbiAgICBdLCAoZXJyLCBbIG9wZW4sIGNsb3NlZCBdKSAtPlxuICAgICAgY2IgZXJyLCB7IG9wZW4sIGNsb3NlZCB9IiwiIyEvdXNyL2Jpbi9lbnYgY29mZmVlXG5yZXF1ZXN0ID0gcmVxdWlyZSAnLi9yZXF1ZXN0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgRmV0Y2ggYSBtaWxlc3RvbmUuXG4gICdmZXRjaCc6IHJlcXVlc3Qub25lTWlsZXN0b25lXG5cbiAgIyBGZXRjaCBhbGwgbWlsZXN0b25lcy5cbiAgJ2ZldGNoQWxsJzogcmVxdWVzdC5hbGxNaWxlc3RvbmVzXG5cbiAgICAjICMgR2V0IHRoZSBjdXJyZW50IG1pbGVzdG9uZSBvdXQgb2YgbWFueS5cbiAgICAjIGVsc2VcbiAgICAjICAgcmVxdWVzdC5hbGxNaWxlc3RvbmVzIHJlcG8sIChlcnIsIGRhdGEpIC0+XG4gICAgIyAgICAgIyBFcnJvcnM/XG4gICAgIyAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAjICAgICAjIEVtcHR5IHdhcm5pbmc/XG4gICAgIyAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gb3BlbiBtaWxlc3RvbmVzIGZvciByZXBvICN7cmVwby5wYXRofVwiIHVubGVzcyBkYXRhLmxlbmd0aFxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuXG4gICAgIyAgICAgbSA9IGRhdGFbMF1cbiAgICAjICAgICAjIEZpbHRlciBtaWxlc3RvbmVzIHdpdGhvdXQgZHVlIGRhdGUuXG4gICAgIyAgICAgbSA9IF8ucmVzdCBkYXRhLCB7ICdkdWVfb24nIDogbnVsbCB9XG4gICAgIyAgICAgIyBUaGUgZmlyc3QgbWlsZXN0b25lIHNob3VsZCBiZSBlbmRpbmcgc29vbmVzdC4gUHJlZmVyIG1pbGVzdG9uZXMgd2l0aCBkdWUgZGF0ZXMuXG4gICAgIyAgICAgbSA9IGlmIG1bMF0gdGhlbiBtWzBdIGVsc2UgZGF0YVswXVxuICAgICMgICAgICMgRW1wdHkgbWlsZXN0b25lP1xuICAgICMgICAgIGlmIG0ub3Blbl9pc3N1ZXMgKyBtLmNsb3NlZF9pc3N1ZXMgaXMgMFxuICAgICMgICAgICAgcmV0dXJuIGNiIG51bGwsIFwiTm8gaXNzdWVzIGZvciBtaWxlc3RvbmUgYCN7bS50aXRsZX1gXCJcblxuICAgICMgICAgIGNiIG51bGwsIG51bGwsIG0iLCJ7IF8sIFN1cGVyQWdlbnQgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbnVzZXIgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5cbiMgQ3VzdG9tIEpTT04gcGFyc2VyLlxuU3VwZXJBZ2VudC5wYXJzZSA9XG4gICdhcHBsaWNhdGlvbi9qc29uJzogKHJlcykgLT5cbiAgICB0cnlcbiAgICAgIEpTT04ucGFyc2UgcmVzXG4gICAgY2F0Y2ggZVxuICAgICAge30gIyBpdCB3YXMgbm90IHRvIGJlLi4uXG5cbiMgRGVmYXVsdCBhcmdzLlxuZGVmYXVsdHMgPVxuICAnZ2l0aHViJzpcbiAgICAnaG9zdCc6ICdhcGkuZ2l0aHViLmNvbSdcbiAgICAncHJvdG9jb2wnOiAnaHR0cHMnXG5cbiMgUHVibGljIGFwaS5cbm1vZHVsZS5leHBvcnRzID1cbiAgXG4gICMgR2V0IGEgcmVwby5cbiAgcmVwbzogKHsgb3duZXIsIG5hbWUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX1cIlxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBvcGVuIG1pbGVzdG9uZXMuXG4gIGFsbE1pbGVzdG9uZXM6ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPiBcbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzXCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG4gIFxuICAjIEdldCBvbmUgb3BlbiBtaWxlc3RvbmUuXG4gIG9uZU1pbGVzdG9uZTogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L21pbGVzdG9uZXMvI3ttaWxlc3RvbmV9XCJcbiAgICAgICAgJ3F1ZXJ5JzogIHsgJ3N0YXRlJzogJ29wZW4nLCAnc29ydCc6ICdkdWVfZGF0ZScsICdkaXJlY3Rpb24nOiAnYXNjJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiAgIyBHZXQgYWxsIGlzc3VlcyBmb3IgYSBzdGF0ZS5cbiAgYWxsSXNzdWVzOiAoeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIHF1ZXJ5LCBjYikgLT5cbiAgICByZXR1cm4gY2IgJ1JlcXVlc3QgaXMgbWFsZm9ybWVkJyB1bmxlc3MgaXNWYWxpZCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9L2lzc3Vlc1wiXG4gICAgICAgICdxdWVyeSc6ICBfLmV4dGVuZCBxdWVyeSwgeyBtaWxlc3RvbmUsICdwZXJfcGFnZSc6ICcxMDAnIH1cbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuIyBNYWtlIGEgcmVxdWVzdCB1c2luZyBTdXBlckFnZW50LlxucmVxdWVzdCA9ICh7IHByb3RvY29sLCBob3N0LCBwYXRoLCBxdWVyeSwgaGVhZGVycyB9LCBjYikgLT5cbiAgZXhpdGVkID0gbm9cblxuICAjIE1ha2UgdGhlIHF1ZXJ5IHBhcmFtcy5cbiAgcSA9IGlmIHF1ZXJ5IHRoZW4gJz8nICsgKCBcIiN7a309I3t2fVwiIGZvciBrLCB2IG9mIHF1ZXJ5ICkuam9pbignJicpIGVsc2UgJydcblxuICAjIFRoZSBVUkkuXG4gIHJlcSA9IFN1cGVyQWdlbnQuZ2V0KFwiI3twcm90b2NvbH06Ly8je2hvc3R9I3twYXRofSN7cX1cIilcbiAgIyBBZGQgaGVhZGVycy5cbiAgKCByZXEuc2V0KGssIHYpIGZvciBrLCB2IG9mIGhlYWRlcnMgKVxuICBcbiAgIyBUaW1lb3V0IGZvciByZXF1ZXN0cyB0aGF0IGRvIG5vdCBmaW5pc2guLi4gc2VlICMzMi5cbiAgdGltZW91dCA9IHNldFRpbWVvdXQgLT5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjYiAnUmVxdWVzdCBoYXMgdGltZWQgb3V0J1xuICAsIDFlNCAjIGdpdmUgdXMgMTBzXG5cbiAgIyBTZW5kLlxuICByZXEuZW5kIChlcnIsIGRhdGEpIC0+XG4gICAgIyBBcnJpdmVkIHRvbyBsYXRlLlxuICAgIHJldHVybiBpZiBleGl0ZWRcbiAgICAjIEFsbCBmaW5lLlxuICAgIGV4aXRlZCA9IHllc1xuICAgIGNsZWFyVGltZW91dCB0aW1lb3V0XG4gICAgIyBBY3R1YWxseSBwcm9jZXNzIHRoZSByZXNwb25zZS5cbiAgICByZXNwb25zZSBlcnIsIGRhdGEsIGNiXG5cbiMgSG93IGRvIHdlIHJlc3BvbmQgdG8gYSByZXNwb25zZT9cbnJlc3BvbnNlID0gKGVyciwgZGF0YSwgY2IpIC0+XG4gIHJldHVybiBjYiBlcnJvciBlcnIgaWYgZXJyXG4gICMgMnh4P1xuICBpZiBkYXRhLnN0YXR1c1R5cGUgaXNudCAyXG4gICAgIyBEbyB3ZSBoYXZlIGEgbWVzc2FnZSBmcm9tIEdpdEh1Yj9cbiAgICByZXR1cm4gY2IgZGF0YS5ib2R5Lm1lc3NhZ2UgaWYgZGF0YT8uYm9keT8ubWVzc2FnZT9cbiAgICAjIFVzZSBTQSBvbmUuXG4gICAgcmV0dXJuIGNiIGRhdGEuZXJyb3IubWVzc2FnZVxuICAjIEFsbCBnb29kLlxuICBjYiBudWxsLCBkYXRhLmJvZHlcblxuIyBHaXZlIHVzIGhlYWRlcnMuXG5oZWFkZXJzID0gKHRva2VuKSAtPlxuICAjIFRoZSBkZWZhdWx0cy5cbiAgaCA9XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52MydcbiAgIyBBZGQgdG9rZW4/XG4gIGguQXV0aG9yaXphdGlvbiA9IFwidG9rZW4gI3t0b2tlbn1cIiBpZiB0b2tlbj9cbiAgaFxuXG5pc1ZhbGlkID0gKG9iaikgLT5cbiAgcnVsZXMgPVxuICAgICdvd25lcic6ICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ25hbWUnOiAgICAgICh2YWwpIC0+IHZhbD9cbiAgICAnbWlsZXN0b25lJzogKHZhbCkgLT4gXy5pc0ludCB2YWxcbiAgXG4gICggcmV0dXJuIG5vIGZvciBrZXksIHZhbCBvZiBvYmogd2hlbiBrZXkgb2YgcnVsZXMgYW5kIG5vdCBydWxlc1trZXldKHZhbCkgKVxuXG4gIHllc1xuXG4jIFN3aXRjaCB3aGVuIHVzZXIgaXMgcmVhZHkuXG5pc1JlYWR5ID0gdXNlci5kYXRhLnJlYWR5XG5cbiMgQSBzdGFjayBvZiByZXF1ZXN0cyB0byBleGVjdXRlIG9uY2UgcmVhZHkuXG5zdGFjayA9IFtdXG5yZWFkeSA9IChjYikgLT5cbiAgaWYgaXNSZWFkeSB0aGVuIGRvIGNiIGVsc2Ugc3RhY2sucHVzaCBjYlxuXG4jIE9ic2VydmUgdXNlcidzIHJlYWRpbmVzcy5cbnVzZXIub2JzZXJ2ZSAncmVhZHknLCAodmFsKSAtPlxuICBpc1JlYWR5ID0gdmFsXG4gICMgQ2xlYXIgdGhlIHN0YWNrP1xuICAoIGRvIHN0YWNrLnNoaWZ0KCkgd2hpbGUgc3RhY2subGVuZ3RoICkgaWYgdmFsXG5cbiMgUGFyc2UgYW4gZXJyb3IuXG5lcnJvciA9IChlcnIpIC0+XG4gIHN3aXRjaFxuICAgIHdoZW4gXy5pc1N0cmluZyBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJcbiAgICB3aGVuIF8uaXNBcnJheSBlcnJcbiAgICAgIG1lc3NhZ2UgPSBlcnJbMV1cbiAgICB3aGVuIF8uaXNPYmplY3QoZXJyKSBhbmQgXy5pc1N0cmluZyhlcnIubWVzc2FnZSlcbiAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuXG4gIHVubGVzcyBtZXNzYWdlXG4gICAgdHJ5XG4gICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkgZXJyXG4gICAgY2F0Y2hcbiAgICAgIG1lc3NhZ2UgPSBkbyBlcnIudG9TdHJpbmdcblxuICBtZXNzYWdlIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbk1lZGlhdG9yID0gUmFjdGl2ZS5leHRlbmQge31cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWVkaWF0b3IoKSIsInsgXywgZGlyZWN0b3IgfSA9IHJlcXVpcmUgJy4vdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuL21lZGlhdG9yLmNvZmZlZSdcbnN5c3RlbSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5cbmVsID0gJyNwYWdlJ1xuXG5wYWdlcyA9XG4gIFwiaW5kZXhcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL2luZGV4LmNvZmZlZVwiXG4gIFwibWlsZXN0b25lXCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlXCJcbiAgXCJuZXdcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL25ldy5jb2ZmZWVcIlxuICBcInByb2plY3RcIjogcmVxdWlyZSBcIi4uL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlXCJcblxuIyBBZGQgYSBwcm9qZWN0IGZyb20gYSByb3V0ZS5cbmFkZFByb2plY3QgPSAocGFnZSwgb3duZXIsIG5hbWUpIC0+XG4gIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH1cblxuIyBQcmVhcHBseSBhbGwgZnVuY3Rpb25zIHdpdGggb3VyIHBhZ2UgbmFtZS9jb250ZXh0LlxuYyA9IChuYW1lLCBmbnM9W10pIC0+XG4gICggXy5wYXJ0aWFsIGZuLCBuYW1lIGZvciBmbiBpbiBmbnMgKVxuXG52aWV3ID0gbnVsbFxucm91dGUgPSAocGFnZSwgYXJncy4uLikgLT5cbiAgIyBVbnJlbmRlciB0aGUgcHJldmlvdXMgb25lLlxuICBkbyB2aWV3Py50ZWFyZG93blxuICAjIEhpZGUgYW55IG5vdGlmaWNhdGlvbnMuXG4gIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5L2hpZGUnXG4gICMgUmVxdWlyZSB0aGUgbmV3IG9uZS5cbiAgUGFnZSA9IHBhZ2VzW3BhZ2VdXG4gICMgUmVuZGVyIGl0LlxuICB2aWV3ID0gbmV3IFBhZ2UgeyBlbCwgJ2RhdGEnOiB7ICdyb3V0ZSc6IGFyZ3MgfSB9XG5cbnJvdXRlcyA9XG4gICcvJzogICAgICAgICAgICAgICAgICAgICAgICBjICdpbmRleCcsIFsgcm91dGUgXVxuICAnL25ldy9wcm9qZWN0JzogICAgICAgICAgICAgYyAnbmV3JywgICBbIHJvdXRlIF1cbiAgIyBUaGUgZm9sbG93aW5nIHR3byByb3V0ZXMgYWRkIGEgcHJvamVjdCBpbiB0aGUgYmFja2dyb3VuZC5cbiAgJy86b3duZXIvOm5hbWUnOiAgICAgICAgICAgIGMgJ3Byb2plY3QnLCAgIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAnLzpvd25lci86bmFtZS86bWlsZXN0b25lJzogYyAnbWlsZXN0b25lJywgWyBhZGRQcm9qZWN0LCByb3V0ZSBdXG4gICMgVE9ETzogcmVtb3ZlIGluIHByb2R1Y3Rpb24uXG4gICcvcmVzZXQnOiAtPlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9jbGVhcidcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcjJ1xuXG4jIEZsYXRpcm9uIERpcmVjdG9yIHJvdXRlci5cbm1vZHVsZS5leHBvcnRzID0gZGlyZWN0b3IuUm91dGVyKHJvdXRlcykuY29uZmlndXJlXG4gICdzdHJpY3QnOiBubyAjIGFsbG93IHRyYWlsaW5nIHNsYXNoZXNcbiAgbm90Zm91bmQ6IC0+XG4gICAgdGhyb3cgNDA0IiwieyBtb21lbnQgfSAgPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbiMgUHJvZ3Jlc3MgaW4gJS5cbnByb2dyZXNzID0gKGEsIGIpIC0+IDEwMCAqIChhIC8gKGIgKyBhKSlcblxuIyBDYWxjdWxhdGUgdGhlIHN0YXRzIGZvciBhIG1pbGVzdG9uZS5cbiMgIElzIGl0IG9uIHRpbWU/IFdoYXQgaXMgdGhlIHByb2dyZXNzP1xubW9kdWxlLmV4cG9ydHMgPSAobWlsZXN0b25lKSAtPlxuICAgICMgUHJvZ3Jlc3MgaW4gcG9pbnRzLlxuICAgIHBvaW50cyA9IHByb2dyZXNzIG1pbGVzdG9uZS5pc3N1ZXMuY2xvc2VkLnNpemUsIG1pbGVzdG9uZS5pc3N1ZXMub3Blbi5zaXplICAgIFxuICAgIFxuICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGR1ZSBkYXRlIGFyZSBhbHdheXMgb24gdHJhY2suXG4gICAgcmV0dXJuIHsgJ2lzT25UaW1lJzogeWVzLCAncHJvZ3Jlc3MnOiB7IHBvaW50cyB9IH0gdW5sZXNzIG1pbGVzdG9uZS5kdWVfb25cblxuICAgIGEgPSArbmV3IERhdGUgbWlsZXN0b25lLmNyZWF0ZWRfYXRcbiAgICBiID0gK25ldyBEYXRlXG4gICAgYyA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIFByb2dyZXNzIGluIHRpbWUuXG4gICAgdGltZSA9IHByb2dyZXNzIGIgLSBhLCBjIC0gYlxuXG4gICAgIyBIb3cgbWFueSBkYXlzIGlzIDElIG9mIHRoZSB0aW1lP1xuICAgIGRheXMgPSAobW9tZW50KGEpLmRpZmYobW9tZW50KGIpLCAnZGF5cycpKSAvIDEwMFxuXG4gICAge1xuICAgICAgJ2lzT25UaW1lJzogcG9pbnRzID4gdGltZVxuICAgICAgJ3Byb2dyZXNzJzogeyBwb2ludHMsIHRpbWUgfVxuICAgICAgJ2RheXMnOiAgICAgZGF5c1xuICAgIH0iLCIjIEFsbCBvdXIgdmVuZG9yIGRlcGVuZGVuY2llcyBpbiBvbmUgcGxhY2UuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICdfJzogd2luZG93Ll9cbiAgJ1JhY3RpdmUnOiB3aW5kb3cuUmFjdGl2ZVxuICAnRmlyZWJhc2UnOiB3aW5kb3cuRmlyZWJhc2VcbiAgJ0ZpcmViYXNlU2ltcGxlTG9naW4nOiB3aW5kb3cuRmlyZWJhc2VTaW1wbGVMb2dpblxuICAnU3VwZXJBZ2VudCc6IHdpbmRvdy5zdXBlcmFnZW50XG4gICdhc3luYyc6IHdpbmRvdy5hc3luY1xuICAnbW9tZW50Jzogd2luZG93Lm1vbWVudFxuICAnZDMnOiB3aW5kb3cuZDNcbiAgJ21hcmtlZCc6IHdpbmRvdy5tYXJrZWRcbiAgJ2RpcmVjdG9yJzpcbiAgICAnUm91dGVyJzogd2luZG93LlJvdXRlclxuICAnbHNjYWNoZSc6IHdpbmRvdy5sc2NhY2hlXG4gICdzb3J0ZWRJbmRleENtcCc6IHdpbmRvdy5zb3J0ZWRJbmRleCIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJhcHBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTm90aWZ5XCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiSGVhZGVyXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInBhZ2VcIn0sXCJmXCI6W119LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImZvb3RlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbXCImY29weTsgMjAxMi0yMDE0IFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcImh0dHA6Ly9jbG91ZGZpLnJlXCJ9LFwiZlwiOltcIkNsb3VkZmlyZSBTeXN0ZW1zXCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNoYXJ0XCJ9fV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImhlYWRcIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUzLFwiclwiOlwidXNlclwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInJpZ2h0XCJ9LFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJkaXNwbGF5TmFtZVwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcImRpc3BsYXlOYW1lXCJ9LFwiIGxvZ2dlZCBpblwiXX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJnaXRodWJcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcIiFsb2dpblwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImdpdGh1YlwifX0sXCIgU2lnbiBJblwiXX1dLFwiclwiOlwiZGlzcGxheU5hbWVcIn1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaWRcIjpcImljb25cIixcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidWxcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjbmV3L3Byb2plY3RcIixcImNsYXNzXCI6XCJhZGRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJwbHVzLWNpcmNsZWRcIn19LFwiIEFkZCBhIFByb2plY3RcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJsaVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwiZmFxXCJ9LFwiZlwiOltcIkZBUVwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNyZXNldFwifSxcImZcIjpbXCJEQiBSZXNldFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNub3RpZnlcIn0sXCJmXCI6W1wiTm90aWZ5XCJdfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImhlcm9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImNvbnRlbnRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJhZGRyZXNzXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiU2VlIHlvdXIgcHJvamVjdCBwcm9ncmVzc1wiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W1wiTm90IHN1cmUgd2hlcmUgdG8gc3RhcnQ/IEp1c3QgYWRkIGEgZGVtbyByZXBvIHRvIHNlZSBhIGNoYXJ0LiBUaGVyZSBhcmUgbWFueSB2YXJpYXRpb25zIG9mIHBhc3NhZ2VzIG9mIExvcmVtIElwc3VtIGF2YWlsYWJsZSwgYnV0IHRoZSBtYWpvcml0eSBoYXZlIHN1ZmZlcmVkIGFsdGVyYXRpb24gaW4gc29tZSBmb3JtLCBieSBpbmplY3RlZCBodW1vdXIsIG9yIHJhbmRvbWlzZWQgd29yZHMgd2hpY2ggZG9uJ3QgbG9vayBldmVuIHNsaWdodGx5IGJlbGlldmFibGUuXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJjdGFcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcInByaW1hcnlcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJwbHVzLWNpcmNsZWRcIn19LFwiIEFkZCB5b3VyIHByb2plY3RcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJzZWNvbmRhcnlcIn0sXCJmXCI6W1wiUmVhZCB0aGUgR3VpZGVcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJjb2RlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6W1wiaWNvbiBcIix7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImNvZGVcIl0sXCJzXCI6XCJcXFwiJiNcXFwiK18wK1xcXCI7XFxcIlwifX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJ0ZXh0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwic3lzdGVtXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9LFwiIHN5c3RlbVwiXSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwiclwiOlwidG9wXCJ9LFwiJVwiXX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6W3tcInRcIjoyLFwiclwiOlwiaWNvblwifV19fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbe1widFwiOjIsXCJyXCI6XCJ0ZXh0XCJ9XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJub3RpZnlcIixcImNsYXNzXCI6W3tcInRcIjoyLFwiclwiOlwidHlwZVwifV0sXCJzdHlsZVwiOltcInRvcDpcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1widG9wXCJdLFwic1wiOlwiLV8wXCJ9fSxcInB4XCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImNsb3NlXCJ9LFwidlwiOntcImNsaWNrXCI6XCJjbG9zZVwifX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XSxcInJcIjpcInN5c3RlbVwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwicHJvamVjdHMubGlzdFwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInJlYWR5XCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIlByb2plY3RzXCIsXCJhXCI6e1wicHJvamVjdHNcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0c1wifV19fV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJIZXJvXCJ9XSxcInJcIjpcInByb2plY3RzLmxpc3RcIn1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJhXCI6e1wiY2xhc3NcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUudGl0bGVcIl0sXCJzXCI6XCJfMC50aXRsZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInN1YlwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwibWlsZXN0b25lLmR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJhXCI6e1wiY2xhc3NcIjpcImRlc2NyaXB0aW9uXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZGVzY3JpcHRpb25cIl0sXCJzXCI6XCJfMC5tYXJrZG93bihfMSlcIn19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkNoYXJ0XCIsXCJhXCI6e1wibWlsZXN0b25lXCI6W3tcInRcIjoyLFwiclwiOlwibWlsZXN0b25lXCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiQWRkIGEgUHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W1wiVHlwZSBpbiB0aGUgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSBhcyB5b3Ugd291bGQgbm9ybWFsbHkuIElmIHlvdSdkIGxpa2UgdG8gYWRkIGEgcHJpdmF0ZSBHaXRIdWIgcHJvamVjdCwgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wifSxcImZcIjpbXCJTaWduIEluXCJdfSxcIiBmaXJzdC5cIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9ybVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRyXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJpbnB1dFwiLFwiYVwiOntcInR5cGVcIjpcInRleHRcIixcInBsYWNlaG9sZGVyXCI6XCJ1c2VyL3JlcG9cIixcImF1dG9jb21wbGV0ZVwiOlwib2ZmXCIsXCJ2YWx1ZVwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX0sXCJ2XCI6e1wia2V5dXBcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwidlwiOntcImNsaWNrXCI6e1wiblwiOlwic3VibWl0XCIsXCJkXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfX0sXCJmXCI6W1wiQWRkXCJdfV19XX1dfV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJhXCI6e1wiY2xhc3NcIjpcInRpdGxlXCJ9LFwiZlwiOlt7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wicm91dGVcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCIvXFxcIilcIn19XX1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImNvbnRlbnRcIixcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIk1pbGVzdG9uZXNcIixcImFcIjp7XCJwcm9qZWN0XCI6W3tcInRcIjoyLFwiclwiOlwicHJvamVjdFwifV19fV19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInByb2plY3RzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJzb3J0XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IHByaW9yaXR5XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiTWlsZXN0b25lc1wiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicHJvamVjdC5taWxlc3RvbmVzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwibWlsZXN0b25lXCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5vd25lclwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcInByb2plY3QubmFtZVwifSxcIi9cIix7XCJ0XCI6MixcInJcIjpcIm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRpdGxlXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wic3R5bGVcIjpcIndpZHRoOjElXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9ncmVzc1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInBlcmNlbnRcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJzdGF0cy5wcm9ncmVzcy5wb2ludHNcIl0sXCJzXCI6XCJNYXRoLmZsb29yKF8wKVwifX0sXCIlXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZHVlXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJkdWVfb25cIl0sXCJzXCI6XCJfMC5kdWUoXzEpXCJ9fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIm91dGVyIGJhclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOltcImlubmVyIGJhciBcIix7XCJ0XCI6MixcInhcIjp7XCJyXCI6W1wic3RhdHMuaXNPblRpbWVcIl0sXCJzXCI6XCIoXzApP1xcXCJncmVlblxcXCI6XFxcInJlZFxcXCJcIn19XSxcInN0eWxlXCI6W1wid2lkdGg6XCIse1widFwiOjIsXCJyXCI6XCJzdGF0cy5wcm9ncmVzcy5wb2ludHNcIn0sXCIlXCJdfX1dfV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJwcm9qZWN0c1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiaGVhZGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCIsXCJjbGFzc1wiOlwic29ydFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInNvcnQtYWxwaGFiZXRcIn19LFwiIFNvcnRlZCBieSBwcmlvcml0eVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJoMlwiLFwiZlwiOltcIlByb2plY3RzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0cy5pbmRleFwiLFwiZlwiOlt7XCJ0XCI6NCxcInhcIjp7XCJyXCI6W1wiLlwiXSxcInNcIjpcIntpbmRleDpfMH1cIn0sXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4wXCIsXCJwcm9qZWN0cy5saXN0XCJdLFwic1wiOlwie3Byb2plY3Q6XzFbXzBdfVwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTMsXCJyXCI6XCJwcm9qZWN0XCIsXCJmXCI6W3tcInRcIjo0LFwiblwiOjUwLFwiclwiOlwiZXJyb3JzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNvbHNwYW5cIjpcIjNcIixcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9qZWN0XCJ9LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiZXJyb3JcIixcInRpdGxlXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJlcnJvcnNcIl0sXCJzXCI6XCJfMC5qb2luKFxcXCJcXFxcblxcXCIpXCJ9fV19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiYXR0ZW50aW9uXCJ9fV19XX1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo0LFwieFwiOntcInJcIjpbXCJpbmRleC4xXCIsXCJwcm9qZWN0Lm1pbGVzdG9uZXNcIl0sXCJzXCI6XCJ7bWlsZXN0b25lOl8xW18wXX1cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvamVjdFwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwibWlsZXN0b25lXCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibWlsZXN0b25lLm51bWJlclwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRpdGxlXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wic3R5bGVcIjpcIndpZHRoOjElXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJwcm9ncmVzc1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcInBlcmNlbnRcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJtaWxlc3RvbmUuc3RhdHMucHJvZ3Jlc3MucG9pbnRzXCJdLFwic1wiOlwiTWF0aC5mbG9vcihfMClcIn19LFwiJVwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpcImR1ZVwifSxcImZcIjpbe1widFwiOjMsXCJ4XCI6e1wiclwiOltcImZvcm1hdFwiLFwiZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJvdXRlciBiYXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpbm5lciBiYXIgXCIse1widFwiOjIsXCJ4XCI6e1wiclwiOltcIm1pbGVzdG9uZS5zdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcIm1pbGVzdG9uZS5zdGF0cy5wcm9ncmVzcy5wb2ludHNcIn0sXCIlXCJdfX1dfV19XX1dfV19XSxcInJcIjpcImVycm9yc1wifV19XX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiY29nXCJ9fSxcIiBFZGl0XCJdfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzID1cbiAgbm93OiAtPiBuZXcgRGF0ZSgpLnRvSlNPTigpIiwieyBfLCBtb21lbnQsIG1hcmtlZCB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgIyBUaW1lIGZyb20gbm93LlxuICBmcm9tTm93OiBfLm1lbW9pemUgKGpzb25EYXRlKSAtPlxuICAgIG1vbWVudChuZXcgRGF0ZShqc29uRGF0ZSkpLmZyb21Ob3coKVxuXG4gICMgV2hlbiBpcyBhIG1pbGVzdG9uZSBkdWU/XG4gIGR1ZTogKGpzb25EYXRlKSAtPlxuICAgIHJldHVybiAnJm5ic3A7JyB1bmxlc3MganNvbkRhdGVcbiAgICBbICdkdWUnLCBAZnJvbU5vdyBqc29uRGF0ZSBdLmpvaW4oJyAnKVxuXG4gICMgTWFya2Rvd24gZm9ybWF0dGluZy5cbiAgbWFya2Rvd246IChtYXJrdXApIC0+XG4gICAgbWFya2VkIG1hcmt1cFxuXG4gICMgRm9ybWF0IG1pbGVzdG9uZSB0aXRsZS5cbiAgdGl0bGU6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtaWxlc3RvbmUnKSA+IC0xXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgWyAnTWlsZXN0b25lJywgdGV4dCBdLmpvaW4oJyAnKVxuXG4gICMgSGV4IHRvIGRlY2ltYWwuXG4gIGhleFRvRGVjOiAoaGV4KSAtPlxuICAgIHBhcnNlSW50IGhleCwgMTYiLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGlzOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC50eXBlIGluIFsgJ2tleXVwJywgJ2tleWRvd24nIF1cblxuICBpc0VudGVyOiAoZXZ0KSAtPlxuICAgIGV2dC5vcmlnaW5hbC53aGljaCBpcyAxMyIsInsgXyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5fLm1peGluXG4gICdwbHVja01hbnknOiAoc291cmNlLCBrZXlzKSAtPlxuICAgIHRocm93ICdga2V5c2AgbmVlZHMgdG8gYmUgYW4gQXJyYXknIHVubGVzcyBfLmlzQXJyYXkga2V5c1xuICAgIF8ubWFwIHNvdXJjZSwgKGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgXy5lYWNoIGtleXMsIChrZXkpIC0+XG4gICAgICAgIG9ialtrZXldID0gaXRlbVtrZXldXG4gICAgICBvYmpcblxuICAnaXNJbnQnOiAodmFsKSAtPlxuICAgIG5vdCBpc05hTih2YWwpIGFuZCBwYXJzZUludChOdW1iZXIodmFsKSkgaXMgdmFsIGFuZCBub3QgaXNOYU4ocGFyc2VJbnQodmFsLCAxMCkpIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdHMpIC0+XG4gIE1vZGVsID0gUmFjdGl2ZS5leHRlbmQob3B0cylcbiAgbW9kZWwgPSBuZXcgTW9kZWwoKVxuICBtb2RlbC5yZW5kZXIoKVxuICBtb2RlbCIsIiMgQmluYXJ5IHNlYXJjaCBpbXBsZW1lbnRhdGlvbiB3aXRoIGEgY3VzdG9tIGNvbXBhcmF0b3IgZnVuY3Rpb24uXG5tb2R1bGUuZXhwb3J0cyA9IChhcnIsIGl0ZW0sIGNvbXBhcmF0b3IpIC0+XG4gICMgTnVtZXJpYyBjb21wYXJhdG9yLlxuICBjb21wYXJhdG9yID89IChhLCBiKSAtPlxuICAgIHN3aXRjaFxuICAgICAgd2hlbiBhIDwgYiB0aGVuIC0xXG4gICAgICB3aGVuIGEgPsKgYiB0aGVuICsxXG4gICAgICBlbHNlIDBcblxuICBtaW5JbmRleCA9IDBcbiAgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMVxuICBcbiAgd2hpbGUgbWluSW5kZXggPD0gbWF4SW5kZXhcbiAgICBpbmRleCA9IChtaW5JbmRleCArIG1heEluZGV4KSAvIDIgfCAwXG4gICAgZXhpc3RpbmcgPSBhcnJbaW5kZXhdXG4gICAgXG4gICAgcmVzID0gY29tcGFyYXRvciBleGlzdGluZywgaXRlbVxuICAgIHN3aXRjaFxuICAgICAgd2hlbiByZXN1bHQgPCAwIHRoZW4gbWluSW5kZXggPSBpbmRleCArIDFcbiAgICAgIHdoZW4gcmVzdWx0ID4gMCB0aGVuIG1heEluZGV4ID0gaW5kZXggLSAxXG4gICAgICBlbHNlIHJldHVybiBpbmRleFxuXG4gIC0xIiwieyBSYWN0aXZlLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5saW5lcyA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlJ1xuYXhlcyAgPSByZXF1aXJlICcuLi9tb2R1bGVzL2NoYXJ0L2F4ZXMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2NoYXJ0Lmh0bWwnXG5cbiAgb25jb21wbGV0ZTogLT5cbiAgICBtaWxlc3RvbmUgPSBAZGF0YS5taWxlc3RvbmVcbiAgICBpc3N1ZXMgPSBtaWxlc3RvbmUuaXNzdWVzXG4gICAgIyBUb3RhbCBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBtaWxlc3RvbmUuXG4gICAgdG90YWwgPSBpc3N1ZXMub3Blbi5zaXplICsgaXNzdWVzLmNsb3NlZC5zaXplXG5cblxuICAgICMgQW4gaXNzdWUgbWF5IGhhdmUgYmVlbiBjbG9zZWQgYmVmb3JlIHRoZSBzdGFydCBvZiBhIG1pbGVzdG9uZS5cbiAgICBoZWFkID0gaXNzdWVzLmNsb3NlZC5saXN0WzBdLmNsb3NlZF9hdFxuICAgIGlmIGlzc3Vlcy5sZW5ndGggYW5kIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID4gaGVhZFxuICAgICAgIyBUaGlzIGlzIHRoZSBuZXcgc3RhcnQuXG4gICAgICBtaWxlc3RvbmUuY3JlYXRlZF9hdCA9IGhlYWRcblxuICAgICMgQWN0dWFsLCBpZGVhbCAmIHRyZW5kIGxpbmVzLlxuICAgIGFjdHVhbCA9IGxpbmVzLmFjdHVhbCBpc3N1ZXMuY2xvc2VkLmxpc3QsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCB0b3RhbFxuICAgIGlkZWFsICA9IGxpbmVzLmlkZWFsIG1pbGVzdG9uZS5jcmVhdGVkX2F0LCBtaWxlc3RvbmUuZHVlX29uLCB0b3RhbFxuICAgIHRyZW5kICA9IGxpbmVzLnRyZW5kIGFjdHVhbCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb25cblxuICAgICMgR2V0IGF2YWlsYWJsZSBzcGFjZS5cbiAgICB7IGhlaWdodCwgd2lkdGggfSA9IGRvIEBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3RcblxuICAgIG1hcmdpbiA9IHsgJ3RvcCc6IDMwLCAncmlnaHQnOiAzMCwgJ2JvdHRvbSc6IDQwLCAnbGVmdCc6IDUwIH1cbiAgICB3aWR0aCAtPSBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodFxuICAgIGhlaWdodCAtPSBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbVxuXG4gICAgIyBTY2FsZXMuXG4gICAgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbIDAsIHdpZHRoIF0pXG4gICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpLnJhbmdlKFsgaGVpZ2h0LCAwIF0pXG5cbiAgICAjIEF4ZXMuXG4gICAgeEF4aXMgPSBheGVzLmhvcml6b250YWwgaGVpZ2h0LCB4XG4gICAgeUF4aXMgPSBheGVzLnZlcnRpY2FsIHdpZHRoLCB5XG5cbiAgICAjIExpbmUgZ2VuZXJhdG9yLlxuICAgIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgLmludGVycG9sYXRlKFwibGluZWFyXCIpXG4gICAgLngoIChkKSAtPiB4KGQuZGF0ZSkgKVxuICAgIC55KCAoZCkgLT4geShkLnBvaW50cykgKVxuXG4gICAgIyBHZXQgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gZGF0ZSwgYW5kIGluaXRpYWwgcG9pbnRzLlxuICAgIHguZG9tYWluKFsgaWRlYWxbMF0uZGF0ZSwgaWRlYWxbaWRlYWwubGVuZ3RoIC0gMV0uZGF0ZSBdKVxuICAgIHkuZG9tYWluKFsgMCwgaWRlYWxbMF0ucG9pbnRzIF0pLm5pY2UoKVxuXG4gICAgIyBBZGQgYW4gU1ZHIGVsZW1lbnQgd2l0aCB0aGUgZGVzaXJlZCBkaW1lbnNpb25zIGFuZCBtYXJnaW4uXG4gICAgc3ZnID0gZDMuc2VsZWN0KHRoaXMuZWwucXVlcnlTZWxlY3RvcignI2NoYXJ0JykpLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcblxuICAgICMgQWRkIHRoZSBkYXlzIHgtYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXMgZGF5XCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwoeEF4aXMpXG5cbiAgICAjIEFkZCB0aGUgbW9udGhzIHgtYXhpcy5cbiAgICBtID0gW1xuICAgICAgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJyxcbiAgICAgICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYydcbiAgICBdXG5cbiAgICBtQXhpcyA9IHhBeGlzXG4gICAgLm9yaWVudChcInRvcFwiKVxuICAgIC50aWNrU2l6ZShoZWlnaHQpXG4gICAgLnRpY2tGb3JtYXQoIChkKSAtPiBtW2QuZ2V0TW9udGgoKV0gKVxuICAgIC50aWNrcygyKVxuICAgIFxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBtb250aFwiKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsI3toZWlnaHR9KVwiKVxuICAgIC5jYWxsKG1BeGlzKVxuXG4gICAgIyBBZGQgdGhlIHktYXhpcy5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAuY2FsbCh5QXhpcylcblxuICAgICMgQWRkIGEgbGluZSBzaG93aW5nIHdoZXJlIHdlIGFyZSBub3cuXG4gICAgc3ZnLmFwcGVuZChcInN2ZzpsaW5lXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5XCIpXG4gICAgLmF0dHIoXCJ4MVwiLCB4KG5ldyBEYXRlKCkpKVxuICAgIC5hdHRyKFwieTFcIiwgMClcbiAgICAuYXR0cihcIngyXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHQpXG5cbiAgICAjIEFkZCB0aGUgaWRlYWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImlkZWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImJhc2lzXCIpKGlkZWFsKSlcblxuICAgICMgQWRkIHRoZSB0cmVuZGxpbmUgcGF0aC5cbiAgICBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVuZGxpbmUgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwibGluZWFyXCIpKHRyZW5kKSlcblxuICAgICMgQWRkIHRoZSBhY3R1YWwgbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImFjdHVhbCBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikueSggKGQpIC0+IHkoZC5wb2ludHMpICkoYWN0dWFsKSlcblxuICAgICMgQ29sbGVjdCB0aGUgdG9vbHRpcCBoZXJlLlxuICAgIHRvb2x0aXAgPSBkMy50aXAoKS5hdHRyKCdjbGFzcycsICdkMy10aXAnKS5odG1sICh7IG51bWJlciwgdGl0bGUgfSkgLT5cbiAgICAgIFwiIyN7bnVtYmVyfTogI3t0aXRsZX1cIlxuXG4gICAgc3ZnLmNhbGwodG9vbHRpcClcblxuICAgICMgU2hvdyB3aGVuIHdlIGNsb3NlZCBhbiBpc3N1ZS5cbiAgICBzdmcuc2VsZWN0QWxsKFwiYS5pc3N1ZVwiKVxuICAgIC5kYXRhKGFjdHVhbC5zbGljZSgxKSkgIyBza2lwIHRoZSBzdGFydGluZyBwb2ludFxuICAgIC5lbnRlcigpXG4gICAgIyBBIHdyYXBwaW5nIGxpbmsuXG4gICAgLmFwcGVuZCgnc3ZnOmEnKVxuICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCAoeyBodG1sX3VybCB9KSAtPiBodG1sX3VybCApXG4gICAgLmF0dHIoXCJ4bGluazpzaG93XCIsICduZXcnKVxuICAgIC5hcHBlbmQoJ3N2ZzpjaXJjbGUnKVxuICAgIC5hdHRyKFwiY3hcIiwgKHsgZGF0ZSB9KSAtPiB4IGRhdGUgKVxuICAgIC5hdHRyKFwiY3lcIiwgKHsgcG9pbnRzIH0pIC0+IHkgcG9pbnRzIClcbiAgICAuYXR0cihcInJcIiwgICh7IHJhZGl1cyB9KSAtPiA1ICkgIyBmaXhlZCBmb3Igbm93XG4gICAgLm9uKCdtb3VzZW92ZXInLCB0b29sdGlwLnNob3cpXG4gICAgLm9uKCdtb3VzZW91dCcsIHRvb2x0aXAuaGlkZSlcbiIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG57IHN5c3RlbSB9ID0gcmVxdWlyZSAnLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5maXJlYmFzZSAgID0gcmVxdWlyZSAnLi4vbW9kZWxzL2ZpcmViYXNlLmNvZmZlZSdcbnVzZXIgICAgICAgPSByZXF1aXJlICcuLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5JY29ucyAgICAgID0gcmVxdWlyZSAnLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9oZWFkZXInXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlYWRlci5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndXNlcic6IHVzZXJcbiAgICAjIERlZmF1bHQgYXBwIGljb24uXG4gICAgJ2ljb24nOiAnZmlyZS1zdGF0aW9uJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgIyBMb2dpbiB1c2VyLlxuICAgIEBvbiAnIWxvZ2luJywgLT5cbiAgICAgIGZpcmViYXNlLmxvZ2luIChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyciBpZiBlcnJcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFN3aXRjaCBsb2FkaW5nIGljb24gd2l0aCBhcHAgaWNvbi5cbiAgICBzeXN0ZW0ub2JzZXJ2ZSAnbG9hZGluZycsICh5YSkgPT5cbiAgICAgIEBzZXQgJ2ljb24nLCBpZiB5YSB0aGVuICdzcGlubmVyMScgZWxzZSAnZmlyZS1zdGF0aW9uJyIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlcm8nXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2hlcm8uaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuZm9ybWF0ID0gcmVxdWlyZSAnLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxuIyBGb250ZWxsbyBpY29uIGhleCBjb2Rlcy5cbmNvZGVzID1cbiAgJ2NvZyc6ICAgICAgICAgICAnXFxlODAwJ1xuICAnc2VhcmNoJzogICAgICAgICdcXGU4MDEnXG4gICdnaXRodWInOiAgICAgICAgJ1xcZTgwMidcbiAgJ2FkZHJlc3MnOiAgICAgICAnXFxlODAzJ1xuICAncGx1cy1jaXJjbGVkJzogICdcXGU4MDQnXG4gICdmaXJlLXN0YXRpb24nOiAgJ1xcZTgwNSdcbiAgJ3NvcnQtYWxwaGFiZXQnOiAnXFxlODA2J1xuICAnZG93bi1vcGVuJzogICAgICdcXGU4MDcnXG4gICdzcGluNic6ICAgICAgICAgJ1xcZTgwOCdcbiAgJ21lZ2FwaG9uZSc6ICAgICAnXFxlODA5J1xuICAnc3BpbjQnOiAgICAgICAgICdcXGU4MGEnXG4gICdzcGlubmVyMSc6ICAgICAgJ1xcZTgwYidcbiAgJ2F0dGVudGlvbic6ICAgICAnXFxlODBjJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaWNvbnMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2ljb25zLmh0bWwnXG5cbiAgJ2lzb2xhdGVkJzogeWVzXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgQG9ic2VydmUgJ2ljb24nLCAoaWNvbikgLT5cbiAgICAgIGlmIGljb24gYW5kIGhleCA9IGNvZGVzW2ljb25dXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBmb3JtYXQuaGV4VG9EZWMgaGV4XG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgJ2NvZGUnLCBudWxsIiwieyBfLCBSYWN0aXZlLCBkMyB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxuSEVJR0hUID0gNjggIyBoZWlnaHQgb2YgZGl2IGluIHB4XG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9ub3RpZnknXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vdGVtcGxhdGVzL25vdGlmeS5odG1sJ1xuXG4gICdkYXRhJzpcbiAgICAndG9wJzogSEVJR0hUXG4gICAgJ2hpZGRlbic6IHllc1xuICAgICdkZWZhdWx0cyc6XG4gICAgICAndGV4dCc6ICcnXG4gICAgICAndHlwZSc6ICcnICMgYmxhbmQgZ3JleSBzdHlsZVxuICAgICAgJ3N5c3RlbSc6IG5vXG4gICAgICAnaWNvbic6ICdtZWdhcGhvbmUnXG4gICAgICAndHRsJzogIDVlM1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuICBcbiAgIyBTaG93IGEgbm90aWZpY2F0aW9uLlxuICBzaG93OiAob3B0cykgLT5cbiAgICBAc2V0ICdoaWRkZW4nLCBubyAgICBcbiAgICAjIFNldCB0aGUgb3B0cy5cbiAgICBAc2V0IG9wdHMgPSBfLmRlZmF1bHRzIG9wdHMsIEBkYXRhLmRlZmF1bHRzXG4gICAgIyBXaGljaCBwb3NpdGlvbiB0byBzbGlkZSB0bz9cbiAgICBwb3MgPSBbIDAsIDUwIF1bICtvcHRzLnN5c3RlbSBdICMgMHB4IG9yIDUwJSBmcm9tIHRvcFxuICAgICMgU2xpZGUgaW50byB2aWV3LlxuICAgIEBhbmltYXRlICd0b3AnLCBwb3MsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYm91bmNlJylcbiAgICAgICdkdXJhdGlvbic6IDgwMFxuICAgIFxuICAgICMgSWYgbm8gdHRsIHRoZW4gc2hvdyBwZXJtYW5lbnRseS5cbiAgICByZXR1cm4gdW5sZXNzIG9wdHMudHRsXG5cbiAgICAjIFNsaWRlIG91dCBvZiB0aGUgdmlldy5cbiAgICBfLmRlbGF5IF8uYmluZChAaGlkZSwgQCksIG9wdHMudHRsXG5cbiAgIyBIaWRlIGEgbm90aWZpY2F0aW9uLlxuICBoaWRlOiAtPlxuICAgIHJldHVybiBpZiBAZGF0YS5oaWRkZW5cbiAgICBAc2V0ICdoaWRkZW4nLCB5ZXNcblxuICAgIEBhbmltYXRlICd0b3AnLCBIRUlHSFQsXG4gICAgICAnZWFzaW5nJzogZDMuZWFzZSgnYmFjaycpXG4gICAgICAnY29tcGxldGUnOiA9PlxuICAgICAgICAjIFJlc2V0IHRoZSB0ZXh0IHdoZW4gYWxsIGlzIGRvbmUuXG4gICAgICAgIEBzZXQgJ3RleHQnLCBudWxsXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIE9uIG91dHNpZGUgbWVzc2FnZXMuXG4gICAgbWVkaWF0b3Iub24gJyFhcHAvbm90aWZ5JywgXy5iaW5kIEBzaG93LCBAXG4gICAgbWVkaWF0b3Iub24gJyFhcHAvbm90aWZ5L2hpZGUnLCBfLmJpbmQgQGhpZGUsIEBcblxuICAgICMgQ2xvc2UgdXMgcHJlbWF0dXJlbHkuLi5cbiAgICBAb24gJ2Nsb3NlJywgQGhpZGUiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbkhlcm8gICAgID0gcmVxdWlyZSAnLi4vaGVyby5jb2ZmZWUnXG5Qcm9qZWN0cyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9wcm9qZWN0cy5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9pbmRleCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvcGFnZXMvaW5kZXguaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgSGVybywgUHJvamVjdHMgfVxuXG4gICdkYXRhJzpcbiAgICAncHJvamVjdHMnOiBwcm9qZWN0c1xuICAgICdyZWFkeSc6IG5vXG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXVxuXG4gIG9ucmVuZGVyOiAtPlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0J1cm5jaGFydDogR2l0SHViIEJ1cm5kb3duIENoYXJ0IGFzIGEgU2VydmljZSdcblxuICAgICMgUXVpdCBpZiB3ZSBoYXZlIG5vIHByb2plY3RzLlxuICAgIHJldHVybiBAc2V0KCdyZWFkeScsIHllcykgdW5sZXNzIHByb2plY3RzLmxpc3QubGVuZ3RoXG5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICAjIEZvciBhbGwgcHJvamVjdHMuXG4gICAgYXN5bmMubWFwIHByb2plY3RzLmRhdGEubGlzdCwgKHByb2plY3QsIGNiKSAtPlxuICAgICAgIyBGZXRjaCB0aGVpciBtaWxlc3RvbmVzLlxuICAgICAgbWlsZXN0b25lcy5mZXRjaEFsbCBwcm9qZWN0LCAoZXJyLCBsaXN0KSAtPlxuICAgICAgICAjIFNhdmUgdGhlIGVycm9yIGlmIHByb2plY3QgZG9lcyBub3QgZXhpc3QuXG4gICAgICAgIGlmIGVyclxuICAgICAgICAgIHByb2plY3RzLnNhdmVFcnJvciBwcm9qZWN0LCBlcnJcbiAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAjIE5vdyBhZGQgaW4gdGhlIGlzc3Vlcy5cbiAgICAgICAgYXN5bmMuZWFjaCBsaXN0LCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICAgICAgICByZXR1cm4gY2IgbnVsbCBpZiBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCAoeyBudW1iZXIgfSkgLT5cbiAgICAgICAgICAgIG1pbGVzdG9uZS5udW1iZXIgaXMgbnVtYmVyXG4gICAgICAgICAgXG4gICAgICAgICAgIyBPSyBmZXRjaCBhbGwgdGhlIGlzc3VlcyBmb3IgdGhpcyBtaWxlc3RvbmUgdGhlbi5cbiAgICAgICAgICBpc3N1ZXMuZmV0Y2hBbGxcbiAgICAgICAgICAgICdvd25lcic6IHByb2plY3Qub3duZXJcbiAgICAgICAgICAgICduYW1lJzogcHJvamVjdC5uYW1lXG4gICAgICAgICAgICAnbWlsZXN0b25lJzogbWlsZXN0b25lLm51bWJlclxuICAgICAgICAgICwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgICAgIyBTYXZlIGFueSBlcnJvcnMgb24gdGhlIHByb2plY3QuXG4gICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgICAgICByZXR1cm4gZG8gY2JcblxuICAgICAgICAgICAgIyBBZGQgaW4gdGhlIGlzc3VlcyB0byB0aGUgbWlsZXN0b25lLlxuICAgICAgICAgICAgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdpc3N1ZXMnOiBvYmogfVxuICAgICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgbWlsZXN0b25lXG4gICAgICAgICAgICAjIERvbmVcbiAgICAgICAgICAgIGRvIGNiXG4gICAgICAgIFxuICAgICAgICAsIGNiXG5cbiAgICAsID0+XG4gICAgICBkbyBkb25lXG4gICAgICBAc2V0ICdyZWFkeScsIHllcyIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuQ2hhcnQgPSByZXF1aXJlICcuLi9jaGFydC5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5mb3JtYXQgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2NoYXJ0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9taWxlc3RvbmUuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgQ2hhcnQgfVxuXG4gICdkYXRhJzpcbiAgICAnZm9ybWF0JzogZm9ybWF0XG4gICAgJ3JlYWR5Jzogbm9cblxuICBvbnJlbmRlcjogLT5cbiAgICBbIG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgXSA9IEBnZXQgJ3JvdXRlJ1xuICBcbiAgICBtaWxlc3RvbmUgPSBwYXJzZUludCBtaWxlc3RvbmVcblxuICAgIGRvY3VtZW50LnRpdGxlID0gXCIje293bmVyfS8je25hbWV9LyN7bWlsZXN0b25lfVwiXG5cbiAgICAjIEdldCB0aGUgYXNzb2NpYXRlZCBwcm9qZWN0LlxuICAgIHByb2plY3QgPSBwcm9qZWN0cy5maW5kIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgIyBTaG91bGQgbm90IGhhcHBlbi4uLlxuICAgIHRocm93IDUwMCB1bmxlc3MgcHJvamVjdFxuXG4gICAgIyBEbyB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgb2JqID0gXy5maW5kIHByb2plY3QubWlsZXN0b25lcywgeyAnbnVtYmVyJzogbWlsZXN0b25lIH1cbiAgICByZXR1cm4gQHNldCB7ICdtaWxlc3RvbmUnOiBvYmosICdyZWFkeSc6IHllcyB9IGlmIG9iaj9cblxuICAgICMgV2UgYXJlIGxvYWRpbmcgdGhlIG1pbGVzdG9uZXMgdGhlbi5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmZXRjaE1pbGVzdG9uZSA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2ggeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH0sIGNiXG5cbiAgICBmZXRjaElzc3VlcyA9IChkYXRhLCBjYikgLT5cbiAgICAgIGlzc3Vlcy5mZXRjaEFsbCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICBjYiBlcnIsIF8uZXh0ZW5kIGRhdGEsIHsgJ2lzc3Vlcyc6IG9iaiB9XG5cbiAgICBhc3luYy53YXRlcmZhbGwgW1xuICAgICAgIyBHZXQgdGhlIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoTWlsZXN0b25lLFxuICAgICAgIyBUaGVuIGFsbCBpdHMgaXNzdWVzLlxuICAgICAgZmV0Y2hJc3N1ZXNcbiAgICBdLCAoZXJyLCBkYXRhKSA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgcmV0dXJuIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6IGRvIGVyci50b1N0cmluZ1xuICAgICAgICAndHlwZSc6ICdhbGVydCdcbiAgICAgICAgJ3N5c3RlbSc6IHllc1xuICAgICAgICAndHRsJzogbnVsbFxuICAgICAgfSBpZiBlcnJcblxuICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgZGF0YVxuXG4gICAgICAjIFNob3cgdGhlIHBhZ2UuXG4gICAgICBAc2V0XG4gICAgICAgICdtaWxlc3RvbmUnOiBkYXRhXG4gICAgICAgICdyZWFkeSc6IHllcyIsInsgXywgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuc3lzdGVtICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbnVzZXIgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xua2V5ICAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9rZXkuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvbmV3J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCdcblxuICAnZGF0YSc6IHsgJ3ZhbHVlJzogJ3JhZGVrc3RlcGFuL2Rpc3Bvc2FibGUnLCB1c2VyIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgIyBMaXN0ZW4gdG8gRW50ZXIga2V5cHJlc3Mgb3IgU3VibWl0IGJ1dHRvbiBjbGljay5cbiAgc3VibWl0OiAoZXZ0LCB2YWx1ZSkgLT5cbiAgICByZXR1cm4gaWYga2V5LmlzKGV2dCkgYW5kIG5vdCBrZXkuaXNFbnRlcihldnQpXG5cbiAgICBbIG93bmVyLCBuYW1lIF0gPSB2YWx1ZS5zcGxpdCgnLycpXG5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICAjIFNhdmUgcmVwby5cbiAgICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvYWRkJywgeyBvd25lciwgbmFtZSB9LCAoZXJyKSAtPlxuICAgICAgZG8gZG9uZVxuXG4gICAgICBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsXG4gICAgICAgICd0ZXh0JzogZXJyIG9yIFwiUHJvamVjdCAje3ZhbHVlfSBzYXZlZC5cIlxuICAgICAgICAndHlwZSc6IGlmIGVyciB0aGVuICdlcnJvcicgZWxzZSAnc3VjY2VzcydcblxuICAgICAgIyBSZWRpcmVjdCB0byB0aGUgZGFzaGJvYXJkLlxuICAgICAgIyBUT0RPOiB0cmlnZ2VyIGEgbmFtZWQgcm91dGVcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMnXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQWRkIGEgbmV3IHByb2plY3QnXG5cbiAgICAjIFRPRE86IGF1dG9jb21wbGV0ZSBvbiBvdXIgdXNlcm5hbWUgaWYgd2UgYXJlIGxvZ2dlZCBpbiBvciBiYXNlZFxuICAgICMgIG9uIHJlcG9zIHdlIGFscmVhZHkgaGF2ZS5cbiAgICBhdXRvY29tcGxldGUgPSAodmFsdWUpIC0+XG5cbiAgICBAb2JzZXJ2ZSAndmFsdWUnLCBfLmRlYm91bmNlKGF1dG9jb21wbGV0ZSwgMjAwKSwgeyAnaW5pdCc6IG5vIH1cblxuICAgICMgRm9jdXMgb24gdGhlIGlucHV0IGZpZWxkLlxuICAgIGRvIEBlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLmZvY3VzXG5cbiAgICBAb24gJ3N1Ym1pdCcsIEBzdWJtaXQiLCJ7IF8sIFJhY3RpdmUsIGFzeW5jIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1pbGVzdG9uZXMgPSByZXF1aXJlICcuLi90YWJsZXMvbWlsZXN0b25lcy5jb2ZmZWUnXG5cbnByb2plY3RzICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuc3lzdGVtICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xubWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlJ1xuaXNzdWVzICAgICA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvZ2l0aHViL2lzc3Vlcy5jb2ZmZWUnXG5tZWRpYXRvciAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9wcm9qZWN0J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9wcm9qZWN0Lmh0bWwnXG5cbiAgJ2NvbXBvbmVudHMnOiB7IE1pbGVzdG9uZXMgfVxuXG4gICdkYXRhJzpcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUgXSA9IEBnZXQgJ3JvdXRlJ1xuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX1cIlxuXG4gICAgIyBHZXQgdGhlIGFzc29jaWF0ZWQgcHJvamVjdC5cbiAgICBAc2V0ICdwcm9qZWN0JywgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIFdlIGRvbid0IGtub3cgaWYgd2UgaGF2ZSBhbGwgbWlsZXN0b25lcywgc28gZmV0Y2ggdGhlbS5cbiAgICBkb25lID0gZG8gc3lzdGVtLmFzeW5jXG5cbiAgICBmaW5kTWlsZXN0b25lID0gKG51bWJlcikgLT5cbiAgICAgIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMgb3IgW10sIHsgbnVtYmVyIH1cblxuICAgIGZldGNoTWlsZXN0b25lcyA9IChjYikgLT5cbiAgICAgIG1pbGVzdG9uZXMuZmV0Y2hBbGwgcHJvamVjdCwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGFsbE1pbGVzdG9uZXMsIGNiKSAtPlxuICAgICAgYXN5bmMuZWFjaCBhbGxNaWxlc3RvbmVzLCAobWlsZXN0b25lLCBjYikgLT5cbiAgICAgICAgIyBNYXliZSB3ZSBoYXZlIHRoaXMgbWlsZXN0b25lIGFscmVhZHk/XG4gICAgICAgIHJldHVybiBjYiBudWxsIGlmIGZpbmRNaWxlc3RvbmUgbWlsZXN0b25lLm51bWJlclxuICAgICAgICAjIE5lZWQgdG8gZmV0Y2ggdGhlIGlzc3VlcyB0aGVuLlxuICAgICAgICBpc3N1ZXMuZmV0Y2hBbGwgeyBvd25lciwgbmFtZSwgJ21pbGVzdG9uZSc6IG1pbGVzdG9uZS5udW1iZXIgfSwgKGVyciwgb2JqKSAtPlxuICAgICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgICAgIyBTYXZlIHRoZSBtaWxlc3RvbmUgd2l0aCBpc3N1ZXMuXG4gICAgICAgICAgcHJvamVjdHMuYWRkTWlsZXN0b25lIHByb2plY3QsIF8uZXh0ZW5kIG1pbGVzdG9uZSwgeyAnaXNzdWVzJzogb2JqIH1cbiAgICAgICAgICAjIE5leHQuXG4gICAgICAgICAgZG8gY2JcbiAgICAgICwgY2JcblxuICAgICMgUnVuIGl0LlxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEZpcnN0IGdldCBhbGwgdGhlIG1pbGVzdG9uZXMuXG4gICAgICBmZXRjaE1pbGVzdG9uZXMsXG4gICAgICAjIFRoZW4gYWxsIHRoZSBpc3N1ZXMgcGVyIG1pbGVzdG9uZS5cbiAgICAgIGZldGNoSXNzdWVzXG4gICAgXSwgKGVycikgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIHJldHVybiBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeScsIHtcbiAgICAgICAgJ3RleHQnOiBkbyBlcnIudG9TdHJpbmdcbiAgICAgICAgJ3R5cGUnOiAnYWxlcnQnXG4gICAgICAgICdzeXN0ZW0nOiB5ZXNcbiAgICAgICAgJ3R0bCc6IG51bGxcbiAgICAgIH0gaWYgZXJyXG5cbiAgICAgICMgU2F5IHdlIGFyZSByZWFkeS5cbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzXG4iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnByb2plY3RzID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3Byb2plY3RzLmNvZmZlZSdcbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvbWlsZXN0b25lcydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL21pbGVzdG9uZXMuaHRtbCdcblxuICAnZGF0YSc6IHsgZm9ybWF0IH1cblxuICAnY29tcG9uZW50cyc6IHsgSWNvbnMgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF0iLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubWVkaWF0b3IgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbmZvcm1hdCAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvZm9ybWF0LmNvZmZlZSdcbkljb25zICAgID0gcmVxdWlyZSAnLi4vaWNvbnMuY29mZmVlJ1xucHJvamVjdHMgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcHJvamVjdHMnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3RhYmxlcy9wcm9qZWN0cy5odG1sJ1xuXG4gICdkYXRhJzogeyBmb3JtYXQgfVxuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSJdfQ==
