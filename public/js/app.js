// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App, Header, Router, key, _i, _len, _ref;
      
      _ref = ['utils/mixins', 'models/projects'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        require("./" + key);
      }
      
      Router = require('./modules/router');
      
      Header = require('./views/header');
      
      App = Ractive.extend({
        'template': require('./templates/layout'),
        'components': {
          Header: Header
        },
        init: function() {
          return new Router();
        }
      });
      
      module.exports = new App();
      
    });

    // config.coffee
    root.require.register('burnchart/src/models/config.js', function(exports, require, module) {
    
      var Model;
      
      Model = require('../utils/model');
      
      module.exports = new Model({
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

    // projects.coffee
    root.require.register('burnchart/src/models/projects.js', function(exports, require, module) {
    
      var Model, config, date, mediator, request, user;
      
      config = require('../models/config');
      
      mediator = require('../modules/mediator');
      
      request = require('../modules/request');
      
      Model = require('../utils/model');
      
      date = require('../utils/date');
      
      user = require('./user');
      
      module.exports = new Model({
        'data': {
          'list': []
        },
        init: function() {
          var _this = this;
          localforage.getItem('projects', function(projects) {
            if (projects == null) {
              projects = [];
            }
            return async.each(projects, function(project, cb) {
              return mediator.fire('!projects/add', project);
            }, function(err) {
              if (err) {
                throw err;
              }
            });
          });
          this.observe('list', function(projects) {
            return localforage.setItem('projects', projects);
          });
          mediator.on('!projects/add', function(repo, done) {
            return request.allMilestones(repo, function(err, res) {
              var milestones;
              if (err) {
                return done(err);
              }
              milestones = _.pluckMany(res, config.get('fields.milestone'));
              _this.push('list', _.merge(repo, {
                milestones: milestones
              }));
              return done();
            });
          });
          return mediator.on('!projects/clear', function() {
            return _this.set('list', []);
          });
        }
      });
      
    });

    // state.coffee
    root.require.register('burnchart/src/models/state.js', function(exports, require, module) {
    
      var Model;
      
      Model = require('../utils/model');
      
      module.exports = new Model({
        'data': {
          'loading': false
        }
      });
      
    });

    // user.coffee
    root.require.register('burnchart/src/models/user.js', function(exports, require, module) {
    
      var Model, mediator;
      
      mediator = require('../modules/mediator');
      
      Model = require('../utils/model');
      
      module.exports = new Model({
        'data': {
          'provider': "local",
          'id': "0",
          'uid': "local:0",
          'token': null
        }
      });
      
    });

    // chart.coffee
    root.require.register('burnchart/src/modules/chart.js', function(exports, require, module) {
    
      var config,
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
      
      config = require('../models/config');
      
      module.exports = {
        'actual': function(collection, created_at, total, cb) {
          var head, max, min, range, rest;
          head = [
            {
              'date': new Date(created_at),
              'points': total
            }
          ];
          min = +Infinity;
          max = -Infinity;
          rest = _.map(collection, function(issue) {
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
          return cb(null, [].concat(head, rest));
        },
        'ideal': function(a, b, total, cb) {
          var cutoff, d, days, length, m, now, once, velocity, y, _ref, _ref1;
          if (b < a) {
            _ref = [a, b], b = _ref[0], a = _ref[1];
          }
          _ref1 = _.map(a.match(config.get('chart.datetime'))[1].split('-'), function(v) {
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
            if (__indexOf.call(config.get('chart.off_days'), day_of) >= 0) {
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
          return cb(null, days);
        },
        'trendline': function(actual, created_at, due_on) {
          var a, b, b1, c1, e, fn, intercept, l, last, slope, start, values;
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
        },
        'render': function(_arg, cb) {
          var actual, height, ideal, line, m, mAxis, margin, svg, tooltip, trendline, width, x, xAxis, y, yAxis, _ref;
          actual = _arg[0], ideal = _arg[1], trendline = _arg[2];
          document.querySelector('#svg').innerHTML = '';
          _ref = document.querySelector('#chart').getBoundingClientRect(), height = _ref.height, width = _ref.width;
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
          xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-height).tickFormat(function(d) {
            return d.getDate();
          }).tickPadding(10);
          yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width).ticks(5).tickPadding(10);
          line = d3.svg.line().interpolate("linear").x(function(d) {
            return x(d.date);
          }).y(function(d) {
            return y(d.points);
          });
          x.domain([ideal[0].date, ideal[ideal.length - 1].date]);
          y.domain([0, ideal[0].points]).nice();
          svg = d3.select("#svg").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          svg.append("g").attr("class", "x axis day").attr("transform", "translate(0," + height + ")").call(xAxis);
          m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          mAxis = xAxis.orient("top").tickSize(height).tickFormat(function(d) {
            return m[d.getMonth()];
          }).ticks(2);
          svg.append("g").attr("class", "x axis month").attr("transform", "translate(0," + height + ")").call(mAxis);
          svg.append("g").attr("class", "y axis").call(yAxis);
          svg.append("svg:line").attr("class", "today").attr("x1", x(new Date())).attr("y1", 0).attr("x2", x(new Date())).attr("y2", height);
          svg.append("path").attr("class", "ideal line").attr("d", line.interpolate("basis")(ideal));
          svg.append("path").attr("class", "trendline line").attr("d", line.interpolate("linear")(trendline));
          svg.append("path").attr("class", "actual line").attr("d", line.interpolate("linear").y(function(d) {
            return y(d.points);
          })(actual));
          tooltip = d3.tip().attr('class', 'd3-tip').html(function(_arg1) {
            var number, title;
            number = _arg1.number, title = _arg1.title;
            return "#" + number + ": " + title;
          });
          svg.call(tooltip);
          svg.selectAll("a.issue").data(actual.slice(1)).enter().append('svg:a').attr("xlink:href", function(_arg1) {
            var html_url;
            html_url = _arg1.html_url;
            return html_url;
          }).attr("xlink:show", 'new').append('svg:circle').attr("cx", function(_arg1) {
            var date;
            date = _arg1.date;
            return x(date);
          }).attr("cy", function(_arg1) {
            var points;
            points = _arg1.points;
            return y(points);
          }).attr("r", function(_arg1) {
            var radius;
            radius = _arg1.radius;
            return 5;
          }).on('mouseover', tooltip.show).on('mouseout', tooltip.hide);
          return cb(null);
        }
      };
      
    });

    // firebase.coffee
    root.require.register('burnchart/src/modules/firebase.js', function(exports, require, module) {
    
      var Class, config, user;
      
      user = require('../models/user');
      
      config = require('../models/config');
      
      Class = (function() {
        function Class() {
          var _this = this;
          this.client = new Firebase("https://" + (config.get('firebase')) + ".firebaseio.com");
          this.auth = new FirebaseSimpleLogin(this.client, function(err, obj) {
            if (err || !obj) {
              return _this.authCb(err);
            }
            return user.set(obj);
          });
        }
      
        Class.prototype.authCb = function() {};
      
        Class.prototype.login = function(cb) {
          if (!this.client) {
            return cb('Client is not setup');
          }
          this.authCb = cb;
          return this.auth.login(config.get('provider'), {
            'rememberMe': true,
            'scope': 'public_repo'
          });
        };
      
        Class.prototype.logout = function() {
          var _ref;
          if ((_ref = this.auth) != null) {
            _ref.logout;
          }
          return user.reset();
        };
      
        return Class;
      
      })();
      
      module.exports = new Class();
      
    });

    // issues.coffee
    root.require.register('burnchart/src/modules/issues.js', function(exports, require, module) {
    
      var config, request;
      
      config = require('../models/config');
      
      request = require('./request');
      
      module.exports = {
        'get_all': function(opts, cb) {
          var one_status;
          one_status = function(state, cb) {
            var fetch_page, results;
            results = [];
            return (fetch_page = function(page) {
              return request.allIssues(opts, {
                'milestone': opts.milestone.number,
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
                return fetch_page(page + 1);
              });
            })(1);
          };
          return async.parallel([_.partial(one_status, 'open'), _.partial(one_status, 'closed')], cb);
        },
        'filter': function(collection, cb) {
          var filtered, total;
          total = 0;
          switch (config.get('chart.points')) {
            case 'ONE_SIZE':
              total = collection.length;
              filtered = _.map(collection, function(issue) {
                issue.size = 1;
                return issue;
              });
              break;
            case 'LABELS':
              filtered = _.filter(collection, function(issue) {
                var labels;
                if (!(labels = issue.labels)) {
                  return false;
                }
                issue.size = _.reduce(labels, function(sum, label) {
                  var matches;
                  if (!(matches = label.name.match(config.get('chart.size_label')))) {
                    return sum;
                  }
                  return sum += parseInt(matches[1]);
                }, 0);
                total += issue.size;
                return !!issue.size;
              });
          }
          return cb(null, filtered, total);
        }
      };
      
    });

    // mediator.coffee
    root.require.register('burnchart/src/modules/mediator.js', function(exports, require, module) {
    
      module.exports = new Ractive();
      
    });

    // milestone.coffee
    root.require.register('burnchart/src/modules/milestone.js', function(exports, require, module) {
    
      var request;
      
      request = require('./request');
      
      module.exports = {
        get: function(repo, cb) {
          if (repo.milestone) {
            return request.oneMilestone(repo, repo.milestone, function(err, m) {
              if (err) {
                return cb(err);
              }
              if (m.open_issues + m.closed_issues === 0) {
                return cb(null, "No issues for milestone `" + m.title + "`");
              }
              return cb(null, null, m);
            });
          } else {
            return request.allMilestones(repo, function(err, data) {
              var m;
              if (err) {
                return cb(err);
              }
              if (!data.length) {
                return cb(null, "No open milestones for repo " + repo.path);
              }
              m = data[0];
              m = _.rest(data, {
                'due_on': null
              });
              m = m[0] ? m[0] : data[0];
              if (m.open_issues + m.closed_issues === 0) {
                return cb(null, "No issues for milestone `" + m.title + "`");
              }
              return cb(null, null, m);
            });
          }
        }
      };
      
    });

    // project.coffee
    root.require.register('burnchart/src/modules/project.js', function(exports, require, module) {
    
      var chart, issues;
      
      issues = require('./issues');
      
      chart = require('./chart');
      
      module.exports = function(opts, cb) {
        return async.waterfall([
          function(cb) {
            return issues.get_all(opts, cb);
          }, function(all, cb) {
            return async.map(all, function(array, cb) {
              return issues.filter(array, function(err, filtered, total) {
                return cb(err, [filtered, total]);
              });
            }, function(err, _arg) {
              var closed, open, start;
              open = _arg[0], closed = _arg[1];
              if (err) {
                return cb(err);
              }
              if (open[1] + closed[1] === 0) {
                return cb('No matching issues found');
              }
              opts.issues = {
                'closed': {
                  'points': closed[1],
                  'data': closed[0]
                },
                'open': {
                  'points': open[1],
                  'data': open[0]
                }
              };
              if ((start = closed[0][0].closed_at) < opts.milestone.created_at) {
                opts.milestone.created_at = start;
              }
              return cb(null);
            });
          }, function(cb) {
            var total;
            total = opts.issues.open.points + opts.issues.closed.points;
            return async.parallel([_.partial(chart.actual, opts.issues.closed.data, opts.milestone.created_at, total), _.partial(chart.ideal, opts.milestone.created_at, opts.milestone.due_on, total)], function(err, values) {
              if (values[0].length) {
                values.push(chart.trendline(values[0], opts.milestone.created_at, opts.milestone.due_on));
              }
              return chart.render(values, cb);
            });
          }
        ], cb);
      };
      
    });

    // request.coffee
    root.require.register('burnchart/src/modules/request.js', function(exports, require, module) {
    
      var defaults, error, headers, request, response, user;
      
      user = require('../models/user');
      
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
        'repo': function(repo, cb) {
          var data;
          data = _.defaults({
            'path': "/repos/" + repo.owner + "/" + repo.name,
            'headers': headers(user.get('token'))
          }, defaults.github);
          return request(data, cb);
        },
        'allMilestones': function(repo, cb) {
          var data;
          data = _.defaults({
            'path': "/repos/" + repo.owner + "/" + repo.name + "/milestones",
            'query': {
              'state': 'open',
              'sort': 'due_date',
              'direction': 'asc'
            },
            'headers': headers(user.get('token'))
          }, defaults.github);
          return request(data, cb);
        },
        'oneMilestone': function(repo, number, cb) {
          var data;
          data = _.defaults({
            'path': "/repos/" + repo.owner + "/" + repo.name + "/milestones/" + number,
            'query': {
              'state': 'open',
              'sort': 'due_date',
              'direction': 'asc'
            },
            'headers': headers(user.get('token'))
          }, defaults.github);
          return request(data, cb);
        },
        'allIssues': function(repo, query, cb) {
          var data;
          data = _.defaults({
            'path': "/repos/" + repo.owner + "/" + repo.name + "/issues",
            'query': _.extend(query, {
              'per_page': '100'
            }),
            'headers': headers(user.get('token'))
          }, defaults.github);
          return request(data, cb);
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
        h = _.extend({}, {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3'
        });
        if (token != null) {
          h.Authorization = "token " + token;
        }
        return h;
      };
      
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

    // router.coffee
    root.require.register('burnchart/src/modules/router.js', function(exports, require, module) {
    
      var el, mediator, route, router, state;
      
      mediator = require('./mediator');
      
      state = require('../models/state');
      
      el = '#page';
      
      route = function(page, req, evt) {
        var Page;
        Page = require("../views/pages/" + page);
        return new Page({
          el: el,
          'data': {
            'route': req.params
          }
        });
      };
      
      router = {
        '': _.partial(route, 'index'),
        'project/add': _.partial(route, 'addProject'),
        'chart/:owner/:name/:milestone': _.partial(route, 'showChart'),
        'reset': function() {
          mediator.fire('!projects/clear');
          return window.location.hash = '#';
        },
        'notify': function() {
          window.location.hash = '#';
          return state.set('loading', true);
        }
      };
      
      module.exports = function() {
        Grapnel.listen(router);
        return router;
      };
      
    });

    // header.mustache
    root.require.register('burnchart/src/templates/header.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","  <div class=\"right\">","    {{#user.displayName}}","      {{user.displayName}} logged in","    {{else}}","      <a class=\"github\" on-click=\"!login\"><Icons icon=\"github\"/> Sign In</a>","    {{/user.displayName}}","  </div>","","  <a id=\"icon\" href=\"#\">","    <Icons icon=\"{{icon}}\"/>","  </a>","","  <div class=\"q\">","    <Icons icon=\"search\"/>","    <Icons icon=\"down-open\"/>","    <input type=\"text\" placeholder=\"Jump to...\">","  </div>","","  <ul>","    <li><a href=\"#project/add\" class=\"add\"><Icons icon=\"plus-circled\"/> Add a Project</a></li>","    <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    <li><a href=\"#reset\">DB Reset</a></li>","    <li><a href=\"#notify\">Notify</a></li>","  </ul>","</div>"].join("\n");
    });

    // hero.mustache
    root.require.register('burnchart/src/templates/hero.js', function(exports, require, module) {
    
      module.exports = ["{{^projects.list}}","  <div id=\"hero\">","    <div class=\"content\">","      <Icons icon=\"address\"/>","      <h2>See your project progress</h2>","      <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","      <div class=\"cta\">","        <a href=\"#project/add\" class=\"primary\"><Icons icon=\"plus-circled\"/> Add your project</a>","        <a href=\"#\" class=\"secondary\">Read the Guide</a>","      </div>","    </div>","  </div>","{{/projects.list}}"].join("\n");
    });

    // icons.mustache
    root.require.register('burnchart/src/templates/icons.js', function(exports, require, module) {
    
      module.exports = ["{{#code}}","  <span class=\"icon {{icon}}\">{{{ '&#' + code + ';' }}}</span>","{{/code}}"].join("\n");
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<Header/>","","<div id=\"page\">","  <!-- content loaded from a router -->","</div>","","<div id=\"footer\">","  <div class=\"wrap\">","    &copy; 2012-2014 <a href=\"http://cloudfi.re\">Cloudfire Systems</a>","  </div>","</div>"].join("\n");
    });

    // notify.mustache
    root.require.register('burnchart/src/templates/notify.js', function(exports, require, module) {
    
      module.exports = ["<Icon icon=\"megaphone\"/>","<p>You have some interesting news in your inbox. Go <a href=\"#\">check it out</a> now.</p>"].join("\n");
    });

    // addProject.mustache
    root.require.register('burnchart/src/templates/pages/addProject.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","  <div id=\"add\">","    <div class=\"header\">","      <h2>Add a Project</h2>","      <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","    </div>","","    <div class=\"form\">","      <table>","        <tr>","          <td>","            <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\" value=\"{{value}}\">","          </td>","          <td>","            <a on-click=\"submit\">Add</a>","          </td>","        </tr>","      </table>","    </div>","  </div>","</div>"].join("\n");
    });

    // index.mustache
    root.require.register('burnchart/src/templates/pages/index.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","  <Hero/>","  <Projects/>","</div>"].join("\n");
    });

    // showChart.mustache
    root.require.register('burnchart/src/templates/pages/showChart.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"title\">","  <div class=\"wrap\">","    <h2 class=\"title\">{{ format.title(milestone.title) }}</h2>","    <span class=\"sub\">{{{ format.due(milestone.due_on) }}}</span>","    <p class=\"description\">{{{ format.markdown(milestone.description) }}}</p>","  </div>","</div>","","<div id=\"content\" class=\"wrap\">","  <div id=\"chart\">","    <div id=\"svg\"></div>","  </div>","</div>"].join("\n");
    });

    // projects.mustache
    root.require.register('burnchart/src/templates/projects.js', function(exports, require, module) {
    
      module.exports = ["{{#projects.list.length}}","  <div id=\"projects\">","    <div class=\"header\">","      <a href=\"#\" class=\"sort\"><Icons icon=\"sort-alphabet\"/> Sorted by priority</a>","      <h2>Projects</h2>","    </div>","","    <table>","      {{#projects.list}}","        {{#milestones}}","          <tr>","            <td class=\"repo\">{{owner}}/{{name}}</td>","              <td>","                <a class=\"milestone\" href=\"#chart/{{owner}}/{{name}}/{{number}}\">{{ title }}</a>","              </td>","              <td>","                <div class=\"progress\">","                  <span class=\"percent\">{{Math.floor(format.progress(closed_issues, open_issues))}}%</span>","                  <span class=\"due\">{{{ format.due(due_on) }}}</span>","                  <div class=\"outer bar\">","                    <div class=\"inner bar {{format.onTime(this)}}\" style=\"width:{{format.progress(closed_issues, open_issues)}}%\"></div>","                  </div>","                </div>","              </td>","          </tr>","        {{/milestones}}","      {{/projects.list}}","","    <!--","      <tr>","        <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","        <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></td>","        <td>","          <div class=\"progress\">","            <span class=\"percent\">40%</span>","            <span class=\"due\">due on Friday</span>","            <div class=\"outer bar\">","              <div class=\"inner bar red\" style=\"width:40%\"></div>","            </div>","          </div>","        </td>","      </tr>","      <tr class=\"done\">","        <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","        <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","        <td>","          <div class=\"progress\">","            <span class=\"percent\">100%</span>","            <span class=\"due\">due tomorrow</span>","            <div class=\"outer bar\">","              <div class=\"inner bar green\" style=\"width:100%\"></div>","            </div>","          </div>","        </td>","      </tr>","      <tr>","        <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","        <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","        <td>","          <div class=\"progress\">","            <span class=\"percent\">27%</span>","            <span class=\"due\">due in 2 weeks</span>","            <div class=\"outer bar\">","              <div class=\"inner bar red\" style=\"width:27%\"></div>","            </div>","          </div>","        </td>","      </tr>","      <tr>","        <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","        <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","        <td>","          <div class=\"progress\">","            <span class=\"percent\">90%</span>","            <span class=\"due red\">overdue by a month</span>","            <div class=\"outer bar\">","              <div class=\"inner bar red\" style=\"width:90%\"></div>","            </div>","          </div>","        </td>","      </tr>","    -->","    </table>","","    <div class=\"footer\">","      <a href=\"#\"><Icons icon=\"cog\"/> Edit</a>","    </div>","  </div>","{{/projects.list}}"].join("\n");
    });

    // date.coffee
    root.require.register('burnchart/src/utils/date.js', function(exports, require, module) {
    
      module.exports = {
        now: function() {
          return new Date().toJSON();
        }
      };
      
    });

    // format.coffee
    root.require.register('burnchart/src/utils/format.js', function(exports, require, module) {
    
      var config;
      
      config = require('../models/config');
      
      module.exports = {
        'progress': _.memoize(function(a, b) {
          return 100 * (a / (b + a));
        }),
        'onTime': _.memoize(function(milestone) {
          var a, b, c, points, time;
          if (!milestone.due_on) {
            return 'green';
          }
          points = this.progress(milestone.closed_issues, milestone.open_issues);
          a = +new Date(milestone.created_at);
          b = +(new Date);
          c = +new Date(milestone.due_on);
          time = this.progress(b - a, c - b);
          return ['red', 'green'][+(points > time)];
        }, function(m) {
          return [m.created_at, m.number].join('/');
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

    // mixins.coffee
    root.require.register('burnchart/src/utils/mixins.js', function(exports, require, module) {
    
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
        }
      });
      
    });

    // model.coffee
    root.require.register('burnchart/src/utils/model.js', function(exports, require, module) {
    
      module.exports = function(opts) {
        var Model, model;
        Model = Ractive.extend(opts);
        model = new Model();
        model.render();
        return model;
      };
      
    });

    // header.coffee
    root.require.register('burnchart/src/views/header.js', function(exports, require, module) {
    
      var Icons, firebase, mediator, state, user;
      
      firebase = require('../modules/firebase');
      
      mediator = require('../modules/mediator');
      
      user = require('../models/user');
      
      state = require('../models/state');
      
      Icons = require('./icons');
      
      module.exports = Ractive.extend({
        'template': require('../templates/header'),
        'data': {
          'user': user,
          'icon': 'fire-station'
        },
        init: function() {
          var _this = this;
          this.on('!login', function() {
            return firebase.login(function(err) {
              if (err) {
                throw err;
              }
            });
          });
          return state.observe('loading', function(val) {
            return _this.set('icon', val ? 'spin4' : 'fire-station');
          });
        },
        'components': {
          Icons: Icons
        },
        'adapt': [Ractive.adaptors.Ractive]
      });
      
    });

    // hero.coffee
    root.require.register('burnchart/src/views/hero.js', function(exports, require, module) {
    
      var Icons, mediator, projects;
      
      mediator = require('../modules/mediator');
      
      projects = require('../models/projects');
      
      Icons = require('./icons');
      
      module.exports = Ractive.extend({
        'template': require('../templates/hero'),
        'data': {
          projects: projects
        },
        'components': {
          Icons: Icons
        },
        'adapt': [Ractive.adaptors.Ractive]
      });
      
    });

    // icons.coffee
    root.require.register('burnchart/src/views/icons.js', function(exports, require, module) {
    
      var codes, utils;
      
      utils = require('../utils/format');
      
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
        'spin4': '\e80a'
      };
      
      module.exports = Ractive.extend({
        'template': require('../templates/icons'),
        'isolated': true,
        init: function() {
          return this.observe('icon', function(icon) {
            var hex;
            if (icon && (hex = codes[icon])) {
              return this.set('code', utils.hexToDecimal(hex));
            } else {
              return this.set('code', null);
            }
          });
        }
      });
      
    });

    // addProject.coffee
    root.require.register('burnchart/src/views/pages/addProject.js', function(exports, require, module) {
    
      var mediator, user;
      
      mediator = require('../../modules/mediator');
      
      user = require('../../models/user');
      
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/addProject'),
        'data': {
          'value': 'radekstepan/disposable',
          user: user
        },
        'adapt': [Ractive.adaptors.Ractive],
        init: function() {
          var autocomplete;
          document.title = 'Add a new project';
          autocomplete = function(value) {};
          this.observe('value', _.debounce(autocomplete, 200), {
            'init': false
          });
          return this.on('submit', function() {
            var name, owner, _ref;
            _ref = this.get('value').split('/'), owner = _ref[0], name = _ref[1];
            return mediator.fire('!projects/add', {
              owner: owner,
              name: name
            }, function() {
              return window.location.hash = '#';
            });
          });
        }
      });
      
    });

    // index.coffee
    root.require.register('burnchart/src/views/pages/index.js', function(exports, require, module) {
    
      var Hero, Projects, format;
      
      Hero = require('../hero');
      
      Projects = require('../projects');
      
      format = require('../../utils/format');
      
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/index'),
        'components': {
          Hero: Hero,
          Projects: Projects
        },
        'data': {
          format: format
        },
        init: function() {
          return document.title = 'BurnChart: GitHub Burndown Chart as a Service';
        }
      });
      
    });

    // showChart.coffee
    root.require.register('burnchart/src/views/pages/showChart.js', function(exports, require, module) {
    
      var format, milestone, project;
      
      milestone = require('../../modules/milestone');
      
      project = require('../../modules/project');
      
      format = require('../../utils/format');
      
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/showChart'),
        'adapt': [Ractive.adaptors.Ractive],
        'data': {
          format: format
        },
        init: function() {
          var route,
            _this = this;
          route = this.get('route');
          document.title = "" + route.owner + "/" + route.name;
          return milestone.get(route, function(err, warn, obj) {
            if (err) {
              throw err;
            }
            if (warn) {
              throw warn;
            }
            _this.set('milestone', obj);
            route.milestone = obj;
            return project(route, function(err) {
              if (err) {
                throw err;
              }
              return console.log('Done');
            });
          });
        }
      });
      
    });

    // projects.coffee
    root.require.register('burnchart/src/views/projects.js', function(exports, require, module) {
    
      var Icons, mediator, projects;
      
      mediator = require('../modules/mediator');
      
      projects = require('../models/projects');
      
      Icons = require('./icons');
      
      module.exports = Ractive.extend({
        'template': require('../templates/projects'),
        'data': {
          projects: projects
        },
        'components': {
          Icons: Icons
        },
        'adapt': [Ractive.adaptors.Ractive]
      });
      
    });
  })();

  // Return the main app.
  var main = root.require("burnchart/src/app.js");

  // AMD/RequireJS.
  if (typeof define !== 'undefined' && define.amd) {
  
    define("burnchart", [ /* load deps ahead of time */ ], function () {
      return main;
    });
  
  }

  // CommonJS.
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = main;
  }

  // Globally exported.
  else {
  
    root["burnchart"] = main;
  
  }

  // Alias our app.
  
  root.require.alias("burnchart/src/app.js", "burnchart/index.js");
  

})(this);