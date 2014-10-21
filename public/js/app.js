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
var Model, config, date, lscache, mediator, search, stats, user, _, _ref;

_ref = require('../modules/vendor.coffee'), _ = _ref._, lscache = _ref.lscache;

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
    var index, m, p, _i, _j, _len, _len1, _ref1, _ref2;
    index = this.data.index || [];
    _ref1 = this.data.list;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      p = _ref1[_i];
      if (p.milestones == null) {
        continue;
      }
      _ref2 = p.milestones;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        m = _ref2[_j];
        console.log(this.data.sortBy, m);
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
    return this.observe('sortKey', function() {
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
var progress;

progress = function(a, b) {
  return 100 * (a / (b + a));
};

module.exports = function(milestone) {
  var a, b, c, isOnTime, points, time;
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
  isOnTime = points > time;
  return {
    'isOnTime': isOnTime,
    'progress': {
      points: points,
      time: time
    }
  };
};



},{}],15:[function(require,module,exports){
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
  'lscache': window.lscache
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
module.exports={"v":1,"t":[{"t":7,"e":"div","a":{"id":"projects"},"f":[{"t":7,"e":"div","a":{"class":"header"},"f":[{"t":7,"e":"a","a":{"href":"#","class":"sort"},"f":[{"t":7,"e":"Icons","a":{"icon":"sort-alphabet"}}," Sorted by priority"]}," ",{"t":7,"e":"h2","f":["Projects"]}]}," ",{"t":7,"e":"table","f":[{"t":4,"r":"projects.list","f":[{"t":4,"n":50,"r":"errors","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"colspan":"3","class":"repo"},"f":[{"t":7,"e":"div","a":{"class":"project"},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}," ",{"t":7,"e":"span","a":{"class":"error","title":[{"t":2,"x":{"r":["errors"],"s":"_0.join(\"\\n\")"}}]},"f":[{"t":7,"e":"Icons","a":{"icon":"attention"}}]}]}]}]}]},{"t":4,"n":51,"f":[{"t":4,"r":"milestones","f":[{"t":7,"e":"tr","f":[{"t":7,"e":"td","a":{"class":"repo"},"f":[{"t":7,"e":"a","a":{"class":"project","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]},"f":[{"t":2,"r":"owner"},"/",{"t":2,"r":"name"}]}]}," ",{"t":7,"e":"td","f":[{"t":7,"e":"a","a":{"class":"milestone","href":["#",{"t":2,"r":"owner"},"/",{"t":2,"r":"name"},"/",{"t":2,"r":"number"}]},"f":[{"t":2,"r":"title"}]}]}," ",{"t":7,"e":"td","a":{"style":"width:1%"},"f":[{"t":7,"e":"div","a":{"class":"progress"},"f":[{"t":7,"e":"span","a":{"class":"percent"},"f":[{"t":2,"x":{"r":["stats.progress.points"],"s":"Math.floor(_0)"}},"%"]}," ",{"t":7,"e":"span","a":{"class":"due"},"f":[{"t":3,"x":{"r":["format","due_on"],"s":"_0.due(_1)"}}]}," ",{"t":7,"e":"div","a":{"class":"outer bar"},"f":[{"t":7,"e":"div","a":{"class":["inner bar ",{"t":2,"x":{"r":["stats.isOnTime"],"s":"(_0)?\"green\":\"red\""}}],"style":["width:",{"t":2,"r":"stats.progress.points"},"%"]}}]}]}]}]}]}],"r":"errors"}]}]}," ",{"t":7,"e":"div","a":{"class":"footer"},"f":[{"t":7,"e":"a","a":{"href":"#"},"f":[{"t":7,"e":"Icons","a":{"icon":"cog"}}," Edit"]}]}]}]}
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
var Icons, Ractive, format, mediator;

Ractive = require('../../modules/vendor.coffee').Ractive;

mediator = require('../../modules/mediator.coffee');

format = require('../../utils/format.coffee');

Icons = require('../icons.coffee');

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



},{"../../modules/mediator.coffee":12,"../../modules/vendor.coffee":15,"../../templates/tables/projects.html":27,"../../utils/format.coffee":29,"../icons.coffee":37}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9hcHAuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL2NvbmZpZy5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2RlbHMvZmlyZWJhc2UuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3Byb2plY3RzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZGVscy9zeXN0ZW0uY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kZWxzL3VzZXIuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9jaGFydC9heGVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvY2hhcnQvbGluZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvZ2l0aHViL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy9naXRodWIvcmVxdWVzdC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvcm91dGVyLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL21vZHVsZXMvc3RhdHMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvbW9kdWxlcy92ZW5kb3IuY29mZmVlIiwic3JjL3RlbXBsYXRlcy9hcHAuaHRtbCIsInNyYy90ZW1wbGF0ZXMvY2hhcnQuaHRtbCIsInNyYy90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwiLCJzcmMvdGVtcGxhdGVzL2hlcm8uaHRtbCIsInNyYy90ZW1wbGF0ZXMvaWNvbnMuaHRtbCIsInNyYy90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL2luZGV4Lmh0bWwiLCJzcmMvdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sIiwic3JjL3RlbXBsYXRlcy9wYWdlcy9uZXcuaHRtbCIsInNyYy90ZW1wbGF0ZXMvcGFnZXMvcHJvamVjdC5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sIiwic3JjL3RlbXBsYXRlcy90YWJsZXMvcHJvamVjdHMuaHRtbCIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2RhdGUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvZm9ybWF0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3V0aWxzL2tleS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy91dGlscy9taXhpbnMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvbW9kZWwuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdXRpbHMvc2VhcmNoLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2NoYXJ0LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2hlYWRlci5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9oZXJvLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL2ljb25zLmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL25vdGlmeS5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWUiLCIvaG9tZS9yYWRlay9kZXYvYnVybmNoYXJ0LmlvL3NyYy92aWV3cy9wYWdlcy9taWxlc3RvbmUuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvcGFnZXMvbmV3LmNvZmZlZSIsIi9ob21lL3JhZGVrL2Rldi9idXJuY2hhcnQuaW8vc3JjL3ZpZXdzL3BhZ2VzL3Byb2plY3QuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL21pbGVzdG9uZXMuY29mZmVlIiwiL2hvbWUvcmFkZWsvZGV2L2J1cm5jaGFydC5pby9zcmMvdmlld3MvdGFibGVzL3Byb2plY3RzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsb0NBQUE7O0FBQUEsVUFBYyxPQUFBLENBQVEseUJBQVIsRUFBWixPQUFGLENBQUE7O0FBQUEsT0FFQSxDQUFRLHVCQUFSLENBRkEsQ0FBQTs7QUFBQSxPQUlBLENBQVEsMEJBQVIsQ0FKQSxDQUFBOztBQUFBLE1BTUEsR0FBUyxPQUFBLENBQVEsdUJBQVIsQ0FOVCxDQUFBOztBQUFBLE1BT0EsR0FBUyxPQUFBLENBQVEsdUJBQVIsQ0FQVCxDQUFBOztBQUFBLE1BUUEsR0FBUyxPQUFBLENBQVEseUJBQVIsQ0FSVCxDQUFBOztBQUFBLEdBVUEsR0FBVSxJQUFBLE9BQUEsQ0FFUjtBQUFBLEVBQUEsVUFBQSxFQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaO0FBQUEsRUFFQSxJQUFBLEVBQU0sTUFGTjtBQUFBLEVBSUEsWUFBQSxFQUFj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LEVBRUEsVUFBQSxFQUFZLE9BQUEsQ0FBUSx3Q0FBUixDQUZaO0FBQUEsRUFJQSxNQUFBLEVBQVE7QUFBQSxJQUFFLFFBQUEsTUFBRjtHQUpSO0FBQUEsRUFNQSxZQUFBLEVBQWM7QUFBQSxJQUFFLE9BQUEsS0FBRjtHQU5kO0FBQUEsRUFRQSxPQUFBLEVBQVMsQ0FBRSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQW5CLENBUlQ7Q0FGZSxDQVBqQixDQUFBOzs7OztBQ0FBLElBQUEsZ0NBQUE7O0FBQUEsVUFBYyxPQUFBLENBQVEsNkJBQVIsRUFBWixPQUFGLENBQUE7O0FBQUEsUUFFQSxHQUFXLE9BQUEsQ0FBUSwrQkFBUixDQUZYLENBQUE7O0FBQUEsTUFHQSxHQUFXLE9BQUEsQ0FBUSwyQkFBUixDQUhYLENBQUE7O0FBQUEsS0FJQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUpYLENBQUE7O0FBQUEsTUFNTSxDQUFDLE9BQVAsR0FBaUIsT0FBTyxDQUFDLE1BQVIsQ0FFZjtBQUFBLEVBQUEsTUFBQSxFQUFRLGdCQUFSO0FBQUEsRUFFQSxVQUFBLEVBQVksT0FBQSxDQUFRLHNDQUFSLENBRlo7QUFBQSxFQUlBLE1BQUEsRUFBUTtBQUFBLElBQUUsUUFBQSxNQUFGO0dBSlI7QUFBQSxFQU1BLFlBQUEsRUFBYztBQUFBLElBQUUsT0FBQSxLQUFGO0dBTmQ7QUFBQSxFQVFBLE9BQUEsRUFBUyxDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FSVDtDQUZlLENBTmpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcbiMgTG9kYXNoIG1peGlucy5cbnJlcXVpcmUgJy4vdXRpbHMvbWl4aW5zLmNvZmZlZSdcbiMgV2lsbCBsb2FkIHByb2plY3RzIGZyb20gbG9jYWxTdG9yYWdlLlxucmVxdWlyZSAnLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuXG5IZWFkZXIgPSByZXF1aXJlICcuL3ZpZXdzL2hlYWRlci5jb2ZmZWUnXG5Ob3RpZnkgPSByZXF1aXJlICcuL3ZpZXdzL25vdGlmeS5jb2ZmZWUnXG5yb3V0ZXIgPSByZXF1aXJlICcuL21vZHVsZXMvcm91dGVyLmNvZmZlZSdcblxuYXBwID0gbmV3IFJhY3RpdmVcbiAgXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4vdGVtcGxhdGVzL2FwcC5odG1sJ1xuXG4gICdlbCc6ICdib2R5J1xuXG4gICdjb21wb25lbnRzJzogeyBIZWFkZXIsIE5vdGlmeSB9XG5cbiAgb25yZW5kZXI6IC0+XG4gICAgIyBTdGFydCB0aGUgcm91dGVyLlxuICAgIHJvdXRlci5pbml0ICcvJyIsIk1vZGVsID0gcmVxdWlyZSAnLi4vdXRpbHMvbW9kZWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy9jb25maWcnXG5cbiAgXCJkYXRhXCI6XG4gICAgIyBGaXJlYmFzZSBhcHAgbmFtZS5cbiAgICBcImZpcmViYXNlXCI6IFwiYnVybmNoYXJ0XCJcbiAgICAjIERhdGEgc291cmNlIHByb3ZpZGVyLlxuICAgIFwicHJvdmlkZXJcIjogXCJnaXRodWJcIlxuICAgICMgRmllbGRzIHRvIGtlZXAgZnJvbSBHSCByZXNwb25zZXMuXG4gICAgXCJmaWVsZHNcIjpcbiAgICAgIFwibWlsZXN0b25lXCI6IFtcbiAgICAgICAgXCJjbG9zZWRfaXNzdWVzXCJcbiAgICAgICAgXCJjcmVhdGVkX2F0XCJcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiXG4gICAgICAgIFwiZHVlX29uXCJcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgICBcIm9wZW5faXNzdWVzXCJcbiAgICAgICAgXCJ0aXRsZVwiXG4gICAgICAgIFwidXBkYXRlZF9hdFwiXG4gICAgICBdXG4gICAgIyBDaGFydCBjb25maWd1cmF0aW9uLlxuICAgIFwiY2hhcnRcIjpcbiAgICAgICMgRGF5cyB3ZSBhcmUgbm90IHdvcmtpbmcuXG4gICAgICBcIm9mZl9kYXlzXCI6IFsgXVxuICAgICAgIyBIb3cgZG8gd2UgcGFyc2UgR2l0SHViIGRhdGVzP1xuICAgICAgXCJkYXRldGltZVwiOiAvXihcXGR7NH0tXFxkezJ9LVxcZHsyfSlUKC4qKS9cbiAgICAgICMgSG93IGRvZXMgYSBzaXplIGxhYmVsIGxvb2sgbGlrZT9cbiAgICAgIFwic2l6ZV9sYWJlbFwiOiAvXnNpemUgKFxcZCspJC9cbiAgICAgICMgSG93IGRvIHdlIHNwZWNpZnkgd2hpY2ggdXNlci9yZXBvLyhtaWxlc3RvbmUpIHdlIHdhbnQ/XG4gICAgICBcImxvY2F0aW9uXCI6IC9eIyEoKFxcL1teXFwvXSspezIsM30pJC9cbiAgICAgICMgUHJvY2VzcyBhbGwgaXNzdWVzIGFzIG9uZSBzaXplIChPTkVfU0laRSkgb3IgdXNlIGxhYmVscyAoTEFCRUxTKS5cbiAgICAgIFwicG9pbnRzXCI6ICdPTkVfU0laRSciLCJ7IEZpcmViYXNlLCBGaXJlYmFzZVNpbXBsZUxvZ2luIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbk1vZGVsICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbnVzZXIgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL2ZpcmViYXNlJ1xuXG4gIGF1dGg6IC0+XG4gICAgdGhyb3cgJ05vdCBvdmVycmlkZW4nXG5cbiAgIyBMb2dpbiBhIHVzZXIuXG4gIGxvZ2luOiAoY2IpIC0+XG4gICAgIyBMb2dpbi5cbiAgICBAYXV0aC5sb2dpbiBjb25maWcuZGF0YS5wcm92aWRlcixcbiAgICAgICdyZW1lbWJlck1lJzogeWVzXG4gICAgICAnc2NvcGUnOiAncHVibGljX3JlcG8nXG5cbiAgIyBMb2dvdXQgYSB1c2VyLlxuICBsb2dvdXQ6IC0+XG4gICAgQGF1dGg/LmxvZ291dFxuICAgIGRvIHVzZXIucmVzZXRcblxuICBvbnJlbmRlcjogLT5cbiAgICAjIFNldHVwIGEgbmV3IGNsaWVudC5cbiAgICBAc2V0ICdjbGllbnQnLCBjbGllbnQgPSBuZXcgRmlyZWJhc2UgXCJodHRwczovLyN7Y29uZmlnLmRhdGEuZmlyZWJhc2V9LmZpcmViYXNlaW8uY29tXCJcbiAgICBcbiAgICAjIENoZWNrIGlmIHdlIGhhdmUgYSB1c2VyIGluIHNlc3Npb24uXG4gICAgQGF1dGggPSBuZXcgRmlyZWJhc2VTaW1wbGVMb2dpbiBjbGllbnQsIChlcnIsIG9iaikgLT5cbiAgICAgIHRocm93IGVyciBpZiBlcnJcbiAgICAgIFxuICAgICAgIyBTYXZlIHVzZXIuXG4gICAgICB1c2VyLnNldCBvYmogaWYgb2JqXG4gICAgICAjIFNheSB3ZSBhcmUgZG9uZS5cbiAgICAgIHVzZXIuc2V0ICdyZWFkeScsIHllcyIsInsgXywgbHNjYWNoZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5jb25maWcgICA9IHJlcXVpcmUgJy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xubWVkaWF0b3IgPSByZXF1aXJlICcuLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbnN0YXRzICAgID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9zdGF0cy5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcbmRhdGUgICAgID0gcmVxdWlyZSAnLi4vdXRpbHMvZGF0ZS5jb2ZmZWUnXG5zZWFyY2ggICA9IHJlcXVpcmUgJy4uL3V0aWxzL3NlYXJjaC5jb2ZmZWUnXG51c2VyICAgICA9IHJlcXVpcmUgJy4vdXNlci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZGVsXG5cbiAgJ25hbWUnOiAnbW9kZWxzL3Byb2plY3RzJ1xuXG4gICdkYXRhJzpcbiAgICAnc29ydEJ5JzogJ3ByaW9yaXR5J1xuXG4gIGZpbmQ6IChwcm9qZWN0KSAtPlxuICAgIF8uZmluZCBAZGF0YS5saXN0LCBwcm9qZWN0XG5cbiAgZXhpc3RzOiAtPlxuICAgICEhQGZpbmQuYXBwbHkgQCwgYXJndW1lbnRzXG5cbiAgIyBQdXNoIHRvIHRoZSBzdGFjayB1bmxlc3MgaXQgZXhpc3RzIGFscmVhZHkuXG4gIGFkZDogKHByb2plY3QpIC0+XG4gICAgQHB1c2ggJ2xpc3QnLCBwcm9qZWN0IHVubGVzcyBAZXhpc3RzIHByb2plY3RcblxuICAjIEZpbmQgaW5kZXggb2YgYSBwcm9qZWN0LlxuICBmaW5kSW5kZXg6ICh7IG93bmVyLCBuYW1lIH0pIC0+XG4gICAgXy5maW5kSW5kZXggQGRhdGEubGlzdCwgeyBvd25lciwgbmFtZSB9XG5cbiAgYWRkTWlsZXN0b25lOiAocHJvamVjdCwgbWlsZXN0b25lKSAtPlxuICAgICMgQWRkIGluIHRoZSBzdGF0cy5cbiAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ3N0YXRzJzogc3RhdHMobWlsZXN0b25lKSB9XG5cbiAgICBpZiAoaWR4ID0gQGZpbmRJbmRleChwcm9qZWN0KSkgPiAtMVxuICAgICAgaWYgcHJvamVjdC5taWxlc3RvbmVzP1xuICAgICAgICBAcHVzaCBcImxpc3QuI3tpZHh9Lm1pbGVzdG9uZXNcIiwgbWlsZXN0b25lXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXQgXCJsaXN0LiN7aWR4fS5taWxlc3RvbmVzXCIsIFsgbWlsZXN0b25lIF1cbiAgICBlbHNlXG4gICAgICAjIFdlIGFyZSBzdXBwb3NlZCB0byBleGlzdCBhbHJlYWR5LlxuICAgICAgdGhyb3cgNTAwXG5cbiAgIyBTYXZlIGFuIGVycm9yIGZyb20gbG9hZGluZyBtaWxlc3RvbmVzIG9yIGlzc3Vlc1xuICBzYXZlRXJyb3I6IChwcm9qZWN0LCBlcnIpIC0+XG4gICAgaWYgKGlkeCA9IEBmaW5kSW5kZXgocHJvamVjdCkpID4gLTFcbiAgICAgIGlmIHByb2plY3QuZXJyb3JzP1xuICAgICAgICBAcHVzaCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCBcImxpc3QuI3tpZHh9LmVycm9yc1wiLCBbIGVyciBdXG4gICAgZWxzZVxuICAgICAgIyBXZSBhcmUgc3VwcG9zZWQgdG8gZXhpc3QgYWxyZWFkeS5cbiAgICAgIHRocm93IDUwMCAgXG5cbiAgY2xlYXI6IC0+XG4gICAgQHNldCAnbGlzdCcsIFtdXG5cbiAgIyBTb3J0IGFuIGFscmVhZHkgc29ydGVkIGluZGV4LlxuICBzb3J0OiAtPlxuICAgICMgR2V0IG9yIGluaXRpYWxpemUgdGhlIGluZGV4LlxuICAgIGluZGV4ID0gQGRhdGEuaW5kZXggb3IgW11cblxuICAgIGZvciBwIGluIEBkYXRhLmxpc3RcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBwLm1pbGVzdG9uZXM/XG4gICAgICBmb3IgbSBpbiBwLm1pbGVzdG9uZXNcbiAgICAgICAgIyBSdW4gYSBjb21wYXJhdG9yIGhlcmUgaW5zZXJ0aW5nIGludG8gaW5kZXguXG4gICAgICAgIGNvbnNvbGUubG9nIEBkYXRhLnNvcnRCeSwgbVxuXG4gICAgIyBTYXZlIHRoZSBpbmRleC5cbiAgICBAc2V0ICdpbmRleCcsIGluZGV4XG5cbiAgb25jb25zdHJ1Y3Q6IC0+XG4gICAgbWVkaWF0b3Iub24gJyFwcm9qZWN0cy9hZGQnLCAgICBfLmJpbmQgQGFkZCwgQFxuICAgIG1lZGlhdG9yLm9uICchcHJvamVjdHMvY2xlYXInLCAgXy5iaW5kIEBjbGVhciwgQFxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgSW5pdCB0aGUgcHJvamVjdHMuXG4gICAgQHNldCAnbGlzdCcsIGxzY2FjaGUuZ2V0KCdwcm9qZWN0cycpIG9yIFtdXG5cbiAgICBAb2JzZXJ2ZSAnbGlzdCcsIChwcm9qZWN0cykgLT5cbiAgICAgICMgUGVyc2lzdCBwcm9qZWN0cyBpbiBsb2NhbCBzdG9yYWdlIChzYW5zIG1pbGVzdG9uZXMpLlxuICAgICAgbHNjYWNoZS5zZXQgJ3Byb2plY3RzJywgXy5wbHVja01hbnkgcHJvamVjdHMsIFsgJ293bmVyJywgJ25hbWUnIF1cbiAgICAgICMgVXBkYXRlIHRoZSBpbmRleC5cbiAgICAgIGRvIEBzb3J0XG4gICAgLCAnaW5pdCc6IG5vXG5cbiAgICAjIFJlc2V0IG91ciBpbmRleCBhbmQgcmUtc29ydC5cbiAgICBAb2JzZXJ2ZSAnc29ydEtleScsIC0+XG4gICAgICAjIFVzZSBwb3AgYXMgUmFjdGl2ZSBpcyBnbGl0Y2h5LlxuICAgICAgKCBAcG9wICdpbmRleCcgd2hpbGUgQGRhdGEuaW5kZXgubGVuZ3RoICkgaWYgQGRhdGEuaW5kZXg/XG4gICAgICAjwqBSdW4gdGhlIHNvcnQgYWdhaW4uXG4gICAgICBkbyBAc29ydCIsIm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcblxuIyBTeXN0ZW0gc3RhdGUuXG5zeXN0ZW0gPSBuZXcgTW9kZWxcbiAgXG4gICduYW1lJzogJ21vZGVscy9zeXN0ZW0nXG5cbiAgJ2RhdGEnOlxuICAgICdsb2FkaW5nJzogbm9cblxuY291bnRlciA9IDBcbmFzeW5jID0gLT5cbiAgY291bnRlciArPSAxXG4gIHN5c3RlbS5zZXQgJ2xvYWRpbmcnLCB5ZXNcbiAgLT5cbiAgICBjb3VudGVyIC09IDFcbiAgICBzeXN0ZW0uc2V0ICdsb2FkaW5nJywgK2NvdW50ZXJcblxubW9kdWxlLmV4cG9ydHMgPSB7IHN5c3RlbSwgYXN5bmMgfSIsIm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5Nb2RlbCAgICA9IHJlcXVpcmUgJy4uL3V0aWxzL21vZGVsLmNvZmZlZSdcblxuIyBDdXJyZW50bHkgbG9nZ2VkLWluIHVzZXIuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2RlbFxuXG4gICduYW1lJzogJ21vZGVscy91c2VyJ1xuXG4gICMgRGVmYXVsdCB0byBhIGxvY2FsIHVzZXIuXG4gICdkYXRhJzpcbiAgICAncHJvdmlkZXInOiAgXCJsb2NhbFwiXG4gICAgJ2lkJzogICAgICAgIFwiMFwiXG4gICAgJ3VpZCc6ICAgICAgIFwibG9jYWw6MFwiXG4gICAgJ3Rva2VuJzogICAgIG51bGwiLCJ7IGQzIH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgaG9yaXpvbnRhbDogKGhlaWdodCwgeCkgLT5cbiAgICBkMy5zdmcuYXhpcygpLnNjYWxlKHgpXG4gICAgICAub3JpZW50KFwiYm90dG9tXCIpXG4gICAgICAjIFNob3cgdmVydGljYWwgbGluZXMuLi5cbiAgICAgIC50aWNrU2l6ZSgtaGVpZ2h0KVxuICAgICAgIyAuLi53aXRoIGRheSBvZiB0aGUgbW9udGguLi5cbiAgICAgIC50aWNrRm9ybWF0KCAoZCkgLT4gZC5nZXREYXRlKCkgKVxuICAgICAgIyAuLi5hbmQgZ2l2ZSB1cyBhIHNwYWNlci5cbiAgICAgIC50aWNrUGFkZGluZygxMClcblxuICB2ZXJ0aWNhbDogKHdpZHRoLCB5KSAtPlxuICAgIGQzLnN2Zy5heGlzKCkuc2NhbGUoeSlcbiAgICAgIC5vcmllbnQoXCJsZWZ0XCIpXG4gICAgICAudGlja1NpemUoLXdpZHRoKVxuICAgICAgLnRpY2tzKDUpXG4gICAgICAudGlja1BhZGRpbmcoMTApIiwieyBfLCBkMyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5jb25maWcgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICMgQSBncmFwaCBvZiBjbG9zZWQgaXNzdWVzLlxuICAjIGBpc3N1ZXNgOiAgICAgaXNzdWVzIGxpc3RcbiAgIyBgY3JlYXRlZF9hdGA6IG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYHRvdGFsYDogICAgdG90YWwgbnVtYmVyIG9mIHBvaW50cyAob3BlbiAmIGNsb3NlZCBpc3N1ZXMpXG4gIGFjdHVhbDogKGlzc3VlcywgY3JlYXRlZF9hdCwgdG90YWwpIC0+XG4gICAgaGVhZCA9IFsge1xuICAgICAgJ2RhdGUnOiBuZXcgRGF0ZSBjcmVhdGVkX2F0XG4gICAgICAncG9pbnRzJzogdG90YWxcbiAgICB9IF1cbiAgICBcbiAgICBtaW4gPSArSW5maW5pdHkgOyBtYXggPSAtSW5maW5pdHlcblxuICAgICMgR2VuZXJhdGUgdGhlIGFjdHVhbCBjbG9zZXMuXG4gICAgcmVzdCA9IF8ubWFwIGlzc3VlcywgKGlzc3VlKSAtPlxuICAgICAgeyBzaXplLCBjbG9zZWRfYXQgfSA9IGlzc3VlXG4gICAgICAjIERldGVybWluZSB0aGUgcmFuZ2UuXG4gICAgICBtaW4gPSBzaXplIGlmIHNpemUgPCBtaW5cbiAgICAgIG1heCA9IHNpemUgaWYgc2l6ZSA+IG1heFxuXG4gICAgICAjIERyb3BwaW5nIHBvaW50cyByZW1haW5pbmcuXG4gICAgICBpc3N1ZS5kYXRlID0gbmV3IERhdGUgY2xvc2VkX2F0XG4gICAgICBpc3N1ZS5wb2ludHMgPSB0b3RhbCAtPSBzaXplXG4gICAgICBpc3N1ZVxuICAgIFxuICAgICMgTm93IGFkZCBhIHJhZGl1cyBpbiBhIHJhbmdlICh3aWxsIGJlIHVzZWQgZm9yIGEgY2lyY2xlKS5cbiAgICByYW5nZSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbIG1pbiwgbWF4IF0pLnJhbmdlKFsgNSwgOCBdKVxuXG4gICAgcmVzdCA9IF8ubWFwIHJlc3QsIChpc3N1ZSkgLT5cbiAgICAgIGlzc3VlLnJhZGl1cyA9IHJhbmdlIGlzc3VlLnNpemVcbiAgICAgIGlzc3VlXG5cbiAgICBbXS5jb25jYXQgaGVhZCwgcmVzdFxuXG4gICMgQSBncmFwaCBvZiBhbiBpZGVhbCBwcm9ncmVzc2lvbi4uXG4gICMgYGFgOiAgIG1pbGVzdG9uZSBzdGFydCBkYXRlXG4gICMgYGJgOiAgIG1pbGVzdG9uZSBlbmQgZGF0ZVxuICAjIGB0b3RhbGA6IHRvdGFsIG51bWJlciBvZiBwb2ludHMgKG9wZW4gJiBjbG9zZWQgaXNzdWVzKVxuICBpZGVhbDogKGEsIGIsIHRvdGFsKSAtPlxuICAgICMgU3dhcD9cbiAgICBbIGIsIGEgXSA9IFsgYSwgYiBdIGlmIGIgPCBhXG5cbiAgICAjIFdlIHN0YXJ0IGhlcmUgYWRkaW5nIGRheXMgdG8gYGRgLlxuICAgIFsgeSwgbSwgZCBdID0gXy5tYXAgYS5tYXRjaChjb25maWcuZGF0YS5jaGFydC5kYXRldGltZSlbMV0uc3BsaXQoJy0nKSwgKHYpIC0+IHBhcnNlSW50IHZcbiAgICAjIFdlIHdhbnQgdG8gZW5kIGhlcmUuXG4gICAgY3V0b2ZmID0gbmV3IERhdGUoYilcblxuICAgICMgR28gdGhyb3VnaCB0aGUgYmVnaW5uaW5nIHRvIHRoZSBlbmQgc2tpcHBpbmcgb2ZmIGRheXMuXG4gICAgZGF5cyA9IFtdIDsgbGVuZ3RoID0gMFxuICAgIGRvIG9uY2UgPSAoaW5jID0gMCkgLT5cbiAgICAgICMgQSBuZXcgZGF5LlxuICAgICAgZGF5ID0gbmV3IERhdGUgeSwgbSAtIDEsIGQgKyBpbmNcbiAgICAgIFxuICAgICAgIyBEb2VzIHRoaXMgZGF5IGNvdW50P1xuICAgICAgZGF5X29mID0gNyBpZiAhZGF5X29mID0gZGF5LmdldERheSgpXG4gICAgICBpZiBkYXlfb2YgaW4gY29uZmlnLmRhdGEuY2hhcnQub2ZmX2RheXNcbiAgICAgICAgZGF5cy5wdXNoIHsgZGF0ZTogZGF5LCBvZmZfZGF5OiB5ZXMgfVxuICAgICAgZWxzZVxuICAgICAgICBsZW5ndGggKz0gMVxuICAgICAgICBkYXlzLnB1c2ggeyBkYXRlOiBkYXkgfVxuICAgICAgXG4gICAgICAjIEdvIGFnYWluP1xuICAgICAgb25jZShpbmMgKyAxKSB1bmxlc3MgZGF5ID4gY3V0b2ZmXG5cbiAgICAjIE1hcCBwb2ludHMgb24gdGhlIGFycmF5IG9mIGRheXMgbm93LlxuICAgIHZlbG9jaXR5ID0gdG90YWwgLyAobGVuZ3RoIC0gMSlcblxuICAgIGRheXMgPSBfLm1hcCBkYXlzLCAoZGF5LCBpKSAtPlxuICAgICAgZGF5LnBvaW50cyA9IHRvdGFsXG4gICAgICB0b3RhbCAtPSB2ZWxvY2l0eSBpZiBkYXlzW2ldIGFuZCBub3QgZGF5c1tpXS5vZmZfZGF5XG4gICAgICBkYXlcblxuICAgICMgRG8gd2UgbmVlZCB0byBtYWtlIGEgbGluayB0byByaWdodCBub3c/XG4gICAgZGF5cy5wdXNoIHsgZGF0ZTogbm93LCBwb2ludHM6IDAgfSBpZiAobm93ID0gbmV3IERhdGUoKSkgPiBjdXRvZmZcblxuICAgIGRheXNcblxuICAjIEdyYXBoIHJlcHJlc2VudGluZyBhIHRyZW5kbGluZyBvZiBhY3R1YWwgaXNzdWVzLlxuICB0cmVuZDogKGFjdHVhbCwgY3JlYXRlZF9hdCwgZHVlX29uKSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgYWN0dWFsLmxlbmd0aFxuXG4gICAgc3RhcnQgPSArYWN0dWFsWzBdLmRhdGVcblxuICAgICMgVmFsdWVzIGlzIGEgbGlzdCBvZiB0aW1lIGZyb20gdGhlIHN0YXJ0IGFuZCBwb2ludHMgcmVtYWluaW5nLlxuICAgIHZhbHVlcyA9IF8ubWFwIGFjdHVhbCwgKHsgZGF0ZSwgcG9pbnRzIH0pIC0+XG4gICAgICBbICtkYXRlIC0gc3RhcnQsIHBvaW50cyBdXG5cbiAgICAjIE5vdyBpcyBhbiBhY3R1YWwgcG9pbnQgdG9vLlxuICAgIGxhc3QgPSBhY3R1YWxbYWN0dWFsLmxlbmd0aCAtIDFdXG4gICAgdmFsdWVzLnB1c2ggWyArIG5ldyBEYXRlKCkgLSBzdGFydCwgbGFzdC5wb2ludHMgXVxuXG4gICAgIyBodHRwOi8vY2xhc3Nyb29tLnN5bm9ueW0uY29tL2NhbGN1bGF0ZS10cmVuZGxpbmUtMjcwOS5odG1sXG4gICAgYjEgPSAwIDsgZSA9IDAgOyBjMSA9IDBcbiAgICBhID0gKGwgPSB2YWx1ZXMubGVuZ3RoKSAqIF8ucmVkdWNlKHZhbHVlcywgKHN1bSwgWyBhLCBiIF0pIC0+XG4gICAgICBiMSArPSBhIDsgZSArPSBiXG4gICAgICBjMSArPSBNYXRoLnBvdyhhLCAyKVxuICAgICAgc3VtICsgKGEgKiBiKVxuICAgICwgMClcblxuICAgIHNsb3BlID0gKGEgLSAoYjEgKiBlKSkgLyAoKGwgKiBjMSkgLSAoTWF0aC5wb3coYjEsIDIpKSlcbiAgICBpbnRlcmNlcHQgPSAoZSAtIChzbG9wZSAqIGIxKSkgLyBsXG4gICAgZm4gPSAoeCkgLT4gc2xvcGUgKiB4ICsgaW50ZXJjZXB0XG5cbiAgICAjIE1pbGVzdG9uZSBhbHdheXMgaGFzIGEgY3JlYXRpb24gZGF0ZS5cbiAgICBjcmVhdGVkX2F0ID0gbmV3IERhdGUgY3JlYXRlZF9hdFxuICAgICMgRHVlIGRhdGUgY2FuIGJlIGVtcHR5LlxuICAgIGR1ZV9vbiA9IGlmIGR1ZV9vbiB0aGVuIG5ldyBEYXRlKGR1ZV9vbikgZWxzZSBuZXcgRGF0ZSgpXG5cbiAgICBhID0gY3JlYXRlZF9hdCAtIHN0YXJ0XG4gICAgYiA9IGR1ZV9vbiAtIHN0YXJ0XG5cbiAgICBbXG4gICAgICB7XG4gICAgICAgICdkYXRlJzogY3JlYXRlZF9hdFxuICAgICAgICAncG9pbnRzJzogZm4oYSlcbiAgICAgIH0sIHtcbiAgICAgICAgJ2RhdGUnOiBkdWVfb25cbiAgICAgICAgJ3BvaW50cyc6IGZuKGIpXG4gICAgICB9XG4gICAgXSIsInsgXywgYXN5bmMgfSA9IHJlcXVpcmUgJy4uL3ZlbmRvci5jb2ZmZWUnXG5cbiMhL3Vzci9iaW4vZW52IGNvZmZlZVxuY29uZmlnICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9jb25maWcuY29mZmVlJ1xucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGlzc3VlcyBmb3IgYSBtaWxlc3RvbmUuXG4gIGZldGNoQWxsOiAocmVwbywgY2IpIC0+XG4gICAgIyBDYWxjdWxhdGUgc2l6ZSBvZiBlaXRoZXIgb3BlbiBvciBjbG9zZWQgaXNzdWVzLlxuICAgICMgTW9kaWZpZXMgaXNzdWVzIGJ5IHJlZi5cbiAgICBjYWxjU2l6ZSA9IChsaXN0LCBjYikgLT5cbiAgICAgIHN3aXRjaCBjb25maWcuZGF0YS5jaGFydC5wb2ludHNcbiAgICAgICAgd2hlbiAnT05FX1NJWkUnXG4gICAgICAgICAgc2l6ZSA9IGxpc3QubGVuZ3RoXG5cbiAgICAgICAgICAoIGlzc3VlLnNpemUgPSAxIGZvciBpc3N1ZSBpbiBsaXN0IClcblxuICAgICAgICAgIGNiIG51bGwsIHsgbGlzdCwgc2l6ZSB9XG4gICAgICAgIFxuICAgICAgICB3aGVuICdMQUJFTFMnXG4gICAgICAgICAgc2l6ZSA9IDBcblxuICAgICAgICAgIGxpc3QgPSBfLmZpbHRlciBsaXN0LCAoaXNzdWUpIC0+XG4gICAgICAgICAgICAjIFNraXAgaWYgbm8gbGFiZWxzIGV4aXN0LlxuICAgICAgICAgICAgcmV0dXJuIG5vIHVubGVzcyBsYWJlbHMgPSBpc3N1ZS5sYWJlbHNcblxuICAgICAgICAgICAgIyBEZXRlcm1pbmUgdGhlIHRvdGFsIGlzc3VlIHNpemUgZnJvbSBhbGwgbGFiZWxzLlxuICAgICAgICAgICAgaXNzdWUuc2l6ZSA9IF8ucmVkdWNlIGxhYmVscywgKHN1bSwgbGFiZWwpIC0+XG4gICAgICAgICAgICAgICMgTm90IG1hdGNoaW5nLlxuICAgICAgICAgICAgICByZXR1cm4gc3VtIHVubGVzcyBtYXRjaGVzID0gbGFiZWwubmFtZS5tYXRjaCBjb25maWcuZGF0YS5jaGFydC5zaXplX2xhYmVsXG4gICAgICAgICAgICAgICMgSW5jcmVhc2Ugc3VtLlxuICAgICAgICAgICAgICBzdW0gKz0gcGFyc2VJbnQgbWF0Y2hlc1sxXVxuICAgICAgICAgICAgLCAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgSW5jcmVhc2UgdGhlIHRvdGFsLlxuICAgICAgICAgICAgc2l6ZSArPSBpc3N1ZS5zaXplXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgQXJlIHdlIHNhdmluZyBpdD9cbiAgICAgICAgICAgICEhaXNzdWUuc2l6ZVxuXG4gICAgICAgICAgY2IgbnVsbCwgeyBsaXN0LCBzaXplIH1cblxuICAgICMgRm9yIGVhY2ggc3RhdGUuLi5cbiAgICBvbmVTdGF0dXMgPSAoc3RhdGUsIGNiKSAtPlxuICAgICAgIyBDb25jYXQgdGhlbSBoZXJlLlxuICAgICAgcmVzdWx0cyA9IFtdXG5cbiAgICAgICMgT25lIHBhZ2VmdWwgZmV0Y2ggKG5leHQgcGFnZXMgaW4gc2VyaWVzKS5cbiAgICAgIGRvIGZldGNoUGFnZSA9IChwYWdlPTEpIC0+XG4gICAgICAgIHJlcXVlc3QuYWxsSXNzdWVzIHJlcG8sIHsgc3RhdGUsIHBhZ2UgfSwgKGVyciwgZGF0YSkgLT5cbiAgICAgICAgICAjIEVycm9ycz9cbiAgICAgICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuICAgICAgICAgICMgRW1wdHk/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgdW5sZXNzIGRhdGEubGVuZ3RoXG4gICAgICAgICAgIyBDb25jYXQgc29ydGVkIChhcGkgZG9lcyBub3Qgc29ydCBvbiBjbG9zZWRfYXQhKS5cbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQgXy5zb3J0QnkgZGF0YSwgJ2Nsb3NlZF9hdCdcbiAgICAgICAgICAjIDwgMTAwIHJlc3VsdHM/XG4gICAgICAgICAgcmV0dXJuIGNiIG51bGwsIHJlc3VsdHMgaWYgZGF0YS5sZW5ndGggPCAxMDBcbiAgICAgICAgICAjIEZldGNoIHRoZSBuZXh0IHBhZ2UgdGhlbi5cbiAgICAgICAgICBmZXRjaFBhZ2UgcGFnZSArIDFcblxuICAgICMgRm9yIGVhY2ggYG9wZW5gIGFuZCBgY2xvc2VkYCBpc3N1ZXMgaW4gcGFyYWxsZWwuXG4gICAgYXN5bmMucGFyYWxsZWwgW1xuICAgICAgXy5wYXJ0aWFsIGFzeW5jLndhdGVyZmFsbCwgWyBfLnBhcnRpYWwob25lU3RhdHVzLCAnb3BlbicpLCAgIGNhbGNTaXplIF1cbiAgICAgIF8ucGFydGlhbCBhc3luYy53YXRlcmZhbGwsIFsgXy5wYXJ0aWFsKG9uZVN0YXR1cywgJ2Nsb3NlZCcpLCBjYWxjU2l6ZSBdXG4gICAgXSwgKGVyciwgWyBvcGVuLCBjbG9zZWQgXSkgLT5cbiAgICAgIGNiIGVyciwgeyBvcGVuLCBjbG9zZWQgfSIsIiMhL3Vzci9iaW4vZW52IGNvZmZlZVxucmVxdWVzdCA9IHJlcXVpcmUgJy4vcmVxdWVzdC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIEZldGNoIGEgbWlsZXN0b25lLlxuICAnZmV0Y2gnOiByZXF1ZXN0Lm9uZU1pbGVzdG9uZVxuXG4gICMgRmV0Y2ggYWxsIG1pbGVzdG9uZXMuXG4gICdmZXRjaEFsbCc6IHJlcXVlc3QuYWxsTWlsZXN0b25lc1xuXG4gICAgIyAjIEdldCB0aGUgY3VycmVudCBtaWxlc3RvbmUgb3V0IG9mIG1hbnkuXG4gICAgIyBlbHNlXG4gICAgIyAgIHJlcXVlc3QuYWxsTWlsZXN0b25lcyByZXBvLCAoZXJyLCBkYXRhKSAtPlxuICAgICMgICAgICMgRXJyb3JzP1xuICAgICMgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgIyAgICAgIyBFbXB0eSB3YXJuaW5nP1xuICAgICMgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIG9wZW4gbWlsZXN0b25lcyBmb3IgcmVwbyAje3JlcG8ucGF0aH1cIiB1bmxlc3MgZGF0YS5sZW5ndGhcbiAgICAjICAgICAjIFRoZSBmaXJzdCBtaWxlc3RvbmUgc2hvdWxkIGJlIGVuZGluZyBzb29uZXN0LlxuICAgICMgICAgIG0gPSBkYXRhWzBdXG4gICAgIyAgICAgIyBGaWx0ZXIgbWlsZXN0b25lcyB3aXRob3V0IGR1ZSBkYXRlLlxuICAgICMgICAgIG0gPSBfLnJlc3QgZGF0YSwgeyAnZHVlX29uJyA6IG51bGwgfVxuICAgICMgICAgICMgVGhlIGZpcnN0IG1pbGVzdG9uZSBzaG91bGQgYmUgZW5kaW5nIHNvb25lc3QuIFByZWZlciBtaWxlc3RvbmVzIHdpdGggZHVlIGRhdGVzLlxuICAgICMgICAgIG0gPSBpZiBtWzBdIHRoZW4gbVswXSBlbHNlIGRhdGFbMF1cbiAgICAjICAgICAjIEVtcHR5IG1pbGVzdG9uZT9cbiAgICAjICAgICBpZiBtLm9wZW5faXNzdWVzICsgbS5jbG9zZWRfaXNzdWVzIGlzIDBcbiAgICAjICAgICAgIHJldHVybiBjYiBudWxsLCBcIk5vIGlzc3VlcyBmb3IgbWlsZXN0b25lIGAje20udGl0bGV9YFwiXG5cbiAgICAjICAgICBjYiBudWxsLCBudWxsLCBtIiwieyBfLCBTdXBlckFnZW50IH0gPSByZXF1aXJlICcuLi92ZW5kb3IuY29mZmVlJ1xuXG51c2VyID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3VzZXIuY29mZmVlJ1xuXG4jIEN1c3RvbSBKU09OIHBhcnNlci5cblN1cGVyQWdlbnQucGFyc2UgPVxuICAnYXBwbGljYXRpb24vanNvbic6IChyZXMpIC0+XG4gICAgdHJ5XG4gICAgICBKU09OLnBhcnNlIHJlc1xuICAgIGNhdGNoIGVcbiAgICAgIHt9ICMgaXQgd2FzIG5vdCB0byBiZS4uLlxuXG4jIERlZmF1bHQgYXJncy5cbmRlZmF1bHRzID1cbiAgJ2dpdGh1Yic6XG4gICAgJ2hvc3QnOiAnYXBpLmdpdGh1Yi5jb20nXG4gICAgJ3Byb3RvY29sJzogJ2h0dHBzJ1xuXG4jIFB1YmxpYyBhcGkuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFxuICAjIEdldCBhIHJlcG8uXG4gIHJlcG86ICh7IG93bmVyLCBuYW1lIH0sIGNiKSAtPlxuICAgIHJldHVybiBjYiAnUmVxdWVzdCBpcyBtYWxmb3JtZWQnIHVubGVzcyBpc1ZhbGlkIHsgb3duZXIsIG5hbWUgfVxuXG4gICAgcmVhZHkgLT5cbiAgICAgIGRhdGEgPSBfLmRlZmF1bHRzXG4gICAgICAgICdwYXRoJzogICBcIi9yZXBvcy8je293bmVyfS8je25hbWV9XCJcbiAgICAgICAgJ2hlYWRlcnMnOiAgaGVhZGVycyB1c2VyLmRhdGEuYWNjZXNzVG9rZW5cbiAgICAgICwgZGVmYXVsdHMuZ2l0aHViXG5cbiAgICAgIHJlcXVlc3QgZGF0YSwgY2JcblxuICAjIEdldCBhbGwgb3BlbiBtaWxlc3RvbmVzLlxuICBhbGxNaWxlc3RvbmVzOiAoeyBvd25lciwgbmFtZSB9LCBjYikgLT4gXG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSB9XG5cbiAgICByZWFkeSAtPlxuICAgICAgZGF0YSA9IF8uZGVmYXVsdHNcbiAgICAgICAgJ3BhdGgnOiAgIFwiL3JlcG9zLyN7b3duZXJ9LyN7bmFtZX0vbWlsZXN0b25lc1wiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuICBcbiAgIyBHZXQgb25lIG9wZW4gbWlsZXN0b25lLlxuICBvbmVNaWxlc3RvbmU6ICh7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9taWxlc3RvbmVzLyN7bWlsZXN0b25lfVwiXG4gICAgICAgICdxdWVyeSc6ICB7ICdzdGF0ZSc6ICdvcGVuJywgJ3NvcnQnOiAnZHVlX2RhdGUnLCAnZGlyZWN0aW9uJzogJ2FzYycgfVxuICAgICAgICAnaGVhZGVycyc6ICBoZWFkZXJzIHVzZXIuZGF0YS5hY2Nlc3NUb2tlblxuICAgICAgLCBkZWZhdWx0cy5naXRodWJcblxuICAgICAgcmVxdWVzdCBkYXRhLCBjYlxuXG4gICMgR2V0IGFsbCBpc3N1ZXMgZm9yIGEgc3RhdGUuXG4gIGFsbElzc3VlczogKHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCBxdWVyeSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiICdSZXF1ZXN0IGlzIG1hbGZvcm1lZCcgdW5sZXNzIGlzVmFsaWQgeyBvd25lciwgbmFtZSwgbWlsZXN0b25lIH1cblxuICAgIHJlYWR5IC0+XG4gICAgICBkYXRhID0gXy5kZWZhdWx0c1xuICAgICAgICAncGF0aCc6ICAgXCIvcmVwb3MvI3tvd25lcn0vI3tuYW1lfS9pc3N1ZXNcIlxuICAgICAgICAncXVlcnknOiAgXy5leHRlbmQgcXVlcnksIHsgbWlsZXN0b25lLCAncGVyX3BhZ2UnOiAnMTAwJyB9XG4gICAgICAgICdoZWFkZXJzJzogIGhlYWRlcnMgdXNlci5kYXRhLmFjY2Vzc1Rva2VuXG4gICAgICAsIGRlZmF1bHRzLmdpdGh1YlxuXG4gICAgICByZXF1ZXN0IGRhdGEsIGNiXG5cbiMgTWFrZSBhIHJlcXVlc3QgdXNpbmcgU3VwZXJBZ2VudC5cbnJlcXVlc3QgPSAoeyBwcm90b2NvbCwgaG9zdCwgcGF0aCwgcXVlcnksIGhlYWRlcnMgfSwgY2IpIC0+XG4gIGV4aXRlZCA9IG5vXG5cbiAgIyBNYWtlIHRoZSBxdWVyeSBwYXJhbXMuXG4gIHEgPSBpZiBxdWVyeSB0aGVuICc/JyArICggXCIje2t9PSN7dn1cIiBmb3IgaywgdiBvZiBxdWVyeSApLmpvaW4oJyYnKSBlbHNlICcnXG5cbiAgIyBUaGUgVVJJLlxuICByZXEgPSBTdXBlckFnZW50LmdldChcIiN7cHJvdG9jb2x9Oi8vI3tob3N0fSN7cGF0aH0je3F9XCIpXG4gICMgQWRkIGhlYWRlcnMuXG4gICggcmVxLnNldChrLCB2KSBmb3IgaywgdiBvZiBoZWFkZXJzIClcbiAgXG4gICMgVGltZW91dCBmb3IgcmVxdWVzdHMgdGhhdCBkbyBub3QgZmluaXNoLi4uIHNlZSAjMzIuXG4gIHRpbWVvdXQgPSBzZXRUaW1lb3V0IC0+XG4gICAgZXhpdGVkID0geWVzXG4gICAgY2IgJ1JlcXVlc3QgaGFzIHRpbWVkIG91dCdcbiAgLCAxZTQgIyBnaXZlIHVzIDEwc1xuXG4gICMgU2VuZC5cbiAgcmVxLmVuZCAoZXJyLCBkYXRhKSAtPlxuICAgICMgQXJyaXZlZCB0b28gbGF0ZS5cbiAgICByZXR1cm4gaWYgZXhpdGVkXG4gICAgIyBBbGwgZmluZS5cbiAgICBleGl0ZWQgPSB5ZXNcbiAgICBjbGVhclRpbWVvdXQgdGltZW91dFxuICAgICMgQWN0dWFsbHkgcHJvY2VzcyB0aGUgcmVzcG9uc2UuXG4gICAgcmVzcG9uc2UgZXJyLCBkYXRhLCBjYlxuXG4jIEhvdyBkbyB3ZSByZXNwb25kIHRvIGEgcmVzcG9uc2U/XG5yZXNwb25zZSA9IChlcnIsIGRhdGEsIGNiKSAtPlxuICByZXR1cm4gY2IgZXJyb3IgZXJyIGlmIGVyclxuICAjIDJ4eD9cbiAgaWYgZGF0YS5zdGF0dXNUeXBlIGlzbnQgMlxuICAgICMgRG8gd2UgaGF2ZSBhIG1lc3NhZ2UgZnJvbSBHaXRIdWI/XG4gICAgcmV0dXJuIGNiIGRhdGEuYm9keS5tZXNzYWdlIGlmIGRhdGE/LmJvZHk/Lm1lc3NhZ2U/XG4gICAgIyBVc2UgU0Egb25lLlxuICAgIHJldHVybiBjYiBkYXRhLmVycm9yLm1lc3NhZ2VcbiAgIyBBbGwgZ29vZC5cbiAgY2IgbnVsbCwgZGF0YS5ib2R5XG5cbiMgR2l2ZSB1cyBoZWFkZXJzLlxuaGVhZGVycyA9ICh0b2tlbikgLT5cbiAgIyBUaGUgZGVmYXVsdHMuXG4gIGggPVxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMnXG4gICMgQWRkIHRva2VuP1xuICBoLkF1dGhvcml6YXRpb24gPSBcInRva2VuICN7dG9rZW59XCIgaWYgdG9rZW4/XG4gIGhcblxuaXNWYWxpZCA9IChvYmopIC0+XG4gIHJ1bGVzID1cbiAgICAnb3duZXInOiAgICAgKHZhbCkgLT4gdmFsP1xuICAgICduYW1lJzogICAgICAodmFsKSAtPiB2YWw/XG4gICAgJ21pbGVzdG9uZSc6ICh2YWwpIC0+IF8uaXNJbnQgdmFsXG4gIFxuICAoIHJldHVybiBubyBmb3Iga2V5LCB2YWwgb2Ygb2JqIHdoZW4ga2V5IG9mIHJ1bGVzIGFuZCBub3QgcnVsZXNba2V5XSh2YWwpIClcblxuICB5ZXNcblxuIyBTd2l0Y2ggd2hlbiB1c2VyIGlzIHJlYWR5LlxuaXNSZWFkeSA9IHVzZXIuZGF0YS5yZWFkeVxuXG4jIEEgc3RhY2sgb2YgcmVxdWVzdHMgdG8gZXhlY3V0ZSBvbmNlIHJlYWR5Llxuc3RhY2sgPSBbXVxucmVhZHkgPSAoY2IpIC0+XG4gIGlmIGlzUmVhZHkgdGhlbiBkbyBjYiBlbHNlIHN0YWNrLnB1c2ggY2JcblxuIyBPYnNlcnZlIHVzZXIncyByZWFkaW5lc3MuXG51c2VyLm9ic2VydmUgJ3JlYWR5JywgKHZhbCkgLT5cbiAgaXNSZWFkeSA9IHZhbFxuICAjIENsZWFyIHRoZSBzdGFjaz9cbiAgKCBkbyBzdGFjay5zaGlmdCgpIHdoaWxlIHN0YWNrLmxlbmd0aCApIGlmIHZhbFxuXG4jIFBhcnNlIGFuIGVycm9yLlxuZXJyb3IgPSAoZXJyKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIF8uaXNTdHJpbmcgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyXG4gICAgd2hlbiBfLmlzQXJyYXkgZXJyXG4gICAgICBtZXNzYWdlID0gZXJyWzFdXG4gICAgd2hlbiBfLmlzT2JqZWN0KGVycikgYW5kIF8uaXNTdHJpbmcoZXJyLm1lc3NhZ2UpXG4gICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcblxuICB1bmxlc3MgbWVzc2FnZVxuICAgIHRyeVxuICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5IGVyclxuICAgIGNhdGNoXG4gICAgICBtZXNzYWdlID0gZG8gZXJyLnRvU3RyaW5nXG5cbiAgbWVzc2FnZSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi92ZW5kb3IuY29mZmVlJ1xuXG5NZWRpYXRvciA9IFJhY3RpdmUuZXh0ZW5kIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1lZGlhdG9yKCkiLCJ7IF8sIGRpcmVjdG9yIH0gPSByZXF1aXJlICcuL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xuXG5lbCA9ICcjcGFnZSdcblxucGFnZXMgPVxuICBcImluZGV4XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9pbmRleC5jb2ZmZWVcIlxuICBcIm1pbGVzdG9uZVwiOiByZXF1aXJlIFwiLi4vdmlld3MvcGFnZXMvbWlsZXN0b25lLmNvZmZlZVwiXG4gIFwibmV3XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9uZXcuY29mZmVlXCJcbiAgXCJwcm9qZWN0XCI6IHJlcXVpcmUgXCIuLi92aWV3cy9wYWdlcy9wcm9qZWN0LmNvZmZlZVwiXG5cbiMgQWRkIGEgcHJvamVjdCBmcm9tIGEgcm91dGUuXG5hZGRQcm9qZWN0ID0gKHBhZ2UsIG93bmVyLCBuYW1lKSAtPlxuICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvYWRkJywgeyBvd25lciwgbmFtZSB9XG5cbiMgUHJlYXBwbHkgYWxsIGZ1bmN0aW9ucyB3aXRoIG91ciBwYWdlIG5hbWUvY29udGV4dC5cbmMgPSAobmFtZSwgZm5zPVtdKSAtPlxuICAoIF8ucGFydGlhbCBmbiwgbmFtZSBmb3IgZm4gaW4gZm5zIClcblxudmlldyA9IG51bGxcbnJvdXRlID0gKHBhZ2UsIGFyZ3MuLi4pIC0+XG4gICMgVW5yZW5kZXIgdGhlIHByZXZpb3VzIG9uZS5cbiAgZG8gdmlldz8udGVhcmRvd25cbiAgIyBIaWRlIGFueSBub3RpZmljYXRpb25zLlxuICBtZWRpYXRvci5maXJlICchYXBwL25vdGlmeS9oaWRlJ1xuICAjIFJlcXVpcmUgdGhlIG5ldyBvbmUuXG4gIFBhZ2UgPSBwYWdlc1twYWdlXVxuICAjIFJlbmRlciBpdC5cbiAgdmlldyA9IG5ldyBQYWdlIHsgZWwsICdkYXRhJzogeyAncm91dGUnOiBhcmdzIH0gfVxuXG5yb3V0ZXMgPVxuICAnLyc6ICAgICAgICAgICAgICAgICAgICAgICAgYyAnaW5kZXgnLCBbIHJvdXRlIF1cbiAgJy9uZXcvcHJvamVjdCc6ICAgICAgICAgICAgIGMgJ25ldycsICAgWyByb3V0ZSBdXG4gICMgVGhlIGZvbGxvd2luZyB0d28gcm91dGVzIGFkZCBhIHByb2plY3QgaW4gdGhlIGJhY2tncm91bmQuXG4gICcvOm93bmVyLzpuYW1lJzogICAgICAgICAgICBjICdwcm9qZWN0JywgICBbIGFkZFByb2plY3QsIHJvdXRlIF1cbiAgJy86b3duZXIvOm5hbWUvOm1pbGVzdG9uZSc6IGMgJ21pbGVzdG9uZScsIFsgYWRkUHJvamVjdCwgcm91dGUgXVxuICAjIFRPRE86IHJlbW92ZSBpbiBwcm9kdWN0aW9uLlxuICAnL3Jlc2V0JzogLT5cbiAgICBtZWRpYXRvci5maXJlICchcHJvamVjdHMvY2xlYXInXG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuIyBGbGF0aXJvbiBEaXJlY3RvciByb3V0ZXIuXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yLlJvdXRlcihyb3V0ZXMpLmNvbmZpZ3VyZVxuICAnc3RyaWN0Jzogbm8gIyBhbGxvdyB0cmFpbGluZyBzbGFzaGVzXG4gIG5vdGZvdW5kOiAtPlxuICAgIHRocm93IDQwNCIsIiMgUHJvZ3Jlc3MgaW4gJS5cbnByb2dyZXNzID0gKGEsIGIpIC0+IDEwMCAqIChhIC8gKGIgKyBhKSlcblxuIyBDYWxjdWxhdGUgdGhlIHN0YXRzIGZvciBhIG1pbGVzdG9uZS5cbiMgIElzIGl0IG9uIHRpbWU/IFdoYXQgaXMgdGhlIHByb2dyZXNzP1xubW9kdWxlLmV4cG9ydHMgPSAobWlsZXN0b25lKSAtPlxuICAgICMgUHJvZ3Jlc3MgaW4gcG9pbnRzLlxuICAgIHBvaW50cyA9IHByb2dyZXNzIG1pbGVzdG9uZS5pc3N1ZXMuY2xvc2VkLnNpemUsIG1pbGVzdG9uZS5pc3N1ZXMub3Blbi5zaXplICAgIFxuICAgIFxuICAgICMgTWlsZXN0b25lcyB3aXRoIG5vIGR1ZSBkYXRlIGFyZSBhbHdheXMgb24gdHJhY2suXG4gICAgcmV0dXJuIHsgJ2lzT25UaW1lJzogeWVzLCAncHJvZ3Jlc3MnOiB7IHBvaW50cyB9IH0gdW5sZXNzIG1pbGVzdG9uZS5kdWVfb25cblxuICAgIGEgPSArbmV3IERhdGUgbWlsZXN0b25lLmNyZWF0ZWRfYXRcbiAgICBiID0gK25ldyBEYXRlXG4gICAgYyA9ICtuZXcgRGF0ZSBtaWxlc3RvbmUuZHVlX29uXG5cbiAgICAjIFByb2dyZXNzIGluIHRpbWUuXG4gICAgdGltZSA9IHByb2dyZXNzIGIgLSBhLCBjIC0gYlxuXG4gICAgaXNPblRpbWUgPSBwb2ludHMgPiB0aW1lXG5cbiAgICB7XG4gICAgICAnaXNPblRpbWUnOiBpc09uVGltZVxuICAgICAgJ3Byb2dyZXNzJzogeyBwb2ludHMsIHRpbWUgfVxuICAgIH0iLCIjIEFsbCBvdXIgdmVuZG9yIGRlcGVuZGVuY2llcyBpbiBvbmUgcGxhY2UuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICdfJzogd2luZG93Ll9cbiAgJ1JhY3RpdmUnOiB3aW5kb3cuUmFjdGl2ZVxuICAnRmlyZWJhc2UnOiB3aW5kb3cuRmlyZWJhc2VcbiAgJ0ZpcmViYXNlU2ltcGxlTG9naW4nOiB3aW5kb3cuRmlyZWJhc2VTaW1wbGVMb2dpblxuICAnU3VwZXJBZ2VudCc6IHdpbmRvdy5zdXBlcmFnZW50XG4gICdhc3luYyc6IHdpbmRvdy5hc3luY1xuICAnbW9tZW50Jzogd2luZG93Lm1vbWVudFxuICAnZDMnOiB3aW5kb3cuZDNcbiAgJ21hcmtlZCc6IHdpbmRvdy5tYXJrZWRcbiAgJ2RpcmVjdG9yJzpcbiAgICAnUm91dGVyJzogd2luZG93LlJvdXRlclxuICAnbHNjYWNoZSc6IHdpbmRvdy5sc2NhY2hlIiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcImFwcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJOb3RpZnlcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJIZWFkZXJcIn0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicGFnZVwifSxcImZcIjpbXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiZm9vdGVyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJ3cmFwXCJ9LFwiZlwiOltcIiZjb3B5OyAyMDEyLTIwMTQgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiaHR0cDovL2Nsb3VkZmkucmVcIn0sXCJmXCI6W1wiQ2xvdWRmaXJlIFN5c3RlbXNcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY2hhcnRcIn19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVhZFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTMsXCJyXCI6XCJ1c2VyXCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwicmlnaHRcIn0sXCJ0MVwiOlwiZmFkZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcImRpc3BsYXlOYW1lXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwiZGlzcGxheU5hbWVcIn0sXCIgbG9nZ2VkIGluXCJdfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiY2xhc3NcIjpcImdpdGh1YlwifSxcInZcIjp7XCJjbGlja1wiOlwiIWxvZ2luXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwiZ2l0aHViXCJ9fSxcIiBTaWduIEluXCJdfV0sXCJyXCI6XCJkaXNwbGF5TmFtZVwifV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJpZFwiOlwiaWNvblwiLFwiaHJlZlwiOlwiI1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ1bFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNuZXcvcHJvamVjdFwiLFwiY2xhc3NcIjpcImFkZFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIGEgUHJvamVjdFwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImxpXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJmYXFcIn0sXCJmXCI6W1wiRkFRXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI3Jlc2V0XCJ9LFwiZlwiOltcIkRCIFJlc2V0XCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwibGlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25vdGlmeVwifSxcImZcIjpbXCJOb3RpZnlcIl19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiaGVyb1wifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwiY29udGVudFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcImFkZHJlc3NcIn19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJTZWUgeW91ciBwcm9qZWN0IHByb2dyZXNzXCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJOb3Qgc3VyZSB3aGVyZSB0byBzdGFydD8gSnVzdCBhZGQgYSBkZW1vIHJlcG8gdG8gc2VlIGEgY2hhcnQuIFRoZXJlIGFyZSBtYW55IHZhcmlhdGlvbnMgb2YgcGFzc2FnZXMgb2YgTG9yZW0gSXBzdW0gYXZhaWxhYmxlLCBidXQgdGhlIG1ham9yaXR5IGhhdmUgc3VmZmVyZWQgYWx0ZXJhdGlvbiBpbiBzb21lIGZvcm0sIGJ5IGluamVjdGVkIGh1bW91ciwgb3IgcmFuZG9taXNlZCB3b3JkcyB3aGljaCBkb24ndCBsb29rIGV2ZW4gc2xpZ2h0bHkgYmVsaWV2YWJsZS5cIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImN0YVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI25ldy9wcm9qZWN0XCIsXCJjbGFzc1wiOlwicHJpbWFyeVwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpcInBsdXMtY2lyY2xlZFwifX0sXCIgQWRkIHlvdXIgcHJvamVjdFwiXX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNlY29uZGFyeVwifSxcImZcIjpbXCJSZWFkIHRoZSBHdWlkZVwiXX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcImNvZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJzcGFuXCIsXCJhXCI6e1wiY2xhc3NcIjpbXCJpY29uIFwiLHtcInRcIjoyLFwiclwiOlwiaWNvblwifV19LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiY29kZVwiXSxcInNcIjpcIlxcXCImI1xcXCIrXzArXFxcIjtcXFwiXCJ9fV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NCxcInJcIjpcInRleHRcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJzeXN0ZW1cIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwibm90aWZ5XCIsXCJjbGFzc1wiOlt7XCJ0XCI6MixcInJcIjpcInR5cGVcIn0sXCIgc3lzdGVtXCJdLFwic3R5bGVcIjpbXCJ0b3A6XCIse1widFwiOjIsXCJyXCI6XCJ0b3BcIn0sXCIlXCJdfSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJJY29uc1wiLFwiYVwiOntcImljb25cIjpbe1widFwiOjIsXCJyXCI6XCJpY29uXCJ9XX19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwicFwiLFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcInRleHRcIn1dfV19XX0se1widFwiOjQsXCJuXCI6NTEsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcIm5vdGlmeVwiLFwiY2xhc3NcIjpbe1widFwiOjIsXCJyXCI6XCJ0eXBlXCJ9XSxcInN0eWxlXCI6W1widG9wOlwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJ0b3BcIl0sXCJzXCI6XCItXzBcIn19LFwicHhcIl19LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwiY2xvc2VcIn0sXCJ2XCI6e1wiY2xpY2tcIjpcImNsb3NlXCJ9fSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlt7XCJ0XCI6MixcInJcIjpcImljb25cIn1dfX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJwXCIsXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGV4dFwifV19XX1dLFwiclwiOlwic3lzdGVtXCJ9XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJwcm9qZWN0cy5saXN0XCIsXCJmXCI6W3tcInRcIjo0LFwiclwiOlwicmVhZHlcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcInQxXCI6XCJmYWRlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiUHJvamVjdHNcIixcImFcIjp7XCJwcm9qZWN0c1wiOlt7XCJ0XCI6MixcInJcIjpcInByb2plY3RzXCJ9XX19XX1dfV19LHtcInRcIjo0LFwiblwiOjUxLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkhlcm9cIn1dLFwiclwiOlwicHJvamVjdHMubGlzdFwifV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS50aXRsZVwiXSxcInNcIjpcIl8wLnRpdGxlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwic3ViXCJ9LFwiZlwiOlt7XCJ0XCI6MyxcInhcIjp7XCJyXCI6W1wiZm9ybWF0XCIsXCJtaWxlc3RvbmUuZHVlX29uXCJdLFwic1wiOlwiXzAuZHVlKF8xKVwifX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImFcIjp7XCJjbGFzc1wiOlwiZGVzY3JpcHRpb25cIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcIm1pbGVzdG9uZS5kZXNjcmlwdGlvblwiXSxcInNcIjpcIl8wLm1hcmtkb3duKF8xKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiQ2hhcnRcIixcImFcIjp7XCJtaWxlc3RvbmVcIjpbe1widFwiOjIsXCJyXCI6XCJtaWxlc3RvbmVcIn1dfX1dfV19XX1dfSIsIm1vZHVsZS5leHBvcnRzPXtcInZcIjoxLFwidFwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImlkXCI6XCJjb250ZW50XCIsXCJjbGFzc1wiOlwid3JhcFwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiYWRkXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJBZGQgYSBQcm9qZWN0XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcInBcIixcImZcIjpbXCJUeXBlIGluIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IGFzIHlvdSB3b3VsZCBub3JtYWxseS4gSWYgeW91J2QgbGlrZSB0byBhZGQgYSBwcml2YXRlIEdpdEh1YiBwcm9qZWN0LCBcIix7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJocmVmXCI6XCIjXCJ9LFwiZlwiOltcIlNpZ24gSW5cIl19LFwiIGZpcnN0LlwiXX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb3JtXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRhYmxlXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImlucHV0XCIsXCJhXCI6e1widHlwZVwiOlwidGV4dFwiLFwicGxhY2Vob2xkZXJcIjpcInVzZXIvcmVwb1wiLFwiYXV0b2NvbXBsZXRlXCI6XCJvZmZcIixcInZhbHVlXCI6W3tcInRcIjoyLFwiclwiOlwidmFsdWVcIn1dfSxcInZcIjp7XCJrZXl1cFwiOntcIm5cIjpcInN1Ym1pdFwiLFwiZFwiOlt7XCJ0XCI6MixcInJcIjpcInZhbHVlXCJ9XX19fV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJ2XCI6e1wiY2xpY2tcIjp7XCJuXCI6XCJzdWJtaXRcIixcImRcIjpbe1widFwiOjIsXCJyXCI6XCJ2YWx1ZVwifV19fSxcImZcIjpbXCJBZGRcIl19XX1dfV19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjQsXCJyXCI6XCJyZWFkeVwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwidDFcIjpcImZhZGVcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiaDJcIixcImFcIjp7XCJjbGFzc1wiOlwidGl0bGVcIn0sXCJmXCI6W3tcInRcIjoyLFwieFwiOntcInJcIjpbXCJyb3V0ZVwiXSxcInNcIjpcIl8wLmpvaW4oXFxcIi9cXFwiKVwifX1dfV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwiY29udGVudFwiLFwiY2xhc3NcIjpcIndyYXBcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiTWlsZXN0b25lc1wiLFwiYVwiOntcInByb2plY3RcIjpbe1widFwiOjIsXCJyXCI6XCJwcm9qZWN0XCJ9XX19XX1dfV19XX0iLCJtb2R1bGUuZXhwb3J0cz17XCJ2XCI6MSxcInRcIjpbe1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJpZFwiOlwicHJvamVjdHNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcImhlYWRlclwifSxcImZcIjpbe1widFwiOjcsXCJlXCI6XCJhXCIsXCJhXCI6e1wiaHJlZlwiOlwiI1wiLFwiY2xhc3NcIjpcInNvcnRcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJzb3J0LWFscGhhYmV0XCJ9fSxcIiBTb3J0ZWQgYnkgcHJpb3JpdHlcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwiaDJcIixcImZcIjpbXCJNaWxlc3RvbmVzXCJdfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGFibGVcIixcImZcIjpbe1widFwiOjQsXCJyXCI6XCJwcm9qZWN0Lm1pbGVzdG9uZXNcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImNsYXNzXCI6XCJtaWxlc3RvbmVcIixcImhyZWZcIjpbXCIjXCIse1widFwiOjIsXCJyXCI6XCJwcm9qZWN0Lm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwicHJvamVjdC5uYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcInN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJkdWVcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcImR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJzdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcInN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJjb2dcIn19LFwiIEVkaXRcIl19XX1dfV19IiwibW9kdWxlLmV4cG9ydHM9e1widlwiOjEsXCJ0XCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiaWRcIjpcInByb2plY3RzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJoZWFkZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIixcImNsYXNzXCI6XCJzb3J0XCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcIkljb25zXCIsXCJhXCI6e1wiaWNvblwiOlwic29ydC1hbHBoYWJldFwifX0sXCIgU29ydGVkIGJ5IHByaW9yaXR5XCJdfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImgyXCIsXCJmXCI6W1wiUHJvamVjdHNcIl19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0YWJsZVwiLFwiZlwiOlt7XCJ0XCI6NCxcInJcIjpcInByb2plY3RzLmxpc3RcIixcImZcIjpbe1widFwiOjQsXCJuXCI6NTAsXCJyXCI6XCJlcnJvcnNcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0clwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInRkXCIsXCJhXCI6e1wiY29sc3BhblwiOlwiM1wiLFwiY2xhc3NcIjpcInJlcG9cIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2plY3RcIn0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJlcnJvclwiLFwidGl0bGVcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcImVycm9yc1wiXSxcInNcIjpcIl8wLmpvaW4oXFxcIlxcXFxuXFxcIilcIn19XX0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJhdHRlbnRpb25cIn19XX1dfV19XX1dfSx7XCJ0XCI6NCxcIm5cIjo1MSxcImZcIjpbe1widFwiOjQsXCJyXCI6XCJtaWxlc3RvbmVzXCIsXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwidHJcIixcImZcIjpbe1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiYVwiOntcImNsYXNzXCI6XCJyZXBvXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwicHJvamVjdFwiLFwiaHJlZlwiOltcIiNcIix7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19LFwiZlwiOlt7XCJ0XCI6MixcInJcIjpcIm93bmVyXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibmFtZVwifV19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJ0ZFwiLFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImFcIixcImFcIjp7XCJjbGFzc1wiOlwibWlsZXN0b25lXCIsXCJocmVmXCI6W1wiI1wiLHtcInRcIjoyLFwiclwiOlwib3duZXJcIn0sXCIvXCIse1widFwiOjIsXCJyXCI6XCJuYW1lXCJ9LFwiL1wiLHtcInRcIjoyLFwiclwiOlwibnVtYmVyXCJ9XX0sXCJmXCI6W3tcInRcIjoyLFwiclwiOlwidGl0bGVcIn1dfV19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwidGRcIixcImFcIjp7XCJzdHlsZVwiOlwid2lkdGg6MSVcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiZGl2XCIsXCJhXCI6e1wiY2xhc3NcIjpcInByb2dyZXNzXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcInNwYW5cIixcImFcIjp7XCJjbGFzc1wiOlwicGVyY2VudFwifSxcImZcIjpbe1widFwiOjIsXCJ4XCI6e1wiclwiOltcInN0YXRzLnByb2dyZXNzLnBvaW50c1wiXSxcInNcIjpcIk1hdGguZmxvb3IoXzApXCJ9fSxcIiVcIl19LFwiIFwiLHtcInRcIjo3LFwiZVwiOlwic3BhblwiLFwiYVwiOntcImNsYXNzXCI6XCJkdWVcIn0sXCJmXCI6W3tcInRcIjozLFwieFwiOntcInJcIjpbXCJmb3JtYXRcIixcImR1ZV9vblwiXSxcInNcIjpcIl8wLmR1ZShfMSlcIn19XX0sXCIgXCIse1widFwiOjcsXCJlXCI6XCJkaXZcIixcImFcIjp7XCJjbGFzc1wiOlwib3V0ZXIgYmFyXCJ9LFwiZlwiOlt7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6W1wiaW5uZXIgYmFyIFwiLHtcInRcIjoyLFwieFwiOntcInJcIjpbXCJzdGF0cy5pc09uVGltZVwiXSxcInNcIjpcIihfMCk/XFxcImdyZWVuXFxcIjpcXFwicmVkXFxcIlwifX1dLFwic3R5bGVcIjpbXCJ3aWR0aDpcIix7XCJ0XCI6MixcInJcIjpcInN0YXRzLnByb2dyZXNzLnBvaW50c1wifSxcIiVcIl19fV19XX1dfV19XX1dLFwiclwiOlwiZXJyb3JzXCJ9XX1dfSxcIiBcIix7XCJ0XCI6NyxcImVcIjpcImRpdlwiLFwiYVwiOntcImNsYXNzXCI6XCJmb290ZXJcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiYVwiLFwiYVwiOntcImhyZWZcIjpcIiNcIn0sXCJmXCI6W3tcInRcIjo3LFwiZVwiOlwiSWNvbnNcIixcImFcIjp7XCJpY29uXCI6XCJjb2dcIn19LFwiIEVkaXRcIl19XX1dfV19IiwibW9kdWxlLmV4cG9ydHMgPVxuICBub3c6IC0+IG5ldyBEYXRlKCkudG9KU09OKCkiLCJ7IF8sIG1vbWVudCwgbWFya2VkIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAjIFRpbWUgZnJvbSBub3cuXG4gIGZyb21Ob3c6IF8ubWVtb2l6ZSAoanNvbkRhdGUpIC0+XG4gICAgbW9tZW50KG5ldyBEYXRlKGpzb25EYXRlKSkuZnJvbU5vdygpXG5cbiAgIyBXaGVuIGlzIGEgbWlsZXN0b25lIGR1ZT9cbiAgZHVlOiAoanNvbkRhdGUpIC0+XG4gICAgcmV0dXJuICcmbmJzcDsnIHVubGVzcyBqc29uRGF0ZVxuICAgIFsgJ2R1ZScsIEBmcm9tTm93IGpzb25EYXRlIF0uam9pbignICcpXG5cbiAgIyBNYXJrZG93biBmb3JtYXR0aW5nLlxuICBtYXJrZG93bjogKG1hcmt1cCkgLT5cbiAgICBtYXJrZWQgbWFya3VwXG5cbiAgIyBGb3JtYXQgbWlsZXN0b25lIHRpdGxlLlxuICB0aXRsZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ21pbGVzdG9uZScpID4gLTFcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICBbICdNaWxlc3RvbmUnLCB0ZXh0IF0uam9pbignICcpXG5cbiAgIyBIZXggdG8gZGVjaW1hbC5cbiAgaGV4VG9EZWM6IChoZXgpIC0+XG4gICAgcGFyc2VJbnQgaGV4LCAxNiIsIm1vZHVsZS5leHBvcnRzID1cbiAgaXM6IChldnQpIC0+XG4gICAgZXZ0Lm9yaWdpbmFsLnR5cGUgaW4gWyAna2V5dXAnLCAna2V5ZG93bicgXVxuXG4gIGlzRW50ZXI6IChldnQpIC0+XG4gICAgZXZ0Lm9yaWdpbmFsLndoaWNoIGlzIDEzIiwieyBfIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbl8ubWl4aW5cbiAgJ3BsdWNrTWFueSc6IChzb3VyY2UsIGtleXMpIC0+XG4gICAgdGhyb3cgJ2BrZXlzYCBuZWVkcyB0byBiZSBhbiBBcnJheScgdW5sZXNzIF8uaXNBcnJheSBrZXlzXG4gICAgXy5tYXAgc291cmNlLCAoaXRlbSkgLT5cbiAgICAgIG9iaiA9IHt9XG4gICAgICBfLmVhY2gga2V5cywgKGtleSkgLT5cbiAgICAgICAgb2JqW2tleV0gPSBpdGVtW2tleV1cbiAgICAgIG9ialxuXG4gICdpc0ludCc6ICh2YWwpIC0+XG4gICAgbm90IGlzTmFOKHZhbCkgYW5kIHBhcnNlSW50KE51bWJlcih2YWwpKSBpcyB2YWwgYW5kIG5vdCBpc05hTihwYXJzZUludCh2YWwsIDEwKSkiLCJ7IFJhY3RpdmUgfSA9IHJlcXVpcmUgJy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0cykgLT5cbiAgTW9kZWwgPSBSYWN0aXZlLmV4dGVuZChvcHRzKVxuICBtb2RlbCA9IG5ldyBNb2RlbCgpXG4gIG1vZGVsLnJlbmRlcigpXG4gIG1vZGVsIiwiIyBCaW5hcnkgc2VhcmNoIGltcGxlbWVudGF0aW9uIHdpdGggYSBjdXN0b20gY29tcGFyYXRvciBmdW5jdGlvbi5cbm1vZHVsZS5leHBvcnRzID0gKGFyciwgaXRlbSwgY29tcGFyYXRvcikgLT5cbiAgIyBOdW1lcmljIGNvbXBhcmF0b3IuXG4gIGNvbXBhcmF0b3IgPz0gKGEsIGIpIC0+XG4gICAgc3dpdGNoXG4gICAgICB3aGVuIGEgPCBiIHRoZW4gLTFcbiAgICAgIHdoZW4gYSA+wqBiIHRoZW4gKzFcbiAgICAgIGVsc2UgMFxuXG4gIG1pbkluZGV4ID0gMFxuICBtYXhJbmRleCA9IGFyci5sZW5ndGggLSAxXG4gIFxuICB3aGlsZSBtaW5JbmRleCA8PSBtYXhJbmRleFxuICAgIGluZGV4ID0gKG1pbkluZGV4ICsgbWF4SW5kZXgpIC8gMiB8IDBcbiAgICBleGlzdGluZyA9IGFycltpbmRleF1cbiAgICBcbiAgICByZXMgPSBjb21wYXJhdG9yIGV4aXN0aW5nLCBpdGVtXG4gICAgc3dpdGNoXG4gICAgICB3aGVuIHJlc3VsdCA8IDAgdGhlbiBtaW5JbmRleCA9IGluZGV4ICsgMVxuICAgICAgd2hlbiByZXN1bHQgPiAwIHRoZW4gbWF4SW5kZXggPSBpbmRleCAtIDFcbiAgICAgIGVsc2UgcmV0dXJuIGluZGV4XG5cbiAgLTEiLCJ7IFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbmxpbmVzID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9jaGFydC9saW5lcy5jb2ZmZWUnXG5heGVzICA9IHJlcXVpcmUgJy4uL21vZHVsZXMvY2hhcnQvYXhlcy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9jaGFydCdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvY2hhcnQuaHRtbCdcblxuICBvbmNvbXBsZXRlOiAtPlxuICAgIG1pbGVzdG9uZSA9IEBkYXRhLm1pbGVzdG9uZVxuICAgIGlzc3VlcyA9IG1pbGVzdG9uZS5pc3N1ZXNcbiAgICAjIFRvdGFsIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIG1pbGVzdG9uZS5cbiAgICB0b3RhbCA9IGlzc3Vlcy5vcGVuLnNpemUgKyBpc3N1ZXMuY2xvc2VkLnNpemVcblxuXG4gICAgIyBBbiBpc3N1ZSBtYXkgaGF2ZSBiZWVuIGNsb3NlZCBiZWZvcmUgdGhlIHN0YXJ0IG9mIGEgbWlsZXN0b25lLlxuICAgIGhlYWQgPSBpc3N1ZXMuY2xvc2VkLmxpc3RbMF0uY2xvc2VkX2F0XG4gICAgaWYgaXNzdWVzLmxlbmd0aCBhbmQgbWlsZXN0b25lLmNyZWF0ZWRfYXQgPiBoZWFkXG4gICAgICAjIFRoaXMgaXMgdGhlIG5ldyBzdGFydC5cbiAgICAgIG1pbGVzdG9uZS5jcmVhdGVkX2F0ID0gaGVhZFxuXG4gICAgIyBBY3R1YWwsIGlkZWFsICYgdHJlbmQgbGluZXMuXG4gICAgYWN0dWFsID0gbGluZXMuYWN0dWFsIGlzc3Vlcy5jbG9zZWQubGlzdCwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIHRvdGFsXG4gICAgaWRlYWwgID0gbGluZXMuaWRlYWwgbWlsZXN0b25lLmNyZWF0ZWRfYXQsIG1pbGVzdG9uZS5kdWVfb24sIHRvdGFsXG4gICAgdHJlbmQgID0gbGluZXMudHJlbmQgYWN0dWFsLCBtaWxlc3RvbmUuY3JlYXRlZF9hdCwgbWlsZXN0b25lLmR1ZV9vblxuXG4gICAgIyBHZXQgYXZhaWxhYmxlIHNwYWNlLlxuICAgIHsgaGVpZ2h0LCB3aWR0aCB9ID0gZG8gQGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXG4gICAgbWFyZ2luID0geyAndG9wJzogMzAsICdyaWdodCc6IDMwLCAnYm90dG9tJzogNDAsICdsZWZ0JzogNTAgfVxuICAgIHdpZHRoIC09IG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0XG4gICAgaGVpZ2h0IC09IG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tXG5cbiAgICAjIFNjYWxlcy5cbiAgICB4ID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFsgMCwgd2lkdGggXSlcbiAgICB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoWyBoZWlnaHQsIDAgXSlcblxuICAgICMgQXhlcy5cbiAgICB4QXhpcyA9IGF4ZXMuaG9yaXpvbnRhbCBoZWlnaHQsIHhcbiAgICB5QXhpcyA9IGF4ZXMudmVydGljYWwgd2lkdGgsIHlcblxuICAgICMgTGluZSBnZW5lcmF0b3IuXG4gICAgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIilcbiAgICAueCggKGQpIC0+IHgoZC5kYXRlKSApXG4gICAgLnkoIChkKSAtPiB5KGQucG9pbnRzKSApXG5cbiAgICAjIEdldCB0aGUgbWluaW11bSBhbmQgbWF4aW11bSBkYXRlLCBhbmQgaW5pdGlhbCBwb2ludHMuXG4gICAgeC5kb21haW4oWyBpZGVhbFswXS5kYXRlLCBpZGVhbFtpZGVhbC5sZW5ndGggLSAxXS5kYXRlIF0pXG4gICAgeS5kb21haW4oWyAwLCBpZGVhbFswXS5wb2ludHMgXSkubmljZSgpXG5cbiAgICAjIEFkZCBhbiBTVkcgZWxlbWVudCB3aXRoIHRoZSBkZXNpcmVkIGRpbWVuc2lvbnMgYW5kIG1hcmdpbi5cbiAgICBzdmcgPSBkMy5zZWxlY3QodGhpcy5lbC5xdWVyeVNlbGVjdG9yKCcjY2hhcnQnKSkuYXBwZW5kKFwic3ZnXCIpXG4gICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxuXG4gICAgIyBBZGQgdGhlIGRheXMgeC1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpcyBkYXlcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCN7aGVpZ2h0fSlcIilcbiAgICAuY2FsbCh4QXhpcylcblxuICAgICMgQWRkIHRoZSBtb250aHMgeC1heGlzLlxuICAgIG0gPSBbXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLFxuICAgICAgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ1xuICAgIF1cblxuICAgIG1BeGlzID0geEF4aXNcbiAgICAub3JpZW50KFwidG9wXCIpXG4gICAgLnRpY2tTaXplKGhlaWdodClcbiAgICAudGlja0Zvcm1hdCggKGQpIC0+IG1bZC5nZXRNb250aCgpXSApXG4gICAgLnRpY2tzKDIpXG4gICAgXG4gICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzIG1vbnRoXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwje2hlaWdodH0pXCIpXG4gICAgLmNhbGwobUF4aXMpXG5cbiAgICAjIEFkZCB0aGUgeS1heGlzLlxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAgIC5jYWxsKHlBeGlzKVxuXG4gICAgIyBBZGQgYSBsaW5lIHNob3dpbmcgd2hlcmUgd2UgYXJlIG5vdy5cbiAgICBzdmcuYXBwZW5kKFwic3ZnOmxpbmVcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXlcIilcbiAgICAuYXR0cihcIngxXCIsIHgobmV3IERhdGUoKSkpXG4gICAgLmF0dHIoXCJ5MVwiLCAwKVxuICAgIC5hdHRyKFwieDJcIiwgeChuZXcgRGF0ZSgpKSlcbiAgICAuYXR0cihcInkyXCIsIGhlaWdodClcblxuICAgICMgQWRkIHRoZSBpZGVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiaWRlYWwgbGluZVwiKVxuICAgIC5hdHRyKFwiZFwiLCBsaW5lLmludGVycG9sYXRlKFwiYmFzaXNcIikoaWRlYWwpKVxuXG4gICAgIyBBZGQgdGhlIHRyZW5kbGluZSBwYXRoLlxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInRyZW5kbGluZSBsaW5lXCIpXG4gICAgLmF0dHIoXCJkXCIsIGxpbmUuaW50ZXJwb2xhdGUoXCJsaW5lYXJcIikodHJlbmQpKVxuXG4gICAgIyBBZGQgdGhlIGFjdHVhbCBsaW5lIHBhdGguXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiYWN0dWFsIGxpbmVcIilcbiAgICAuYXR0cihcImRcIiwgbGluZS5pbnRlcnBvbGF0ZShcImxpbmVhclwiKS55KCAoZCkgLT4geShkLnBvaW50cykgKShhY3R1YWwpKVxuXG4gICAgIyBDb2xsZWN0IHRoZSB0b29sdGlwIGhlcmUuXG4gICAgdG9vbHRpcCA9IGQzLnRpcCgpLmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpLmh0bWwgKHsgbnVtYmVyLCB0aXRsZSB9KSAtPlxuICAgICAgXCIjI3tudW1iZXJ9OiAje3RpdGxlfVwiXG5cbiAgICBzdmcuY2FsbCh0b29sdGlwKVxuXG4gICAgIyBTaG93IHdoZW4gd2UgY2xvc2VkIGFuIGlzc3VlLlxuICAgIHN2Zy5zZWxlY3RBbGwoXCJhLmlzc3VlXCIpXG4gICAgLmRhdGEoYWN0dWFsLnNsaWNlKDEpKSAjIHNraXAgdGhlIHN0YXJ0aW5nIHBvaW50XG4gICAgLmVudGVyKClcbiAgICAjIEEgd3JhcHBpbmcgbGluay5cbiAgICAuYXBwZW5kKCdzdmc6YScpXG4gICAgLmF0dHIoXCJ4bGluazpocmVmXCIsICh7IGh0bWxfdXJsIH0pIC0+IGh0bWxfdXJsIClcbiAgICAuYXR0cihcInhsaW5rOnNob3dcIiwgJ25ldycpXG4gICAgLmFwcGVuZCgnc3ZnOmNpcmNsZScpXG4gICAgLmF0dHIoXCJjeFwiLCAoeyBkYXRlIH0pIC0+IHggZGF0ZSApXG4gICAgLmF0dHIoXCJjeVwiLCAoeyBwb2ludHMgfSkgLT4geSBwb2ludHMgKVxuICAgIC5hdHRyKFwiclwiLCAgKHsgcmFkaXVzIH0pIC0+IDUgKSAjIGZpeGVkIGZvciBub3dcbiAgICAub24oJ21vdXNlb3ZlcicsIHRvb2x0aXAuc2hvdylcbiAgICAub24oJ21vdXNlb3V0JywgdG9vbHRpcC5oaWRlKVxuIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbnsgc3lzdGVtIH0gPSByZXF1aXJlICcuLi9tb2RlbHMvc3lzdGVtLmNvZmZlZSdcbmZpcmViYXNlICAgPSByZXF1aXJlICcuLi9tb2RlbHMvZmlyZWJhc2UuY29mZmVlJ1xudXNlciAgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscy91c2VyLmNvZmZlZSdcbkljb25zICAgICAgPSByZXF1aXJlICcuL2ljb25zLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL2hlYWRlcidcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd1c2VyJzogdXNlclxuICAgICMgRGVmYXVsdCBhcHAgaWNvbi5cbiAgICAnaWNvbic6ICdmaXJlLXN0YXRpb24nXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICBvbmNvbnN0cnVjdDogLT5cbiAgICAjIExvZ2luIHVzZXIuXG4gICAgQG9uICchbG9naW4nLCAtPlxuICAgICAgZmlyZWJhc2UubG9naW4gKGVycikgLT5cbiAgICAgICAgdGhyb3cgZXJyIGlmIGVyclxuXG4gIG9ucmVuZGVyOiAtPlxuICAgICMgU3dpdGNoIGxvYWRpbmcgaWNvbiB3aXRoIGFwcCBpY29uLlxuICAgIHN5c3RlbS5vYnNlcnZlICdsb2FkaW5nJywgKHlhKSA9PlxuICAgICAgQHNldCAnaWNvbicsIGlmIHlhIHRoZW4gJ3NwaW5uZXIxJyBlbHNlICdmaXJlLXN0YXRpb24nIiwieyBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvaGVybydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaGVyby5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5mb3JtYXQgPSByZXF1aXJlICcuLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG4jIEZvbnRlbGxvIGljb24gaGV4IGNvZGVzLlxuY29kZXMgPVxuICAnY29nJzogICAgICAgICAgICdcXGU4MDAnXG4gICdzZWFyY2gnOiAgICAgICAgJ1xcZTgwMSdcbiAgJ2dpdGh1Yic6ICAgICAgICAnXFxlODAyJ1xuICAnYWRkcmVzcyc6ICAgICAgICdcXGU4MDMnXG4gICdwbHVzLWNpcmNsZWQnOiAgJ1xcZTgwNCdcbiAgJ2ZpcmUtc3RhdGlvbic6ICAnXFxlODA1J1xuICAnc29ydC1hbHBoYWJldCc6ICdcXGU4MDYnXG4gICdkb3duLW9wZW4nOiAgICAgJ1xcZTgwNydcbiAgJ3NwaW42JzogICAgICAgICAnXFxlODA4J1xuICAnbWVnYXBob25lJzogICAgICdcXGU4MDknXG4gICdzcGluNCc6ICAgICAgICAgJ1xcZTgwYSdcbiAgJ3NwaW5uZXIxJzogICAgICAnXFxlODBiJ1xuICAnYXR0ZW50aW9uJzogICAgICdcXGU4MGMnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9pY29ucydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvaWNvbnMuaHRtbCdcblxuICAnaXNvbGF0ZWQnOiB5ZXNcblxuICBvbnJlbmRlcjogLT5cbiAgICBAb2JzZXJ2ZSAnaWNvbicsIChpY29uKSAtPlxuICAgICAgaWYgaWNvbiBhbmQgaGV4ID0gY29kZXNbaWNvbl1cbiAgICAgICAgQHNldCAnY29kZScsIGZvcm1hdC5oZXhUb0RlYyBoZXhcbiAgICAgIGVsc2VcbiAgICAgICAgQHNldCAnY29kZScsIG51bGwiLCJ7IF8sIFJhY3RpdmUsIGQzIH0gPSByZXF1aXJlICcuLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5JY29ucyAgICA9IHJlcXVpcmUgJy4vaWNvbnMuY29mZmVlJ1xuXG5IRUlHSFQgPSA2OCAjIGhlaWdodCBvZiBkaXYgaW4gcHhcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL25vdGlmeSdcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi90ZW1wbGF0ZXMvbm90aWZ5Lmh0bWwnXG5cbiAgJ2RhdGEnOlxuICAgICd0b3AnOiBIRUlHSFRcbiAgICAnaGlkZGVuJzogeWVzXG4gICAgJ2RlZmF1bHRzJzpcbiAgICAgICd0ZXh0JzogJydcbiAgICAgICd0eXBlJzogJycgIyBibGFuZCBncmV5IHN0eWxlXG4gICAgICAnc3lzdGVtJzogbm9cbiAgICAgICdpY29uJzogJ21lZ2FwaG9uZSdcbiAgICAgICd0dGwnOiAgNWUzXG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG4gIFxuICAjIFNob3cgYSBub3RpZmljYXRpb24uXG4gIHNob3c6IChvcHRzKSAtPlxuICAgIEBzZXQgJ2hpZGRlbicsIG5vICAgIFxuICAgICMgU2V0IHRoZSBvcHRzLlxuICAgIEBzZXQgb3B0cyA9IF8uZGVmYXVsdHMgb3B0cywgQGRhdGEuZGVmYXVsdHNcbiAgICAjIFdoaWNoIHBvc2l0aW9uIHRvIHNsaWRlIHRvP1xuICAgIHBvcyA9IFsgMCwgNTAgXVsgK29wdHMuc3lzdGVtIF0gIyAwcHggb3IgNTAlIGZyb20gdG9wXG4gICAgIyBTbGlkZSBpbnRvIHZpZXcuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIHBvcyxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdib3VuY2UnKVxuICAgICAgJ2R1cmF0aW9uJzogODAwXG4gICAgXG4gICAgIyBJZiBubyB0dGwgdGhlbiBzaG93IHBlcm1hbmVudGx5LlxuICAgIHJldHVybiB1bmxlc3Mgb3B0cy50dGxcblxuICAgICMgU2xpZGUgb3V0IG9mIHRoZSB2aWV3LlxuICAgIF8uZGVsYXkgXy5iaW5kKEBoaWRlLCBAKSwgb3B0cy50dGxcblxuICAjIEhpZGUgYSBub3RpZmljYXRpb24uXG4gIGhpZGU6IC0+XG4gICAgcmV0dXJuIGlmIEBkYXRhLmhpZGRlblxuICAgIEBzZXQgJ2hpZGRlbicsIHllc1xuXG4gICAgQGFuaW1hdGUgJ3RvcCcsIEhFSUdIVCxcbiAgICAgICdlYXNpbmcnOiBkMy5lYXNlKCdiYWNrJylcbiAgICAgICdjb21wbGV0ZSc6ID0+XG4gICAgICAgICMgUmVzZXQgdGhlIHRleHQgd2hlbiBhbGwgaXMgZG9uZS5cbiAgICAgICAgQHNldCAndGV4dCcsIG51bGxcbiAgXG4gIG9uY29uc3RydWN0OiAtPlxuICAgICMgT24gb3V0c2lkZSBtZXNzYWdlcy5cbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnknLCBfLmJpbmQgQHNob3csIEBcbiAgICBtZWRpYXRvci5vbiAnIWFwcC9ub3RpZnkvaGlkZScsIF8uYmluZCBAaGlkZSwgQFxuXG4gICAgIyBDbG9zZSB1cyBwcmVtYXR1cmVseS4uLlxuICAgIEBvbiAnY2xvc2UnLCBAaGlkZSIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuSGVybyAgICAgPSByZXF1aXJlICcuLi9oZXJvLmNvZmZlZSdcblByb2plY3RzID0gcmVxdWlyZSAnLi4vdGFibGVzL3Byb2plY3RzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL2luZGV4J1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy9wYWdlcy9pbmRleC5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBIZXJvLCBQcm9qZWN0cyB9XG5cbiAgJ2RhdGEnOlxuICAgICdwcm9qZWN0cyc6IHByb2plY3RzXG4gICAgJ3JlYWR5Jzogbm9cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQnVybmNoYXJ0OiBHaXRIdWIgQnVybmRvd24gQ2hhcnQgYXMgYSBTZXJ2aWNlJ1xuXG4gICAgIyBRdWl0IGlmIHdlIGhhdmUgbm8gcHJvamVjdHMuXG4gICAgcmV0dXJuIEBzZXQoJ3JlYWR5JywgeWVzKSB1bmxlc3MgcHJvamVjdHMubGlzdC5sZW5ndGhcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgRm9yIGFsbCBwcm9qZWN0cy5cbiAgICBhc3luYy5tYXAgcHJvamVjdHMuZGF0YS5saXN0LCAocHJvamVjdCwgY2IpIC0+XG4gICAgICAjIEZldGNoIHRoZWlyIG1pbGVzdG9uZXMuXG4gICAgICBtaWxlc3RvbmVzLmZldGNoQWxsIHByb2plY3QsIChlcnIsIGxpc3QpIC0+XG4gICAgICAgICMgU2F2ZSB0aGUgZXJyb3IgaWYgcHJvamVjdCBkb2VzIG5vdCBleGlzdC5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgcHJvamVjdHMuc2F2ZUVycm9yIHByb2plY3QsIGVyclxuICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICMgTm93IGFkZCBpbiB0aGUgaXNzdWVzLlxuICAgICAgICBhc3luYy5lYWNoIGxpc3QsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAgICMgRG8gd2UgaGF2ZSB0aGlzIG1pbGVzdG9uZSBhbHJlYWR5P1xuICAgICAgICAgIHJldHVybiBjYiBudWxsIGlmIF8uZmluZCBwcm9qZWN0Lm1pbGVzdG9uZXMsICh7IG51bWJlciB9KSAtPlxuICAgICAgICAgICAgbWlsZXN0b25lLm51bWJlciBpcyBudW1iZXJcbiAgICAgICAgICBcbiAgICAgICAgICAjIE9LIGZldGNoIGFsbCB0aGUgaXNzdWVzIGZvciB0aGlzIG1pbGVzdG9uZSB0aGVuLlxuICAgICAgICAgIGlzc3Vlcy5mZXRjaEFsbFxuICAgICAgICAgICAgJ293bmVyJzogcHJvamVjdC5vd25lclxuICAgICAgICAgICAgJ25hbWUnOiBwcm9qZWN0Lm5hbWVcbiAgICAgICAgICAgICdtaWxlc3RvbmUnOiBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICAgLCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgICAjIFNhdmUgYW55IGVycm9ycyBvbiB0aGUgcHJvamVjdC5cbiAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICBwcm9qZWN0cy5zYXZlRXJyb3IgcHJvamVjdCwgZXJyXG4gICAgICAgICAgICAgIHJldHVybiBkbyBjYlxuXG4gICAgICAgICAgICAjIEFkZCBpbiB0aGUgaXNzdWVzIHRvIHRoZSBtaWxlc3RvbmUuXG4gICAgICAgICAgICBfLmV4dGVuZCBtaWxlc3RvbmUsIHsgJ2lzc3Vlcyc6IG9iaiB9XG4gICAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZS5cbiAgICAgICAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBtaWxlc3RvbmVcbiAgICAgICAgICAgICMgRG9uZVxuICAgICAgICAgICAgZG8gY2JcbiAgICAgICAgXG4gICAgICAgICwgY2JcblxuICAgICwgPT5cbiAgICAgIGRvIGRvbmVcbiAgICAgIEBzZXQgJ3JlYWR5JywgeWVzIiwieyBfLCBSYWN0aXZlLCBhc3luYyB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5DaGFydCA9IHJlcXVpcmUgJy4uL2NoYXJ0LmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcbmZvcm1hdCAgICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhY3RpdmUuZXh0ZW5kXG5cbiAgJ25hbWUnOiAndmlld3MvcGFnZXMvY2hhcnQnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL21pbGVzdG9uZS5odG1sJ1xuXG4gICdjb21wb25lbnRzJzogeyBDaGFydCB9XG5cbiAgJ2RhdGEnOlxuICAgICdmb3JtYXQnOiBmb3JtYXRcbiAgICAncmVhZHknOiBub1xuXG4gIG9ucmVuZGVyOiAtPlxuICAgIFsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSBdID0gQGdldCAncm91dGUnXG4gIFxuICAgIG1pbGVzdG9uZSA9IHBhcnNlSW50IG1pbGVzdG9uZVxuXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIiN7b3duZXJ9LyN7bmFtZX0vI3ttaWxlc3RvbmV9XCJcblxuICAgICMgR2V0IHRoZSBhc3NvY2lhdGVkIHByb2plY3QuXG4gICAgcHJvamVjdCA9IHByb2plY3RzLmZpbmQgeyBvd25lciwgbmFtZSB9XG5cbiAgICAjIFNob3VsZCBub3QgaGFwcGVuLi4uXG4gICAgdGhyb3cgNTAwIHVubGVzcyBwcm9qZWN0XG5cbiAgICAjIERvIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICBvYmogPSBfLmZpbmQgcHJvamVjdC5taWxlc3RvbmVzLCB7ICdudW1iZXInOiBtaWxlc3RvbmUgfVxuICAgIHJldHVybiBAc2V0IHsgJ21pbGVzdG9uZSc6IG9iaiwgJ3JlYWR5JzogeWVzIH0gaWYgb2JqP1xuXG4gICAgIyBXZSBhcmUgbG9hZGluZyB0aGUgbWlsZXN0b25lcyB0aGVuLlxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgIGZldGNoTWlsZXN0b25lID0gKGNiKSAtPlxuICAgICAgbWlsZXN0b25lcy5mZXRjaCB7IG93bmVyLCBuYW1lLCBtaWxlc3RvbmUgfSwgY2JcblxuICAgIGZldGNoSXNzdWVzID0gKGRhdGEsIGNiKSAtPlxuICAgICAgaXNzdWVzLmZldGNoQWxsIHsgb3duZXIsIG5hbWUsIG1pbGVzdG9uZSB9LCAoZXJyLCBvYmopIC0+XG4gICAgICAgIGNiIGVyciwgXy5leHRlbmQgZGF0YSwgeyAnaXNzdWVzJzogb2JqIH1cblxuICAgIGFzeW5jLndhdGVyZmFsbCBbXG4gICAgICAjIEdldCB0aGUgbWlsZXN0b25lLlxuICAgICAgZmV0Y2hNaWxlc3RvbmUsXG4gICAgICAjIFRoZW4gYWxsIGl0cyBpc3N1ZXMuXG4gICAgICBmZXRjaElzc3Vlc1xuICAgIF0sIChlcnIsIGRhdGEpID0+XG4gICAgICBkbyBkb25lXG4gICAgICByZXR1cm4gbWVkaWF0b3IuZmlyZSAnIWFwcC9ub3RpZnknLCB7XG4gICAgICAgICd0ZXh0JzogZG8gZXJyLnRvU3RyaW5nXG4gICAgICAgICd0eXBlJzogJ2FsZXJ0J1xuICAgICAgICAnc3lzdGVtJzogeWVzXG4gICAgICAgICd0dGwnOiBudWxsXG4gICAgICB9IGlmIGVyclxuXG4gICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgIHByb2plY3RzLmFkZE1pbGVzdG9uZSBwcm9qZWN0LCBkYXRhXG5cbiAgICAgICMgU2hvdyB0aGUgcGFnZS5cbiAgICAgIEBzZXRcbiAgICAgICAgJ21pbGVzdG9uZSc6IGRhdGFcbiAgICAgICAgJ3JlYWR5JzogeWVzIiwieyBfLCBSYWN0aXZlIH0gPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL3ZlbmRvci5jb2ZmZWUnXG5cbm1lZGlhdG9yID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9tZWRpYXRvci5jb2ZmZWUnXG5zeXN0ZW0gICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9zeXN0ZW0uY29mZmVlJ1xudXNlciAgICAgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvdXNlci5jb2ZmZWUnXG5rZXkgICAgICA9IHJlcXVpcmUgJy4uLy4uL3V0aWxzL2tleS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wYWdlcy9uZXcnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL25ldy5odG1sJ1xuXG4gICdkYXRhJzogeyAndmFsdWUnOiAncmFkZWtzdGVwYW4vZGlzcG9zYWJsZScsIHVzZXIgfVxuXG4gICdhZGFwdCc6IFsgUmFjdGl2ZS5hZGFwdG9ycy5SYWN0aXZlIF1cblxuICAjIExpc3RlbiB0byBFbnRlciBrZXlwcmVzcyBvciBTdWJtaXQgYnV0dG9uIGNsaWNrLlxuICBzdWJtaXQ6IChldnQsIHZhbHVlKSAtPlxuICAgIHJldHVybiBpZiBrZXkuaXMoZXZ0KSBhbmQgbm90IGtleS5pc0VudGVyKGV2dClcblxuICAgIFsgb3duZXIsIG5hbWUgXSA9IHZhbHVlLnNwbGl0KCcvJylcblxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgICMgU2F2ZSByZXBvLlxuICAgIG1lZGlhdG9yLmZpcmUgJyFwcm9qZWN0cy9hZGQnLCB7IG93bmVyLCBuYW1lIH0sIChlcnIpIC0+XG4gICAgICBkbyBkb25lXG5cbiAgICAgIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5JyxcbiAgICAgICAgJ3RleHQnOiBlcnIgb3IgXCJQcm9qZWN0ICN7dmFsdWV9IHNhdmVkLlwiXG4gICAgICAgICd0eXBlJzogaWYgZXJyIHRoZW4gJ2Vycm9yJyBlbHNlICdzdWNjZXNzJ1xuXG4gICAgICAjIFJlZGlyZWN0IHRvIHRoZSBkYXNoYm9hcmQuXG4gICAgICAjIFRPRE86IHRyaWdnZXIgYSBuYW1lZCByb3V0ZVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIydcblxuICBvbnJlbmRlcjogLT5cbiAgICBkb2N1bWVudC50aXRsZSA9ICdBZGQgYSBuZXcgcHJvamVjdCdcblxuICAgICMgVE9ETzogYXV0b2NvbXBsZXRlIG9uIG91ciB1c2VybmFtZSBpZiB3ZSBhcmUgbG9nZ2VkIGluIG9yIGJhc2VkXG4gICAgIyAgb24gcmVwb3Mgd2UgYWxyZWFkeSBoYXZlLlxuICAgIGF1dG9jb21wbGV0ZSA9ICh2YWx1ZSkgLT5cblxuICAgIEBvYnNlcnZlICd2YWx1ZScsIF8uZGVib3VuY2UoYXV0b2NvbXBsZXRlLCAyMDApLCB7ICdpbml0Jzogbm8gfVxuXG4gICAgIyBGb2N1cyBvbiB0aGUgaW5wdXQgZmllbGQuXG4gICAgZG8gQGVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXNcblxuICAgIEBvbiAnc3VibWl0JywgQHN1Ym1pdCIsInsgXywgUmFjdGl2ZSwgYXN5bmMgfSA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvdmVuZG9yLmNvZmZlZSdcblxuTWlsZXN0b25lcyA9IHJlcXVpcmUgJy4uL3RhYmxlcy9taWxlc3RvbmVzLmNvZmZlZSdcblxucHJvamVjdHMgICA9IHJlcXVpcmUgJy4uLy4uL21vZGVscy9wcm9qZWN0cy5jb2ZmZWUnXG5zeXN0ZW0gICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kZWxzL3N5c3RlbS5jb2ZmZWUnXG5taWxlc3RvbmVzID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvbWlsZXN0b25lcy5jb2ZmZWUnXG5pc3N1ZXMgICAgID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy9naXRodWIvaXNzdWVzLmNvZmZlZSdcbm1lZGlhdG9yICAgPSByZXF1aXJlICcuLi8uLi9tb2R1bGVzL21lZGlhdG9yLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSYWN0aXZlLmV4dGVuZFxuXG4gICduYW1lJzogJ3ZpZXdzL3BhZ2VzL3Byb2plY3QnXG5cbiAgJ3RlbXBsYXRlJzogcmVxdWlyZSAnLi4vLi4vdGVtcGxhdGVzL3BhZ2VzL3Byb2plY3QuaHRtbCdcblxuICAnY29tcG9uZW50cyc6IHsgTWlsZXN0b25lcyB9XG5cbiAgJ2RhdGEnOlxuICAgICdyZWFkeSc6IG5vXG5cbiAgb25yZW5kZXI6IC0+XG4gICAgWyBvd25lciwgbmFtZSBdID0gQGdldCAncm91dGUnXG5cbiAgICBkb2N1bWVudC50aXRsZSA9IFwiI3tvd25lcn0vI3tuYW1lfVwiXG5cbiAgICAjIEdldCB0aGUgYXNzb2NpYXRlZCBwcm9qZWN0LlxuICAgIEBzZXQgJ3Byb2plY3QnLCBwcm9qZWN0ID0gcHJvamVjdHMuZmluZCB7IG93bmVyLCBuYW1lIH1cblxuICAgICMgU2hvdWxkIG5vdCBoYXBwZW4uLi5cbiAgICB0aHJvdyA1MDAgdW5sZXNzIHByb2plY3RcblxuICAgICMgV2UgZG9uJ3Qga25vdyBpZiB3ZSBoYXZlIGFsbCBtaWxlc3RvbmVzLCBzbyBmZXRjaCB0aGVtLlxuICAgIGRvbmUgPSBkbyBzeXN0ZW0uYXN5bmNcblxuICAgIGZpbmRNaWxlc3RvbmUgPSAobnVtYmVyKSAtPlxuICAgICAgXy5maW5kIHByb2plY3QubWlsZXN0b25lcyBvciBbXSwgeyBudW1iZXIgfVxuXG4gICAgZmV0Y2hNaWxlc3RvbmVzID0gKGNiKSAtPlxuICAgICAgbWlsZXN0b25lcy5mZXRjaEFsbCBwcm9qZWN0LCBjYlxuXG4gICAgZmV0Y2hJc3N1ZXMgPSAoYWxsTWlsZXN0b25lcywgY2IpIC0+XG4gICAgICBhc3luYy5lYWNoIGFsbE1pbGVzdG9uZXMsIChtaWxlc3RvbmUsIGNiKSAtPlxuICAgICAgICAjIE1heWJlIHdlIGhhdmUgdGhpcyBtaWxlc3RvbmUgYWxyZWFkeT9cbiAgICAgICAgcmV0dXJuIGNiIG51bGwgaWYgZmluZE1pbGVzdG9uZSBtaWxlc3RvbmUubnVtYmVyXG4gICAgICAgICMgTmVlZCB0byBmZXRjaCB0aGUgaXNzdWVzIHRoZW4uXG4gICAgICAgIGlzc3Vlcy5mZXRjaEFsbCB7IG93bmVyLCBuYW1lLCAnbWlsZXN0b25lJzogbWlsZXN0b25lLm51bWJlciB9LCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICAjIFNhdmUgdGhlIG1pbGVzdG9uZSB3aXRoIGlzc3Vlcy5cbiAgICAgICAgICBwcm9qZWN0cy5hZGRNaWxlc3RvbmUgcHJvamVjdCwgXy5leHRlbmQgbWlsZXN0b25lLCB7ICdpc3N1ZXMnOiBvYmogfVxuICAgICAgICAgICMgTmV4dC5cbiAgICAgICAgICBkbyBjYlxuICAgICAgLCBjYlxuXG4gICAgIyBSdW4gaXQuXG4gICAgYXN5bmMud2F0ZXJmYWxsIFtcbiAgICAgICMgRmlyc3QgZ2V0IGFsbCB0aGUgbWlsZXN0b25lcy5cbiAgICAgIGZldGNoTWlsZXN0b25lcyxcbiAgICAgICMgVGhlbiBhbGwgdGhlIGlzc3VlcyBwZXIgbWlsZXN0b25lLlxuICAgICAgZmV0Y2hJc3N1ZXNcbiAgICBdLCAoZXJyKSA9PlxuICAgICAgZG8gZG9uZVxuICAgICAgcmV0dXJuIG1lZGlhdG9yLmZpcmUgJyFhcHAvbm90aWZ5Jywge1xuICAgICAgICAndGV4dCc6IGRvIGVyci50b1N0cmluZ1xuICAgICAgICAndHlwZSc6ICdhbGVydCdcbiAgICAgICAgJ3N5c3RlbSc6IHllc1xuICAgICAgICAndHRsJzogbnVsbFxuICAgICAgfSBpZiBlcnJcblxuICAgICAgIyBTYXkgd2UgYXJlIHJlYWR5LlxuICAgICAgQHNldCAncmVhZHknLCB5ZXNcbiIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xucHJvamVjdHMgPSByZXF1aXJlICcuLi8uLi9tb2RlbHMvcHJvamVjdHMuY29mZmVlJ1xuZm9ybWF0ICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9taWxlc3RvbmVzJ1xuXG4gICd0ZW1wbGF0ZSc6IHJlcXVpcmUgJy4uLy4uL3RlbXBsYXRlcy90YWJsZXMvbWlsZXN0b25lcy5odG1sJ1xuXG4gICdkYXRhJzogeyBmb3JtYXQgfVxuXG4gICdjb21wb25lbnRzJzogeyBJY29ucyB9XG5cbiAgJ2FkYXB0JzogWyBSYWN0aXZlLmFkYXB0b3JzLlJhY3RpdmUgXSIsInsgUmFjdGl2ZSB9ID0gcmVxdWlyZSAnLi4vLi4vbW9kdWxlcy92ZW5kb3IuY29mZmVlJ1xuXG5tZWRpYXRvciA9IHJlcXVpcmUgJy4uLy4uL21vZHVsZXMvbWVkaWF0b3IuY29mZmVlJ1xuZm9ybWF0ICAgPSByZXF1aXJlICcuLi8uLi91dGlscy9mb3JtYXQuY29mZmVlJ1xuSWNvbnMgICAgPSByZXF1aXJlICcuLi9pY29ucy5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gUmFjdGl2ZS5leHRlbmRcblxuICAnbmFtZSc6ICd2aWV3cy9wcm9qZWN0cydcblxuICAndGVtcGxhdGUnOiByZXF1aXJlICcuLi8uLi90ZW1wbGF0ZXMvdGFibGVzL3Byb2plY3RzLmh0bWwnXG5cbiAgJ2RhdGEnOiB7IGZvcm1hdCB9XG5cbiAgJ2NvbXBvbmVudHMnOiB7IEljb25zIH1cblxuICAnYWRhcHQnOiBbIFJhY3RpdmUuYWRhcHRvcnMuUmFjdGl2ZSBdIl19
