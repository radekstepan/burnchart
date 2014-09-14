// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App, Header, el, key, route, router, _i, _len, _ref;
      
      _ref = ['projects'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        require("./models/" + key);
      }
      
      Header = require('./views/header');
      
      el = '#page';
      
      route = function(page, req, evt) {
        var Page;
        document.title = 'BurnChart: GitHub Burndown Chart as a Service';
        Page = require("./views/pages/" + page);
        return new Page({
          el: el
        });
      };
      
      router = {
        '': _.partial(route, 'index'),
        'project/add': _.partial(route, 'addProject')
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
          "provider": "github"
      };
    });

    // projects.coffee
    root.require.register('burnchart/src/models/projects.js', function(exports, require, module) {
    
      var Model, mediator, user;
      
      mediator = require('../modules/mediator');
      
      Model = require('../utils/model');
      
      user = require('./user');
      
      module.exports = new Model({
        'data': {
          'items': []
        },
        init: function() {
          var _this = this;
          localforage.getItem('projects', function(items) {
            if (items == null) {
              items = [];
            }
            return _this.set('items', items);
          });
          this.observe('items', function() {
            return localforage.setItem('projects', this.get('items'));
          });
          return mediator.on('!projects/add', function(repo) {
            return _this.push('items', {
              'owner': repo.owner.login,
              'name': repo.name
            });
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
          'uid': "local:0"
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

    // github.coffee
    root.require.register('burnchart/src/modules/github.js', function(exports, require, module) {
    
      var auth, github, setToken, user;
      
      user = require('../models/user');
      
      auth = 'oauth';
      
      github = null;
      
      (setToken = function(token) {
        return github = new Github({
          token: token,
          auth: auth
        });
      })(null);
      
      user.observe('accessToken', setToken);
      
      module.exports = github;
      
    });

    // mediator.coffee
    root.require.register('burnchart/src/modules/mediator.js', function(exports, require, module) {
    
      module.exports = new Ractive();
      
    });

    // header.mustache
    root.require.register('burnchart/src/templates/header.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","    <div class=\"right\">","        {{#user.displayName}}","            {{user.displayName}} logged in","        {{else}}","            <a class=\"github\" on-click=\"!login\"><span class=\"icon github\"></span> Sign In</a>","        {{/user.displayName}}","    </div>","","    <h1><span class=\"icon fire-station\"></span></h1>","","    <div class=\"q\">","        <span class=\"icon search\"></span>","        <span class=\"icon down-open\"></span>","        <input type=\"text\" placeholder=\"Jump to...\">","    </div>","","    <ul>","        <li><a href=\"#project/add\" class=\"add\"><span class=\"icon plus-circled\"></span> Add a Project</a></li>","        <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    </ul>","</div>"].join("\n");
    });

    // hero.mustache
    root.require.register('burnchart/src/templates/hero.js', function(exports, require, module) {
    
      module.exports = ["{{^projects.items}}","    <div id=\"hero\">","        <div class=\"content\">","            <span class=\"icon address\"></span>","            <h2>See your project progress</h2>","            <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","            <div class=\"cta\">","                <a href=\"#project/add\" class=\"primary\"><span class=\"icon plus-circled\"></span> Add your project</a>","                <a href=\"#\" class=\"secondary\">Read the Guide</a>","            </div>","        </div>","    </div>","{{/projects.items}}"].join("\n");
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<Header/>","","<div id=\"page\">","    <!-- content loaded from a router -->","</div>","","<div id=\"footer\">","    <div class=\"wrap\">","        &copy; 2012-2014 Radek Stepan","    </div>","</div>"].join("\n");
    });

    // addProject.mustache
    root.require.register('burnchart/src/templates/pages/addProject.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","    <div id=\"add\">","        <div class=\"header\">","            <h2>Add a Project</h2>","            <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","        </div>","","        <div class=\"form\">","            <table>","                <tr>","                    <td>","                        <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\" value=\"{{value}}\">","                    </td>","                    <td>","                        <a on-click=\"submit\">Add</a>","                    </td>","                </tr>","            </table>","        </div>","    </div>","</div>"].join("\n");
    });

    // index.mustache
    root.require.register('burnchart/src/templates/pages/index.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"title\">","    <div class=\"wrap\">","        <h2>Disposable Project</h2>","        <span class=\"milestone\">Milestone 1.0</span>","        <p class=\"description\">The one where we deliver all that we promised.</p>","    </div>","</div>","","<div id=\"content\" class=\"wrap\">","    <Hero/>","    <Projects/>","</div>"].join("\n");
    });

    // projects.mustache
    root.require.register('burnchart/src/templates/projects.js', function(exports, require, module) {
    
      module.exports = ["{{#projects.items}}","    <div id=\"projects\">","        <div class=\"header\">","            <a href=\"#\" class=\"sort\"><span class=\"icon sort-alphabet\"></span> Sorted by priority</a>","            <h2>Projects</h2>","        </div>","","        <table>","            {{#projects.items}}","                <tr>","                    <td><a class=\"repo\" href=\"#\">{{owner}}/{{name}}</a></td>","                    <td><span class=\"milestone\">??? <span class=\"icon down-open\"></span></a></td>","                    <td>","                        <div class=\"progress\">","                            <span class=\"percent\">10%</span>","                            <span class=\"due\">???</span>","                            <div class=\"outer bar\">","                                <div class=\"inner bar green\" style=\"width:10%\"></div>","                            </div>","                        </div>","                    </td>","                </tr>","            {{/projects.items}}","","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","                <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">40%</span>","                        <span class=\"due\">due on Friday</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:40%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr class=\"done\">","                <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","                <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">100%</span>","                        <span class=\"due\">due tomorrow</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar green\" style=\"width:100%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","                <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">27%</span>","                        <span class=\"due\">due in 2 weeks</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:27%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","                <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">90%</span>","                        <span class=\"due red\">overdue by a month</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:90%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","        </table>","","        <div class=\"footer\">","            <a href=\"#\"><span class=\"icon cog\"></span> Edit</a>","        </div>","    </div>","{{/projects.items}}"].join("\n");
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
    
      var github, mediator, user;
      
      mediator = require('../../modules/mediator');
      
      github = require('../../modules/github');
      
      user = require('../../models/user');
      
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/addProject'),
        'data': {
          'value': null,
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
            var name, owner, repo, _ref;
            _ref = this.get('value').split('/'), owner = _ref[0], name = _ref[1];
            repo = github.getRepo(owner, name);
            return repo.show(function(err, repo, xhr) {
              if (err) {
                throw err;
              }
              mediator.fire('!projects/add', repo);
              return window.location.hash = '#';
            });
          });
        }
      });
      
    });

    // index.coffee
    root.require.register('burnchart/src/views/pages/index.js', function(exports, require, module) {
    
      var Hero, Projects;
      
      Hero = require('../hero');
      
      Projects = require('../projects');
      
      module.exports = Ractive.extend({
        'template': require('../../templates/pages/index'),
        'components': {
          Hero: Hero,
          Projects: Projects
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