// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App, Header, el, mediator, route, router;
      
      mediator = require('./modules/mediator');
      
      Header = require('./components/header');
      
      el = '#page';
      
      route = function(page, req, evt) {
        var Page;
        document.title = 'BurnChart: GitHub Burndown Chart as a Service';
        Page = require("./pages/" + page);
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

    // addProjectForm.coffee
    root.require.register('burnchart/src/components/addProjectForm.js', function(exports, require, module) {
    
      var firebase, github, mediator, user;
      
      firebase = require('../modules/firebase');
      
      user = require('../modules/user');
      
      mediator = require('../modules/mediator');
      
      github = require('../modules/github');
      
      module.exports = Ractive.extend({
        'template': require('../templates/addProjectForm'),
        'data': {
          'user': user,
          'value': null
        },
        'adapt': [Ractive.adaptors.Ractive],
        init: function() {
          var autocomplete;
          autocomplete = function(value) {
            return console.log('Autocomplete', value);
          };
          this.observe('value', _.debounce(autocomplete, 200), {
            'init': false
          });
          return this.on('submit', function() {
            var repo, reponame, username, _ref;
            _ref = this.get('value').split('/'), username = _ref[0], reponame = _ref[1];
            repo = github.getRepo(username, reponame);
            return repo.show(function(err, repo, xhr) {
              if (err) {
                throw err;
              }
              return window.location.hash = '#';
            });
          });
        }
      });
      
    });

    // header.coffee
    root.require.register('burnchart/src/components/header.js', function(exports, require, module) {
    
      var firebase, mediator, user;
      
      firebase = require('../modules/firebase');
      
      user = require('../modules/user');
      
      mediator = require('../modules/mediator');
      
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

    // config.json
    root.require.register('burnchart/src/models/config.js', function(exports, require, module) {
    
      module.exports = {
          "firebase": "burnchart",
          "provider": "github"
      };
    });

    // firebase.coffee
    root.require.register('burnchart/src/modules/firebase.js', function(exports, require, module) {
    
      var FB, authCb, config, user;
      
      config = require('../models/config');
      
      user = require('./user');
      
      authCb = function() {};
      
      FB = (function() {
        function FB() {
          this.client = new Firebase("https://" + config.firebase + ".firebaseio.com");
          this.auth = new FirebaseSimpleLogin(this.client, function(err, obj) {
            if (err || !obj) {
              return authCb(err);
            }
            return user.set(obj);
          });
        }
      
        FB.prototype.login = function(cb) {
          if (!this.client) {
            return cb('Client is not setup');
          }
          authCb = cb;
          return this.auth.login(config.provider, {
            'rememberMe': true,
            'scope': 'public_repo'
          });
        };
      
        FB.prototype.logout = function() {
          var _ref;
          if ((_ref = this.auth) != null) {
            _ref.logout;
          }
          return user.reset();
        };
      
        return FB;
      
      })();
      
      module.exports = new FB();
      
    });

    // github.coffee
    root.require.register('burnchart/src/modules/github.js', function(exports, require, module) {
    
      var auth, github, setToken, user;
      
      user = require('./user');
      
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

    // user.coffee
    root.require.register('burnchart/src/modules/user.js', function(exports, require, module) {
    
      module.exports = new Ractive();
      
    });

    // addProject.coffee
    root.require.register('burnchart/src/pages/addProject.js', function(exports, require, module) {
    
      var AddProjectForm;
      
      AddProjectForm = require('../components/addProjectForm');
      
      module.exports = Ractive.extend({
        'template': require('../templates/pages/addProject'),
        'components': {
          AddProjectForm: AddProjectForm
        },
        init: function() {
          return console.log('Add a project page');
        }
      });
      
    });

    // index.coffee
    root.require.register('burnchart/src/pages/index.js', function(exports, require, module) {
    
      module.exports = Ractive.extend({
        'template': require('../templates/pages/index'),
        init: function() {
          return console.log('Index page');
        }
      });
      
    });

    // addProjectForm.mustache
    root.require.register('burnchart/src/templates/addProjectForm.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"add\">","    <div class=\"header\">","        <h2>Add a Project</h2>","        <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","    </div>","","    <div class=\"form\">","        <table>","            <tr>","                <td>","                    <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\" value=\"{{value}}\">","                </td>","                <td>","                    <a on-click=\"submit\">Add</a>","                </td>","            </tr>","        </table>","    </div>","</div>"].join("\n");
    });

    // header.mustache
    root.require.register('burnchart/src/templates/header.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","    <div class=\"right\">","        {{#user.displayName}}","            {{user.displayName}} logged in","        {{else}}","            <a class=\"github\" on-click=\"!login\"><span class=\"icon github\"></span> Sign In</a>","        {{/user.displayName}}","    </div>","","    <h1><span class=\"icon fire-station\"></span></h1>","","    <div class=\"q\">","        <span class=\"icon search\"></span>","        <span class=\"icon down-open\"></span>","        <input type=\"text\" placeholder=\"Jump to...\">","    </div>","","    <ul>","        <li><a href=\"#project/add\" class=\"add\"><span class=\"icon plus-circled\"></span> Add a Project</a></li>","        <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    </ul>","</div>"].join("\n");
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<Header/>","","<div id=\"page\">","    <!-- content loaded from a router -->","</div>","","<div id=\"footer\">","    <div class=\"wrap\">","        &copy; 2012-2014 Radek Stepan","    </div>","</div>"].join("\n");
    });

    // addProject.mustache
    root.require.register('burnchart/src/templates/pages/addProject.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"content\" class=\"wrap\">","    <AddProjectForm/>","</div>"].join("\n");
    });

    // index.mustache
    root.require.register('burnchart/src/templates/pages/index.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"title\">","    <div class=\"wrap\">","        <h2>Disposable Project</h2>","        <span class=\"milestone\">Milestone 1.0</span>","        <p class=\"description\">The one where we deliver all that we promised.</p>","    </div>","</div>","","<div id=\"content\" class=\"wrap\">","    <div id=\"hero\">","        <div class=\"content\">","            <span class=\"icon address\"></span>","            <h2>See your project progress</h2>","            <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","            <div class=\"cta\">","                <a href=\"#project/add\" class=\"primary\"><span class=\"icon plus-circled\"></span> Add your project</a>","                <a href=\"#\" class=\"secondary\">Read the Guide</a>","            </div>","        </div>","    </div>","","    <div id=\"repos\">","        <div class=\"header\">","            <a href=\"#\" class=\"sort\"><span class=\"icon sort-alphabet\"></span> Sorted by priority</a>","            <h2>Projects</h2>","        </div>","","        <table>","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","                <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">40%</span>","                        <span class=\"due\">due on Friday</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:40%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr class=\"done\">","                <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","                <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">100%</span>","                        <span class=\"due\">due tomorrow</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar green\" style=\"width:100%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","                <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">27%</span>","                        <span class=\"due\">due in 2 weeks</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:27%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","                <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">90%</span>","                        <span class=\"due red\">overdue by a month</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:90%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","        </table>","","        <div class=\"footer\">","            <a href=\"#\"><span class=\"icon cog\"></span> Edit</a>","        </div>","    </div>","</div>"].join("\n");
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