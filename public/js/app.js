// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.coffee', function(exports, require, module) {
    
      var App, Header, Notify, key, router, _i, _len, _ref;
      
      _ref = ['utils/mixins.coffee', 'models/projects.coffee'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        require("./" + key);
      }
      
      Header = require('./views/header.coffee');
      
      Notify = require('./views/notify.coffee');
      
      router = require('./modules/router.coffee');
      
      App = Ractive.extend({
        'template': require('./templates/app.html'),
        'components': {
          Header: Header,
          Notify: Notify
        },
        onrender: function() {
          return router.init('/');
        }
      });
      
      module.exports = new App();
      
    });

    // config.coffee
    root.require.register('burnchart/src/models/config.coffee', function(exports, require, module) {
    
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
      
    });

    // firebase.coffee
    root.require.register('burnchart/src/models/firebase.coffee', function(exports, require, module) {
    
      var Model, config, user;
      
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
          var _ref;
          if ((_ref = this.auth) != null) {
            _ref.logout;
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
      
    });

    // projects.coffee
    root.require.register('burnchart/src/models/projects.coffee', function(exports, require, module) {
    
      var Model, config, date, mediator, user;
      
      config = require('../models/config.coffee');
      
      mediator = require('../modules/mediator.coffee');
      
      Model = require('../utils/model.coffee');
      
      date = require('../utils/date.coffee');
      
      user = require('./user.coffee');
      
      module.exports = new Model({
        'name': 'models/projects',
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
        addMilestone: function(project, milestone) {
          var idx;
          if ((idx = _.findIndex(this.data.list, project)) > -1) {
            if (project.milestones != null) {
              return this.push("list." + idx + ".milestones", milestone);
            } else {
              return this.set("list." + idx + ".milestones", [milestone]);
            }
          } else {
            throw 500;
          }
        },
        clear: function() {
          return this.set('list', []);
        },
        onconstruct: function() {
          mediator.on('!projects/add', _.bind(this.add, this));
          return mediator.on('!projects/clear', _.bind(this.clear, this));
        },
        onrender: function() {
          this.set('list', lscache.get('projects') || []);
          return this.observe('list', function(projects) {
            return lscache.set('projects', _.pluckMany(projects, ['owner', 'name']));
          }, {
            'init': false
          });
        }
      });
      
    });

    // system.coffee
    root.require.register('burnchart/src/models/system.coffee', function(exports, require, module) {
    
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
      
    });

    // user.coffee
    root.require.register('burnchart/src/models/user.coffee', function(exports, require, module) {
    
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
      
    });

    // axes.coffee
    root.require.register('burnchart/src/modules/chart/axes.coffee', function(exports, require, module) {
    
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
      
    });

    // lines.coffee
    root.require.register('burnchart/src/modules/chart/lines.coffee', function(exports, require, module) {
    
      var config,
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
      
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
          var cutoff, d, days, length, m, now, once, velocity, y, _ref, _ref1;
          if (b < a) {
            _ref = [a, b], b = _ref[0], a = _ref[1];
          }
          _ref1 = _.map(a.match(config.data.chart.datetime)[1].split('-'), function(v) {
            return parseInt(v);
          }), y = _ref1[0], m = _ref1[1], d = _ref1[2];
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
              date: created_at,
              points: fn(a)
            }, {
              date: due_on,
              points: fn(b)
            }
          ];
        }
      };
      
    });

    // issues.coffee
    root.require.register('burnchart/src/modules/github/issues.coffee', function(exports, require, module) {
    
      var config, request;
      
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
      
    });

    // milestones.coffee
    root.require.register('burnchart/src/modules/github/milestones.coffee', function(exports, require, module) {
    
      var request;
      
      request = require('./request.coffee');
      
      module.exports = {
        'fetch': request.oneMilestone,
        'fetchAll': request.allMilestones
      };
      
    });

    // request.coffee
    root.require.register('burnchart/src/modules/github/request.coffee', function(exports, require, module) {
    
      var defaults, error, headers, isReady, isValid, ready, request, response, stack, user;
      
      user = require('../../models/user.coffee');
      
      superagent.parse = {
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
        req = superagent.get("" + protocol + "://" + host + path + q);
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
        var _ref;
        if (err) {
          return cb(error(err));
        }
        if (data.statusType !== 2) {
          if ((data != null ? (_ref = data.body) != null ? _ref.message : void 0 : void 0) != null) {
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
      
    });

    // mediator.coffee
    root.require.register('burnchart/src/modules/mediator.coffee', function(exports, require, module) {
    
      var Mediator;
      
      Mediator = Ractive.extend({});
      
      module.exports = new Mediator();
      
    });

    // router.coffee
    root.require.register('burnchart/src/modules/router.coffee', function(exports, require, module) {
    
      var addProject, c, el, mediator, route, routes, system, view,
        __slice = [].slice;
      
      mediator = require('./mediator.coffee');
      
      system = require('../models/system.coffee');
      
      el = '#page';
      
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
        Page = require("../views/pages/" + page + ".coffee");
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
      
      module.exports = Router(routes).configure({
        'strict': false,
        notfound: function() {
          throw 404;
        }
      });
      
    });

    // app.html
    root.require.register('burnchart/src/templates/app.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"app\">","  <Notify/>","  <Header/>","","  <div id=\"page\">","    <!-- content loaded from a router -->","  </div>","","  <div id=\"footer\">","    <div class=\"wrap\">","      &copy; 2012-2014 <a href=\"http://cloudfi.re\">Cloudfire Systems</a>","    </div>","  </div>","</div>"].join("\n");
    });

    // chart.html
    root.require.register('burnchart/src/templates/chart.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"chart\"></div>"].join("\n");
    });

    // header.html
    root.require.register('burnchart/src/templates/header.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","  {{#with user}}","    {{#ready}}","      <div class=\"right\" intro=\"fade\">","        {{#displayName}}","          {{displayName}} logged in","        {{else}}","          <a class=\"github\" on-click=\"!login\"><Icons icon=\"github\"/> Sign In</a>","        {{/displayName}}","      </div>","    {{/ready}}","  {{/with}}","","  <a id=\"icon\" href=\"#\">","    <Icons icon=\"{{icon}}\"/>","  </a>","","  <!--","  <div class=\"q\">","    <Icons icon=\"search\"/>","    <Icons icon=\"down-open\"/>","    <input type=\"text\" placeholder=\"Jump to...\">","  </div>","  -->","","  <ul>","    <li><a href=\"#new/project\" class=\"add\"><Icons icon=\"plus-circled\"/> Add a Project</a></li>","    <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    <li><a href=\"#reset\">DB Reset</a></li>","    <li><a href=\"#notify\">Notify</a></li>","  </ul>","</div>"].join("\n");
    });

    // hero.html
    root.require.register('burnchart/src/templates/hero.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"hero\">","  <div class=\"content\">","    <Icons icon=\"address\"/>","    <h2>See your project progress</h2>","    <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","    <div class=\"cta\">","      <a href=\"#new/project\" class=\"primary\"><Icons icon=\"plus-circled\"/> Add your project</a>","      <a href=\"#\" class=\"secondary\">Read the Guide</a>","    </div>","  </div>","</div>"].join("\n");
    });

    // icons.html
    root.require.register('burnchart/src/templates/icons.html', function(exports, require, module) {
    
      module.exports = ["{{#code}}","  <span class=\"icon {{icon}}\">{{{ '&#' + code + ';' }}}</span>","{{/code}}"].join("\n");
    });

    // notify.html
    root.require.register('burnchart/src/templates/notify.html', function(exports, require, module) {
    
      module.exports = ["{{#text}}","  {{#system}}","    <div id=\"notify\" class=\"{{type}} system\" style=\"top:{{top}}%\">","      <Icons icon=\"{{icon}}\"/>","      <p>{{text}}</p>","    </div>","  {{else}}","    <div id=\"notify\" class=\"{{type}}\" style=\"top:{{-top}}px\">","      <span class=\"close\" on-click=\"close\" />","      <Icons icon=\"{{icon}}\"/>","      <p>{{text}}</p>","    </div>","  {{/system}}","{{/text}}"].join("\n");
    });

    // index.html
    root.require.register('burnchart/src/templates/pages/index.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","  {{#if projects.list}}","    {{#ready}}","      <div intro=\"fade\">","        <Projects projects=\"{{projects}}\"/>","      </div>","    {{/ready}}","  {{else}}","    <Hero/>","  {{/if}}","</div>"].join("\n");
    });

    // milestone.html
    root.require.register('burnchart/src/templates/pages/milestone.html', function(exports, require, module) {
    
      module.exports = ["{{#ready}}","  <div intro=\"fade\">","    <div id=\"title\">","      <div class=\"wrap\">","        <h2 class=\"title\">{{ format.title(milestone.title) }}</h2>","        <span class=\"sub\">{{{ format.due(milestone.due_on) }}}</span>","        <p class=\"description\">{{{ format.markdown(milestone.description) }}}</p>","      </div>","    </div>","","    <div id=\"content\" class=\"wrap\">","      <Chart milestone=\"{{milestone}}\"/>","    </div>","  </div>","{{/ready}}"].join("\n");
    });

    // new.html
    root.require.register('burnchart/src/templates/pages/new.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","  <div id=\"add\">","    <div class=\"header\">","      <h2>Add a Project</h2>","      <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","    </div>","","    <div class=\"form\">","      <table>","        <tr>","          <td>","            <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\" value=\"{{value}}\" on-keyup=\"submit:{{value}}\">","          </td>","          <td>","            <a on-click=\"submit:{{value}}\">Add</a>","          </td>","        </tr>","      </table>","    </div>","  </div>","</div>"].join("\n");
    });

    // project.html
    root.require.register('burnchart/src/templates/pages/project.html', function(exports, require, module) {
    
      module.exports = ["{{#ready}}","  <div intro=\"fade\">","    <div id=\"title\">","      <div class=\"wrap\">","        <h2 class=\"title\">{{route.join('/')}}</h2>","      </div>","    </div>","","    <div id=\"content\" class=\"wrap\">","      <Milestones project=\"{{project}}\"/>","    </div>","  </div>","{{/ready}}"].join("\n");
    });

    // milestones.html
    root.require.register('burnchart/src/templates/tables/milestones.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"projects\">","  <div class=\"header\">","    <a href=\"#\" class=\"sort\"><Icons icon=\"sort-alphabet\"/> Sorted by priority</a>","    <h2>Milestones</h2>","  </div>","","  <table>","    {{#project.milestones}}","      <tr>","        <td>","          <a class=\"milestone\" href=\"#{{project.owner}}/{{project.name}}/{{number}}\">{{ title }}</a>","        </td>","        <td style=\"width:1%\">","          <div class=\"progress\">","            <span class=\"percent\">{{Math.floor(format.progress(issues.closed.size, issues.open.size))}}%</span>","            <span class=\"due\">{{{ format.due(due_on) }}}</span>","            <div class=\"outer bar\">","              <div class=\"inner bar {{format.onTime(number, due_on, created_at, issues.closed.size, issues.open.size)}}\" style=\"width:{{format.progress(issues.closed.size, issues.open.size)}}%\"></div>","            </div>","          </div>","        </td>","      </tr>","    {{/project.milestones}}","  </table>","","  <div class=\"footer\">","    <a href=\"#\"><Icons icon=\"cog\"/> Edit</a>","  </div>","</div>"].join("\n");
    });

    // projects.html
    root.require.register('burnchart/src/templates/tables/projects.html', function(exports, require, module) {
    
      module.exports = ["<div id=\"projects\">","  <div class=\"header\">","    <a href=\"#\" class=\"sort\"><Icons icon=\"sort-alphabet\"/> Sorted by priority</a>","    <h2>Projects</h2>","  </div>","","  <table>","    {{#projects.list}}","      {{#if error}}","        <tr>","          <td colspan=\"3\" class=\"repo\">","            <div class=\"project\">{{owner}}/{{name}} <span class=\"error\" title=\"{{error}}\"><Icons icon=\"attention\"/></span></div>","          </td>","        </tr>","      {{else}}","        {{#milestones}}","          <tr>","            <td class=\"repo\">","              <a class=\"project\" href=\"#{{owner}}/{{name}}\">{{owner}}/{{name}}</a>","            </td>","            <td>","              <a class=\"milestone\" href=\"#{{owner}}/{{name}}/{{number}}\">{{ title }}</a>","            </td>","            <td style=\"width:1%\">","              <div class=\"progress\">","                <span class=\"percent\">{{Math.floor(format.progress(issues.closed.size, issues.open.size))}}%</span>","                <span class=\"due\">{{{ format.due(due_on) }}}</span>","                <div class=\"outer bar\">","                  <div class=\"inner bar {{format.onTime(number, due_on, created_at, issues.closed.size, issues.open.size)}}\" style=\"width:{{format.progress(issues.closed.size, issues.open.size)}}%\"></div>","                </div>","              </div>","            </td>","          </tr>","        {{/milestones}}","      {{/if}}","    {{/projects.list}}","  </table>","","  <div class=\"footer\">","    <a href=\"#\"><Icons icon=\"cog\"/> Edit</a>","  </div>","</div>","","<!--","  <tr>","    <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","    <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></td>","    <td>","      <div class=\"progress\">","        <span class=\"percent\">40%</span>","        <span class=\"due\">due on Friday</span>","        <div class=\"outer bar\">","          <div class=\"inner bar red\" style=\"width:40%\"></div>","        </div>","      </div>","    </td>","  </tr>","  <tr class=\"done\">","    <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","    <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","    <td>","      <div class=\"progress\">","        <span class=\"percent\">100%</span>","        <span class=\"due\">due tomorrow</span>","        <div class=\"outer bar\">","          <div class=\"inner bar green\" style=\"width:100%\"></div>","        </div>","      </div>","    </td>","  </tr>","  <tr>","    <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","    <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","    <td>","      <div class=\"progress\">","        <span class=\"percent\">27%</span>","        <span class=\"due\">due in 2 weeks</span>","        <div class=\"outer bar\">","          <div class=\"inner bar red\" style=\"width:27%\"></div>","        </div>","      </div>","    </td>","  </tr>","  <tr>","    <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","    <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","    <td>","      <div class=\"progress\">","        <span class=\"percent\">90%</span>","        <span class=\"due red\">overdue by a month</span>","        <div class=\"outer bar\">","          <div class=\"inner bar red\" style=\"width:90%\"></div>","        </div>","      </div>","    </td>","  </tr>","-->"].join("\n");
    });

    // date.coffee
    root.require.register('burnchart/src/utils/date.coffee', function(exports, require, module) {
    
      module.exports = {
        now: function() {
          return new Date().toJSON();
        }
      };
      
    });

    // format.coffee
    root.require.register('burnchart/src/utils/format.coffee', function(exports, require, module) {
    
      var __slice = [].slice;
      
      module.exports = {
        'progress': _.memoize(function(a, b) {
          return 100 * (a / (b + a));
        }),
        'onTime': _.memoize(function(number, due_on, created_at, closed_size, open_size) {
          var a, b, c, time;
          if (!due_on) {
            return 'green';
          }
          a = +new Date(created_at);
          b = +(new Date);
          c = +new Date(due_on);
          time = this.progress(b - a, c - b);
          return ['red', 'green'][+(this.progress(closed_size, open_size) > time)];
        }, function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return args.join('/');
        }),
        'fromNow': _.memoize(function(jsonDate) {
          return moment(new Date(jsonDate)).fromNow();
        }),
        'due': function(jsonDate) {
          if (!jsonDate) {
            return '&nbsp;';
          }
          return ['due', this.fromNow(jsonDate)].join(' ');
        },
        'markdown': function(markup) {
          return marked(markup);
        },
        'title': function(text) {
          if (text.toLowerCase().indexOf('milestone') > -1) {
            return text;
          } else {
            return ['Milestone', text].join(' ');
          }
        },
        hexToDecimal: function(hex) {
          return parseInt(hex, 16);
        }
      };
      
    });

    // key.coffee
    root.require.register('burnchart/src/utils/key.coffee', function(exports, require, module) {
    
      module.exports = {
        is: function(evt) {
          var _ref;
          return (_ref = evt.original.type) === 'keyup' || _ref === 'keydown';
        },
        isEnter: function(evt) {
          return evt.original.which === 13;
        }
      };
      
    });

    // mixins.coffee
    root.require.register('burnchart/src/utils/mixins.coffee', function(exports, require, module) {
    
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
      
    });

    // model.coffee
    root.require.register('burnchart/src/utils/model.coffee', function(exports, require, module) {
    
      module.exports = function(opts) {
        var Model, model;
        Model = Ractive.extend(opts);
        model = new Model();
        model.render();
        return model;
      };
      
    });

    // chart.coffee
    root.require.register('burnchart/src/views/chart.coffee', function(exports, require, module) {
    
      var axes, lines;
      
      lines = require('../modules/chart/lines.coffee');
      
      axes = require('../modules/chart/axes.coffee');
      
      module.exports = Ractive.extend({
        'name': 'views/chart',
        'template': require('../templates/chart.html'),
        oncomplete: function() {
          var actual, head, height, ideal, issues, line, m, mAxis, margin, milestone, svg, tooltip, total, trend, width, x, xAxis, y, yAxis, _ref;
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
          _ref = this.el.getBoundingClientRect(), height = _ref.height, width = _ref.width;
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
      
    });

    // header.coffee
    root.require.register('burnchart/src/views/header.coffee', function(exports, require, module) {
    
      var Icons, firebase, system, user;
      
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
          var _this = this;
          return system.observe('loading', function(ya) {
            return _this.set('icon', ya ? 'spinner1' : 'fire-station');
          });
        }
      });
      
    });

    // hero.coffee
    root.require.register('burnchart/src/views/hero.coffee', function(exports, require, module) {
    
      var Icons, mediator;
      
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
      
    });

    // icons.coffee
    root.require.register('burnchart/src/views/icons.coffee', function(exports, require, module) {
    
      var codes, format;
      
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
              return this.set('code', format.hexToDecimal(hex));
            } else {
              return this.set('code', null);
            }
          });
        }
      });
      
    });

    // notify.coffee
    root.require.register('burnchart/src/views/notify.coffee', function(exports, require, module) {
    
      var HEIGHT, Icons, mediator;
      
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
          var _this = this;
          if (this.data.hidden) {
            return;
          }
          this.set('hidden', true);
          return this.animate('top', HEIGHT, {
            'easing': d3.ease('back'),
            'complete': function() {
              return _this.set('text', null);
            }
          });
        },
        onconstruct: function() {
          mediator.on('!app/notify', _.bind(this.show, this));
          mediator.on('!app/notify/hide', _.bind(this.hide, this));
          return this.on('close', this.hide);
        }
      });
      
    });

    // index.coffee
    root.require.register('burnchart/src/views/pages/index.coffee', function(exports, require, module) {
    
      var Hero, Projects, issues, mediator, milestones, projects, system;
      
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
          var done,
            _this = this;
          document.title = 'Burnchart: GitHub Burndown Chart as a Service';
          if (!projects.list.length) {
            return this.set('ready', true);
          }
          done = system.async();
          return async.map(projects.data.list, function(project, cb) {
            if (project.milestones) {
              return cb(null, project);
            }
            return milestones.fetchAll(project, function(error, list) {
              if (error) {
                return cb(null, _.extend(project, {
                  error: error
                }));
              }
              return async.map(list, function(milestone, cb) {
                return issues.fetchAll(_.extend(project, {
                  'milestone': milestone.number
                }), function(err, obj) {
                  return cb(err, _.extend(milestone, {
                    'issues': obj
                  }));
                });
              }, function(error, list) {
                delete project.milestone;
                if (error) {
                  return cb(null, _.extend(project, {
                    error: error
                  }));
                }
                return cb(null, _.extend(project, {
                  'milestones': list
                }));
              });
            });
          }, function(err, data) {
            done();
            return _this.set({
              'projects.list': data,
              'ready': true
            });
          });
        }
      });
      
    });

    // milestone.coffee
    root.require.register('burnchart/src/views/pages/milestone.coffee', function(exports, require, module) {
    
      var Chart, format, issues, mediator, milestones, projects, system;
      
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
          var done, fetchIssues, fetchMilestone, milestone, name, obj, owner, project, _ref,
            _this = this;
          _ref = this.get('route'), owner = _ref[0], name = _ref[1], milestone = _ref[2];
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
          return async.waterfall([fetchMilestone, fetchIssues], function(err, data) {
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
          });
        }
      });
      
    });

    // new.coffee
    root.require.register('burnchart/src/views/pages/new.coffee', function(exports, require, module) {
    
      var key, mediator, system, user;
      
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
          var done, name, owner, _ref;
          if (key.is(evt) && !key.isEnter(evt)) {
            return;
          }
          _ref = value.split('/'), owner = _ref[0], name = _ref[1];
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
      
    });

    // project.coffee
    root.require.register('burnchart/src/views/pages/project.coffee', function(exports, require, module) {
    
      var Milestones, issues, mediator, milestones, projects, system;
      
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
          var done, fetchIssues, fetchMilestones, findMilestone, name, owner, project, _ref,
            _this = this;
          _ref = this.get('route'), owner = _ref[0], name = _ref[1];
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
                return cb(null);
              });
            }, cb);
          };
          return async.waterfall([fetchMilestones, fetchIssues], function(err) {
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
          });
        }
      });
      
    });

    // milestones.coffee
    root.require.register('burnchart/src/views/tables/milestones.coffee', function(exports, require, module) {
    
      var Icons, format, mediator, projects;
      
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
      
    });

    // projects.coffee
    root.require.register('burnchart/src/views/tables/projects.coffee', function(exports, require, module) {
    
      var Icons, format, mediator;
      
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
      
    });
  })();

  // Return the main app.
  var main = root.require("burnchart/src/app.coffee");

  // CommonJS/Modules with all its aliases.
  
  root.require.register("burnchart", function(exports, require, module) {
    module.exports = main;
  });
  

  // AMD/RequireJS.
  if (typeof define === 'function' && define.amd) {
    define("burnchart", [ /* load deps ahead of time */ ], function () {
      return main;
    });
  }

  // Browser globals.
  root["burnchart"] = main;

})(this);