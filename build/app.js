(function() {
  /**
   * Require the given path.
   *
   * @param {String} path
   * @return {Object} exports
   * @api public
   */
  var require = function(path, parent, orig) {
    var resolved = require.resolve(path);

    // lookup failed
    if (null === resolved) {
      orig = orig || path;
      parent = parent || 'root';
      var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
      err.path = orig;
      err.parent = parent;
      err.require = true;
      throw err;
    }

    var module = require.modules[resolved];

    // perform real require()
    // by invoking the module's
    // registered function
    if (!module._resolving && !module.exports) {
      var mod = {};
      mod.exports = {};
      mod.client = mod.component = true;
      module._resolving = true;
      module.call(this, mod.exports, require.relative(resolved), mod);
      delete module._resolving;
      module.exports = mod.exports;
    }

    return module.exports;
  };

  /**
   * Registered modules.
   */

  require.modules = {};

  /**
   * Registered aliases.
   */

  require.aliases = {};

  /**
   * Resolve `path`.
   *
   * Lookup:
   *
   *   - PATH/index.js
   *   - PATH.js
   *   - PATH
   *
   * @param {String} path
   * @return {String} path or null
   * @api private
   */

  require.resolve = function(path) {
    if (path.charAt(0) === '/') path = path.slice(1);

    var paths = [
      path,
      path + '.js',
      path + '.json',
      path + '/index.js',
      path + '/index.json'
    ];

    for (var i = 0; i < paths.length; i++) {
      path = paths[i];
      if (require.modules.hasOwnProperty(path)) return path;
      if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
    }
  };

  /**
   * Normalize `path` relative to the current path.
   *
   * @param {String} curr
   * @param {String} path
   * @return {String}
   * @api private
   */

  require.normalize = function(curr, path) {
    var segs = [];

    if ('.' != path.charAt(0)) return path;

    curr = curr.split('/');
    path = path.split('/');

    for (var i = 0; i < path.length; ++i) {
      if ('..' == path[i]) {
        curr.pop();
      } else if ('.' !== path[i] && '' !== path[i]) {
        segs.push(path[i]);
      }
    }

    return curr.concat(segs).join('/');
  };

  /**
   * Register module at `path` with callback `definition`.
   *
   * @param {String} path
   * @param {Function} definition
   * @api private
   */

  require.register = function(path, definition) {
    require.modules[path] = definition;
  };

  /**
   * Alias a module definition.
   *
   * @param {String} from
   * @param {String} to
   * @api private
   */

  require.alias = function(from, to) {
    if (!require.modules.hasOwnProperty(from)) {
      throw new Error('Failed to alias "' + from + '", it does not exist');
    }
    require.aliases[to] = from;
  };

  /**
   * Return a require function relative to the `parent` path.
   *
   * @param {String} parent
   * @return {Function}
   * @api private
   */

  require.relative = function(parent) {
    var p = require.normalize(parent, '..');

    /**
     * lastIndexOf helper.
     */

    function lastIndexOf(arr, obj) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === obj) return i;
      }
      return -1;
    }

    /**
     * The relative require() itself.
     */

    var localRequire = function(path) {
      var resolved = localRequire.resolve(path);
      return require(resolved, parent, path);
    };

    /**
     * Resolve relative to the parent.
     */

    localRequire.resolve = function(path) {
      var c = path.charAt(0);
      if ('/' == c) return path.slice(1);
      if ('.' == c) return require.normalize(p, path);

      // resolve deps by returning
      // the dep in the nearest "deps"
      // directory
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    };

    /**
     * Check if module is defined at `path`.
     */
    localRequire.exists = function(path) {
      return require.modules.hasOwnProperty(localRequire.resolve(path));
    };

    return localRequire;
  };

  // Global on server, window in browser.
  var root = this;

  // Do we already have require loader?
  root.require = (typeof root.require !== 'undefined') ? root.require : require;

  // All our modules will use global require.
  (function() {
    
    
    // app.coffee
    root.require.register('ghbc/src/app.js', function(exports, require, module) {
    
      var config, regex, render, repo, route;
      
      config = require('./modules/config');
      
      regex = require('./modules/regex');
      
      render = require('./modules/render');
      
      repo = require('./modules/repo');
      
      route = function() {
        var m, match, opts, path, r, u, _ref;
        if (match = window.location.hash.match(regex.location)) {
          path = match[1].slice(1);
          render('body', 'loading', {
            path: path
          });
          _ref = path.split('/'), u = _ref[0], r = _ref[1], m = _ref[2];
          opts = m ? {
            'path': "" + u + "/" + r,
            'milestone': m
          } : {
            path: path
          };
          return async.waterfall([
            config, function(conf, cb) {
              return repo(_.extend(opts, conf), cb);
            }
          ], function(err) {
            if (err) {
              return render('body', 'error', {
                'text': err.toString()
              });
            }
          });
        }
        return render('body', 'info');
      };
      
      module.exports = function() {
        if ('onhashchange' in window && 'hash' in window.location) {
          window.addEventListener('hashchange', route, false);
          return route();
        }
        return render('body', 'error', {
          'text': 'URL fragment identifier not supported'
        });
      };
      
    });

    
    // config.coffee
    root.require.register('ghbc/src/modules/config.js', function(exports, require, module) {
    
      var config, defaults, queue, regex, request, validators, wait, _,
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
      
      _ = require('./require')._;
      
      request = require('./request');
      
      regex = require('./regex');
      
      config = null;
      
      wait = false;
      
      queue = [];
      
      defaults = {
        'host': 'api.github.com',
        'protocol': 'https'
      };
      
      validators = {
        'host': function(value) {
          return _.isString(value);
        },
        'protocol': function(value) {
          return _.isString(value) && value.match(/^http(s?)$/);
        },
        'token': function(value) {
          return _.isString(value);
        },
        'off_days': function(value) {
          var day, _i, _len;
          if (!_.isArray(value)) {
            return false;
          }
          for (_i = 0, _len = value.length; _i < _len; _i++) {
            day = value[_i];
            if (__indexOf.call([1, 2, 3, 4, 5, 6, 7], day) < 0) {
              return false;
            }
          }
          return true;
        }
      };
      
      module.exports = function(cb) {
        if (typeof window === 'undefined') {
          config = null;
        }
        if (config) {
          return cb(null, config);
        }
        queue.push(cb);
        if (!wait) {
          wait = true;
          return request.config(function(err, result) {
            var field, validator, _results;
            wait = false;
            config = _.defaults(result || {}, defaults);
            if (config.size_label) {
              config.size_label = new RegExp(config.size_label);
            } else {
              config.size_label = regex.size_label;
            }
            for (field in validators) {
              validator = validators[field];
              if (config[field]) {
                if (!validator(config[field])) {
                  return cb("Config field `" + field + "` misconfigured");
                }
              }
            }
            _results = [];
            while (queue.length) {
              _results.push(queue.pop()(null, config));
            }
            return _results;
          });
        }
      };
      
    });

    
    // graph.coffee
    root.require.register('ghbc/src/modules/graph.js', function(exports, require, module) {
    
      var d3, reg, _, _ref,
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
      
      _ref = require('./require'), _ = _ref._, d3 = _ref.d3;
      
      reg = require('./regex');
      
      module.exports = {
        'actual': function(collection, created_at, total, cb) {
          var head, max, min, range, rest;
          head = [
            {
              date: new Date(created_at),
              points: total
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
            return _.extend({}, issue, {
              date: new Date(closed_at),
              points: total -= size
            });
          });
          range = d3.scale.linear().domain([min, max]).range([5, 8]);
          rest = _.map(rest, function(issue) {
            issue.radius = range(issue.size);
            return issue;
          });
          return cb(null, [].concat(head, rest));
        },
        'ideal': function(a, b, off_days, total, cb) {
          var cutoff, d, days, length, m, now, once, velocity, y, _ref1, _ref2;
          if (b < a) {
            _ref1 = [a, b], b = _ref1[0], a = _ref1[1];
          }
          _ref2 = _.map(a.match(reg.datetime)[1].split('-'), function(v) {
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
            if (__indexOf.call(off_days, day_of) >= 0) {
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
          var actual, height, ideal, line, m, mAxis, margin, svg, tooltip, trendline, width, x, xAxis, y, yAxis, _ref1;
          actual = _arg[0], ideal = _arg[1], trendline = _arg[2];
          document.querySelector('#svg').innerHTML = '';
          _ref1 = document.querySelector('#graph').getBoundingClientRect(), height = _ref1.height, width = _ref1.width;
          margin = {
            top: 30,
            right: 30,
            bottom: 40,
            left: 50
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

    
    // issues.coffee
    root.require.register('ghbc/src/modules/issues.js', function(exports, require, module) {
    
      var async, reg, req, _, _ref;
      
      _ref = require('./require'), _ = _ref._, async = _ref.async;
      
      req = require('./request');
      
      reg = require('./regex');
      
      module.exports = {
        'get_all': function(repo, cb) {
          var one_status;
          one_status = function(state, cb) {
            var fetch_page, results;
            results = [];
            return (fetch_page = function(page) {
              return req.all_issues(repo, {
                milestone: repo.milestone.number,
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
        'filter': function(collection, regex, cb) {
          var filtered, total;
          total = 0;
          filtered = _.filter(collection, function(issue) {
            var labels;
            if (!(labels = issue.labels)) {
              return false;
            }
            issue.size = _.reduce(labels, function(sum, label) {
              var matches;
              if (!(matches = label.name.match(regex))) {
                return sum;
              }
              return sum += parseInt(matches[1]);
            }, 0);
            total += issue.size;
            return !!issue.size;
          });
          return cb(null, filtered, total);
        }
      };
      
    });

    
    // milestones.coffee
    root.require.register('ghbc/src/modules/milestones.js', function(exports, require, module) {
    
      var marked, request, _, _ref;
      
      _ref = require('./require'), _ = _ref._, marked = _ref.marked;
      
      request = require('./request');
      
      module.exports = function(repo, cb) {
        var parse;
        parse = function(data) {
          if (data.description) {
            data.description = marked(data.description).slice(3, -5);
          }
          return data;
        };
        if (repo.milestone) {
          return request.one_milestone(repo, repo.milestone, function(err, m) {
            if (err) {
              return cb(err);
            }
            if (m.open_issues + m.closed_issues === 0) {
              return cb(null, "No issues for milestone `" + m.title + "`");
            }
            m = parse(m);
            return cb(null, null, m);
          });
        } else {
          return request.all_milestones(repo, function(err, data) {
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
            m = parse(m);
            return cb(null, null, m);
          });
        }
      };
      
    });

    
    // regex.coffee
    root.require.register('ghbc/src/modules/regex.js', function(exports, require, module) {
    
      module.exports = {
        'datetime': /^(\d{4}-\d{2}-\d{2})T(.*)/,
        'size_label': /^size (\d+)$/,
        'location': /^#!((\/[^\/]+){2,3})$/
      };
      
    });

    
    // render.coffee
    root.require.register('ghbc/src/modules/render.js', function(exports, require, module) {
    
      module.exports = function(selector, template, context) {
        var tml;
        if (context == null) {
          context = {};
        }
        tml = require("../templates/" + template);
        return document.querySelector(selector).innerHTML = tml(context);
      };
      
    });

    
    // repo.coffee
    root.require.register('ghbc/src/modules/repo.js', function(exports, require, module) {
    
      var async, graph, issues, milestones, regex, render, _, _ref;
      
      _ref = require('./require'), _ = _ref._, async = _ref.async;
      
      milestones = require('./milestones');
      
      issues = require('./issues');
      
      graph = require('./graph');
      
      regex = require('./regex');
      
      render = require('./render');
      
      module.exports = function(opts, cb) {
        return async.waterfall([
          function(cb) {
            return milestones(opts, function(err, warn, milestone) {
              if (err) {
                return cb(err);
              }
              if (warn) {
                return cb(warn);
              }
              opts.milestone = milestone;
              return cb(null);
            });
          }, function(cb) {
            return issues.get_all(opts, cb);
          }, function(all, cb) {
            return async.map(all, function(array, cb) {
              return issues.filter(array, opts.size_label, function(err, filtered, total) {
                return cb(err, [filtered, total]);
              });
            }, function(err, _arg) {
              var closed, open;
              open = _arg[0], closed = _arg[1];
              if (err) {
                return cb(err);
              }
              if (open[1] + closed[1] === 0) {
                return cb('No matching issues found');
              }
              opts.issues = {
                closed: {
                  points: closed[1],
                  data: closed[0]
                },
                open: {
                  points: open[1],
                  data: open[0]
                }
              };
              return cb(null);
            });
          }, function(cb) {
            var progress, total;
            progress = 100 * opts.issues.closed.points / (total = opts.issues.open.points + opts.issues.closed.points);
            return async.parallel([_.partial(graph.actual, opts.issues.closed.data, opts.milestone.created_at, total), _.partial(graph.ideal, opts.milestone.created_at, opts.milestone.due_on, opts.off_days || [], total)], function(err, values) {
              var doit;
              render('body', 'graph', {
                'repo': opts.path,
                'milestone': opts.milestone
              });
              render('#progress', 'progress', {
                progress: progress
              });
              if (values[0].length) {
                values.push(graph.trendline(values[0], opts.milestone.created_at, opts.milestone.due_on));
              }
              (doit = function() {
                return graph.render(values, cb);
              })();
              if ('onresize' in window) {
                return window.onresize = doit;
              }
            });
          }
        ], cb);
      };
      
    });

    
    // request.coffee
    root.require.register('ghbc/src/modules/request.js', function(exports, require, module) {
    
      var error, headers, request, response, superagent, _, _ref;
      
      _ref = require('./require'), superagent = _ref.superagent, _ = _ref._;
      
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
      
      module.exports = {
        'all_milestones': function(repo, cb) {
          return request({
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.path + "/milestones",
            'query': {
              'state': 'open',
              'sort': 'due_date',
              'direction': 'asc'
            },
            'headers': headers(repo.token)
          }, cb);
        },
        'one_milestone': function(repo, number, cb) {
          return request({
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.path + "/milestones/" + number,
            'query': {
              'state': 'open',
              'sort': 'due_date',
              'direction': 'asc'
            },
            'headers': headers(repo.token)
          }, cb);
        },
        'all_issues': function(repo, query, cb) {
          return request({
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.path + "/issues",
            'query': _.extend(query, {
              'per_page': '100'
            }),
            'headers': headers(repo.token)
          }, cb);
        },
        'config': function(cb) {
          return request({
            'protocol': 'http',
            'host': window.location.host,
            'path': "" + window.location.pathname + "config.json",
            'headers': _.extend(headers(), {
              'Accept': 'application/json'
            })
          }, cb);
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

    
    // require.coffee
    root.require.register('ghbc/src/modules/require.js', function(exports, require, module) {
    
      module.exports = {
        _: _,
        superagent: superagent,
        d3: d3,
        async: async,
        marked: marked
      };
      
    });

    
    // error.eco
    root.require.register('ghbc/src/templates/error.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            __out.push('<div class="box error">\n    <h2>Trouble</h2>\n    <p>');
          
            __out.push(this.text);
          
            __out.push('</p>\n</div>');
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });

    
    // graph.eco
    root.require.register('ghbc/src/templates/graph.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            __out.push('<div class="box">\n    <h1>');
          
            __out.push(this.milestone.title);
          
            __out.push('@');
          
            __out.push(this.repo);
          
            __out.push('</h1>\n    ');
          
            if (this.milestone.description) {
              __out.push('\n        <p class="description">');
              __out.push(this.milestone.description);
              __out.push('</p>\n    ');
            }
          
            __out.push('\n    <div id="graph">\n        <div id="tooltip"></div>\n        <div id="svg"></div>\n    </div>\n    <div id="progress"></div>\n</div>');
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });

    
    // info.eco
    root.require.register('ghbc/src/templates/info.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            __out.push('<div class="box info">\n    <h2>GitHub Burndown Chart</h2>\n    \n    <p>Use your browser\'s location hash to specify a <strong>repo</strong>: <a href="#!/radekstepan/disposable">#!/radekstepan/disposable</a>.</p>\n    \n    <p>You can choose a specific <strong>milestone</strong> by its <em>number</em>: <a href="#!/radekstepan/disposable/1">#!/radekstepan/disposable/1</a>.</p>\n\n    <p>To get the milestone <em>number</em>, fetch all your milestones using <a href="https://developer.github.com/v3/issues/milestones/#list-milestones-for-a-repository" title="GitHub API docs">GitHub API</a>.</p>\n</div>');
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });

    
    // label.eco
    root.require.register('ghbc/src/templates/label.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            var points;
          
            points = Math.ceil(this.points);
          
            __out.push('\n');
          
            if (points > 1) {
              __out.push('\n    ');
              __out.push(points);
              __out.push(' points left\n');
            } else {
              __out.push('\n    ');
              if (points === 1) {
                __out.push('\n        1 point left\n    ');
              } else {
                __out.push('\n        Done\n    ');
              }
              __out.push('\n');
            }
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });

    
    // loading.eco
    root.require.register('ghbc/src/templates/loading.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            __out.push('<div class="box generic">\n    <h2>GitHub Burndown Chart</h2>\n    <p>Loading <a href="#!/');
          
            __out.push(this.path);
          
            __out.push('">#!/');
          
            __out.push(this.path);
          
            __out.push('</a>.</p>\n</div>');
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });

    
    // progress.eco
    root.require.register('ghbc/src/templates/progress.js', function(exports, require, module) {
    
      module.exports = function(__obj) {
        if (!__obj) __obj = {};
        var __out = [], __capture = function(callback) {
          var out = __out, result;
          __out = [];
          callback.call(this);
          result = __out.join('');
          __out = out;
          return __safe(result);
        }, __sanitize = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else if (typeof value !== 'undefined' && value != null) {
            return __escape(value);
          } else {
            return '';
          }
        }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
        __safe = __obj.safe = function(value) {
          if (value && value.ecoSafe) {
            return value;
          } else {
            if (!(typeof value !== 'undefined' && value != null)) value = '';
            var result = new String(value);
            result.ecoSafe = true;
            return result;
          }
        };
        if (!__escape) {
          __escape = __obj.escape = function(value) {
            return ('' + value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };
        }
        (function() {
          (function() {
            __out.push('<div class="bars">\n    ');
          
            if (this.progress === 100) {
              __out.push('\n        <div class="closed done" style="width:100%"></div>\n    ');
            } else {
              __out.push('\n        <div class="closed" style="width:');
              __out.push(__sanitize(this.progress));
              __out.push('%"></div>\n    ');
            }
          
            __out.push('\n    <div class="opened"></div>\n</div>\n<h2 class="closed">Closed / ');
          
            __out.push(__sanitize(Math.floor(this.progress)));
          
            __out.push('%</h2>\n<h2 class="opened">Open / ');
          
            __out.push(__sanitize(100 - Math.floor(this.progress)));
          
            __out.push('%</h2>');
          
          }).call(this);
          
        }).call(__obj);
        __obj.safe = __objSafe, __obj.escape = __escape;
        return __out.join('');
      }
    });
  })();

  // Return the main app.
  var main = root.require("ghbc/src/app.js");

  // AMD/RequireJS.
  if (typeof define !== 'undefined' && define.amd) {
  
    define("ghbc", [ /* load deps ahead of time */ ], function () {
      return main;
    });
  
    define("ghb", [ /* load deps ahead of time */ ], function () {
      return main;
    });
  
    define("github-burndown-chart", [ /* load deps ahead of time */ ], function () {
      return main;
    });
  
  }

  // CommonJS.
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = main;
  }

  // Globally exported.
  else {
  
    root["ghbc"] = main;
  
    root["ghb"] = main;
  
    root["github-burndown-chart"] = main;
  
  }

  // Alias our app.
  
  root.require.alias("ghbc/src/app.js", "ghbc/index.js");
  
  root.require.alias("ghbc/src/app.js", "ghb/index.js");
  
  root.require.alias("ghbc/src/app.js", "github-burndown-chart/index.js");
  
})();