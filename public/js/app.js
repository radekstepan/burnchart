// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App, Header, el, key, mediator, route, router, _i, _len, _ref;
      
      _ref = ['utils/mixins', 'models/projects'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        require("./" + key);
      }
      
      Header = require('./views/header');
      
      mediator = require('./modules/mediator');
      
      el = '#page';
      
      route = function(page, req, evt) {
        var Page;
        document.title = 'BurnChart: GitHub Burndown Chart as a Service';
        Page = require("./views/pages/" + page);
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
        }
      };
      
      App = Ractive.extend({
        'template': require('./templates/layout'),
        'components': {
          Header: Header
        },
        init: function() {
          return Grapnel.listen(router);
        }
      });
      
      module.exports = new App();
      
    });

    // config.json
    root.require.register('burnchart/src/models/config.js', function(exports, require, module) {
    
      module.exports = {
          "firebase": "burnchart",
          "provider": "github",
          "fields": {
              "milestone": [
                  "closed_issues",
                  "created_at",
                  "description",
                  "due_on",
                  "number",
                  "open_issues",
                  "title",
                  "updated_at"
              ]
          }
      };
    });

    // projects.coffee
    root.require.register('burnchart/src/models/projects.js', function(exports, require, module) {
    
      var Model, config, date, mediator, request, user;
      
      mediator = require('../modules/mediator');
      
      request = require('../modules/request');
      
      Model = require('../utils/model');
      
      date = require('../utils/date');
      
      config = require('./config');
      
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
              milestones = _.pluckMany(res, config.fields.milestone);
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

    // firebase.coffee
    root.require.register('burnchart/src/modules/firebase.js', function(exports, require, module) {
    
      var Class, config, user;
      
      config = require('../models/config');
      
      user = require('../models/user');
      
      Class = (function() {
        function Class() {
          var _this = this;
          this.client = new Firebase("https://" + config.firebase + ".firebaseio.com");
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
          return this.auth.login(config.provider, {
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

    // mediator.coffee
    root.require.register('burnchart/src/modules/mediator.js', function(exports, require, module) {
    
      module.exports = new Ractive();
      
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
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.owner + "/" + repo.name,
            'headers': headers(user.get('token'))
          }, defaults.github);
          return request(data, cb);
        },
        'allMilestones': function(repo, cb) {
          var data;
          data = _.defaults({
            'protocol': repo.protocol,
            'host': repo.host,
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
          return request({
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.owner + "/" + repo.name + "/milestones/" + number,
            'query': {
              'state': 'open',
              'sort': 'due_date',
              'direction': 'asc'
            },
            'headers': headers(user.get('token'))
          }, cb);
        },
        'allIssues': function(repo, query, cb) {
          return request({
            'protocol': repo.protocol,
            'host': repo.host,
            'path': "/repos/" + repo.owner + "/" + repo.name + "/issues",
            'query': _.extend(query, {
              'per_page': '100'
            }),
            'headers': headers(user.get('token'))
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

    // header.mustache
    root.require.register('burnchart/src/templates/header.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","    <div class=\"right\">","        {{#user.displayName}}","            {{user.displayName}} logged in","        {{else}}","            <a class=\"github\" on-click=\"!login\"><span class=\"icon github\"></span> Sign In</a>","        {{/user.displayName}}","    </div>","","    <h1><span class=\"icon fire-station\"></span></h1>","","    <div class=\"q\">","        <span class=\"icon search\"></span>","        <span class=\"icon down-open\"></span>","        <input type=\"text\" placeholder=\"Jump to...\">","    </div>","","    <ul>","        <li><a href=\"#project/add\" class=\"add\"><span class=\"icon plus-circled\"></span> Add a Project</a></li>","        <li><a href=\"#\" class=\"faq\">FAQ</a></li>","        <li><a href=\"#reset\">DB Reset</a></li>","    </ul>","</div>"].join("\n");
    });

    // hero.mustache
    root.require.register('burnchart/src/templates/hero.js', function(exports, require, module) {
    
      module.exports = ["{{^projects.list}}","    <div id=\"hero\">","        <div class=\"content\">","            <span class=\"icon address\"></span>","            <h2>See your project progress</h2>","            <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","            <div class=\"cta\">","                <a href=\"#project/add\" class=\"primary\"><span class=\"icon plus-circled\"></span> Add your project</a>","                <a href=\"#\" class=\"secondary\">Read the Guide</a>","            </div>","        </div>","    </div>","{{/projects.list}}"].join("\n");
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<Header/>","","<div id=\"page\">","    <!-- content loaded from a router -->","</div>","","<div id=\"footer\">","    <div class=\"wrap\">","        &copy; 2012-2014 <a href=\"http://cloudfi.re\">Cloudfire Systems</a>","    </div>","</div>"].join("\n");
    });

    // addProject.mustache
    root.require.register('burnchart/src/templates/pages/addProject.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","    <div id=\"add\">","        <div class=\"header\">","            <h2>Add a Project</h2>","            <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","        </div>","","        <div class=\"form\">","            <table>","                <tr>","                    <td>","                        <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\" value=\"{{value}}\">","                    </td>","                    <td>","                        <a on-click=\"submit\">Add</a>","                    </td>","                </tr>","            </table>","        </div>","    </div>","</div>"].join("\n");
    });

    // index.mustache
    root.require.register('burnchart/src/templates/pages/index.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"title\">","    <div class=\"wrap\">","        <h2>Disposable Project</h2>","        <span class=\"milestone\">Milestone 1.0</span>","        <p class=\"description\">The one where we deliver all that we promised.</p>","    </div>","</div>","","<div id=\"content\" class=\"wrap\">","    <Hero/>","    <Projects/>","</div>"].join("\n");
    });

    // showChart.mustache
    root.require.register('burnchart/src/templates/pages/showChart.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","    <div id=\"chart\">","        <div id=\"tooltip\"></div>","        <div id=\"svg\"></div>","    </div>","</div>"].join("\n");
    });

    // projects.mustache
    root.require.register('burnchart/src/templates/projects.js', function(exports, require, module) {
    
      module.exports = ["{{#projects.list.length}}","    <div id=\"projects\">","        <div class=\"header\">","            <a href=\"#\" class=\"sort\"><span class=\"icon sort-alphabet\"></span> Sorted by priority</a>","            <h2>Projects</h2>","        </div>","","        <table>","            {{#projects.list}}","                {{#milestones}}","                    <tr>","                        <td><a class=\"repo\">{{owner}}/{{name}}</a></td>","                            <td>","                                <a class=\"milestone\" href=\"#chart/{{owner}}/{{name}}/{{number}}\">{{ title }}</a>","                            </td>","                            <td>","                                <div class=\"progress\">","                                    <span class=\"percent\">{{Math.floor(format.progress(closed_issues, open_issues))}}%</span>","                                    <span class=\"due\">due {{format.fromNow(due_on)}}</span>","                                    <div class=\"outer bar\">","                                        <div class=\"inner bar {{format.onTime(this)}}\" style=\"width:{{format.progress(closed_issues, open_issues)}}%\"></div>","                                    </div>","                                </div>","                            </td>","                    </tr>","                {{/milestones}}","            {{/projects.list}}","","        <!--","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","                <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">40%</span>","                        <span class=\"due\">due on Friday</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:40%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr class=\"done\">","                <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","                <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">100%</span>","                        <span class=\"due\">due tomorrow</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar green\" style=\"width:100%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","                <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">27%</span>","                        <span class=\"due\">due in 2 weeks</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:27%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","                <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">90%</span>","                        <span class=\"due red\">overdue by a month</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:90%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","        -->","        </table>","","        <div class=\"footer\">","            <a href=\"#\"><span class=\"icon cog\"></span> Edit</a>","        </div>","    </div>","{{/projects.list}}"].join("\n");
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
    
      module.exports = {
        'progress': _.memoize(function(a, b) {
          return 100 * (a / (b + a));
        }),
        'onTime': _.memoize(function(milestone) {
          var a, b, c, points, time;
          points = this.progress(milestone.closed_issues, milestone.open_issues);
          a = +new Date(milestone.created_at);
          b = +(new Date);
          c = +new Date(milestone.due_on);
          time = this.progress(b - a, c - b);
          return ['red', 'green'][+(points > time)];
        }),
        'fromNow': _.memoize(function(jsonDate) {
          return moment(new Date(jsonDate)).fromNow();
        })
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
    
      var firebase, mediator, user;
      
      firebase = require('../modules/firebase');
      
      mediator = require('../modules/mediator');
      
      user = require('../models/user');
      
      module.exports = Ractive.extend({
        'template': require('../templates/header'),
        init: function() {
          return this.on('!login', function() {
            return firebase.login(function(err) {
              if (err) {
                throw err;
              }
            });
          });
        },
        'data': {
          user: user
        },
        'adapt': [Ractive.adaptors.Ractive]
      });
      
    });

    // hero.coffee
    root.require.register('burnchart/src/views/hero.js', function(exports, require, module) {
    
      var mediator, projects;
      
      mediator = require('../modules/mediator');
      
      projects = require('../models/projects');
      
      module.exports = Ractive.extend({
        'template': require('../templates/hero'),
        'data': {
          projects: projects
        },
        'adapt': [Ractive.adaptors.Ractive]
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
        }
      });
      
    });

    // showChart.coffee
    root.require.register('burnchart/src/views/pages/showChart.js', function(exports, require, module) {
    
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/showChart'),
        'adapt': [Ractive.adaptors.Ractive],
        init: function() {
          return console.log(this.get('route'));
        }
      });
      
    });

    // projects.coffee
    root.require.register('burnchart/src/views/projects.js', function(exports, require, module) {
    
      var mediator, projects;
      
      mediator = require('../modules/mediator');
      
      projects = require('../models/projects');
      
      module.exports = Ractive.extend({
        'template': require('../templates/projects'),
        'data': {
          projects: projects
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