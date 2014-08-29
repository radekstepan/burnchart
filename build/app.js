// A standalone CommonJS loader.
(function(root) {
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
    if (!resolved) {
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

  // Do we already have require loader?
  root.require = (typeof root.require !== 'undefined') ? root.require : require;

})(this);
// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App;
      
      App = Ractive.extend({
        template: require('./templates/layout'),
        init: function() {}
      });
      
      module.exports = new App();
      
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","    <div class=\"right\">","        <a href=\"#\" class=\"github\"><span class=\"icon github\"></span> Sign In</a>","    </div>","","    <h1><span class=\"icon fire-station\"></span></h1>","","    <div class=\"search\">","        <span class=\"icon search\"></span>","        <input type=\"text\" placeholder=\"Jump to...\">","    </div>","","    <ul>","        <li><a href=\"#\" class=\"add\"><span class=\"icon plus-circled\"></span> Add a Project</a></li>","        <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    </ul>","</div>","","<div id=\"title\">","    <div class=\"wrap\">","        <h2>Disposable Project</h2>","        <span class=\"milestone\">Milestone 1.0</span>","        <p class=\"description\">The one where we deliver all that we promised.</p>","    </div>","</div>","","<div id=\"content\" class=\"wrap\">","    <div id=\"hero\">","        <div class=\"content\">","            <span class=\"icon address\"></span>","            <h2>See your project progress</h2>","            <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","            <div class=\"cta\">","                <a href=\"#\"><span class=\"icon plus-circled\"></span> Add your project</a>","            </div>","        </div>","    </div>","","    <div id=\"repos\">","        <div class=\"header\">","            <a href=\"#\" class=\"sort\"><span class=\"icon sort-alphabet\"></span> Sorted by priority</a>","            <h2>Projects</h2>","        </div>","","        <table>","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","                <td><span class=\"milestone\">1.0</a></td>","                <td><span class=\"status\">due in 5 days on track</span></td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","                <td><span class=\"milestone\">MVP</a></td>","                <td><span class=\"status\">due today</span></td>","            </tr>","        </table>","","        <div class=\"footer\">","            <a href=\"#\"><span class=\"icon cog\"></span> Edit</a>","        </div>","    </div>","</div>","","<div id=\"footer\">","    <div class=\"wrap\">","        &copy; 2012-2014 Radek Stepan","    </div>","</div>"].join("\n");
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