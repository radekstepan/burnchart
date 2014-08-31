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

})(this);;/**
 * @license
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setImmediate', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria;

    // ensure a stable sort in V8 and other engines
    // http://code.google.com/p/v8/issues/detail?id=90
    if (ac !== bc) {
      if (ac > bc || typeof ac == 'undefined') {
        return 1;
      }
      if (ac < bc || typeof bc == 'undefined') {
        return -1;
      }
    }
    // The JS engine embedded in Adobe applications like InDesign has a buggy
    // `Array#sort` implementation that causes it, under certain circumstances,
    // to return the same value for `a` and `b`.
    // See https://github.com/jashkenas/underscore/pull/1247
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        now = reNative.test(now = Date.now) && now || function() { return +new Date; },
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice;

    /** Used to detect `setImmediate` in Node.js */
    var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
      !reNative.test(setImmediate) && setImmediate;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = reNative.test(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = reNative.test(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !reNative.test(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          var args = partialArgs.slice();
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = partialArgs.slice();
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        length = a.length;
        size = b.length;

        // compare lengths to determine if a deep comparison is necessary
        result = size == a.length;
        if (!result && !isWhere) {
          return result;
        }
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (isWhere) {
            while (index--) {
              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
        return result;
      }
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
        }
      });

      if (result && !isWhere) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        if (cache) {
          indexOf = cacheIndexOf;
          seen = cache;
        } else {
          isLarge = false;
          seen = callback ? seen : (releaseArray(seen), result);
        }
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        bindData = bindData.slice();

        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          push.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified object `property` exists and is a direct property,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to check.
     * @param {string} property The property to check for.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, property) {
      return object ? hasOwnProperty.call(object, property) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     *  _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }

      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its elements
     * through a callback, with each callback execution potentially mutating
     * the `accumulator` object. The callback is bound to `thisArg` and invoked
     * with four arguments; (accumulator, value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    function pluck(collection, property) {
      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = collection[index][property];
        }
      }
      return result || map(collection, property);
    }

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 5
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * // using "_.pluck" callback shorthand
     * _.sortBy(['banana', 'strawberry', 'apple'], 'length');
     * // => ['apple', 'banana', 'strawberry']
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      callback = lodash.createCallback(callback, thisArg, 3);
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        object.criteria = callback(value, key, collection);
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} properties The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of composite values.
     * @example
     *
     * _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
     * // => [1, 2]
     */
    function intersection(array) {
      var args = arguments,
          argsLength = args.length,
          argsIndex = -1,
          caches = getArray(),
          index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [],
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = args[argsIndex];
        caches[argsIndex] = indexOf === baseIndexOf &&
          (value ? value.length : 0) >= largeArraySize &&
          createCache(argsIndex ? args[argsIndex] : seen);
      }
      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of composite values.
     * @example
     *
     * _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
     * // => [1, 2, 3, 101, 10]
     */
    function union(array) {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *  'label': 'docs',
     *  'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return function(object) {
          return object[func];
        };
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function() { console.log('deferred'); });
     * // returns from the function before 'deferred' is logged
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }
    // use `setImmediate` if available in Node.js
    if (setImmediate) {
      defer = function(func) {
        if (!isFunction(func)) {
          throw new TypeError;
        }
        return setImmediate.apply(context, arguments);
      };
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * var log = _.bind(console.log, console);
     * _.delay(log, 1000, 'logged later');
     * // => 'logged later' (Appears after one second.)
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the `lodash` function and
     * chainable wrapper.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object of function properties to add to `lodash`.
     * @param {Object} object The object of function properties to add to `lodash`.
     * @example
     *
     * _.mixin({
     *   'capitalize': function(string) {
     *     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     *   }
     * });
     *
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source) {
      var ctor = object,
          isFunc = !source || isFunction(ctor);

      if (!source) {
        ctor = lodashWrapper;
        source = object;
        object = lodash;
      }
      forEach(functions(source), function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (value && typeof value == 'object' && value === result) {
              return this;
            }
            result = new ctor(result);
            result.__chain__ = this.__chain__;
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of `property` on `object`. If `property` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} property The property to get the value of.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, property) {
      if (object) {
        var value = object[property];
        return isFunction(value) ? object[property]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% $.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { '$': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value()
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    forOwn(lodash, function(func, methodName) {
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName] = function() {
          var args = [this.__wrapped__],
              chainAll = this.__chain__;

          push.apply(args, arguments);
          var result = func.apply(lodash, args);
          return chainAll
            ? new lodashWrapper(result, chainAll)
            : result;
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.3.0';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash was injected by a third-party script and not intended to be
    // loaded as a module. The global assignment can be reverted in the Lo-Dash
    // module by its `noConflict()` method.
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));
;/*
	ractive.js v0.5.5
	2014-07-13 - commit 8b1d34ef 

	http://ractivejs.org
	http://twitter.com/RactiveJS

	Released under the MIT License.
*/

( function( global ) {

	'use strict';

	var noConflict = global.Ractive;

	/* config/defaults/options.js */
	var options = function() {

		// These are both the values for Ractive.defaults
		// as well as the determination for whether an option
		// value will be placed on Component.defaults
		// (versus directly on Component) during an extend operation
		var defaultOptions = {
			// render placement:
			el: void 0,
			append: false,
			// template:
			template: {
				v: 1,
				t: []
			},
			// parse:
			preserveWhitespace: false,
			sanitize: false,
			stripComments: true,
			// data & binding:
			data: {},
			computed: {},
			magic: false,
			modifyArrays: true,
			adapt: [],
			isolated: false,
			twoway: true,
			lazy: false,
			// transitions:
			noIntro: false,
			transitionsEnabled: true,
			complete: void 0,
			// css:
			noCssTransform: false,
			// debug:
			debug: false
		};
		return defaultOptions;
	}();

	/* config/defaults/easing.js */
	var easing = {
		linear: function( pos ) {
			return pos;
		},
		easeIn: function( pos ) {
			return Math.pow( pos, 3 );
		},
		easeOut: function( pos ) {
			return Math.pow( pos - 1, 3 ) + 1;
		},
		easeInOut: function( pos ) {
			if ( ( pos /= 0.5 ) < 1 ) {
				return 0.5 * Math.pow( pos, 3 );
			}
			return 0.5 * ( Math.pow( pos - 2, 3 ) + 2 );
		}
	};

	/* circular.js */
	var circular = [];

	/* utils/hasOwnProperty.js */
	var hasOwn = Object.prototype.hasOwnProperty;

	/* utils/isArray.js */
	var isArray = function() {

		var toString = Object.prototype.toString;
		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		return function( thing ) {
			return toString.call( thing ) === '[object Array]';
		};
	}();

	/* utils/isObject.js */
	var isObject = function() {

		var toString = Object.prototype.toString;
		return function( thing ) {
			return thing && toString.call( thing ) === '[object Object]';
		};
	}();

	/* utils/isNumeric.js */
	var isNumeric = function( thing ) {
		return !isNaN( parseFloat( thing ) ) && isFinite( thing );
	};

	/* config/defaults/interpolators.js */
	var interpolators = function( circular, hasOwnProperty, isArray, isObject, isNumeric ) {

		var interpolators, interpolate, cssLengthPattern;
		circular.push( function() {
			interpolate = circular.interpolate;
		} );
		cssLengthPattern = /^([+-]?[0-9]+\.?(?:[0-9]+)?)(px|em|ex|%|in|cm|mm|pt|pc)$/;
		interpolators = {
			number: function( from, to ) {
				var delta;
				if ( !isNumeric( from ) || !isNumeric( to ) ) {
					return null;
				}
				from = +from;
				to = +to;
				delta = to - from;
				if ( !delta ) {
					return function() {
						return from;
					};
				}
				return function( t ) {
					return from + t * delta;
				};
			},
			array: function( from, to ) {
				var intermediate, interpolators, len, i;
				if ( !isArray( from ) || !isArray( to ) ) {
					return null;
				}
				intermediate = [];
				interpolators = [];
				i = len = Math.min( from.length, to.length );
				while ( i-- ) {
					interpolators[ i ] = interpolate( from[ i ], to[ i ] );
				}
				// surplus values - don't interpolate, but don't exclude them either
				for ( i = len; i < from.length; i += 1 ) {
					intermediate[ i ] = from[ i ];
				}
				for ( i = len; i < to.length; i += 1 ) {
					intermediate[ i ] = to[ i ];
				}
				return function( t ) {
					var i = len;
					while ( i-- ) {
						intermediate[ i ] = interpolators[ i ]( t );
					}
					return intermediate;
				};
			},
			object: function( from, to ) {
				var properties, len, interpolators, intermediate, prop;
				if ( !isObject( from ) || !isObject( to ) ) {
					return null;
				}
				properties = [];
				intermediate = {};
				interpolators = {};
				for ( prop in from ) {
					if ( hasOwnProperty.call( from, prop ) ) {
						if ( hasOwnProperty.call( to, prop ) ) {
							properties.push( prop );
							interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] );
						} else {
							intermediate[ prop ] = from[ prop ];
						}
					}
				}
				for ( prop in to ) {
					if ( hasOwnProperty.call( to, prop ) && !hasOwnProperty.call( from, prop ) ) {
						intermediate[ prop ] = to[ prop ];
					}
				}
				len = properties.length;
				return function( t ) {
					var i = len,
						prop;
					while ( i-- ) {
						prop = properties[ i ];
						intermediate[ prop ] = interpolators[ prop ]( t );
					}
					return intermediate;
				};
			},
			cssLength: function( from, to ) {
				var fromMatch, toMatch, fromUnit, toUnit, fromValue, toValue, unit, delta;
				if ( from !== 0 && typeof from !== 'string' || to !== 0 && typeof to !== 'string' ) {
					return null;
				}
				fromMatch = cssLengthPattern.exec( from );
				toMatch = cssLengthPattern.exec( to );
				fromUnit = fromMatch ? fromMatch[ 2 ] : '';
				toUnit = toMatch ? toMatch[ 2 ] : '';
				if ( fromUnit && toUnit && fromUnit !== toUnit ) {
					return null;
				}
				unit = fromUnit || toUnit;
				fromValue = fromMatch ? +fromMatch[ 1 ] : 0;
				toValue = toMatch ? +toMatch[ 1 ] : 0;
				delta = toValue - fromValue;
				if ( !delta ) {
					return function() {
						return fromValue + unit;
					};
				}
				return function( t ) {
					return fromValue + t * delta + unit;
				};
			}
		};
		return interpolators;
	}( circular, hasOwn, isArray, isObject, isNumeric );

	/* config/svg.js */
	var svg = function() {

		var svg;
		if ( typeof document === 'undefined' ) {
			svg = false;
		} else {
			svg = document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
		}
		return svg;
	}();

	/* utils/removeFromArray.js */
	var removeFromArray = function( array, member ) {
		var index = array.indexOf( member );
		if ( index !== -1 ) {
			array.splice( index, 1 );
		}
	};

	/* utils/Promise.js */
	var Promise = function() {

		var _Promise, PENDING = {},
			FULFILLED = {},
			REJECTED = {};
		if ( typeof Promise === 'function' ) {
			// use native Promise
			_Promise = Promise;
		} else {
			_Promise = function( callback ) {
				var fulfilledHandlers = [],
					rejectedHandlers = [],
					state = PENDING,
					result, dispatchHandlers, makeResolver, fulfil, reject, promise;
				makeResolver = function( newState ) {
					return function( value ) {
						if ( state !== PENDING ) {
							return;
						}
						result = value;
						state = newState;
						dispatchHandlers = makeDispatcher( state === FULFILLED ? fulfilledHandlers : rejectedHandlers, result );
						// dispatch onFulfilled and onRejected handlers asynchronously
						wait( dispatchHandlers );
					};
				};
				fulfil = makeResolver( FULFILLED );
				reject = makeResolver( REJECTED );
				try {
					callback( fulfil, reject );
				} catch ( err ) {
					reject( err );
				}
				promise = {
					// `then()` returns a Promise - 2.2.7
					then: function( onFulfilled, onRejected ) {
						var promise2 = new _Promise( function( fulfil, reject ) {
							var processResolutionHandler = function( handler, handlers, forward ) {
								// 2.2.1.1
								if ( typeof handler === 'function' ) {
									handlers.push( function( p1result ) {
										var x;
										try {
											x = handler( p1result );
											resolve( promise2, x, fulfil, reject );
										} catch ( err ) {
											reject( err );
										}
									} );
								} else {
									// Forward the result of promise1 to promise2, if resolution handlers
									// are not given
									handlers.push( forward );
								}
							};
							// 2.2
							processResolutionHandler( onFulfilled, fulfilledHandlers, fulfil );
							processResolutionHandler( onRejected, rejectedHandlers, reject );
							if ( state !== PENDING ) {
								// If the promise has resolved already, dispatch the appropriate handlers asynchronously
								wait( dispatchHandlers );
							}
						} );
						return promise2;
					}
				};
				promise[ 'catch' ] = function( onRejected ) {
					return this.then( null, onRejected );
				};
				return promise;
			};
			_Promise.all = function( promises ) {
				return new _Promise( function( fulfil, reject ) {
					var result = [],
						pending, i, processPromise;
					if ( !promises.length ) {
						fulfil( result );
						return;
					}
					processPromise = function( i ) {
						promises[ i ].then( function( value ) {
							result[ i ] = value;
							if ( !--pending ) {
								fulfil( result );
							}
						}, reject );
					};
					pending = i = promises.length;
					while ( i-- ) {
						processPromise( i );
					}
				} );
			};
			_Promise.resolve = function( value ) {
				return new _Promise( function( fulfil ) {
					fulfil( value );
				} );
			};
			_Promise.reject = function( reason ) {
				return new _Promise( function( fulfil, reject ) {
					reject( reason );
				} );
			};
		}
		return _Promise;
		// TODO use MutationObservers or something to simulate setImmediate
		function wait( callback ) {
			setTimeout( callback, 0 );
		}

		function makeDispatcher( handlers, result ) {
			return function() {
				var handler;
				while ( handler = handlers.shift() ) {
					handler( result );
				}
			};
		}

		function resolve( promise, x, fulfil, reject ) {
			// Promise Resolution Procedure
			var then;
			// 2.3.1
			if ( x === promise ) {
				throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
			}
			// 2.3.2
			if ( x instanceof _Promise ) {
				x.then( fulfil, reject );
			} else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
				try {
					then = x.then;
				} catch ( e ) {
					reject( e );
					// 2.3.3.2
					return;
				}
				// 2.3.3.3
				if ( typeof then === 'function' ) {
					var called, resolvePromise, rejectPromise;
					resolvePromise = function( y ) {
						if ( called ) {
							return;
						}
						called = true;
						resolve( promise, y, fulfil, reject );
					};
					rejectPromise = function( r ) {
						if ( called ) {
							return;
						}
						called = true;
						reject( r );
					};
					try {
						then.call( x, resolvePromise, rejectPromise );
					} catch ( e ) {
						if ( !called ) {
							// 2.3.3.3.4.1
							reject( e );
							// 2.3.3.3.4.2
							called = true;
							return;
						}
					}
				} else {
					fulfil( x );
				}
			} else {
				fulfil( x );
			}
		}
	}();

	/* utils/normaliseRef.js */
	var normaliseRef = function() {

		var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
		return function normaliseRef( ref ) {
			return ( ref || '' ).replace( regex, '.$1' );
		};
	}();

	/* shared/getInnerContext.js */
	var getInnerContext = function( fragment ) {
		do {
			if ( fragment.context ) {
				return fragment.context;
			}
		} while ( fragment = fragment.parent );
		return '';
	};

	/* utils/isEqual.js */
	var isEqual = function( a, b ) {
		if ( a === null && b === null ) {
			return true;
		}
		if ( typeof a === 'object' || typeof b === 'object' ) {
			return false;
		}
		return a === b;
	};

	/* shared/createComponentBinding.js */
	var createComponentBinding = function( circular, isArray, isEqual ) {

		var runloop;
		circular.push( function() {
			return runloop = circular.runloop;
		} );
		var Binding = function( ractive, keypath, otherInstance, otherKeypath, priority ) {
			this.root = ractive;
			this.keypath = keypath;
			this.priority = priority;
			this.otherInstance = otherInstance;
			this.otherKeypath = otherKeypath;
			this.bind();
			this.value = this.root.viewmodel.get( this.keypath );
		};
		Binding.prototype = {
			setValue: function( value ) {
				var this$0 = this;
				// Only *you* can prevent infinite loops
				if ( this.updating || this.counterpart && this.counterpart.updating ) {
					this.value = value;
					return;
				}
				// Is this a smart array update? If so, it'll update on its
				// own, we shouldn't do anything
				if ( isArray( value ) && value._ractive && value._ractive.setting ) {
					return;
				}
				if ( !isEqual( value, this.value ) ) {
					this.updating = true;
					// TODO maybe the case that `value === this.value` - should that result
					// in an update rather than a set?
					runloop.addViewmodel( this.otherInstance.viewmodel );
					this.otherInstance.viewmodel.set( this.otherKeypath, value );
					this.value = value;
					// TODO will the counterpart update after this line, during
					// the runloop end cycle? may be a problem...
					runloop.scheduleTask( function() {
						return this$0.updating = false;
					} );
				}
			},
			bind: function() {
				this.root.viewmodel.register( this.keypath, this );
			},
			rebind: function( newKeypath ) {
				this.unbind();
				this.keypath = newKeypath;
				this.counterpart.otherKeypath = newKeypath;
				this.bind();
			},
			unbind: function() {
				this.root.viewmodel.unregister( this.keypath, this );
			}
		};
		return function createComponentBinding( component, parentInstance, parentKeypath, childKeypath ) {
			var hash, childInstance, bindings, priority, parentToChildBinding, childToParentBinding;
			hash = parentKeypath + '=' + childKeypath;
			bindings = component.bindings;
			if ( bindings[ hash ] ) {
				// TODO does this ever happen?
				return;
			}
			bindings[ hash ] = true;
			childInstance = component.instance;
			priority = component.parentFragment.priority;
			parentToChildBinding = new Binding( parentInstance, parentKeypath, childInstance, childKeypath, priority );
			bindings.push( parentToChildBinding );
			if ( childInstance.twoway ) {
				childToParentBinding = new Binding( childInstance, childKeypath, parentInstance, parentKeypath, 1 );
				bindings.push( childToParentBinding );
				parentToChildBinding.counterpart = childToParentBinding;
				childToParentBinding.counterpart = parentToChildBinding;
			}
		};
	}( circular, isArray, isEqual );

	/* shared/resolveRef.js */
	var resolveRef = function( normaliseRef, getInnerContext, createComponentBinding ) {

		var ancestorErrorMessage, getOptions;
		ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';
		getOptions = {
			evaluateWrapped: true
		};
		return function resolveRef( ractive, ref, fragment ) {
			var context, key, index, keypath, parentValue, hasContextChain, parentKeys, childKeys, parentKeypath, childKeypath;
			ref = normaliseRef( ref );
			// If a reference begins '~/', it's a top-level reference
			if ( ref.substr( 0, 2 ) === '~/' ) {
				return ref.substring( 2 );
			}
			// If a reference begins with '.', it's either a restricted reference or
			// an ancestor reference...
			if ( ref.charAt( 0 ) === '.' ) {
				return resolveAncestorReference( getInnerContext( fragment ), ref );
			}
			// ...otherwise we need to find the keypath
			key = ref.split( '.' )[ 0 ];
			do {
				context = fragment.context;
				if ( !context ) {
					continue;
				}
				hasContextChain = true;
				parentValue = ractive.viewmodel.get( context, getOptions );
				if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
					return context + '.' + ref;
				}
			} while ( fragment = fragment.parent );
			// Root/computed property?
			if ( key in ractive.data || key in ractive.viewmodel.computations ) {
				return ref;
			}
			// If this is an inline component, and it's not isolated, we
			// can try going up the scope chain
			if ( ractive._parent && !ractive.isolated ) {
				fragment = ractive.component.parentFragment;
				// Special case - index refs
				if ( fragment.indexRefs && ( index = fragment.indexRefs[ ref ] ) !== undefined ) {
					// Create an index ref binding, so that it can be rebound letter if necessary.
					// It doesn't have an alias since it's an implicit binding, hence `...[ ref ] = ref`
					ractive.component.indexRefBindings[ ref ] = ref;
					ractive.viewmodel.set( ref, index, true );
					return;
				}
				keypath = resolveRef( ractive._parent, ref, fragment );
				if ( keypath ) {
					// We need to create an inter-component binding
					// If parent keypath is 'one.foo' and child is 'two.foo', we bind
					// 'one' to 'two' as it's more efficient and avoids edge cases
					parentKeys = keypath.split( '.' );
					childKeys = ref.split( '.' );
					while ( parentKeys.length > 1 && childKeys.length > 1 && parentKeys[ parentKeys.length - 1 ] === childKeys[ childKeys.length - 1 ] ) {
						parentKeys.pop();
						childKeys.pop();
					}
					parentKeypath = parentKeys.join( '.' );
					childKeypath = childKeys.join( '.' );
					ractive.viewmodel.set( childKeypath, ractive._parent.viewmodel.get( parentKeypath ), true );
					createComponentBinding( ractive.component, ractive._parent, parentKeypath, childKeypath );
					return ref;
				}
			}
			// If there's no context chain, and the instance is either a) isolated or
			// b) an orphan, then we know that the keypath is identical to the reference
			if ( !hasContextChain ) {
				return ref;
			}
			if ( ractive.viewmodel.get( ref ) !== undefined ) {
				return ref;
			}
		};

		function resolveAncestorReference( baseContext, ref ) {
			var contextKeys;
			// {{.}} means 'current context'
			if ( ref === '.' )
				return baseContext;
			contextKeys = baseContext ? baseContext.split( '.' ) : [];
			// ancestor references (starting "../") go up the tree
			if ( ref.substr( 0, 3 ) === '../' ) {
				while ( ref.substr( 0, 3 ) === '../' ) {
					if ( !contextKeys.length ) {
						throw new Error( ancestorErrorMessage );
					}
					contextKeys.pop();
					ref = ref.substring( 3 );
				}
				contextKeys.push( ref );
				return contextKeys.join( '.' );
			}
			// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
			if ( !baseContext ) {
				return ref.replace( /^\.\/?/, '' );
			}
			return baseContext + ref.replace( /^\.\//, '.' );
		}
	}( normaliseRef, getInnerContext, createComponentBinding );

	/* global/TransitionManager.js */
	var TransitionManager = function( removeFromArray ) {

		var TransitionManager = function( callback, parent ) {
			this.callback = callback;
			this.parent = parent;
			this.intros = [];
			this.outros = [];
			this.children = [];
			this.totalChildren = this.outroChildren = 0;
			this.detachQueue = [];
			this.outrosComplete = false;
			if ( parent ) {
				parent.addChild( this );
			}
		};
		TransitionManager.prototype = {
			addChild: function( child ) {
				this.children.push( child );
				this.totalChildren += 1;
				this.outroChildren += 1;
			},
			decrementOutros: function() {
				this.outroChildren -= 1;
				check( this );
			},
			decrementTotal: function() {
				this.totalChildren -= 1;
				check( this );
			},
			add: function( transition ) {
				var list = transition.isIntro ? this.intros : this.outros;
				list.push( transition );
			},
			remove: function( transition ) {
				var list = transition.isIntro ? this.intros : this.outros;
				removeFromArray( list, transition );
				check( this );
			},
			init: function() {
				this.ready = true;
				check( this );
			},
			detachNodes: function() {
				this.detachQueue.forEach( detach );
				this.children.forEach( detachNodes );
			}
		};

		function detach( element ) {
			element.detach();
		}

		function detachNodes( tm ) {
			tm.detachNodes();
		}

		function check( tm ) {
			if ( !tm.ready || tm.outros.length || tm.outroChildren )
				return;
			// If all outros are complete, and we haven't already done this,
			// we notify the parent if there is one, otherwise
			// start detaching nodes
			if ( !tm.outrosComplete ) {
				if ( tm.parent ) {
					tm.parent.decrementOutros( tm );
				} else {
					tm.detachNodes();
				}
				tm.outrosComplete = true;
			}
			// Once everything is done, we can notify parent transition
			// manager and call the callback
			if ( !tm.intros.length && !tm.totalChildren ) {
				if ( typeof tm.callback === 'function' ) {
					tm.callback();
				}
				if ( tm.parent ) {
					tm.parent.decrementTotal();
				}
			}
		}
		return TransitionManager;
	}( removeFromArray );

	/* global/runloop.js */
	var runloop = function( circular, removeFromArray, Promise, resolveRef, TransitionManager ) {

		var batch, runloop, unresolved = [];
		runloop = {
			start: function( instance, returnPromise ) {
				var promise, fulfilPromise;
				if ( returnPromise ) {
					promise = new Promise( function( f ) {
						return fulfilPromise = f;
					} );
				}
				batch = {
					previousBatch: batch,
					transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
					views: [],
					tasks: [],
					viewmodels: []
				};
				if ( instance ) {
					batch.viewmodels.push( instance.viewmodel );
				}
				return promise;
			},
			end: function() {
				flushChanges();
				batch.transitionManager.init();
				batch = batch.previousBatch;
			},
			addViewmodel: function( viewmodel ) {
				if ( batch ) {
					if ( batch.viewmodels.indexOf( viewmodel ) === -1 ) {
						batch.viewmodels.push( viewmodel );
					}
				} else {
					viewmodel.applyChanges();
				}
			},
			registerTransition: function( transition ) {
				transition._manager = batch.transitionManager;
				batch.transitionManager.add( transition );
			},
			addView: function( view ) {
				batch.views.push( view );
			},
			addUnresolved: function( thing ) {
				unresolved.push( thing );
			},
			removeUnresolved: function( thing ) {
				removeFromArray( unresolved, thing );
			},
			// synchronise node detachments with transition ends
			detachWhenReady: function( thing ) {
				batch.transitionManager.detachQueue.push( thing );
			},
			scheduleTask: function( task ) {
				if ( !batch ) {
					task();
				} else {
					batch.tasks.push( task );
				}
			}
		};
		circular.runloop = runloop;
		return runloop;

		function flushChanges() {
			var i, thing, changeHash;
			for ( i = 0; i < batch.viewmodels.length; i += 1 ) {
				thing = batch.viewmodels[ i ];
				changeHash = thing.applyChanges();
				if ( changeHash ) {
					thing.ractive.fire( 'change', changeHash );
				}
			}
			batch.viewmodels.length = 0;
			attemptKeypathResolution();
			// Now that changes have been fully propagated, we can update the DOM
			// and complete other tasks
			for ( i = 0; i < batch.views.length; i += 1 ) {
				batch.views[ i ].update();
			}
			batch.views.length = 0;
			for ( i = 0; i < batch.tasks.length; i += 1 ) {
				batch.tasks[ i ]();
			}
			batch.tasks.length = 0;
			// If updating the view caused some model blowback - e.g. a triple
			// containing <option> elements caused the binding on the <select>
			// to update - then we start over
			if ( batch.viewmodels.length )
				return flushChanges();
		}

		function attemptKeypathResolution() {
			var array, thing, keypath;
			if ( !unresolved.length ) {
				return;
			}
			// see if we can resolve any unresolved references
			array = unresolved.splice( 0, unresolved.length );
			while ( thing = array.pop() ) {
				if ( thing.keypath ) {
					continue;
				}
				keypath = resolveRef( thing.root, thing.ref, thing.parentFragment );
				if ( keypath !== undefined ) {
					// If we've resolved the keypath, we can initialise this item
					thing.resolve( keypath );
				} else {
					// If we can't resolve the reference, try again next time
					unresolved.push( thing );
				}
			}
		}
	}( circular, removeFromArray, Promise, resolveRef, TransitionManager );

	/* utils/createBranch.js */
	var createBranch = function() {

		var numeric = /^\s*[0-9]+\s*$/;
		return function( key ) {
			return numeric.test( key ) ? [] : {};
		};
	}();

	/* viewmodel/prototype/get/magicAdaptor.js */
	var viewmodel$get_magicAdaptor = function( runloop, createBranch, isArray ) {

		var magicAdaptor, MagicWrapper;
		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
			magicAdaptor = {
				filter: function( object, keypath, ractive ) {
					var keys, key, parentKeypath, parentWrapper, parentValue;
					if ( !keypath ) {
						return false;
					}
					keys = keypath.split( '.' );
					key = keys.pop();
					parentKeypath = keys.join( '.' );
					// If the parent value is a wrapper, other than a magic wrapper,
					// we shouldn't wrap this property
					if ( ( parentWrapper = ractive.viewmodel.wrapped[ parentKeypath ] ) && !parentWrapper.magic ) {
						return false;
					}
					parentValue = ractive.get( parentKeypath );
					// if parentValue is an array that doesn't include this member,
					// we should return false otherwise lengths will get messed up
					if ( isArray( parentValue ) && /^[0-9]+$/.test( key ) ) {
						return false;
					}
					return parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' );
				},
				wrap: function( ractive, property, keypath ) {
					return new MagicWrapper( ractive, property, keypath );
				}
			};
			MagicWrapper = function( ractive, value, keypath ) {
				var keys, objKeypath, template, siblings;
				this.magic = true;
				this.ractive = ractive;
				this.keypath = keypath;
				this.value = value;
				keys = keypath.split( '.' );
				this.prop = keys.pop();
				objKeypath = keys.join( '.' );
				this.obj = objKeypath ? ractive.get( objKeypath ) : ractive.data;
				template = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
				// Has this property already been wrapped?
				if ( template && template.set && ( siblings = template.set._ractiveWrappers ) ) {
					// Yes. Register this wrapper to this property, if it hasn't been already
					if ( siblings.indexOf( this ) === -1 ) {
						siblings.push( this );
					}
					return;
				}
				// No, it hasn't been wrapped
				createAccessors( this, value, template );
			};
			MagicWrapper.prototype = {
				get: function() {
					return this.value;
				},
				reset: function( value ) {
					if ( this.updating ) {
						return;
					}
					this.updating = true;
					this.obj[ this.prop ] = value;
					// trigger set() accessor
					runloop.addViewmodel( this.ractive.viewmodel );
					this.ractive.viewmodel.mark( this.keypath );
					this.updating = false;
				},
				set: function( key, value ) {
					if ( this.updating ) {
						return;
					}
					if ( !this.obj[ this.prop ] ) {
						this.updating = true;
						this.obj[ this.prop ] = createBranch( key );
						this.updating = false;
					}
					this.obj[ this.prop ][ key ] = value;
				},
				teardown: function() {
					var template, set, value, wrappers, index;
					// If this method was called because the cache was being cleared as a
					// result of a set()/update() call made by this wrapper, we return false
					// so that it doesn't get torn down
					if ( this.updating ) {
						return false;
					}
					template = Object.getOwnPropertyDescriptor( this.obj, this.prop );
					set = template && template.set;
					if ( !set ) {
						// most likely, this was an array member that was spliced out
						return;
					}
					wrappers = set._ractiveWrappers;
					index = wrappers.indexOf( this );
					if ( index !== -1 ) {
						wrappers.splice( index, 1 );
					}
					// Last one out, turn off the lights
					if ( !wrappers.length ) {
						value = this.obj[ this.prop ];
						Object.defineProperty( this.obj, this.prop, this.originalDescriptor || {
							writable: true,
							enumerable: true,
							configurable: true
						} );
						this.obj[ this.prop ] = value;
					}
				}
			};
		} catch ( err ) {
			magicAdaptor = false;
		}
		return magicAdaptor;

		function createAccessors( originalWrapper, value, template ) {
			var object, property, oldGet, oldSet, get, set;
			object = originalWrapper.obj;
			property = originalWrapper.prop;
			// Is this template configurable?
			if ( template && !template.configurable ) {
				// Special case - array length
				if ( property === 'length' ) {
					return;
				}
				throw new Error( 'Cannot use magic mode with property "' + property + '" - object is not configurable' );
			}
			// Time to wrap this property
			if ( template ) {
				oldGet = template.get;
				oldSet = template.set;
			}
			get = oldGet || function() {
				return value;
			};
			set = function( v ) {
				if ( oldSet ) {
					oldSet( v );
				}
				value = oldGet ? oldGet() : v;
				set._ractiveWrappers.forEach( updateWrapper );
			};

			function updateWrapper( wrapper ) {
				var keypath, ractive;
				wrapper.value = value;
				if ( wrapper.updating ) {
					return;
				}
				ractive = wrapper.ractive;
				keypath = wrapper.keypath;
				wrapper.updating = true;
				runloop.start( ractive );
				ractive.viewmodel.mark( keypath );
				runloop.end();
				wrapper.updating = false;
			}
			// Create an array of wrappers, in case other keypaths/ractives depend on this property.
			// Handily, we can store them as a property of the set function. Yay JavaScript.
			set._ractiveWrappers = [ originalWrapper ];
			Object.defineProperty( object, property, {
				get: get,
				set: set,
				enumerable: true,
				configurable: true
			} );
		}
	}( runloop, createBranch, isArray );

	/* config/magic.js */
	var magic = function( magicAdaptor ) {

		return !!magicAdaptor;
	}( viewmodel$get_magicAdaptor );

	/* config/namespaces.js */
	var namespaces = {
		html: 'http://www.w3.org/1999/xhtml',
		mathml: 'http://www.w3.org/1998/Math/MathML',
		svg: 'http://www.w3.org/2000/svg',
		xlink: 'http://www.w3.org/1999/xlink',
		xml: 'http://www.w3.org/XML/1998/namespace',
		xmlns: 'http://www.w3.org/2000/xmlns/'
	};

	/* utils/createElement.js */
	var createElement = function( svg, namespaces ) {

		var createElement;
		// Test for SVG support
		if ( !svg ) {
			createElement = function( type, ns ) {
				if ( ns && ns !== namespaces.html ) {
					throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
				}
				return document.createElement( type );
			};
		} else {
			createElement = function( type, ns ) {
				if ( !ns || ns === namespaces.html ) {
					return document.createElement( type );
				}
				return document.createElementNS( ns, type );
			};
		}
		return createElement;
	}( svg, namespaces );

	/* config/isClient.js */
	var isClient = function() {

		var isClient = typeof document === 'object';
		return isClient;
	}();

	/* utils/defineProperty.js */
	var defineProperty = function( isClient ) {

		var defineProperty;
		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
			if ( isClient ) {
				Object.defineProperty( document.createElement( 'div' ), 'test', {
					value: 0
				} );
			}
			defineProperty = Object.defineProperty;
		} catch ( err ) {
			// Object.defineProperty doesn't exist, or we're in IE8 where you can
			// only use it with DOM objects (what the fuck were you smoking, MSFT?)
			defineProperty = function( obj, prop, desc ) {
				obj[ prop ] = desc.value;
			};
		}
		return defineProperty;
	}( isClient );

	/* utils/defineProperties.js */
	var defineProperties = function( createElement, defineProperty, isClient ) {

		var defineProperties;
		try {
			try {
				Object.defineProperties( {}, {
					test: {
						value: 0
					}
				} );
			} catch ( err ) {
				// TODO how do we account for this? noMagic = true;
				throw err;
			}
			if ( isClient ) {
				Object.defineProperties( createElement( 'div' ), {
					test: {
						value: 0
					}
				} );
			}
			defineProperties = Object.defineProperties;
		} catch ( err ) {
			defineProperties = function( obj, props ) {
				var prop;
				for ( prop in props ) {
					if ( props.hasOwnProperty( prop ) ) {
						defineProperty( obj, prop, props[ prop ] );
					}
				}
			};
		}
		return defineProperties;
	}( createElement, defineProperty, isClient );

	/* Ractive/prototype/shared/add.js */
	var Ractive$shared_add = function( isNumeric ) {

		return function add( root, keypath, d ) {
			var value;
			if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
				throw new Error( 'Bad arguments' );
			}
			value = +root.get( keypath ) || 0;
			if ( !isNumeric( value ) ) {
				throw new Error( 'Cannot add to a non-numeric value' );
			}
			return root.set( keypath, value + d );
		};
	}( isNumeric );

	/* Ractive/prototype/add.js */
	var Ractive$add = function( add ) {

		return function Ractive$add( keypath, d ) {
			return add( this, keypath, d === undefined ? 1 : +d );
		};
	}( Ractive$shared_add );

	/* utils/normaliseKeypath.js */
	var normaliseKeypath = function( normaliseRef ) {

		var leadingDot = /^\.+/;
		return function normaliseKeypath( keypath ) {
			return normaliseRef( keypath ).replace( leadingDot, '' );
		};
	}( normaliseRef );

	/* config/vendors.js */
	var vendors = [
		'o',
		'ms',
		'moz',
		'webkit'
	];

	/* utils/requestAnimationFrame.js */
	var requestAnimationFrame = function( vendors ) {

		var requestAnimationFrame;
		// If window doesn't exist, we don't need requestAnimationFrame
		if ( typeof window === 'undefined' ) {
			requestAnimationFrame = null;
		} else {
			// https://gist.github.com/paulirish/1579671
			( function( vendors, lastTime, window ) {
				var x, setTimeout;
				if ( window.requestAnimationFrame ) {
					return;
				}
				for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
					window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
				}
				if ( !window.requestAnimationFrame ) {
					setTimeout = window.setTimeout;
					window.requestAnimationFrame = function( callback ) {
						var currTime, timeToCall, id;
						currTime = Date.now();
						timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
						id = setTimeout( function() {
							callback( currTime + timeToCall );
						}, timeToCall );
						lastTime = currTime + timeToCall;
						return id;
					};
				}
			}( vendors, 0, window ) );
			requestAnimationFrame = window.requestAnimationFrame;
		}
		return requestAnimationFrame;
	}( vendors );

	/* utils/getTime.js */
	var getTime = function() {

		var getTime;
		if ( typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function' ) {
			getTime = function() {
				return window.performance.now();
			};
		} else {
			getTime = function() {
				return Date.now();
			};
		}
		return getTime;
	}();

	/* shared/animations.js */
	var animations = function( rAF, getTime, runloop ) {

		var queue = [];
		var animations = {
			tick: function() {
				var i, animation, now;
				now = getTime();
				runloop.start();
				for ( i = 0; i < queue.length; i += 1 ) {
					animation = queue[ i ];
					if ( !animation.tick( now ) ) {
						// animation is complete, remove it from the stack, and decrement i so we don't miss one
						queue.splice( i--, 1 );
					}
				}
				runloop.end();
				if ( queue.length ) {
					rAF( animations.tick );
				} else {
					animations.running = false;
				}
			},
			add: function( animation ) {
				queue.push( animation );
				if ( !animations.running ) {
					animations.running = true;
					rAF( animations.tick );
				}
			},
			// TODO optimise this
			abort: function( keypath, root ) {
				var i = queue.length,
					animation;
				while ( i-- ) {
					animation = queue[ i ];
					if ( animation.root === root && animation.keypath === keypath ) {
						animation.stop();
					}
				}
			}
		};
		return animations;
	}( requestAnimationFrame, getTime, runloop );

	/* utils/warn.js */
	var warn = function() {

		/* global console */
		var warn, warned = {};
		if ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
			warn = function( message, allowDuplicates ) {
				if ( !allowDuplicates ) {
					if ( warned[ message ] ) {
						return;
					}
					warned[ message ] = true;
				}
				console.warn( message );
			};
		} else {
			warn = function() {};
		}
		return warn;
	}();

	/* config/options/css/transform.js */
	var transform = function() {

		var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
			commentsPattern = /\/\*.*?\*\//g,
			selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~]+)?\s*[\s\+\>\~]?)\s*/g,
			mediaQueryPattern = /^@media/,
			dataRvcGuidPattern = /\[data-rvcguid="[a-z0-9-]+"]/g;
		return function transformCss( css, guid ) {
			var transformed, addGuid;
			addGuid = function( selector ) {
				var selectorUnits, match, unit, dataAttr, base, prepended, appended, i, transformed = [];
				selectorUnits = [];
				while ( match = selectorUnitPattern.exec( selector ) ) {
					selectorUnits.push( {
						str: match[ 0 ],
						base: match[ 1 ],
						modifiers: match[ 2 ]
					} );
				}
				// For each simple selector within the selector, we need to create a version
				// that a) combines with the guid, and b) is inside the guid
				dataAttr = '[data-rvcguid="' + guid + '"]';
				base = selectorUnits.map( extractString );
				i = selectorUnits.length;
				while ( i-- ) {
					appended = base.slice();
					// Pseudo-selectors should go after the attribute selector
					unit = selectorUnits[ i ];
					appended[ i ] = unit.base + dataAttr + unit.modifiers || '';
					prepended = base.slice();
					prepended[ i ] = dataAttr + ' ' + prepended[ i ];
					transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
				}
				return transformed.join( ', ' );
			};
			if ( dataRvcGuidPattern.test( css ) ) {
				transformed = css.replace( dataRvcGuidPattern, '[data-rvcguid="' + guid + '"]' );
			} else {
				transformed = css.replace( commentsPattern, '' ).replace( selectorsPattern, function( match, $1 ) {
					var selectors, transformed;
					// don't transform media queries!
					if ( mediaQueryPattern.test( $1 ) )
						return match;
					selectors = $1.split( ',' ).map( trim );
					transformed = selectors.map( addGuid ).join( ', ' ) + ' ';
					return match.replace( $1, transformed );
				} );
			}
			return transformed;
		};

		function trim( str ) {
			if ( str.trim ) {
				return str.trim();
			}
			return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		}

		function extractString( unit ) {
			return unit.str;
		}
	}();

	/* config/options/css/css.js */
	var css = function( transformCss ) {

		var cssConfig = {
			name: 'css',
			extend: extend,
			init: function() {}
		};

		function extend( Parent, proto, options ) {
			var guid = proto.constructor._guid,
				css;
			if ( css = getCss( options.css, options, guid ) || getCss( Parent.css, Parent, guid ) ) {
				proto.constructor.css = css;
			}
		}

		function getCss( css, target, guid ) {
			if ( !css ) {
				return;
			}
			return target.noCssTransform ? css : transformCss( css, guid );
		}
		return cssConfig;
	}( transform );

	/* utils/wrapMethod.js */
	var wrapMethod = function() {

		return function( method, superMethod, force ) {
			if ( force || needsSuper( method, superMethod ) ) {
				return function() {
					var hasSuper = '_super' in this,
						_super = this._super,
						result;
					this._super = superMethod;
					result = method.apply( this, arguments );
					if ( hasSuper ) {
						this._super = _super;
					}
					return result;
				};
			} else {
				return method;
			}
		};

		function needsSuper( method, superMethod ) {
			return typeof superMethod === 'function' && /_super/.test( method );
		}
	}();

	/* config/options/data.js */
	var data = function( wrap ) {

		var dataConfig = {
			name: 'data',
			extend: extend,
			init: init,
			reset: reset
		};
		return dataConfig;

		function combine( Parent, target, options ) {
			var value = options.data || {},
				parentValue = getAddedKeys( Parent.prototype.data );
			return dispatch( parentValue, value );
		}

		function extend( Parent, proto, options ) {
			proto.data = combine( Parent, proto, options );
		}

		function init( Parent, ractive, options ) {
			var value = options.data,
				result = combine( Parent, ractive, options );
			if ( typeof result === 'function' ) {
				result = result.call( ractive, value ) || value;
			}
			return ractive.data = result || {};
		}

		function reset( ractive ) {
			var result = this.init( ractive.constructor, ractive, ractive );
			if ( result ) {
				ractive.data = result;
				return true;
			}
		}

		function getAddedKeys( parent ) {
			// only for functions that had keys added
			if ( typeof parent !== 'function' || !Object.keys( parent ).length ) {
				return parent;
			}
			// copy the added keys to temp 'object', otherwise
			// parent would be interpreted as 'function' by dispatch
			var temp = {};
			copy( parent, temp );
			// roll in added keys
			return dispatch( parent, temp );
		}

		function dispatch( parent, child ) {
			if ( typeof child === 'function' ) {
				return extendFn( child, parent );
			} else if ( typeof parent === 'function' ) {
				return fromFn( child, parent );
			} else {
				return fromProperties( child, parent );
			}
		}

		function copy( from, to, fillOnly ) {
			for ( var key in from ) {
				if ( fillOnly && key in to ) {
					continue;
				}
				to[ key ] = from[ key ];
			}
		}

		function fromProperties( child, parent ) {
			child = child || {};
			if ( !parent ) {
				return child;
			}
			copy( parent, child, true );
			return child;
		}

		function fromFn( child, parentFn ) {
			return function( data ) {
				var keys;
				if ( child ) {
					// Track the keys that our on the child,
					// but not on the data. We'll need to apply these
					// after the parent function returns.
					keys = [];
					for ( var key in child ) {
						if ( !data || !( key in data ) ) {
							keys.push( key );
						}
					}
				}
				// call the parent fn, use data if no return value
				data = parentFn.call( this, data ) || data;
				// Copy child keys back onto data. The child keys
				// should take precedence over whatever the
				// parent did with the data.
				if ( keys && keys.length ) {
					data = data || {};
					keys.forEach( function( key ) {
						data[ key ] = child[ key ];
					} );
				}
				return data;
			};
		}

		function extendFn( childFn, parent ) {
			var parentFn;
			if ( typeof parent !== 'function' ) {
				// copy props to data
				parentFn = function( data ) {
					fromProperties( data, parent );
				};
			} else {
				parentFn = function( data ) {
					// give parent function it's own this._super context,
					// otherwise this._super is from child and
					// causes infinite loop
					parent = wrap( parent, function() {}, true );
					return parent.call( this, data ) || data;
				};
			}
			return wrap( childFn, parentFn );
		}
	}( wrapMethod );

	/* config/errors.js */
	var errors = {
		missingParser: 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser',
		mergeComparisonFail: 'Merge operation: comparison failed. Falling back to identity checking',
		noComponentEventArguments: 'Components currently only support simple events - you cannot include arguments. Sorry!',
		noTemplateForPartial: 'Could not find template for partial "{name}"',
		noNestedPartials: 'Partials ({{>{name}}}) cannot contain nested inline partials',
		evaluationError: 'Error evaluating "{uniqueString}": {err}',
		badArguments: 'Bad arguments "{arguments}". I\'m not allowed to argue unless you\'ve paid.',
		failedComputation: 'Failed to compute "{key}": {err}',
		missingPlugin: 'Missing "{name}" {plugin} plugin. You may need to download a {plugin} via http://docs.ractivejs.org/latest/plugins#{plugin}s',
		badRadioInputBinding: 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both',
		noRegistryFunctionReturn: 'A function was specified for "{name}" {registry}, but no {registry} was returned'
	};

	/* config/types.js */
	var types = {
		TEXT: 1,
		INTERPOLATOR: 2,
		TRIPLE: 3,
		SECTION: 4,
		INVERTED: 5,
		CLOSING: 6,
		ELEMENT: 7,
		PARTIAL: 8,
		COMMENT: 9,
		DELIMCHANGE: 10,
		MUSTACHE: 11,
		TAG: 12,
		ATTRIBUTE: 13,
		CLOSING_TAG: 14,
		COMPONENT: 15,
		NUMBER_LITERAL: 20,
		STRING_LITERAL: 21,
		ARRAY_LITERAL: 22,
		OBJECT_LITERAL: 23,
		BOOLEAN_LITERAL: 24,
		GLOBAL: 26,
		KEY_VALUE_PAIR: 27,
		REFERENCE: 30,
		REFINEMENT: 31,
		MEMBER: 32,
		PREFIX_OPERATOR: 33,
		BRACKETED: 34,
		CONDITIONAL: 35,
		INFIX_OPERATOR: 36,
		INVOCATION: 40,
		SECTION_IF: 50,
		SECTION_UNLESS: 51,
		SECTION_EACH: 52,
		SECTION_WITH: 53
	};

	/* utils/create.js */
	var create = function() {

		var create;
		try {
			Object.create( null );
			create = Object.create;
		} catch ( err ) {
			// sigh
			create = function() {
				var F = function() {};
				return function( proto, props ) {
					var obj;
					if ( proto === null ) {
						return {};
					}
					F.prototype = proto;
					obj = new F();
					if ( props ) {
						Object.defineProperties( obj, props );
					}
					return obj;
				};
			}();
		}
		return create;
	}();

	/* parse/Parser/expressions/shared/errors.js */
	var parse_Parser_expressions_shared_errors = {
		expectedExpression: 'Expected a JavaScript expression',
		expectedParen: 'Expected closing paren'
	};

	/* parse/Parser/expressions/primary/literal/numberLiteral.js */
	var numberLiteral = function( types ) {

		// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
		var numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
		return function( parser ) {
			var result;
			if ( result = parser.matchPattern( numberPattern ) ) {
				return {
					t: types.NUMBER_LITERAL,
					v: result
				};
			}
			return null;
		};
	}( types );

	/* parse/Parser/expressions/primary/literal/booleanLiteral.js */
	var booleanLiteral = function( types ) {

		return function( parser ) {
			var remaining = parser.remaining();
			if ( remaining.substr( 0, 4 ) === 'true' ) {
				parser.pos += 4;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'true'
				};
			}
			if ( remaining.substr( 0, 5 ) === 'false' ) {
				parser.pos += 5;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'false'
				};
			}
			return null;
		};
	}( types );

	/* parse/Parser/expressions/primary/literal/stringLiteral/makeQuotedStringMatcher.js */
	var makeQuotedStringMatcher = function() {

		var stringMiddlePattern, escapeSequencePattern, lineContinuationPattern;
		// Match one or more characters until: ", ', \, or EOL/EOF.
		// EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
		stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;
		// Match one escape sequence, including the backslash.
		escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;
		// Match one ES5 line continuation (backslash + line terminator).
		lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;
		// Helper for defining getDoubleQuotedString and getSingleQuotedString.
		return function( okQuote ) {
			return function( parser ) {
				var start, literal, done, next;
				start = parser.pos;
				literal = '"';
				done = false;
				while ( !done ) {
					next = parser.matchPattern( stringMiddlePattern ) || parser.matchPattern( escapeSequencePattern ) || parser.matchString( okQuote );
					if ( next ) {
						if ( next === '"' ) {
							literal += '\\"';
						} else if ( next === '\\\'' ) {
							literal += '\'';
						} else {
							literal += next;
						}
					} else {
						next = parser.matchPattern( lineContinuationPattern );
						if ( next ) {
							// convert \(newline-like) into a \u escape, which is allowed in JSON
							literal += '\\u' + ( '000' + next.charCodeAt( 1 ).toString( 16 ) ).slice( -4 );
						} else {
							done = true;
						}
					}
				}
				literal += '"';
				// use JSON.parse to interpret escapes
				return JSON.parse( literal );
			};
		};
	}();

	/* parse/Parser/expressions/primary/literal/stringLiteral/singleQuotedString.js */
	var singleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '"' );
	}( makeQuotedStringMatcher );

	/* parse/Parser/expressions/primary/literal/stringLiteral/doubleQuotedString.js */
	var doubleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '\'' );
	}( makeQuotedStringMatcher );

	/* parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral.js */
	var stringLiteral = function( types, getSingleQuotedString, getDoubleQuotedString ) {

		return function( parser ) {
			var start, string;
			start = parser.pos;
			if ( parser.matchString( '"' ) ) {
				string = getDoubleQuotedString( parser );
				if ( !parser.matchString( '"' ) ) {
					parser.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			if ( parser.matchString( '\'' ) ) {
				string = getSingleQuotedString( parser );
				if ( !parser.matchString( '\'' ) ) {
					parser.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			return null;
		};
	}( types, singleQuotedString, doubleQuotedString );

	/* parse/Parser/expressions/shared/patterns.js */
	var patterns = {
		name: /^[a-zA-Z_$][a-zA-Z_$0-9]*/
	};

	/* parse/Parser/expressions/shared/key.js */
	var key = function( getStringLiteral, getNumberLiteral, patterns ) {

		var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
		// http://mathiasbynens.be/notes/javascript-properties
		// can be any name, string literal, or number literal
		return function( parser ) {
			var token;
			if ( token = getStringLiteral( parser ) ) {
				return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
			}
			if ( token = getNumberLiteral( parser ) ) {
				return token.v;
			}
			if ( token = parser.matchPattern( patterns.name ) ) {
				return token;
			}
		};
	}( stringLiteral, numberLiteral, patterns );

	/* parse/Parser/expressions/primary/literal/objectLiteral/keyValuePair.js */
	var keyValuePair = function( types, getKey ) {

		return function( parser ) {
			var start, key, value;
			start = parser.pos;
			// allow whitespace between '{' and key
			parser.allowWhitespace();
			key = getKey( parser );
			if ( key === null ) {
				parser.pos = start;
				return null;
			}
			// allow whitespace between key and ':'
			parser.allowWhitespace();
			// next character must be ':'
			if ( !parser.matchString( ':' ) ) {
				parser.pos = start;
				return null;
			}
			// allow whitespace between ':' and value
			parser.allowWhitespace();
			// next expression must be a, well... expression
			value = parser.readExpression();
			if ( value === null ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.KEY_VALUE_PAIR,
				k: key,
				v: value
			};
		};
	}( types, key );

	/* parse/Parser/expressions/primary/literal/objectLiteral/keyValuePairs.js */
	var keyValuePairs = function( getKeyValuePair ) {

		return function getKeyValuePairs( parser ) {
			var start, pairs, pair, keyValuePairs;
			start = parser.pos;
			pair = getKeyValuePair( parser );
			if ( pair === null ) {
				return null;
			}
			pairs = [ pair ];
			if ( parser.matchString( ',' ) ) {
				keyValuePairs = getKeyValuePairs( parser );
				if ( !keyValuePairs ) {
					parser.pos = start;
					return null;
				}
				return pairs.concat( keyValuePairs );
			}
			return pairs;
		};
	}( keyValuePair );

	/* parse/Parser/expressions/primary/literal/objectLiteral/_objectLiteral.js */
	var objectLiteral = function( types, getKeyValuePairs ) {

		return function( parser ) {
			var start, keyValuePairs;
			start = parser.pos;
			// allow whitespace
			parser.allowWhitespace();
			if ( !parser.matchString( '{' ) ) {
				parser.pos = start;
				return null;
			}
			keyValuePairs = getKeyValuePairs( parser );
			// allow whitespace between final value and '}'
			parser.allowWhitespace();
			if ( !parser.matchString( '}' ) ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.OBJECT_LITERAL,
				m: keyValuePairs
			};
		};
	}( types, keyValuePairs );

	/* parse/Parser/expressions/shared/expressionList.js */
	var expressionList = function( errors ) {

		return function getExpressionList( parser ) {
			var start, expressions, expr, next;
			start = parser.pos;
			parser.allowWhitespace();
			expr = parser.readExpression();
			if ( expr === null ) {
				return null;
			}
			expressions = [ expr ];
			// allow whitespace between expression and ','
			parser.allowWhitespace();
			if ( parser.matchString( ',' ) ) {
				next = getExpressionList( parser );
				if ( next === null ) {
					parser.error( errors.expectedExpression );
				}
				next.forEach( append );
			}

			function append( expression ) {
				expressions.push( expression );
			}
			return expressions;
		};
	}( parse_Parser_expressions_shared_errors );

	/* parse/Parser/expressions/primary/literal/arrayLiteral.js */
	var arrayLiteral = function( types, getExpressionList ) {

		return function( parser ) {
			var start, expressionList;
			start = parser.pos;
			// allow whitespace before '['
			parser.allowWhitespace();
			if ( !parser.matchString( '[' ) ) {
				parser.pos = start;
				return null;
			}
			expressionList = getExpressionList( parser );
			if ( !parser.matchString( ']' ) ) {
				parser.pos = start;
				return null;
			}
			return {
				t: types.ARRAY_LITERAL,
				m: expressionList
			};
		};
	}( types, expressionList );

	/* parse/Parser/expressions/primary/literal/_literal.js */
	var literal = function( getNumberLiteral, getBooleanLiteral, getStringLiteral, getObjectLiteral, getArrayLiteral ) {

		return function( parser ) {
			var literal = getNumberLiteral( parser ) || getBooleanLiteral( parser ) || getStringLiteral( parser ) || getObjectLiteral( parser ) || getArrayLiteral( parser );
			return literal;
		};
	}( numberLiteral, booleanLiteral, stringLiteral, objectLiteral, arrayLiteral );

	/* parse/Parser/expressions/primary/reference.js */
	var reference = function( types, patterns ) {

		var dotRefinementPattern, arrayMemberPattern, getArrayRefinement, globals, keywords;
		dotRefinementPattern = /^\.[a-zA-Z_$0-9]+/;
		getArrayRefinement = function( parser ) {
			var num = parser.matchPattern( arrayMemberPattern );
			if ( num ) {
				return '.' + num;
			}
			return null;
		};
		arrayMemberPattern = /^\[(0|[1-9][0-9]*)\]/;
		// if a reference is a browser global, we don't deference it later, so it needs special treatment
		globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;
		// keywords are not valid references, with the exception of `this`
		keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;
		return function( parser ) {
			var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;
			startPos = parser.pos;
			// we might have a root-level reference
			if ( parser.matchString( '~/' ) ) {
				ancestor = '~/';
			} else {
				// we might have ancestor refs...
				ancestor = '';
				while ( parser.matchString( '../' ) ) {
					ancestor += '../';
				}
			}
			if ( !ancestor ) {
				// we might have an implicit iterator or a restricted reference
				dot = parser.matchString( '.' ) || '';
			}
			name = parser.matchPattern( /^@(?:index|key)/ ) || parser.matchPattern( patterns.name ) || '';
			// bug out if it's a keyword
			if ( keywords.test( name ) ) {
				parser.pos = startPos;
				return null;
			}
			// if this is a browser global, stop here
			if ( !ancestor && !dot && globals.test( name ) ) {
				return {
					t: types.GLOBAL,
					v: name
				};
			}
			combo = ( ancestor || dot ) + name;
			if ( !combo ) {
				return null;
			}
			while ( refinement = parser.matchPattern( dotRefinementPattern ) || getArrayRefinement( parser ) ) {
				combo += refinement;
			}
			if ( parser.matchString( '(' ) ) {
				// if this is a method invocation (as opposed to a function) we need
				// to strip the method name from the reference combo, else the context
				// will be wrong
				lastDotIndex = combo.lastIndexOf( '.' );
				if ( lastDotIndex !== -1 ) {
					combo = combo.substr( 0, lastDotIndex );
					parser.pos = startPos + combo.length;
				} else {
					parser.pos -= 1;
				}
			}
			return {
				t: types.REFERENCE,
				n: combo.replace( /^this\./, './' ).replace( /^this$/, '.' )
			};
		};
	}( types, patterns );

	/* parse/Parser/expressions/primary/bracketedExpression.js */
	var bracketedExpression = function( types, errors ) {

		return function( parser ) {
			var start, expr;
			start = parser.pos;
			if ( !parser.matchString( '(' ) ) {
				return null;
			}
			parser.allowWhitespace();
			expr = parser.readExpression();
			if ( !expr ) {
				parser.error( errors.expectedExpression );
			}
			parser.allowWhitespace();
			if ( !parser.matchString( ')' ) ) {
				parser.error( errors.expectedParen );
			}
			return {
				t: types.BRACKETED,
				x: expr
			};
		};
	}( types, parse_Parser_expressions_shared_errors );

	/* parse/Parser/expressions/primary/_primary.js */
	var primary = function( getLiteral, getReference, getBracketedExpression ) {

		return function( parser ) {
			return getLiteral( parser ) || getReference( parser ) || getBracketedExpression( parser );
		};
	}( literal, reference, bracketedExpression );

	/* parse/Parser/expressions/shared/refinement.js */
	var refinement = function( types, errors, patterns ) {

		return function getRefinement( parser ) {
			var start, name, expr;
			start = parser.pos;
			parser.allowWhitespace();
			// "." name
			if ( parser.matchString( '.' ) ) {
				parser.allowWhitespace();
				if ( name = parser.matchPattern( patterns.name ) ) {
					return {
						t: types.REFINEMENT,
						n: name
					};
				}
				parser.error( 'Expected a property name' );
			}
			// "[" expression "]"
			if ( parser.matchString( '[' ) ) {
				parser.allowWhitespace();
				expr = parser.readExpression();
				if ( !expr ) {
					parser.error( errors.expectedExpression );
				}
				parser.allowWhitespace();
				if ( !parser.matchString( ']' ) ) {
					parser.error( 'Expected \']\'' );
				}
				return {
					t: types.REFINEMENT,
					x: expr
				};
			}
			return null;
		};
	}( types, parse_Parser_expressions_shared_errors, patterns );

	/* parse/Parser/expressions/memberOrInvocation.js */
	var memberOrInvocation = function( types, getPrimary, getExpressionList, getRefinement, errors ) {

		return function( parser ) {
			var current, expression, refinement, expressionList;
			expression = getPrimary( parser );
			if ( !expression ) {
				return null;
			}
			while ( expression ) {
				current = parser.pos;
				if ( refinement = getRefinement( parser ) ) {
					expression = {
						t: types.MEMBER,
						x: expression,
						r: refinement
					};
				} else if ( parser.matchString( '(' ) ) {
					parser.allowWhitespace();
					expressionList = getExpressionList( parser );
					parser.allowWhitespace();
					if ( !parser.matchString( ')' ) ) {
						parser.error( errors.expectedParen );
					}
					expression = {
						t: types.INVOCATION,
						x: expression
					};
					if ( expressionList ) {
						expression.o = expressionList;
					}
				} else {
					break;
				}
			}
			return expression;
		};
	}( types, primary, expressionList, refinement, parse_Parser_expressions_shared_errors );

	/* parse/Parser/expressions/typeof.js */
	var _typeof = function( types, errors, getMemberOrInvocation ) {

		var getTypeof, makePrefixSequenceMatcher;
		makePrefixSequenceMatcher = function( symbol, fallthrough ) {
			return function( parser ) {
				var expression;
				if ( expression = fallthrough( parser ) ) {
					return expression;
				}
				if ( !parser.matchString( symbol ) ) {
					return null;
				}
				parser.allowWhitespace();
				expression = parser.readExpression();
				if ( !expression ) {
					parser.error( errors.expectedExpression );
				}
				return {
					s: symbol,
					o: expression,
					t: types.PREFIX_OPERATOR
				};
			};
		};
		// create all prefix sequence matchers, return getTypeof
		( function() {
			var i, len, matcher, prefixOperators, fallthrough;
			prefixOperators = '! ~ + - typeof'.split( ' ' );
			fallthrough = getMemberOrInvocation;
			for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
				matcher = makePrefixSequenceMatcher( prefixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			// typeof operator is higher precedence than multiplication, so provides the
			// fallthrough for the multiplication sequence matcher we're about to create
			// (we're skipping void and delete)
			getTypeof = fallthrough;
		}() );
		return getTypeof;
	}( types, parse_Parser_expressions_shared_errors, memberOrInvocation );

	/* parse/Parser/expressions/logicalOr.js */
	var logicalOr = function( types, getTypeof ) {

		var getLogicalOr, makeInfixSequenceMatcher;
		makeInfixSequenceMatcher = function( symbol, fallthrough ) {
			return function( parser ) {
				var start, left, right;
				left = fallthrough( parser );
				if ( !left ) {
					return null;
				}
				// Loop to handle left-recursion in a case like `a * b * c` and produce
				// left association, i.e. `(a * b) * c`.  The matcher can't call itself
				// to parse `left` because that would be infinite regress.
				while ( true ) {
					start = parser.pos;
					parser.allowWhitespace();
					if ( !parser.matchString( symbol ) ) {
						parser.pos = start;
						return left;
					}
					// special case - in operator must not be followed by [a-zA-Z_$0-9]
					if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( parser.remaining().charAt( 0 ) ) ) {
						parser.pos = start;
						return left;
					}
					parser.allowWhitespace();
					// right operand must also consist of only higher-precedence operators
					right = fallthrough( parser );
					if ( !right ) {
						parser.pos = start;
						return left;
					}
					left = {
						t: types.INFIX_OPERATOR,
						s: symbol,
						o: [
							left,
							right
						]
					};
				}
			};
		};
		// create all infix sequence matchers, and return getLogicalOr
		( function() {
			var i, len, matcher, infixOperators, fallthrough;
			// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
			// Each sequence matcher will initially fall through to its higher precedence
			// neighbour, and only attempt to match if one of the higher precedence operators
			// (or, ultimately, a literal, reference, or bracketed expression) already matched
			infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );
			// A typeof operator is higher precedence than multiplication
			fallthrough = getTypeof;
			for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
				matcher = makeInfixSequenceMatcher( infixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			// Logical OR is the fallthrough for the conditional matcher
			getLogicalOr = fallthrough;
		}() );
		return getLogicalOr;
	}( types, _typeof );

	/* parse/Parser/expressions/conditional.js */
	var conditional = function( types, getLogicalOr, errors ) {

		// The conditional operator is the lowest precedence operator, so we start here
		return function( parser ) {
			var start, expression, ifTrue, ifFalse;
			expression = getLogicalOr( parser );
			if ( !expression ) {
				return null;
			}
			start = parser.pos;
			parser.allowWhitespace();
			if ( !parser.matchString( '?' ) ) {
				parser.pos = start;
				return expression;
			}
			parser.allowWhitespace();
			ifTrue = parser.readExpression();
			if ( !ifTrue ) {
				parser.error( errors.expectedExpression );
			}
			parser.allowWhitespace();
			if ( !parser.matchString( ':' ) ) {
				parser.error( 'Expected ":"' );
			}
			parser.allowWhitespace();
			ifFalse = parser.readExpression();
			if ( !ifFalse ) {
				parser.error( errors.expectedExpression );
			}
			return {
				t: types.CONDITIONAL,
				o: [
					expression,
					ifTrue,
					ifFalse
				]
			};
		};
	}( types, logicalOr, parse_Parser_expressions_shared_errors );

	/* parse/Parser/utils/flattenExpression.js */
	var flattenExpression = function( types, isObject ) {

		return function( expression ) {
			var refs = [],
				flattened;
			extractRefs( expression, refs );
			flattened = {
				r: refs,
				s: stringify( this, expression, refs )
			};
			return flattened;
		};

		function quoteStringLiteral( str ) {
			return JSON.stringify( String( str ) );
		}
		// TODO maybe refactor this?
		function extractRefs( node, refs ) {
			var i, list;
			if ( node.t === types.REFERENCE ) {
				if ( refs.indexOf( node.n ) === -1 ) {
					refs.unshift( node.n );
				}
			}
			list = node.o || node.m;
			if ( list ) {
				if ( isObject( list ) ) {
					extractRefs( list, refs );
				} else {
					i = list.length;
					while ( i-- ) {
						extractRefs( list[ i ], refs );
					}
				}
			}
			if ( node.x ) {
				extractRefs( node.x, refs );
			}
			if ( node.r ) {
				extractRefs( node.r, refs );
			}
			if ( node.v ) {
				extractRefs( node.v, refs );
			}
		}

		function stringify( parser, node, refs ) {
			var stringifyAll = function( item ) {
				return stringify( parser, item, refs );
			};
			switch ( node.t ) {
				case types.BOOLEAN_LITERAL:
				case types.GLOBAL:
				case types.NUMBER_LITERAL:
					return node.v;
				case types.STRING_LITERAL:
					return quoteStringLiteral( node.v );
				case types.ARRAY_LITERAL:
					return '[' + ( node.m ? node.m.map( stringifyAll ).join( ',' ) : '' ) + ']';
				case types.OBJECT_LITERAL:
					return '{' + ( node.m ? node.m.map( stringifyAll ).join( ',' ) : '' ) + '}';
				case types.KEY_VALUE_PAIR:
					return node.k + ':' + stringify( parser, node.v, refs );
				case types.PREFIX_OPERATOR:
					return ( node.s === 'typeof' ? 'typeof ' : node.s ) + stringify( parser, node.o, refs );
				case types.INFIX_OPERATOR:
					return stringify( parser, node.o[ 0 ], refs ) + ( node.s.substr( 0, 2 ) === 'in' ? ' ' + node.s + ' ' : node.s ) + stringify( parser, node.o[ 1 ], refs );
				case types.INVOCATION:
					return stringify( parser, node.x, refs ) + '(' + ( node.o ? node.o.map( stringifyAll ).join( ',' ) : '' ) + ')';
				case types.BRACKETED:
					return '(' + stringify( parser, node.x, refs ) + ')';
				case types.MEMBER:
					return stringify( parser, node.x, refs ) + stringify( parser, node.r, refs );
				case types.REFINEMENT:
					return node.n ? '.' + node.n : '[' + stringify( parser, node.x, refs ) + ']';
				case types.CONDITIONAL:
					return stringify( parser, node.o[ 0 ], refs ) + '?' + stringify( parser, node.o[ 1 ], refs ) + ':' + stringify( parser, node.o[ 2 ], refs );
				case types.REFERENCE:
					return '${' + refs.indexOf( node.n ) + '}';
				default:
					parser.error( 'Expected legal JavaScript' );
			}
		}
	}( types, isObject );

	/* parse/Parser/_Parser.js */
	var Parser = function( circular, create, hasOwnProperty, getConditional, flattenExpression ) {

		var Parser, ParseError, leadingWhitespace = /^\s+/;
		ParseError = function( message ) {
			this.name = 'ParseError';
			this.message = message;
			try {
				throw new Error( message );
			} catch ( e ) {
				this.stack = e.stack;
			}
		};
		ParseError.prototype = Error.prototype;
		Parser = function( str, options ) {
			var items, item;
			this.str = str;
			this.options = options || {};
			this.pos = 0;
			// Custom init logic
			if ( this.init )
				this.init( str, options );
			items = [];
			while ( this.pos < this.str.length && ( item = this.read() ) ) {
				items.push( item );
			}
			this.leftover = this.remaining();
			this.result = this.postProcess ? this.postProcess( items, options ) : items;
		};
		Parser.prototype = {
			read: function( converters ) {
				var pos, i, len, item;
				if ( !converters )
					converters = this.converters;
				pos = this.pos;
				len = converters.length;
				for ( i = 0; i < len; i += 1 ) {
					this.pos = pos;
					// reset for each attempt
					if ( item = converters[ i ]( this ) ) {
						return item;
					}
				}
				return null;
			},
			readExpression: function() {
				// The conditional operator is the lowest precedence operator (except yield,
				// assignment operators, and commas, none of which are supported), so we
				// start there. If it doesn't match, it 'falls through' to progressively
				// higher precedence operators, until it eventually matches (or fails to
				// match) a 'primary' - a literal or a reference. This way, the abstract syntax
				// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
				return getConditional( this );
			},
			flattenExpression: flattenExpression,
			getLinePos: function() {
				var lines, currentLine, currentLineEnd, nextLineEnd, lineNum, columnNum;
				lines = this.str.split( '\n' );
				lineNum = -1;
				nextLineEnd = 0;
				do {
					currentLineEnd = nextLineEnd;
					lineNum++;
					currentLine = lines[ lineNum ];
					nextLineEnd += currentLine.length + 1;
				} while ( nextLineEnd <= this.pos );
				columnNum = this.pos - currentLineEnd;
				return {
					line: lineNum + 1,
					ch: columnNum + 1,
					text: currentLine,
					toJSON: function() {
						return [
							this.line,
							this.ch
						];
					},
					toString: function() {
						return 'line ' + this.line + ' character ' + this.ch + ':\n' + this.text + '\n' + this.text.substr( 0, this.ch - 1 ).replace( /[\S]/g, ' ' ) + '^----';
					}
				};
			},
			error: function( err ) {
				var pos, message;
				pos = this.getLinePos();
				message = err + ' at ' + pos;
				throw new ParseError( message );
			},
			matchString: function( string ) {
				if ( this.str.substr( this.pos, string.length ) === string ) {
					this.pos += string.length;
					return string;
				}
			},
			matchPattern: function( pattern ) {
				var match;
				if ( match = pattern.exec( this.remaining() ) ) {
					this.pos += match[ 0 ].length;
					return match[ 1 ] || match[ 0 ];
				}
			},
			allowWhitespace: function() {
				this.matchPattern( leadingWhitespace );
			},
			remaining: function() {
				return this.str.substring( this.pos );
			},
			nextChar: function() {
				return this.str.charAt( this.pos );
			}
		};
		Parser.extend = function( proto ) {
			var Parent = this,
				Child, key;
			Child = function( str, options ) {
				Parser.call( this, str, options );
			};
			Child.prototype = create( Parent.prototype );
			for ( key in proto ) {
				if ( hasOwnProperty.call( proto, key ) ) {
					Child.prototype[ key ] = proto[ key ];
				}
			}
			Child.extend = Parser.extend;
			return Child;
		};
		circular.Parser = Parser;
		return Parser;
	}( circular, create, hasOwn, conditional, flattenExpression );

	/* parse/converters/mustache/delimiterChange.js */
	var delimiterChange = function() {

		var delimiterChangePattern = /^[^\s=]+/,
			whitespacePattern = /^\s+/;
		return function( parser ) {
			var start, opening, closing;
			if ( !parser.matchString( '=' ) ) {
				return null;
			}
			start = parser.pos;
			// allow whitespace before new opening delimiter
			parser.allowWhitespace();
			opening = parser.matchPattern( delimiterChangePattern );
			if ( !opening ) {
				parser.pos = start;
				return null;
			}
			// allow whitespace (in fact, it's necessary...)
			if ( !parser.matchPattern( whitespacePattern ) ) {
				return null;
			}
			closing = parser.matchPattern( delimiterChangePattern );
			if ( !closing ) {
				parser.pos = start;
				return null;
			}
			// allow whitespace before closing '='
			parser.allowWhitespace();
			if ( !parser.matchString( '=' ) ) {
				parser.pos = start;
				return null;
			}
			return [
				opening,
				closing
			];
		};
	}();

	/* parse/converters/mustache/delimiterTypes.js */
	var delimiterTypes = [ {
		delimiters: 'delimiters',
		isTriple: false,
		isStatic: false
	}, {
		delimiters: 'tripleDelimiters',
		isTriple: true,
		isStatic: false
	}, {
		delimiters: 'staticDelimiters',
		isTriple: false,
		isStatic: true
	}, {
		delimiters: 'staticTripleDelimiters',
		isTriple: true,
		isStatic: true
	} ];

	/* parse/converters/mustache/type.js */
	var type = function( types ) {

		var mustacheTypes = {
			'#': types.SECTION,
			'^': types.INVERTED,
			'/': types.CLOSING,
			'>': types.PARTIAL,
			'!': types.COMMENT,
			'&': types.TRIPLE
		};
		return function( parser ) {
			var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];
			if ( !type ) {
				return null;
			}
			parser.pos += 1;
			return type;
		};
	}( types );

	/* parse/converters/mustache/handlebarsBlockCodes.js */
	var handlebarsBlockCodes = function( types ) {

		return {
			'if': types.SECTION_IF,
			'unless': types.SECTION_UNLESS,
			'with': types.SECTION_WITH,
			'each': types.SECTION_EACH
		};
	}( types );

	/* empty/legacy.js */
	var legacy = null;

	/* parse/converters/mustache/content.js */
	var content = function( types, mustacheType, handlebarsBlockCodes ) {

		var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
			arrayMemberPattern = /^[0-9][1-9]*$/,
			handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' ),
			legalReference;
		legalReference = /^[a-zA-Z$_0-9]+(?:(\.[a-zA-Z$_0-9]+)|(\[[a-zA-Z$_0-9]+\]))*$/;
		return function( parser, delimiterType ) {
			var start, pos, mustache, type, block, expression, i, remaining, index, delimiters, referenceExpression;
			start = parser.pos;
			mustache = {};
			delimiters = parser[ delimiterType.delimiters ];
			if ( delimiterType.isStatic ) {
				mustache.s = true;
			}
			// Determine mustache type
			if ( delimiterType.isTriple ) {
				mustache.t = types.TRIPLE;
			} else {
				// We need to test for expressions before we test for mustache type, because
				// an expression that begins '!' looks a lot like a comment
				if ( parser.remaining()[ 0 ] === '!' && ( expression = parser.readExpression() ) ) {
					mustache.t = types.INTERPOLATOR;
					// Was it actually an expression, or a comment block in disguise?
					parser.allowWhitespace();
					if ( parser.matchString( delimiters[ 1 ] ) ) {
						// expression
						parser.pos -= delimiters[ 1 ].length;
					} else {
						// comment block
						parser.pos = start;
						expression = null;
					}
				}
				if ( !expression ) {
					type = mustacheType( parser );
					mustache.t = type || types.INTERPOLATOR;
					// default
					// See if there's an explicit section type e.g. {{#with}}...{{/with}}
					if ( type === types.SECTION ) {
						if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
							mustache.n = block;
						}
						parser.allowWhitespace();
					} else if ( type === types.COMMENT || type === types.CLOSING ) {
						remaining = parser.remaining();
						index = remaining.indexOf( delimiters[ 1 ] );
						if ( index !== -1 ) {
							mustache.r = remaining.substr( 0, index );
							parser.pos += index;
							return mustache;
						}
					}
				}
			}
			if ( !expression ) {
				// allow whitespace
				parser.allowWhitespace();
				// get expression
				expression = parser.readExpression();
				// With certain valid references that aren't valid expressions,
				// e.g. {{1.foo}}, we have a problem: it looks like we've got an
				// expression, but the expression didn't consume the entire
				// reference. So we need to check that the mustache delimiters
				// appear next, unless there's an index reference (i.e. a colon)
				remaining = parser.remaining();
				if ( remaining.substr( 0, delimiters[ 1 ].length ) !== delimiters[ 1 ] && remaining.charAt( 0 ) !== ':' ) {
					pos = parser.pos;
					parser.pos = start;
					remaining = parser.remaining();
					index = remaining.indexOf( delimiters[ 1 ] );
					if ( index !== -1 ) {
						mustache.r = remaining.substr( 0, index ).trim();
						// Check it's a legal reference
						if ( !legalReference.test( mustache.r ) ) {
							parser.error( 'Expected a legal Mustache reference' );
						}
						parser.pos += index;
						return mustache;
					}
					parser.pos = pos;
				}
			}
			if ( expression ) {
				while ( expression.t === types.BRACKETED && expression.x ) {
					expression = expression.x;
				}
				// special case - integers should be treated as array members references,
				// rather than as expressions in their own right
				if ( expression.t === types.REFERENCE ) {
					mustache.r = expression.n;
				} else {
					if ( expression.t === types.NUMBER_LITERAL && arrayMemberPattern.test( expression.v ) ) {
						mustache.r = expression.v;
					} else if ( referenceExpression = getReferenceExpression( parser, expression ) ) {
						mustache.rx = referenceExpression;
					} else {
						mustache.x = parser.flattenExpression( expression );
					}
				}
			}
			// optional index reference
			if ( i = parser.matchPattern( indexRefPattern ) ) {
				mustache.i = i;
			}
			return mustache;
		};
		// TODO refactor this! it's bewildering
		function getReferenceExpression( parser, expression ) {
			var members = [],
				refinement;
			while ( expression.t === types.MEMBER && expression.r.t === types.REFINEMENT ) {
				refinement = expression.r;
				if ( refinement.x ) {
					if ( refinement.x.t === types.REFERENCE ) {
						members.unshift( refinement.x );
					} else {
						members.unshift( parser.flattenExpression( refinement.x ) );
					}
				} else {
					members.unshift( refinement.n );
				}
				expression = expression.x;
			}
			if ( expression.t !== types.REFERENCE ) {
				return null;
			}
			return {
				r: expression.n,
				m: members
			};
		}
	}( types, type, handlebarsBlockCodes, legacy );

	/* parse/converters/mustache.js */
	var mustache = function( types, delimiterChange, delimiterTypes, mustacheContent, handlebarsBlockCodes ) {

		var delimiterChangeToken = {
				t: types.DELIMCHANGE,
				exclude: true
			},
			handlebarsIndexRefPattern = /^@(?:index|key)$/;
		return getMustache;

		function getMustache( parser ) {
			var types;
			types = delimiterTypes.slice().sort( function compare( a, b ) {
				// Sort in order of descending opening delimiter length (longer first),
				// to protect against opening delimiters being substrings of each other
				return parser[ b.delimiters ][ 0 ].length - parser[ a.delimiters ][ 0 ].length;
			} );
			return function r( type ) {
				if ( !type ) {
					return null;
				} else {
					return getMustacheOfType( parser, type ) || r( types.shift() );
				}
			}( types.shift() );
		}

		function getMustacheOfType( parser, delimiterType ) {
			var start, startPos, mustache, delimiters, children, expectedClose, elseChildren, currentChildren, child, indexRef;
			start = parser.pos;
			startPos = parser.getLinePos();
			delimiters = parser[ delimiterType.delimiters ];
			if ( !parser.matchString( delimiters[ 0 ] ) ) {
				return null;
			}
			// delimiter change?
			if ( mustache = delimiterChange( parser ) ) {
				// find closing delimiter or abort...
				if ( !parser.matchString( delimiters[ 1 ] ) ) {
					return null;
				}
				// ...then make the switch
				parser[ delimiterType.delimiters ] = mustache;
				return delimiterChangeToken;
			}
			parser.allowWhitespace();
			mustache = mustacheContent( parser, delimiterType );
			if ( mustache === null ) {
				parser.pos = start;
				return null;
			}
			// allow whitespace before closing delimiter
			parser.allowWhitespace();
			if ( !parser.matchString( delimiters[ 1 ] ) ) {
				parser.error( 'Expected closing delimiter \'' + delimiters[ 1 ] + '\' after reference' );
			}
			if ( mustache.t === types.COMMENT ) {
				mustache.exclude = true;
			}
			if ( mustache.t === types.CLOSING ) {
				parser.sectionDepth -= 1;
				if ( parser.sectionDepth < 0 ) {
					parser.pos = start;
					parser.error( 'Attempted to close a section that wasn\'t open' );
				}
			}
			// section children
			if ( isSection( mustache ) ) {
				parser.sectionDepth += 1;
				children = [];
				currentChildren = children;
				expectedClose = mustache.n;
				while ( child = parser.read() ) {
					if ( child.t === types.CLOSING ) {
						if ( expectedClose && child.r !== expectedClose ) {
							parser.error( 'Expected {{/' + expectedClose + '}}' );
						}
						break;
					}
					// {{else}} tags require special treatment
					if ( child.t === types.INTERPOLATOR && child.r === 'else' ) {
						switch ( mustache.n ) {
							case 'unless':
								parser.error( '{{else}} not allowed in {{#unless}}' );
								break;
							case 'with':
								parser.error( '{{else}} not allowed in {{#with}}' );
								break;
							default:
								currentChildren = elseChildren = [];
								continue;
						}
					}
					currentChildren.push( child );
				}
				if ( children.length ) {
					mustache.f = children;
					// If this is an 'each' section, and it contains an {{@index}} or {{@key}},
					// we need to set the index reference accordingly
					if ( !mustache.i && mustache.n === 'each' && ( indexRef = handlebarsIndexRef( mustache.f ) ) ) {
						mustache.i = indexRef;
					}
				}
				if ( elseChildren && elseChildren.length ) {
					mustache.l = elseChildren;
				}
			}
			if ( parser.includeLinePositions ) {
				mustache.p = startPos.toJSON();
			}
			// Replace block name with code
			if ( mustache.n ) {
				mustache.n = handlebarsBlockCodes[ mustache.n ];
			} else if ( mustache.t === types.INVERTED ) {
				mustache.t = types.SECTION;
				mustache.n = types.SECTION_UNLESS;
			}
			return mustache;
		}

		function handlebarsIndexRef( fragment ) {
			var i, child, indexRef;
			i = fragment.length;
			while ( i-- ) {
				child = fragment[ i ];
				// Recurse into elements (but not sections)
				if ( child.t === types.ELEMENT && child.f && ( indexRef = handlebarsIndexRef( child.f ) ) ) {
					return indexRef;
				}
				// Mustache?
				if ( child.t === types.INTERPOLATOR || child.t === types.TRIPLE || child.t === types.SECTION ) {
					// Normal reference?
					if ( child.r && handlebarsIndexRefPattern.test( child.r ) ) {
						return child.r;
					}
					// Expression?
					if ( child.x && ( indexRef = indexRefContainedInExpression( child.x ) ) ) {
						return indexRef;
					}
					// Reference expression?
					if ( child.rx && ( indexRef = indexRefContainedInReferenceExpression( child.rx ) ) ) {
						return indexRef;
					}
				}
			}
		}

		function indexRefContainedInExpression( expression ) {
			var i;
			i = expression.r.length;
			while ( i-- ) {
				if ( handlebarsIndexRefPattern.test( expression.r[ i ] ) ) {
					return expression.r[ i ];
				}
			}
		}

		function indexRefContainedInReferenceExpression( referenceExpression ) {
			var i, indexRef, member;
			i = referenceExpression.m.length;
			while ( i-- ) {
				member = referenceExpression.m[ i ];
				if ( member.r && ( indexRef = indexRefContainedInExpression( member ) ) ) {
					return indexRef;
				}
				if ( member.t === types.REFERENCE && handlebarsIndexRefPattern.test( member.n ) ) {
					return member.n;
				}
			}
		}

		function isSection( mustache ) {
			return mustache.t === types.SECTION || mustache.t === types.INVERTED;
		}
	}( types, delimiterChange, delimiterTypes, content, handlebarsBlockCodes );

	/* parse/converters/comment.js */
	var comment = function( types ) {

		var OPEN_COMMENT = '<!--',
			CLOSE_COMMENT = '-->';
		return function( parser ) {
			var startPos, content, remaining, endIndex, comment;
			startPos = parser.getLinePos();
			if ( !parser.matchString( OPEN_COMMENT ) ) {
				return null;
			}
			remaining = parser.remaining();
			endIndex = remaining.indexOf( CLOSE_COMMENT );
			if ( endIndex === -1 ) {
				parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
			}
			content = remaining.substr( 0, endIndex );
			parser.pos += endIndex + 3;
			comment = {
				t: types.COMMENT,
				c: content
			};
			if ( parser.includeLinePositions ) {
				comment.p = startPos.toJSON();
			}
			return comment;
		};
	}( types );

	/* config/voidElementNames.js */
	var voidElementNames = function() {

		var voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
		return voidElementNames;
	}();

	/* parse/converters/utils/getLowestIndex.js */
	var getLowestIndex = function( haystack, needles ) {
		var i, index, lowest;
		i = needles.length;
		while ( i-- ) {
			index = haystack.indexOf( needles[ i ] );
			// short circuit
			if ( !index ) {
				return 0;
			}
			if ( index === -1 ) {
				continue;
			}
			if ( !lowest || index < lowest ) {
				lowest = index;
			}
		}
		return lowest || -1;
	};

	/* parse/converters/utils/decodeCharacterReferences.js */
	var decodeCharacterReferences = function() {

		var htmlEntities, controlCharacters, namedEntityPattern, hexEntityPattern, decimalEntityPattern;
		htmlEntities = {
			quot: 34,
			amp: 38,
			apos: 39,
			lt: 60,
			gt: 62,
			nbsp: 160,
			iexcl: 161,
			cent: 162,
			pound: 163,
			curren: 164,
			yen: 165,
			brvbar: 166,
			sect: 167,
			uml: 168,
			copy: 169,
			ordf: 170,
			laquo: 171,
			not: 172,
			shy: 173,
			reg: 174,
			macr: 175,
			deg: 176,
			plusmn: 177,
			sup2: 178,
			sup3: 179,
			acute: 180,
			micro: 181,
			para: 182,
			middot: 183,
			cedil: 184,
			sup1: 185,
			ordm: 186,
			raquo: 187,
			frac14: 188,
			frac12: 189,
			frac34: 190,
			iquest: 191,
			Agrave: 192,
			Aacute: 193,
			Acirc: 194,
			Atilde: 195,
			Auml: 196,
			Aring: 197,
			AElig: 198,
			Ccedil: 199,
			Egrave: 200,
			Eacute: 201,
			Ecirc: 202,
			Euml: 203,
			Igrave: 204,
			Iacute: 205,
			Icirc: 206,
			Iuml: 207,
			ETH: 208,
			Ntilde: 209,
			Ograve: 210,
			Oacute: 211,
			Ocirc: 212,
			Otilde: 213,
			Ouml: 214,
			times: 215,
			Oslash: 216,
			Ugrave: 217,
			Uacute: 218,
			Ucirc: 219,
			Uuml: 220,
			Yacute: 221,
			THORN: 222,
			szlig: 223,
			agrave: 224,
			aacute: 225,
			acirc: 226,
			atilde: 227,
			auml: 228,
			aring: 229,
			aelig: 230,
			ccedil: 231,
			egrave: 232,
			eacute: 233,
			ecirc: 234,
			euml: 235,
			igrave: 236,
			iacute: 237,
			icirc: 238,
			iuml: 239,
			eth: 240,
			ntilde: 241,
			ograve: 242,
			oacute: 243,
			ocirc: 244,
			otilde: 245,
			ouml: 246,
			divide: 247,
			oslash: 248,
			ugrave: 249,
			uacute: 250,
			ucirc: 251,
			uuml: 252,
			yacute: 253,
			thorn: 254,
			yuml: 255,
			OElig: 338,
			oelig: 339,
			Scaron: 352,
			scaron: 353,
			Yuml: 376,
			fnof: 402,
			circ: 710,
			tilde: 732,
			Alpha: 913,
			Beta: 914,
			Gamma: 915,
			Delta: 916,
			Epsilon: 917,
			Zeta: 918,
			Eta: 919,
			Theta: 920,
			Iota: 921,
			Kappa: 922,
			Lambda: 923,
			Mu: 924,
			Nu: 925,
			Xi: 926,
			Omicron: 927,
			Pi: 928,
			Rho: 929,
			Sigma: 931,
			Tau: 932,
			Upsilon: 933,
			Phi: 934,
			Chi: 935,
			Psi: 936,
			Omega: 937,
			alpha: 945,
			beta: 946,
			gamma: 947,
			delta: 948,
			epsilon: 949,
			zeta: 950,
			eta: 951,
			theta: 952,
			iota: 953,
			kappa: 954,
			lambda: 955,
			mu: 956,
			nu: 957,
			xi: 958,
			omicron: 959,
			pi: 960,
			rho: 961,
			sigmaf: 962,
			sigma: 963,
			tau: 964,
			upsilon: 965,
			phi: 966,
			chi: 967,
			psi: 968,
			omega: 969,
			thetasym: 977,
			upsih: 978,
			piv: 982,
			ensp: 8194,
			emsp: 8195,
			thinsp: 8201,
			zwnj: 8204,
			zwj: 8205,
			lrm: 8206,
			rlm: 8207,
			ndash: 8211,
			mdash: 8212,
			lsquo: 8216,
			rsquo: 8217,
			sbquo: 8218,
			ldquo: 8220,
			rdquo: 8221,
			bdquo: 8222,
			dagger: 8224,
			Dagger: 8225,
			bull: 8226,
			hellip: 8230,
			permil: 8240,
			prime: 8242,
			Prime: 8243,
			lsaquo: 8249,
			rsaquo: 8250,
			oline: 8254,
			frasl: 8260,
			euro: 8364,
			image: 8465,
			weierp: 8472,
			real: 8476,
			trade: 8482,
			alefsym: 8501,
			larr: 8592,
			uarr: 8593,
			rarr: 8594,
			darr: 8595,
			harr: 8596,
			crarr: 8629,
			lArr: 8656,
			uArr: 8657,
			rArr: 8658,
			dArr: 8659,
			hArr: 8660,
			forall: 8704,
			part: 8706,
			exist: 8707,
			empty: 8709,
			nabla: 8711,
			isin: 8712,
			notin: 8713,
			ni: 8715,
			prod: 8719,
			sum: 8721,
			minus: 8722,
			lowast: 8727,
			radic: 8730,
			prop: 8733,
			infin: 8734,
			ang: 8736,
			and: 8743,
			or: 8744,
			cap: 8745,
			cup: 8746,
			'int': 8747,
			there4: 8756,
			sim: 8764,
			cong: 8773,
			asymp: 8776,
			ne: 8800,
			equiv: 8801,
			le: 8804,
			ge: 8805,
			sub: 8834,
			sup: 8835,
			nsub: 8836,
			sube: 8838,
			supe: 8839,
			oplus: 8853,
			otimes: 8855,
			perp: 8869,
			sdot: 8901,
			lceil: 8968,
			rceil: 8969,
			lfloor: 8970,
			rfloor: 8971,
			lang: 9001,
			rang: 9002,
			loz: 9674,
			spades: 9824,
			clubs: 9827,
			hearts: 9829,
			diams: 9830
		};
		controlCharacters = [
			8364,
			129,
			8218,
			402,
			8222,
			8230,
			8224,
			8225,
			710,
			8240,
			352,
			8249,
			338,
			141,
			381,
			143,
			144,
			8216,
			8217,
			8220,
			8221,
			8226,
			8211,
			8212,
			732,
			8482,
			353,
			8250,
			339,
			157,
			382,
			376
		];
		namedEntityPattern = new RegExp( '&(' + Object.keys( htmlEntities ).join( '|' ) + ');?', 'g' );
		hexEntityPattern = /&#x([0-9]+);?/g;
		decimalEntityPattern = /&#([0-9]+);?/g;
		return function decodeCharacterReferences( html ) {
			var result;
			// named entities
			result = html.replace( namedEntityPattern, function( match, name ) {
				if ( htmlEntities[ name ] ) {
					return String.fromCharCode( htmlEntities[ name ] );
				}
				return match;
			} );
			// hex references
			result = result.replace( hexEntityPattern, function( match, hex ) {
				return String.fromCharCode( validateCode( parseInt( hex, 16 ) ) );
			} );
			// decimal references
			result = result.replace( decimalEntityPattern, function( match, charCode ) {
				return String.fromCharCode( validateCode( charCode ) );
			} );
			return result;
		};
		// some code points are verboten. If we were inserting HTML, the browser would replace the illegal
		// code points with alternatives in some cases - since we're bypassing that mechanism, we need
		// to replace them ourselves
		//
		// Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
		function validateCode( code ) {
			if ( !code ) {
				return 65533;
			}
			// line feed becomes generic whitespace
			if ( code === 10 ) {
				return 32;
			}
			// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
			if ( code < 128 ) {
				return code;
			}
			// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
			// to correct the mistake or we'll end up with missing € signs and so on
			if ( code <= 159 ) {
				return controlCharacters[ code - 128 ];
			}
			// basic multilingual plane
			if ( code < 55296 ) {
				return code;
			}
			// UTF-16 surrogate halves
			if ( code <= 57343 ) {
				return 65533;
			}
			// rest of the basic multilingual plane
			if ( code <= 65535 ) {
				return code;
			}
			return 65533;
		}
	}( legacy );

	/* parse/converters/text.js */
	var text = function( getLowestIndex, decodeCharacterReferences ) {

		return function( parser ) {
			var index, remaining, disallowed, barrier;
			remaining = parser.remaining();
			barrier = parser.inside ? '</' + parser.inside : '<';
			if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
				index = remaining.indexOf( barrier );
			} else {
				disallowed = [
					barrier,
					parser.delimiters[ 0 ],
					parser.tripleDelimiters[ 0 ],
					parser.staticDelimiters[ 0 ],
					parser.staticTripleDelimiters[ 0 ]
				];
				// http://developers.whatwg.org/syntax.html#syntax-attributes
				if ( parser.inAttribute === true ) {
					// we're inside an unquoted attribute value
					disallowed.push( '"', '\'', '=', '>', '`' );
				} else if ( parser.inAttribute ) {
					disallowed.push( parser.inAttribute );
				}
				index = getLowestIndex( remaining, disallowed );
			}
			if ( !index ) {
				return null;
			}
			if ( index === -1 ) {
				index = remaining.length;
			}
			parser.pos += index;
			return decodeCharacterReferences( remaining.substr( 0, index ) );
		};
	}( getLowestIndex, decodeCharacterReferences );

	/* parse/converters/element/closingTag.js */
	var closingTag = function( types ) {

		var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;
		return function( parser ) {
			var tag;
			// are we looking at a closing tag?
			if ( !parser.matchString( '</' ) ) {
				return null;
			}
			if ( tag = parser.matchPattern( closingTagPattern ) ) {
				return {
					t: types.CLOSING_TAG,
					e: tag
				};
			}
			// We have an illegal closing tag, report it
			parser.pos -= 2;
			parser.error( 'Illegal closing tag' );
		};
	}( types );

	/* parse/converters/element/attribute.js */
	var attribute = function( getLowestIndex, getMustache ) {

		var attributeNamePattern = /^[^\s"'>\/=]+/,
			unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;
		return getAttribute;

		function getAttribute( parser ) {
			var attr, name, value;
			parser.allowWhitespace();
			name = parser.matchPattern( attributeNamePattern );
			if ( !name ) {
				return null;
			}
			attr = {
				name: name
			};
			value = getAttributeValue( parser );
			if ( value ) {
				attr.value = value;
			}
			return attr;
		}

		function getAttributeValue( parser ) {
			var start, valueStart, startDepth, value;
			start = parser.pos;
			parser.allowWhitespace();
			if ( !parser.matchString( '=' ) ) {
				parser.pos = start;
				return null;
			}
			parser.allowWhitespace();
			valueStart = parser.pos;
			startDepth = parser.sectionDepth;
			value = getQuotedAttributeValue( parser, '\'' ) || getQuotedAttributeValue( parser, '"' ) || getUnquotedAttributeValue( parser );
			if ( parser.sectionDepth !== startDepth ) {
				parser.pos = valueStart;
				parser.error( 'An attribute value must contain as many opening section tags as closing section tags' );
			}
			if ( value === null ) {
				parser.pos = start;
				return null;
			}
			if ( value.length === 1 && typeof value[ 0 ] === 'string' ) {
				return value[ 0 ];
			}
			return value;
		}

		function getUnquotedAttributeValueToken( parser ) {
			var start, text, index;
			start = parser.pos;
			text = parser.matchPattern( unquotedAttributeValueTextPattern );
			if ( !text ) {
				return null;
			}
			if ( ( index = text.indexOf( parser.delimiters[ 0 ] ) ) !== -1 ) {
				text = text.substr( 0, index );
				parser.pos = start + text.length;
			}
			return text;
		}

		function getUnquotedAttributeValue( parser ) {
			var tokens, token;
			parser.inAttribute = true;
			tokens = [];
			token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
			while ( token !== null ) {
				tokens.push( token );
				token = getMustache( parser ) || getUnquotedAttributeValueToken( parser );
			}
			if ( !tokens.length ) {
				return null;
			}
			parser.inAttribute = false;
			return tokens;
		}

		function getQuotedAttributeValue( parser, quoteMark ) {
			var start, tokens, token;
			start = parser.pos;
			if ( !parser.matchString( quoteMark ) ) {
				return null;
			}
			parser.inAttribute = quoteMark;
			tokens = [];
			token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
			while ( token !== null ) {
				tokens.push( token );
				token = getMustache( parser ) || getQuotedStringToken( parser, quoteMark );
			}
			if ( !parser.matchString( quoteMark ) ) {
				parser.pos = start;
				return null;
			}
			parser.inAttribute = false;
			return tokens;
		}

		function getQuotedStringToken( parser, quoteMark ) {
			var start, index, remaining;
			start = parser.pos;
			remaining = parser.remaining();
			index = getLowestIndex( remaining, [
				quoteMark,
				parser.delimiters[ 0 ],
				parser.delimiters[ 1 ]
			] );
			if ( index === -1 ) {
				parser.error( 'Quoted attribute value must have a closing quote' );
			}
			if ( !index ) {
				return null;
			}
			parser.pos += index;
			return remaining.substr( 0, index );
		}
	}( getLowestIndex, mustache );

	/* utils/parseJSON.js */
	var parseJSON = function( Parser, getStringLiteral, getKey ) {

		// simple JSON parser, without the restrictions of JSON parse
		// (i.e. having to double-quote keys).
		//
		// If passed a hash of values as the second argument, ${placeholders}
		// will be replaced with those values
		var JsonParser, specials, specialsPattern, numberPattern, placeholderPattern, placeholderAtStartPattern, onlyWhitespace;
		specials = {
			'true': true,
			'false': false,
			'undefined': undefined,
			'null': null
		};
		specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
		numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
		placeholderPattern = /\$\{([^\}]+)\}/g;
		placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
		onlyWhitespace = /^\s*$/;
		JsonParser = Parser.extend( {
			init: function( str, options ) {
				this.values = options.values;
			},
			postProcess: function( result ) {
				if ( result.length !== 1 || !onlyWhitespace.test( this.leftover ) ) {
					return null;
				}
				return {
					value: result[ 0 ].v
				};
			},
			converters: [

				function getPlaceholder( parser ) {
					var placeholder;
					if ( !parser.values ) {
						return null;
					}
					placeholder = parser.matchPattern( placeholderAtStartPattern );
					if ( placeholder && parser.values.hasOwnProperty( placeholder ) ) {
						return {
							v: parser.values[ placeholder ]
						};
					}
				},
				function getSpecial( parser ) {
					var special;
					if ( special = parser.matchPattern( specialsPattern ) ) {
						return {
							v: specials[ special ]
						};
					}
				},
				function getNumber( parser ) {
					var number;
					if ( number = parser.matchPattern( numberPattern ) ) {
						return {
							v: +number
						};
					}
				},
				function getString( parser ) {
					var stringLiteral = getStringLiteral( parser ),
						values;
					if ( stringLiteral && ( values = parser.values ) ) {
						return {
							v: stringLiteral.v.replace( placeholderPattern, function( match, $1 ) {
								return $1 in values ? values[ $1 ] : $1;
							} )
						};
					}
					return stringLiteral;
				},
				function getObject( parser ) {
					var result, pair;
					if ( !parser.matchString( '{' ) ) {
						return null;
					}
					result = {};
					parser.allowWhitespace();
					if ( parser.matchString( '}' ) ) {
						return {
							v: result
						};
					}
					while ( pair = getKeyValuePair( parser ) ) {
						result[ pair.key ] = pair.value;
						parser.allowWhitespace();
						if ( parser.matchString( '}' ) ) {
							return {
								v: result
							};
						}
						if ( !parser.matchString( ',' ) ) {
							return null;
						}
					}
					return null;
				},
				function getArray( parser ) {
					var result, valueToken;
					if ( !parser.matchString( '[' ) ) {
						return null;
					}
					result = [];
					parser.allowWhitespace();
					if ( parser.matchString( ']' ) ) {
						return {
							v: result
						};
					}
					while ( valueToken = parser.read() ) {
						result.push( valueToken.v );
						parser.allowWhitespace();
						if ( parser.matchString( ']' ) ) {
							return {
								v: result
							};
						}
						if ( !parser.matchString( ',' ) ) {
							return null;
						}
						parser.allowWhitespace();
					}
					return null;
				}
			]
		} );

		function getKeyValuePair( parser ) {
			var key, valueToken, pair;
			parser.allowWhitespace();
			key = getKey( parser );
			if ( !key ) {
				return null;
			}
			pair = {
				key: key
			};
			parser.allowWhitespace();
			if ( !parser.matchString( ':' ) ) {
				return null;
			}
			parser.allowWhitespace();
			valueToken = parser.read();
			if ( !valueToken ) {
				return null;
			}
			pair.value = valueToken.v;
			return pair;
		}
		return function( str, values ) {
			var parser = new JsonParser( str, {
				values: values
			} );
			return parser.result;
		};
	}( Parser, stringLiteral, key );

	/* parse/converters/element/processDirective.js */
	var processDirective = function( parseJSON ) {

		// TODO clean this up, it's shocking
		return function( tokens ) {
			var result, token, colonIndex, directiveName, directiveArgs, parsed;
			if ( typeof tokens === 'string' ) {
				if ( tokens.indexOf( ':' ) === -1 ) {
					return tokens.trim();
				}
				tokens = [ tokens ];
			}
			result = {};
			directiveName = [];
			directiveArgs = [];
			while ( tokens.length ) {
				token = tokens.shift();
				if ( typeof token === 'string' ) {
					colonIndex = token.indexOf( ':' );
					if ( colonIndex === -1 ) {
						directiveName.push( token );
					} else {
						// is the colon the first character?
						if ( colonIndex ) {
							// no
							directiveName.push( token.substr( 0, colonIndex ) );
						}
						// if there is anything after the colon in this token, treat
						// it as the first token of the directiveArgs fragment
						if ( token.length > colonIndex + 1 ) {
							directiveArgs[ 0 ] = token.substring( colonIndex + 1 );
						}
						break;
					}
				} else {
					directiveName.push( token );
				}
			}
			directiveArgs = directiveArgs.concat( tokens );
			if ( directiveArgs.length || typeof directiveName !== 'string' ) {
				result = {
					// TODO is this really necessary? just use the array
					n: directiveName.length === 1 && typeof directiveName[ 0 ] === 'string' ? directiveName[ 0 ] : directiveName
				};
				if ( directiveArgs.length === 1 && typeof directiveArgs[ 0 ] === 'string' ) {
					parsed = parseJSON( '[' + directiveArgs[ 0 ] + ']' );
					result.a = parsed ? parsed.value : directiveArgs[ 0 ].trim();
				} else {
					result.d = directiveArgs;
				}
			} else {
				result = directiveName;
			}
			return result;
		};
	}( parseJSON );

	/* parse/converters/element.js */
	var element = function( types, voidElementNames, getMustache, getComment, getText, getClosingTag, getAttribute, processDirective ) {

		var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
			validTagNameFollower = /^[\s\n\/>]/,
			onPattern = /^on/,
			proxyEventPattern = /^on-([a-zA-Z$_][a-zA-Z$_0-9\-]+)$/,
			reservedEventNames = /^(?:change|reset|teardown|update)$/,
			directives = {
				'intro-outro': 't0',
				intro: 't1',
				outro: 't2',
				decorator: 'o'
			},
			exclude = {
				exclude: true
			},
			converters;
		// Different set of converters, because this time we're looking for closing tags
		converters = [
			getMustache,
			getComment,
			getElement,
			getText,
			getClosingTag
		];
		return getElement;

		function getElement( parser ) {
			var start, startPos, element, lowerCaseName, directiveName, match, addProxyEvent, attribute, directive, selfClosing, children, child;
			start = parser.pos;
			startPos = parser.getLinePos();
			if ( parser.inside ) {
				return null;
			}
			if ( !parser.matchString( '<' ) ) {
				return null;
			}
			// if this is a closing tag, abort straight away
			if ( parser.nextChar() === '/' ) {
				return null;
			}
			element = {
				t: types.ELEMENT
			};
			if ( parser.includeLinePositions ) {
				element.p = startPos.toJSON();
			}
			if ( parser.matchString( '!' ) ) {
				element.y = 1;
			}
			// element name
			element.e = parser.matchPattern( tagNamePattern );
			if ( !element.e ) {
				return null;
			}
			// next character must be whitespace, closing solidus or '>'
			if ( !validTagNameFollower.test( parser.nextChar() ) ) {
				parser.error( 'Illegal tag name' );
			}
			addProxyEvent = function( name, directive ) {
				var directiveName = directive.n || directive;
				if ( reservedEventNames.test( directiveName ) ) {
					parser.pos -= directiveName.length;
					parser.error( 'Cannot use reserved event names (change, reset, teardown, update)' );
				}
				element.v[ name ] = directive;
			};
			// directives and attributes
			while ( attribute = getAttribute( parser ) ) {
				// intro, outro, decorator
				if ( directiveName = directives[ attribute.name ] ) {
					element[ directiveName ] = processDirective( attribute.value );
				} else if ( match = proxyEventPattern.exec( attribute.name ) ) {
					if ( !element.v )
						element.v = {};
					directive = processDirective( attribute.value );
					addProxyEvent( match[ 1 ], directive );
				} else {
					if ( !parser.sanitizeEventAttributes || !onPattern.test( attribute.name ) ) {
						if ( !element.a )
							element.a = {};
						element.a[ attribute.name ] = attribute.value || 0;
					}
				}
			}
			// allow whitespace before closing solidus
			parser.allowWhitespace();
			// self-closing solidus?
			if ( parser.matchString( '/' ) ) {
				selfClosing = true;
			}
			// closing angle bracket
			if ( !parser.matchString( '>' ) ) {
				return null;
			}
			lowerCaseName = element.e.toLowerCase();
			if ( !selfClosing && !voidElementNames.test( element.e ) ) {
				// Special case - if we open a script element, further tags should
				// be ignored unless they're a closing script element
				if ( lowerCaseName === 'script' || lowerCaseName === 'style' ) {
					parser.inside = lowerCaseName;
				}
				children = [];
				while ( child = parser.read( converters ) ) {
					// Special case - closing section tag
					if ( child.t === types.CLOSING ) {
						break;
					}
					if ( child.t === types.CLOSING_TAG ) {
						break;
					}
					children.push( child );
				}
				if ( children.length ) {
					element.f = children;
				}
			}
			parser.inside = null;
			if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
				return exclude;
			}
			return element;
		}
	}( types, voidElementNames, mustache, comment, text, closingTag, attribute, processDirective );

	/* parse/utils/trimWhitespace.js */
	var trimWhitespace = function() {

		var leadingWhitespace = /^[ \t\f\r\n]+/,
			trailingWhitespace = /[ \t\f\r\n]+$/;
		return function( items, leading, trailing ) {
			var item;
			if ( leading ) {
				item = items[ 0 ];
				if ( typeof item === 'string' ) {
					item = item.replace( leadingWhitespace, '' );
					if ( !item ) {
						items.shift();
					} else {
						items[ 0 ] = item;
					}
				}
			}
			if ( trailing ) {
				item = items[ items.length - 1 ];
				if ( typeof item === 'string' ) {
					item = item.replace( trailingWhitespace, '' );
					if ( !item ) {
						items.pop();
					} else {
						items[ items.length - 1 ] = item;
					}
				}
			}
		};
	}();

	/* parse/utils/stripStandalones.js */
	var stripStandalones = function( types ) {

		var leadingLinebreak = /^\s*\r?\n/,
			trailingLinebreak = /\r?\n\s*$/;
		return function( items ) {
			var i, current, backOne, backTwo, lastSectionItem;
			for ( i = 1; i < items.length; i += 1 ) {
				current = items[ i ];
				backOne = items[ i - 1 ];
				backTwo = items[ i - 2 ];
				// if we're at the end of a [text][comment][text] sequence...
				if ( isString( current ) && isComment( backOne ) && isString( backTwo ) ) {
					// ... and the comment is a standalone (i.e. line breaks either side)...
					if ( trailingLinebreak.test( backTwo ) && leadingLinebreak.test( current ) ) {
						// ... then we want to remove the whitespace after the first line break
						items[ i - 2 ] = backTwo.replace( trailingLinebreak, '\n' );
						// and the leading line break of the second text token
						items[ i ] = current.replace( leadingLinebreak, '' );
					}
				}
				// if the current item is a section, and it is preceded by a linebreak, and
				// its first item is a linebreak...
				if ( isSection( current ) && isString( backOne ) ) {
					if ( trailingLinebreak.test( backOne ) && isString( current.f[ 0 ] ) && leadingLinebreak.test( current.f[ 0 ] ) ) {
						items[ i - 1 ] = backOne.replace( trailingLinebreak, '\n' );
						current.f[ 0 ] = current.f[ 0 ].replace( leadingLinebreak, '' );
					}
				}
				// if the last item was a section, and it is followed by a linebreak, and
				// its last item is a linebreak...
				if ( isString( current ) && isSection( backOne ) ) {
					lastSectionItem = backOne.f[ backOne.f.length - 1 ];
					if ( isString( lastSectionItem ) && trailingLinebreak.test( lastSectionItem ) && leadingLinebreak.test( current ) ) {
						backOne.f[ backOne.f.length - 1 ] = lastSectionItem.replace( trailingLinebreak, '\n' );
						items[ i ] = current.replace( leadingLinebreak, '' );
					}
				}
			}
			return items;
		};

		function isString( item ) {
			return typeof item === 'string';
		}

		function isComment( item ) {
			return item.t === types.COMMENT || item.t === types.DELIMCHANGE;
		}

		function isSection( item ) {
			return ( item.t === types.SECTION || item.t === types.INVERTED ) && item.f;
		}
	}( types );

	/* parse/_parse.js */
	var parse = function( types, Parser, mustache, comment, element, text, trimWhitespace, stripStandalones ) {

		// Ractive.parse
		// ===============
		//
		// Takes in a string, and returns an object representing the parsed template.
		// A parsed template is an array of 1 or more 'templates', which in some
		// cases have children.
		//
		// The format is optimised for size, not readability, however for reference the
		// keys for each template are as follows:
		//
		// * r - Reference, e.g. 'mustache' in {{mustache}}
		// * t - Type code (e.g. 1 is text, 2 is interpolator...)
		// * f - Fragment. Contains a template's children
		// * l - eLse fragment. Contains a template's children in the else case
		// * e - Element name
		// * a - map of element Attributes, or proxy event/transition Arguments
		// * d - Dynamic proxy event/transition arguments
		// * n - indicates an iNverted section
		// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
		// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
		// * x - eXpressions
		// * s - String representation of an expression function
		// * t0 - intro/outro Transition
		// * t1 - intro Transition
		// * t2 - outro Transition
		// * o - decOrator
		// * y - is doctYpe
		// * c - is Content (e.g. of a comment node)
		// * p - line Position information - array with line number and character position of each node
		var StandardParser, parse, contiguousWhitespace = /[ \t\f\r\n]+/g,
			inlinePartialStart = /<!--\s*\{\{\s*>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/,
			inlinePartialEnd = /<!--\s*\{\{\s*\/\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/,
			preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i,
			leadingWhitespace = /^\s+/,
			trailingWhitespace = /\s+$/;
		StandardParser = Parser.extend( {
			init: function( str, options ) {
				// config
				this.delimiters = options.delimiters || [
					'{{',
					'}}'
				];
				this.tripleDelimiters = options.tripleDelimiters || [
					'{{{',
					'}}}'
				];
				this.staticDelimiters = options.staticDelimiters || [
					'[[',
					']]'
				];
				this.staticTripleDelimiters = options.staticTripleDelimiters || [
					'[[[',
					']]]'
				];
				this.sectionDepth = 0;
				this.interpolate = {
					script: !options.interpolate || options.interpolate.script !== false,
					style: !options.interpolate || options.interpolate.style !== false
				};
				if ( options.sanitize === true ) {
					options.sanitize = {
						// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
						elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
						eventAttributes: true
					};
				}
				this.sanitizeElements = options.sanitize && options.sanitize.elements;
				this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
				this.includeLinePositions = options.includeLinePositions;
			},
			postProcess: function( items, options ) {
				if ( this.sectionDepth > 0 ) {
					this.error( 'A section was left open' );
				}
				cleanup( items, options.stripComments !== false, options.preserveWhitespace, !options.preserveWhitespace, !options.preserveWhitespace, options.rewriteElse !== false );
				return items;
			},
			converters: [
				mustache,
				comment,
				element,
				text
			]
		} );
		parse = function( template ) {
			var options = arguments[ 1 ];
			if ( options === void 0 )
				options = {};
			var result, remaining, partials, name, startMatch, endMatch;
			result = {
				v: 1
			};
			if ( inlinePartialStart.test( template ) ) {
				remaining = template;
				template = '';
				while ( startMatch = inlinePartialStart.exec( remaining ) ) {
					name = startMatch[ 1 ];
					template += remaining.substr( 0, startMatch.index );
					remaining = remaining.substring( startMatch.index + startMatch[ 0 ].length );
					endMatch = inlinePartialEnd.exec( remaining );
					if ( !endMatch || endMatch[ 1 ] !== name ) {
						throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested' );
					}
					( partials || ( partials = {} ) )[ name ] = new StandardParser( remaining.substr( 0, endMatch.index ), options ).result;
					remaining = remaining.substring( endMatch.index + endMatch[ 0 ].length );
				}
				result.p = partials;
			}
			result.t = new StandardParser( template, options ).result;
			return result;
		};
		return parse;

		function cleanup( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace, rewriteElse ) {
			var i, item, previousItem, nextItem, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, unlessBlock, key;
			// First pass - remove standalones and comments etc
			stripStandalones( items );
			i = items.length;
			while ( i-- ) {
				item = items[ i ];
				// Remove delimiter changes, unsafe elements etc
				if ( item.exclude ) {
					items.splice( i, 1 );
				} else if ( stripComments && item.t === types.COMMENT ) {
					items.splice( i, 1 );
				}
			}
			// If necessary, remove leading and trailing whitespace
			trimWhitespace( items, removeLeadingWhitespace, removeTrailingWhitespace );
			i = items.length;
			while ( i-- ) {
				item = items[ i ];
				// Recurse
				if ( item.f ) {
					preserveWhitespaceInsideFragment = preserveWhitespace || item.t === types.ELEMENT && preserveWhitespaceElements.test( item.e );
					if ( !preserveWhitespaceInsideFragment ) {
						previousItem = items[ i - 1 ];
						nextItem = items[ i + 1 ];
						// if the previous item was a text item with trailing whitespace,
						// remove leading whitespace inside the fragment
						if ( !previousItem || typeof previousItem === 'string' && trailingWhitespace.test( previousItem ) ) {
							removeLeadingWhitespaceInsideFragment = true;
						}
						// and vice versa
						if ( !nextItem || typeof nextItem === 'string' && leadingWhitespace.test( nextItem ) ) {
							removeTrailingWhitespaceInsideFragment = true;
						}
					}
					cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, rewriteElse );
					// Split if-else blocks into two (an if, and an unless)
					if ( item.l ) {
						cleanup( item.l, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, rewriteElse );
						if ( rewriteElse ) {
							unlessBlock = {
								t: 4,
								n: types.SECTION_UNLESS,
								f: item.l
							};
							// copy the conditional based on its type
							if ( item.r ) {
								unlessBlock.r = item.r;
							}
							if ( item.x ) {
								unlessBlock.x = item.x;
							}
							if ( item.rx ) {
								unlessBlock.rx = item.rx;
							}
							items.splice( i + 1, 0, unlessBlock );
							delete item.l;
						}
					}
				}
				// Clean up element attributes
				if ( item.a ) {
					for ( key in item.a ) {
						if ( item.a.hasOwnProperty( key ) && typeof item.a[ key ] !== 'string' ) {
							cleanup( item.a[ key ], stripComments, preserveWhitespace, rewriteElse );
						}
					}
				}
			}
			// final pass - fuse text nodes together
			i = items.length;
			while ( i-- ) {
				if ( typeof items[ i ] === 'string' ) {
					if ( typeof items[ i + 1 ] === 'string' ) {
						items[ i ] = items[ i ] + items[ i + 1 ];
						items.splice( i + 1, 1 );
					}
					if ( !preserveWhitespace ) {
						items[ i ] = items[ i ].replace( contiguousWhitespace, ' ' );
					}
					if ( items[ i ] === '' ) {
						items.splice( i, 1 );
					}
				}
			}
		}
	}( types, Parser, mustache, comment, element, text, trimWhitespace, stripStandalones );

	/* config/options/groups/optionGroup.js */
	var optionGroup = function() {

		return function createOptionGroup( keys, config ) {
			var group = keys.map( config );
			keys.forEach( function( key, i ) {
				group[ key ] = group[ i ];
			} );
			return group;
		};
	}( legacy );

	/* config/options/groups/parseOptions.js */
	var parseOptions = function( optionGroup ) {

		var keys, parseOptions;
		keys = [
			'preserveWhitespace',
			'sanitize',
			'stripComments',
			'delimiters',
			'tripleDelimiters'
		];
		parseOptions = optionGroup( keys, function( key ) {
			return key;
		} );
		return parseOptions;
	}( optionGroup );

	/* config/options/template/parser.js */
	var parser = function( errors, isClient, parse, create, parseOptions ) {

		var parser = {
			parse: doParse,
			fromId: fromId,
			isHashedId: isHashedId,
			isParsed: isParsed,
			getParseOptions: getParseOptions,
			createHelper: createHelper
		};

		function createHelper( parseOptions ) {
			var helper = create( parser );
			helper.parse = function( template, options ) {
				return doParse( template, options || parseOptions );
			};
			return helper;
		}

		function doParse( template, parseOptions ) {
			if ( !parse ) {
				throw new Error( errors.missingParser );
			}
			return parse( template, parseOptions || this.options );
		}

		function fromId( id, options ) {
			var template;
			if ( !isClient ) {
				if ( options && options.noThrow ) {
					return;
				}
				throw new Error( 'Cannot retrieve template #' + id + ' as Ractive is not running in a browser.' );
			}
			if ( isHashedId( id ) ) {
				id = id.substring( 1 );
			}
			if ( !( template = document.getElementById( id ) ) ) {
				if ( options && options.noThrow ) {
					return;
				}
				throw new Error( 'Could not find template element with id #' + id );
			}
			// Do we want to turn this on?
			/*
            	if ( template.tagName.toUpperCase() !== 'SCRIPT' )) {
            		if ( options && options.noThrow ) { return; }
            		throw new Error( 'Template element with id #' + id + ', must be a <script> element' );
            	}
            	*/
			return template.innerHTML;
		}

		function isHashedId( id ) {
			return id.charAt( 0 ) === '#';
		}

		function isParsed( template ) {
			return !( typeof template === 'string' );
		}

		function getParseOptions( ractive ) {
			// Could be Ractive or a Component
			if ( ractive.defaults ) {
				ractive = ractive.defaults;
			}
			return parseOptions.reduce( function( val, key ) {
				val[ key ] = ractive[ key ];
				return val;
			}, {} );
		}
		return parser;
	}( errors, isClient, parse, create, parseOptions );

	/* config/options/template/template.js */
	var template = function( parser, parse ) {

		var templateConfig = {
			name: 'template',
			extend: function extend( Parent, proto, options ) {
				var template;
				// only assign if exists
				if ( 'template' in options ) {
					template = options.template;
					if ( typeof template === 'function' ) {
						proto.template = template;
					} else {
						proto.template = parseIfString( template, proto );
					}
				}
			},
			init: function init( Parent, ractive, options ) {
				var template, fn;
				// TODO because of prototypal inheritance, we might just be able to use
				// ractive.template, and not bother passing through the Parent object.
				// At present that breaks the test mocks' expectations
				template = 'template' in options ? options.template : Parent.prototype.template;
				if ( typeof template === 'function' ) {
					fn = template;
					template = getDynamicTemplate( ractive, fn );
					ractive._config.template = {
						fn: fn,
						result: template
					};
				}
				template = parseIfString( template, ractive );
				// TODO the naming of this is confusing - ractive.template refers to [...],
				// but Component.prototype.template refers to {v:1,t:[],p:[]}...
				// it's unnecessary, because the developer never needs to access
				// ractive.template
				ractive.template = template.t;
				if ( template.p ) {
					extendPartials( ractive.partials, template.p );
				}
			},
			reset: function( ractive ) {
				var result = resetValue( ractive ),
					parsed;
				if ( result ) {
					parsed = parseIfString( result, ractive );
					ractive.template = parsed.t;
					extendPartials( ractive.partials, parsed.p, true );
					return true;
				}
			}
		};

		function resetValue( ractive ) {
			var initial = ractive._config.template,
				result;
			// If this isn't a dynamic template, there's nothing to do
			if ( !initial || !initial.fn ) {
				return;
			}
			result = getDynamicTemplate( ractive, initial.fn );
			// TODO deep equality check to prevent unnecessary re-rendering
			// in the case of already-parsed templates
			if ( result !== initial.result ) {
				initial.result = result;
				result = parseIfString( result, ractive );
				return result;
			}
		}

		function getDynamicTemplate( ractive, fn ) {
			var helper = parser.createHelper( parser.getParseOptions( ractive ) );
			return fn.call( ractive, ractive.data, helper );
		}

		function parseIfString( template, ractive ) {
			if ( typeof template === 'string' ) {
				// ID of an element containing the template?
				if ( template[ 0 ] === '#' ) {
					template = parser.fromId( template );
				}
				template = parse( template, parser.getParseOptions( ractive ) );
			} else if ( template.v !== 1 ) {
				throw new Error( 'Mismatched template version! Please ensure you are using the latest version of Ractive.js in your build process as well as in your app' );
			}
			return template;
		}

		function extendPartials( existingPartials, newPartials, overwrite ) {
			if ( !newPartials )
				return;
			// TODO there's an ambiguity here - we need to overwrite in the `reset()`
			// case, but not initially...
			for ( var key in newPartials ) {
				if ( overwrite || !existingPartials.hasOwnProperty( key ) ) {
					existingPartials[ key ] = newPartials[ key ];
				}
			}
		}
		return templateConfig;
	}( parser, parse );

	/* config/options/Registry.js */
	var Registry = function( create ) {

		function Registry( name, useDefaults ) {
			this.name = name;
			this.useDefaults = useDefaults;
		}
		Registry.prototype = {
			constructor: Registry,
			extend: function( Parent, proto, options ) {
				this.configure( this.useDefaults ? Parent.defaults : Parent, this.useDefaults ? proto : proto.constructor, options );
			},
			init: function( Parent, ractive, options ) {
				this.configure( this.useDefaults ? Parent.defaults : Parent, ractive, options );
			},
			configure: function( Parent, target, options ) {
				var name = this.name,
					option = options[ name ],
					registry;
				registry = create( Parent[ name ] );
				for ( var key in option ) {
					registry[ key ] = option[ key ];
				}
				target[ name ] = registry;
			},
			reset: function( ractive ) {
				var registry = ractive[ this.name ];
				var changed = false;
				Object.keys( registry ).forEach( function( key ) {
					var item = registry[ key ];
					if ( item._fn ) {
						if ( item._fn.isOwner ) {
							registry[ key ] = item._fn;
						} else {
							delete registry[ key ];
						}
						changed = true;
					}
				} );
				return changed;
			},
			findOwner: function( ractive, key ) {
				return ractive[ this.name ].hasOwnProperty( key ) ? ractive : this.findConstructor( ractive.constructor, key );
			},
			findConstructor: function( constructor, key ) {
				if ( !constructor ) {
					return;
				}
				return constructor[ this.name ].hasOwnProperty( key ) ? constructor : this.findConstructor( constructor._parent, key );
			},
			find: function( ractive, key ) {
				var this$0 = this;
				return recurseFind( ractive, function( r ) {
					return r[ this$0.name ][ key ];
				} );
			},
			findInstance: function( ractive, key ) {
				var this$0 = this;
				return recurseFind( ractive, function( r ) {
					return r[ this$0.name ][ key ] ? r : void 0;
				} );
			}
		};

		function recurseFind( ractive, fn ) {
			var find, parent;
			if ( find = fn( ractive ) ) {
				return find;
			}
			if ( !ractive.isolated && ( parent = ractive._parent ) ) {
				return recurseFind( parent, fn );
			}
		}
		return Registry;
	}( create, legacy );

	/* config/options/groups/registries.js */
	var registries = function( optionGroup, Registry ) {

		var keys = [
				'adaptors',
				'components',
				'computed',
				'decorators',
				'easing',
				'events',
				'interpolators',
				'partials',
				'transitions'
			],
			registries = optionGroup( keys, function( key ) {
				return new Registry( key, key === 'computed' );
			} );
		return registries;
	}( optionGroup, Registry );

	/* utils/noop.js */
	var noop = function() {};

	/* utils/wrapPrototypeMethod.js */
	var wrapPrototypeMethod = function( noop ) {

		return function wrap( parent, name, method ) {
			if ( !/_super/.test( method ) ) {
				return method;
			}
			var wrapper = function wrapSuper() {
				var superMethod = getSuperMethod( wrapper._parent, name ),
					hasSuper = '_super' in this,
					oldSuper = this._super,
					result;
				this._super = superMethod;
				result = method.apply( this, arguments );
				if ( hasSuper ) {
					this._super = oldSuper;
				} else {
					delete this._super;
				}
				return result;
			};
			wrapper._parent = parent;
			wrapper._method = method;
			return wrapper;
		};

		function getSuperMethod( parent, name ) {
			var method;
			if ( name in parent ) {
				var value = parent[ name ];
				if ( typeof value === 'function' ) {
					method = value;
				} else {
					method = function returnValue() {
						return value;
					};
				}
			} else {
				method = noop;
			}
			return method;
		}
	}( noop );

	/* config/deprecate.js */
	var deprecate = function( warn, isArray ) {

		function deprecate( options, deprecated, correct ) {
			if ( deprecated in options ) {
				if ( !( correct in options ) ) {
					warn( getMessage( deprecated, correct ) );
					options[ correct ] = options[ deprecated ];
				} else {
					throw new Error( getMessage( deprecated, correct, true ) );
				}
			}
		}

		function getMessage( deprecated, correct, isError ) {
			return 'options.' + deprecated + ' has been deprecated in favour of options.' + correct + '.' + ( isError ? ' You cannot specify both options, please use options.' + correct + '.' : '' );
		}

		function deprecateEventDefinitions( options ) {
			deprecate( options, 'eventDefinitions', 'events' );
		}

		function deprecateAdaptors( options ) {
			// Using extend with Component instead of options,
			// like Human.extend( Spider ) means adaptors as a registry
			// gets copied to options. So we have to check if actually an array
			if ( isArray( options.adaptors ) ) {
				deprecate( options, 'adaptors', 'adapt' );
			}
		}
		return function deprecateOptions( options ) {
			deprecateEventDefinitions( options );
			deprecateAdaptors( options );
		};
	}( warn, isArray );

	/* config/config.js */
	var config = function( css, data, defaults, template, parseOptions, registries, wrap, deprecate ) {

		var custom, options, config;
		custom = {
			data: data,
			template: template,
			css: css
		};
		options = Object.keys( defaults ).filter( function( key ) {
			return !registries[ key ] && !custom[ key ] && !parseOptions[ key ];
		} );
		// this defines the order:
		config = [].concat( custom.data, parseOptions, options, registries, custom.template, custom.css );
		for ( var key in custom ) {
			config[ key ] = custom[ key ];
		}
		// for iteration
		config.keys = Object.keys( defaults ).concat( registries.map( function( r ) {
			return r.name;
		} ) ).concat( [ 'css' ] );
		config.parseOptions = parseOptions;
		config.registries = registries;

		function customConfig( method, key, Parent, instance, options ) {
			custom[ key ][ method ]( Parent, instance, options );
		}
		config.extend = function( Parent, proto, options ) {
			configure( 'extend', Parent, proto, options );
		};
		config.init = function( Parent, ractive, options ) {
			configure( 'init', Parent, ractive, options );
			if ( ractive._config ) {
				ractive._config.options = options;
			}
		};

		function configure( method, Parent, instance, options ) {
			deprecate( options );
			customConfig( method, 'data', Parent, instance, options );
			config.parseOptions.forEach( function( key ) {
				if ( key in options ) {
					instance[ key ] = options[ key ];
				}
			} );
			for ( var key in options ) {
				if ( key in defaults && !( key in config.parseOptions ) && !( key in custom ) ) {
					var value = options[ key ];
					instance[ key ] = typeof value === 'function' ? wrap( Parent.prototype, key, value ) : value;
				}
			}
			config.registries.forEach( function( registry ) {
				registry[ method ]( Parent, instance, options );
			} );
			customConfig( method, 'template', Parent, instance, options );
			customConfig( method, 'css', Parent, instance, options );
		}
		config.reset = function( ractive ) {
			return config.filter( function( c ) {
				return c.reset && c.reset( ractive );
			} ).map( function( c ) {
				return c.name;
			} );
		};
		return config;
	}( css, data, options, template, parseOptions, registries, wrapPrototypeMethod, deprecate );

	/* shared/interpolate.js */
	var interpolate = function( circular, warn, interpolators, config ) {

		var interpolate = function( from, to, ractive, type ) {
			if ( from === to ) {
				return snap( to );
			}
			if ( type ) {
				var interpol = config.registries.interpolators.find( ractive, type );
				if ( interpol ) {
					return interpol( from, to ) || snap( to );
				}
				warn( 'Missing "' + type + '" interpolator. You may need to download a plugin from [TODO]' );
			}
			return interpolators.number( from, to ) || interpolators.array( from, to ) || interpolators.object( from, to ) || interpolators.cssLength( from, to ) || snap( to );
		};
		circular.interpolate = interpolate;
		return interpolate;

		function snap( to ) {
			return function() {
				return to;
			};
		}
	}( circular, warn, interpolators, config );

	/* Ractive/prototype/animate/Animation.js */
	var Ractive$animate_Animation = function( warn, runloop, interpolate ) {

		var Animation = function( options ) {
			var key;
			this.startTime = Date.now();
			// from and to
			for ( key in options ) {
				if ( options.hasOwnProperty( key ) ) {
					this[ key ] = options[ key ];
				}
			}
			this.interpolator = interpolate( this.from, this.to, this.root, this.interpolator );
			this.running = true;
		};
		Animation.prototype = {
			tick: function() {
				var elapsed, t, value, timeNow, index, keypath;
				keypath = this.keypath;
				if ( this.running ) {
					timeNow = Date.now();
					elapsed = timeNow - this.startTime;
					if ( elapsed >= this.duration ) {
						if ( keypath !== null ) {
							runloop.start( this.root );
							this.root.viewmodel.set( keypath, this.to );
							runloop.end();
						}
						if ( this.step ) {
							this.step( 1, this.to );
						}
						this.complete( this.to );
						index = this.root._animations.indexOf( this );
						// TODO investigate why this happens
						if ( index === -1 ) {
							warn( 'Animation was not found' );
						}
						this.root._animations.splice( index, 1 );
						this.running = false;
						return false;
					}
					t = this.easing ? this.easing( elapsed / this.duration ) : elapsed / this.duration;
					if ( keypath !== null ) {
						value = this.interpolator( t );
						runloop.start( this.root );
						this.root.viewmodel.set( keypath, value );
						runloop.end();
					}
					if ( this.step ) {
						this.step( t, value );
					}
					return true;
				}
				return false;
			},
			stop: function() {
				var index;
				this.running = false;
				index = this.root._animations.indexOf( this );
				// TODO investigate why this happens
				if ( index === -1 ) {
					warn( 'Animation was not found' );
				}
				this.root._animations.splice( index, 1 );
			}
		};
		return Animation;
	}( warn, runloop, interpolate );

	/* Ractive/prototype/animate.js */
	var Ractive$animate = function( isEqual, Promise, normaliseKeypath, animations, Animation ) {

		var noop = function() {},
			noAnimation = {
				stop: noop
			};
		return function Ractive$animate( keypath, to, options ) {
			var promise, fulfilPromise, k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			// animate multiple keypaths
			if ( typeof keypath === 'object' ) {
				options = to || {};
				easing = options.easing;
				duration = options.duration;
				animations = [];
				// we don't want to pass the `step` and `complete` handlers, as they will
				// run for each animation! So instead we'll store the handlers and create
				// our own...
				step = options.step;
				complete = options.complete;
				if ( step || complete ) {
					currentValues = {};
					options.step = null;
					options.complete = null;
					makeValueCollector = function( keypath ) {
						return function( t, value ) {
							currentValues[ keypath ] = value;
						};
					};
				}
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						if ( step || complete ) {
							collectValue = makeValueCollector( k );
							options = {
								easing: easing,
								duration: duration
							};
							if ( step ) {
								options.step = collectValue;
							}
						}
						options.complete = complete ? collectValue : noop;
						animations.push( animate( this, k, keypath[ k ], options ) );
					}
				}
				if ( step || complete ) {
					dummyOptions = {
						easing: easing,
						duration: duration
					};
					if ( step ) {
						dummyOptions.step = function( t ) {
							step( t, currentValues );
						};
					}
					if ( complete ) {
						promise.then( function( t ) {
							complete( t, currentValues );
						} );
					}
					dummyOptions.complete = fulfilPromise;
					dummy = animate( this, null, null, dummyOptions );
					animations.push( dummy );
				}
				return {
					stop: function() {
						var animation;
						while ( animation = animations.pop() ) {
							animation.stop();
						}
						if ( dummy ) {
							dummy.stop();
						}
					}
				};
			}
			// animate a single keypath
			options = options || {};
			if ( options.complete ) {
				promise.then( options.complete );
			}
			options.complete = fulfilPromise;
			animation = animate( this, keypath, to, options );
			promise.stop = function() {
				animation.stop();
			};
			return promise;
		};

		function animate( root, keypath, to, options ) {
			var easing, duration, animation, from;
			if ( keypath ) {
				keypath = normaliseKeypath( keypath );
			}
			if ( keypath !== null ) {
				from = root.viewmodel.get( keypath );
			}
			// cancel any existing animation
			// TODO what about upstream/downstream keypaths?
			animations.abort( keypath, root );
			// don't bother animating values that stay the same
			if ( isEqual( from, to ) ) {
				if ( options.complete ) {
					options.complete( options.to );
				}
				return noAnimation;
			}
			// easing function
			if ( options.easing ) {
				if ( typeof options.easing === 'function' ) {
					easing = options.easing;
				} else {
					easing = root.easing[ options.easing ];
				}
				if ( typeof easing !== 'function' ) {
					easing = null;
				}
			}
			// duration
			duration = options.duration === undefined ? 400 : options.duration;
			// TODO store keys, use an internal set method
			animation = new Animation( {
				keypath: keypath,
				from: from,
				to: to,
				root: root,
				duration: duration,
				easing: easing,
				interpolator: options.interpolator,
				// TODO wrap callbacks if necessary, to use instance as context
				step: options.step,
				complete: options.complete
			} );
			animations.add( animation );
			root._animations.push( animation );
			return animation;
		}
	}( isEqual, Promise, normaliseKeypath, animations, Ractive$animate_Animation );

	/* Ractive/prototype/detach.js */
	var Ractive$detach = function( removeFromArray ) {

		return function Ractive$detach() {
			if ( this.el ) {
				removeFromArray( this.el.__ractive_instances__, this );
			}
			return this.fragment.detach();
		};
	}( removeFromArray );

	/* Ractive/prototype/find.js */
	var Ractive$find = function Ractive$find( selector ) {
		if ( !this.el ) {
			return null;
		}
		return this.fragment.find( selector );
	};

	/* utils/matches.js */
	var matches = function( isClient, vendors, createElement ) {

		var matches, div, methodNames, unprefixed, prefixed, i, j, makeFunction;
		if ( !isClient ) {
			matches = null;
		} else {
			div = createElement( 'div' );
			methodNames = [
				'matches',
				'matchesSelector'
			];
			makeFunction = function( methodName ) {
				return function( node, selector ) {
					return node[ methodName ]( selector );
				};
			};
			i = methodNames.length;
			while ( i-- && !matches ) {
				unprefixed = methodNames[ i ];
				if ( div[ unprefixed ] ) {
					matches = makeFunction( unprefixed );
				} else {
					j = vendors.length;
					while ( j-- ) {
						prefixed = vendors[ i ] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );
						if ( div[ prefixed ] ) {
							matches = makeFunction( prefixed );
							break;
						}
					}
				}
			}
			// IE8...
			if ( !matches ) {
				matches = function( node, selector ) {
					var nodes, parentNode, i;
					parentNode = node.parentNode;
					if ( !parentNode ) {
						// empty dummy <div>
						div.innerHTML = '';
						parentNode = div;
						node = node.cloneNode();
						div.appendChild( node );
					}
					nodes = parentNode.querySelectorAll( selector );
					i = nodes.length;
					while ( i-- ) {
						if ( nodes[ i ] === node ) {
							return true;
						}
					}
					return false;
				};
			}
		}
		return matches;
	}( isClient, vendors, createElement );

	/* Ractive/prototype/shared/makeQuery/test.js */
	var Ractive$shared_makeQuery_test = function( matches ) {

		return function( item, noDirty ) {
			var itemMatches = this._isComponentQuery ? !this.selector || item.name === this.selector : matches( item.node, this.selector );
			if ( itemMatches ) {
				this.push( item.node || item.instance );
				if ( !noDirty ) {
					this._makeDirty();
				}
				return true;
			}
		};
	}( matches );

	/* Ractive/prototype/shared/makeQuery/cancel.js */
	var Ractive$shared_makeQuery_cancel = function() {
		var liveQueries, selector, index;
		liveQueries = this._root[ this._isComponentQuery ? 'liveComponentQueries' : 'liveQueries' ];
		selector = this.selector;
		index = liveQueries.indexOf( selector );
		if ( index !== -1 ) {
			liveQueries.splice( index, 1 );
			liveQueries[ selector ] = null;
		}
	};

	/* Ractive/prototype/shared/makeQuery/sortByItemPosition.js */
	var Ractive$shared_makeQuery_sortByItemPosition = function() {

		return function( a, b ) {
			var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;
			ancestryA = getAncestry( a.component || a._ractive.proxy );
			ancestryB = getAncestry( b.component || b._ractive.proxy );
			oldestA = ancestryA[ ancestryA.length - 1 ];
			oldestB = ancestryB[ ancestryB.length - 1 ];
			// remove items from the end of both ancestries as long as they are identical
			// - the final one removed is the closest mutual ancestor
			while ( oldestA && oldestA === oldestB ) {
				ancestryA.pop();
				ancestryB.pop();
				mutualAncestor = oldestA;
				oldestA = ancestryA[ ancestryA.length - 1 ];
				oldestB = ancestryB[ ancestryB.length - 1 ];
			}
			// now that we have the mutual ancestor, we can find which is earliest
			oldestA = oldestA.component || oldestA;
			oldestB = oldestB.component || oldestB;
			fragmentA = oldestA.parentFragment;
			fragmentB = oldestB.parentFragment;
			// if both items share a parent fragment, our job is easy
			if ( fragmentA === fragmentB ) {
				indexA = fragmentA.items.indexOf( oldestA );
				indexB = fragmentB.items.indexOf( oldestB );
				// if it's the same index, it means one contains the other,
				// so we see which has the longest ancestry
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			// if mutual ancestor is a section, we first test to see which section
			// fragment comes first
			if ( fragments = mutualAncestor.fragments ) {
				indexA = fragments.indexOf( fragmentA );
				indexB = fragments.indexOf( fragmentB );
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!' );
		};

		function getParent( item ) {
			var parentFragment;
			if ( parentFragment = item.parentFragment ) {
				return parentFragment.owner;
			}
			if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
				return parentFragment.owner;
			}
		}

		function getAncestry( item ) {
			var ancestry, ancestor;
			ancestry = [ item ];
			ancestor = getParent( item );
			while ( ancestor ) {
				ancestry.push( ancestor );
				ancestor = getParent( ancestor );
			}
			return ancestry;
		}
	}();

	/* Ractive/prototype/shared/makeQuery/sortByDocumentPosition.js */
	var Ractive$shared_makeQuery_sortByDocumentPosition = function( sortByItemPosition ) {

		return function( node, otherNode ) {
			var bitmask;
			if ( node.compareDocumentPosition ) {
				bitmask = node.compareDocumentPosition( otherNode );
				return bitmask & 2 ? 1 : -1;
			}
			// In old IE, we can piggy back on the mechanism for
			// comparing component positions
			return sortByItemPosition( node, otherNode );
		};
	}( Ractive$shared_makeQuery_sortByItemPosition );

	/* Ractive/prototype/shared/makeQuery/sort.js */
	var Ractive$shared_makeQuery_sort = function( sortByDocumentPosition, sortByItemPosition ) {

		return function() {
			this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
			this._dirty = false;
		};
	}( Ractive$shared_makeQuery_sortByDocumentPosition, Ractive$shared_makeQuery_sortByItemPosition );

	/* Ractive/prototype/shared/makeQuery/dirty.js */
	var Ractive$shared_makeQuery_dirty = function( runloop ) {

		return function() {
			var this$0 = this;
			if ( !this._dirty ) {
				this._dirty = true;
				// Once the DOM has been updated, ensure the query
				// is correctly ordered
				runloop.scheduleTask( function() {
					this$0._sort();
				} );
			}
		};
	}( runloop );

	/* Ractive/prototype/shared/makeQuery/remove.js */
	var Ractive$shared_makeQuery_remove = function( nodeOrComponent ) {
		var index = this.indexOf( this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent );
		if ( index !== -1 ) {
			this.splice( index, 1 );
		}
	};

	/* Ractive/prototype/shared/makeQuery/_makeQuery.js */
	var Ractive$shared_makeQuery__makeQuery = function( defineProperties, test, cancel, sort, dirty, remove ) {

		return function makeQuery( ractive, selector, live, isComponentQuery ) {
			var query = [];
			defineProperties( query, {
				selector: {
					value: selector
				},
				live: {
					value: live
				},
				_isComponentQuery: {
					value: isComponentQuery
				},
				_test: {
					value: test
				}
			} );
			if ( !live ) {
				return query;
			}
			defineProperties( query, {
				cancel: {
					value: cancel
				},
				_root: {
					value: ractive
				},
				_sort: {
					value: sort
				},
				_makeDirty: {
					value: dirty
				},
				_remove: {
					value: remove
				},
				_dirty: {
					value: false,
					writable: true
				}
			} );
			return query;
		};
	}( defineProperties, Ractive$shared_makeQuery_test, Ractive$shared_makeQuery_cancel, Ractive$shared_makeQuery_sort, Ractive$shared_makeQuery_dirty, Ractive$shared_makeQuery_remove );

	/* Ractive/prototype/findAll.js */
	var Ractive$findAll = function( makeQuery ) {

		return function Ractive$findAll( selector, options ) {
			var liveQueries, query;
			if ( !this.el ) {
				return [];
			}
			options = options || {};
			liveQueries = this._liveQueries;
			// Shortcut: if we're maintaining a live query with this
			// selector, we don't need to traverse the parallel DOM
			if ( query = liveQueries[ selector ] ) {
				// Either return the exact same query, or (if not live) a snapshot
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !!options.live, false );
			// Add this to the list of live queries Ractive needs to maintain,
			// if applicable
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ '_' + selector ] = query;
			}
			this.fragment.findAll( selector, query );
			return query;
		};
	}( Ractive$shared_makeQuery__makeQuery );

	/* Ractive/prototype/findAllComponents.js */
	var Ractive$findAllComponents = function( makeQuery ) {

		return function Ractive$findAllComponents( selector, options ) {
			var liveQueries, query;
			options = options || {};
			liveQueries = this._liveComponentQueries;
			// Shortcut: if we're maintaining a live query with this
			// selector, we don't need to traverse the parallel DOM
			if ( query = liveQueries[ selector ] ) {
				// Either return the exact same query, or (if not live) a snapshot
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !!options.live, true );
			// Add this to the list of live queries Ractive needs to maintain,
			// if applicable
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ '_' + selector ] = query;
			}
			this.fragment.findAllComponents( selector, query );
			return query;
		};
	}( Ractive$shared_makeQuery__makeQuery );

	/* Ractive/prototype/findComponent.js */
	var Ractive$findComponent = function Ractive$findComponent( selector ) {
		return this.fragment.findComponent( selector );
	};

	/* Ractive/prototype/fire.js */
	var Ractive$fire = function Ractive$fire( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];
		if ( !subscribers ) {
			return;
		}
		args = Array.prototype.slice.call( arguments, 1 );
		for ( i = 0, len = subscribers.length; i < len; i += 1 ) {
			subscribers[ i ].apply( this, args );
		}
	};

	/* Ractive/prototype/get.js */
	var Ractive$get = function( normaliseKeypath ) {

		var options = {
			capture: true
		};
		// top-level calls should be intercepted
		return function Ractive$get( keypath ) {
			keypath = normaliseKeypath( keypath );
			return this.viewmodel.get( keypath, options );
		};
	}( normaliseKeypath );

	/* utils/getElement.js */
	var getElement = function getElement( input ) {
		var output;
		if ( !input || typeof input === 'boolean' ) {
			return;
		}
		if ( typeof window === 'undefined' || !document || !input ) {
			return null;
		}
		// We already have a DOM node - no work to do. (Duck typing alert!)
		if ( input.nodeType ) {
			return input;
		}
		// Get node from string
		if ( typeof input === 'string' ) {
			// try ID first
			output = document.getElementById( input );
			// then as selector, if possible
			if ( !output && document.querySelector ) {
				output = document.querySelector( input );
			}
			// did it work?
			if ( output && output.nodeType ) {
				return output;
			}
		}
		// If we've been given a collection (jQuery, Zepto etc), extract the first item
		if ( input[ 0 ] && input[ 0 ].nodeType ) {
			return input[ 0 ];
		}
		return null;
	};

	/* Ractive/prototype/insert.js */
	var Ractive$insert = function( getElement ) {

		return function Ractive$insert( target, anchor ) {
			if ( !this.rendered ) {
				// TODO create, and link to, documentation explaining this
				throw new Error( 'The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.' );
			}
			target = getElement( target );
			anchor = getElement( anchor ) || null;
			if ( !target ) {
				throw new Error( 'You must specify a valid target to insert into' );
			}
			target.insertBefore( this.detach(), anchor );
			this.el = target;
			( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( this );
		};
	}( getElement );

	/* Ractive/prototype/merge.js */
	var Ractive$merge = function( runloop, isArray, normaliseKeypath ) {

		return function Ractive$merge( keypath, array, options ) {
			var currentArray, promise;
			keypath = normaliseKeypath( keypath );
			currentArray = this.viewmodel.get( keypath );
			// If either the existing value or the new value isn't an
			// array, just do a regular set
			if ( !isArray( currentArray ) || !isArray( array ) ) {
				return this.set( keypath, array, options && options.complete );
			}
			// Manage transitions
			promise = runloop.start( this, true );
			this.viewmodel.merge( keypath, currentArray, array, options );
			runloop.end();
			// attach callback as fulfilment handler, if specified
			if ( options && options.complete ) {
				promise.then( options.complete );
			}
			return promise;
		};
	}( runloop, isArray, normaliseKeypath );

	/* Ractive/prototype/observe/Observer.js */
	var Ractive$observe_Observer = function( runloop, isEqual ) {

		var Observer = function( ractive, keypath, callback, options ) {
			this.root = ractive;
			this.keypath = keypath;
			this.callback = callback;
			this.defer = options.defer;
			// Observers are notified before any DOM changes take place (though
			// they can defer execution until afterwards)
			this.priority = 0;
			// default to root as context, but allow it to be overridden
			this.context = options && options.context ? options.context : ractive;
		};
		Observer.prototype = {
			init: function( immediate ) {
				this.value = this.root.viewmodel.get( this.keypath );
				if ( immediate !== false ) {
					this.update();
				}
			},
			setValue: function( value ) {
				var this$0 = this;
				if ( !isEqual( value, this.value ) ) {
					this.value = value;
					if ( this.defer && this.ready ) {
						runloop.scheduleTask( function() {
							return this$0.update();
						} );
					} else {
						this.update();
					}
				}
			},
			update: function() {
				// Prevent infinite loops
				if ( this.updating ) {
					return;
				}
				this.updating = true;
				this.callback.call( this.context, this.value, this.oldValue, this.keypath );
				this.oldValue = this.value;
				this.updating = false;
			}
		};
		return Observer;
	}( runloop, isEqual );

	/* shared/getMatchingKeypaths.js */
	var getMatchingKeypaths = function( isArray ) {

		return function getMatchingKeypaths( ractive, pattern ) {
			var keys, key, matchingKeypaths;
			keys = pattern.split( '.' );
			matchingKeypaths = [ '' ];
			while ( key = keys.shift() ) {
				if ( key === '*' ) {
					// expand to find all valid child keypaths
					matchingKeypaths = matchingKeypaths.reduce( expand, [] );
				} else {
					if ( matchingKeypaths[ 0 ] === '' ) {
						// first key
						matchingKeypaths[ 0 ] = key;
					} else {
						matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
					}
				}
			}
			return matchingKeypaths;

			function expand( matchingKeypaths, keypath ) {
				var value, key, childKeypath;
				value = ractive.viewmodel.wrapped[ keypath ] ? ractive.viewmodel.wrapped[ keypath ].get() : ractive.get( keypath );
				for ( key in value ) {
					if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) {
						// for benefit of IE8
						childKeypath = keypath ? keypath + '.' + key : key;
						matchingKeypaths.push( childKeypath );
					}
				}
				return matchingKeypaths;
			}

			function concatenate( key ) {
				return function( keypath ) {
					return keypath ? keypath + '.' + key : key;
				};
			}
		};
	}( isArray );

	/* Ractive/prototype/observe/getPattern.js */
	var Ractive$observe_getPattern = function( getMatchingKeypaths ) {

		return function getPattern( ractive, pattern ) {
			var matchingKeypaths, values;
			matchingKeypaths = getMatchingKeypaths( ractive, pattern );
			values = {};
			matchingKeypaths.forEach( function( keypath ) {
				values[ keypath ] = ractive.get( keypath );
			} );
			return values;
		};
	}( getMatchingKeypaths );

	/* Ractive/prototype/observe/PatternObserver.js */
	var Ractive$observe_PatternObserver = function( runloop, isEqual, getPattern ) {

		var PatternObserver, wildcard = /\*/,
			slice = Array.prototype.slice;
		PatternObserver = function( ractive, keypath, callback, options ) {
			this.root = ractive;
			this.callback = callback;
			this.defer = options.defer;
			this.keypath = keypath;
			this.regex = new RegExp( '^' + keypath.replace( /\./g, '\\.' ).replace( /\*/g, '([^\\.]+)' ) + '$' );
			this.values = {};
			if ( this.defer ) {
				this.proxies = [];
			}
			// Observers are notified before any DOM changes take place (though
			// they can defer execution until afterwards)
			this.priority = 'pattern';
			// default to root as context, but allow it to be overridden
			this.context = options && options.context ? options.context : ractive;
		};
		PatternObserver.prototype = {
			init: function( immediate ) {
				var values, keypath;
				values = getPattern( this.root, this.keypath );
				if ( immediate !== false ) {
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
				} else {
					this.values = values;
				}
			},
			update: function( keypath ) {
				var values;
				if ( wildcard.test( keypath ) ) {
					values = getPattern( this.root, keypath );
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
					return;
				}
				// special case - array mutation should not trigger `array.*`
				// pattern observer with `array.length`
				if ( this.root.viewmodel.implicitChanges[ keypath ] ) {
					return;
				}
				if ( this.defer && this.ready ) {
					runloop.addObserver( this.getProxy( keypath ) );
					return;
				}
				this.reallyUpdate( keypath );
			},
			reallyUpdate: function( keypath ) {
				var value, keys, args;
				value = this.root.viewmodel.get( keypath );
				// Prevent infinite loops
				if ( this.updating ) {
					this.values[ keypath ] = value;
					return;
				}
				this.updating = true;
				if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
					keys = slice.call( this.regex.exec( keypath ), 1 );
					args = [
						value,
						this.values[ keypath ],
						keypath
					].concat( keys );
					this.callback.apply( this.context, args );
					this.values[ keypath ] = value;
				}
				this.updating = false;
			},
			getProxy: function( keypath ) {
				var self = this;
				if ( !this.proxies[ keypath ] ) {
					this.proxies[ keypath ] = {
						update: function() {
							self.reallyUpdate( keypath );
						}
					};
				}
				return this.proxies[ keypath ];
			}
		};
		return PatternObserver;
	}( runloop, isEqual, Ractive$observe_getPattern );

	/* Ractive/prototype/observe/getObserverFacade.js */
	var Ractive$observe_getObserverFacade = function( normaliseKeypath, Observer, PatternObserver ) {

		var wildcard = /\*/,
			emptyObject = {};
		return function getObserverFacade( ractive, keypath, callback, options ) {
			var observer, isPatternObserver, cancelled;
			keypath = normaliseKeypath( keypath );
			options = options || emptyObject;
			// pattern observers are treated differently
			if ( wildcard.test( keypath ) ) {
				observer = new PatternObserver( ractive, keypath, callback, options );
				ractive.viewmodel.patternObservers.push( observer );
				isPatternObserver = true;
			} else {
				observer = new Observer( ractive, keypath, callback, options );
			}
			ractive.viewmodel.register( keypath, observer, isPatternObserver ? 'patternObservers' : 'observers' );
			observer.init( options.init );
			// This flag allows observers to initialise even with undefined values
			observer.ready = true;
			return {
				cancel: function() {
					var index;
					if ( cancelled ) {
						return;
					}
					if ( isPatternObserver ) {
						index = ractive.viewmodel.patternObservers.indexOf( observer );
						ractive.viewmodel.patternObservers.splice( index, 1 );
						ractive.viewmodel.unregister( keypath, observer, 'patternObservers' );
					}
					ractive.viewmodel.unregister( keypath, observer, 'observers' );
					cancelled = true;
				}
			};
		};
	}( normaliseKeypath, Ractive$observe_Observer, Ractive$observe_PatternObserver );

	/* Ractive/prototype/observe.js */
	var Ractive$observe = function( isObject, getObserverFacade ) {

		return function Ractive$observe( keypath, callback, options ) {
			var observers, map, keypaths, i;
			// Allow a map of keypaths to handlers
			if ( isObject( keypath ) ) {
				options = callback;
				map = keypath;
				observers = [];
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						callback = map[ keypath ];
						observers.push( this.observe( keypath, callback, options ) );
					}
				}
				return {
					cancel: function() {
						while ( observers.length ) {
							observers.pop().cancel();
						}
					}
				};
			}
			// Allow `ractive.observe( callback )` - i.e. observe entire model
			if ( typeof keypath === 'function' ) {
				options = callback;
				callback = keypath;
				keypath = '';
				return getObserverFacade( this, keypath, callback, options );
			}
			keypaths = keypath.split( ' ' );
			// Single keypath
			if ( keypaths.length === 1 ) {
				return getObserverFacade( this, keypath, callback, options );
			}
			// Multiple space-separated keypaths
			observers = [];
			i = keypaths.length;
			while ( i-- ) {
				keypath = keypaths[ i ];
				if ( keypath ) {
					observers.push( getObserverFacade( this, keypath, callback, options ) );
				}
			}
			return {
				cancel: function() {
					while ( observers.length ) {
						observers.pop().cancel();
					}
				}
			};
		};
	}( isObject, Ractive$observe_getObserverFacade );

	/* Ractive/prototype/shared/trim.js */
	var Ractive$shared_trim = function( str ) {
		return str.trim();
	};

	/* Ractive/prototype/shared/notEmptyString.js */
	var Ractive$shared_notEmptyString = function( str ) {
		return str !== '';
	};

	/* Ractive/prototype/off.js */
	var Ractive$off = function( trim, notEmptyString ) {

		return function Ractive$off( eventName, callback ) {
			var this$0 = this;
			var eventNames;
			// if no arguments specified, remove all callbacks
			if ( !eventName ) {
				// TODO use this code instead, once the following issue has been resolved
				// in PhantomJS (tests are unpassable otherwise!)
				// https://github.com/ariya/phantomjs/issues/11856
				// defineProperty( this, '_subs', { value: create( null ), configurable: true });
				for ( eventName in this._subs ) {
					delete this._subs[ eventName ];
				}
			} else {
				// Handle multiple space-separated event names
				eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );
				eventNames.forEach( function( eventName ) {
					var subscribers, index;
					// If we have subscribers for this event...
					if ( subscribers = this$0._subs[ eventName ] ) {
						// ...if a callback was specified, only remove that
						if ( callback ) {
							index = subscribers.indexOf( callback );
							if ( index !== -1 ) {
								subscribers.splice( index, 1 );
							}
						} else {
							this$0._subs[ eventName ] = [];
						}
					}
				} );
			}
			return this;
		};
	}( Ractive$shared_trim, Ractive$shared_notEmptyString );

	/* Ractive/prototype/on.js */
	var Ractive$on = function( trim, notEmptyString ) {

		return function Ractive$on( eventName, callback ) {
			var this$0 = this;
			var self = this,
				listeners, n, eventNames;
			// allow mutliple listeners to be bound in one go
			if ( typeof eventName === 'object' ) {
				listeners = [];
				for ( n in eventName ) {
					if ( eventName.hasOwnProperty( n ) ) {
						listeners.push( this.on( n, eventName[ n ] ) );
					}
				}
				return {
					cancel: function() {
						var listener;
						while ( listener = listeners.pop() ) {
							listener.cancel();
						}
					}
				};
			}
			// Handle multiple space-separated event names
			eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );
			eventNames.forEach( function( eventName ) {
				( this$0._subs[ eventName ] || ( this$0._subs[ eventName ] = [] ) ).push( callback );
			} );
			return {
				cancel: function() {
					self.off( eventName, callback );
				}
			};
		};
	}( Ractive$shared_trim, Ractive$shared_notEmptyString );

	/* shared/getSpliceEquivalent.js */
	var getSpliceEquivalent = function( array, methodName, args ) {
		switch ( methodName ) {
			case 'splice':
				return args;
			case 'sort':
			case 'reverse':
				return null;
			case 'pop':
				if ( array.length ) {
					return [ -1 ];
				}
				return null;
			case 'push':
				return [
					array.length,
					0
				].concat( args );
			case 'shift':
				return [
					0,
					1
				];
			case 'unshift':
				return [
					0,
					0
				].concat( args );
		}
	};

	/* shared/summariseSpliceOperation.js */
	var summariseSpliceOperation = function( array, args ) {
		var rangeStart, rangeEnd, newLength, addedItems, removedItems, balance;
		if ( !args ) {
			return null;
		}
		// figure out where the changes started...
		rangeStart = +( args[ 0 ] < 0 ? array.length + args[ 0 ] : args[ 0 ] );
		// ...and how many items were added to or removed from the array
		addedItems = Math.max( 0, args.length - 2 );
		removedItems = args[ 1 ] !== undefined ? args[ 1 ] : array.length - rangeStart;
		// It's possible to do e.g. [ 1, 2, 3 ].splice( 2, 2 ) - i.e. the second argument
		// means removing more items from the end of the array than there are. In these
		// cases we need to curb JavaScript's enthusiasm or we'll get out of sync
		removedItems = Math.min( removedItems, array.length - rangeStart );
		balance = addedItems - removedItems;
		newLength = array.length + balance;
		// We need to find the end of the range affected by the splice
		if ( !balance ) {
			rangeEnd = rangeStart + addedItems;
		} else {
			rangeEnd = Math.max( array.length, newLength );
		}
		return {
			rangeStart: rangeStart,
			rangeEnd: rangeEnd,
			balance: balance,
			added: addedItems,
			removed: removedItems
		};
	};

	/* Ractive/prototype/shared/makeArrayMethod.js */
	var Ractive$shared_makeArrayMethod = function( isArray, runloop, getSpliceEquivalent, summariseSpliceOperation ) {

		var arrayProto = Array.prototype;
		return function( methodName ) {
			return function( keypath ) {
				var SLICE$0 = Array.prototype.slice;
				var args = SLICE$0.call( arguments, 1 );
				var array, spliceEquivalent, spliceSummary, promise;
				array = this.get( keypath );
				if ( !isArray( array ) ) {
					throw new Error( 'Called ractive.' + methodName + '(\'' + keypath + '\'), but \'' + keypath + '\' does not refer to an array' );
				}
				spliceEquivalent = getSpliceEquivalent( array, methodName, args );
				spliceSummary = summariseSpliceOperation( array, spliceEquivalent );
				arrayProto[ methodName ].apply( array, args );
				promise = runloop.start( this, true );
				if ( spliceSummary ) {
					this.viewmodel.splice( keypath, spliceSummary );
				} else {
					this.viewmodel.mark( keypath );
				}
				runloop.end();
				return promise;
			};
		};
	}( isArray, runloop, getSpliceEquivalent, summariseSpliceOperation );

	/* Ractive/prototype/pop.js */
	var Ractive$pop = function( makeArrayMethod ) {

		return makeArrayMethod( 'pop' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/push.js */
	var Ractive$push = function( makeArrayMethod ) {

		return makeArrayMethod( 'push' );
	}( Ractive$shared_makeArrayMethod );

	/* global/css.js */
	var global_css = function( circular, isClient, removeFromArray ) {

		var css, update, runloop, styleElement, head, styleSheet, inDom, prefix = '/* Ractive.js component styles */\n',
			componentsInPage = {},
			styles = [];
		if ( !isClient ) {
			css = null;
		} else {
			circular.push( function() {
				runloop = circular.runloop;
			} );
			styleElement = document.createElement( 'style' );
			styleElement.type = 'text/css';
			head = document.getElementsByTagName( 'head' )[ 0 ];
			inDom = false;
			// Internet Exploder won't let you use styleSheet.innerHTML - we have to
			// use styleSheet.cssText instead
			styleSheet = styleElement.styleSheet;
			update = function() {
				var css;
				if ( styles.length ) {
					css = prefix + styles.join( ' ' );
					if ( styleSheet ) {
						styleSheet.cssText = css;
					} else {
						styleElement.innerHTML = css;
					}
					if ( !inDom ) {
						head.appendChild( styleElement );
						inDom = true;
					}
				} else if ( inDom ) {
					head.removeChild( styleElement );
					inDom = false;
				}
			};
			css = {
				add: function( Component ) {
					if ( !Component.css ) {
						return;
					}
					if ( !componentsInPage[ Component._guid ] ) {
						// we create this counter so that we can in/decrement it as
						// instances are added and removed. When all components are
						// removed, the style is too
						componentsInPage[ Component._guid ] = 0;
						styles.push( Component.css );
						runloop.scheduleTask( update );
					}
					componentsInPage[ Component._guid ] += 1;
				},
				remove: function( Component ) {
					if ( !Component.css ) {
						return;
					}
					componentsInPage[ Component._guid ] -= 1;
					if ( !componentsInPage[ Component._guid ] ) {
						removeFromArray( styles, Component.css );
						runloop.scheduleTask( update );
					}
				}
			};
		}
		return css;
	}( circular, isClient, removeFromArray );

	/* Ractive/prototype/render.js */
	var Ractive$render = function( runloop, css, getElement ) {

		var queues = {},
			rendering = {};
		return function Ractive$render( target, anchor ) {
			var this$0 = this;
			var promise, instances;
			rendering[ this._guid ] = true;
			promise = runloop.start( this, true );
			if ( this.rendered ) {
				throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
			}
			target = getElement( target ) || this.el;
			anchor = getElement( anchor ) || this.anchor;
			this.el = target;
			this.anchor = anchor;
			// Add CSS, if applicable
			if ( this.constructor.css ) {
				css.add( this.constructor );
			}
			if ( target ) {
				if ( !( instances = target.__ractive_instances__ ) ) {
					target.__ractive_instances__ = [ this ];
				} else {
					instances.push( this );
				}
				if ( anchor ) {
					target.insertBefore( this.fragment.render(), anchor );
				} else {
					target.appendChild( this.fragment.render() );
				}
			}
			// Only init once, until we rework lifecycle events
			if ( !this._hasInited ) {
				this._hasInited = true;
				// If this is *isn't* a child of a component that's in the process of rendering,
				// it should call any `init()` methods at this point
				if ( !this._parent || !rendering[ this._parent._guid ] ) {
					init( this );
				} else {
					getChildInitQueue( this._parent ).push( this );
				}
			}
			rendering[ this._guid ] = false;
			runloop.end();
			this.rendered = true;
			if ( this.complete ) {
				promise.then( function() {
					return this$0.complete();
				} );
			}
			return promise;
		};

		function init( instance ) {
			if ( instance.init ) {
				instance.init( instance._config.options );
			}
			getChildInitQueue( instance ).forEach( init );
			queues[ instance._guid ] = null;
		}

		function getChildInitQueue( instance ) {
			return queues[ instance._guid ] || ( queues[ instance._guid ] = [] );
		}
	}( runloop, global_css, getElement );

	/* virtualdom/Fragment/prototype/bubble.js */
	var virtualdom_Fragment$bubble = function Fragment$bubble() {
		this.dirtyValue = this.dirtyArgs = true;
		if ( this.inited && this.owner.bubble ) {
			this.owner.bubble();
		}
	};

	/* virtualdom/Fragment/prototype/detach.js */
	var virtualdom_Fragment$detach = function Fragment$detach() {
		var docFrag;
		if ( this.items.length === 1 ) {
			return this.items[ 0 ].detach();
		}
		docFrag = document.createDocumentFragment();
		this.items.forEach( function( item ) {
			docFrag.appendChild( item.detach() );
		} );
		return docFrag;
	};

	/* virtualdom/Fragment/prototype/find.js */
	var virtualdom_Fragment$find = function Fragment$find( selector ) {
		var i, len, item, queryResult;
		if ( this.items ) {
			len = this.items.length;
			for ( i = 0; i < len; i += 1 ) {
				item = this.items[ i ];
				if ( item.find && ( queryResult = item.find( selector ) ) ) {
					return queryResult;
				}
			}
			return null;
		}
	};

	/* virtualdom/Fragment/prototype/findAll.js */
	var virtualdom_Fragment$findAll = function Fragment$findAll( selector, query ) {
		var i, len, item;
		if ( this.items ) {
			len = this.items.length;
			for ( i = 0; i < len; i += 1 ) {
				item = this.items[ i ];
				if ( item.findAll ) {
					item.findAll( selector, query );
				}
			}
		}
		return query;
	};

	/* virtualdom/Fragment/prototype/findAllComponents.js */
	var virtualdom_Fragment$findAllComponents = function Fragment$findAllComponents( selector, query ) {
		var i, len, item;
		if ( this.items ) {
			len = this.items.length;
			for ( i = 0; i < len; i += 1 ) {
				item = this.items[ i ];
				if ( item.findAllComponents ) {
					item.findAllComponents( selector, query );
				}
			}
		}
		return query;
	};

	/* virtualdom/Fragment/prototype/findComponent.js */
	var virtualdom_Fragment$findComponent = function Fragment$findComponent( selector ) {
		var len, i, item, queryResult;
		if ( this.items ) {
			len = this.items.length;
			for ( i = 0; i < len; i += 1 ) {
				item = this.items[ i ];
				if ( item.findComponent && ( queryResult = item.findComponent( selector ) ) ) {
					return queryResult;
				}
			}
			return null;
		}
	};

	/* virtualdom/Fragment/prototype/findNextNode.js */
	var virtualdom_Fragment$findNextNode = function Fragment$findNextNode( item ) {
		var index = item.index,
			node;
		if ( this.items[ index + 1 ] ) {
			node = this.items[ index + 1 ].firstNode();
		} else if ( this.owner === this.root ) {
			if ( !this.owner.component ) {
				// TODO but something else could have been appended to
				// this.root.el, no?
				node = null;
			} else {
				node = this.owner.component.findNextNode();
			}
		} else {
			node = this.owner.findNextNode( this );
		}
		return node;
	};

	/* virtualdom/Fragment/prototype/firstNode.js */
	var virtualdom_Fragment$firstNode = function Fragment$firstNode() {
		if ( this.items && this.items[ 0 ] ) {
			return this.items[ 0 ].firstNode();
		}
		return null;
	};

	/* virtualdom/Fragment/prototype/getNode.js */
	var virtualdom_Fragment$getNode = function Fragment$getNode() {
		var fragment = this;
		do {
			if ( fragment.pElement ) {
				return fragment.pElement.node;
			}
		} while ( fragment = fragment.parent );
		return this.root.el;
	};

	/* virtualdom/Fragment/prototype/getValue.js */
	var virtualdom_Fragment$getValue = function( parseJSON ) {

		var empty = {};
		return function Fragment$getValue() {
			var options = arguments[ 0 ];
			if ( options === void 0 )
				options = empty;
			var asArgs, values, source, parsed, cachedResult, dirtyFlag, result;
			asArgs = options.args;
			cachedResult = asArgs ? 'argsList' : 'value';
			dirtyFlag = asArgs ? 'dirtyArgs' : 'dirtyValue';
			if ( this[ dirtyFlag ] ) {
				source = processItems( this.items, values = {}, this.root._guid );
				parsed = parseJSON( asArgs ? '[' + source + ']' : source, values );
				if ( !parsed ) {
					result = asArgs ? [ this.toString() ] : this.toString();
				} else {
					result = parsed.value;
				}
				this[ cachedResult ] = result;
				this[ dirtyFlag ] = false;
			}
			return this[ cachedResult ];
		};

		function processItems( items, values, guid, counter ) {
			counter = counter || 0;
			return items.map( function( item ) {
				var placeholderId, wrapped, value;
				if ( item.text ) {
					return item.text;
				}
				if ( item.fragments ) {
					return item.fragments.map( function( fragment ) {
						return processItems( fragment.items, values, guid, counter );
					} ).join( '' );
				}
				placeholderId = guid + '-' + counter++;
				if ( wrapped = item.root.viewmodel.wrapped[ item.keypath ] ) {
					value = wrapped.value;
				} else {
					value = item.getValue();
				}
				values[ placeholderId ] = value;
				return '${' + placeholderId + '}';
			} ).join( '' );
		}
	}( parseJSON );

	/* utils/escapeHtml.js */
	var escapeHtml = function() {

		var lessThan = /</g,
			greaterThan = />/g;
		return function escapeHtml( str ) {
			return str.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
		};
	}();

	/* utils/detachNode.js */
	var detachNode = function detachNode( node ) {
		if ( node && node.parentNode ) {
			node.parentNode.removeChild( node );
		}
		return node;
	};

	/* virtualdom/items/shared/detach.js */
	var detach = function( detachNode ) {

		return function() {
			return detachNode( this.node );
		};
	}( detachNode );

	/* virtualdom/items/Text.js */
	var Text = function( types, escapeHtml, detach ) {

		var Text = function( options ) {
			this.type = types.TEXT;
			this.text = options.template;
		};
		Text.prototype = {
			detach: detach,
			firstNode: function() {
				return this.node;
			},
			render: function() {
				if ( !this.node ) {
					this.node = document.createTextNode( this.text );
				}
				return this.node;
			},
			toString: function( escape ) {
				return escape ? escapeHtml( this.text ) : this.text;
			},
			unrender: function( shouldDestroy ) {
				if ( shouldDestroy ) {
					return this.detach();
				}
			}
		};
		return Text;
	}( types, escapeHtml, detach );

	/* virtualdom/items/shared/unbind.js */
	var unbind = function( runloop ) {

		return function unbind() {
			if ( !this.keypath ) {
				// this was on the 'unresolved' list, we need to remove it
				runloop.removeUnresolved( this );
			} else {
				// this was registered as a dependant
				this.root.viewmodel.unregister( this.keypath, this );
			}
			if ( this.resolver ) {
				this.resolver.teardown();
			}
		};
	}( runloop );

	/* virtualdom/items/shared/Mustache/getValue.js */
	var getValue = function Mustache$getValue() {
		return this.value;
	};

	/* shared/Unresolved.js */
	var Unresolved = function( runloop ) {

		var Unresolved = function( ractive, ref, parentFragment, callback ) {
			this.root = ractive;
			this.ref = ref;
			this.parentFragment = parentFragment;
			this.resolve = callback;
			runloop.addUnresolved( this );
		};
		Unresolved.prototype = {
			teardown: function() {
				runloop.removeUnresolved( this );
			}
		};
		return Unresolved;
	}( runloop );

	/* virtualdom/items/shared/utils/startsWithKeypath.js */
	var startsWithKeypath = function startsWithKeypath( target, keypath ) {
		return target.substr( 0, keypath.length + 1 ) === keypath + '.';
	};

	/* virtualdom/items/shared/utils/getNewKeypath.js */
	var getNewKeypath = function( startsWithKeypath ) {

		return function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
			// exact match
			if ( targetKeypath === oldKeypath ) {
				return newKeypath;
			}
			// partial match based on leading keypath segments
			if ( startsWithKeypath( targetKeypath, oldKeypath ) ) {
				return targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
			}
		};
	}( startsWithKeypath );

	/* utils/log.js */
	var log = function( consolewarn, errors ) {

		var log = {
			warn: function( options, passthru ) {
				if ( !options.debug && !passthru ) {
					return;
				}
				this.logger( getMessage( options ), options.allowDuplicates );
			},
			error: function( options ) {
				this.errorOnly( options );
				if ( !options.debug ) {
					this.warn( options, true );
				}
			},
			errorOnly: function( options ) {
				if ( options.debug ) {
					this.critical( options );
				}
			},
			critical: function( options ) {
				var err = options.err || new Error( getMessage( options ) );
				this.thrower( err );
			},
			logger: consolewarn,
			thrower: function( err ) {
				throw err;
			}
		};

		function getMessage( options ) {
			var message = errors[ options.message ] || options.message || '';
			return interpolate( message, options.args );
		}
		// simple interpolation. probably quicker (and better) out there,
		// but log is not in golden path of execution, only exceptions
		function interpolate( message, args ) {
			return message.replace( /{([^{}]*)}/g, function( a, b ) {
				return args[ b ];
			} );
		}
		return log;
	}( warn, errors );

	/* viewmodel/Computation/diff.js */
	var diff = function diff( computation, dependencies, newDependencies ) {
		var i, keypath;
		// remove dependencies that are no longer used
		i = dependencies.length;
		while ( i-- ) {
			keypath = dependencies[ i ];
			if ( newDependencies.indexOf( keypath ) === -1 ) {
				computation.viewmodel.unregister( keypath, computation, 'computed' );
			}
		}
		// create references for any new dependencies
		i = newDependencies.length;
		while ( i-- ) {
			keypath = newDependencies[ i ];
			if ( dependencies.indexOf( keypath ) === -1 ) {
				computation.viewmodel.register( keypath, computation, 'computed' );
			}
		}
		computation.dependencies = newDependencies.slice();
	};

	/* virtualdom/items/shared/Evaluator/Evaluator.js */
	var Evaluator = function( log, isEqual, defineProperty, diff ) {

		// TODO this is a red flag... should be treated the same?
		var Evaluator, cache = {};
		Evaluator = function( root, keypath, uniqueString, functionStr, args, priority ) {
			var evaluator = this,
				viewmodel = root.viewmodel;
			evaluator.root = root;
			evaluator.viewmodel = viewmodel;
			evaluator.uniqueString = uniqueString;
			evaluator.keypath = keypath;
			evaluator.priority = priority;
			evaluator.fn = getFunctionFromString( functionStr, args.length );
			evaluator.explicitDependencies = [];
			evaluator.dependencies = [];
			// created by `this.get()` within functions
			evaluator.argumentGetters = args.map( function( arg ) {
				var keypath, index;
				if ( !arg ) {
					return void 0;
				}
				if ( arg.indexRef ) {
					index = arg.value;
					return index;
				}
				keypath = arg.keypath;
				evaluator.explicitDependencies.push( keypath );
				viewmodel.register( keypath, evaluator, 'computed' );
				return function() {
					var value = viewmodel.get( keypath );
					return typeof value === 'function' ? wrap( value, root ) : value;
				};
			} );
		};
		Evaluator.prototype = {
			wake: function() {
				this.awake = true;
			},
			sleep: function() {
				this.awake = false;
			},
			getValue: function() {
				var args, value, newImplicitDependencies;
				args = this.argumentGetters.map( call );
				if ( this.updating ) {
					// Prevent infinite loops caused by e.g. in-place array mutations
					return;
				}
				this.updating = true;
				this.viewmodel.capture();
				try {
					value = this.fn.apply( null, args );
				} catch ( err ) {
					if ( this.root.debug ) {
						log.warn( {
							debug: this.root.debug,
							message: 'evaluationError',
							args: {
								uniqueString: this.uniqueString,
								err: err.message || err
							}
						} );
					}
					value = undefined;
				}
				newImplicitDependencies = this.viewmodel.release();
				diff( this, this.dependencies, newImplicitDependencies );
				this.updating = false;
				return value;
			},
			update: function() {
				var value = this.getValue();
				if ( !isEqual( value, this.value ) ) {
					this.value = value;
					this.root.viewmodel.mark( this.keypath );
				}
				return this;
			},
			// TODO should evaluators ever get torn down? At present, they don't...
			teardown: function() {
				var this$0 = this;
				this.explicitDependencies.concat( this.dependencies ).forEach( function( keypath ) {
					return this$0.viewmodel.unregister( keypath, this$0, 'computed' );
				} );
				this.root.viewmodel.evaluators[ this.keypath ] = null;
			}
		};
		return Evaluator;

		function getFunctionFromString( str, i ) {
			var fn, args;
			str = str.replace( /\$\{([0-9]+)\}/g, '_$1' );
			if ( cache[ str ] ) {
				return cache[ str ];
			}
			args = [];
			while ( i-- ) {
				args[ i ] = '_' + i;
			}
			fn = new Function( args.join( ',' ), 'return(' + str + ')' );
			cache[ str ] = fn;
			return fn;
		}

		function wrap( fn, ractive ) {
			var wrapped, prop;
			if ( fn._noWrap ) {
				return fn;
			}
			prop = '__ractive_' + ractive._guid;
			wrapped = fn[ prop ];
			if ( wrapped ) {
				return wrapped;
			} else if ( /this/.test( fn.toString() ) ) {
				defineProperty( fn, prop, {
					value: fn.bind( ractive )
				} );
				return fn[ prop ];
			}
			defineProperty( fn, '__ractive_nowrap', {
				value: fn
			} );
			return fn.__ractive_nowrap;
		}

		function call( arg ) {
			return typeof arg === 'function' ? arg() : arg;
		}
	}( log, isEqual, defineProperty, diff );

	/* virtualdom/items/shared/Resolvers/ExpressionResolver.js */
	var ExpressionResolver = function( removeFromArray, resolveRef, Unresolved, Evaluator, getNewKeypath ) {

		var ExpressionResolver = function( owner, parentFragment, expression, callback ) {
			var expressionResolver = this,
				ractive, indexRefs, args;
			ractive = owner.root;
			this.root = ractive;
			this.callback = callback;
			this.owner = owner;
			this.str = expression.s;
			this.args = args = [];
			this.unresolved = [];
			this.pending = 0;
			indexRefs = parentFragment.indexRefs;
			// some expressions don't have references. edge case, but, yeah.
			if ( !expression.r || !expression.r.length ) {
				this.resolved = this.ready = true;
				this.bubble();
				return;
			}
			// Create resolvers for each reference
			expression.r.forEach( function( reference, i ) {
				var index, keypath, unresolved;
				// Is this an index reference?
				if ( indexRefs && ( index = indexRefs[ reference ] ) !== undefined ) {
					args[ i ] = {
						indexRef: reference,
						value: index
					};
					return;
				}
				// Can we resolve it immediately?
				if ( keypath = resolveRef( ractive, reference, parentFragment ) ) {
					args[ i ] = {
						keypath: keypath
					};
					return;
				}
				// Couldn't resolve yet
				args[ i ] = null;
				expressionResolver.pending += 1;
				unresolved = new Unresolved( ractive, reference, parentFragment, function( keypath ) {
					expressionResolver.resolve( i, keypath );
					removeFromArray( expressionResolver.unresolved, unresolved );
				} );
				expressionResolver.unresolved.push( unresolved );
			} );
			this.ready = true;
			this.bubble();
		};
		ExpressionResolver.prototype = {
			bubble: function() {
				if ( !this.ready ) {
					return;
				}
				this.uniqueString = getUniqueString( this.str, this.args );
				this.keypath = getKeypath( this.uniqueString );
				this.createEvaluator();
				this.callback( this.keypath );
			},
			teardown: function() {
				var unresolved;
				while ( unresolved = this.unresolved.pop() ) {
					unresolved.teardown();
				}
			},
			resolve: function( index, keypath ) {
				this.args[ index ] = {
					keypath: keypath
				};
				this.bubble();
				// when all references have been resolved, we can flag the entire expression
				// as having been resolved
				this.resolved = !--this.pending;
			},
			createEvaluator: function() {
				var evaluator = this.root.viewmodel.evaluators[ this.keypath ];
				// only if it doesn't exist yet!
				if ( !evaluator ) {
					evaluator = new Evaluator( this.root, this.keypath, this.uniqueString, this.str, this.args, this.owner.priority );
					this.root.viewmodel.evaluators[ this.keypath ] = evaluator;
				}
				evaluator.update();
			},
			rebind: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var changed;
				this.args.forEach( function( arg ) {
					var changedKeypath;
					if ( !arg )
						return;
					if ( arg.keypath && ( changedKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
						arg.keypath = changedKeypath;
						changed = true;
					} else if ( arg.indexRef && arg.indexRef === indexRef ) {
						arg.value = newIndex;
						changed = true;
					}
				} );
				if ( changed ) {
					this.bubble();
				}
			}
		};
		return ExpressionResolver;

		function getUniqueString( str, args ) {
			// get string that is unique to this expression
			return str.replace( /\$\{([0-9]+)\}/g, function( match, $1 ) {
				var arg = args[ $1 ];
				if ( !arg )
					return 'undefined';
				if ( arg.indexRef )
					return arg.value;
				return arg.keypath;
			} );
		}

		function getKeypath( uniqueString ) {
			// Sanitize by removing any periods or square brackets. Otherwise
			// we can't split the keypath into keys!
			return '${' + uniqueString.replace( /[\.\[\]]/g, '-' ) + '}';
		}
	}( removeFromArray, resolveRef, Unresolved, Evaluator, getNewKeypath );

	/* virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/MemberResolver.js */
	var MemberResolver = function( types, resolveRef, Unresolved, getNewKeypath, ExpressionResolver ) {

		var MemberResolver = function( template, resolver, parentFragment ) {
			var member = this,
				ref, indexRefs, index, ractive, keypath;
			member.resolver = resolver;
			member.root = resolver.root;
			member.viewmodel = resolver.root.viewmodel;
			if ( typeof template === 'string' ) {
				member.value = template;
			} else if ( template.t === types.REFERENCE ) {
				ref = member.ref = template.n;
				// If it's an index reference, our job is simple
				if ( ( indexRefs = parentFragment.indexRefs ) && ( index = indexRefs[ ref ] ) !== undefined ) {
					member.indexRef = ref;
					member.value = index;
				} else {
					ractive = resolver.root;
					// Can we resolve the reference immediately?
					if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
						member.resolve( keypath );
					} else {
						// Couldn't resolve yet
						member.unresolved = new Unresolved( ractive, ref, parentFragment, function( keypath ) {
							member.unresolved = null;
							member.resolve( keypath );
						} );
					}
				}
			} else {
				new ExpressionResolver( resolver, parentFragment, template, function( keypath ) {
					member.resolve( keypath );
				} );
			}
		};
		MemberResolver.prototype = {
			resolve: function( keypath ) {
				this.keypath = keypath;
				this.value = this.viewmodel.get( keypath );
				this.bind();
				this.resolver.bubble();
			},
			bind: function() {
				this.viewmodel.register( this.keypath, this );
			},
			rebind: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var keypath;
				if ( indexRef && this.indexRef === indexRef ) {
					if ( newIndex !== this.value ) {
						this.value = newIndex;
						return true;
					}
				} else if ( this.keypath && ( keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath ) ) ) {
					this.unbind();
					this.keypath = keypath;
					this.value = this.root.viewmodel.get( keypath );
					this.bind();
					return true;
				}
			},
			setValue: function( value ) {
				this.value = value;
				this.resolver.bubble();
			},
			unbind: function() {
				if ( this.keypath ) {
					this.root.viewmodel.unregister( this.keypath, this );
				}
			},
			teardown: function() {
				this.unbind();
				if ( this.unresolved ) {
					this.unresolved.teardown();
				}
			},
			forceResolution: function() {
				if ( this.unresolved ) {
					this.unresolved.teardown();
					this.unresolved = null;
					this.keypath = this.ref;
					this.value = this.viewmodel.get( this.ref );
					this.bind();
				}
			}
		};
		return MemberResolver;
	}( types, resolveRef, Unresolved, getNewKeypath, ExpressionResolver );

	/* virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver.js */
	var ReferenceExpressionResolver = function( resolveRef, Unresolved, MemberResolver ) {

		var ReferenceExpressionResolver = function( mustache, template, callback ) {
			var this$0 = this;
			var resolver = this,
				ractive, ref, keypath, parentFragment;
			parentFragment = mustache.parentFragment;
			resolver.root = ractive = mustache.root;
			resolver.mustache = mustache;
			resolver.priority = mustache.priority;
			resolver.ref = ref = template.r;
			resolver.callback = callback;
			resolver.unresolved = [];
			// Find base keypath
			if ( keypath = resolveRef( ractive, ref, parentFragment ) ) {
				resolver.base = keypath;
			} else {
				resolver.baseResolver = new Unresolved( ractive, ref, parentFragment, function( keypath ) {
					resolver.base = keypath;
					resolver.baseResolver = null;
					resolver.bubble();
				} );
			}
			// Find values for members, or mark them as unresolved
			resolver.members = template.m.map( function( template ) {
				return new MemberResolver( template, this$0, parentFragment );
			} );
			resolver.ready = true;
			resolver.bubble();
		};
		ReferenceExpressionResolver.prototype = {
			getKeypath: function() {
				var values = this.members.map( getValue );
				if ( !values.every( isDefined ) || this.baseResolver ) {
					return;
				}
				return this.base + '.' + values.join( '.' );
			},
			bubble: function() {
				if ( !this.ready || this.baseResolver ) {
					return;
				}
				this.callback( this.getKeypath() );
			},
			teardown: function() {
				this.members.forEach( unbind );
			},
			rebind: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var changed;
				this.members.forEach( function( members ) {
					if ( members.rebind( indexRef, newIndex, oldKeypath, newKeypath ) ) {
						changed = true;
					}
				} );
				if ( changed ) {
					this.bubble();
				}
			},
			forceResolution: function() {
				if ( this.baseResolver ) {
					this.base = this.ref;
					this.baseResolver.teardown();
					this.baseResolver = null;
				}
				this.members.forEach( function( m ) {
					return m.forceResolution();
				} );
				this.bubble();
			}
		};

		function getValue( member ) {
			return member.value;
		}

		function isDefined( value ) {
			return value != undefined;
		}

		function unbind( member ) {
			member.unbind();
		}
		return ReferenceExpressionResolver;
	}( resolveRef, Unresolved, MemberResolver );

	/* virtualdom/items/shared/Mustache/initialise.js */
	var initialise = function( types, runloop, resolveRef, ReferenceExpressionResolver, ExpressionResolver ) {

		return function Mustache$init( mustache, options ) {
			var ref, keypath, indexRefs, index, parentFragment, template;
			parentFragment = options.parentFragment;
			template = options.template;
			mustache.root = parentFragment.root;
			mustache.parentFragment = parentFragment;
			mustache.pElement = parentFragment.pElement;
			mustache.template = options.template;
			mustache.index = options.index || 0;
			mustache.priority = parentFragment.priority;
			mustache.isStatic = options.template.s;
			mustache.type = options.template.t;
			// if this is a simple mustache, with a reference, we just need to resolve
			// the reference to a keypath
			if ( ref = template.r ) {
				indexRefs = parentFragment.indexRefs;
				if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
					mustache.indexRef = ref;
					mustache.setValue( index );
					return;
				}
				keypath = resolveRef( mustache.root, ref, mustache.parentFragment );
				if ( keypath !== undefined ) {
					mustache.resolve( keypath );
				} else {
					mustache.ref = ref;
					runloop.addUnresolved( mustache );
				}
			}
			// if it's an expression, we have a bit more work to do
			if ( options.template.x ) {
				mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.template.x, resolveAndRebindChildren );
			}
			if ( options.template.rx ) {
				mustache.resolver = new ReferenceExpressionResolver( mustache, options.template.rx, resolveAndRebindChildren );
			}
			// Special case - inverted sections
			if ( mustache.template.n === types.SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
				mustache.setValue( undefined );
			}

			function resolveAndRebindChildren( newKeypath ) {
				var oldKeypath = mustache.keypath;
				if ( newKeypath !== oldKeypath ) {
					mustache.resolve( newKeypath );
					if ( oldKeypath !== undefined ) {
						mustache.fragments && mustache.fragments.forEach( function( f ) {
							f.rebind( null, null, oldKeypath, newKeypath );
						} );
					}
				}
			}
		};
	}( types, runloop, resolveRef, ReferenceExpressionResolver, ExpressionResolver );

	/* virtualdom/items/shared/Mustache/resolve.js */
	var resolve = function Mustache$resolve( keypath ) {
		var wasResolved, value, twowayBinding;
		// If we resolved previously, we need to unregister
		if ( this.keypath !== undefined ) {
			this.root.viewmodel.unregister( this.keypath, this );
			wasResolved = true;
		}
		this.keypath = keypath;
		// If the new keypath exists, we need to register
		// with the viewmodel
		if ( keypath !== undefined ) {
			value = this.root.viewmodel.get( keypath );
			this.root.viewmodel.register( keypath, this );
		}
		// Either way we need to queue up a render (`value`
		// will be `undefined` if there's no keypath)
		this.setValue( value );
		// Two-way bindings need to point to their new target keypath
		if ( wasResolved && ( twowayBinding = this.twowayBinding ) ) {
			twowayBinding.rebound();
		}
	};

	/* virtualdom/items/shared/Mustache/rebind.js */
	var rebind = function( getNewKeypath ) {

		return function Mustache$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
			var keypath;
			// Children first
			if ( this.fragments ) {
				this.fragments.forEach( function( f ) {
					return f.rebind( indexRef, newIndex, oldKeypath, newKeypath );
				} );
			}
			// Expression mustache?
			if ( this.resolver ) {
				this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			}
			// Normal keypath mustache or reference expression?
			if ( this.keypath ) {
				// was a new keypath created?
				if ( keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath ) ) {
					// resolve it
					this.resolve( keypath );
				}
			} else if ( indexRef !== undefined && this.indexRef === indexRef ) {
				this.setValue( newIndex );
			}
		};
	}( getNewKeypath );

	/* virtualdom/items/shared/Mustache/_Mustache.js */
	var Mustache = function( getValue, init, resolve, rebind ) {

		return {
			getValue: getValue,
			init: init,
			resolve: resolve,
			rebind: rebind
		};
	}( getValue, initialise, resolve, rebind );

	/* virtualdom/items/Interpolator.js */
	var Interpolator = function( types, runloop, escapeHtml, detachNode, unbind, Mustache, detach ) {

		var Interpolator = function( options ) {
			this.type = types.INTERPOLATOR;
			Mustache.init( this, options );
		};
		Interpolator.prototype = {
			update: function() {
				this.node.data = this.value == undefined ? '' : this.value;
			},
			resolve: Mustache.resolve,
			rebind: Mustache.rebind,
			detach: detach,
			unbind: unbind,
			render: function() {
				if ( !this.node ) {
					this.node = document.createTextNode( this.value != undefined ? this.value : '' );
				}
				return this.node;
			},
			unrender: function( shouldDestroy ) {
				if ( shouldDestroy ) {
					detachNode( this.node );
				}
			},
			getValue: Mustache.getValue,
			// TEMP
			setValue: function( value ) {
				var wrapper;
				// TODO is there a better way to approach this?
				if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
					value = wrapper.get();
				}
				if ( value !== this.value ) {
					this.value = value;
					this.parentFragment.bubble();
					if ( this.node ) {
						runloop.addView( this );
					}
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function( escape ) {
				var string = this.value != undefined ? '' + this.value : '';
				return escape ? escapeHtml( string ) : string;
			}
		};
		return Interpolator;
	}( types, runloop, escapeHtml, detachNode, unbind, Mustache, detach );

	/* virtualdom/items/Section/prototype/bubble.js */
	var virtualdom_items_Section$bubble = function Section$bubble() {
		this.parentFragment.bubble();
	};

	/* virtualdom/items/Section/prototype/detach.js */
	var virtualdom_items_Section$detach = function Section$detach() {
		var docFrag;
		if ( this.fragments.length === 1 ) {
			return this.fragments[ 0 ].detach();
		}
		docFrag = document.createDocumentFragment();
		this.fragments.forEach( function( item ) {
			docFrag.appendChild( item.detach() );
		} );
		return docFrag;
	};

	/* virtualdom/items/Section/prototype/find.js */
	var virtualdom_items_Section$find = function Section$find( selector ) {
		var i, len, queryResult;
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			if ( queryResult = this.fragments[ i ].find( selector ) ) {
				return queryResult;
			}
		}
		return null;
	};

	/* virtualdom/items/Section/prototype/findAll.js */
	var virtualdom_items_Section$findAll = function Section$findAll( selector, query ) {
		var i, len;
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			this.fragments[ i ].findAll( selector, query );
		}
	};

	/* virtualdom/items/Section/prototype/findAllComponents.js */
	var virtualdom_items_Section$findAllComponents = function Section$findAllComponents( selector, query ) {
		var i, len;
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			this.fragments[ i ].findAllComponents( selector, query );
		}
	};

	/* virtualdom/items/Section/prototype/findComponent.js */
	var virtualdom_items_Section$findComponent = function Section$findComponent( selector ) {
		var i, len, queryResult;
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			if ( queryResult = this.fragments[ i ].findComponent( selector ) ) {
				return queryResult;
			}
		}
		return null;
	};

	/* virtualdom/items/Section/prototype/findNextNode.js */
	var virtualdom_items_Section$findNextNode = function Section$findNextNode( fragment ) {
		if ( this.fragments[ fragment.index + 1 ] ) {
			return this.fragments[ fragment.index + 1 ].firstNode();
		}
		return this.parentFragment.findNextNode( this );
	};

	/* virtualdom/items/Section/prototype/firstNode.js */
	var virtualdom_items_Section$firstNode = function Section$firstNode() {
		var len, i, node;
		if ( len = this.fragments.length ) {
			for ( i = 0; i < len; i += 1 ) {
				if ( node = this.fragments[ i ].firstNode() ) {
					return node;
				}
			}
		}
		return this.parentFragment.findNextNode( this );
	};

	/* virtualdom/items/Section/prototype/merge.js */
	var virtualdom_items_Section$merge = function( runloop, circular ) {

		var Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Section$merge( newIndices ) {
			var section = this,
				parentFragment, firstChange, i, newLength, reboundFragments, fragmentOptions, fragment, nextNode;
			if ( this.unbound ) {
				return;
			}
			parentFragment = this.parentFragment;
			reboundFragments = [];
			// first, rebind existing fragments
			newIndices.forEach( function rebindIfNecessary( newIndex, oldIndex ) {
				var fragment, by, oldKeypath, newKeypath;
				if ( newIndex === oldIndex ) {
					reboundFragments[ newIndex ] = section.fragments[ oldIndex ];
					return;
				}
				fragment = section.fragments[ oldIndex ];
				if ( firstChange === undefined ) {
					firstChange = oldIndex;
				}
				// does this fragment need to be torn down?
				if ( newIndex === -1 ) {
					section.fragmentsToUnrender.push( fragment );
					fragment.unbind();
					return;
				}
				// Otherwise, it needs to be rebound to a new index
				by = newIndex - oldIndex;
				oldKeypath = section.keypath + '.' + oldIndex;
				newKeypath = section.keypath + '.' + newIndex;
				fragment.rebind( section.template.i, newIndex, oldKeypath, newKeypath );
				reboundFragments[ newIndex ] = fragment;
			} );
			newLength = this.root.get( this.keypath ).length;
			// If nothing changed with the existing fragments, then we start adding
			// new fragments at the end...
			if ( firstChange === undefined ) {
				// ...unless there are no new fragments to add
				if ( this.length === newLength ) {
					return;
				}
				firstChange = this.length;
			}
			this.length = this.fragments.length = newLength;
			runloop.addView( this );
			// Prepare new fragment options
			fragmentOptions = {
				template: this.template.f,
				root: this.root,
				owner: this
			};
			if ( this.template.i ) {
				fragmentOptions.indexRef = this.template.i;
			}
			// Add as many new fragments as we need to, or add back existing
			// (detached) fragments
			for ( i = firstChange; i < newLength; i += 1 ) {
				// is this an existing fragment?
				if ( fragment = reboundFragments[ i ] ) {
					this.docFrag.appendChild( fragment.detach( false ) );
				} else {
					// Fragment will be created when changes are applied
					// by the runloop
					this.fragmentsToCreate.push( i );
				}
				this.fragments[ i ] = fragment;
			}
			// reinsert fragment
			nextNode = parentFragment.findNextNode( this );
			this.parentFragment.getNode().insertBefore( this.docFrag, nextNode );
		};
	}( runloop, circular );

	/* virtualdom/items/Section/prototype/render.js */
	var virtualdom_items_Section$render = function Section$render() {
		var docFrag;
		docFrag = this.docFrag = document.createDocumentFragment();
		this.update();
		this.rendered = true;
		return docFrag;
	};

	/* virtualdom/items/Section/prototype/setValue.js */
	var virtualdom_items_Section$setValue = function( types, isArray, isObject, runloop, circular ) {

		var Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Section$setValue( value ) {
			var this$0 = this;
			var wrapper, fragmentOptions;
			if ( this.updating ) {
				// If a child of this section causes a re-evaluation - for example, an
				// expression refers to a function that mutates the array that this
				// section depends on - we'll end up with a double rendering bug (see
				// https://github.com/ractivejs/ractive/issues/748). This prevents it.
				return;
			}
			this.updating = true;
			// with sections, we need to get the fake value if we have a wrapped object
			if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
				value = wrapper.get();
			}
			// If any fragments are awaiting creation after a splice,
			// this is the place to do it
			if ( this.fragmentsToCreate.length ) {
				fragmentOptions = {
					template: this.template.f,
					root: this.root,
					pElement: this.pElement,
					owner: this,
					indexRef: this.template.i
				};
				this.fragmentsToCreate.forEach( function( index ) {
					var fragment;
					fragmentOptions.context = this$0.keypath + '.' + index;
					fragmentOptions.index = index;
					fragment = new Fragment( fragmentOptions );
					this$0.fragmentsToRender.push( this$0.fragments[ index ] = fragment );
				} );
				this.fragmentsToCreate.length = 0;
			} else if ( reevaluateSection( this, value ) ) {
				this.bubble();
				if ( this.rendered ) {
					runloop.addView( this );
				}
			}
			this.value = value;
			this.updating = false;
		};

		function reevaluateSection( section, value ) {
			var fragmentOptions = {
				template: section.template.f,
				root: section.root,
				pElement: section.parentFragment.pElement,
				owner: section
			};
			// If we already know the section type, great
			// TODO can this be optimised? i.e. pick an reevaluateSection function during init
			// and avoid doing this each time?
			if ( section.subtype ) {
				switch ( section.subtype ) {
					case types.SECTION_IF:
						return reevaluateConditionalSection( section, value, false, fragmentOptions );
					case types.SECTION_UNLESS:
						return reevaluateConditionalSection( section, value, true, fragmentOptions );
					case types.SECTION_WITH:
						return reevaluateContextSection( section, fragmentOptions );
					case types.SECTION_EACH:
						if ( isObject( value ) ) {
							return reevaluateListObjectSection( section, value, fragmentOptions );
						}
				}
			}
			// Otherwise we need to work out what sort of section we're dealing with
			section.ordered = !!isArray( value );
			// Ordered list section
			if ( section.ordered ) {
				return reevaluateListSection( section, value, fragmentOptions );
			}
			// Unordered list, or context
			if ( isObject( value ) || typeof value === 'function' ) {
				// Index reference indicates section should be treated as a list
				if ( section.template.i ) {
					return reevaluateListObjectSection( section, value, fragmentOptions );
				}
				// Otherwise, object provides context for contents
				return reevaluateContextSection( section, fragmentOptions );
			}
			// Conditional section
			return reevaluateConditionalSection( section, value, false, fragmentOptions );
		}

		function reevaluateListSection( section, value, fragmentOptions ) {
			var i, length, fragment;
			length = value.length;
			if ( length === section.length ) {
				// Nothing to do
				return false;
			}
			// if the array is shorter than it was previously, remove items
			if ( length < section.length ) {
				section.fragmentsToUnrender = section.fragments.splice( length, section.length - length );
				section.fragmentsToUnrender.forEach( unbind );
			} else {
				if ( length > section.length ) {
					// add any new ones
					for ( i = section.length; i < length; i += 1 ) {
						// append list item to context stack
						fragmentOptions.context = section.keypath + '.' + i;
						fragmentOptions.index = i;
						if ( section.template.i ) {
							fragmentOptions.indexRef = section.template.i;
						}
						fragment = new Fragment( fragmentOptions );
						section.fragmentsToRender.push( section.fragments[ i ] = fragment );
					}
				}
			}
			section.length = length;
			return true;
		}

		function reevaluateListObjectSection( section, value, fragmentOptions ) {
			var id, i, hasKey, fragment, changed;
			hasKey = section.hasKey || ( section.hasKey = {} );
			// remove any fragments that should no longer exist
			i = section.fragments.length;
			while ( i-- ) {
				fragment = section.fragments[ i ];
				if ( !( fragment.index in value ) ) {
					changed = true;
					fragment.unbind();
					section.fragmentsToUnrender.push( fragment );
					section.fragments.splice( i, 1 );
					hasKey[ fragment.index ] = false;
				}
			}
			// add any that haven't been created yet
			for ( id in value ) {
				if ( !hasKey[ id ] ) {
					changed = true;
					fragmentOptions.context = section.keypath + '.' + id;
					fragmentOptions.index = id;
					if ( section.template.i ) {
						fragmentOptions.indexRef = section.template.i;
					}
					fragment = new Fragment( fragmentOptions );
					section.fragmentsToRender.push( fragment );
					section.fragments.push( fragment );
					hasKey[ id ] = true;
				}
			}
			section.length = section.fragments.length;
			return changed;
		}

		function reevaluateContextSection( section, fragmentOptions ) {
			var fragment;
			// ...then if it isn't rendered, render it, adding section.keypath to the context stack
			// (if it is already rendered, then any children dependent on the context stack
			// will update themselves without any prompting)
			if ( !section.length ) {
				// append this section to the context stack
				fragmentOptions.context = section.keypath;
				fragmentOptions.index = 0;
				fragment = new Fragment( fragmentOptions );
				section.fragmentsToRender.push( section.fragments[ 0 ] = fragment );
				section.length = 1;
				return true;
			}
		}

		function reevaluateConditionalSection( section, value, inverted, fragmentOptions ) {
			var doRender, emptyArray, fragment;
			emptyArray = isArray( value ) && value.length === 0;
			if ( inverted ) {
				doRender = emptyArray || !value;
			} else {
				doRender = value && !emptyArray;
			}
			if ( doRender ) {
				if ( !section.length ) {
					// no change to context stack
					fragmentOptions.index = 0;
					fragment = new Fragment( fragmentOptions );
					section.fragmentsToRender.push( section.fragments[ 0 ] = fragment );
					section.length = 1;
					return true;
				}
				if ( section.length > 1 ) {
					section.fragmentsToUnrender = section.fragments.splice( 1 );
					section.fragmentsToUnrender.forEach( unbind );
					return true;
				}
			} else if ( section.length ) {
				section.fragmentsToUnrender = section.fragments.splice( 0, section.fragments.length );
				section.fragmentsToUnrender.forEach( unbind );
				section.length = 0;
				return true;
			}
		}

		function unbind( fragment ) {
			fragment.unbind();
		}
	}( types, isArray, isObject, runloop, circular );

	/* virtualdom/items/Section/prototype/splice.js */
	var virtualdom_items_Section$splice = function( runloop, circular ) {

		var Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Section$splice( spliceSummary ) {
			var section = this,
				balance, start, insertStart, insertEnd, spliceArgs;
			// In rare cases, a section will receive a splice instruction after it has
			// been unbound (see https://github.com/ractivejs/ractive/issues/967). This
			// prevents errors arising from those situations
			if ( this.unbound ) {
				return;
			}
			balance = spliceSummary.balance;
			if ( !balance ) {
				// The array length hasn't changed - we don't need to add or remove anything
				return;
			}
			// Register with the runloop, so we can (un)render with the
			// next batch of DOM changes
			runloop.addView( section );
			start = spliceSummary.rangeStart;
			section.length += balance;
			// If more items were removed from the array than added, we tear down
			// the excess fragments and remove them...
			if ( balance < 0 ) {
				section.fragmentsToUnrender = section.fragments.splice( start, -balance );
				section.fragmentsToUnrender.forEach( unbind );
				// Reassign fragments after the ones we've just removed
				rebindFragments( section, start, section.length, balance );
				// Nothing more to do
				return;
			}
			// ...otherwise we need to add some things to the DOM.
			insertStart = start + spliceSummary.removed;
			insertEnd = start + spliceSummary.added;
			// Make room for the new fragments by doing a splice that simulates
			// what happened to the data array
			spliceArgs = [
				insertStart,
				0
			];
			spliceArgs.length += balance;
			section.fragments.splice.apply( section.fragments, spliceArgs );
			// Rebind existing fragments at the end of the array
			rebindFragments( section, insertEnd, section.length, balance );
			// Schedule new fragments to be created
			section.fragmentsToCreate = range( insertStart, insertEnd );
		};

		function unbind( fragment ) {
			fragment.unbind();
		}

		function range( start, end ) {
			var array = [],
				i;
			for ( i = start; i < end; i += 1 ) {
				array.push( i );
			}
			return array;
		}

		function rebindFragments( section, start, end, by ) {
			var i, fragment, indexRef, oldKeypath, newKeypath;
			indexRef = section.template.i;
			for ( i = start; i < end; i += 1 ) {
				fragment = section.fragments[ i ];
				oldKeypath = section.keypath + '.' + ( i - by );
				newKeypath = section.keypath + '.' + i;
				// change the fragment index
				fragment.index = i;
				fragment.rebind( indexRef, i, oldKeypath, newKeypath );
			}
		}
	}( runloop, circular );

	/* virtualdom/items/Section/prototype/toString.js */
	var virtualdom_items_Section$toString = function Section$toString( escape ) {
		var str, i, len;
		str = '';
		i = 0;
		len = this.length;
		for ( i = 0; i < len; i += 1 ) {
			str += this.fragments[ i ].toString( escape );
		}
		return str;
	};

	/* virtualdom/items/Section/prototype/unbind.js */
	var virtualdom_items_Section$unbind = function( unbind ) {

		return function Section$unbind() {
			this.fragments.forEach( unbindFragment );
			unbind.call( this );
			this.length = 0;
			this.unbound = true;
		};

		function unbindFragment( fragment ) {
			fragment.unbind();
		}
	}( unbind );

	/* virtualdom/items/Section/prototype/unrender.js */
	var virtualdom_items_Section$unrender = function() {

		return function Section$unrender( shouldDestroy ) {
			this.fragments.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
		};

		function unrenderAndDestroy( fragment ) {
			fragment.unrender( true );
		}

		function unrender( fragment ) {
			fragment.unrender( false );
		}
	}();

	/* virtualdom/items/Section/prototype/update.js */
	var virtualdom_items_Section$update = function Section$update() {
		var fragment, rendered, nextFragment, anchor, target;
		while ( fragment = this.fragmentsToUnrender.pop() ) {
			fragment.unrender( true );
		}
		// If we have no new nodes to insert (i.e. the section length stayed the
		// same, or shrank), we don't need to go any further
		if ( !this.fragmentsToRender.length ) {
			return;
		}
		if ( this.rendered ) {
			target = this.parentFragment.getNode();
		}
		// Render new fragments to our docFrag
		while ( fragment = this.fragmentsToRender.shift() ) {
			rendered = fragment.render();
			this.docFrag.appendChild( rendered );
			// If this is an ordered list, and it's already rendered, we may
			// need to insert content into the appropriate place
			if ( this.rendered && this.ordered ) {
				// If the next fragment is already rendered, use it as an anchor...
				nextFragment = this.fragments[ fragment.index + 1 ];
				if ( nextFragment && nextFragment.rendered ) {
					target.insertBefore( this.docFrag, nextFragment.firstNode() || null );
				}
			}
		}
		if ( this.rendered && this.docFrag.childNodes.length ) {
			anchor = this.parentFragment.findNextNode( this );
			target.insertBefore( this.docFrag, anchor );
		}
	};

	/* virtualdom/items/Section/_Section.js */
	var Section = function( types, Mustache, bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, merge, render, setValue, splice, toString, unbind, unrender, update ) {

		var Section = function( options ) {
			this.type = types.SECTION;
			this.subtype = options.template.n;
			this.inverted = this.subtype === types.SECTION_UNLESS;
			this.pElement = options.pElement;
			this.fragments = [];
			this.fragmentsToCreate = [];
			this.fragmentsToRender = [];
			this.fragmentsToUnrender = [];
			this.length = 0;
			// number of times this section is rendered
			Mustache.init( this, options );
		};
		Section.prototype = {
			bubble: bubble,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			findNextNode: findNextNode,
			firstNode: firstNode,
			getValue: Mustache.getValue,
			merge: merge,
			rebind: Mustache.rebind,
			render: render,
			resolve: Mustache.resolve,
			setValue: setValue,
			splice: splice,
			toString: toString,
			unbind: unbind,
			unrender: unrender,
			update: update
		};
		return Section;
	}( types, Mustache, virtualdom_items_Section$bubble, virtualdom_items_Section$detach, virtualdom_items_Section$find, virtualdom_items_Section$findAll, virtualdom_items_Section$findAllComponents, virtualdom_items_Section$findComponent, virtualdom_items_Section$findNextNode, virtualdom_items_Section$firstNode, virtualdom_items_Section$merge, virtualdom_items_Section$render, virtualdom_items_Section$setValue, virtualdom_items_Section$splice, virtualdom_items_Section$toString, virtualdom_items_Section$unbind, virtualdom_items_Section$unrender, virtualdom_items_Section$update );

	/* virtualdom/items/Triple/prototype/detach.js */
	var virtualdom_items_Triple$detach = function Triple$detach() {
		var len, i;
		if ( this.docFrag ) {
			len = this.nodes.length;
			for ( i = 0; i < len; i += 1 ) {
				this.docFrag.appendChild( this.nodes[ i ] );
			}
			return this.docFrag;
		}
	};

	/* virtualdom/items/Triple/prototype/find.js */
	var virtualdom_items_Triple$find = function( matches ) {

		return function Triple$find( selector ) {
			var i, len, node, queryResult;
			len = this.nodes.length;
			for ( i = 0; i < len; i += 1 ) {
				node = this.nodes[ i ];
				if ( node.nodeType !== 1 ) {
					continue;
				}
				if ( matches( node, selector ) ) {
					return node;
				}
				if ( queryResult = node.querySelector( selector ) ) {
					return queryResult;
				}
			}
			return null;
		};
	}( matches );

	/* virtualdom/items/Triple/prototype/findAll.js */
	var virtualdom_items_Triple$findAll = function( matches ) {

		return function Triple$findAll( selector, queryResult ) {
			var i, len, node, queryAllResult, numNodes, j;
			len = this.nodes.length;
			for ( i = 0; i < len; i += 1 ) {
				node = this.nodes[ i ];
				if ( node.nodeType !== 1 ) {
					continue;
				}
				if ( matches( node, selector ) ) {
					queryResult.push( node );
				}
				if ( queryAllResult = node.querySelectorAll( selector ) ) {
					numNodes = queryAllResult.length;
					for ( j = 0; j < numNodes; j += 1 ) {
						queryResult.push( queryAllResult[ j ] );
					}
				}
			}
		};
	}( matches );

	/* virtualdom/items/Triple/prototype/firstNode.js */
	var virtualdom_items_Triple$firstNode = function Triple$firstNode() {
		if ( this.rendered && this.nodes[ 0 ] ) {
			return this.nodes[ 0 ];
		}
		return this.parentFragment.findNextNode( this );
	};

	/* virtualdom/items/Triple/helpers/insertHtml.js */
	var insertHtml = function( namespaces, createElement ) {

		var elementCache = {},
			ieBug, ieBlacklist;
		try {
			createElement( 'table' ).innerHTML = 'foo';
		} catch ( err ) {
			ieBug = true;
			ieBlacklist = {
				TABLE: [
					'<table class="x">',
					'</table>'
				],
				THEAD: [
					'<table><thead class="x">',
					'</thead></table>'
				],
				TBODY: [
					'<table><tbody class="x">',
					'</tbody></table>'
				],
				TR: [
					'<table><tr class="x">',
					'</tr></table>'
				],
				SELECT: [
					'<select class="x">',
					'</select>'
				]
			};
		}
		return function( html, node, docFrag ) {
			var container, nodes = [],
				wrapper, selectedOption, child, i;
			if ( html ) {
				if ( ieBug && ( wrapper = ieBlacklist[ node.tagName ] ) ) {
					container = element( 'DIV' );
					container.innerHTML = wrapper[ 0 ] + html + wrapper[ 1 ];
					container = container.querySelector( '.x' );
					if ( container.tagName === 'SELECT' ) {
						selectedOption = container.options[ container.selectedIndex ];
					}
				} else if ( node.namespaceURI === namespaces.svg ) {
					container = element( 'DIV' );
					container.innerHTML = '<svg class="x">' + html + '</svg>';
					container = container.querySelector( '.x' );
				} else {
					container = element( node.tagName );
					container.innerHTML = html;
				}
				while ( child = container.firstChild ) {
					nodes.push( child );
					docFrag.appendChild( child );
				}
				// This is really annoying. Extracting <option> nodes from the
				// temporary container <select> causes the remaining ones to
				// become selected. So now we have to deselect them. IE8, you
				// amaze me. You really do
				if ( ieBug && node.tagName === 'SELECT' ) {
					i = nodes.length;
					while ( i-- ) {
						if ( nodes[ i ] !== selectedOption ) {
							nodes[ i ].selected = false;
						}
					}
				}
			}
			return nodes;
		};

		function element( tagName ) {
			return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
		}
	}( namespaces, createElement );

	/* utils/toArray.js */
	var toArray = function toArray( arrayLike ) {
		var array = [],
			i = arrayLike.length;
		while ( i-- ) {
			array[ i ] = arrayLike[ i ];
		}
		return array;
	};

	/* virtualdom/items/Triple/helpers/updateSelect.js */
	var updateSelect = function( toArray ) {

		return function updateSelect( parentElement ) {
			var selectedOptions, option, value;
			if ( !parentElement || parentElement.name !== 'select' || !parentElement.binding ) {
				return;
			}
			selectedOptions = toArray( parentElement.node.options ).filter( isSelected );
			// If one of them had a `selected` attribute, we need to sync
			// the model to the view
			if ( parentElement.getAttribute( 'multiple' ) ) {
				value = selectedOptions.map( function( o ) {
					return o.value;
				} );
			} else if ( option = selectedOptions[ 0 ] ) {
				value = option.value;
			}
			if ( value !== undefined ) {
				parentElement.binding.setValue( value );
			}
			parentElement.bubble();
		};

		function isSelected( option ) {
			return option.selected;
		}
	}( toArray );

	/* virtualdom/items/Triple/prototype/render.js */
	var virtualdom_items_Triple$render = function( insertHtml, updateSelect ) {

		return function Triple$render() {
			if ( this.rendered ) {
				throw new Error( 'Attempted to render an item that was already rendered' );
			}
			this.docFrag = document.createDocumentFragment();
			this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );
			// Special case - we're inserting the contents of a <select>
			updateSelect( this.pElement );
			this.rendered = true;
			return this.docFrag;
		};
	}( insertHtml, updateSelect );

	/* virtualdom/items/Triple/prototype/setValue.js */
	var virtualdom_items_Triple$setValue = function( runloop ) {

		return function Triple$setValue( value ) {
			var wrapper;
			// TODO is there a better way to approach this?
			if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
				value = wrapper.get();
			}
			if ( value !== this.value ) {
				this.value = value;
				this.parentFragment.bubble();
				if ( this.rendered ) {
					runloop.addView( this );
				}
			}
		};
	}( runloop );

	/* virtualdom/items/Triple/prototype/toString.js */
	var virtualdom_items_Triple$toString = function Triple$toString() {
		return this.value != undefined ? this.value : '';
	};

	/* virtualdom/items/Triple/prototype/unrender.js */
	var virtualdom_items_Triple$unrender = function( detachNode ) {

		return function Triple$unrender( shouldDestroy ) {
			if ( this.rendered && shouldDestroy ) {
				this.nodes.forEach( detachNode );
				this.rendered = false;
			}
		};
	}( detachNode );

	/* virtualdom/items/Triple/prototype/update.js */
	var virtualdom_items_Triple$update = function( insertHtml, updateSelect ) {

		return function Triple$update() {
			var node, parentNode;
			if ( !this.rendered ) {
				return;
			}
			// Remove existing nodes
			while ( this.nodes && this.nodes.length ) {
				node = this.nodes.pop();
				node.parentNode.removeChild( node );
			}
			// Insert new nodes
			parentNode = this.parentFragment.getNode();
			this.nodes = insertHtml( this.value, parentNode, this.docFrag );
			parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			// Special case - we're inserting the contents of a <select>
			updateSelect( this.pElement );
		};
	}( insertHtml, updateSelect );

	/* virtualdom/items/Triple/_Triple.js */
	var Triple = function( types, Mustache, detach, find, findAll, firstNode, render, setValue, toString, unrender, update, unbind ) {

		var Triple = function( options ) {
			this.type = types.TRIPLE;
			Mustache.init( this, options );
		};
		Triple.prototype = {
			detach: detach,
			find: find,
			findAll: findAll,
			firstNode: firstNode,
			getValue: Mustache.getValue,
			rebind: Mustache.rebind,
			render: render,
			resolve: Mustache.resolve,
			setValue: setValue,
			toString: toString,
			unbind: unbind,
			unrender: unrender,
			update: update
		};
		return Triple;
	}( types, Mustache, virtualdom_items_Triple$detach, virtualdom_items_Triple$find, virtualdom_items_Triple$findAll, virtualdom_items_Triple$firstNode, virtualdom_items_Triple$render, virtualdom_items_Triple$setValue, virtualdom_items_Triple$toString, virtualdom_items_Triple$unrender, virtualdom_items_Triple$update, unbind );

	/* virtualdom/items/Element/prototype/bubble.js */
	var virtualdom_items_Element$bubble = function() {
		this.parentFragment.bubble();
	};

	/* virtualdom/items/Element/prototype/detach.js */
	var virtualdom_items_Element$detach = function Element$detach() {
		var node = this.node,
			parentNode;
		if ( node ) {
			// need to check for parent node - DOM may have been altered
			// by something other than Ractive! e.g. jQuery UI...
			if ( parentNode = node.parentNode ) {
				parentNode.removeChild( node );
			}
			return node;
		}
	};

	/* virtualdom/items/Element/prototype/find.js */
	var virtualdom_items_Element$find = function( matches ) {

		return function( selector ) {
			if ( matches( this.node, selector ) ) {
				return this.node;
			}
			if ( this.fragment && this.fragment.find ) {
				return this.fragment.find( selector );
			}
		};
	}( matches );

	/* virtualdom/items/Element/prototype/findAll.js */
	var virtualdom_items_Element$findAll = function( selector, query ) {
		// Add this node to the query, if applicable, and register the
		// query on this element
		if ( query._test( this, true ) && query.live ) {
			( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
		}
		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	};

	/* virtualdom/items/Element/prototype/findAllComponents.js */
	var virtualdom_items_Element$findAllComponents = function( selector, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( selector, query );
		}
	};

	/* virtualdom/items/Element/prototype/findComponent.js */
	var virtualdom_items_Element$findComponent = function( selector ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( selector );
		}
	};

	/* virtualdom/items/Element/prototype/findNextNode.js */
	var virtualdom_items_Element$findNextNode = function Element$findNextNode() {
		return null;
	};

	/* virtualdom/items/Element/prototype/firstNode.js */
	var virtualdom_items_Element$firstNode = function Element$firstNode() {
		return this.node;
	};

	/* virtualdom/items/Element/prototype/getAttribute.js */
	var virtualdom_items_Element$getAttribute = function Element$getAttribute( name ) {
		if ( !this.attributes || !this.attributes[ name ] ) {
			return;
		}
		return this.attributes[ name ].value;
	};

	/* virtualdom/items/Element/shared/enforceCase.js */
	var enforceCase = function() {

		var svgCamelCaseElements, svgCamelCaseAttributes, createMap, map;
		svgCamelCaseElements = 'altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern'.split( ' ' );
		svgCamelCaseAttributes = 'attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split( ' ' );
		createMap = function( items ) {
			var map = {},
				i = items.length;
			while ( i-- ) {
				map[ items[ i ].toLowerCase() ] = items[ i ];
			}
			return map;
		};
		map = createMap( svgCamelCaseElements.concat( svgCamelCaseAttributes ) );
		return function( elementName ) {
			var lowerCaseElementName = elementName.toLowerCase();
			return map[ lowerCaseElementName ] || lowerCaseElementName;
		};
	}();

	/* virtualdom/items/Element/Attribute/prototype/bubble.js */
	var virtualdom_items_Element_Attribute$bubble = function( runloop ) {

		return function Attribute$bubble() {
			var value = this.fragment.getValue();
			// TODO this can register the attribute multiple times (see render test
			// 'Attribute with nested mustaches')
			if ( value !== this.value ) {
				this.value = value;
				if ( this.name === 'value' && this.node ) {
					// We need to store the value on the DOM like this so we
					// can retrieve it later without it being coerced to a string
					this.node._ractive.value = value;
				}
				if ( this.rendered ) {
					runloop.addView( this );
				}
			}
		};
	}( runloop );

	/* virtualdom/items/Element/Attribute/helpers/determineNameAndNamespace.js */
	var determineNameAndNamespace = function( namespaces, enforceCase ) {

		return function( attribute, name ) {
			var colonIndex, namespacePrefix;
			// are we dealing with a namespaced attribute, e.g. xlink:href?
			colonIndex = name.indexOf( ':' );
			if ( colonIndex !== -1 ) {
				// looks like we are, yes...
				namespacePrefix = name.substr( 0, colonIndex );
				// ...unless it's a namespace *declaration*, which we ignore (on the assumption
				// that only valid namespaces will be used)
				if ( namespacePrefix !== 'xmlns' ) {
					name = name.substring( colonIndex + 1 );
					attribute.name = enforceCase( name );
					attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];
					if ( !attribute.namespace ) {
						throw 'Unknown namespace ("' + namespacePrefix + '")';
					}
					return;
				}
			}
			// SVG attribute names are case sensitive
			attribute.name = attribute.element.namespace !== namespaces.html ? enforceCase( name ) : name;
		};
	}( namespaces, enforceCase );

	/* virtualdom/items/Element/Attribute/helpers/getInterpolator.js */
	var getInterpolator = function( types ) {

		return function getInterpolator( attribute ) {
			var items = attribute.fragment.items;
			if ( items.length !== 1 ) {
				return;
			}
			if ( items[ 0 ].type === types.INTERPOLATOR ) {
				return items[ 0 ];
			}
		};
	}( types );

	/* virtualdom/items/Element/Attribute/helpers/determinePropertyName.js */
	var determinePropertyName = function( namespaces ) {

		// the property name equivalents for element attributes, where they differ
		// from the lowercased attribute name
		var propertyNames = {
			'accept-charset': 'acceptCharset',
			accesskey: 'accessKey',
			bgcolor: 'bgColor',
			'class': 'className',
			codebase: 'codeBase',
			colspan: 'colSpan',
			contenteditable: 'contentEditable',
			datetime: 'dateTime',
			dirname: 'dirName',
			'for': 'htmlFor',
			'http-equiv': 'httpEquiv',
			ismap: 'isMap',
			maxlength: 'maxLength',
			novalidate: 'noValidate',
			pubdate: 'pubDate',
			readonly: 'readOnly',
			rowspan: 'rowSpan',
			tabindex: 'tabIndex',
			usemap: 'useMap'
		};
		return function( attribute, options ) {
			var propertyName;
			if ( attribute.pNode && !attribute.namespace && ( !options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces.html ) ) {
				propertyName = propertyNames[ attribute.name ] || attribute.name;
				if ( options.pNode[ propertyName ] !== undefined ) {
					attribute.propertyName = propertyName;
				}
				// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
				// node.selected = true rather than node.setAttribute( 'selected', '' )
				if ( typeof options.pNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
					attribute.useProperty = true;
				}
			}
		};
	}( namespaces );

	/* virtualdom/items/Element/Attribute/prototype/init.js */
	var virtualdom_items_Element_Attribute$init = function( types, determineNameAndNamespace, getInterpolator, determinePropertyName, circular ) {

		var Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Attribute$init( options ) {
			this.type = types.ATTRIBUTE;
			this.element = options.element;
			this.root = options.root;
			determineNameAndNamespace( this, options.name );
			// if it's an empty attribute, or just a straight key-value pair, with no
			// mustache shenanigans, set the attribute accordingly and go home
			if ( !options.value || typeof options.value === 'string' ) {
				this.value = options.value || true;
				return;
			}
			// otherwise we need to do some work
			// share parentFragment with parent element
			this.parentFragment = this.element.parentFragment;
			this.fragment = new Fragment( {
				template: options.value,
				root: this.root,
				owner: this
			} );
			this.value = this.fragment.getValue();
			// Store a reference to this attribute's interpolator, if its fragment
			// takes the form `{{foo}}`. This is necessary for two-way binding and
			// for correctly rendering HTML later
			this.interpolator = getInterpolator( this );
			this.isBindable = !!this.interpolator;
			// can we establish this attribute's property name equivalent?
			determinePropertyName( this, options );
			// mark as ready
			this.ready = true;
		};
	}( types, determineNameAndNamespace, getInterpolator, determinePropertyName, circular );

	/* virtualdom/items/Element/Attribute/prototype/rebind.js */
	var virtualdom_items_Element_Attribute$rebind = function Attribute$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( this.fragment ) {
			this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/render.js */
	var virtualdom_items_Element_Attribute$render = function( namespaces ) {

		// the property name equivalents for element attributes, where they differ
		// from the lowercased attribute name
		var propertyNames = {
			'accept-charset': 'acceptCharset',
			'accesskey': 'accessKey',
			'bgcolor': 'bgColor',
			'class': 'className',
			'codebase': 'codeBase',
			'colspan': 'colSpan',
			'contenteditable': 'contentEditable',
			'datetime': 'dateTime',
			'dirname': 'dirName',
			'for': 'htmlFor',
			'http-equiv': 'httpEquiv',
			'ismap': 'isMap',
			'maxlength': 'maxLength',
			'novalidate': 'noValidate',
			'pubdate': 'pubDate',
			'readonly': 'readOnly',
			'rowspan': 'rowSpan',
			'tabindex': 'tabIndex',
			'usemap': 'useMap'
		};
		return function Attribute$render( node ) {
			var propertyName;
			this.node = node;
			// should we use direct property access, or setAttribute?
			if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
				propertyName = propertyNames[ this.name ] || this.name;
				if ( node[ propertyName ] !== undefined ) {
					this.propertyName = propertyName;
				}
				// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
				// node.selected = true rather than node.setAttribute( 'selected', '' )
				if ( typeof node[ propertyName ] === 'boolean' || propertyName === 'value' ) {
					this.useProperty = true;
				}
				if ( propertyName === 'value' ) {
					this.useProperty = true;
					node._ractive.value = this.value;
				}
			}
			this.rendered = true;
			this.update();
		};
	}( namespaces );

	/* virtualdom/items/Element/Attribute/prototype/toString.js */
	var virtualdom_items_Element_Attribute$toString = function() {

		return function Attribute$toString() {
			var name, value, interpolator;
			name = this.name;
			value = this.value;
			// Special case - select values (should not be stringified)
			if ( name === 'value' && this.element.name === 'select' ) {
				return;
			}
			// Special case - radio names
			if ( name === 'name' && this.element.name === 'input' && ( interpolator = this.interpolator ) ) {
				return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
			}
			// Numbers
			if ( typeof value === 'number' ) {
				return name + '="' + value + '"';
			}
			// Strings
			if ( typeof value === 'string' ) {
				return name + '="' + escape( value ) + '"';
			}
			// Everything else
			return value ? name : '';
		};

		function escape( value ) {
			return value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&#39;' );
		}
	}();

	/* virtualdom/items/Element/Attribute/prototype/unbind.js */
	var virtualdom_items_Element_Attribute$unbind = function Attribute$unbind() {
		// ignore non-dynamic attributes
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateSelectValue.js */
	var virtualdom_items_Element_Attribute$update_updateSelectValue = function Attribute$updateSelect() {
		var value = this.value,
			options, option, optionValue, i;
		if ( !this.locked ) {
			this.node._ractive.value = value;
			options = this.node.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				// options inserted via a triple don't have _ractive
				if ( optionValue == value ) {
					// double equals as we may be comparing numbers with strings
					option.selected = true;
					break;
				}
			}
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateMultipleSelectValue.js */
	var virtualdom_items_Element_Attribute$update_updateMultipleSelectValue = function( isArray ) {

		return function Attribute$updateMultipleSelect() {
			var value = this.value,
				options, i, option, optionValue;
			if ( !isArray( value ) ) {
				value = [ value ];
			}
			options = this.node.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				// options inserted via a triple don't have _ractive
				option.selected = value.indexOf( optionValue ) !== -1;
			}
		};
	}( isArray );

	/* virtualdom/items/Element/Attribute/prototype/update/updateRadioName.js */
	var virtualdom_items_Element_Attribute$update_updateRadioName = function Attribute$updateRadioName() {
		var node = ( value = this ).node,
			value = value.value;
		node.checked = value == node._ractive.value;
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateRadioValue.js */
	var virtualdom_items_Element_Attribute$update_updateRadioValue = function( runloop ) {

		return function Attribute$updateRadioValue() {
			var wasChecked, node = this.node,
				binding, bindings, i;
			wasChecked = node.checked;
			node.value = this.element.getAttribute( 'value' );
			node.checked = this.element.getAttribute( 'value' ) === this.element.getAttribute( 'name' );
			// This is a special case - if the input was checked, and the value
			// changed so that it's no longer checked, the twoway binding is
			// most likely out of date. To fix it we have to jump through some
			// hoops... this is a little kludgy but it works
			if ( wasChecked && !node.checked && this.element.binding ) {
				bindings = this.element.binding.siblings;
				if ( i = bindings.length ) {
					while ( i-- ) {
						binding = bindings[ i ];
						if ( !binding.element.node ) {
							// this is the initial render, siblings are still rendering!
							// we'll come back later...
							return;
						}
						if ( binding.element.node.checked ) {
							runloop.addViewmodel( binding.root.viewmodel );
							return binding.handleChange();
						}
					}
					runloop.addViewmodel( binding.root.viewmodel );
					this.root.viewmodel.set( binding.keypath, undefined );
				}
			}
		};
	}( runloop );

	/* virtualdom/items/Element/Attribute/prototype/update/updateCheckboxName.js */
	var virtualdom_items_Element_Attribute$update_updateCheckboxName = function( isArray ) {

		return function Attribute$updateCheckboxName() {
			var node, value;
			node = this.node;
			value = this.value;
			if ( !isArray( value ) ) {
				node.checked = value == node._ractive.value;
			} else {
				node.checked = value.indexOf( node._ractive.value ) !== -1;
			}
		};
	}( isArray );

	/* virtualdom/items/Element/Attribute/prototype/update/updateClassName.js */
	var virtualdom_items_Element_Attribute$update_updateClassName = function Attribute$updateClassName() {
		var node, value;
		node = this.node;
		value = this.value;
		if ( value === undefined ) {
			value = '';
		}
		node.className = value;
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateIdAttribute.js */
	var virtualdom_items_Element_Attribute$update_updateIdAttribute = function Attribute$updateIdAttribute() {
		var node, value;
		node = this.node;
		value = this.value;
		if ( value !== undefined ) {
			this.root.nodes[ value ] = undefined;
		}
		this.root.nodes[ value ] = node;
		node.id = value;
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateIEStyleAttribute.js */
	var virtualdom_items_Element_Attribute$update_updateIEStyleAttribute = function Attribute$updateIEStyleAttribute() {
		var node, value;
		node = this.node;
		value = this.value;
		if ( value === undefined ) {
			value = '';
		}
		node.style.setAttribute( 'cssText', value );
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateContentEditableValue.js */
	var virtualdom_items_Element_Attribute$update_updateContentEditableValue = function Attribute$updateContentEditableValue() {
		var node, value;
		node = this.node;
		value = this.value;
		if ( value === undefined ) {
			value = '';
		}
		if ( !this.locked ) {
			node.innerHTML = value;
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateValue.js */
	var virtualdom_items_Element_Attribute$update_updateValue = function Attribute$updateValue() {
		var node, value;
		node = this.node;
		value = this.value;
		// store actual value, so it doesn't get coerced to a string
		node._ractive.value = value;
		// with two-way binding, only update if the change wasn't initiated by the user
		// otherwise the cursor will often be sent to the wrong place
		if ( !this.locked ) {
			node.value = value == undefined ? '' : value;
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateBoolean.js */
	var virtualdom_items_Element_Attribute$update_updateBoolean = function Attribute$updateBooleanAttribute() {
		// with two-way binding, only update if the change wasn't initiated by the user
		// otherwise the cursor will often be sent to the wrong place
		if ( !this.locked ) {
			this.node[ this.propertyName ] = this.value;
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update/updateEverythingElse.js */
	var virtualdom_items_Element_Attribute$update_updateEverythingElse = function Attribute$updateEverythingElse() {
		var node, name, value;
		node = this.node;
		name = this.name;
		value = this.value;
		if ( this.namespace ) {
			node.setAttributeNS( this.namespace, name, value );
		} else if ( typeof value === 'string' || typeof value === 'number' ) {
			node.setAttribute( name, value );
		} else {
			if ( value ) {
				node.setAttribute( name, '' );
			} else {
				node.removeAttribute( name );
			}
		}
	};

	/* virtualdom/items/Element/Attribute/prototype/update.js */
	var virtualdom_items_Element_Attribute$update = function( namespaces, noop, updateSelectValue, updateMultipleSelectValue, updateRadioName, updateRadioValue, updateCheckboxName, updateClassName, updateIdAttribute, updateIEStyleAttribute, updateContentEditableValue, updateValue, updateBoolean, updateEverythingElse ) {

		// There are a few special cases when it comes to updating attributes. For this reason,
		// the prototype .update() method points to this method, which waits until the
		// attribute has finished initialising, then replaces the prototype method with a more
		// suitable one. That way, we save ourselves doing a bunch of tests on each call
		return function Attribute$update() {
			var name, element, node, type, updateMethod;
			name = this.name;
			element = this.element;
			node = this.node;
			if ( name === 'id' ) {
				updateMethod = updateIdAttribute;
			} else if ( name === 'value' ) {
				// special case - selects
				if ( element.name === 'select' && name === 'value' ) {
					updateMethod = node.multiple ? updateMultipleSelectValue : updateSelectValue;
				} else if ( element.name === 'textarea' ) {
					updateMethod = updateValue;
				} else if ( node.getAttribute( 'contenteditable' ) ) {
					updateMethod = updateContentEditableValue;
				} else if ( element.name === 'input' ) {
					type = element.getAttribute( 'type' );
					// type='file' value='{{fileList}}'>
					if ( type === 'file' ) {
						updateMethod = noop;
					} else if ( type === 'radio' && element.binding && element.binding.name === 'name' ) {
						updateMethod = updateRadioValue;
					} else {
						updateMethod = updateValue;
					}
				}
			} else if ( this.twoway && name === 'name' ) {
				if ( node.type === 'radio' ) {
					updateMethod = updateRadioName;
				} else if ( node.type === 'checkbox' ) {
					updateMethod = updateCheckboxName;
				}
			} else if ( name === 'style' && node.style.setAttribute ) {
				updateMethod = updateIEStyleAttribute;
			} else if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
				updateMethod = updateClassName;
			} else if ( this.useProperty ) {
				updateMethod = updateBoolean;
			}
			if ( !updateMethod ) {
				updateMethod = updateEverythingElse;
			}
			this.update = updateMethod;
			this.update();
		};
	}( namespaces, noop, virtualdom_items_Element_Attribute$update_updateSelectValue, virtualdom_items_Element_Attribute$update_updateMultipleSelectValue, virtualdom_items_Element_Attribute$update_updateRadioName, virtualdom_items_Element_Attribute$update_updateRadioValue, virtualdom_items_Element_Attribute$update_updateCheckboxName, virtualdom_items_Element_Attribute$update_updateClassName, virtualdom_items_Element_Attribute$update_updateIdAttribute, virtualdom_items_Element_Attribute$update_updateIEStyleAttribute, virtualdom_items_Element_Attribute$update_updateContentEditableValue, virtualdom_items_Element_Attribute$update_updateValue, virtualdom_items_Element_Attribute$update_updateBoolean, virtualdom_items_Element_Attribute$update_updateEverythingElse );

	/* virtualdom/items/Element/Attribute/_Attribute.js */
	var Attribute = function( bubble, init, rebind, render, toString, unbind, update ) {

		var Attribute = function( options ) {
			this.init( options );
		};
		Attribute.prototype = {
			bubble: bubble,
			init: init,
			rebind: rebind,
			render: render,
			toString: toString,
			unbind: unbind,
			update: update
		};
		return Attribute;
	}( virtualdom_items_Element_Attribute$bubble, virtualdom_items_Element_Attribute$init, virtualdom_items_Element_Attribute$rebind, virtualdom_items_Element_Attribute$render, virtualdom_items_Element_Attribute$toString, virtualdom_items_Element_Attribute$unbind, virtualdom_items_Element_Attribute$update );

	/* virtualdom/items/Element/prototype/init/createAttributes.js */
	var virtualdom_items_Element$init_createAttributes = function( Attribute ) {

		return function( element, attributes ) {
			var name, attribute, result = [];
			for ( name in attributes ) {
				if ( attributes.hasOwnProperty( name ) ) {
					attribute = new Attribute( {
						element: element,
						name: name,
						value: attributes[ name ],
						root: element.root
					} );
					result.push( result[ name ] = attribute );
				}
			}
			return result;
		};
	}( Attribute );

	/* utils/extend.js */
	var extend = function( target ) {
		var SLICE$0 = Array.prototype.slice;
		var sources = SLICE$0.call( arguments, 1 );
		var prop, source;
		while ( source = sources.shift() ) {
			for ( prop in source ) {
				if ( source.hasOwnProperty( prop ) ) {
					target[ prop ] = source[ prop ];
				}
			}
		}
		return target;
	};

	/* virtualdom/items/Element/Binding/Binding.js */
	var Binding = function( runloop, warn, create, extend, removeFromArray ) {

		var Binding = function( element ) {
			var interpolator, keypath, value;
			this.element = element;
			this.root = element.root;
			this.attribute = element.attributes[ this.name || 'value' ];
			interpolator = this.attribute.interpolator;
			interpolator.twowayBinding = this;
			if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
				warn( 'Two-way binding does not work with expressions: ' + interpolator.keypath );
				return false;
			}
			// A mustache may be *ambiguous*. Let's say we were given
			// `value="{{bar}}"`. If the context was `foo`, and `foo.bar`
			// *wasn't* `undefined`, the keypath would be `foo.bar`.
			// Then, any user input would result in `foo.bar` being updated.
			//
			// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
			// left with an unresolved partial keypath - so we are forced to make an
			// assumption. That assumption is that the input in question should
			// be forced to resolve to `bar`, and any user input would affect `bar`
			// and not `foo.bar`.
			//
			// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
			// be explicit when using two-way data-binding about what keypath you're
			// updating. Using it in lists is probably a recipe for confusion...
			if ( !interpolator.keypath ) {
				if ( interpolator.ref ) {
					interpolator.resolve( interpolator.ref );
				}
				// If we have a reference expression resolver, we have to force
				// members to attach themselves to the root
				if ( interpolator.resolver ) {
					interpolator.resolver.forceResolution();
				}
			}
			this.keypath = keypath = interpolator.keypath;
			// initialise value, if it's undefined
			if ( this.root.viewmodel.get( keypath ) === undefined && this.getInitialValue ) {
				value = this.getInitialValue();
				if ( value !== undefined ) {
					this.root.viewmodel.set( keypath, value );
				}
			}
		};
		Binding.prototype = {
			handleChange: function() {
				var this$0 = this;
				runloop.start( this.root );
				this.attribute.locked = true;
				this.root.viewmodel.set( this.keypath, this.getValue() );
				runloop.scheduleTask( function() {
					return this$0.attribute.locked = false;
				} );
				runloop.end();
			},
			rebound: function() {
				var bindings, oldKeypath, newKeypath;
				oldKeypath = this.keypath;
				newKeypath = this.attribute.interpolator.keypath;
				// The attribute this binding is linked to has already done the work
				if ( oldKeypath === newKeypath ) {
					return;
				}
				removeFromArray( this.root._twowayBindings[ oldKeypath ], this );
				this.keypath = newKeypath;
				bindings = this.root._twowayBindings[ newKeypath ] || ( this.root._twowayBindings[ newKeypath ] = [] );
				bindings.push( this );
			},
			unbind: function() {}
		};
		Binding.extend = function( properties ) {
			var Parent = this,
				SpecialisedBinding;
			SpecialisedBinding = function( element ) {
				Binding.call( this, element );
				if ( this.init ) {
					this.init();
				}
			};
			SpecialisedBinding.prototype = create( Parent.prototype );
			extend( SpecialisedBinding.prototype, properties );
			SpecialisedBinding.extend = Binding.extend;
			return SpecialisedBinding;
		};
		return Binding;
	}( runloop, warn, create, extend, removeFromArray );

	/* virtualdom/items/Element/Binding/shared/handleDomEvent.js */
	var handleDomEvent = function handleChange() {
		this._ractive.binding.handleChange();
	};

	/* virtualdom/items/Element/Binding/ContentEditableBinding.js */
	var ContentEditableBinding = function( Binding, handleDomEvent ) {

		var ContentEditableBinding = Binding.extend( {
			getInitialValue: function() {
				return this.element.fragment ? this.element.fragment.toString() : '';
			},
			render: function() {
				var node = this.element.node;
				node.addEventListener( 'change', handleDomEvent, false );
				if ( !this.root.lazy ) {
					node.addEventListener( 'input', handleDomEvent, false );
					if ( node.attachEvent ) {
						node.addEventListener( 'keyup', handleDomEvent, false );
					}
				}
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'input', handleDomEvent, false );
				node.removeEventListener( 'keyup', handleDomEvent, false );
			},
			getValue: function() {
				return this.element.node.innerHTML;
			}
		} );
		return ContentEditableBinding;
	}( Binding, handleDomEvent );

	/* virtualdom/items/Element/Binding/shared/getSiblings.js */
	var getSiblings = function() {

		var sets = {};
		return function getSiblings( id, group, keypath ) {
			var hash = id + group + keypath;
			return sets[ hash ] || ( sets[ hash ] = [] );
		};
	}();

	/* virtualdom/items/Element/Binding/RadioBinding.js */
	var RadioBinding = function( runloop, removeFromArray, Binding, getSiblings, handleDomEvent ) {

		var RadioBinding = Binding.extend( {
			name: 'checked',
			init: function() {
				this.siblings = getSiblings( this.root._guid, 'radio', this.element.getAttribute( 'name' ) );
				this.siblings.push( this );
			},
			render: function() {
				var node = this.element.node;
				node.addEventListener( 'change', handleDomEvent, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'click', handleDomEvent, false );
				}
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'click', handleDomEvent, false );
			},
			handleChange: function() {
				runloop.start( this.root );
				this.siblings.forEach( function( binding ) {
					binding.root.viewmodel.set( binding.keypath, binding.getValue() );
				} );
				runloop.end();
			},
			getValue: function() {
				return this.element.node.checked;
			},
			unbind: function() {
				removeFromArray( this.siblings, this );
			}
		} );
		return RadioBinding;
	}( runloop, removeFromArray, Binding, getSiblings, handleDomEvent );

	/* virtualdom/items/Element/Binding/RadioNameBinding.js */
	var RadioNameBinding = function( removeFromArray, Binding, handleDomEvent, getSiblings ) {

		var RadioNameBinding = Binding.extend( {
			name: 'name',
			init: function() {
				this.siblings = getSiblings( this.root._guid, 'radioname', this.keypath );
				this.siblings.push( this );
				this.radioName = true;
				// so that ractive.updateModel() knows what to do with this
				this.attribute.twoway = true;
			},
			getInitialValue: function() {
				if ( this.element.getAttribute( 'checked' ) ) {
					return this.element.getAttribute( 'value' );
				}
			},
			render: function() {
				var node = this.element.node;
				node.name = '{{' + this.keypath + '}}';
				node.checked = this.root.viewmodel.get( this.keypath ) == this.element.getAttribute( 'value' );
				node.addEventListener( 'change', handleDomEvent, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'click', handleDomEvent, false );
				}
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'click', handleDomEvent, false );
			},
			getValue: function() {
				var node = this.element.node;
				return node._ractive ? node._ractive.value : node.value;
			},
			handleChange: function() {
				// If this <input> is the one that's checked, then the value of its
				// `name` keypath gets set to its value
				if ( this.element.node.checked ) {
					Binding.prototype.handleChange.call( this );
				}
			},
			rebound: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				var node;
				Binding.prototype.rebound.call( this, indexRef, newIndex, oldKeypath, newKeypath );
				if ( node = this.element.node ) {
					node.name = '{{' + this.keypath + '}}';
				}
			},
			unbind: function() {
				removeFromArray( this.siblings, this );
			}
		} );
		return RadioNameBinding;
	}( removeFromArray, Binding, handleDomEvent, getSiblings );

	/* virtualdom/items/Element/Binding/CheckboxNameBinding.js */
	var CheckboxNameBinding = function( isArray, removeFromArray, Binding, getSiblings, handleDomEvent ) {

		var CheckboxNameBinding = Binding.extend( {
			name: 'name',
			getInitialValue: function() {
				// This only gets called once per group (of inputs that
				// share a name), because it only gets called if there
				// isn't an initial value. By the same token, we can make
				// a note of that fact that there was no initial value,
				// and populate it using any `checked` attributes that
				// exist (which users should avoid, but which we should
				// support anyway to avoid breaking expectations)
				this.noInitialValue = true;
				return [];
			},
			init: function() {
				var existingValue, bindingValue, noInitialValue;
				this.checkboxName = true;
				// so that ractive.updateModel() knows what to do with this
				// Each input has a reference to an array containing it and its
				// siblings, as two-way binding depends on being able to ascertain
				// the status of all inputs within the group
				this.siblings = getSiblings( this.root._guid, 'checkboxes', this.keypath );
				this.siblings.push( this );
				if ( this.noInitialValue ) {
					this.siblings.noInitialValue = true;
				}
				noInitialValue = this.siblings.noInitialValue;
				existingValue = this.root.viewmodel.get( this.keypath );
				bindingValue = this.element.getAttribute( 'value' );
				if ( noInitialValue ) {
					this.isChecked = this.element.getAttribute( 'checked' );
					if ( this.isChecked ) {
						existingValue.push( bindingValue );
					}
				} else {
					this.isChecked = isArray( existingValue ) ? existingValue.indexOf( bindingValue ) !== -1 : existingValue === bindingValue;
				}
			},
			unbind: function() {
				removeFromArray( this.siblings, this );
			},
			render: function() {
				var node = this.element.node;
				node.name = '{{' + this.keypath + '}}';
				node.checked = this.isChecked;
				node.addEventListener( 'change', handleDomEvent, false );
				// in case of IE emergency, bind to click event as well
				if ( node.attachEvent ) {
					node.addEventListener( 'click', handleDomEvent, false );
				}
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'click', handleDomEvent, false );
			},
			changed: function() {
				var wasChecked = !!this.isChecked;
				this.isChecked = this.element.node.checked;
				return this.isChecked === wasChecked;
			},
			handleChange: function() {
				this.isChecked = this.element.node.checked;
				Binding.prototype.handleChange.call( this );
			},
			getValue: function() {
				return this.siblings.filter( isChecked ).map( getValue );
			}
		} );

		function isChecked( binding ) {
			return binding.isChecked;
		}

		function getValue( binding ) {
			return binding.element.getAttribute( 'value' );
		}
		return CheckboxNameBinding;
	}( isArray, removeFromArray, Binding, getSiblings, handleDomEvent );

	/* virtualdom/items/Element/Binding/CheckboxBinding.js */
	var CheckboxBinding = function( Binding, handleDomEvent ) {

		var CheckboxBinding = Binding.extend( {
			name: 'checked',
			render: function() {
				var node = this.element.node;
				node.addEventListener( 'change', handleDomEvent, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'click', handleDomEvent, false );
				}
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'click', handleDomEvent, false );
			},
			getValue: function() {
				return this.element.node.checked;
			}
		} );
		return CheckboxBinding;
	}( Binding, handleDomEvent );

	/* virtualdom/items/Element/Binding/SelectBinding.js */
	var SelectBinding = function( runloop, Binding, handleDomEvent ) {

		var SelectBinding = Binding.extend( {
			getInitialValue: function() {
				var options = this.element.options,
					len, i;
				i = len = options.length;
				if ( !len ) {
					return;
				}
				// take the final selected option...
				while ( i-- ) {
					if ( options[ i ].getAttribute( 'selected' ) ) {
						return options[ i ].getAttribute( 'value' );
					}
				}
				// or the first non-disabled option, if none are selected
				while ( ++i < len ) {
					if ( !options[ i ].getAttribute( 'disabled' ) ) {
						return options[ i ].getAttribute( 'value' );
					}
				}
			},
			render: function() {
				this.element.node.addEventListener( 'change', handleDomEvent, false );
			},
			unrender: function() {
				this.element.node.removeEventListener( 'change', handleDomEvent, false );
			},
			// TODO this method is an anomaly... is it necessary?
			setValue: function( value ) {
				runloop.addViewmodel( this.root.viewmodel );
				this.root.viewmodel.set( this.keypath, value );
			},
			getValue: function() {
				var options, i, len, option, optionValue;
				options = this.element.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( options[ i ].selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						return optionValue;
					}
				}
			},
			forceUpdate: function() {
				var this$0 = this;
				var value = this.getValue();
				if ( value !== undefined ) {
					this.attribute.locked = true;
					runloop.addViewmodel( this.root.viewmodel );
					runloop.scheduleTask( function() {
						return this$0.attribute.locked = false;
					} );
					this.root.viewmodel.set( this.keypath, value );
				}
			}
		} );
		return SelectBinding;
	}( runloop, Binding, handleDomEvent );

	/* utils/arrayContentsMatch.js */
	var arrayContentsMatch = function( isArray ) {

		return function( a, b ) {
			var i;
			if ( !isArray( a ) || !isArray( b ) ) {
				return false;
			}
			if ( a.length !== b.length ) {
				return false;
			}
			i = a.length;
			while ( i-- ) {
				if ( a[ i ] !== b[ i ] ) {
					return false;
				}
			}
			return true;
		};
	}( isArray );

	/* virtualdom/items/Element/Binding/MultipleSelectBinding.js */
	var MultipleSelectBinding = function( runloop, arrayContentsMatch, SelectBinding, handleDomEvent ) {

		var MultipleSelectBinding = SelectBinding.extend( {
			getInitialValue: function() {
				return this.element.options.filter( function( option ) {
					return option.getAttribute( 'selected' );
				} ).map( function( option ) {
					return option.getAttribute( 'value' );
				} );
			},
			render: function() {
				var valueFromModel;
				this.element.node.addEventListener( 'change', handleDomEvent, false );
				valueFromModel = this.root.viewmodel.get( this.keypath );
				if ( valueFromModel === undefined ) {
					// get value from DOM, if possible
					this.handleChange();
				}
			},
			unrender: function() {
				this.element.node.removeEventListener( 'change', handleDomEvent, false );
			},
			setValue: function() {
				throw new Error( 'TODO not implemented yet' );
			},
			getValue: function() {
				var selectedValues, options, i, len, option, optionValue;
				selectedValues = [];
				options = this.element.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( option.selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						selectedValues.push( optionValue );
					}
				}
				return selectedValues;
			},
			handleChange: function() {
				var attribute, previousValue, value;
				attribute = this.attribute;
				previousValue = attribute.value;
				value = this.getValue();
				if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
					SelectBinding.prototype.handleChange.call( this );
				}
				return this;
			},
			forceUpdate: function() {
				var this$0 = this;
				var value = this.getValue();
				if ( value !== undefined ) {
					this.attribute.locked = true;
					runloop.addViewmodel( this.root.viewmodel );
					runloop.scheduleTask( function() {
						return this$0.attribute.locked = false;
					} );
					this.root.viewmodel.set( this.keypath, value );
				}
			},
			updateModel: function() {
				if ( this.attribute.value === undefined || !this.attribute.value.length ) {
					this.root.viewmodel.set( this.keypath, this.initialValue );
				}
			}
		} );
		return MultipleSelectBinding;
	}( runloop, arrayContentsMatch, SelectBinding, handleDomEvent );

	/* virtualdom/items/Element/Binding/FileListBinding.js */
	var FileListBinding = function( Binding, handleDomEvent ) {

		var FileListBinding = Binding.extend( {
			render: function() {
				this.element.node.addEventListener( 'change', handleDomEvent, false );
			},
			unrender: function() {
				this.element.node.removeEventListener( 'change', handleDomEvent, false );
			},
			getValue: function() {
				return this.element.node.files;
			}
		} );
		return FileListBinding;
	}( Binding, handleDomEvent );

	/* virtualdom/items/Element/Binding/GenericBinding.js */
	var GenericBinding = function( Binding, handleDomEvent ) {

		var GenericBinding, getOptions;
		getOptions = {
			evaluateWrapped: true
		};
		GenericBinding = Binding.extend( {
			getInitialValue: function() {
				return '';
			},
			getValue: function() {
				return this.element.node.value;
			},
			render: function() {
				var node = this.element.node;
				node.addEventListener( 'change', handleDomEvent, false );
				if ( !this.root.lazy ) {
					node.addEventListener( 'input', handleDomEvent, false );
					if ( node.attachEvent ) {
						node.addEventListener( 'keyup', handleDomEvent, false );
					}
				}
				node.addEventListener( 'blur', handleBlur, false );
			},
			unrender: function() {
				var node = this.element.node;
				node.removeEventListener( 'change', handleDomEvent, false );
				node.removeEventListener( 'input', handleDomEvent, false );
				node.removeEventListener( 'keyup', handleDomEvent, false );
				node.removeEventListener( 'blur', handleBlur, false );
			}
		} );
		return GenericBinding;

		function handleBlur() {
			var value;
			handleDomEvent.call( this );
			value = this._ractive.root.viewmodel.get( this._ractive.binding.keypath, getOptions );
			this.value = value == undefined ? '' : value;
		}
	}( Binding, handleDomEvent );

	/* virtualdom/items/Element/Binding/NumericBinding.js */
	var NumericBinding = function( GenericBinding ) {

		return GenericBinding.extend( {
			getInitialValue: function() {
				return undefined;
			},
			getValue: function() {
				var value = parseFloat( this.element.node.value );
				return isNaN( value ) ? undefined : value;
			}
		} );
	}( GenericBinding );

	/* virtualdom/items/Element/prototype/init/createTwowayBinding.js */
	var virtualdom_items_Element$init_createTwowayBinding = function( log, ContentEditableBinding, RadioBinding, RadioNameBinding, CheckboxNameBinding, CheckboxBinding, SelectBinding, MultipleSelectBinding, FileListBinding, NumericBinding, GenericBinding ) {

		return function createTwowayBinding( element ) {
			var attributes = element.attributes,
				type, Binding, bindName, bindChecked;
			// if this is a late binding, and there's already one, it
			// needs to be torn down
			if ( element.binding ) {
				element.binding.teardown();
				element.binding = null;
			}
			// contenteditable
			if ( element.getAttribute( 'contenteditable' ) && isBindable( attributes.value ) ) {
				Binding = ContentEditableBinding;
			} else if ( element.name === 'input' ) {
				type = element.getAttribute( 'type' );
				if ( type === 'radio' || type === 'checkbox' ) {
					bindName = isBindable( attributes.name );
					bindChecked = isBindable( attributes.checked );
					// we can either bind the name attribute, or the checked attribute - not both
					if ( bindName && bindChecked ) {
						log.error( {
							message: 'badRadioInputBinding'
						} );
					}
					if ( bindName ) {
						Binding = type === 'radio' ? RadioNameBinding : CheckboxNameBinding;
					} else if ( bindChecked ) {
						Binding = type === 'radio' ? RadioBinding : CheckboxBinding;
					}
				} else if ( type === 'file' && isBindable( attributes.value ) ) {
					Binding = FileListBinding;
				} else if ( isBindable( attributes.value ) ) {
					Binding = type === 'number' || type === 'range' ? NumericBinding : GenericBinding;
				}
			} else if ( element.name === 'select' && isBindable( attributes.value ) ) {
				Binding = element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SelectBinding;
			} else if ( element.name === 'textarea' && isBindable( attributes.value ) ) {
				Binding = GenericBinding;
			}
			if ( Binding ) {
				return new Binding( element );
			}
		};

		function isBindable( attribute ) {
			return attribute && attribute.isBindable;
		}
	}( log, ContentEditableBinding, RadioBinding, RadioNameBinding, CheckboxNameBinding, CheckboxBinding, SelectBinding, MultipleSelectBinding, FileListBinding, NumericBinding, GenericBinding );

	/* virtualdom/items/Element/EventHandler/prototype/fire.js */
	var virtualdom_items_Element_EventHandler$fire = function EventHandler$fire( event ) {
		this.root.fire( this.action.toString().trim(), event );
	};

	/* virtualdom/items/Element/EventHandler/prototype/init.js */
	var virtualdom_items_Element_EventHandler$init = function( circular ) {

		var Fragment, getValueOptions = {
			args: true
		};
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function EventHandler$init( element, name, template ) {
			var action;
			this.element = element;
			this.root = element.root;
			this.name = name;
			this.proxies = [];
			// Get action ('foo' in 'on-click='foo')
			action = template.n || template;
			if ( typeof action !== 'string' ) {
				action = new Fragment( {
					template: action,
					root: this.root,
					owner: this.element
				} );
			}
			this.action = action;
			// Get parameters
			if ( template.d ) {
				this.dynamicParams = new Fragment( {
					template: template.d,
					root: this.root,
					owner: this.element
				} );
				this.fire = fireEventWithDynamicParams;
			} else if ( template.a ) {
				this.params = template.a;
				this.fire = fireEventWithParams;
			}
		};

		function fireEventWithParams( event ) {
			this.root.fire.apply( this.root, [
				this.action.toString().trim(),
				event
			].concat( this.params ) );
		}

		function fireEventWithDynamicParams( event ) {
			var args = this.dynamicParams.getValue( getValueOptions );
			// need to strip [] from ends if a string!
			if ( typeof args === 'string' ) {
				args = args.substr( 1, args.length - 2 );
			}
			this.root.fire.apply( this.root, [
				this.action.toString().trim(),
				event
			].concat( args ) );
		}
	}( circular );

	/* virtualdom/items/Element/EventHandler/prototype/rebind.js */
	var virtualdom_items_Element_EventHandler$rebind = function EventHandler$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( typeof this.action !== 'string' ) {
			this.action.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
		if ( this.dynamicParams ) {
			this.dynamicParams.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	};

	/* virtualdom/items/Element/EventHandler/shared/genericHandler.js */
	var genericHandler = function genericHandler( event ) {
		var storage, handler;
		storage = this._ractive;
		handler = storage.events[ event.type ];
		handler.fire( {
			node: this,
			original: event,
			index: storage.index,
			keypath: storage.keypath,
			context: storage.root.get( storage.keypath )
		} );
	};

	/* virtualdom/items/Element/EventHandler/prototype/render.js */
	var virtualdom_items_Element_EventHandler$render = function( warn, config, genericHandler ) {

		var customHandlers = {};
		return function EventHandler$render() {
			var name = this.name,
				definition;
			this.node = this.element.node;
			if ( definition = config.registries.events.find( this.root, name ) ) {
				this.custom = definition( this.node, getCustomHandler( name ) );
			} else {
				// Looks like we're dealing with a standard DOM event... but let's check
				if ( !( 'on' + name in this.node ) && !( window && 'on' + name in window ) ) {
					warn( 'Missing "' + this.name + '" event. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#events' );
				}
				this.node.addEventListener( name, genericHandler, false );
			}
			// store this on the node itself, so it can be retrieved by a
			// universal handler
			this.node._ractive.events[ name ] = this;
		};

		function getCustomHandler( name ) {
			if ( !customHandlers[ name ] ) {
				customHandlers[ name ] = function( event ) {
					var storage = event.node._ractive;
					event.index = storage.index;
					event.keypath = storage.keypath;
					event.context = storage.root.get( storage.keypath );
					storage.events[ name ].fire( event );
				};
			}
			return customHandlers[ name ];
		}
	}( warn, config, genericHandler );

	/* virtualdom/items/Element/EventHandler/prototype/teardown.js */
	var virtualdom_items_Element_EventHandler$teardown = function EventHandler$teardown() {
		// Tear down dynamic name
		if ( typeof this.action !== 'string' ) {
			this.action.teardown();
		}
		// Tear down dynamic parameters
		if ( this.dynamicParams ) {
			this.dynamicParams.teardown();
		}
	};

	/* virtualdom/items/Element/EventHandler/prototype/unrender.js */
	var virtualdom_items_Element_EventHandler$unrender = function( genericHandler ) {

		return function EventHandler$unrender() {
			if ( this.custom ) {
				this.custom.teardown();
			} else {
				this.node.removeEventListener( this.name, genericHandler, false );
			}
		};
	}( genericHandler );

	/* virtualdom/items/Element/EventHandler/_EventHandler.js */
	var EventHandler = function( fire, init, rebind, render, teardown, unrender ) {

		var EventHandler = function( element, name, template ) {
			this.init( element, name, template );
		};
		EventHandler.prototype = {
			fire: fire,
			init: init,
			rebind: rebind,
			render: render,
			teardown: teardown,
			unrender: unrender
		};
		return EventHandler;
	}( virtualdom_items_Element_EventHandler$fire, virtualdom_items_Element_EventHandler$init, virtualdom_items_Element_EventHandler$rebind, virtualdom_items_Element_EventHandler$render, virtualdom_items_Element_EventHandler$teardown, virtualdom_items_Element_EventHandler$unrender );

	/* virtualdom/items/Element/prototype/init/createEventHandlers.js */
	var virtualdom_items_Element$init_createEventHandlers = function( EventHandler ) {

		return function( element, template ) {
			var i, name, names, handler, result = [];
			for ( name in template ) {
				if ( template.hasOwnProperty( name ) ) {
					names = name.split( '-' );
					i = names.length;
					while ( i-- ) {
						handler = new EventHandler( element, names[ i ], template[ name ] );
						result.push( handler );
					}
				}
			}
			return result;
		};
	}( EventHandler );

	/* virtualdom/items/Element/Decorator/_Decorator.js */
	var Decorator = function( log, circular, config ) {

		var Fragment, getValueOptions, Decorator;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		getValueOptions = {
			args: true
		};
		Decorator = function( element, template ) {
			var decorator = this,
				ractive, name, fragment;
			decorator.element = element;
			decorator.root = ractive = element.root;
			name = template.n || template;
			if ( typeof name !== 'string' ) {
				fragment = new Fragment( {
					template: name,
					root: ractive,
					owner: element
				} );
				name = fragment.toString();
				fragment.unbind();
			}
			if ( template.a ) {
				decorator.params = template.a;
			} else if ( template.d ) {
				decorator.fragment = new Fragment( {
					template: template.d,
					root: ractive,
					owner: element
				} );
				decorator.params = decorator.fragment.getValue( getValueOptions );
				decorator.fragment.bubble = function() {
					this.dirtyArgs = this.dirtyValue = true;
					decorator.params = this.getValue( getValueOptions );
					if ( decorator.ready ) {
						decorator.update();
					}
				};
			}
			decorator.fn = config.registries.decorators.find( ractive, name );
			if ( !decorator.fn ) {
				log.error( {
					debug: ractive.debug,
					message: 'missingPlugin',
					args: {
						plugin: 'decorator',
						name: name
					}
				} );
			}
		};
		Decorator.prototype = {
			init: function() {
				var decorator = this,
					node, result, args;
				node = decorator.element.node;
				if ( decorator.params ) {
					args = [ node ].concat( decorator.params );
					result = decorator.fn.apply( decorator.root, args );
				} else {
					result = decorator.fn.call( decorator.root, node );
				}
				if ( !result || !result.teardown ) {
					throw new Error( 'Decorator definition must return an object with a teardown method' );
				}
				// TODO does this make sense?
				decorator.actual = result;
				decorator.ready = true;
			},
			update: function() {
				if ( this.actual.update ) {
					this.actual.update.apply( this.root, this.params );
				} else {
					this.actual.teardown( true );
					this.init();
				}
			},
			teardown: function( updating ) {
				this.actual.teardown();
				if ( !updating && this.fragment ) {
					this.fragment.unbind();
				}
			}
		};
		return Decorator;
	}( log, circular, config );

	/* virtualdom/items/Element/special/select/sync.js */
	var sync = function( toArray ) {

		return function syncSelect( selectElement ) {
			var selectNode, selectValue, isMultiple, options, optionWasSelected;
			selectNode = selectElement.node;
			if ( !selectNode ) {
				return;
			}
			options = toArray( selectNode.options );
			selectValue = selectElement.getAttribute( 'value' );
			isMultiple = selectElement.getAttribute( 'multiple' );
			// If the <select> has a specified value, that should override
			// these options
			if ( selectValue !== undefined ) {
				options.forEach( function( o ) {
					var optionValue, shouldSelect;
					optionValue = o._ractive ? o._ractive.value : o.value;
					shouldSelect = isMultiple ? valueContains( selectValue, optionValue ) : selectValue == optionValue;
					if ( shouldSelect ) {
						optionWasSelected = true;
					}
					o.selected = shouldSelect;
				} );
				if ( !optionWasSelected ) {
					if ( options[ 0 ] ) {
						options[ 0 ].selected = true;
					}
					if ( selectElement.binding ) {
						selectElement.binding.forceUpdate();
					}
				}
			} else if ( selectElement.binding ) {
				selectElement.binding.forceUpdate();
			}
		};

		function valueContains( selectValue, optionValue ) {
			var i = selectValue.length;
			while ( i-- ) {
				if ( selectValue[ i ] == optionValue ) {
					return true;
				}
			}
		}
	}( toArray );

	/* virtualdom/items/Element/special/select/bubble.js */
	var bubble = function( runloop, syncSelect ) {

		return function bubbleSelect() {
			var this$0 = this;
			if ( !this.dirty ) {
				this.dirty = true;
				runloop.scheduleTask( function() {
					syncSelect( this$0 );
					this$0.dirty = false;
				} );
			}
			this.parentFragment.bubble();
		};
	}( runloop, sync );

	/* virtualdom/items/Element/special/option/findParentSelect.js */
	var findParentSelect = function findParentSelect( element ) {
		do {
			if ( element.name === 'select' ) {
				return element;
			}
		} while ( element = element.parent );
	};

	/* virtualdom/items/Element/special/option/init.js */
	var init = function( findParentSelect ) {

		return function initOption( option, template ) {
			option.select = findParentSelect( option.parent );
			option.select.options.push( option );
			// If the value attribute is missing, use the element's content
			if ( !template.a ) {
				template.a = {};
			}
			// ...as long as it isn't disabled
			if ( !template.a.value && !template.a.hasOwnProperty( 'disabled' ) ) {
				template.a.value = template.f;
			}
			// If there is a `selected` attribute, but the <select>
			// already has a value, delete it
			if ( 'selected' in template.a && option.select.getAttribute( 'value' ) !== undefined ) {
				delete template.a.selected;
			}
		};
	}( findParentSelect );

	/* virtualdom/items/Element/prototype/init.js */
	var virtualdom_items_Element$init = function( types, enforceCase, createAttributes, createTwowayBinding, createEventHandlers, Decorator, bubbleSelect, initOption, circular ) {

		var Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Element$init( options ) {
			var parentFragment, template, ractive, binding, bindings;
			this.type = types.ELEMENT;
			// stuff we'll need later
			parentFragment = this.parentFragment = options.parentFragment;
			template = this.template = options.template;
			this.parent = options.pElement || parentFragment.pElement;
			this.root = ractive = parentFragment.root;
			this.index = options.index;
			this.name = enforceCase( template.e );
			// Special case - <option> elements
			if ( this.name === 'option' ) {
				initOption( this, template );
			}
			// Special case - <select> elements
			if ( this.name === 'select' ) {
				this.options = [];
				this.bubble = bubbleSelect;
			}
			// create attributes
			this.attributes = createAttributes( this, template.a );
			// append children, if there are any
			if ( template.f ) {
				this.fragment = new Fragment( {
					template: template.f,
					root: ractive,
					owner: this,
					pElement: this
				} );
			}
			// create twoway binding
			if ( ractive.twoway && ( binding = createTwowayBinding( this, template.a ) ) ) {
				this.binding = binding;
				// register this with the root, so that we can do ractive.updateModel()
				bindings = this.root._twowayBindings[ binding.keypath ] || ( this.root._twowayBindings[ binding.keypath ] = [] );
				bindings.push( binding );
			}
			// create event proxies
			if ( template.v ) {
				this.eventHandlers = createEventHandlers( this, template.v );
			}
			// create decorator
			if ( template.o ) {
				this.decorator = new Decorator( this, template.o );
			}
			// create transitions
			this.intro = template.t0 || template.t1;
			this.outro = template.t0 || template.t2;
		};
	}( types, enforceCase, virtualdom_items_Element$init_createAttributes, virtualdom_items_Element$init_createTwowayBinding, virtualdom_items_Element$init_createEventHandlers, Decorator, bubble, init, circular );

	/* virtualdom/items/shared/utils/startsWith.js */
	var startsWith = function( startsWithKeypath ) {

		return function startsWith( target, keypath ) {
			return target === keypath || startsWithKeypath( target, keypath );
		};
	}( startsWithKeypath );

	/* virtualdom/items/shared/utils/assignNewKeypath.js */
	var assignNewKeypath = function( startsWith, getNewKeypath ) {

		return function assignNewKeypath( target, property, oldKeypath, newKeypath ) {
			var existingKeypath = target[ property ];
			if ( !existingKeypath || startsWith( existingKeypath, newKeypath ) || !startsWith( existingKeypath, oldKeypath ) ) {
				return;
			}
			target[ property ] = getNewKeypath( existingKeypath, oldKeypath, newKeypath );
		};
	}( startsWith, getNewKeypath );

	/* virtualdom/items/Element/prototype/rebind.js */
	var virtualdom_items_Element$rebind = function( assignNewKeypath ) {

		return function Element$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
			var i, storage, liveQueries, ractive;
			if ( this.attributes ) {
				this.attributes.forEach( rebind );
			}
			if ( this.eventHandlers ) {
				this.eventHandlers.forEach( rebind );
			}
			// rebind children
			if ( this.fragment ) {
				rebind( this.fragment );
			}
			// Update live queries, if necessary
			if ( liveQueries = this.liveQueries ) {
				ractive = this.root;
				i = liveQueries.length;
				while ( i-- ) {
					liveQueries[ i ]._makeDirty();
				}
			}
			if ( this.node && ( storage = this.node._ractive ) ) {
				// adjust keypath if needed
				assignNewKeypath( storage, 'keypath', oldKeypath, newKeypath );
				if ( indexRef != undefined ) {
					storage.index[ indexRef ] = newIndex;
				}
			}

			function rebind( thing ) {
				thing.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			}
		};
	}( assignNewKeypath );

	/* virtualdom/items/Element/special/img/render.js */
	var render = function renderImage( img ) {
		var width, height, loadHandler;
		// if this is an <img>, and we're in a crap browser, we may need to prevent it
		// from overriding width and height when it loads the src
		if ( ( width = img.getAttribute( 'width' ) ) || ( height = img.getAttribute( 'height' ) ) ) {
			img.node.addEventListener( 'load', loadHandler = function() {
				if ( width ) {
					img.node.width = width.value;
				}
				if ( height ) {
					img.node.height = height.value;
				}
				img.node.removeEventListener( 'load', loadHandler, false );
			}, false );
		}
	};

	/* virtualdom/items/Element/Transition/prototype/init.js */
	var virtualdom_items_Element_Transition$init = function( log, config, circular ) {

		var Fragment, getValueOptions = {};
		// TODO what are the options?
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		return function Transition$init( element, template, isIntro ) {
			var t = this,
				ractive, name, fragment;
			t.element = element;
			t.root = ractive = element.root;
			t.isIntro = isIntro;
			name = template.n || template;
			if ( typeof name !== 'string' ) {
				fragment = new Fragment( {
					template: name,
					root: ractive,
					owner: element
				} );
				name = fragment.toString();
				fragment.unbind();
			}
			t.name = name;
			if ( template.a ) {
				t.params = template.a;
			} else if ( template.d ) {
				// TODO is there a way to interpret dynamic arguments without all the
				// 'dependency thrashing'?
				fragment = new Fragment( {
					template: template.d,
					root: ractive,
					owner: element
				} );
				t.params = fragment.getValue( getValueOptions );
				fragment.unbind();
			}
			t._fn = config.registries.transitions.find( ractive, name );
			if ( !t._fn ) {
				log.error( {
					debug: ractive.debug,
					message: 'missingPlugin',
					args: {
						plugin: 'transition',
						name: name
					}
				} );
				return;
			}
		};
	}( log, config, circular );

	/* utils/camelCase.js */
	var camelCase = function( hyphenatedStr ) {
		return hyphenatedStr.replace( /-([a-zA-Z])/g, function( match, $1 ) {
			return $1.toUpperCase();
		} );
	};

	/* virtualdom/items/Element/Transition/helpers/prefix.js */
	var prefix = function( isClient, vendors, createElement, camelCase ) {

		var prefix, prefixCache, testStyle;
		if ( !isClient ) {
			prefix = null;
		} else {
			prefixCache = {};
			testStyle = createElement( 'div' ).style;
			prefix = function( prop ) {
				var i, vendor, capped;
				prop = camelCase( prop );
				if ( !prefixCache[ prop ] ) {
					if ( testStyle[ prop ] !== undefined ) {
						prefixCache[ prop ] = prop;
					} else {
						// test vendors...
						capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );
						i = vendors.length;
						while ( i-- ) {
							vendor = vendors[ i ];
							if ( testStyle[ vendor + capped ] !== undefined ) {
								prefixCache[ prop ] = vendor + capped;
								break;
							}
						}
					}
				}
				return prefixCache[ prop ];
			};
		}
		return prefix;
	}( isClient, vendors, createElement, camelCase );

	/* virtualdom/items/Element/Transition/prototype/getStyle.js */
	var virtualdom_items_Element_Transition$getStyle = function( legacy, isClient, isArray, prefix ) {

		var getStyle, getComputedStyle;
		if ( !isClient ) {
			getStyle = null;
		} else {
			getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
			getStyle = function( props ) {
				var computedStyle, styles, i, prop, value;
				computedStyle = getComputedStyle( this.node );
				if ( typeof props === 'string' ) {
					value = computedStyle[ prefix( props ) ];
					if ( value === '0px' ) {
						value = 0;
					}
					return value;
				}
				if ( !isArray( props ) ) {
					throw new Error( 'Transition$getStyle must be passed a string, or an array of strings representing CSS properties' );
				}
				styles = {};
				i = props.length;
				while ( i-- ) {
					prop = props[ i ];
					value = computedStyle[ prefix( prop ) ];
					if ( value === '0px' ) {
						value = 0;
					}
					styles[ prop ] = value;
				}
				return styles;
			};
		}
		return getStyle;
	}( legacy, isClient, isArray, prefix );

	/* virtualdom/items/Element/Transition/prototype/setStyle.js */
	var virtualdom_items_Element_Transition$setStyle = function( prefix ) {

		return function( style, value ) {
			var prop;
			if ( typeof style === 'string' ) {
				this.node.style[ prefix( style ) ] = value;
			} else {
				for ( prop in style ) {
					if ( style.hasOwnProperty( prop ) ) {
						this.node.style[ prefix( prop ) ] = style[ prop ];
					}
				}
			}
			return this;
		};
	}( prefix );

	/* shared/Ticker.js */
	var Ticker = function( warn, getTime, animations ) {

		// TODO what happens if a transition is aborted?
		// TODO use this with Animation to dedupe some code?
		var Ticker = function( options ) {
			var easing;
			this.duration = options.duration;
			this.step = options.step;
			this.complete = options.complete;
			// easing
			if ( typeof options.easing === 'string' ) {
				easing = options.root.easing[ options.easing ];
				if ( !easing ) {
					warn( 'Missing easing function ("' + options.easing + '"). You may need to download a plugin from [TODO]' );
					easing = linear;
				}
			} else if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			} else {
				easing = linear;
			}
			this.easing = easing;
			this.start = getTime();
			this.end = this.start + this.duration;
			this.running = true;
			animations.add( this );
		};
		Ticker.prototype = {
			tick: function( now ) {
				var elapsed, eased;
				if ( !this.running ) {
					return false;
				}
				if ( now > this.end ) {
					if ( this.step ) {
						this.step( 1 );
					}
					if ( this.complete ) {
						this.complete( 1 );
					}
					return false;
				}
				elapsed = now - this.start;
				eased = this.easing( elapsed / this.duration );
				if ( this.step ) {
					this.step( eased );
				}
				return true;
			},
			stop: function() {
				if ( this.abort ) {
					this.abort();
				}
				this.running = false;
			}
		};
		return Ticker;

		function linear( t ) {
			return t;
		}
	}( warn, getTime, animations );

	/* virtualdom/items/Element/Transition/helpers/unprefix.js */
	var unprefix = function( vendors ) {

		var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );
		return function( prop ) {
			return prop.replace( unprefixPattern, '' );
		};
	}( vendors );

	/* virtualdom/items/Element/Transition/helpers/hyphenate.js */
	var hyphenate = function( vendors ) {

		var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );
		return function( str ) {
			var hyphenated;
			if ( !str ) {
				return '';
			}
			if ( vendorPattern.test( str ) ) {
				str = '-' + str;
			}
			hyphenated = str.replace( /[A-Z]/g, function( match ) {
				return '-' + match.toLowerCase();
			} );
			return hyphenated;
		};
	}( vendors );

	/* virtualdom/items/Element/Transition/prototype/animateStyle/createTransitions.js */
	var virtualdom_items_Element_Transition$animateStyle_createTransitions = function( isClient, warn, createElement, camelCase, interpolate, Ticker, prefix, unprefix, hyphenate ) {

		var createTransitions, testStyle, TRANSITION, TRANSITIONEND, CSS_TRANSITIONS_ENABLED, TRANSITION_DURATION, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION, canUseCssTransitions = {},
			cannotUseCssTransitions = {};
		if ( !isClient ) {
			createTransitions = null;
		} else {
			testStyle = createElement( 'div' ).style;
			// determine some facts about our environment
			( function() {
				if ( testStyle.transition !== undefined ) {
					TRANSITION = 'transition';
					TRANSITIONEND = 'transitionend';
					CSS_TRANSITIONS_ENABLED = true;
				} else if ( testStyle.webkitTransition !== undefined ) {
					TRANSITION = 'webkitTransition';
					TRANSITIONEND = 'webkitTransitionEnd';
					CSS_TRANSITIONS_ENABLED = true;
				} else {
					CSS_TRANSITIONS_ENABLED = false;
				}
			}() );
			if ( TRANSITION ) {
				TRANSITION_DURATION = TRANSITION + 'Duration';
				TRANSITION_PROPERTY = TRANSITION + 'Property';
				TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
			}
			createTransitions = function( t, to, options, changedProperties, resolve ) {
				// Wait a beat (otherwise the target styles will be applied immediately)
				// TODO use a fastdom-style mechanism?
				setTimeout( function() {
					var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete, transitionEndHandler;
					checkComplete = function() {
						if ( jsTransitionsComplete && cssTransitionsComplete ) {
							t.root.fire( t.name + ':end', t.node, t.isIntro );
							resolve();
						}
					};
					// this is used to keep track of which elements can use CSS to animate
					// which properties
					hashPrefix = ( t.node.namespaceURI || '' ) + t.node.tagName;
					t.node.style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix ).map( hyphenate ).join( ',' );
					t.node.style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
					t.node.style[ TRANSITION_DURATION ] = options.duration / 1000 + 's';
					transitionEndHandler = function( event ) {
						var index;
						index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );
						if ( index !== -1 ) {
							changedProperties.splice( index, 1 );
						}
						if ( changedProperties.length ) {
							// still transitioning...
							return;
						}
						t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
						cssTransitionsComplete = true;
						checkComplete();
					};
					t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );
					setTimeout( function() {
						var i = changedProperties.length,
							hash, originalValue, index, propertiesToTransitionInJs = [],
							prop, suffix;
						while ( i-- ) {
							prop = changedProperties[ i ];
							hash = hashPrefix + prop;
							if ( CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[ hash ] ) {
								t.node.style[ prefix( prop ) ] = to[ prop ];
								// If we're not sure if CSS transitions are supported for
								// this tag/property combo, find out now
								if ( !canUseCssTransitions[ hash ] ) {
									originalValue = t.getStyle( prop );
									// if this property is transitionable in this browser,
									// the current style will be different from the target style
									canUseCssTransitions[ hash ] = t.getStyle( prop ) != to[ prop ];
									cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];
									// Reset, if we're going to use timers after all
									if ( cannotUseCssTransitions[ hash ] ) {
										t.node.style[ prefix( prop ) ] = originalValue;
									}
								}
							}
							if ( !CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[ hash ] ) {
								// we need to fall back to timer-based stuff
								if ( originalValue === undefined ) {
									originalValue = t.getStyle( prop );
								}
								// need to remove this from changedProperties, otherwise transitionEndHandler
								// will get confused
								index = changedProperties.indexOf( prop );
								if ( index === -1 ) {
									warn( 'Something very strange happened with transitions. If you see this message, please let @RactiveJS know. Thanks!' );
								} else {
									changedProperties.splice( index, 1 );
								}
								// TODO Determine whether this property is animatable at all
								suffix = /[^\d]*$/.exec( to[ prop ] )[ 0 ];
								// ...then kick off a timer-based transition
								propertiesToTransitionInJs.push( {
									name: prefix( prop ),
									interpolator: interpolate( parseFloat( originalValue ), parseFloat( to[ prop ] ) ),
									suffix: suffix
								} );
							}
						}
						// javascript transitions
						if ( propertiesToTransitionInJs.length ) {
							new Ticker( {
								root: t.root,
								duration: options.duration,
								easing: camelCase( options.easing || '' ),
								step: function( pos ) {
									var prop, i;
									i = propertiesToTransitionInJs.length;
									while ( i-- ) {
										prop = propertiesToTransitionInJs[ i ];
										t.node.style[ prop.name ] = prop.interpolator( pos ) + prop.suffix;
									}
								},
								complete: function() {
									jsTransitionsComplete = true;
									checkComplete();
								}
							} );
						} else {
							jsTransitionsComplete = true;
						}
						if ( !changedProperties.length ) {
							// We need to cancel the transitionEndHandler, and deal with
							// the fact that it will never fire
							t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
							cssTransitionsComplete = true;
							checkComplete();
						}
					}, 0 );
				}, options.delay || 0 );
			};
		}
		return createTransitions;
	}( isClient, warn, createElement, camelCase, interpolate, Ticker, prefix, unprefix, hyphenate );

	/* virtualdom/items/Element/Transition/prototype/animateStyle/visibility.js */
	var virtualdom_items_Element_Transition$animateStyle_visibility = function( vendors ) {

		var hidden, vendor, prefix, i, visibility;
		if ( typeof document !== 'undefined' ) {
			hidden = 'hidden';
			visibility = {};
			if ( hidden in document ) {
				prefix = '';
			} else {
				i = vendors.length;
				while ( i-- ) {
					vendor = vendors[ i ];
					hidden = vendor + 'Hidden';
					if ( hidden in document ) {
						prefix = vendor;
					}
				}
			}
			if ( prefix !== undefined ) {
				document.addEventListener( prefix + 'visibilitychange', onChange );
				// initialise
				onChange();
			} else {
				// gah, we're in an old browser
				if ( 'onfocusout' in document ) {
					document.addEventListener( 'focusout', onHide );
					document.addEventListener( 'focusin', onShow );
				} else {
					window.addEventListener( 'pagehide', onHide );
					window.addEventListener( 'blur', onHide );
					window.addEventListener( 'pageshow', onShow );
					window.addEventListener( 'focus', onShow );
				}
				visibility.hidden = false;
			}
		}

		function onChange() {
			visibility.hidden = document[ hidden ];
		}

		function onHide() {
			visibility.hidden = true;
		}

		function onShow() {
			visibility.hidden = false;
		}
		return visibility;
	}( vendors );

	/* virtualdom/items/Element/Transition/prototype/animateStyle/_animateStyle.js */
	var virtualdom_items_Element_Transition$animateStyle__animateStyle = function( legacy, isClient, warn, Promise, prefix, createTransitions, visibility ) {

		var animateStyle, getComputedStyle, resolved;
		if ( !isClient ) {
			animateStyle = null;
		} else {
			getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
			animateStyle = function( style, value, options, complete ) {
				var t = this,
					to;
				// Special case - page isn't visible. Don't animate anything, because
				// that way you'll never get CSS transitionend events
				if ( visibility.hidden ) {
					this.setStyle( style, value );
					return resolved || ( resolved = Promise.resolve() );
				}
				if ( typeof style === 'string' ) {
					to = {};
					to[ style ] = value;
				} else {
					to = style;
					// shuffle arguments
					complete = options;
					options = value;
				}
				// As of 0.3.9, transition authors should supply an `option` object with
				// `duration` and `easing` properties (and optional `delay`), plus a
				// callback function that gets called after the animation completes
				// TODO remove this check in a future version
				if ( !options ) {
					warn( 'The "' + t.name + '" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340' );
					options = t;
					complete = t.complete;
				}
				var promise = new Promise( function( resolve ) {
					var propertyNames, changedProperties, computedStyle, current, from, i, prop;
					// Edge case - if duration is zero, set style synchronously and complete
					if ( !options.duration ) {
						t.setStyle( to );
						resolve();
						return;
					}
					// Get a list of the properties we're animating
					propertyNames = Object.keys( to );
					changedProperties = [];
					// Store the current styles
					computedStyle = getComputedStyle( t.node );
					from = {};
					i = propertyNames.length;
					while ( i-- ) {
						prop = propertyNames[ i ];
						current = computedStyle[ prefix( prop ) ];
						if ( current === '0px' ) {
							current = 0;
						}
						// we need to know if we're actually changing anything
						if ( current != to[ prop ] ) {
							// use != instead of !==, so we can compare strings with numbers
							changedProperties.push( prop );
							// make the computed style explicit, so we can animate where
							// e.g. height='auto'
							t.node.style[ prefix( prop ) ] = current;
						}
					}
					// If we're not actually changing anything, the transitionend event
					// will never fire! So we complete early
					if ( !changedProperties.length ) {
						resolve();
						return;
					}
					createTransitions( t, to, options, changedProperties, resolve );
				} );
				// If a callback was supplied, do the honours
				// TODO remove this check in future
				if ( complete ) {
					warn( 't.animateStyle returns a Promise as of 0.4.0. Transition authors should do t.animateStyle(...).then(callback)' );
					promise.then( complete );
				}
				return promise;
			};
		}
		return animateStyle;
	}( legacy, isClient, warn, Promise, prefix, virtualdom_items_Element_Transition$animateStyle_createTransitions, virtualdom_items_Element_Transition$animateStyle_visibility );

	/* utils/fillGaps.js */
	var fillGaps = function( target, source ) {
		var key;
		for ( key in source ) {
			if ( source.hasOwnProperty( key ) && !( key in target ) ) {
				target[ key ] = source[ key ];
			}
		}
		return target;
	};

	/* virtualdom/items/Element/Transition/prototype/processParams.js */
	var virtualdom_items_Element_Transition$processParams = function( fillGaps ) {

		return function( params, defaults ) {
			if ( typeof params === 'number' ) {
				params = {
					duration: params
				};
			} else if ( typeof params === 'string' ) {
				if ( params === 'slow' ) {
					params = {
						duration: 600
					};
				} else if ( params === 'fast' ) {
					params = {
						duration: 200
					};
				} else {
					params = {
						duration: 400
					};
				}
			} else if ( !params ) {
				params = {};
			}
			return fillGaps( params, defaults );
		};
	}( fillGaps );

	/* virtualdom/items/Element/Transition/prototype/start.js */
	var virtualdom_items_Element_Transition$start = function() {

		return function Transition$start() {
			var t = this,
				node, originalStyle;
			node = t.node = t.element.node;
			originalStyle = node.getAttribute( 'style' );
			// create t.complete() - we don't want this on the prototype,
			// because we don't want `this` silliness when passing it as
			// an argument
			t.complete = function( noReset ) {
				if ( !noReset && t.isIntro ) {
					resetStyle( node, originalStyle );
				}
				node._ractive.transition = null;
				t._manager.remove( t );
			};
			// If the transition function doesn't exist, abort
			if ( !t._fn ) {
				t.complete();
				return;
			}
			t._fn.apply( t.root, [ t ].concat( t.params ) );
		};

		function resetStyle( node, style ) {
			if ( style ) {
				node.setAttribute( 'style', style );
			} else {
				// Next line is necessary, to remove empty style attribute!
				// See http://stackoverflow.com/a/7167553
				node.getAttribute( 'style' );
				node.removeAttribute( 'style' );
			}
		}
	}();

	/* virtualdom/items/Element/Transition/_Transition.js */
	var Transition = function( init, getStyle, setStyle, animateStyle, processParams, start, circular ) {

		var Fragment, Transition;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		Transition = function( owner, template, isIntro ) {
			this.init( owner, template, isIntro );
		};
		Transition.prototype = {
			init: init,
			start: start,
			getStyle: getStyle,
			setStyle: setStyle,
			animateStyle: animateStyle,
			processParams: processParams
		};
		return Transition;
	}( virtualdom_items_Element_Transition$init, virtualdom_items_Element_Transition$getStyle, virtualdom_items_Element_Transition$setStyle, virtualdom_items_Element_Transition$animateStyle__animateStyle, virtualdom_items_Element_Transition$processParams, virtualdom_items_Element_Transition$start, circular );

	/* virtualdom/items/Element/prototype/render.js */
	var virtualdom_items_Element$render = function( namespaces, isArray, warn, create, createElement, defineProperty, noop, runloop, getInnerContext, renderImage, Transition ) {

		var updateCss, updateScript;
		updateCss = function() {
			var node = this.node,
				content = this.fragment.toString( false );
			if ( node.styleSheet ) {
				node.styleSheet.cssText = content;
			} else {
				while ( node.hasChildNodes() ) {
					node.removeChild( node.firstChild );
				}
				node.appendChild( document.createTextNode( content ) );
			}
		};
		updateScript = function() {
			if ( !this.node.type || this.node.type === 'text/javascript' ) {
				warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
			}
			this.node.text = this.fragment.toString( false );
		};
		return function Element$render() {
			var this$0 = this;
			var root = this.root,
				namespace, node;
			namespace = getNamespace( this );
			node = this.node = createElement( this.name, namespace );
			// Is this a top-level node of a component? If so, we may need to add
			// a data-rvcguid attribute, for CSS encapsulation
			// NOTE: css no longer copied to instance, so we check constructor.css -
			// we can enhance to handle instance, but this is more "correct" with current
			// functionality
			if ( root.constructor.css && this.parentFragment.getNode() === root.el ) {
				this.node.setAttribute( 'data-rvcguid', root.constructor._guid );
			}
			// Add _ractive property to the node - we use this object to store stuff
			// related to proxy events, two-way bindings etc
			defineProperty( this.node, '_ractive', {
				value: {
					proxy: this,
					keypath: getInnerContext( this.parentFragment ),
					index: this.parentFragment.indexRefs,
					events: create( null ),
					root: root
				}
			} );
			// Render attributes
			this.attributes.forEach( function( a ) {
				return a.render( node );
			} );
			// Render children
			if ( this.fragment ) {
				// Special case - <script> element
				if ( this.name === 'script' ) {
					this.bubble = updateScript;
					this.node.text = this.fragment.toString( false );
					// bypass warning initially
					this.fragment.unrender = noop;
				} else if ( this.name === 'style' ) {
					this.bubble = updateCss;
					this.bubble();
					this.fragment.unrender = noop;
				} else if ( this.binding && this.getAttribute( 'contenteditable' ) ) {
					this.fragment.unrender = noop;
				} else {
					this.node.appendChild( this.fragment.render() );
				}
			}
			// Add proxy event handlers
			if ( this.eventHandlers ) {
				this.eventHandlers.forEach( function( h ) {
					return h.render();
				} );
			}
			// deal with two-way bindings
			if ( this.binding ) {
				this.binding.render();
				this.node._ractive.binding = this.binding;
			}
			// Special case: if this is an <img>, and we're in a crap browser, we may
			// need to prevent it from overriding width and height when it loads the src
			if ( this.name === 'img' ) {
				renderImage( this );
			}
			// apply decorator(s)
			if ( this.decorator && this.decorator.fn ) {
				runloop.scheduleTask( function() {
					this$0.decorator.init();
				} );
			}
			// trigger intro transition
			if ( root.transitionsEnabled && this.intro ) {
				var transition = new Transition( this, this.intro, true );
				runloop.registerTransition( transition );
				runloop.scheduleTask( function() {
					return transition.start();
				} );
			}
			if ( this.name === 'option' ) {
				processOption( this );
			}
			if ( this.node.autofocus ) {
				// Special case. Some browsers (*cough* Firefix *cough*) have a problem
				// with dynamically-generated elements having autofocus, and they won't
				// allow you to programmatically focus the element until it's in the DOM
				runloop.scheduleTask( function() {
					return this$0.node.focus();
				} );
			}
			updateLiveQueries( this );
			return this.node;
		};

		function getNamespace( element ) {
			var namespace, xmlns, parent;
			// Use specified namespace...
			if ( xmlns = element.getAttribute( 'xmlns' ) ) {
				namespace = xmlns;
			} else if ( element.name === 'svg' ) {
				namespace = namespaces.svg;
			} else if ( parent = element.parent ) {
				// ...or HTML, if the parent is a <foreignObject>
				if ( parent.name === 'foreignObject' ) {
					namespace = namespaces.html;
				} else {
					namespace = parent.node.namespaceURI;
				}
			} else {
				namespace = element.root.el.namespaceURI;
			}
			return namespace;
		}

		function processOption( option ) {
			var optionValue, selectValue, i;
			selectValue = option.select.getAttribute( 'value' );
			if ( selectValue === undefined ) {
				return;
			}
			optionValue = option.getAttribute( 'value' );
			if ( option.select.node.multiple && isArray( selectValue ) ) {
				i = selectValue.length;
				while ( i-- ) {
					if ( optionValue == selectValue[ i ] ) {
						option.node.selected = true;
						break;
					}
				}
			} else {
				option.node.selected = optionValue == selectValue;
			}
		}

		function updateLiveQueries( element ) {
			var instance, liveQueries, i, selector, query;
			// Does this need to be added to any live queries?
			instance = element.root;
			do {
				liveQueries = instance._liveQueries;
				i = liveQueries.length;
				while ( i-- ) {
					selector = liveQueries[ i ];
					query = liveQueries[ '_' + selector ];
					if ( query._test( element ) ) {
						// keep register of applicable selectors, for when we teardown
						( element.liveQueries || ( element.liveQueries = [] ) ).push( query );
					}
				}
			} while ( instance = instance._parent );
		}
	}( namespaces, isArray, warn, create, createElement, defineProperty, noop, runloop, getInnerContext, render, Transition );

	/* virtualdom/items/Element/prototype/toString.js */
	var virtualdom_items_Element$toString = function( voidElementNames, isArray ) {

		return function() {
			var str, escape;
			str = '<' + ( this.template.y ? '!DOCTYPE' : this.template.e );
			str += this.attributes.map( stringifyAttribute ).join( '' );
			// Special case - selected options
			if ( this.name === 'option' && optionIsSelected( this ) ) {
				str += ' selected';
			}
			// Special case - two-way radio name bindings
			if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
				str += ' checked';
			}
			str += '>';
			if ( this.fragment ) {
				escape = this.name !== 'script' && this.name !== 'style';
				str += this.fragment.toString( escape );
			}
			// add a closing tag if this isn't a void element
			if ( !voidElementNames.test( this.template.e ) ) {
				str += '</' + this.template.e + '>';
			}
			return str;
		};

		function optionIsSelected( element ) {
			var optionValue, selectValue, i;
			optionValue = element.getAttribute( 'value' );
			if ( optionValue === undefined ) {
				return false;
			}
			selectValue = element.select.getAttribute( 'value' );
			if ( selectValue == optionValue ) {
				return true;
			}
			if ( element.select.getAttribute( 'multiple' ) && isArray( selectValue ) ) {
				i = selectValue.length;
				while ( i-- ) {
					if ( selectValue[ i ] == optionValue ) {
						return true;
					}
				}
			}
		}

		function inputIsCheckedRadio( element ) {
			var attributes, typeAttribute, valueAttribute, nameAttribute;
			attributes = element.attributes;
			typeAttribute = attributes.type;
			valueAttribute = attributes.value;
			nameAttribute = attributes.name;
			if ( !typeAttribute || typeAttribute.value !== 'radio' || !valueAttribute || !nameAttribute.interpolator ) {
				return;
			}
			if ( valueAttribute.value === nameAttribute.interpolator.value ) {
				return true;
			}
		}

		function stringifyAttribute( attribute ) {
			var str = attribute.toString();
			return str ? ' ' + str : '';
		}
	}( voidElementNames, isArray );

	/* virtualdom/items/Element/special/option/unbind.js */
	var virtualdom_items_Element_special_option_unbind = function( removeFromArray ) {

		return function unbindOption( option ) {
			removeFromArray( option.select.options, option );
		};
	}( removeFromArray );

	/* virtualdom/items/Element/prototype/unbind.js */
	var virtualdom_items_Element$unbind = function( unbindOption ) {

		return function Element$unbind() {
			if ( this.fragment ) {
				this.fragment.unbind();
			}
			if ( this.binding ) {
				this.binding.unbind();
			}
			// Special case - <option>
			if ( this.name === 'option' ) {
				unbindOption( this );
			}
			this.attributes.forEach( unbindAttribute );
		};

		function unbindAttribute( attribute ) {
			attribute.unbind();
		}
	}( virtualdom_items_Element_special_option_unbind );

	/* virtualdom/items/Element/prototype/unrender.js */
	var virtualdom_items_Element$unrender = function( runloop, Transition ) {

		return function Element$unrender( shouldDestroy ) {
			var binding, bindings;
			// Detach as soon as we can
			if ( this.name === 'option' ) {
				// <option> elements detach immediately, so that
				// their parent <select> element syncs correctly, and
				// since option elements can't have transitions anyway
				this.detach();
			} else if ( shouldDestroy ) {
				runloop.detachWhenReady( this );
			}
			// Children first. that way, any transitions on child elements will be
			// handled by the current transitionManager
			if ( this.fragment ) {
				this.fragment.unrender( false );
			}
			if ( binding = this.binding ) {
				this.binding.unrender();
				this.node._ractive.binding = null;
				bindings = this.root._twowayBindings[ binding.keypath ];
				bindings.splice( bindings.indexOf( binding ), 1 );
			}
			// Remove event handlers
			if ( this.eventHandlers ) {
				this.eventHandlers.forEach( function( h ) {
					return h.unrender();
				} );
			}
			if ( this.decorator ) {
				this.decorator.teardown();
			}
			// trigger outro transition if necessary
			if ( this.root.transitionsEnabled && this.outro ) {
				var transition = new Transition( this, this.outro, false );
				runloop.registerTransition( transition );
				runloop.scheduleTask( function() {
					return transition.start();
				} );
			}
			// Remove this node from any live queries
			if ( this.liveQueries ) {
				removeFromLiveQueries( this );
			}
		};

		function removeFromLiveQueries( element ) {
			var query, selector, i;
			i = element.liveQueries.length;
			while ( i-- ) {
				query = element.liveQueries[ i ];
				selector = query.selector;
				query._remove( element.node );
			}
		}
	}( runloop, Transition );

	/* virtualdom/items/Element/_Element.js */
	var Element = function( bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, getAttribute, init, rebind, render, toString, unbind, unrender ) {

		var Element = function( options ) {
			this.init( options );
		};
		Element.prototype = {
			bubble: bubble,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			findNextNode: findNextNode,
			firstNode: firstNode,
			getAttribute: getAttribute,
			init: init,
			rebind: rebind,
			render: render,
			toString: toString,
			unbind: unbind,
			unrender: unrender
		};
		return Element;
	}( virtualdom_items_Element$bubble, virtualdom_items_Element$detach, virtualdom_items_Element$find, virtualdom_items_Element$findAll, virtualdom_items_Element$findAllComponents, virtualdom_items_Element$findComponent, virtualdom_items_Element$findNextNode, virtualdom_items_Element$firstNode, virtualdom_items_Element$getAttribute, virtualdom_items_Element$init, virtualdom_items_Element$rebind, virtualdom_items_Element$render, virtualdom_items_Element$toString, virtualdom_items_Element$unbind, virtualdom_items_Element$unrender );

	/* virtualdom/items/Partial/deIndent.js */
	var deIndent = function() {

		var empty = /^\s*$/,
			leadingWhitespace = /^\s*/;
		return function( str ) {
			var lines, firstLine, lastLine, minIndent;
			lines = str.split( '\n' );
			// remove first and last line, if they only contain whitespace
			firstLine = lines[ 0 ];
			if ( firstLine !== undefined && empty.test( firstLine ) ) {
				lines.shift();
			}
			lastLine = lines[ lines.length - 1 ];
			if ( lastLine !== undefined && empty.test( lastLine ) ) {
				lines.pop();
			}
			minIndent = lines.reduce( reducer, null );
			if ( minIndent ) {
				str = lines.map( function( line ) {
					return line.replace( minIndent, '' );
				} ).join( '\n' );
			}
			return str;
		};

		function reducer( previous, line ) {
			var lineIndent = leadingWhitespace.exec( line )[ 0 ];
			if ( previous === null || lineIndent.length < previous.length ) {
				return lineIndent;
			}
			return previous;
		}
	}();

	/* virtualdom/items/Partial/getPartialDescriptor.js */
	var getPartialDescriptor = function( log, config, parser, deIndent ) {

		return function getPartialDescriptor( ractive, name ) {
			var partial;
			// If the partial in instance or view heirarchy instances, great
			if ( partial = getPartialFromRegistry( ractive, name ) ) {
				return partial;
			}
			// Does it exist on the page as a script tag?
			partial = parser.fromId( name, {
				noThrow: true
			} );
			if ( partial ) {
				// is this necessary?
				partial = deIndent( partial );
				// parse and register to this ractive instance
				var parsed = parser.parse( partial, parser.getParseOptions( ractive ) );
				// register (and return main partial if there are others in the template)
				return ractive.partials[ name ] = parsed.t;
			}
			log.error( {
				debug: ractive.debug,
				message: 'noTemplateForPartial',
				args: {
					name: name
				}
			} );
			// No match? Return an empty array
			return [];
		};

		function getPartialFromRegistry( ractive, name ) {
			var partials = config.registries.partials;
			// find first instance in the ractive or view hierarchy that has this partial
			var instance = partials.findInstance( ractive, name );
			if ( !instance ) {
				return;
			}
			var partial = instance.partials[ name ],
				fn;
			// partial is a function?
			if ( typeof partial === 'function' ) {
				fn = partial.bind( instance );
				fn.isOwner = instance.partials.hasOwnProperty( name );
				partial = fn( instance.data, parser );
			}
			if ( !partial ) {
				log.warn( {
					debug: ractive.debug,
					message: 'noRegistryFunctionReturn',
					args: {
						registry: 'partial',
						name: name
					}
				} );
				return;
			}
			// If this was added manually to the registry,
			// but hasn't been parsed, parse it now
			if ( !parser.isParsed( partial ) ) {
				// use the parseOptions of the ractive instance on which it was found
				var parsed = parser.parse( partial, parser.getParseOptions( instance ) );
				// Partials cannot contain nested partials!
				// TODO add a test for this
				if ( parsed.p ) {
					log.warn( {
						debug: ractive.debug,
						message: 'noNestedPartials',
						args: {
							rname: name
						}
					} );
				}
				// if fn, use instance to store result, otherwise needs to go
				// in the correct point in prototype chain on instance or constructor
				var target = fn ? instance : partials.findOwner( instance, name );
				// may be a template with partials, which need to be registered and main template extracted
				target.partials[ name ] = partial = parsed.t;
			}
			// store for reset
			if ( fn ) {
				partial._fn = fn;
			}
			return partial.v ? partial.t : partial;
		}
	}( log, config, parser, deIndent );

	/* virtualdom/items/Partial/applyIndent.js */
	var applyIndent = function( string, indent ) {
		var indented;
		if ( !indent ) {
			return string;
		}
		indented = string.split( '\n' ).map( function( line, notFirstLine ) {
			return notFirstLine ? indent + line : line;
		} ).join( '\n' );
		return indented;
	};

	/* virtualdom/items/Partial/_Partial.js */
	var Partial = function( types, getPartialDescriptor, applyIndent, circular ) {

		var Partial, Fragment;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		Partial = function( options ) {
			var parentFragment = this.parentFragment = options.parentFragment,
				template;
			this.type = types.PARTIAL;
			this.name = options.template.r;
			this.index = options.index;
			this.root = parentFragment.root;
			if ( !options.template.r ) {
				// TODO support dynamic partial switching
				throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
			}
			template = getPartialDescriptor( parentFragment.root, options.template.r );
			this.fragment = new Fragment( {
				template: template,
				root: parentFragment.root,
				owner: this,
				pElement: parentFragment.pElement
			} );
		};
		Partial.prototype = {
			bubble: function() {
				this.parentFragment.bubble();
			},
			firstNode: function() {
				return this.fragment.firstNode();
			},
			findNextNode: function() {
				return this.parentFragment.findNextNode( this );
			},
			detach: function() {
				return this.fragment.detach();
			},
			render: function() {
				return this.fragment.render();
			},
			unrender: function( shouldDestroy ) {
				this.fragment.unrender( shouldDestroy );
			},
			rebind: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				return this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			},
			unbind: function() {
				this.fragment.unbind();
			},
			toString: function( toString ) {
				var string, previousItem, lastLine, match;
				string = this.fragment.toString( toString );
				previousItem = this.parentFragment.items[ this.index - 1 ];
				if ( !previousItem || previousItem.type !== types.TEXT ) {
					return string;
				}
				lastLine = previousItem.template.split( '\n' ).pop();
				if ( match = /^\s+$/.exec( lastLine ) ) {
					return applyIndent( string, match[ 0 ] );
				}
				return string;
			},
			find: function( selector ) {
				return this.fragment.find( selector );
			},
			findAll: function( selector, query ) {
				return this.fragment.findAll( selector, query );
			},
			findComponent: function( selector ) {
				return this.fragment.findComponent( selector );
			},
			findAllComponents: function( selector, query ) {
				return this.fragment.findAllComponents( selector, query );
			},
			getValue: function() {
				return this.fragment.getValue();
			}
		};
		return Partial;
	}( types, getPartialDescriptor, applyIndent, circular );

	/* virtualdom/items/Component/getComponent.js */
	var getComponent = function( config, log, circular ) {

		var Ractive;
		circular.push( function() {
			Ractive = circular.Ractive;
		} );
		// finds the component constructor in the registry or view hierarchy registries
		return function getComponent( ractive, name ) {
			var component, instance = config.registries.components.findInstance( ractive, name );
			if ( instance ) {
				component = instance.components[ name ];
				// best test we have for not Ractive.extend
				if ( !component._parent ) {
					// function option, execute and store for reset
					var fn = component.bind( instance );
					fn.isOwner = instance.components.hasOwnProperty( name );
					component = fn( instance.data );
					if ( !component ) {
						log.warn( {
							debug: ractive.debug,
							message: 'noRegistryFunctionReturn',
							args: {
								registry: 'component',
								name: name
							}
						} );
						return;
					}
					if ( typeof component === 'string' ) {
						//allow string lookup
						component = getComponent( ractive, component );
					}
					component._fn = fn;
					instance.components[ name ] = component;
				}
			}
			return component;
		};
	}( config, log, circular );

	/* virtualdom/items/Component/prototype/detach.js */
	var virtualdom_items_Component$detach = function Component$detach() {
		return this.instance.fragment.detach();
	};

	/* virtualdom/items/Component/prototype/find.js */
	var virtualdom_items_Component$find = function Component$find( selector ) {
		return this.instance.fragment.find( selector );
	};

	/* virtualdom/items/Component/prototype/findAll.js */
	var virtualdom_items_Component$findAll = function Component$findAll( selector, query ) {
		return this.instance.fragment.findAll( selector, query );
	};

	/* virtualdom/items/Component/prototype/findAllComponents.js */
	var virtualdom_items_Component$findAllComponents = function Component$findAllComponents( selector, query ) {
		query._test( this, true );
		if ( this.instance.fragment ) {
			this.instance.fragment.findAllComponents( selector, query );
		}
	};

	/* virtualdom/items/Component/prototype/findComponent.js */
	var virtualdom_items_Component$findComponent = function Component$findComponent( selector ) {
		if ( !selector || selector === this.name ) {
			return this.instance;
		}
		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( selector );
		}
		return null;
	};

	/* virtualdom/items/Component/prototype/findNextNode.js */
	var virtualdom_items_Component$findNextNode = function Component$findNextNode() {
		return this.parentFragment.findNextNode( this );
	};

	/* virtualdom/items/Component/prototype/firstNode.js */
	var virtualdom_items_Component$firstNode = function Component$firstNode() {
		if ( this.rendered ) {
			return this.instance.fragment.firstNode();
		}
		return null;
	};

	/* virtualdom/items/Component/initialise/createModel/ComponentParameter.js */
	var ComponentParameter = function( runloop, circular ) {

		var Fragment, ComponentParameter;
		circular.push( function() {
			Fragment = circular.Fragment;
		} );
		ComponentParameter = function( component, key, value ) {
			this.parentFragment = component.parentFragment;
			this.component = component;
			this.key = key;
			this.fragment = new Fragment( {
				template: value,
				root: component.root,
				owner: this
			} );
			this.value = this.fragment.getValue();
		};
		ComponentParameter.prototype = {
			bubble: function() {
				if ( !this.dirty ) {
					this.dirty = true;
					runloop.addView( this );
				}
			},
			update: function() {
				var value = this.fragment.getValue();
				this.component.instance.viewmodel.set( this.key, value );
				runloop.addViewmodel( this.component.instance.viewmodel );
				this.value = value;
				this.dirty = false;
			},
			rebind: function( indexRef, newIndex, oldKeypath, newKeypath ) {
				this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			},
			unbind: function() {
				this.fragment.unbind();
			}
		};
		return ComponentParameter;
	}( runloop, circular );

	/* virtualdom/items/Component/initialise/createModel/_createModel.js */
	var createModel = function( types, parseJSON, resolveRef, ComponentParameter ) {

		return function( component, defaultData, attributes, toBind ) {
			var data = {},
				key, value;
			// some parameters, e.g. foo="The value is {{bar}}", are 'complex' - in
			// other words, we need to construct a string fragment to watch
			// when they change. We store these so they can be torn down later
			component.complexParameters = [];
			for ( key in attributes ) {
				if ( attributes.hasOwnProperty( key ) ) {
					value = getValue( component, key, attributes[ key ], toBind );
					if ( value !== undefined || defaultData[ key ] === undefined ) {
						data[ key ] = value;
					}
				}
			}
			return data;
		};

		function getValue( component, key, template, toBind ) {
			var parameter, parsed, parentInstance, parentFragment, keypath, indexRef;
			parentInstance = component.root;
			parentFragment = component.parentFragment;
			// If this is a static value, great
			if ( typeof template === 'string' ) {
				parsed = parseJSON( template );
				if ( !parsed ) {
					return template;
				}
				return parsed.value;
			}
			// If null, we treat it as a boolean attribute (i.e. true)
			if ( template === null ) {
				return true;
			}
			// If a regular interpolator, we bind to it
			if ( template.length === 1 && template[ 0 ].t === types.INTERPOLATOR && template[ 0 ].r ) {
				// Is it an index reference?
				if ( parentFragment.indexRefs && parentFragment.indexRefs[ indexRef = template[ 0 ].r ] !== undefined ) {
					component.indexRefBindings[ indexRef ] = key;
					return parentFragment.indexRefs[ indexRef ];
				}
				// TODO what about references that resolve late? Should these be considered?
				keypath = resolveRef( parentInstance, template[ 0 ].r, parentFragment ) || template[ 0 ].r;
				// We need to set up bindings between parent and child, but
				// we can't do it yet because the child instance doesn't exist
				// yet - so we make a note instead
				toBind.push( {
					childKeypath: key,
					parentKeypath: keypath
				} );
				return parentInstance.viewmodel.get( keypath );
			}
			// We have a 'complex parameter' - we need to create a full-blown string
			// fragment in order to evaluate and observe its value
			parameter = new ComponentParameter( component, key, template );
			component.complexParameters.push( parameter );
			return parameter.value;
		}
	}( types, parseJSON, resolveRef, ComponentParameter );

	/* virtualdom/items/Component/initialise/createInstance.js */
	var createInstance = function( component, Component, data, contentDescriptor ) {
		var instance, parentFragment, partials, root;
		parentFragment = component.parentFragment;
		root = component.root;
		// Make contents available as a {{>content}} partial
		partials = {
			content: contentDescriptor || []
		};
		instance = new Component( {
			append: true,
			data: data,
			partials: partials,
			magic: root.magic || Component.defaults.magic,
			modifyArrays: root.modifyArrays,
			_parent: root,
			_component: component,
			// need to inherit runtime parent adaptors
			adapt: root.adapt
		} );
		return instance;
	};

	/* virtualdom/items/Component/initialise/createBindings.js */
	var createBindings = function( createComponentBinding ) {

		return function createInitialComponentBindings( component, toBind ) {
			toBind.forEach( function createInitialComponentBinding( pair ) {
				var childValue, parentValue;
				createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );
				childValue = component.instance.viewmodel.get( pair.childKeypath );
				parentValue = component.root.viewmodel.get( pair.parentKeypath );
				if ( childValue !== undefined && parentValue === undefined ) {
					component.root.viewmodel.set( pair.parentKeypath, childValue );
				}
			} );
		};
	}( createComponentBinding );

	/* virtualdom/items/Component/initialise/propagateEvents.js */
	var propagateEvents = function( log ) {

		// TODO how should event arguments be handled? e.g.
		// <widget on-foo='bar:1,2,3'/>
		// The event 'bar' will be fired on the parent instance
		// when 'foo' fires on the child, but the 1,2,3 arguments
		// will be lost
		return function( component, eventsDescriptor ) {
			var eventName;
			for ( eventName in eventsDescriptor ) {
				if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
					propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
				}
			}
		};

		function propagateEvent( childInstance, parentInstance, eventName, proxyEventName ) {
			if ( typeof proxyEventName !== 'string' ) {
				log.error( {
					debug: parentInstance.debug,
					message: 'noComponentEventArguments'
				} );
			}
			childInstance.on( eventName, function() {
				var args = Array.prototype.slice.call( arguments );
				args.unshift( proxyEventName );
				parentInstance.fire.apply( parentInstance, args );
			} );
		}
	}( log );

	/* virtualdom/items/Component/initialise/updateLiveQueries.js */
	var updateLiveQueries = function( component ) {
		var ancestor, query;
		// If there's a live query for this component type, add it
		ancestor = component.root;
		while ( ancestor ) {
			if ( query = ancestor._liveComponentQueries[ '_' + component.name ] ) {
				query.push( component.instance );
			}
			ancestor = ancestor._parent;
		}
	};

	/* virtualdom/items/Component/prototype/init.js */
	var virtualdom_items_Component$init = function( types, warn, createModel, createInstance, createBindings, propagateEvents, updateLiveQueries ) {

		return function Component$init( options, Component ) {
			var parentFragment, root, data, toBind;
			parentFragment = this.parentFragment = options.parentFragment;
			root = parentFragment.root;
			this.root = root;
			this.type = types.COMPONENT;
			this.name = options.template.e;
			this.index = options.index;
			this.indexRefBindings = {};
			this.bindings = [];
			if ( !Component ) {
				throw new Error( 'Component "' + this.name + '" not found' );
			}
			// First, we need to create a model for the component - e.g. if we
			// encounter <widget foo='bar'/> then we need to create a widget
			// with `data: { foo: 'bar' }`.
			//
			// This may involve setting up some bindings, but we can't do it
			// yet so we take some notes instead
			toBind = [];
			data = createModel( this, Component.defaults.data || {}, options.template.a, toBind );
			createInstance( this, Component, data, options.template.f );
			createBindings( this, toBind );
			propagateEvents( this, options.template.v );
			// intro, outro and decorator directives have no effect
			if ( options.template.t1 || options.template.t2 || options.template.o ) {
				warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
			}
			updateLiveQueries( this );
		};
	}( types, warn, createModel, createInstance, createBindings, propagateEvents, updateLiveQueries );

	/* virtualdom/items/Component/prototype/rebind.js */
	var virtualdom_items_Component$rebind = function( runloop, getNewKeypath ) {

		return function Component$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
			var childInstance = this.instance,
				parentInstance = childInstance._parent,
				indexRefAlias, query;
			this.bindings.forEach( function( binding ) {
				var updated;
				if ( binding.root !== parentInstance ) {
					return;
				}
				if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
					binding.rebind( updated );
				}
			} );
			this.complexParameters.forEach( function( parameter ) {
				parameter.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			} );
			if ( indexRefAlias = this.indexRefBindings[ indexRef ] ) {
				runloop.addViewmodel( childInstance.viewmodel );
				childInstance.viewmodel.set( indexRefAlias, newIndex );
			}
			if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
				query._makeDirty();
			}
		};
	}( runloop, getNewKeypath );

	/* virtualdom/items/Component/prototype/render.js */
	var virtualdom_items_Component$render = function Component$render() {
		var instance = this.instance;
		instance.render( this.parentFragment.getNode() );
		this.rendered = true;
		return instance.detach();
	};

	/* virtualdom/items/Component/prototype/toString.js */
	var virtualdom_items_Component$toString = function Component$toString() {
		return this.instance.fragment.toString();
	};

	/* virtualdom/items/Component/prototype/unbind.js */
	var virtualdom_items_Component$unbind = function() {

		return function Component$unbind() {
			this.complexParameters.forEach( unbind );
			this.bindings.forEach( unbind );
			removeFromLiveComponentQueries( this );
			this.instance.fragment.unbind();
		};

		function unbind( thing ) {
			thing.unbind();
		}

		function removeFromLiveComponentQueries( component ) {
			var instance, query;
			instance = component.root;
			do {
				if ( query = instance._liveComponentQueries[ '_' + component.name ] ) {
					query._remove( component );
				}
			} while ( instance = instance._parent );
		}
	}();

	/* virtualdom/items/Component/prototype/unrender.js */
	var virtualdom_items_Component$unrender = function Component$unrender( shouldDestroy ) {
		this.instance.fire( 'teardown' );
		this.shouldDestroy = shouldDestroy;
		this.instance.unrender();
	};

	/* virtualdom/items/Component/_Component.js */
	var Component = function( detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, init, rebind, render, toString, unbind, unrender ) {

		var Component = function( options, Constructor ) {
			this.init( options, Constructor );
		};
		Component.prototype = {
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			findNextNode: findNextNode,
			firstNode: firstNode,
			init: init,
			rebind: rebind,
			render: render,
			toString: toString,
			unbind: unbind,
			unrender: unrender
		};
		return Component;
	}( virtualdom_items_Component$detach, virtualdom_items_Component$find, virtualdom_items_Component$findAll, virtualdom_items_Component$findAllComponents, virtualdom_items_Component$findComponent, virtualdom_items_Component$findNextNode, virtualdom_items_Component$firstNode, virtualdom_items_Component$init, virtualdom_items_Component$rebind, virtualdom_items_Component$render, virtualdom_items_Component$toString, virtualdom_items_Component$unbind, virtualdom_items_Component$unrender );

	/* virtualdom/items/Comment.js */
	var Comment = function( types, detach ) {

		var Comment = function( options ) {
			this.type = types.COMMENT;
			this.value = options.template.c;
		};
		Comment.prototype = {
			detach: detach,
			firstNode: function() {
				return this.node;
			},
			render: function() {
				if ( !this.node ) {
					this.node = document.createComment( this.value );
				}
				return this.node;
			},
			toString: function() {
				return '<!--' + this.value + '-->';
			},
			unrender: function( shouldDestroy ) {
				if ( shouldDestroy ) {
					this.node.parentNode.removeChild( this.node );
				}
			}
		};
		return Comment;
	}( types, detach );

	/* virtualdom/Fragment/prototype/init/createItem.js */
	var virtualdom_Fragment$init_createItem = function( types, Text, Interpolator, Section, Triple, Element, Partial, getComponent, Component, Comment ) {

		return function createItem( options ) {
			if ( typeof options.template === 'string' ) {
				return new Text( options );
			}
			switch ( options.template.t ) {
				case types.INTERPOLATOR:
					return new Interpolator( options );
				case types.SECTION:
					return new Section( options );
				case types.TRIPLE:
					return new Triple( options );
				case types.ELEMENT:
					var constructor;
					if ( constructor = getComponent( options.parentFragment.root, options.template.e ) ) {
						return new Component( options, constructor );
					}
					return new Element( options );
				case types.PARTIAL:
					return new Partial( options );
				case types.COMMENT:
					return new Comment( options );
				default:
					throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
			}
		};
	}( types, Text, Interpolator, Section, Triple, Element, Partial, getComponent, Component, Comment );

	/* virtualdom/Fragment/prototype/init.js */
	var virtualdom_Fragment$init = function( types, create, createItem ) {

		return function Fragment$init( options ) {
			var this$0 = this;
			var parentFragment, parentRefs, ref;
			// The item that owns this fragment - an element, section, partial, or attribute
			this.owner = options.owner;
			parentFragment = this.parent = this.owner.parentFragment;
			// inherited properties
			this.root = options.root;
			this.pElement = options.pElement;
			this.context = options.context;
			// If parent item is a section, this may not be the only fragment
			// that belongs to it - we need to make a note of the index
			if ( this.owner.type === types.SECTION ) {
				this.index = options.index;
			}
			// index references (the 'i' in {{#section:i}}...{{/section}}) need to cascade
			// down the tree
			if ( parentFragment ) {
				parentRefs = parentFragment.indexRefs;
				if ( parentRefs ) {
					this.indexRefs = create( null );
					// avoids need for hasOwnProperty
					for ( ref in parentRefs ) {
						this.indexRefs[ ref ] = parentRefs[ ref ];
					}
				}
			}
			// inherit priority
			this.priority = parentFragment ? parentFragment.priority + 1 : 1;
			if ( options.indexRef ) {
				if ( !this.indexRefs ) {
					this.indexRefs = {};
				}
				this.indexRefs[ options.indexRef ] = options.index;
			}
			// Time to create this fragment's child items
			// TEMP should this be happening?
			if ( typeof options.template === 'string' ) {
				options.template = [ options.template ];
			} else if ( !options.template ) {
				options.template = [];
			}
			this.items = options.template.map( function( template, i ) {
				return createItem( {
					parentFragment: this$0,
					pElement: options.pElement,
					template: template,
					index: i
				} );
			} );
			this.value = this.argsList = null;
			this.dirtyArgs = this.dirtyValue = true;
			this.inited = true;
		};
	}( types, create, virtualdom_Fragment$init_createItem );

	/* virtualdom/Fragment/prototype/rebind.js */
	var virtualdom_Fragment$rebind = function( assignNewKeypath ) {

		return function Fragment$rebind( indexRef, newIndex, oldKeypath, newKeypath ) {
			// assign new context keypath if needed
			assignNewKeypath( this, 'context', oldKeypath, newKeypath );
			if ( this.indexRefs && this.indexRefs[ indexRef ] !== undefined ) {
				this.indexRefs[ indexRef ] = newIndex;
			}
			this.items.forEach( function( item ) {
				if ( item.rebind ) {
					item.rebind( indexRef, newIndex, oldKeypath, newKeypath );
				}
			} );
		};
	}( assignNewKeypath );

	/* virtualdom/Fragment/prototype/render.js */
	var virtualdom_Fragment$render = function Fragment$render() {
		var result;
		if ( this.items.length === 1 ) {
			result = this.items[ 0 ].render();
		} else {
			result = document.createDocumentFragment();
			this.items.forEach( function( item ) {
				result.appendChild( item.render() );
			} );
		}
		this.rendered = true;
		return result;
	};

	/* virtualdom/Fragment/prototype/toString.js */
	var virtualdom_Fragment$toString = function Fragment$toString( escape ) {
		if ( !this.items ) {
			return '';
		}
		return this.items.map( function( item ) {
			return item.toString( escape );
		} ).join( '' );
	};

	/* virtualdom/Fragment/prototype/unbind.js */
	var virtualdom_Fragment$unbind = function() {

		return function Fragment$unbind() {
			this.items.forEach( unbindItem );
		};

		function unbindItem( item ) {
			if ( item.unbind ) {
				item.unbind();
			}
		}
	}();

	/* virtualdom/Fragment/prototype/unrender.js */
	var virtualdom_Fragment$unrender = function Fragment$unrender( shouldDestroy ) {
		if ( !this.rendered ) {
			throw new Error( 'Attempted to unrender a fragment that was not rendered' );
		}
		this.items.forEach( function( i ) {
			return i.unrender( shouldDestroy );
		} );
	};

	/* virtualdom/Fragment.js */
	var Fragment = function( bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, getNode, getValue, init, rebind, render, toString, unbind, unrender, circular ) {

		var Fragment = function( options ) {
			this.init( options );
		};
		Fragment.prototype = {
			bubble: bubble,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			findNextNode: findNextNode,
			firstNode: firstNode,
			getNode: getNode,
			getValue: getValue,
			init: init,
			rebind: rebind,
			render: render,
			toString: toString,
			unbind: unbind,
			unrender: unrender
		};
		circular.Fragment = Fragment;
		return Fragment;
	}( virtualdom_Fragment$bubble, virtualdom_Fragment$detach, virtualdom_Fragment$find, virtualdom_Fragment$findAll, virtualdom_Fragment$findAllComponents, virtualdom_Fragment$findComponent, virtualdom_Fragment$findNextNode, virtualdom_Fragment$firstNode, virtualdom_Fragment$getNode, virtualdom_Fragment$getValue, virtualdom_Fragment$init, virtualdom_Fragment$rebind, virtualdom_Fragment$render, virtualdom_Fragment$toString, virtualdom_Fragment$unbind, virtualdom_Fragment$unrender, circular );

	/* Ractive/prototype/reset.js */
	var Ractive$reset = function( runloop, Fragment, config ) {

		var shouldRerender = [
			'template',
			'partials',
			'components',
			'decorators',
			'events'
		];
		return function Ractive$reset( data, callback ) {
			var promise, wrapper, changes, i, rerender;
			if ( typeof data === 'function' && !callback ) {
				callback = data;
				data = {};
			} else {
				data = data || {};
			}
			if ( typeof data !== 'object' ) {
				throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
			}
			// If the root object is wrapped, try and use the wrapper's reset value
			if ( ( wrapper = this.viewmodel.wrapped[ '' ] ) && wrapper.reset ) {
				if ( wrapper.reset( data ) === false ) {
					// reset was rejected, we need to replace the object
					this.data = data;
				}
			} else {
				this.data = data;
			}
			// reset config items and track if need to rerender
			changes = config.reset( this );
			i = changes.length;
			while ( i-- ) {
				if ( shouldRerender.indexOf( changes[ i ] ) > -1 ) {
					rerender = true;
					break;
				}
			}
			if ( rerender ) {
				var component;
				this.viewmodel.mark( '' );
				// Is this is a component, we need to set the `shouldDestroy`
				// flag, otherwise it will assume by default that a parent node
				// will be detached, and therefore it doesn't need to bother
				// detaching its own nodes
				if ( component = this.component ) {
					component.shouldDestroy = true;
				}
				this.unrender();
				if ( component ) {
					component.shouldDestroy = false;
				}
				// If the template changed, we need to destroy the parallel DOM
				// TODO if we're here, presumably it did?
				if ( this.fragment.template !== this.template ) {
					this.fragment.unbind();
					this.fragment = new Fragment( {
						template: this.template,
						root: this,
						owner: this
					} );
				}
				promise = this.render( this.el, this.anchor );
			} else {
				promise = runloop.start( this, true );
				this.viewmodel.mark( '' );
				runloop.end();
			}
			this.fire( 'reset', data );
			if ( callback ) {
				promise.then( callback );
			}
			return promise;
		};
	}( runloop, Fragment, config );

	/* Ractive/prototype/resetTemplate.js */
	var Ractive$resetTemplate = function( config, Fragment ) {

		// TODO should resetTemplate be asynchronous? i.e. should it be a case
		// of outro, update template, intro? I reckon probably not, since that
		// could be achieved with unrender-resetTemplate-render. Also, it should
		// conceptually be similar to resetPartial, which couldn't be async
		return function Ractive$resetTemplate( template ) {
			var transitionsEnabled, component;
			config.template.init( null, this, {
				template: template
			} );
			transitionsEnabled = this.transitionsEnabled;
			this.transitionsEnabled = false;
			// Is this is a component, we need to set the `shouldDestroy`
			// flag, otherwise it will assume by default that a parent node
			// will be detached, and therefore it doesn't need to bother
			// detaching its own nodes
			if ( component = this.component ) {
				component.shouldDestroy = true;
			}
			this.unrender();
			if ( component ) {
				component.shouldDestroy = false;
			}
			// remove existing fragment and create new one
			this.fragment.unbind();
			this.fragment = new Fragment( {
				template: this.template,
				root: this,
				owner: this
			} );
			this.render( this.el, this.anchor );
			this.transitionsEnabled = transitionsEnabled;
		};
	}( config, Fragment );

	/* Ractive/prototype/reverse.js */
	var Ractive$reverse = function( makeArrayMethod ) {

		return makeArrayMethod( 'reverse' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/set.js */
	var Ractive$set = function( runloop, isObject, normaliseKeypath, getMatchingKeypaths ) {

		var wildcard = /\*/;
		return function Ractive$set( keypath, value, callback ) {
			var this$0 = this;
			var map, promise;
			promise = runloop.start( this, true );
			// Set multiple keypaths in one go
			if ( isObject( keypath ) ) {
				map = keypath;
				callback = value;
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						value = map[ keypath ];
						keypath = normaliseKeypath( keypath );
						this.viewmodel.set( keypath, value );
					}
				}
			} else {
				keypath = normaliseKeypath( keypath );
				if ( wildcard.test( keypath ) ) {
					getMatchingKeypaths( this, keypath ).forEach( function( keypath ) {
						this$0.viewmodel.set( keypath, value );
					} );
				} else {
					this.viewmodel.set( keypath, value );
				}
			}
			runloop.end();
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( runloop, isObject, normaliseKeypath, getMatchingKeypaths );

	/* Ractive/prototype/shift.js */
	var Ractive$shift = function( makeArrayMethod ) {

		return makeArrayMethod( 'shift' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/sort.js */
	var Ractive$sort = function( makeArrayMethod ) {

		return makeArrayMethod( 'sort' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/splice.js */
	var Ractive$splice = function( makeArrayMethod ) {

		return makeArrayMethod( 'splice' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/subtract.js */
	var Ractive$subtract = function( add ) {

		return function Ractive$subtract( keypath, d ) {
			return add( this, keypath, d === undefined ? -1 : -d );
		};
	}( Ractive$shared_add );

	/* Ractive/prototype/teardown.js */
	var Ractive$teardown = function( Promise ) {

		// Teardown. This goes through the root fragment and all its children, removing observers
		// and generally cleaning up after itself
		return function Ractive$teardown( callback ) {
			var promise;
			this.fire( 'teardown' );
			this.fragment.unbind();
			this.viewmodel.teardown();
			promise = this.rendered ? this.unrender() : Promise.resolve();
			if ( callback ) {
				// TODO deprecate this?
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( Promise );

	/* Ractive/prototype/toggle.js */
	var Ractive$toggle = function( log ) {

		return function Ractive$toggle( keypath, callback ) {
			var value;
			if ( typeof keypath !== 'string' ) {
				log.errorOnly( {
					debug: this.debug,
					messsage: 'badArguments',
					arg: {
						arguments: keypath
					}
				} );
			}
			value = this.get( keypath );
			return this.set( keypath, !value, callback );
		};
	}( log );

	/* Ractive/prototype/toHTML.js */
	var Ractive$toHTML = function Ractive$toHTML() {
		return this.fragment.toString( true );
	};

	/* Ractive/prototype/unrender.js */
	var Ractive$unrender = function( removeFromArray, runloop, css ) {

		return function Ractive$unrender() {
			var this$0 = this;
			var promise, shouldDestroy;
			if ( !this.rendered ) {
				throw new Error( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
			}
			promise = runloop.start( this, true );
			// If this is a component, and the component isn't marked for destruction,
			// don't detach nodes from the DOM unnecessarily
			shouldDestroy = !this.component || this.component.shouldDestroy;
			shouldDestroy = shouldDestroy || this.shouldDestroy;
			if ( this.constructor.css ) {
				promise.then( function() {
					css.remove( this$0.constructor );
				} );
			}
			// Cancel any animations in progress
			while ( this._animations[ 0 ] ) {
				this._animations[ 0 ].stop();
			}
			this.fragment.unrender( shouldDestroy );
			this.rendered = false;
			removeFromArray( this.el.__ractive_instances__, this );
			runloop.end();
			return promise;
		};
	}( removeFromArray, runloop, global_css );

	/* Ractive/prototype/unshift.js */
	var Ractive$unshift = function( makeArrayMethod ) {

		return makeArrayMethod( 'unshift' );
	}( Ractive$shared_makeArrayMethod );

	/* Ractive/prototype/update.js */
	var Ractive$update = function( runloop ) {

		return function Ractive$update( keypath, callback ) {
			var promise;
			if ( typeof keypath === 'function' ) {
				callback = keypath;
				keypath = '';
			} else {
				keypath = keypath || '';
			}
			promise = runloop.start( this, true );
			this.viewmodel.mark( keypath );
			runloop.end();
			this.fire( 'update', keypath );
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( runloop );

	/* Ractive/prototype/updateModel.js */
	var Ractive$updateModel = function( arrayContentsMatch, isEqual ) {

		return function Ractive$updateModel( keypath, cascade ) {
			var values;
			if ( typeof keypath !== 'string' ) {
				keypath = '';
				cascade = true;
			}
			consolidateChangedValues( this, keypath, values = {}, cascade );
			return this.set( values );
		};

		function consolidateChangedValues( ractive, keypath, values, cascade ) {
			var bindings, childDeps, i, binding, oldValue, newValue, checkboxGroups = [];
			bindings = ractive._twowayBindings[ keypath ];
			if ( bindings && ( i = bindings.length ) ) {
				while ( i-- ) {
					binding = bindings[ i ];
					// special case - radio name bindings
					if ( binding.radioName && !binding.element.node.checked ) {
						continue;
					}
					// special case - checkbox name bindings come in groups, so
					// we want to get the value once at most
					if ( binding.checkboxName ) {
						if ( !checkboxGroups[ binding.keypath ] && !binding.changed() ) {
							checkboxGroups.push( binding.keypath );
							checkboxGroups[ binding.keypath ] = binding;
						}
						continue;
					}
					oldValue = binding.attribute.value;
					newValue = binding.getValue();
					if ( arrayContentsMatch( oldValue, newValue ) ) {
						continue;
					}
					if ( !isEqual( oldValue, newValue ) ) {
						values[ keypath ] = newValue;
					}
				}
			}
			// Handle groups of `<input type='checkbox' name='{{foo}}' ...>`
			if ( checkboxGroups.length ) {
				checkboxGroups.forEach( function( keypath ) {
					var binding, oldValue, newValue;
					binding = checkboxGroups[ keypath ];
					// one to represent the entire group
					oldValue = binding.attribute.value;
					newValue = binding.getValue();
					if ( !arrayContentsMatch( oldValue, newValue ) ) {
						values[ keypath ] = newValue;
					}
				} );
			}
			if ( !cascade ) {
				return;
			}
			// cascade
			childDeps = ractive.viewmodel.depsMap[ 'default' ][ keypath ];
			if ( childDeps ) {
				i = childDeps.length;
				while ( i-- ) {
					consolidateChangedValues( ractive, childDeps[ i ], values, cascade );
				}
			}
		}
	}( arrayContentsMatch, isEqual );

	/* Ractive/prototype.js */
	var prototype = function( add, animate, detach, find, findAll, findAllComponents, findComponent, fire, get, insert, merge, observe, off, on, pop, push, render, reset, resetTemplate, reverse, set, shift, sort, splice, subtract, teardown, toggle, toHTML, unrender, unshift, update, updateModel ) {

		return {
			add: add,
			animate: animate,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			fire: fire,
			get: get,
			insert: insert,
			merge: merge,
			observe: observe,
			off: off,
			on: on,
			pop: pop,
			push: push,
			render: render,
			reset: reset,
			resetTemplate: resetTemplate,
			reverse: reverse,
			set: set,
			shift: shift,
			sort: sort,
			splice: splice,
			subtract: subtract,
			teardown: teardown,
			toggle: toggle,
			toHTML: toHTML,
			unrender: unrender,
			unshift: unshift,
			update: update,
			updateModel: updateModel
		};
	}( Ractive$add, Ractive$animate, Ractive$detach, Ractive$find, Ractive$findAll, Ractive$findAllComponents, Ractive$findComponent, Ractive$fire, Ractive$get, Ractive$insert, Ractive$merge, Ractive$observe, Ractive$off, Ractive$on, Ractive$pop, Ractive$push, Ractive$render, Ractive$reset, Ractive$resetTemplate, Ractive$reverse, Ractive$set, Ractive$shift, Ractive$sort, Ractive$splice, Ractive$subtract, Ractive$teardown, Ractive$toggle, Ractive$toHTML, Ractive$unrender, Ractive$unshift, Ractive$update, Ractive$updateModel );

	/* utils/getGuid.js */
	var getGuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			var r, v;
			r = Math.random() * 16 | 0;
			v = c == 'x' ? r : r & 3 | 8;
			return v.toString( 16 );
		} );
	};

	/* utils/getNextNumber.js */
	var getNextNumber = function() {

		var i = 0;
		return function() {
			return 'r-' + i++;
		};
	}();

	/* viewmodel/prototype/get/arrayAdaptor/processWrapper.js */
	var viewmodel$get_arrayAdaptor_processWrapper = function( wrapper, array, methodName, spliceSummary ) {
		var root = wrapper.root,
			keypath = wrapper.keypath;
		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		if ( methodName === 'sort' || methodName === 'reverse' ) {
			root.viewmodel.set( keypath, array );
			return;
		}
		if ( !spliceSummary ) {
			// (presumably we tried to pop from an array of zero length.
			// in which case there's nothing to do)
			return;
		}
		root.viewmodel.splice( keypath, spliceSummary );
	};

	/* viewmodel/prototype/get/arrayAdaptor/patch.js */
	var viewmodel$get_arrayAdaptor_patch = function( runloop, defineProperty, getSpliceEquivalent, summariseSpliceOperation, processWrapper ) {

		var patchedArrayProto = [],
			mutatorMethods = [
				'pop',
				'push',
				'reverse',
				'shift',
				'sort',
				'splice',
				'unshift'
			],
			testObj, patchArrayMethods, unpatchArrayMethods;
		mutatorMethods.forEach( function( methodName ) {
			var method = function() {
				var spliceEquivalent, spliceSummary, result, wrapper, i;
				// push, pop, shift and unshift can all be represented as a splice operation.
				// this makes life easier later
				spliceEquivalent = getSpliceEquivalent( this, methodName, Array.prototype.slice.call( arguments ) );
				spliceSummary = summariseSpliceOperation( this, spliceEquivalent );
				// apply the underlying method
				result = Array.prototype[ methodName ].apply( this, arguments );
				// trigger changes
				this._ractive.setting = true;
				i = this._ractive.wrappers.length;
				while ( i-- ) {
					wrapper = this._ractive.wrappers[ i ];
					runloop.start( wrapper.root );
					processWrapper( wrapper, this, methodName, spliceSummary );
					runloop.end();
				}
				this._ractive.setting = false;
				return result;
			};
			defineProperty( patchedArrayProto, methodName, {
				value: method
			} );
		} );
		// can we use prototype chain injection?
		// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
		testObj = {};
		if ( testObj.__proto__ ) {
			// yes, we can
			patchArrayMethods = function( array ) {
				array.__proto__ = patchedArrayProto;
			};
			unpatchArrayMethods = function( array ) {
				array.__proto__ = Array.prototype;
			};
		} else {
			// no, we can't
			patchArrayMethods = function( array ) {
				var i, methodName;
				i = mutatorMethods.length;
				while ( i-- ) {
					methodName = mutatorMethods[ i ];
					defineProperty( array, methodName, {
						value: patchedArrayProto[ methodName ],
						configurable: true
					} );
				}
			};
			unpatchArrayMethods = function( array ) {
				var i;
				i = mutatorMethods.length;
				while ( i-- ) {
					delete array[ mutatorMethods[ i ] ];
				}
			};
		}
		patchArrayMethods.unpatch = unpatchArrayMethods;
		return patchArrayMethods;
	}( runloop, defineProperty, getSpliceEquivalent, summariseSpliceOperation, viewmodel$get_arrayAdaptor_processWrapper );

	/* viewmodel/prototype/get/arrayAdaptor.js */
	var viewmodel$get_arrayAdaptor = function( defineProperty, isArray, patch ) {

		var arrayAdaptor,
			// helpers
			ArrayWrapper, errorMessage;
		arrayAdaptor = {
			filter: function( object ) {
				// wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
				// or the array didn't trigger the get() itself
				return isArray( object ) && ( !object._ractive || !object._ractive.setting );
			},
			wrap: function( ractive, array, keypath ) {
				return new ArrayWrapper( ractive, array, keypath );
			}
		};
		ArrayWrapper = function( ractive, array, keypath ) {
			this.root = ractive;
			this.value = array;
			this.keypath = keypath;
			// if this array hasn't already been ractified, ractify it
			if ( !array._ractive ) {
				// define a non-enumerable _ractive property to store the wrappers
				defineProperty( array, '_ractive', {
					value: {
						wrappers: [],
						instances: [],
						setting: false
					},
					configurable: true
				} );
				patch( array );
			}
			// store the ractive instance, so we can handle transitions later
			if ( !array._ractive.instances[ ractive._guid ] ) {
				array._ractive.instances[ ractive._guid ] = 0;
				array._ractive.instances.push( ractive );
			}
			array._ractive.instances[ ractive._guid ] += 1;
			array._ractive.wrappers.push( this );
		};
		ArrayWrapper.prototype = {
			get: function() {
				return this.value;
			},
			teardown: function() {
				var array, storage, wrappers, instances, index;
				array = this.value;
				storage = array._ractive;
				wrappers = storage.wrappers;
				instances = storage.instances;
				// if teardown() was invoked because we're clearing the cache as a result of
				// a change that the array itself triggered, we can save ourselves the teardown
				// and immediate setup
				if ( storage.setting ) {
					return false;
				}
				index = wrappers.indexOf( this );
				if ( index === -1 ) {
					throw new Error( errorMessage );
				}
				wrappers.splice( index, 1 );
				// if nothing else depends on this array, we can revert it to its
				// natural state
				if ( !wrappers.length ) {
					delete array._ractive;
					patch.unpatch( this.value );
				} else {
					// remove ractive instance if possible
					instances[ this.root._guid ] -= 1;
					if ( !instances[ this.root._guid ] ) {
						index = instances.indexOf( this.root );
						if ( index === -1 ) {
							throw new Error( errorMessage );
						}
						instances.splice( index, 1 );
					}
				}
			}
		};
		errorMessage = 'Something went wrong in a rather interesting way';
		return arrayAdaptor;
	}( defineProperty, isArray, viewmodel$get_arrayAdaptor_patch );

	/* viewmodel/prototype/get/magicArrayAdaptor.js */
	var viewmodel$get_magicArrayAdaptor = function( magicAdaptor, arrayAdaptor ) {

		var magicArrayAdaptor, MagicArrayWrapper;
		if ( magicAdaptor ) {
			magicArrayAdaptor = {
				filter: function( object, keypath, ractive ) {
					return magicAdaptor.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
				},
				wrap: function( ractive, array, keypath ) {
					return new MagicArrayWrapper( ractive, array, keypath );
				}
			};
			MagicArrayWrapper = function( ractive, array, keypath ) {
				this.value = array;
				this.magic = true;
				this.magicWrapper = magicAdaptor.wrap( ractive, array, keypath );
				this.arrayWrapper = arrayAdaptor.wrap( ractive, array, keypath );
			};
			MagicArrayWrapper.prototype = {
				get: function() {
					return this.value;
				},
				teardown: function() {
					this.arrayWrapper.teardown();
					this.magicWrapper.teardown();
				},
				reset: function( value ) {
					return this.magicWrapper.reset( value );
				}
			};
		}
		return magicArrayAdaptor;
	}( viewmodel$get_magicAdaptor, viewmodel$get_arrayAdaptor );

	/* viewmodel/prototype/adapt.js */
	var viewmodel$adapt = function( config, arrayAdaptor, magicAdaptor, magicArrayAdaptor ) {

		var prefixers = {};
		return function Viewmodel$adapt( keypath, value ) {
			var ractive = this.ractive,
				len, i, adaptor, wrapped;
			// Do we have an adaptor for this value?
			len = ractive.adapt.length;
			for ( i = 0; i < len; i += 1 ) {
				adaptor = ractive.adapt[ i ];
				// Adaptors can be specified as e.g. [ 'Backbone.Model', 'Backbone.Collection' ] -
				// we need to get the actual adaptor if that's the case
				if ( typeof adaptor === 'string' ) {
					var found = config.registries.adaptors.find( ractive, adaptor );
					if ( !found ) {
						throw new Error( 'Missing adaptor "' + adaptor + '"' );
					}
					adaptor = ractive.adapt[ i ] = found;
				}
				if ( adaptor.filter( value, keypath, ractive ) ) {
					wrapped = this.wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
					wrapped.value = value;
					return value;
				}
			}
			if ( ractive.magic ) {
				if ( magicArrayAdaptor.filter( value, keypath, ractive ) ) {
					this.wrapped[ keypath ] = magicArrayAdaptor.wrap( ractive, value, keypath );
				} else if ( magicAdaptor.filter( value, keypath, ractive ) ) {
					this.wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
				}
			} else if ( ractive.modifyArrays && arrayAdaptor.filter( value, keypath, ractive ) ) {
				this.wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
			}
			return value;
		};

		function prefixKeypath( obj, prefix ) {
			var prefixed = {},
				key;
			if ( !prefix ) {
				return obj;
			}
			prefix += '.';
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					prefixed[ prefix + key ] = obj[ key ];
				}
			}
			return prefixed;
		}

		function getPrefixer( rootKeypath ) {
			var rootDot;
			if ( !prefixers[ rootKeypath ] ) {
				rootDot = rootKeypath ? rootKeypath + '.' : '';
				prefixers[ rootKeypath ] = function( relativeKeypath, value ) {
					var obj;
					if ( typeof relativeKeypath === 'string' ) {
						obj = {};
						obj[ rootDot + relativeKeypath ] = value;
						return obj;
					}
					if ( typeof relativeKeypath === 'object' ) {
						// 'relativeKeypath' is in fact a hash, not a keypath
						return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
					}
				};
			}
			return prefixers[ rootKeypath ];
		}
	}( config, viewmodel$get_arrayAdaptor, viewmodel$get_magicAdaptor, viewmodel$get_magicArrayAdaptor );

	/* viewmodel/helpers/getUpstreamChanges.js */
	var getUpstreamChanges = function getUpstreamChanges( changes ) {
		var upstreamChanges = [ '' ],
			i, keypath, keys, upstreamKeypath;
		i = changes.length;
		while ( i-- ) {
			keypath = changes[ i ];
			keys = keypath.split( '.' );
			while ( keys.length > 1 ) {
				keys.pop();
				upstreamKeypath = keys.join( '.' );
				if ( upstreamChanges.indexOf( upstreamKeypath ) === -1 ) {
					upstreamChanges.push( upstreamKeypath );
				}
			}
		}
		return upstreamChanges;
	};

	/* viewmodel/prototype/applyChanges/getPotentialWildcardMatches.js */
	var viewmodel$applyChanges_getPotentialWildcardMatches = function() {

		var starMaps = {};
		// This function takes a keypath such as 'foo.bar.baz', and returns
		// all the variants of that keypath that include a wildcard in place
		// of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
		// These are then checked against the dependants map (ractive.viewmodel.depsMap)
		// to see if any pattern observers are downstream of one or more of
		// these wildcard keypaths (e.g. 'foo.bar.*.status')
		return function getPotentialWildcardMatches( keypath ) {
			var keys, starMap, mapper, result;
			keys = keypath.split( '.' );
			starMap = getStarMap( keys.length );
			mapper = function( star, i ) {
				return star ? '*' : keys[ i ];
			};
			result = starMap.map( function( mask ) {
				return mask.map( mapper ).join( '.' );
			} );
			return result;
		};
		// This function returns all the possible true/false combinations for
		// a given number - e.g. for two, the possible combinations are
		// [ true, true ], [ true, false ], [ false, true ], [ false, false ].
		// It does so by getting all the binary values between 0 and e.g. 11
		function getStarMap( length ) {
			var ones = '',
				max, binary, starMap, mapper, i;
			if ( !starMaps[ length ] ) {
				starMap = [];
				while ( ones.length < length ) {
					ones += 1;
				}
				max = parseInt( ones, 2 );
				mapper = function( digit ) {
					return digit === '1';
				};
				for ( i = 0; i <= max; i += 1 ) {
					binary = i.toString( 2 );
					while ( binary.length < length ) {
						binary = '0' + binary;
					}
					starMap[ i ] = Array.prototype.map.call( binary, mapper );
				}
				starMaps[ length ] = starMap;
			}
			return starMaps[ length ];
		}
	}();

	/* viewmodel/prototype/applyChanges/notifyPatternObservers.js */
	var viewmodel$applyChanges_notifyPatternObservers = function( getPotentialWildcardMatches ) {

		var lastKey = /[^\.]+$/;
		return notifyPatternObservers;

		function notifyPatternObservers( viewmodel, keypath, onlyDirect ) {
			var potentialWildcardMatches;
			updateMatchingPatternObservers( viewmodel, keypath );
			if ( onlyDirect ) {
				return;
			}
			potentialWildcardMatches = getPotentialWildcardMatches( keypath );
			potentialWildcardMatches.forEach( function( upstreamPattern ) {
				cascade( viewmodel, upstreamPattern, keypath );
			} );
		}

		function cascade( viewmodel, upstreamPattern, keypath ) {
			var group, map, actualChildKeypath;
			group = viewmodel.depsMap.patternObservers;
			map = group[ upstreamPattern ];
			if ( map ) {
				map.forEach( function( childKeypath ) {
					var key = lastKey.exec( childKeypath )[ 0 ];
					// 'baz'
					actualChildKeypath = keypath ? keypath + '.' + key : key;
					// 'foo.bar.baz'
					updateMatchingPatternObservers( viewmodel, actualChildKeypath );
					cascade( viewmodel, childKeypath, actualChildKeypath );
				} );
			}
		}

		function updateMatchingPatternObservers( viewmodel, keypath ) {
			viewmodel.patternObservers.forEach( function( observer ) {
				if ( observer.regex.test( keypath ) ) {
					observer.update( keypath );
				}
			} );
		}
	}( viewmodel$applyChanges_getPotentialWildcardMatches );

	/* viewmodel/prototype/applyChanges.js */
	var viewmodel$applyChanges = function( getUpstreamChanges, notifyPatternObservers ) {

		var dependantGroups = [
			'observers',
			'default'
		];
		return function Viewmodel$applyChanges() {
			var this$0 = this;
			var self = this,
				changes, upstreamChanges, allChanges = [],
				computations, addComputations, cascade, hash = {};
			if ( !this.changes.length ) {
				// TODO we end up here on initial render. Perhaps we shouldn't?
				return;
			}
			addComputations = function( keypath ) {
				var newComputations;
				if ( newComputations = self.deps.computed[ keypath ] ) {
					addNewItems( computations, newComputations );
				}
			};
			cascade = function( keypath ) {
				var map;
				addComputations( keypath );
				if ( map = self.depsMap.computed[ keypath ] ) {
					map.forEach( cascade );
				}
			};
			// Find computations and evaluators that are invalidated by
			// these changes. If they have changed, add them to the
			// list of changes. Lather, rinse and repeat until the
			// system is settled
			do {
				changes = this.changes;
				addNewItems( allChanges, changes );
				this.changes = [];
				computations = [];
				upstreamChanges = getUpstreamChanges( changes );
				upstreamChanges.forEach( addComputations );
				changes.forEach( cascade );
				computations.forEach( updateComputation );
			} while ( this.changes.length );
			upstreamChanges = getUpstreamChanges( allChanges );
			// Pattern observers are a weird special case
			if ( this.patternObservers.length ) {
				upstreamChanges.forEach( function( keypath ) {
					return notifyPatternObservers( this$0, keypath, true );
				} );
				allChanges.forEach( function( keypath ) {
					return notifyPatternObservers( this$0, keypath );
				} );
			}
			dependantGroups.forEach( function( group ) {
				if ( !this$0.deps[ group ] ) {
					return;
				}
				upstreamChanges.forEach( function( keypath ) {
					return notifyUpstreamDependants( this$0, keypath, group );
				} );
				notifyAllDependants( this$0, allChanges, group );
			} );
			// Return a hash of keypaths to updated values
			allChanges.forEach( function( keypath ) {
				hash[ keypath ] = this$0.get( keypath );
			} );
			this.implicitChanges = {};
			return hash;
		};

		function updateComputation( computation ) {
			computation.update();
		}

		function notifyUpstreamDependants( viewmodel, keypath, groupName ) {
			var dependants, value;
			if ( dependants = findDependants( viewmodel, keypath, groupName ) ) {
				value = viewmodel.get( keypath );
				dependants.forEach( function( d ) {
					return d.setValue( value );
				} );
			}
		}

		function notifyAllDependants( viewmodel, keypaths, groupName ) {
			var queue = [];
			addKeypaths( keypaths );
			queue.forEach( dispatch );

			function addKeypaths( keypaths ) {
				keypaths.forEach( addKeypath );
				keypaths.forEach( cascade );
			}

			function addKeypath( keypath ) {
				var deps = findDependants( viewmodel, keypath, groupName );
				if ( deps ) {
					queue.push( {
						keypath: keypath,
						deps: deps
					} );
				}
			}

			function cascade( keypath ) {
				var childDeps;
				if ( childDeps = viewmodel.depsMap[ groupName ][ keypath ] ) {
					addKeypaths( childDeps );
				}
			}

			function dispatch( set ) {
				var value = viewmodel.get( set.keypath );
				set.deps.forEach( function( d ) {
					return d.setValue( value );
				} );
			}
		}

		function findDependants( viewmodel, keypath, groupName ) {
			var group = viewmodel.deps[ groupName ];
			return group ? group[ keypath ] : null;
		}

		function addNewItems( arr, items ) {
			items.forEach( function( item ) {
				if ( arr.indexOf( item ) === -1 ) {
					arr.push( item );
				}
			} );
		}
	}( getUpstreamChanges, viewmodel$applyChanges_notifyPatternObservers );

	/* viewmodel/prototype/capture.js */
	var viewmodel$capture = function Viewmodel$capture() {
		this.capturing = true;
		this.captured = [];
	};

	/* viewmodel/prototype/clearCache.js */
	var viewmodel$clearCache = function Viewmodel$clearCache( keypath, dontTeardownWrapper ) {
		var cacheMap, wrapper, computation;
		if ( !dontTeardownWrapper ) {
			// Is there a wrapped property at this keypath?
			if ( wrapper = this.wrapped[ keypath ] ) {
				// Did we unwrap it?
				if ( wrapper.teardown() !== false ) {
					this.wrapped[ keypath ] = null;
				}
			}
		}
		if ( computation = this.computations[ keypath ] ) {
			computation.compute();
		}
		this.cache[ keypath ] = undefined;
		if ( cacheMap = this.cacheMap[ keypath ] ) {
			while ( cacheMap.length ) {
				this.clearCache( cacheMap.pop() );
			}
		}
	};

	/* viewmodel/prototype/get/FAILED_LOOKUP.js */
	var viewmodel$get_FAILED_LOOKUP = {
		FAILED_LOOKUP: true
	};

	/* viewmodel/prototype/get/UnresolvedImplicitDependency.js */
	var viewmodel$get_UnresolvedImplicitDependency = function( removeFromArray, runloop ) {

		var empty = {};
		var UnresolvedImplicitDependency = function( viewmodel, keypath ) {
			this.viewmodel = viewmodel;
			this.root = viewmodel.ractive;
			// TODO eliminate this
			this.ref = keypath;
			this.parentFragment = empty;
			viewmodel.unresolvedImplicitDependencies[ keypath ] = true;
			viewmodel.unresolvedImplicitDependencies.push( this );
			runloop.addUnresolved( this );
		};
		UnresolvedImplicitDependency.prototype = {
			resolve: function() {
				this.viewmodel.mark( this.ref );
				this.viewmodel.unresolvedImplicitDependencies[ this.ref ] = false;
				removeFromArray( this.viewmodel.unresolvedImplicitDependencies, this );
			},
			teardown: function() {
				runloop.removeUnresolved( this );
			}
		};
		return UnresolvedImplicitDependency;
	}( removeFromArray, runloop );

	/* viewmodel/prototype/get.js */
	var viewmodel$get = function( FAILED_LOOKUP, UnresolvedImplicitDependency ) {

		var empty = {};
		return function Viewmodel$get( keypath ) {
			var options = arguments[ 1 ];
			if ( options === void 0 )
				options = empty;
			var ractive = this.ractive,
				cache = this.cache,
				value, computation, wrapped, evaluator;
			if ( cache[ keypath ] === undefined ) {
				// Is this a computed property?
				if ( computation = this.computations[ keypath ] ) {
					value = computation.value;
				} else if ( wrapped = this.wrapped[ keypath ] ) {
					value = wrapped.value;
				} else if ( !keypath ) {
					this.adapt( '', ractive.data );
					value = ractive.data;
				} else if ( evaluator = this.evaluators[ keypath ] ) {
					value = evaluator.value;
				} else {
					value = retrieve( this, keypath );
				}
				cache[ keypath ] = value;
			} else {
				value = cache[ keypath ];
			}
			if ( options.evaluateWrapped && ( wrapped = this.wrapped[ keypath ] ) ) {
				value = wrapped.get();
			}
			// capture the keypath, if we're inside a computation or evaluator
			if ( options.capture && this.capturing && this.captured.indexOf( keypath ) === -1 ) {
				this.captured.push( keypath );
				// if we couldn't resolve the keypath, we need to make it as a failed
				// lookup, so that the evaluator updates correctly once we CAN
				// resolve the keypath
				if ( value === FAILED_LOOKUP && this.unresolvedImplicitDependencies[ keypath ] !== true ) {
					new UnresolvedImplicitDependency( this, keypath );
				}
			}
			return value === FAILED_LOOKUP ? void 0 : value;
		};

		function retrieve( viewmodel, keypath ) {
			var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped;
			keys = keypath.split( '.' );
			key = keys.pop();
			parentKeypath = keys.join( '.' );
			parentValue = viewmodel.get( parentKeypath );
			if ( wrapped = viewmodel.wrapped[ parentKeypath ] ) {
				parentValue = wrapped.get();
			}
			if ( parentValue === null || parentValue === undefined ) {
				return;
			}
			// update cache map
			if ( !( cacheMap = viewmodel.cacheMap[ parentKeypath ] ) ) {
				viewmodel.cacheMap[ parentKeypath ] = [ keypath ];
			} else {
				if ( cacheMap.indexOf( keypath ) === -1 ) {
					cacheMap.push( keypath );
				}
			}
			// If this property doesn't exist, we return a sentinel value
			// so that we know to query parent scope (if such there be)
			if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
				return viewmodel.cache[ keypath ] = FAILED_LOOKUP;
			}
			value = parentValue[ key ];
			// Do we have an adaptor for this value?
			viewmodel.adapt( keypath, value, false );
			// Update cache
			viewmodel.cache[ keypath ] = value;
			return value;
		}
	}( viewmodel$get_FAILED_LOOKUP, viewmodel$get_UnresolvedImplicitDependency );

	/* viewmodel/prototype/mark.js */
	var viewmodel$mark = function Viewmodel$mark( keypath, isImplicitChange ) {
		// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
		// should not be picked up by pattern observers
		if ( isImplicitChange ) {
			this.implicitChanges[ keypath ] = true;
		}
		if ( this.changes.indexOf( keypath ) === -1 ) {
			this.changes.push( keypath );
			this.clearCache( keypath );
		}
	};

	/* viewmodel/prototype/merge/mapOldToNewIndex.js */
	var viewmodel$merge_mapOldToNewIndex = function( oldArray, newArray ) {
		var usedIndices, firstUnusedIndex, newIndices, changed;
		usedIndices = {};
		firstUnusedIndex = 0;
		newIndices = oldArray.map( function( item, i ) {
			var index, start, len;
			start = firstUnusedIndex;
			len = newArray.length;
			do {
				index = newArray.indexOf( item, start );
				if ( index === -1 ) {
					changed = true;
					return -1;
				}
				start = index + 1;
			} while ( usedIndices[ index ] && start < len );
			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			if ( index !== i ) {
				changed = true;
			}
			usedIndices[ index ] = true;
			return index;
		} );
		newIndices.unchanged = !changed;
		return newIndices;
	};

	/* viewmodel/prototype/merge.js */
	var viewmodel$merge = function( types, warn, mapOldToNewIndex ) {

		var comparators = {};
		return function Viewmodel$merge( keypath, currentArray, array, options ) {
			var this$0 = this;
			var oldArray, newArray, comparator, newIndices, dependants;
			this.mark( keypath );
			if ( options && options.compare ) {
				comparator = getComparatorFunction( options.compare );
				try {
					oldArray = currentArray.map( comparator );
					newArray = array.map( comparator );
				} catch ( err ) {
					// fallback to an identity check - worst case scenario we have
					// to do more DOM manipulation than we thought...
					// ...unless we're in debug mode of course
					if ( this.debug ) {
						throw err;
					} else {
						warn( 'Merge operation: comparison failed. Falling back to identity checking' );
					}
					oldArray = currentArray;
					newArray = array;
				}
			} else {
				oldArray = currentArray;
				newArray = array;
			}
			// find new indices for members of oldArray
			newIndices = mapOldToNewIndex( oldArray, newArray );
			// Indices that are being removed should be marked as dirty
			newIndices.forEach( function( newIndex, oldIndex ) {
				if ( newIndex === -1 ) {
					this$0.mark( keypath + '.' + oldIndex );
				}
			} );
			// Update the model
			// TODO allow existing array to be updated in place, rather than replaced?
			this.set( keypath, array, true );
			if ( dependants = this.deps[ 'default' ][ keypath ] ) {
				dependants.filter( canMerge ).forEach( function( dependant ) {
					return dependant.merge( newIndices );
				} );
			}
			if ( currentArray.length !== array.length ) {
				this.mark( keypath + '.length', true );
			}
		};

		function canMerge( dependant ) {
			return typeof dependant.merge === 'function' && ( !dependant.subtype || dependant.subtype === types.SECTION_EACH );
		}

		function stringify( item ) {
			return JSON.stringify( item );
		}

		function getComparatorFunction( comparator ) {
			// If `compare` is `true`, we use JSON.stringify to compare
			// objects that are the same shape, but non-identical - i.e.
			// { foo: 'bar' } !== { foo: 'bar' }
			if ( comparator === true ) {
				return stringify;
			}
			if ( typeof comparator === 'string' ) {
				if ( !comparators[ comparator ] ) {
					comparators[ comparator ] = function( item ) {
						return item[ comparator ];
					};
				}
				return comparators[ comparator ];
			}
			if ( typeof comparator === 'function' ) {
				return comparator;
			}
			throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
		}
	}( types, warn, viewmodel$merge_mapOldToNewIndex );

	/* viewmodel/prototype/register.js */
	var viewmodel$register = function() {

		return function Viewmodel$register( keypath, dependant ) {
			var group = arguments[ 2 ];
			if ( group === void 0 )
				group = 'default';
			var depsByKeypath, deps, evaluator;
			if ( dependant.isStatic ) {
				return;
			}
			depsByKeypath = this.deps[ group ] || ( this.deps[ group ] = {} );
			deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );
			deps.push( dependant );
			if ( !keypath ) {
				return;
			}
			if ( evaluator = this.evaluators[ keypath ] ) {
				if ( !evaluator.dependants ) {
					evaluator.wake();
				}
				evaluator.dependants += 1;
			}
			updateDependantsMap( this, keypath, group );
		};

		function updateDependantsMap( viewmodel, keypath, group ) {
			var keys, parentKeypath, map, parent;
			// update dependants map
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = viewmodel.depsMap[ group ] || ( viewmodel.depsMap[ group ] = {} );
				parent = map[ parentKeypath ] || ( map[ parentKeypath ] = [] );
				if ( parent[ keypath ] === undefined ) {
					parent[ keypath ] = 0;
					parent.push( keypath );
				}
				parent[ keypath ] += 1;
				keypath = parentKeypath;
			}
		}
	}();

	/* viewmodel/prototype/release.js */
	var viewmodel$release = function Viewmodel$release() {
		this.capturing = false;
		return this.captured;
	};

	/* viewmodel/prototype/set.js */
	var viewmodel$set = function( isEqual, createBranch ) {

		return function Viewmodel$set( keypath, value, silent ) {
			var keys, lastKey, parentKeypath, parentValue, computation, wrapper, evaluator, dontTeardownWrapper;
			if ( isEqual( this.cache[ keypath ], value ) ) {
				return;
			}
			computation = this.computations[ keypath ];
			wrapper = this.wrapped[ keypath ];
			evaluator = this.evaluators[ keypath ];
			if ( computation && !computation.setting ) {
				computation.set( value );
			}
			// If we have a wrapper with a `reset()` method, we try and use it. If the
			// `reset()` method returns false, the wrapper should be torn down, and
			// (most likely) a new one should be created later
			if ( wrapper && wrapper.reset ) {
				dontTeardownWrapper = wrapper.reset( value ) !== false;
				if ( dontTeardownWrapper ) {
					value = wrapper.get();
				}
			}
			// Update evaluator value. This may be from the evaluator itself, or
			// it may be from the wrapper that wraps an evaluator's result - it
			// doesn't matter
			if ( evaluator ) {
				evaluator.value = value;
			}
			if ( !computation && !evaluator && !dontTeardownWrapper ) {
				keys = keypath.split( '.' );
				lastKey = keys.pop();
				parentKeypath = keys.join( '.' );
				wrapper = this.wrapped[ parentKeypath ];
				if ( wrapper && wrapper.set ) {
					wrapper.set( lastKey, value );
				} else {
					parentValue = wrapper ? wrapper.get() : this.get( parentKeypath );
					if ( !parentValue ) {
						parentValue = createBranch( lastKey );
						this.set( parentKeypath, parentValue, true );
					}
					parentValue[ lastKey ] = value;
				}
			}
			if ( !silent ) {
				this.mark( keypath );
			} else {
				// We're setting a parent of the original target keypath (i.e.
				// creating a fresh branch) - we need to clear the cache, but
				// not mark it as a change
				this.clearCache( keypath );
			}
		};
	}( isEqual, createBranch );

	/* viewmodel/prototype/splice.js */
	var viewmodel$splice = function( types ) {

		return function Viewmodel$splice( keypath, spliceSummary ) {
			var viewmodel = this,
				i, dependants;
			// Mark changed keypaths
			for ( i = spliceSummary.rangeStart; i < spliceSummary.rangeEnd; i += 1 ) {
				viewmodel.mark( keypath + '.' + i );
			}
			if ( spliceSummary.balance ) {
				viewmodel.mark( keypath + '.length', true );
			}
			// Trigger splice operations
			if ( dependants = viewmodel.deps[ 'default' ][ keypath ] ) {
				dependants.filter( canSplice ).forEach( function( dependant ) {
					return dependant.splice( spliceSummary );
				} );
			}
		};

		function canSplice( dependant ) {
			return dependant.type === types.SECTION && ( !dependant.subtype || dependant.subtype === types.SECTION_EACH ) && dependant.rendered;
		}
	}( types );

	/* viewmodel/prototype/teardown.js */
	var viewmodel$teardown = function Viewmodel$teardown() {
		var this$0 = this;
		var unresolvedImplicitDependency;
		// Clear entire cache - this has the desired side-effect
		// of unwrapping adapted values (e.g. arrays)
		Object.keys( this.cache ).forEach( function( keypath ) {
			return this$0.clearCache( keypath );
		} );
		// Teardown any failed lookups - we don't need them to resolve any more
		while ( unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop() ) {
			unresolvedImplicitDependency.teardown();
		}
	};

	/* viewmodel/prototype/unregister.js */
	var viewmodel$unregister = function() {

		return function Viewmodel$unregister( keypath, dependant ) {
			var group = arguments[ 2 ];
			if ( group === void 0 )
				group = 'default';
			var deps, index, evaluator;
			if ( dependant.isStatic ) {
				return;
			}
			deps = this.deps[ group ][ keypath ];
			index = deps.indexOf( dependant );
			if ( index === -1 ) {
				throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
			}
			deps.splice( index, 1 );
			if ( !keypath ) {
				return;
			}
			if ( evaluator = this.evaluators[ keypath ] ) {
				evaluator.dependants -= 1;
				if ( !evaluator.dependants ) {
					evaluator.sleep();
				}
			}
			updateDependantsMap( this, keypath, group );
		};

		function updateDependantsMap( viewmodel, keypath, group ) {
			var keys, parentKeypath, map, parent;
			// update dependants map
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = viewmodel.depsMap[ group ];
				parent = map[ parentKeypath ];
				parent[ keypath ] -= 1;
				if ( !parent[ keypath ] ) {
					// remove from parent deps map
					parent.splice( parent.indexOf( keypath ), 1 );
					parent[ keypath ] = undefined;
				}
				keypath = parentKeypath;
			}
		}
	}();

	/* viewmodel/Computation/getComputationSignature.js */
	var getComputationSignature = function() {

		var pattern = /\$\{([^\}]+)\}/g;
		return function( signature ) {
			if ( typeof signature === 'function' ) {
				return {
					get: signature
				};
			}
			if ( typeof signature === 'string' ) {
				return {
					get: createFunctionFromString( signature )
				};
			}
			if ( typeof signature === 'object' && typeof signature.get === 'string' ) {
				signature = {
					get: createFunctionFromString( signature.get ),
					set: signature.set
				};
			}
			return signature;
		};

		function createFunctionFromString( signature ) {
			var functionBody = 'var __ractive=this;return(' + signature.replace( pattern, function( match, keypath ) {
				return '__ractive.get("' + keypath + '")';
			} ) + ')';
			return new Function( functionBody );
		}
	}();

	/* viewmodel/Computation/Computation.js */
	var Computation = function( log, isEqual, diff ) {

		var Computation = function( ractive, key, signature ) {
			this.ractive = ractive;
			this.viewmodel = ractive.viewmodel;
			this.key = key;
			this.getter = signature.get;
			this.setter = signature.set;
			this.dependencies = [];
			this.update();
		};
		Computation.prototype = {
			set: function( value ) {
				if ( this.setting ) {
					this.value = value;
					return;
				}
				if ( !this.setter ) {
					throw new Error( 'Computed properties without setters are read-only. (This may change in a future version of Ractive!)' );
				}
				this.setter.call( this.ractive, value );
			},
			// returns `false` if the computation errors
			compute: function() {
				var ractive, errored, newDependencies;
				ractive = this.ractive;
				ractive.viewmodel.capture();
				try {
					this.value = this.getter.call( ractive );
				} catch ( err ) {
					log.warn( {
						debug: ractive.debug,
						message: 'failedComputation',
						args: {
							key: this.key,
							err: err.message || err
						}
					} );
					errored = true;
				}
				newDependencies = ractive.viewmodel.release();
				diff( this, this.dependencies, newDependencies );
				return errored ? false : true;
			},
			update: function() {
				var oldValue = this.value;
				if ( this.compute() && !isEqual( this.value, oldValue ) ) {
					this.ractive.viewmodel.mark( this.key );
				}
			}
		};
		return Computation;
	}( log, isEqual, diff );

	/* viewmodel/Computation/createComputations.js */
	var createComputations = function( getComputationSignature, Computation ) {

		return function createComputations( ractive, computed ) {
			var key, signature;
			for ( key in computed ) {
				signature = getComputationSignature( computed[ key ] );
				ractive.viewmodel.computations[ key ] = new Computation( ractive, key, signature );
			}
		};
	}( getComputationSignature, Computation );

	/* viewmodel/adaptConfig.js */
	var adaptConfig = function() {

		// should this be combined with prototype/adapt.js?
		var configure = {
			lookup: function( target, adaptors ) {
				var i, adapt = target.adapt;
				if ( !adapt || !adapt.length ) {
					return adapt;
				}
				if ( adaptors && Object.keys( adaptors ).length && ( i = adapt.length ) ) {
					while ( i-- ) {
						var adaptor = adapt[ i ];
						if ( typeof adaptor === 'string' ) {
							adapt[ i ] = adaptors[ adaptor ] || adaptor;
						}
					}
				}
				return adapt;
			},
			combine: function( parent, adapt ) {
				// normalize 'Foo' to [ 'Foo' ]
				parent = arrayIfString( parent );
				adapt = arrayIfString( adapt );
				// no parent? return adapt
				if ( !parent || !parent.length ) {
					return adapt;
				}
				// no adapt? return 'copy' of parent
				if ( !adapt || !adapt.length ) {
					return parent.slice();
				}
				// add parent adaptors to options
				parent.forEach( function( a ) {
					// don't put in duplicates
					if ( adapt.indexOf( a ) === -1 ) {
						adapt.push( a );
					}
				} );
				return adapt;
			}
		};

		function arrayIfString( adapt ) {
			if ( typeof adapt === 'string' ) {
				adapt = [ adapt ];
			}
			return adapt;
		}
		return configure;
	}();

	/* viewmodel/Viewmodel.js */
	var Viewmodel = function( create, adapt, applyChanges, capture, clearCache, get, mark, merge, register, release, set, splice, teardown, unregister, createComputations, adaptConfig ) {

		// TODO: fix our ES6 modules so we can have multiple exports
		// then this magic check can be reused by magicAdaptor
		var noMagic;
		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
		} catch ( err ) {
			noMagic = true;
		}
		var Viewmodel = function( ractive ) {
			this.ractive = ractive;
			// TODO eventually, we shouldn't need this reference
			Viewmodel.extend( ractive.constructor, ractive );
			//this.ractive.data
			this.cache = {};
			// we need to be able to use hasOwnProperty, so can't inherit from null
			this.cacheMap = create( null );
			this.deps = {
				computed: {},
				'default': {}
			};
			this.depsMap = {
				computed: {},
				'default': {}
			};
			this.patternObservers = [];
			this.wrapped = create( null );
			// TODO these are conceptually very similar. Can they be merged somehow?
			this.evaluators = create( null );
			this.computations = create( null );
			this.captured = null;
			this.unresolvedImplicitDependencies = [];
			this.changes = [];
			this.implicitChanges = {};
		};
		Viewmodel.extend = function( Parent, instance ) {
			if ( instance.magic && noMagic ) {
				throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
			}
			instance.adapt = adaptConfig.combine( Parent.prototype.adapt, instance.adapt ) || [];
			instance.adapt = adaptConfig.lookup( instance, instance.adaptors );
		};
		Viewmodel.prototype = {
			adapt: adapt,
			applyChanges: applyChanges,
			capture: capture,
			clearCache: clearCache,
			get: get,
			mark: mark,
			merge: merge,
			register: register,
			release: release,
			set: set,
			splice: splice,
			teardown: teardown,
			unregister: unregister,
			// createComputations, in the computations, may call back through get or set
			// of ractive. So, for now, we delay creation of computed from constructor.
			// on option would be to have the Computed class be lazy about using .update()
			compute: function() {
				createComputations( this.ractive, this.ractive.computed );
			}
		};
		return Viewmodel;
	}( create, viewmodel$adapt, viewmodel$applyChanges, viewmodel$capture, viewmodel$clearCache, viewmodel$get, viewmodel$mark, viewmodel$merge, viewmodel$register, viewmodel$release, viewmodel$set, viewmodel$splice, viewmodel$teardown, viewmodel$unregister, createComputations, adaptConfig );

	/* Ractive/initialise.js */
	var Ractive_initialise = function( config, create, getElement, getNextNumber, Viewmodel, Fragment ) {

		return function initialiseRactiveInstance( ractive ) {
			var options = arguments[ 1 ];
			if ( options === void 0 )
				options = {};
			initialiseProperties( ractive, options );
			// init config from Parent and options
			config.init( ractive.constructor, ractive, options );
			// TEMPORARY. This is so we can implement Viewmodel gradually
			ractive.viewmodel = new Viewmodel( ractive );
			// hacky circular problem until we get this sorted out
			// if viewmodel immediately processes computed properties,
			// they may call ractive.get, which calls ractive.viewmodel,
			// which hasn't been set till line above finishes.
			ractive.viewmodel.compute();
			// Render our *root fragment*
			if ( ractive.template ) {
				ractive.fragment = new Fragment( {
					template: ractive.template,
					root: ractive,
					owner: ractive
				} );
			}
			ractive.viewmodel.applyChanges();
			// render automatically ( if `el` is specified )
			tryRender( ractive );
		};

		function tryRender( ractive ) {
			var el;
			if ( el = getElement( ractive.el ) ) {
				var wasEnabled = ractive.transitionsEnabled;
				// Temporarily disable transitions, if `noIntro` flag is set
				if ( ractive.noIntro ) {
					ractive.transitionsEnabled = false;
				}
				// If the target contains content, and `append` is falsy, clear it
				if ( el && !ractive.append ) {
					// Tear down any existing instances on this element
					if ( el.__ractive_instances__ ) {
						try {
							el.__ractive_instances__.splice( 0, el.__ractive_instances__.length ).forEach( function( r ) {
								return r.teardown();
							} );
						} catch ( err ) {}
					}
					el.innerHTML = '';
				}
				ractive.render( el, ractive.append );
				// reset transitionsEnabled
				ractive.transitionsEnabled = wasEnabled;
			}
		}

		function initialiseProperties( ractive, options ) {
			// Generate a unique identifier, for places where you'd use a weak map if it
			// existed
			ractive._guid = getNextNumber();
			// events
			ractive._subs = create( null );
			// storage for item configuration from instantiation to reset,
			// like dynamic functions or original values
			ractive._config = {};
			// two-way bindings
			ractive._twowayBindings = create( null );
			// animations (so we can stop any in progress at teardown)
			ractive._animations = [];
			// nodes registry
			ractive.nodes = {};
			// live queries
			ractive._liveQueries = [];
			ractive._liveComponentQueries = [];
			// If this is a component, store a reference to the parent
			if ( options._parent && options._component ) {
				ractive._parent = options._parent;
				ractive.component = options._component;
				// And store a reference to the instance on the component
				options._component.instance = ractive;
			}
		}
	}( config, create, getElement, getNextNumber, Viewmodel, Fragment );

	/* extend/initChildInstance.js */
	var initChildInstance = function( initialise ) {

		// The Child constructor contains the default init options for this class
		return function initChildInstance( child, Child, options ) {
			if ( child.beforeInit ) {
				child.beforeInit( options );
			}
			initialise( child, options );
		};
	}( Ractive_initialise );

	/* extend/childOptions.js */
	var childOptions = function( wrapPrototype, wrap, config, circular ) {

		var Ractive,
			// would be nice to not have these here,
			// they get added during initialise, so for now we have
			// to make sure not to try and extend them.
			// Possibly, we could re-order and not add till later
			// in process.
			blacklisted = {
				'_parent': true,
				'_component': true
			},
			childOptions = {
				toPrototype: toPrototype,
				toOptions: toOptions
			},
			registries = config.registries;
		config.keys.forEach( function( key ) {
			return blacklisted[ key ] = true;
		} );
		circular.push( function() {
			Ractive = circular.Ractive;
		} );
		return childOptions;

		function toPrototype( parent, proto, options ) {
			for ( var key in options ) {
				if ( !( key in blacklisted ) && options.hasOwnProperty( key ) ) {
					var member = options[ key ];
					// if this is a method that overwrites a method, wrap it:
					if ( typeof member === 'function' ) {
						member = wrapPrototype( parent, key, member );
					}
					proto[ key ] = member;
				}
			}
		}

		function toOptions( Child ) {
			if ( !( Child.prototype instanceof Ractive ) ) {
				return Child;
			}
			var options = {};
			while ( Child ) {
				registries.forEach( function( r ) {
					addRegistry( r.useDefaults ? Child.prototype : Child, options, r.name );
				} );
				Object.keys( Child.prototype ).forEach( function( key ) {
					if ( key === 'computed' ) {
						return;
					}
					var value = Child.prototype[ key ];
					if ( !( key in options ) ) {
						options[ key ] = value._method ? value._method : value;
					} else if ( typeof options[ key ] === 'function' && typeof value === 'function' && options[ key ]._method ) {
						var result, needsSuper = value._method;
						if ( needsSuper ) {
							value = value._method;
						}
						// rewrap bound directly to parent fn
						result = wrap( options[ key ]._method, value );
						if ( needsSuper ) {
							result._method = result;
						}
						options[ key ] = result;
					}
				} );
				if ( Child._parent !== Ractive ) {
					Child = Child._parent;
				} else {
					Child = false;
				}
			}
			return options;
		}

		function addRegistry( target, options, name ) {
			var registry, keys = Object.keys( target[ name ] );
			if ( !keys.length ) {
				return;
			}
			if ( !( registry = options[ name ] ) ) {
				registry = options[ name ] = {};
			}
			keys.filter( function( key ) {
				return !( key in registry );
			} ).forEach( function( key ) {
				return registry[ key ] = target[ name ][ key ];
			} );
		}
	}( wrapPrototypeMethod, wrapMethod, config, circular );

	/* extend/_extend.js */
	var Ractive_extend = function( create, defineProperties, getGuid, config, initChildInstance, Viewmodel, childOptions ) {

		return function extend() {
			var options = arguments[ 0 ];
			if ( options === void 0 )
				options = {};
			var Parent = this,
				Child, proto, staticProperties;
			// if we're extending with another Ractive instance, inherit its
			// prototype methods and default options as well
			options = childOptions.toOptions( options );
			// create Child constructor
			Child = function( options ) {
				initChildInstance( this, Child, options );
			};
			proto = create( Parent.prototype );
			proto.constructor = Child;
			staticProperties = {
				// each component needs a guid, for managing CSS etc
				_guid: {
					value: getGuid()
				},
				// alias prototype as defaults
				defaults: {
					value: proto
				},
				// extendable
				extend: {
					value: extend,
					writable: true,
					configurable: true
				},
				// Parent - for IE8, can't use Object.getPrototypeOf
				_parent: {
					value: Parent
				}
			};
			defineProperties( Child, staticProperties );
			// extend configuration
			config.extend( Parent, proto, options );
			Viewmodel.extend( Parent, proto );
			// and any other properties or methods on options...
			childOptions.toPrototype( Parent.prototype, proto, options );
			Child.prototype = proto;
			return Child;
		};
	}( create, defineProperties, getGuid, config, initChildInstance, Viewmodel, childOptions );

	/* Ractive.js */
	var Ractive = function( defaults, easing, interpolators, svg, magic, defineProperties, proto, Promise, extendObj, extend, parse, initialise, circular ) {

		var Ractive, properties;
		// Main Ractive required object
		Ractive = function( options ) {
			initialise( this, options );
		};
		// Ractive properties
		properties = {
			// static methods:
			extend: {
				value: extend
			},
			parse: {
				value: parse
			},
			// Namespaced constructors
			Promise: {
				value: Promise
			},
			// support
			svg: {
				value: svg
			},
			magic: {
				value: magic
			},
			// version
			VERSION: {
				value: '0.5.5'
			},
			// Plugins
			adaptors: {
				writable: true,
				value: {}
			},
			components: {
				writable: true,
				value: {}
			},
			decorators: {
				writable: true,
				value: {}
			},
			easing: {
				writable: true,
				value: easing
			},
			events: {
				writable: true,
				value: {}
			},
			interpolators: {
				writable: true,
				value: interpolators
			},
			partials: {
				writable: true,
				value: {}
			},
			transitions: {
				writable: true,
				value: {}
			}
		};
		// Ractive properties
		defineProperties( Ractive, properties );
		Ractive.prototype = extendObj( proto, defaults );
		Ractive.prototype.constructor = Ractive;
		// alias prototype as defaults
		Ractive.defaults = Ractive.prototype;
		// Certain modules have circular dependencies. If we were bundling a
		// module loader, e.g. almond.js, this wouldn't be a problem, but we're
		// not - we're using amdclean as part of the build process. Because of
		// this, we need to wait until all modules have loaded before those
		// circular dependencies can be required.
		circular.Ractive = Ractive;
		while ( circular.length ) {
			circular.pop()();
		}
		// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
		// older browsers, these are made available via a shim - here, we do a quick
		// pre-flight check to make sure that either a) we're not in a shit browser,
		// or b) we're using a Ractive-legacy.js build
		var FUNCTION = 'function';
		if ( typeof Date.now !== FUNCTION || typeof String.prototype.trim !== FUNCTION || typeof Object.keys !== FUNCTION || typeof Array.prototype.indexOf !== FUNCTION || typeof Array.prototype.forEach !== FUNCTION || typeof Array.prototype.map !== FUNCTION || typeof Array.prototype.filter !== FUNCTION || typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION ) {
			throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
		}
		return Ractive;
	}( options, easing, interpolators, svg, magic, defineProperties, prototype, Promise, extend, Ractive_extend, parse, Ractive_initialise, circular );


	// export as Common JS module...
	if ( typeof module !== "undefined" && module.exports ) {
		module.exports = Ractive;
	}

	// ... or as AMD module
	else if ( typeof define === "function" && define.amd ) {
		define( function() {
			return Ractive;
		} );
	}

	// ... or as browser global
	global.Ractive = Ractive;

	Ractive.noConflict = function() {
		global.Ractive = noConflict;
		return Ractive;
	};

}( typeof window !== 'undefined' ? window : this ) );
;// Ractive adaptor plugin
// =======================
//
// This plugin allows you to have several Ractive instances sharing
// a single model, without using any third party libraries.
//
// Usage:
//
//     var ractiveOne = new Ractive({
//       el: 'one',
//       template: templateOne
//     });
//
//     var ractiveTwo = new Ractive({
//       el: 'two',
//       template: templateTwo,
//       data: ractiveOne,
//       adaptors: [ 'Ractive' ]
//     });
//
// Changes to either Ractive will be reflected in both.

(function () {

	var RactiveWrapper;

	Ractive.adaptors.Ractive = {
		filter: function ( object ) {
			return object instanceof Ractive;
		},
		wrap: function ( ractive, otherRactive, keypath, prefixer ) {
			return new RactiveWrapper( ractive, otherRactive, keypath, prefixer );
		}
	};

	RactiveWrapper = function ( ractive, otherRactive, keypath, prefixer ) {
		var wrapper = this;

		this.value = otherRactive;

		this.changeHandler = otherRactive.on( 'change', function ( changeHash ) {
			wrapper.shortCircuit = true;
			ractive.set( prefixer( changeHash ) );
			wrapper.shortCircuit = false;
		});

		this.resetHandler = otherRactive.on( 'reset', function ( newData ) {
			wrapper.shortCircuit = true;
			ractive.update( keypath );
			wrapper.shortCircuit = false;
		});
	};

	RactiveWrapper.prototype = {
		teardown: function () {
			this.changeHandler.cancel();
			this.resetHandler.cancel();
		},
		get: function () {
			return this.value.get();
		},
		set: function ( keypath, value ) {
			this.value.set( keypath, value );
		},
		reset: function ( object ) {
			// If the new object is a Backbone model, assume this one is
			// being retired. Ditto if it's not a model at all
			if ( object instanceof Ractive || typeof object !== 'object' ) {
				return false;
			}

			// Otherwise if this is a POJO, reset the model
			this.value.reset( object );
		}
	};

}());;/* Firebase v1.0.21 */ (function() {var h,aa=this;function n(a){return void 0!==a}function ba(){}function ca(a){a.sb=function(){return a.md?a.md:a.md=new a}}
function da(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ea(a){return"array"==da(a)}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length}function q(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ia(a,b,c){return a.call.apply(a.bind,arguments)}
function ja(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function r(a,b,c){r=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja;return r.apply(null,arguments)}
function ka(a,b){function c(){}c.prototype=b.prototype;a.me=b.prototype;a.prototype=new c;a.ke=function(a,c,f){return b.prototype[c].apply(a,Array.prototype.slice.call(arguments,2))}};function la(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function ma(){this.pc=void 0}
function na(a,b,c){switch(typeof b){case "string":oa(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],na(a,a.pc?a.pc.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),oa(f,c),
c.push(":"),na(a,a.pc?a.pc.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var pa={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},qa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function oa(a,b){b.push('"',a.replace(qa,function(a){if(a in pa)return pa[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return pa[a]=e+b.toString(16)}),'"')};function ra(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):la(a)}function u(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];na(new ma,a,b);a=b.join("")}return a};function sa(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,v(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b};var ta={};function x(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}
function y(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:ua.assert(!1,"errorPrefix_ called with argumentNumber > 4.  Need to update it?")}return a=a+" failed: "+(d+" argument ")}function z(a,b,c,d){if((!d||n(c))&&"function"!=da(c))throw Error(y(a,b,d)+"must be a valid function.");}
function va(a,b,c){if(n(c)&&(!ha(c)||null===c))throw Error(y(a,b,!0)+"must be a valid context object.");};function A(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function wa(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]};var ua={},xa=/[\[\].#$\/\u0000-\u001F\u007F]/,ya=/[\[\].#$\u0000-\u001F\u007F]/;function za(a){return q(a)&&0!==a.length&&!xa.test(a)}function Aa(a,b,c){c&&!n(b)||Ba(y(a,1,c),b)}
function Ba(a,b,c,d){c||(c=0);d=d||[];if(!n(b))throw Error(a+"contains undefined"+Ca(d));if("function"==da(b))throw Error(a+"contains a function"+Ca(d)+" with contents: "+b.toString());if(Da(b))throw Error(a+"contains "+b.toString()+Ca(d));if(1E3<c)throw new TypeError(a+"contains a cyclic object value ("+d.slice(0,100).join(".")+"...)");if(q(b)&&b.length>10485760/3&&10485760<sa(b).length)throw Error(a+"contains a string greater than 10485760 utf8 bytes"+Ca(d)+" ('"+b.substring(0,50)+"...')");if(ha(b))for(var e in b)if(A(b,
e)){var f=b[e];if(".priority"!==e&&".value"!==e&&".sv"!==e&&!za(e))throw Error(a+" contains an invalid key ("+e+")"+Ca(d)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');d.push(e);Ba(a,f,c+1,d);d.pop()}}function Ca(a){return 0==a.length?"":" in property '"+a.join(".")+"'"}function Ea(a,b){if(!ha(b)||ea(b))throw Error(y(a,1,!1)+" must be an Object containing the children to replace.");Aa(a,b,!1)}
function Fa(a,b,c,d){if(!(d&&!n(c)||null===c||ga(c)||q(c)||ha(c)&&A(c,".sv")))throw Error(y(a,b,d)+"must be a valid firebase priority (a string, number, or null).");}function Ga(a,b,c){if(!c||n(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(y(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}
function Ha(a,b){if(n(b)&&!za(b))throw Error(y(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}function Ia(a,b){if(!q(b)||0===b.length||ya.test(b))throw Error(y(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function B(a,b){if(".info"===C(b))throw Error(a+" failed: Can't modify data under /.info/");};function D(a,b,c,d,e,f,g){this.m=a;this.path=b;this.Ca=c;this.da=d;this.wa=e;this.Aa=f;this.Ya=g;if(n(this.da)&&n(this.Aa)&&n(this.Ca))throw"Query: Can't combine startAt(), endAt(), and limit().";}D.prototype.Uc=function(){x("Query.ref",0,0,arguments.length);return new E(this.m,this.path)};D.prototype.ref=D.prototype.Uc;
D.prototype.fb=function(a,b){x("Query.on",2,4,arguments.length);Ga("Query.on",a,!1);z("Query.on",2,b,!1);var c=Ja("Query.on",arguments[2],arguments[3]);this.m.Sb(this,a,b,c.cancel,c.Y);return b};D.prototype.on=D.prototype.fb;D.prototype.zb=function(a,b,c){x("Query.off",0,3,arguments.length);Ga("Query.off",a,!0);z("Query.off",2,b,!0);va("Query.off",3,c);this.m.oc(this,a,b,c)};D.prototype.off=D.prototype.zb;
D.prototype.Zd=function(a,b){function c(g){f&&(f=!1,e.zb(a,c),b.call(d.Y,g))}x("Query.once",2,4,arguments.length);Ga("Query.once",a,!1);z("Query.once",2,b,!1);var d=Ja("Query.once",arguments[2],arguments[3]),e=this,f=!0;this.fb(a,c,function(b){e.zb(a,c);d.cancel&&d.cancel.call(d.Y,b)})};D.prototype.once=D.prototype.Zd;
D.prototype.Sd=function(a){x("Query.limit",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw"Query.limit: First argument must be a positive integer.";return new D(this.m,this.path,a,this.da,this.wa,this.Aa,this.Ya)};D.prototype.limit=D.prototype.Sd;D.prototype.Ad=function(a,b){x("Query.startAt",0,2,arguments.length);Fa("Query.startAt",1,a,!0);Ha("Query.startAt",b);n(a)||(b=a=null);return new D(this.m,this.path,this.Ca,a,b,this.Aa,this.Ya)};D.prototype.startAt=D.prototype.Ad;
D.prototype.gd=function(a,b){x("Query.endAt",0,2,arguments.length);Fa("Query.endAt",1,a,!0);Ha("Query.endAt",b);return new D(this.m,this.path,this.Ca,this.da,this.wa,a,b)};D.prototype.endAt=D.prototype.gd;D.prototype.Kd=function(a,b){x("Query.equalTo",1,2,arguments.length);Fa("Query.equalTo",1,a,!1);Ha("Query.equalTo",b);return this.Ad(a,b).gd(a,b)};D.prototype.equalTo=D.prototype.Kd;
function Ka(a){var b={};n(a.da)&&(b.sp=a.da);n(a.wa)&&(b.sn=a.wa);n(a.Aa)&&(b.ep=a.Aa);n(a.Ya)&&(b.en=a.Ya);n(a.Ca)&&(b.l=a.Ca);n(a.da)&&n(a.wa)&&null===a.da&&null===a.wa&&(b.vf="l");return b}D.prototype.Qa=function(){var a=La(Ka(this));return"{}"===a?"default":a};
function Ja(a,b,c){var d={};if(b&&c)d.cancel=b,z(a,3,d.cancel,!0),d.Y=c,va(a,4,d.Y);else if(b)if("object"===typeof b&&null!==b)d.Y=b;else if("function"===typeof b)d.cancel=b;else throw Error(ta.le(a,3,!0)+"must either be a cancel callback or a context object.");return d};function F(a,b){if(1==arguments.length){this.o=a.split("/");for(var c=0,d=0;d<this.o.length;d++)0<this.o[d].length&&(this.o[c]=this.o[d],c++);this.o.length=c;this.U=0}else this.o=a,this.U=b}function C(a){return a.U>=a.o.length?null:a.o[a.U]}function Ma(a){var b=a.U;b<a.o.length&&b++;return new F(a.o,b)}function Na(a){return a.U<a.o.length?a.o[a.o.length-1]:null}h=F.prototype;h.toString=function(){for(var a="",b=this.U;b<this.o.length;b++)""!==this.o[b]&&(a+="/"+this.o[b]);return a||"/"};
h.parent=function(){if(this.U>=this.o.length)return null;for(var a=[],b=this.U;b<this.o.length-1;b++)a.push(this.o[b]);return new F(a,0)};h.G=function(a){for(var b=[],c=this.U;c<this.o.length;c++)b.push(this.o[c]);if(a instanceof F)for(c=a.U;c<a.o.length;c++)b.push(a.o[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new F(b,0)};h.f=function(){return this.U>=this.o.length};h.length=function(){return this.o.length-this.U};
function Oa(a,b){var c=C(a);if(null===c)return b;if(c===C(b))return Oa(Ma(a),Ma(b));throw"INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")";}h.contains=function(a){var b=this.U,c=a.U;if(this.length()>a.length())return!1;for(;b<this.o.length;){if(this.o[b]!==a.o[c])return!1;++b;++c}return!0};function Pa(){this.children={};this.Ac=0;this.value=null}function Qa(a,b,c){this.Da=a?a:"";this.Fb=b?b:null;this.C=c?c:new Pa}function I(a,b){for(var c=b instanceof F?b:new F(b),d=a,e;null!==(e=C(c));)d=new Qa(e,d,wa(d.C.children,e)||new Pa),c=Ma(c);return d}h=Qa.prototype;h.j=function(){return this.C.value};function J(a,b){v("undefined"!==typeof b,"Cannot set value to undefined");a.C.value=b;Ra(a)}h.tb=function(){return 0<this.C.Ac};h.f=function(){return null===this.j()&&!this.tb()};
h.A=function(a){for(var b in this.C.children)a(new Qa(b,this,this.C.children[b]))};function Sa(a,b,c,d){c&&!d&&b(a);a.A(function(a){Sa(a,b,!0,d)});c&&d&&b(a)}function Ta(a,b,c){for(a=c?a:a.parent();null!==a;){if(b(a))return!0;a=a.parent()}return!1}h.path=function(){return new F(null===this.Fb?this.Da:this.Fb.path()+"/"+this.Da)};h.name=function(){return this.Da};h.parent=function(){return this.Fb};
function Ra(a){if(null!==a.Fb){var b=a.Fb,c=a.Da,d=a.f(),e=A(b.C.children,c);d&&e?(delete b.C.children[c],b.C.Ac--,Ra(b)):d||e||(b.C.children[c]=a.C,b.C.Ac++,Ra(b))}};function Ua(a,b){this.Va=a?a:Va;this.ca=b?b:Wa}function Va(a,b){return a<b?-1:a>b?1:0}h=Ua.prototype;h.qa=function(a,b){return new Ua(this.Va,this.ca.qa(a,b,this.Va).J(null,null,!1,null,null))};h.remove=function(a){return new Ua(this.Va,this.ca.remove(a,this.Va).J(null,null,!1,null,null))};h.get=function(a){for(var b,c=this.ca;!c.f();){b=this.Va(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
function Xa(a,b){for(var c,d=a.ca,e=null;!d.f();){c=a.Va(b,d.key);if(0===c){if(d.left.f())return e?e.key:null;for(d=d.left;!d.right.f();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}h.f=function(){return this.ca.f()};h.count=function(){return this.ca.count()};h.yb=function(){return this.ca.yb()};h.bb=function(){return this.ca.bb()};h.Ba=function(a){return this.ca.Ba(a)};h.Ra=function(a){return this.ca.Ra(a)};
h.ab=function(a){return new Ya(this.ca,a)};function Ya(a,b){this.vd=b;for(this.cc=[];!a.f();)this.cc.push(a),a=a.left}function Za(a){if(0===a.cc.length)return null;var b=a.cc.pop(),c;c=a.vd?a.vd(b.key,b.value):{key:b.key,value:b.value};for(b=b.right;!b.f();)a.cc.push(b),b=b.left;return c}function $a(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:Wa;this.right=null!=e?e:Wa}h=$a.prototype;
h.J=function(a,b,c,d,e){return new $a(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};h.count=function(){return this.left.count()+1+this.right.count()};h.f=function(){return!1};h.Ba=function(a){return this.left.Ba(a)||a(this.key,this.value)||this.right.Ba(a)};h.Ra=function(a){return this.right.Ra(a)||a(this.key,this.value)||this.left.Ra(a)};function cb(a){return a.left.f()?a:cb(a.left)}h.yb=function(){return cb(this).key};
h.bb=function(){return this.right.f()?this.key:this.right.bb()};h.qa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.J(null,null,null,e.left.qa(a,b,c),null):0===d?e.J(null,b,null,null,null):e.J(null,null,null,null,e.right.qa(a,b,c));return db(e)};function eb(a){if(a.left.f())return Wa;a.left.P()||a.left.left.P()||(a=fb(a));a=a.J(null,null,null,eb(a.left),null);return db(a)}
h.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.f()||c.left.P()||c.left.left.P()||(c=fb(c)),c=c.J(null,null,null,c.left.remove(a,b),null);else{c.left.P()&&(c=gb(c));c.right.f()||c.right.P()||c.right.left.P()||(c=hb(c),c.left.left.P()&&(c=gb(c),c=hb(c)));if(0===b(a,c.key)){if(c.right.f())return Wa;d=cb(c.right);c=c.J(d.key,d.value,null,null,eb(c.right))}c=c.J(null,null,null,null,c.right.remove(a,b))}return db(c)};h.P=function(){return this.color};
function db(a){a.right.P()&&!a.left.P()&&(a=ib(a));a.left.P()&&a.left.left.P()&&(a=gb(a));a.left.P()&&a.right.P()&&(a=hb(a));return a}function fb(a){a=hb(a);a.right.left.P()&&(a=a.J(null,null,null,null,gb(a.right)),a=ib(a),a=hb(a));return a}function ib(a){return a.right.J(null,null,a.color,a.J(null,null,!0,null,a.right.left),null)}function gb(a){return a.left.J(null,null,a.color,null,a.J(null,null,!0,a.left.right,null))}
function hb(a){return a.J(null,null,!a.color,a.left.J(null,null,!a.left.color,null,null),a.right.J(null,null,!a.right.color,null,null))}function jb(){}h=jb.prototype;h.J=function(){return this};h.qa=function(a,b){return new $a(a,b,null)};h.remove=function(){return this};h.count=function(){return 0};h.f=function(){return!0};h.Ba=function(){return!1};h.Ra=function(){return!1};h.yb=function(){return null};h.bb=function(){return null};h.P=function(){return!1};var Wa=new jb;function kb(a){this.Xb=a;this.kc="firebase:"}kb.prototype.set=function(a,b){null==b?this.Xb.removeItem(this.kc+a):this.Xb.setItem(this.kc+a,u(b))};kb.prototype.get=function(a){a=this.Xb.getItem(this.kc+a);return null==a?null:ra(a)};kb.prototype.remove=function(a){this.Xb.removeItem(this.kc+a)};kb.prototype.od=!1;function lb(){this.ob={}}lb.prototype.set=function(a,b){null==b?delete this.ob[a]:this.ob[a]=b};lb.prototype.get=function(a){return A(this.ob,a)?this.ob[a]:null};lb.prototype.remove=function(a){delete this.ob[a]};lb.prototype.od=!0;function mb(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new kb(b)}}catch(c){}return new lb}var nb=mb("localStorage"),ob=mb("sessionStorage");function pb(a,b,c,d){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.qc=b;this.bc=c;this.ie=d;this.ga=nb.get("host:"+a)||this.host}function qb(a,b){b!==a.ga&&(a.ga=b,"s-"===a.ga.substr(0,2)&&nb.set("host:"+a.host,a.ga))}pb.prototype.toString=function(){return(this.qc?"https://":"http://")+this.host};"use strict";function rb(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=Math.round(c/1099511627776)||32,e;if(32===d)e=a.concat(b);else{e=b;var c=c|0,f=a.slice(0,a.length-1),g;for(void 0===f&&(f=[]);32<=d;d-=32)f.push(c),c=0;if(0===d)e=f.concat(e);else{for(g=0;g<e.length;g++)f.push(c|e[g]>>>d),c=e[g]<<32-d;g=e.length?e[e.length-1]:0;e=Math.round(g/1099511627776)||32;f.push(sb(d+e&31,32<d+e?c:f.pop(),1));e=f}}return e}
function tb(a){var b=a.length;return 0===b?0:32*(b-1)+(Math.round(a[b-1]/1099511627776)||32)}function sb(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+1099511627776*a}function ub(a){var b,c="",d=0,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",f=0,g=tb(a);b&&(e=e.substr(0,62)+"-_");for(b=0;6*c.length<g;)c+=e.charAt((f^a[b]>>>d)>>>26),6>d?(f=a[b]<<6-d,d+=26,b++):(f<<=6,d-=6);for(;c.length&3;)c+="=";return c}
function vb(a){a?(this.Tb=a.Tb.slice(0),this.nb=a.nb.slice(0),this.Ua=a.Ua):this.reset()}function wb(a){a=(new vb).update(a);var b,c=a.nb,d=a.Tb,c=rb(c,[sb(1,1)]);for(b=c.length+2;b&15;b++)c.push(0);c.push(Math.floor(a.Ua/4294967296));for(c.push(a.Ua|0);c.length;)xb(a,c.splice(0,16));a.reset();return d}
vb.prototype={zc:512,reset:function(){this.Tb=this.Md.slice(0);this.nb=[];this.Ua=0;return this},update:function(a){if("string"===typeof a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sb(8*(c&3),d));a=b}c=this.nb=rb(this.nb,a);b=this.Ua;a=this.Ua=b+tb(a);for(b=this.zc+b&-this.zc;b<=a;b+=this.zc)xb(this,c.splice(0,16));return this},Md:[1732584193,4023233417,2562383102,271733878,3285377520],Pd:[1518500249,1859775393,
2400959708,3395469782]};function xb(a,b){var c,d,e,f,g,k,l,m=b.slice(0),p=a.Tb;e=p[0];f=p[1];g=p[2];k=p[3];l=p[4];for(c=0;79>=c;c++)16<=c&&(m[c]=(m[c-3]^m[c-8]^m[c-14]^m[c-16])<<1|(m[c-3]^m[c-8]^m[c-14]^m[c-16])>>>31),d=19>=c?f&g|~f&k:39>=c?f^g^k:59>=c?f&g|f&k|g&k:79>=c?f^g^k:void 0,d=(e<<5|e>>>27)+d+l+m[c]+a.Pd[Math.floor(c/20)]|0,l=k,k=g,g=f<<30|f>>>2,f=e,e=d;p[0]=p[0]+e|0;p[1]=p[1]+f|0;p[2]=p[2]+g|0;p[3]=p[3]+k|0;p[4]=p[4]+l|0};var yb=Array.prototype,zb=yb.forEach?function(a,b,c){yb.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Ab=yb.map?function(a,b,c){return yb.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=q(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Bb=yb.reduce?function(a,b,c,d){d&&(b=r(b,d));return yb.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;zb(a,function(c,g){e=b.call(d,e,c,g,a)});return e},
Cb=yb.every?function(a,b,c){return yb.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Db(a,b){var c;a:{c=a.length;for(var d=q(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:q(a)?a.charAt(c):a[c]};var Eb;a:{var Fb=aa.navigator;if(Fb){var Gb=Fb.userAgent;if(Gb){Eb=Gb;break a}}Eb=""}function Hb(a){return-1!=Eb.indexOf(a)};var Ib=Hb("Opera")||Hb("OPR"),Jb=Hb("Trident")||Hb("MSIE"),Kb=Hb("Gecko")&&-1==Eb.toLowerCase().indexOf("webkit")&&!(Hb("Trident")||Hb("MSIE")),Lb=-1!=Eb.toLowerCase().indexOf("webkit");(function(){var a="",b;if(Ib&&aa.opera)return a=aa.opera.version,"function"==da(a)?a():a;Kb?b=/rv\:([^\);]+)(\)|;)/:Jb?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Lb&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(Eb))?a[1]:"");return Jb&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var Mb=null,Nb=null;var Ob=function(){var a=1;return function(){return a++}}();function v(a,b){if(!a)throw Error("Firebase INTERNAL ASSERT FAILED:"+b);}function Pb(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+Pb.apply(null,arguments[c]):"object"===typeof arguments[c]?b+u(arguments[c]):b+arguments[c],b+=" ";return b}var Qb=null,Rb=!0;function K(a){!0===Rb&&(Rb=!1,null===Qb&&!0===ob.get("logging_enabled")&&Sb(!0));if(Qb){var b=Pb.apply(null,arguments);Qb(b)}}
function Tb(a){return function(){K(a,arguments)}}function Ub(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+Pb.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function Vb(a){var b=Pb.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function L(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+Pb.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
function Da(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}function Wb(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
function Xb(a,b){return a!==b?null===a?-1:null===b?1:typeof a!==typeof b?"number"===typeof a?-1:1:a>b?1:-1:0}function Yb(a,b){if(a===b)return 0;var c=Zb(a),d=Zb(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function $b(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+u(b));}
function La(a){if("object"!==typeof a||null===a)return u(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=u(b[d]),c+=":",c+=La(a[b[d]]);return c+"}"}function ac(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function bc(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else cc(a,b)}function dc(a,b){return b?r(a,b):a}
function ec(a){v(!Da(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;a-=1)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;a-=1)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
(d="0"+d),c+=d;return c.toLowerCase()}function fc(a){var b="Unknown Error";"too_big"===a?b="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==a?b="Client doesn't have permission to access the desired data.":"unavailable"==a&&(b="The service is unavailable");b=Error(a+": "+b);b.code=a.toUpperCase();return b}var gc=/^-?\d{1,10}$/;function Zb(a){return gc.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}
function ic(a){try{a()}catch(b){setTimeout(function(){throw b;},Math.floor(0))}};function jc(a,b){this.F=a;v(null!==this.F,"LeafNode shouldn't be created with null value.");this.gb="undefined"!==typeof b?b:null}h=jc.prototype;h.O=function(){return!0};h.k=function(){return this.gb};h.Ga=function(a){return new jc(this.F,a)};h.N=function(){return M};h.K=function(a){return null===C(a)?this:M};h.fa=function(){return null};h.H=function(a,b){return(new N).H(a,b).Ga(this.gb)};h.ya=function(a,b){var c=C(a);return null===c?b:this.H(c,M.ya(Ma(a),b))};h.f=function(){return!1};h.dc=function(){return 0};
h.V=function(a){return a&&null!==this.k()?{".value":this.j(),".priority":this.k()}:this.j()};h.hash=function(){var a="";null!==this.k()&&(a+="priority:"+kc(this.k())+":");var b=typeof this.F,a=a+(b+":"),a="number"===b?a+ec(this.F):a+this.F;return ub(wb(a))};h.j=function(){return this.F};h.toString=function(){return"string"===typeof this.F?this.F:'"'+this.F+'"'};function lc(a,b){return Xb(a.ja,b.ja)||Yb(a.name,b.name)}function mc(a,b){return Yb(a.name,b.name)}function nc(a,b){return Yb(a,b)};function N(a,b){this.n=a||new Ua(nc);this.gb="undefined"!==typeof b?b:null}h=N.prototype;h.O=function(){return!1};h.k=function(){return this.gb};h.Ga=function(a){return new N(this.n,a)};h.H=function(a,b){var c=this.n.remove(a);b&&b.f()&&(b=null);null!==b&&(c=c.qa(a,b));return b&&null!==b.k()?new oc(c,null,this.gb):new N(c,this.gb)};h.ya=function(a,b){var c=C(a);if(null===c)return b;var d=this.N(c).ya(Ma(a),b);return this.H(c,d)};h.f=function(){return this.n.f()};h.dc=function(){return this.n.count()};
var pc=/^\d+$/;h=N.prototype;h.V=function(a){if(this.f())return null;var b={},c=0,d=0,e=!0;this.A(function(f,g){b[f]=g.V(a);c++;e&&pc.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],g;for(g in b)f[g]=b[g];return f}a&&null!==this.k()&&(b[".priority"]=this.k());return b};h.hash=function(){var a="";null!==this.k()&&(a+="priority:"+kc(this.k())+":");this.A(function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});return""===a?"":ub(wb(a))};
h.N=function(a){a=this.n.get(a);return null===a?M:a};h.K=function(a){var b=C(a);return null===b?this:this.N(b).K(Ma(a))};h.fa=function(a){return Xa(this.n,a)};h.jd=function(){return this.n.yb()};h.ld=function(){return this.n.bb()};h.A=function(a){return this.n.Ba(a)};h.Fc=function(a){return this.n.Ra(a)};h.ab=function(){return this.n.ab()};h.toString=function(){var a="{",b=!0;this.A(function(c,d){b?b=!1:a+=", ";a+='"'+c+'" : '+d.toString()});return a+="}"};var M=new N;function oc(a,b,c){N.call(this,a,c);null===b&&(b=new Ua(lc),a.Ba(function(a,c){b=b.qa({name:a,ja:c.k()},c)}));this.va=b}ka(oc,N);h=oc.prototype;h.H=function(a,b){var c=this.N(a),d=this.n,e=this.va;null!==c&&(d=d.remove(a),e=e.remove({name:a,ja:c.k()}));b&&b.f()&&(b=null);null!==b&&(d=d.qa(a,b),e=e.qa({name:a,ja:b.k()},b));return new oc(d,e,this.k())};h.fa=function(a,b){var c=Xa(this.va,{name:a,ja:b.k()});return c?c.name:null};h.A=function(a){return this.va.Ba(function(b,c){return a(b.name,c)})};
h.Fc=function(a){return this.va.Ra(function(b,c){return a(b.name,c)})};h.ab=function(){return this.va.ab(function(a,b){return{key:a.name,value:b}})};h.jd=function(){return this.va.f()?null:this.va.yb().name};h.ld=function(){return this.va.f()?null:this.va.bb().name};function O(a,b){if(null===a)return M;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);v(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new jc(a,c);if(a instanceof Array){var d=M,e=a;cc(e,function(a,b){if(A(e,b)&&"."!==b.substring(0,1)){var c=O(a);if(c.O()||!c.f())d=
d.H(b,c)}});return d.Ga(c)}var f=[],g={},k=!1,l=a;bc(l,function(a,b){if("string"!==typeof b||"."!==b.substring(0,1)){var c=O(l[b]);c.f()||(k=k||null!==c.k(),f.push({name:b,ja:c.k()}),g[b]=c)}});var m=qc(f,g,!1);if(k){var p=qc(f,g,!0);return new oc(m,p,c)}return new N(m,c)}var rc=Math.log(2);function sc(a){this.count=parseInt(Math.log(a+1)/rc,10);this.ed=this.count-1;this.Hd=a+1&parseInt(Array(this.count+1).join("1"),2)}function tc(a){var b=!(a.Hd&1<<a.ed);a.ed--;return b}
function qc(a,b,c){function d(e,f){var l=f-e;if(0==l)return null;if(1==l){var l=a[e].name,m=c?a[e]:l;return new $a(m,b[l],!1,null,null)}var m=parseInt(l/2,10)+e,p=d(e,m),t=d(m+1,f),l=a[m].name,m=c?a[m]:l;return new $a(m,b[l],!1,p,t)}var e=c?lc:mc;a.sort(e);var f=function(e){function f(e,g){var k=p-e,t=p;p-=e;var s=a[k].name,k=new $a(c?a[k]:s,b[s],g,null,d(k+1,t));l?l.left=k:m=k;l=k}for(var l=null,m=null,p=a.length,t=0;t<e.count;++t){var s=tc(e),w=Math.pow(2,e.count-(t+1));s?f(w,!1):(f(w,!1),f(w,!0))}return m}(new sc(a.length)),
e=c?lc:nc;return null!==f?new Ua(e,f):new Ua(e)}function kc(a){return"number"===typeof a?"number:"+ec(a):"string:"+a};function P(a,b){this.C=a;this.nc=b}P.prototype.V=function(){x("Firebase.DataSnapshot.val",0,0,arguments.length);return this.C.V()};P.prototype.val=P.prototype.V;P.prototype.Ld=function(){x("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.C.V(!0)};P.prototype.exportVal=P.prototype.Ld;P.prototype.G=function(a){x("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));Ia("Firebase.DataSnapshot.child",a);var b=new F(a),c=this.nc.G(b);return new P(this.C.K(b),c)};
P.prototype.child=P.prototype.G;P.prototype.Ic=function(a){x("Firebase.DataSnapshot.hasChild",1,1,arguments.length);Ia("Firebase.DataSnapshot.hasChild",a);var b=new F(a);return!this.C.K(b).f()};P.prototype.hasChild=P.prototype.Ic;P.prototype.k=function(){x("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.C.k()};P.prototype.getPriority=P.prototype.k;
P.prototype.forEach=function(a){x("Firebase.DataSnapshot.forEach",1,1,arguments.length);z("Firebase.DataSnapshot.forEach",1,a,!1);if(this.C.O())return!1;var b=this;return this.C.A(function(c,d){return a(new P(d,b.nc.G(c)))})};P.prototype.forEach=P.prototype.forEach;P.prototype.tb=function(){x("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.C.O()?!1:!this.C.f()};P.prototype.hasChildren=P.prototype.tb;
P.prototype.name=function(){x("Firebase.DataSnapshot.name",0,0,arguments.length);return this.nc.name()};P.prototype.name=P.prototype.name;P.prototype.dc=function(){x("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.C.dc()};P.prototype.numChildren=P.prototype.dc;P.prototype.Uc=function(){x("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.nc};P.prototype.ref=P.prototype.Uc;function uc(a){v(ea(a)&&0<a.length,"Requires a non-empty array");this.Gd=a;this.xb={}}uc.prototype.bd=function(a,b){for(var c=this.xb[a]||[],d=0;d<c.length;d++)c[d].aa.apply(c[d].Y,Array.prototype.slice.call(arguments,1))};uc.prototype.fb=function(a,b,c){vc(this,a);this.xb[a]=this.xb[a]||[];this.xb[a].push({aa:b,Y:c});(a=this.kd(a))&&b.apply(c,a)};uc.prototype.zb=function(a,b,c){vc(this,a);a=this.xb[a]||[];for(var d=0;d<a.length;d++)if(a[d].aa===b&&(!c||c===a[d].Y)){a.splice(d,1);break}};
function vc(a,b){v(Db(a.Gd,function(a){return a===b}),"Unknown event: "+b)};function wc(){uc.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.lb=!0;if(b){var c=this;document.addEventListener(b,
function(){var b=!document[a];b!==c.lb&&(c.lb=b,c.bd("visible",b))},!1)}}ka(wc,uc);ca(wc);wc.prototype.kd=function(a){v("visible"===a,"Unknown event type: "+a);return[this.lb]};function xc(){uc.call(this,["online"]);this.Db=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener){var a=this;window.addEventListener("online",function(){a.Db||a.bd("online",!0);a.Db=!0},!1);window.addEventListener("offline",function(){a.Db&&a.bd("online",!1);a.Db=!1},!1)}}ka(xc,uc);ca(xc);xc.prototype.kd=function(a){v("online"===a,"Unknown event type: "+a);return[this.Db]};function cc(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function yc(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function zc(a){var b={},c;for(c in a)b[c]=a[c];return b};function Ac(){this.pb={}}function Bc(a,b,c){n(c)||(c=1);A(a.pb,b)||(a.pb[b]=0);a.pb[b]+=c}Ac.prototype.get=function(){return zc(this.pb)};function Cc(a){this.Id=a;this.Zb=null}Cc.prototype.get=function(){var a=this.Id.get(),b=zc(a);if(this.Zb)for(var c in this.Zb)b[c]-=this.Zb[c];this.Zb=a;return b};function Dc(a,b){this.Zc={};this.tc=new Cc(a);this.u=b;var c=1E4+2E4*Math.random();setTimeout(r(this.td,this),Math.floor(c))}Dc.prototype.td=function(){var a=this.tc.get(),b={},c=!1,d;for(d in a)0<a[d]&&A(this.Zc,d)&&(b[d]=a[d],c=!0);c&&(a=this.u,a.R&&(b={c:b},a.e("reportStats",b),a.Ea("s",b)));setTimeout(r(this.td,this),Math.floor(6E5*Math.random()))};var Ec={},Fc={};function Gc(a){a=a.toString();Ec[a]||(Ec[a]=new Ac);return Ec[a]}function Hc(a,b){var c=a.toString();Fc[c]||(Fc[c]=b());return Fc[c]};var Ic=null;"undefined"!==typeof MozWebSocket?Ic=MozWebSocket:"undefined"!==typeof WebSocket&&(Ic=WebSocket);function Q(a,b,c){this.Cc=a;this.e=Tb(this.Cc);this.frames=this.vb=null;this.Ha=this.Ia=this.ad=0;this.ea=Gc(b);this.Wa=(b.qc?"wss://":"ws://")+b.ga+"/.ws?v=5";b.host!==b.ga&&(this.Wa=this.Wa+"&ns="+b.bc);c&&(this.Wa=this.Wa+"&s="+c)}var Jc;
Q.prototype.open=function(a,b){this.ia=b;this.Wd=a;this.e("Websocket connecting to "+this.Wa);this.W=new Ic(this.Wa);this.qb=!1;nb.set("previous_websocket_failure",!0);var c=this;this.W.onopen=function(){c.e("Websocket connected.");c.qb=!0};this.W.onclose=function(){c.e("Websocket connection was disconnected.");c.W=null;c.Pa()};this.W.onmessage=function(a){if(null!==c.W)if(a=a.data,c.Ha+=a.length,Bc(c.ea,"bytes_received",a.length),Kc(c),null!==c.frames)Lc(c,a);else{a:{v(null===c.frames,"We already have a frame buffer");
if(6>=a.length){var b=Number(a);if(!isNaN(b)){c.ad=b;c.frames=[];a=null;break a}}c.ad=1;c.frames=[]}null!==a&&Lc(c,a)}};this.W.onerror=function(a){c.e("WebSocket error.  Closing connection.");(a=a.message||a.data)&&c.e(a);c.Pa()}};Q.prototype.start=function(){};Q.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==Ic&&!Jc};
Q.responsesRequiredToBeHealthy=2;Q.healthyTimeout=3E4;h=Q.prototype;h.$b=function(){nb.remove("previous_websocket_failure")};function Lc(a,b){a.frames.push(b);if(a.frames.length==a.ad){var c=a.frames.join("");a.frames=null;c=ra(c);a.Wd(c)}}h.send=function(a){Kc(this);a=u(a);this.Ia+=a.length;Bc(this.ea,"bytes_sent",a.length);a=ac(a,16384);1<a.length&&this.W.send(String(a.length));for(var b=0;b<a.length;b++)this.W.send(a[b])};
h.Nb=function(){this.Ma=!0;this.vb&&(clearInterval(this.vb),this.vb=null);this.W&&(this.W.close(),this.W=null)};h.Pa=function(){this.Ma||(this.e("WebSocket is closing itself"),this.Nb(),this.ia&&(this.ia(this.qb),this.ia=null))};h.close=function(){this.Ma||(this.e("WebSocket is being closed"),this.Nb())};function Kc(a){clearInterval(a.vb);a.vb=setInterval(function(){a.W&&a.W.send("0");Kc(a)},Math.floor(45E3))};function Mc(a){this.Pc=a;this.jc=[];this.Xa=0;this.Bc=-1;this.Oa=null}function Nc(a,b,c){a.Bc=b;a.Oa=c;a.Bc<a.Xa&&(a.Oa(),a.Oa=null)}function Oc(a,b,c){for(a.jc[b]=c;a.jc[a.Xa];){var d=a.jc[a.Xa];delete a.jc[a.Xa];for(var e=0;e<d.length;++e)if(d[e]){var f=a;ic(function(){f.Pc(d[e])})}if(a.Xa===a.Bc){a.Oa&&(clearTimeout(a.Oa),a.Oa(),a.Oa=null);break}a.Xa++}};function Pc(){this.set={}}h=Pc.prototype;h.add=function(a,b){this.set[a]=null!==b?b:!0};h.contains=function(a){return A(this.set,a)};h.get=function(a){return this.contains(a)?this.set[a]:void 0};h.remove=function(a){delete this.set[a]};h.f=function(){var a;a:{a=this.set;for(var b in a){a=!1;break a}a=!0}return a};h.count=function(){var a=this.set,b=0,c;for(c in a)b++;return b};function R(a,b){cc(a.set,function(a,d){b(d,a)})}h.keys=function(){var a=[];cc(this.set,function(b,c){a.push(c)});return a};function Qc(a,b,c){this.Cc=a;this.e=Tb(a);this.Ha=this.Ia=0;this.ea=Gc(b);this.sc=c;this.qb=!1;this.Rb=function(a){b.host!==b.ga&&(a.ns=b.bc);var c=[],f;for(f in a)a.hasOwnProperty(f)&&c.push(f+"="+a[f]);return(b.qc?"https://":"http://")+b.ga+"/.lp?"+c.join("&")}}var Rc,Sc;
Qc.prototype.open=function(a,b){this.dd=0;this.S=b;this.pd=new Mc(a);this.Ma=!1;var c=this;this.Ja=setTimeout(function(){c.e("Timed out trying to connect.");c.Pa();c.Ja=null},Math.floor(3E4));Wb(function(){if(!c.Ma){c.la=new Tc(function(a,b,d,k,l){Uc(c,arguments);if(c.la)if(c.Ja&&(clearTimeout(c.Ja),c.Ja=null),c.qb=!0,"start"==a)c.id=b,c.sd=d;else if("close"===a)b?(c.la.rc=!1,Nc(c.pd,b,function(){c.Pa()})):c.Pa();else throw Error("Unrecognized command received: "+a);},function(a,b){Uc(c,arguments);
Oc(c.pd,a,b)},function(){c.Pa()},c.Rb);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.la.uc&&(a.cb=c.la.uc);a.v="5";c.sc&&(a.s=c.sc);a=c.Rb(a);c.e("Connecting via long-poll to "+a);Vc(c.la,a,function(){})}})};Qc.prototype.start=function(){var a=this.la,b=this.sd;a.Ud=this.id;a.Vd=b;for(a.xc=!0;Wc(a););a=this.id;b=this.sd;this.eb=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.eb.src=this.Rb(c);this.eb.style.display="none";document.body.appendChild(this.eb)};
Qc.isAvailable=function(){return!Sc&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.je)&&(Rc||!0)};h=Qc.prototype;h.$b=function(){};h.Nb=function(){this.Ma=!0;this.la&&(this.la.close(),this.la=null);this.eb&&(document.body.removeChild(this.eb),this.eb=null);this.Ja&&(clearTimeout(this.Ja),this.Ja=null)};
h.Pa=function(){this.Ma||(this.e("Longpoll is closing itself"),this.Nb(),this.S&&(this.S(this.qb),this.S=null))};h.close=function(){this.Ma||(this.e("Longpoll is being closed."),this.Nb())};
h.send=function(a){a=u(a);this.Ia+=a.length;Bc(this.ea,"bytes_sent",a.length);a=sa(a);if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");if(!Mb){Mb={};Nb={};for(var b=0;65>b;b++)Mb[b]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b),Nb[b]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(b)}for(var b=Nb,c=[],d=0;d<a.length;d+=3){var e=a[d],f=d+1<a.length,g=f?a[d+1]:0,k=d+2<a.length,l=k?a[d+2]:0,m=e>>2,e=(e&3)<<4|g>>4,g=(g&15)<<
2|l>>6,l=l&63;k||(l=64,f||(g=64));c.push(b[m],b[e],b[g],b[l])}a=ac(c.join(""),1840);for(b=0;b<a.length;b++)c=this.la,c.Hb.push({de:this.dd,he:a.length,fd:a[b]}),c.xc&&Wc(c),this.dd++};function Uc(a,b){var c=u(b).length;a.Ha+=c;Bc(a.ea,"bytes_received",c)}
function Tc(a,b,c,d){this.Rb=d;this.ia=c;this.Rc=new Pc;this.Hb=[];this.Dc=Math.floor(1E8*Math.random());this.rc=!0;this.uc=Ob();window["pLPCommand"+this.uc]=a;window["pRTLPCB"+this.uc]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||K("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
a.contentDocument?a.za=a.contentDocument:a.contentWindow?a.za=a.contentWindow.document:a.document&&(a.za=a.document);this.Z=a;a="";this.Z.src&&"javascript:"===this.Z.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Z.za.open(),this.Z.za.write(a),this.Z.za.close()}catch(f){K("frame writing exception"),f.stack&&K(f.stack),K(f)}}
Tc.prototype.close=function(){this.xc=!1;if(this.Z){this.Z.za.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Z&&(document.body.removeChild(a.Z),a.Z=null)},Math.floor(0))}var b=this.ia;b&&(this.ia=null,b())};
function Wc(a){if(a.xc&&a.rc&&a.Rc.count()<(0<a.Hb.length?2:1)){a.Dc++;var b={};b.id=a.Ud;b.pw=a.Vd;b.ser=a.Dc;for(var b=a.Rb(b),c="",d=0;0<a.Hb.length;)if(1870>=a.Hb[0].fd.length+30+c.length){var e=a.Hb.shift(),c=c+"&seg"+d+"="+e.de+"&ts"+d+"="+e.he+"&d"+d+"="+e.fd;d++}else break;Zc(a,b+c,a.Dc);return!0}return!1}function Zc(a,b,c){function d(){a.Rc.remove(c);Wc(a)}a.Rc.add(c);var e=setTimeout(d,Math.floor(25E3));Vc(a,b,function(){clearTimeout(e);d()})}
function Vc(a,b,c){setTimeout(function(){try{if(a.rc){var d=a.Z.za.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){K("Long-poll script failed to load: "+b);a.rc=!1;a.close()};a.Z.za.body.appendChild(d)}}catch(e){}},Math.floor(1))};function $c(a){ad(this,a)}var bd=[Qc,Q];function ad(a,b){var c=Q&&Q.isAvailable(),d=c&&!(nb.od||!0===nb.get("previous_websocket_failure"));b.ie&&(c||L("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.Ob=[Q];else{var e=a.Ob=[];bc(bd,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function cd(a){if(0<a.Ob.length)return a.Ob[0];throw Error("No transports available");};function dd(a,b,c,d,e,f){this.id=a;this.e=Tb("c:"+this.id+":");this.Pc=c;this.Cb=d;this.S=e;this.Oc=f;this.M=b;this.ic=[];this.cd=0;this.Cd=new $c(b);this.ma=0;this.e("Connection created");ed(this)}
function ed(a){var b=cd(a.Cd);a.B=new b("c:"+a.id+":"+a.cd++,a.M);a.Tc=b.responsesRequiredToBeHealthy||0;var c=fd(a,a.B),d=gd(a,a.B);a.Pb=a.B;a.Mb=a.B;a.w=null;a.Na=!1;setTimeout(function(){a.B&&a.B.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.Yb=setTimeout(function(){a.Yb=null;a.Na||(a.B&&102400<a.B.Ha?(a.e("Connection exceeded healthy timeout but has received "+a.B.Ha+" bytes.  Marking connection healthy."),a.Na=!0,a.B.$b()):a.B&&10240<a.B.Ia?a.e("Connection exceeded healthy timeout but has sent "+
a.B.Ia+" bytes.  Leaving connection alive."):(a.e("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function gd(a,b){return function(c){b===a.B?(a.B=null,c||0!==a.ma?1===a.ma&&a.e("Realtime connection lost."):(a.e("Realtime connection failed."),"s-"===a.M.ga.substr(0,2)&&(nb.remove("host:"+a.M.host),a.M.ga=a.M.host)),a.close()):b===a.w?(a.e("Secondary connection lost."),c=a.w,a.w=null,a.Pb!==c&&a.Mb!==c||a.close()):a.e("closing an old connection")}}
function fd(a,b){return function(c){if(2!=a.ma)if(b===a.Mb){var d=$b("t",c);c=$b("d",c);if("c"==d){if(d=$b("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.sc=c.s;qb(a.M,f);0==a.ma&&(a.B.start(),hd(a,a.B,d),"5"!==e&&L("Protocol version mismatch detected"),c=a.Cd,(c=1<c.Ob.length?c.Ob[1]:null)&&id(a,c))}else if("n"===d){a.e("recvd end transmission on primary");a.Mb=a.w;for(c=0;c<a.ic.length;++c)a.gc(a.ic[c]);a.ic=[];jd(a)}else"s"===d?(a.e("Connection shutdown command received. Shutting down..."),
a.Oc&&(a.Oc(c),a.Oc=null),a.S=null,a.close()):"r"===d?(a.e("Reset packet received.  New host: "+c),qb(a.M,c),1===a.ma?a.close():(kd(a),ed(a))):"e"===d?Ub("Server Error: "+c):"o"===d?(a.e("got pong on primary."),ld(a),md(a)):Ub("Unknown control packet command: "+d)}else"d"==d&&a.gc(c)}else if(b===a.w)if(d=$b("t",c),c=$b("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?nd(a):"r"===c?(a.e("Got a reset on secondary, closing it"),a.w.close(),a.Pb!==a.w&&a.Mb!==a.w||a.close()):"o"===c&&(a.e("got pong on secondary."),
a.xd--,nd(a)));else if("d"==d)a.ic.push(c);else throw Error("Unknown protocol layer: "+d);else a.e("message on old connection")}}dd.prototype.yd=function(a){od(this,{t:"d",d:a})};function jd(a){a.Pb===a.w&&a.Mb===a.w&&(a.e("cleaning up and promoting a connection: "+a.w.Cc),a.B=a.w,a.w=null)}
function nd(a){0>=a.xd?(a.e("Secondary connection is healthy."),a.Na=!0,a.w.$b(),a.w.start(),a.e("sending client ack on secondary"),a.w.send({t:"c",d:{t:"a",d:{}}}),a.e("Ending transmission on primary"),a.B.send({t:"c",d:{t:"n",d:{}}}),a.Pb=a.w,jd(a)):(a.e("sending ping on secondary."),a.w.send({t:"c",d:{t:"p",d:{}}}))}dd.prototype.gc=function(a){ld(this);this.Pc(a)};function ld(a){a.Na||(a.Tc--,0>=a.Tc&&(a.e("Primary connection is healthy."),a.Na=!0,a.B.$b()))}
function id(a,b){a.w=new b("c:"+a.id+":"+a.cd++,a.M,a.sc);a.xd=b.responsesRequiredToBeHealthy||0;a.w.open(fd(a,a.w),gd(a,a.w));setTimeout(function(){a.w&&(a.e("Timed out trying to upgrade."),a.w.close())},Math.floor(6E4))}function hd(a,b,c){a.e("Realtime connection established.");a.B=b;a.ma=1;a.Cb&&(a.Cb(c),a.Cb=null);0===a.Tc?(a.e("Primary connection is healthy."),a.Na=!0):setTimeout(function(){md(a)},Math.floor(5E3))}
function md(a){a.Na||1!==a.ma||(a.e("sending ping on primary."),od(a,{t:"c",d:{t:"p",d:{}}}))}function od(a,b){if(1!==a.ma)throw"Connection is not connected";a.Pb.send(b)}dd.prototype.close=function(){2!==this.ma&&(this.e("Closing realtime connection."),this.ma=2,kd(this),this.S&&(this.S(),this.S=null))};function kd(a){a.e("Shutting down all connections");a.B&&(a.B.close(),a.B=null);a.w&&(a.w.close(),a.w=null);a.Yb&&(clearTimeout(a.Yb),a.Yb=null)};function pd(a,b,c,d,e,f){this.id=qd++;this.e=Tb("p:"+this.id+":");this.Sa=!0;this.ha={};this.T=[];this.Eb=0;this.Bb=[];this.R=!1;this.sa=1E3;this.ac=3E5;this.hc=b||ba;this.fc=c||ba;this.Ab=d||ba;this.Qc=e||ba;this.Hc=f||ba;this.M=a;this.Vc=null;this.Lb={};this.ce=0;this.wb=this.Lc=null;rd(this,0);wc.sb().fb("visible",this.Yd,this);-1===a.host.indexOf("fblocal")&&xc.sb().fb("online",this.Xd,this)}var qd=0,sd=0;h=pd.prototype;
h.Ea=function(a,b,c){var d=++this.ce;a={r:d,a:a,b:b};this.e(u(a));v(this.R,"sendRequest_ call when we're not connected not allowed.");this.ka.yd(a);c&&(this.Lb[d]=c)};function td(a,b,c){var d=b.toString(),e=b.path().toString();a.ha[e]=a.ha[e]||{};v(!a.ha[e][d],"listen() called twice for same path/queryId.");a.ha[e][d]={hb:b.hb(),D:c};a.R&&ud(a,e,d,b.hb(),c)}
function ud(a,b,c,d,e){a.e("Listen on "+b+" for "+c);var f={p:b};d=Ab(d,function(a){return Ka(a)});"{}"!==c&&(f.q=d);f.h=a.Hc(b);a.Ea("l",f,function(d){a.e("listen response",d);d=d.s;"ok"!==d&&vd(a,b,c);e&&e(d)})}
h.mb=function(a,b,c){this.Ka={Jd:a,hd:!1,aa:b,Ub:c};this.e("Authenticating using credential: "+this.Ka);wd(this);if(!(b=40==a.length))a:{var d;try{var e=a.split(".");if(3!==e.length){b=!1;break a}var f;b:{try{if("undefined"!==typeof atob){f=atob(e[1]);break b}}catch(g){K("base64DecodeIfNativeSupport failed: ",g)}f=null}null!==f&&(d=ra(f))}catch(k){K("isAdminAuthToken_ failed",k)}b="object"===typeof d&&!0===wa(d,"admin")}b&&(this.e("Admin auth credential detected.  Reducing max reconnect time."),this.ac=
3E4)};h.Qb=function(a){delete this.Ka;this.Ab(!1);this.R&&this.Ea("unauth",{},function(b){a(b.s,b.d)})};function wd(a){var b=a.Ka;a.R&&b&&a.Ea("auth",{cred:b.Jd},function(c){var d=c.s;c=c.d||"error";"ok"!==d&&a.Ka===b&&delete a.Ka;a.Ab("ok"===d);b.hd?"ok"!==d&&b.Ub&&b.Ub(d,c):(b.hd=!0,b.aa&&b.aa(d,c))})}function xd(a,b,c,d){b=b.toString();vd(a,b,c)&&a.R&&yd(a,b,c,d)}function yd(a,b,c,d){a.e("Unlisten on "+b+" for "+c);b={p:b};d=Ab(d,function(a){return Ka(a)});"{}"!==c&&(b.q=d);a.Ea("u",b)}
function zd(a,b,c,d){a.R?Ad(a,"o",b,c,d):a.Bb.push({Sc:b,action:"o",data:c,D:d})}function Bd(a,b,c,d){a.R?Ad(a,"om",b,c,d):a.Bb.push({Sc:b,action:"om",data:c,D:d})}h.Nc=function(a,b){this.R?Ad(this,"oc",a,null,b):this.Bb.push({Sc:a,action:"oc",data:null,D:b})};function Ad(a,b,c,d,e){c={p:c,d:d};a.e("onDisconnect "+b,c);a.Ea(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}h.put=function(a,b,c,d){Cd(this,"p",a,b,c,d)};function Dd(a,b,c,d){Cd(a,"m",b,c,d,void 0)}
function Cd(a,b,c,d,e,f){c={p:c,d:d};n(f)&&(c.h=f);a.T.push({action:b,ud:c,D:e});a.Eb++;b=a.T.length-1;a.R&&Ed(a,b)}function Ed(a,b){var c=a.T[b].action,d=a.T[b].ud,e=a.T[b].D;a.T[b].$d=a.R;a.Ea(c,d,function(d){a.e(c+" response",d);delete a.T[b];a.Eb--;0===a.Eb&&(a.T=[]);e&&e(d.s,d.d)})}
h.gc=function(a){if("r"in a){this.e("from server: "+u(a));var b=a.r,c=this.Lb[b];c&&(delete this.Lb[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,c=a.b,this.e("handleServerMessage",b,c),"d"===b?this.hc(c.p,c.d,!1):"m"===b?this.hc(c.p,c.d,!0):"c"===b?Fd(this,c.p,c.q):"ac"===b?(a=c.s,b=c.d,c=this.Ka,delete this.Ka,c&&c.Ub&&c.Ub(a,b),this.Ab(!1)):"sd"===b?this.Vc?this.Vc(c):"msg"in c&&"undefined"!==typeof console&&console.log("FIREBASE: "+c.msg.replace("\n",
"\nFIREBASE: ")):Ub("Unrecognized action received from server: "+u(b)+"\nAre you using the latest client?"))}};h.Cb=function(a){this.e("connection ready");this.R=!0;this.wb=(new Date).getTime();this.Qc({serverTimeOffset:a-(new Date).getTime()});wd(this);for(var b in this.ha)for(var c in this.ha[b])a=this.ha[b][c],ud(this,b,c,a.hb,a.D);for(b=0;b<this.T.length;b++)this.T[b]&&Ed(this,b);for(;this.Bb.length;)b=this.Bb.shift(),Ad(this,b.action,b.Sc,b.data,b.D);this.fc(!0)};
function rd(a,b){v(!a.ka,"Scheduling a connect when we're already connected/ing?");a.Za&&clearTimeout(a.Za);a.Za=setTimeout(function(){a.Za=null;Gd(a)},Math.floor(b))}h.Yd=function(a){a&&!this.lb&&this.sa===this.ac&&(this.e("Window became visible.  Reducing delay."),this.sa=1E3,this.ka||rd(this,0));this.lb=a};
h.Xd=function(a){a?(this.e("Browser went online.  Reconnecting."),this.sa=1E3,this.Sa=!0,this.ka||rd(this,0)):(this.e("Browser went offline.  Killing connection; don't reconnect."),this.Sa=!1,this.ka&&this.ka.close())};
h.qd=function(){this.e("data client disconnected");this.R=!1;this.ka=null;for(var a=0;a<this.T.length;a++){var b=this.T[a];b&&"h"in b.ud&&b.$d&&(b.D&&b.D("disconnect"),delete this.T[a],this.Eb--)}0===this.Eb&&(this.T=[]);if(this.Sa)this.lb?this.wb&&(3E4<(new Date).getTime()-this.wb&&(this.sa=1E3),this.wb=null):(this.e("Window isn't visible.  Delaying reconnect."),this.sa=this.ac,this.Lc=(new Date).getTime()),a=Math.max(0,this.sa-((new Date).getTime()-this.Lc)),a*=Math.random(),this.e("Trying to reconnect in "+
a+"ms"),rd(this,a),this.sa=Math.min(this.ac,1.3*this.sa);else for(var c in this.Lb)delete this.Lb[c];this.fc(!1)};function Gd(a){if(a.Sa){a.e("Making a connection attempt");a.Lc=(new Date).getTime();a.wb=null;var b=r(a.gc,a),c=r(a.Cb,a),d=r(a.qd,a),e=a.id+":"+sd++;a.ka=new dd(e,a.M,b,c,d,function(b){L(b+" ("+a.M.toString()+")");a.Sa=!1})}}h.La=function(){this.Sa=!1;this.ka?this.ka.close():(this.Za&&(clearTimeout(this.Za),this.Za=null),this.R&&this.qd())};
h.jb=function(){this.Sa=!0;this.sa=1E3;this.R||rd(this,0)};function Fd(a,b,c){c=c?Ab(c,function(a){return La(a)}).join("$"):"{}";(a=vd(a,b,c))&&a.D&&a.D("permission_denied")}function vd(a,b,c){b=(new F(b)).toString();c||(c="{}");var d=a.ha[b][c];delete a.ha[b][c];return d};function Hd(){this.n=this.F=null}function Id(a,b,c){if(b.f())a.F=c,a.n=null;else if(null!==a.F)a.F=a.F.ya(b,c);else{null==a.n&&(a.n=new Pc);var d=C(b);a.n.contains(d)||a.n.add(d,new Hd);a=a.n.get(d);b=Ma(b);Id(a,b,c)}}function Jd(a,b){if(b.f())return a.F=null,a.n=null,!0;if(null!==a.F){if(a.F.O())return!1;var c=a.F;a.F=null;c.A(function(b,c){Id(a,new F(b),c)});return Jd(a,b)}return null!==a.n?(c=C(b),b=Ma(b),a.n.contains(c)&&Jd(a.n.get(c),b)&&a.n.remove(c),a.n.f()?(a.n=null,!0):!1):!0}
function Kd(a,b,c){null!==a.F?c(b,a.F):a.A(function(a,e){var f=new F(b.toString()+"/"+a);Kd(e,f,c)})}Hd.prototype.A=function(a){null!==this.n&&R(this.n,function(b,c){a(b,c)})};function Ld(){this.$=M}function S(a,b){return a.$.K(b)}function T(a,b,c){a.$=a.$.ya(b,c)}Ld.prototype.toString=function(){return this.$.toString()};function Md(){this.ta=new Ld;this.L=new Ld;this.oa=new Ld;this.Gb=new Qa}function Nd(a,b,c){T(a.ta,b,c);return Od(a,b)}function Od(a,b){for(var c=S(a.ta,b),d=S(a.L,b),e=I(a.Gb,b),f=!1,g=e;null!==g;){if(null!==g.j()){f=!0;break}g=g.parent()}if(f)return!1;c=Pd(c,d,e);return c!==d?(T(a.L,b,c),!0):!1}function Pd(a,b,c){if(c.f())return a;if(null!==c.j())return b;a=a||M;c.A(function(d){d=d.name();var e=a.N(d),f=b.N(d),g=I(c,d),e=Pd(e,f,g);a=a.H(d,e)});return a}
Md.prototype.set=function(a,b){var c=this,d=[];zb(b,function(a){var b=a.path;a=a.ra;var g=Ob();J(I(c.Gb,b),g);T(c.L,b,a);d.push({path:b,ee:g})});return d};function Qd(a,b){zb(b,function(b){var d=b.ee;b=I(a.Gb,b.path);var e=b.j();v(null!==e,"pendingPut should not be null.");e===d&&J(b,null)})};function Rd(a,b){return a&&"object"===typeof a?(v(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function Sd(a,b){var c=new Hd;Kd(a,new F(""),function(a,e){Id(c,a,Td(e,b))});return c}function Td(a,b){var c=Rd(a.k(),b),d;if(a.O()){var e=Rd(a.j(),b);return e!==a.j()||c!==a.k()?new jc(e,c):a}d=a;c!==a.k()&&(d=d.Ga(c));a.A(function(a,c){var e=Td(c,b);e!==c&&(d=d.H(a,e))});return d};function Ud(){this.$a=[]}function Vd(a,b){if(0!==b.length)for(var c=0;c<b.length;c++)a.$a.push(b[c])}Ud.prototype.Jb=function(){for(var a=0;a<this.$a.length;a++)if(this.$a[a]){var b=this.$a[a];this.$a[a]=null;Wd(b)}this.$a=[]};function Wd(a){var b=a.aa,c=a.zd,d=a.Ib;ic(function(){b(c,d)})};function U(a,b,c,d){this.type=a;this.ua=b;this.ba=c;this.Ib=d};function Xd(a){this.Q=a;this.pa=[];this.Ec=new Ud}function Yd(a,b,c,d,e){a.pa.push({type:b,aa:c,cancel:d,Y:e});d=[];var f=Zd(a.i);a.ub&&f.push(new U("value",a.i));for(var g=0;g<f.length;g++)if(f[g].type===b){var k=new E(a.Q.m,a.Q.path);f[g].ba&&(k=k.G(f[g].ba));d.push({aa:dc(c,e),zd:new P(f[g].ua,k),Ib:f[g].Ib})}Vd(a.Ec,d)}Xd.prototype.lc=function(a,b){b=this.mc(a,b);null!=b&&$d(this,b)};
function $d(a,b){for(var c=[],d=0;d<b.length;d++){var e=b[d],f=e.type,g=new E(a.Q.m,a.Q.path);b[d].ba&&(g=g.G(b[d].ba));g=new P(b[d].ua,g);"value"!==e.type||g.tb()?"value"!==e.type&&(f+=" "+g.name()):f+="("+g.V()+")";K(a.Q.m.u.id+": event:"+a.Q.path+":"+a.Q.Qa()+":"+f);for(f=0;f<a.pa.length;f++){var k=a.pa[f];b[d].type===k.type&&c.push({aa:dc(k.aa,k.Y),zd:g,Ib:e.Ib})}}Vd(a.Ec,c)}Xd.prototype.Jb=function(){this.Ec.Jb()};
function Zd(a){var b=[];if(!a.O()){var c=null;a.A(function(a,e){b.push(new U("child_added",e,a,c));c=a})}return b}function ae(a){a.ub||(a.ub=!0,$d(a,[new U("value",a.i)]))};function be(a,b){Xd.call(this,a);this.i=b}ka(be,Xd);be.prototype.mc=function(a,b){this.i=a;this.ub&&null!=b&&b.push(new U("value",this.i));return b};be.prototype.rb=function(){return{}};function ce(a,b){this.Wb=a;this.Mc=b}function de(a,b,c,d,e){var f=a.K(c),g=b.K(c);d=new ce(d,e);e=ee(d,c,f,g);g=!f.f()&&!g.f()&&f.k()!==g.k();if(e||g)for(f=c,c=e;null!==f.parent();){var k=a.K(f);e=b.K(f);var l=f.parent();if(!d.Wb||I(d.Wb,l).j()){var m=b.K(l),p=[],f=Na(f);k.f()?(k=m.fa(f,e),p.push(new U("child_added",e,f,k))):e.f()?p.push(new U("child_removed",k,f)):(k=m.fa(f,e),g&&p.push(new U("child_moved",e,f,k)),c&&p.push(new U("child_changed",e,f,k)));d.Mc(l,m,p)}g&&(g=!1,c=!0);f=l}}
function ee(a,b,c,d){var e,f=[];c===d?e=!1:c.O()&&d.O()?e=c.j()!==d.j():c.O()?(fe(a,b,M,d,f),e=!0):d.O()?(fe(a,b,c,M,f),e=!0):e=fe(a,b,c,d,f);e?a.Mc(b,d,f):c.k()!==d.k()&&a.Mc(b,d,null);return e}
function fe(a,b,c,d,e){var f=!1,g=!a.Wb||!I(a.Wb,b).f(),k=[],l=[],m=[],p=[],t={},s={},w,V,G,H;w=c.ab();G=Za(w);V=d.ab();for(H=Za(V);null!==G||null!==H;){c=H;c=null===G?1:null===c?-1:G.key===c.key?0:lc({name:G.key,ja:G.value.k()},{name:c.key,ja:c.value.k()});if(0>c)f=wa(t,G.key),n(f)?(m.push({Gc:G,$c:k[f]}),k[f]=null):(s[G.key]=l.length,l.push(G)),f=!0,G=Za(w);else{if(0<c)f=wa(s,H.key),n(f)?(m.push({Gc:l[f],$c:H}),l[f]=null):(t[H.key]=k.length,k.push(H)),f=!0;else{c=b.G(H.key);if(c=ee(a,c,G.value,
H.value))p.push(H),f=!0;G.value.k()!==H.value.k()&&(m.push({Gc:G,$c:H}),f=!0);G=Za(w)}H=Za(V)}if(!g&&f)return!0}for(g=0;g<l.length;g++)if(t=l[g])c=b.G(t.key),ee(a,c,t.value,M),e.push(new U("child_removed",t.value,t.key));for(g=0;g<k.length;g++)if(t=k[g])c=b.G(t.key),l=d.fa(t.key,t.value),ee(a,c,M,t.value),e.push(new U("child_added",t.value,t.key,l));for(g=0;g<m.length;g++)t=m[g].Gc,k=m[g].$c,c=b.G(k.key),l=d.fa(k.key,k.value),e.push(new U("child_moved",k.value,k.key,l)),(c=ee(a,c,t.value,k.value))&&
p.push(k);for(g=0;g<p.length;g++)a=p[g],l=d.fa(a.key,a.value),e.push(new U("child_changed",a.value,a.key,l));return f};function ge(){this.X=this.xa=null;this.set={}}ka(ge,Pc);h=ge.prototype;h.setActive=function(a){this.xa=a};function he(a,b,c){a.add(b,c);a.X||(a.X=c.Q.path)}function ie(a){var b=a.xa;a.xa=null;return b}function je(a){return a.contains("default")}function ke(a){return null!=a.xa&&je(a)}h.defaultView=function(){return je(this)?this.get("default"):null};h.path=function(){return this.X};h.toString=function(){return Ab(this.keys(),function(a){return"default"===a?"{}":a}).join("$")};
h.hb=function(){var a=[];R(this,function(b,c){a.push(c.Q)});return a};function le(a,b){Xd.call(this,a);this.i=M;this.mc(b,Zd(b))}ka(le,Xd);
le.prototype.mc=function(a,b){if(null===b)return b;var c=[],d=this.Q;n(d.da)&&(n(d.wa)&&null!=d.wa?c.push(function(a,b){var c=Xb(b,d.da);return 0<c||0===c&&0<=Yb(a,d.wa)}):c.push(function(a,b){return 0<=Xb(b,d.da)}));n(d.Aa)&&(n(d.Ya)?c.push(function(a,b){var c=Xb(b,d.Aa);return 0>c||0===c&&0>=Yb(a,d.Ya)}):c.push(function(a,b){return 0>=Xb(b,d.Aa)}));var e=null,f=null;if(n(this.Q.Ca))if(n(this.Q.da)){if(e=me(a,c,this.Q.Ca,!1)){var g=a.N(e).k();c.push(function(a,b){var c=Xb(b,g);return 0>c||0===c&&
0>=Yb(a,e)})}}else if(f=me(a,c,this.Q.Ca,!0)){var k=a.N(f).k();c.push(function(a,b){var c=Xb(b,k);return 0<c||0===c&&0<=Yb(a,f)})}for(var l=[],m=[],p=[],t=[],s=0;s<b.length;s++){var w=b[s].ba,V=b[s].ua;switch(b[s].type){case "child_added":ne(c,w,V)&&(this.i=this.i.H(w,V),m.push(b[s]));break;case "child_removed":this.i.N(w).f()||(this.i=this.i.H(w,null),l.push(b[s]));break;case "child_changed":!this.i.N(w).f()&&ne(c,w,V)&&(this.i=this.i.H(w,V),t.push(b[s]));break;case "child_moved":var G=!this.i.N(w).f(),
H=ne(c,w,V);G?H?(this.i=this.i.H(w,V),p.push(b[s])):(l.push(new U("child_removed",this.i.N(w),w)),this.i=this.i.H(w,null)):H&&(this.i=this.i.H(w,V),m.push(b[s]))}}var Xc=e||f;if(Xc){var Yc=(s=null!==f)?this.i.jd():this.i.ld(),hc=!1,ab=!1,bb=this;(s?a.Fc:a.A).call(a,function(a,b){ab||null!==Yc||(ab=!0);if(ab&&hc)return!0;hc?(l.push(new U("child_removed",bb.i.N(a),a)),bb.i=bb.i.H(a,null)):ab&&(m.push(new U("child_added",b,a)),bb.i=bb.i.H(a,b));Yc===a&&(ab=!0);a===Xc&&(hc=!0)})}for(s=0;s<m.length;s++)c=
m[s],w=this.i.fa(c.ba,c.ua),l.push(new U("child_added",c.ua,c.ba,w));for(s=0;s<p.length;s++)c=p[s],w=this.i.fa(c.ba,c.ua),l.push(new U("child_moved",c.ua,c.ba,w));for(s=0;s<t.length;s++)c=t[s],w=this.i.fa(c.ba,c.ua),l.push(new U("child_changed",c.ua,c.ba,w));this.ub&&0<l.length&&l.push(new U("value",this.i));return l};function me(a,b,c,d){if(a.O())return null;var e=null;(d?a.Fc:a.A).call(a,function(a,d){if(ne(b,a,d)&&(e=a,c--,0===c))return!0});return e}
function ne(a,b,c){for(var d=0;d<a.length;d++)if(!a[d](b,c.k()))return!1;return!0}le.prototype.Ic=function(a){return this.i.N(a)!==M};
le.prototype.rb=function(a,b,c){var d={};this.i.O()||this.i.A(function(a){d[a]=3});var e=this.i;c=S(c,new F(""));var f=new Qa;J(I(f,this.Q.path),!0);b=M.ya(a,b);var g=this;de(c,b,a,f,function(a,b,c){null!==c&&a.toString()===g.Q.path.toString()&&g.mc(b,c)});this.i.O()?cc(d,function(a,b){d[b]=2}):(this.i.A(function(a){A(d,a)||(d[a]=1)}),cc(d,function(a,b){g.i.N(b).f()&&(d[b]=2)}));this.i=e;return d};function oe(a,b){this.u=a;this.g=b;this.ec=b.$;this.na=new Qa}oe.prototype.Sb=function(a,b,c,d,e){var f=a.path,g=I(this.na,f),k=g.j();null===k?(k=new ge,J(g,k)):v(!k.f(),"We shouldn't be storing empty QueryMaps");var l=a.Qa();if(k.contains(l))a=k.get(l),Yd(a,b,c,d,e);else{var m=this.g.$.K(f);a=pe(a,m);qe(this,g,k,l,a);Yd(a,b,c,d,e);(b=(b=Ta(I(this.na,f),function(a){var b;if(b=a.j()&&a.j().defaultView())b=a.j().defaultView().ub;if(b)return!0},!0))||null===this.u&&!S(this.g,f).f())&&ae(a)}a.Jb()};
function re(a,b,c,d,e){var f=a.get(b),g;if(g=f){g=!1;for(var k=f.pa.length-1;0<=k;k--){var l=f.pa[k];if(!(c&&l.type!==c||d&&l.aa!==d||e&&l.Y!==e)&&(f.pa.splice(k,1),g=!0,c&&d))break}}(c=g&&!(0<f.pa.length))&&a.remove(b);return c}function se(a,b,c,d,e){b=b?b.Qa():null;var f=[];b&&"default"!==b?re(a,b,c,d,e)&&f.push(b):zb(a.keys(),function(b){re(a,b,c,d,e)&&f.push(b)});return f}oe.prototype.oc=function(a,b,c,d){var e=I(this.na,a.path).j();return null===e?null:te(this,e,a,b,c,d)};
function te(a,b,c,d,e,f){var g=b.path(),g=I(a.na,g);c=se(b,c,d,e,f);b.f()&&J(g,null);d=ue(g);if(0<c.length&&!d){d=g;e=g.parent();for(c=!1;!c&&e;){if(f=e.j()){v(!ke(f));var k=d.name(),l=!1;R(f,function(a,b){l=b.Ic(k)||l});l&&(c=!0)}d=e;e=e.parent()}d=null;ke(b)||(b=ie(b),d=ve(a,g),b&&b());return c?null:d}return null}function we(a,b,c){Sa(I(a.na,b),function(a){(a=a.j())&&R(a,function(a,b){ae(b)})},c,!0)}
function W(a,b,c){function d(a){do{if(g[a.toString()])return!0;a=a.parent()}while(null!==a);return!1}var e=a.ec,f=a.g.$;a.ec=f;for(var g={},k=0;k<c.length;k++)g[c[k].toString()]=!0;de(e,f,b,a.na,function(c,e,f){if(b.contains(c)){var g=d(c);g&&we(a,c,!1);a.lc(c,e,f);g&&we(a,c,!0)}else a.lc(c,e,f)});d(b)&&we(a,b,!0);xe(a,b)}function xe(a,b){var c=I(a.na,b);Sa(c,function(a){(a=a.j())&&R(a,function(a,b){b.Jb()})},!0,!0);Ta(c,function(a){(a=a.j())&&R(a,function(a,b){b.Jb()})},!1)}
oe.prototype.lc=function(a,b,c){a=I(this.na,a).j();null!==a&&R(a,function(a,e){e.lc(b,c)})};function ue(a){return Ta(a,function(a){return a.j()&&ke(a.j())})}function qe(a,b,c,d,e){if(ke(c)||ue(b))he(c,d,e);else{var f,g;c.f()||(f=c.toString(),g=c.hb());he(c,d,e);c.setActive(ye(a,c));f&&g&&xd(a.u,c.path(),f,g)}ke(c)&&Sa(b,function(a){if(a=a.j())a.xa&&a.xa(),a.xa=null})}
function ve(a,b){function c(b){var f=b.j();if(f&&je(f))d.push(f.path()),null==f.xa&&f.setActive(ye(a,f));else{if(f){null!=f.xa||f.setActive(ye(a,f));var g={};R(f,function(a,b){b.i.A(function(a){A(g,a)||(g[a]=!0,a=f.path().G(a),d.push(a))})})}b.A(c)}}var d=[];c(b);return d}
function ye(a,b){if(a.u){var c=a.u,d=b.path(),e=b.toString(),f=b.hb(),g,k=b.keys(),l=je(b);td(a.u,b,function(c){"ok"!==c?(c=fc(c),L("on() or once() for "+b.path().toString()+" failed: "+c.toString()),ze(a,b,c)):g||(l?we(a,b.path(),!0):zb(k,function(a){(a=b.get(a))&&ae(a)}),xe(a,b.path()))});return function(){g=!0;xd(c,d,e,f)}}return ba}function ze(a,b,c){b&&(R(b,function(a,b){for(var f=0;f<b.pa.length;f++){var g=b.pa[f];g.cancel&&dc(g.cancel,g.Y)(c)}}),te(a,b))}
function pe(a,b){return"default"===a.Qa()?new be(a,b):new le(a,b)}oe.prototype.rb=function(a,b,c,d){function e(a){cc(a,function(a,b){f[b]=3===a?3:(wa(f,b)||a)===a?a:3})}var f={};R(b,function(b,f){e(f.rb(a,c,d))});c.O()||c.A(function(a){A(f,a)||(f[a]=4)});return f};function Ae(a,b,c,d,e){var f=b.path();b=a.rb(f,b,d,e);var g=M,k=[];cc(b,function(b,m){var p=new F(m);3===b||1===b?g=g.H(m,d.K(p)):(2===b&&k.push({path:f.G(m),ra:M}),k=k.concat(Be(a,d.K(p),I(c,p),e)))});return[{path:f,ra:g}].concat(k)}
function Ce(a,b,c,d){var e;a:{var f=I(a.na,b);e=f.parent();for(var g=[];null!==e;){var k=e.j();if(null!==k){if(je(k)){e=[{path:b,ra:c}];break a}k=a.rb(b,k,c,d);f=wa(k,f.name());if(3===f||1===f){e=[{path:b,ra:c}];break a}2===f&&g.push({path:b,ra:M})}f=e;e=e.parent()}e=g}if(1==e.length&&(!e[0].ra.f()||c.f()))return e;g=I(a.na,b);f=g.j();null!==f?je(f)?e.push({path:b,ra:c}):e=e.concat(Ae(a,f,g,c,d)):e=e.concat(Be(a,c,g,d));return e}
function Be(a,b,c,d){var e=c.j();if(null!==e)return je(e)?[{path:c.path(),ra:b}]:Ae(a,e,c,b,d);var f=[];c.A(function(c){var e=b.O()?M:b.N(c.name());c=Be(a,e,c,d);f=f.concat(c)});return f};function De(a){this.M=a;this.ea=Gc(a);this.u=new pd(this.M,r(this.hc,this),r(this.fc,this),r(this.Ab,this),r(this.Qc,this),r(this.Hc,this));this.Bd=Hc(a,r(function(){return new Dc(this.ea,this.u)},this));this.Ta=new Qa;this.Fa=new Ld;this.g=new Md;this.I=new oe(this.u,this.g.oa);this.Jc=new Ld;this.Kc=new oe(null,this.Jc);Ee(this,"connected",!1);Ee(this,"authenticated",!1);this.S=new Hd;this.Vb=0}h=De.prototype;h.toString=function(){return(this.M.qc?"https://":"http://")+this.M.host};h.name=function(){return this.M.bc};
function Fe(a){a=S(a.Jc,new F(".info/serverTimeOffset")).V()||0;return(new Date).getTime()+a}function Ge(a){a=a={timestamp:Fe(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
h.hc=function(a,b,c){this.Vb++;this.nd&&(b=this.nd(a,b));var d,e,f=[];9<=a.length&&a.lastIndexOf(".priority")===a.length-9?(d=new F(a.substring(0,a.length-9)),e=S(this.g.ta,d).Ga(b),f.push(d)):c?(d=new F(a),e=S(this.g.ta,d),cc(b,function(a,b){var c=new F(b);".priority"===b?e=e.Ga(a):(e=e.ya(c,O(a)),f.push(d.G(b)))})):(d=new F(a),e=O(b),f.push(d));a=Ce(this.I,d,e,this.g.L);b=!1;for(c=0;c<a.length;++c){var g=a[c];b=Nd(this.g,g.path,g.ra)||b}b&&(d=He(this,d));W(this.I,d,f)};
h.fc=function(a){Ee(this,"connected",a);!1===a&&Ie(this)};h.Qc=function(a){var b=this;bc(a,function(a,d){Ee(b,d,a)})};h.Hc=function(a){a=new F(a);return S(this.g.ta,a).hash()};h.Ab=function(a){Ee(this,"authenticated",a)};function Ee(a,b,c){b=new F("/.info/"+b);T(a.Jc,b,O(c));W(a.Kc,b,[b])}
h.mb=function(a,b,c){"firebaseio-demo.com"===this.M.domain&&L("FirebaseRef.auth() not supported on demo (*.firebaseio-demo.com) Firebases. Please use on production (*.firebaseio.com) Firebases only.");this.u.mb(a,function(a,c){X(b,a,c)},function(a,b){L("auth() was canceled: "+b);if(c){var f=Error(b);f.code=a.toUpperCase();c(f)}})};h.Qb=function(a){this.u.Qb(function(b,c){X(a,b,c)})};
h.kb=function(a,b,c,d){this.e("set",{path:a.toString(),value:b,ja:c});var e=Ge(this);b=O(b,c);var e=Td(b,e),e=Ce(this.I,a,e,this.g.L),f=this.g.set(a,e),g=this;this.u.put(a.toString(),b.V(!0),function(b,c){"ok"!==b&&L("set at "+a+" failed: "+b);Qd(g.g,f);Od(g.g,a);var e=He(g,a);W(g.I,e,[]);X(d,b,c)});e=Je(this,a);He(this,e);W(this.I,e,[a])};
h.update=function(a,b,c){this.e("update",{path:a.toString(),value:b});var d=S(this.g.oa,a),e=!0,f=[],g=Ge(this),k=[],l;for(l in b){var e=!1,m=O(b[l]),m=Td(m,g),d=d.H(l,m),p=a.G(l);f.push(p);m=Ce(this.I,p,m,this.g.L);k=k.concat(this.g.set(a,m))}if(e)K("update() called with empty data.  Don't do anything."),X(c,"ok");else{var t=this;Dd(this.u,a.toString(),b,function(b,d){"ok"!==b&&L("update at "+a+" failed: "+b);Qd(t.g,k);Od(t.g,a);var e=He(t,a);W(t.I,e,[]);X(c,b,d)});b=Je(this,a);He(this,b);W(t.I,
b,f)}};h.Wc=function(a,b,c){this.e("setPriority",{path:a.toString(),ja:b});var d=Ge(this),d=Rd(b,d),d=S(this.g.L,a).Ga(d),d=Ce(this.I,a,d,this.g.L),e=this.g.set(a,d),f=this;this.u.put(a.toString()+"/.priority",b,function(b,d){"permission_denied"===b&&L("setPriority at "+a+" failed: "+b);Qd(f.g,e);Od(f.g,a);var l=He(f,a);W(f.I,l,[]);X(c,b,d)});b=He(this,a);W(f.I,b,[])};
function Ie(a){a.e("onDisconnectEvents");var b=[],c=Ge(a);Kd(Sd(a.S,c),new F(""),function(c,e){var f=Ce(a.I,c,e,a.g.L);b.push.apply(b,a.g.set(c,f));f=Je(a,c);He(a,f);W(a.I,f,[c])});Qd(a.g,b);a.S=new Hd}h.Nc=function(a,b){var c=this;this.u.Nc(a.toString(),function(d,e){"ok"===d&&Jd(c.S,a);X(b,d,e)})};function Ke(a,b,c,d){var e=O(c);zd(a.u,b.toString(),e.V(!0),function(c,g){"ok"===c&&Id(a.S,b,e);X(d,c,g)})}
function Le(a,b,c,d,e){var f=O(c,d);zd(a.u,b.toString(),f.V(!0),function(c,d){"ok"===c&&Id(a.S,b,f);X(e,c,d)})}function Me(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(K("onDisconnect().update() called with empty data.  Don't do anything."),X(d,"ok")):Bd(a.u,b.toString(),c,function(e,f){if("ok"===e)for(var l in c){var m=O(c[l]);Id(a.S,b.G(l),m)}X(d,e,f)})}function Ne(a){Bc(a.ea,"deprecated_on_disconnect");a.Bd.Zc.deprecated_on_disconnect=!0}
h.Sb=function(a,b,c,d,e){".info"===C(a.path)?this.Kc.Sb(a,b,c,d,e):this.I.Sb(a,b,c,d,e)};h.oc=function(a,b,c,d){if(".info"===C(a.path))this.Kc.oc(a,b,c,d);else{b=this.I.oc(a,b,c,d);if(c=null!==b){c=this.g;d=a.path;for(var e=[],f=0;f<b.length;++f)e[f]=S(c.ta,b[f]);T(c.ta,d,M);for(f=0;f<b.length;++f)T(c.ta,b[f],e[f]);c=Od(c,d)}c&&(v(this.g.oa.$===this.I.ec,"We should have raised any outstanding events by now.  Else, we'll blow them away."),T(this.g.oa,a.path,S(this.g.L,a.path)),this.I.ec=this.g.oa.$)}};
h.La=function(){this.u.La()};h.jb=function(){this.u.jb()};h.Xc=function(a){if("undefined"!==typeof console){a?(this.tc||(this.tc=new Cc(this.ea)),a=this.tc.get()):a=this.ea.get();var b=Bb(yc(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};h.Yc=function(a){Bc(this.ea,a);this.Bd.Zc[a]=!0};h.e=function(){K("r:"+this.u.id+":",arguments)};
function X(a,b,c){a&&ic(function(){if("ok"==b)a(null,c);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Oe(a,b,c,d,e){function f(){}a.e("transaction on "+b);var g=new E(a,b);g.fb("value",f);c={path:b,update:c,D:d,status:null,rd:Ob(),yc:e,wd:0,vc:function(){g.zb("value",f)},wc:null};a.Fa.$=Pe(a,a.Fa.$,a.g.L.$,a.Ta);d=c.update(S(a.Fa,b).V());if(n(d)){Ba("transaction failed: Data returned ",d);c.status=1;e=I(a.Ta,b);var k=e.j()||[];k.push(c);J(e,k);k="object"===typeof d&&null!==d&&A(d,".priority")?d[".priority"]:S(a.g.L,b).k();e=Ge(a);d=O(d,k);d=Td(d,e);T(a.Fa,b,d);c.yc&&(T(a.g.oa,b,d),W(a.I,
b,[b]));Qe(a)}else c.vc(),c.D&&(a=Re(a,b),c.D(null,!1,a))}function Qe(a,b){var c=b||a.Ta;b||Se(a,c);if(null!==c.j()){var d=Te(a,c);v(0<d.length);Cb(d,function(a){return 1===a.status})&&Ue(a,c.path(),d)}else c.tb()&&c.A(function(b){Qe(a,b)})}
function Ue(a,b,c){for(var d=0;d<c.length;d++)v(1===c[d].status,"tryToSendTransactionQueue_: items in queue should all be run."),c[d].status=2,c[d].wd++;var e=S(a.g.L,b).hash();T(a.g.L,b,S(a.g.oa,b));for(var f=S(a.Fa,b).V(!0),g=Ob(),k=Ve(c),d=0;d<k.length;d++)J(I(a.g.Gb,k[d]),g);a.u.put(b.toString(),f,function(e){a.e("transaction put response",{path:b.toString(),status:e});for(d=0;d<k.length;d++){var f=I(a.g.Gb,k[d]),p=f.j();v(null!==p,"sendTransactionQueue_: pendingPut should not be null.");p===
g&&(J(f,null),T(a.g.L,k[d],S(a.g.ta,k[d])))}if("ok"===e){e=[];for(d=0;d<c.length;d++)c[d].status=3,c[d].D&&(f=Re(a,c[d].path),e.push(r(c[d].D,null,null,!0,f))),c[d].vc();Se(a,I(a.Ta,b));Qe(a);for(d=0;d<e.length;d++)ic(e[d])}else{if("datastale"===e)for(d=0;d<c.length;d++)c[d].status=4===c[d].status?5:1;else for(L("transaction at "+b+" failed: "+e),d=0;d<c.length;d++)c[d].status=5,c[d].wc=e;e=He(a,b);W(a.I,e,[b])}},e)}
function Ve(a){for(var b={},c=0;c<a.length;c++)a[c].yc&&(b[a[c].path.toString()]=a[c].path);a=[];for(var d in b)a.push(b[d]);return a}
function He(a,b){var c=We(a,b),d=c.path(),c=Te(a,c);T(a.g.oa,d,S(a.g.L,d));T(a.Fa,d,S(a.g.L,d));if(0!==c.length){for(var e=S(a.g.oa,d),f=e,g=[],k=0;k<c.length;k++){var l=Oa(d,c[k].path),m=!1,p;v(null!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===c[k].status)m=!0,p=c[k].wc;else if(1===c[k].status)if(25<=c[k].wd)m=!0,p="maxretry";else{var t=e.K(l),s=c[k].update(t.V());if(n(s)){Ba("transaction failed: Data returned ",s);var w=O(s);"object"===typeof s&&null!=s&&A(s,".priority")||
(w=w.Ga(t.k()));e=e.ya(l,w);c[k].yc&&(f=f.ya(l,w))}else m=!0,p="nodata"}m&&(c[k].status=3,setTimeout(c[k].vc,Math.floor(0)),c[k].D&&(m=new E(a,c[k].path),l=new P(e.K(l),m),"nodata"===p?g.push(r(c[k].D,null,null,!1,l)):g.push(r(c[k].D,null,Error(p),!1,l))))}T(a.Fa,d,e);T(a.g.oa,d,f);Se(a,a.Ta);for(k=0;k<g.length;k++)ic(g[k]);Qe(a)}return d}function We(a,b){for(var c,d=a.Ta;null!==(c=C(b))&&null===d.j();)d=I(d,c),b=Ma(b);return d}
function Te(a,b){var c=[];Xe(a,b,c);c.sort(function(a,b){return a.rd-b.rd});return c}function Xe(a,b,c){var d=b.j();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.A(function(b){Xe(a,b,c)})}function Se(a,b){var c=b.j();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;J(b,0<c.length?c:null)}b.A(function(b){Se(a,b)})}function Je(a,b){var c=We(a,b).path(),d=I(a.Ta,b);Ta(d,function(a){Ye(a)});Ye(d);Sa(d,function(a){Ye(a)});return c}
function Ye(a){var b=a.j();if(null!==b){for(var c=[],d=-1,e=0;e<b.length;e++)4!==b[e].status&&(2===b[e].status?(v(d===e-1,"All SENT items should be at beginning of queue."),d=e,b[e].status=4,b[e].wc="set"):(v(1===b[e].status),b[e].vc(),b[e].D&&c.push(r(b[e].D,null,Error("set"),!1,null))));-1===d?J(a,null):b.length=d+1;for(e=0;e<c.length;e++)ic(c[e])}}function Re(a,b){var c=new E(a,b);return new P(S(a.Fa,b),c)}
function Pe(a,b,c,d){if(d.f())return c;if(null!=d.j())return b;var e=c;d.A(function(d){var g=d.name(),k=new F(g);d=Pe(a,b.K(k),c.K(k),d);e=e.H(g,d)});return e};function Y(){this.ib={}}ca(Y);Y.prototype.La=function(){for(var a in this.ib)this.ib[a].La()};Y.prototype.interrupt=Y.prototype.La;Y.prototype.jb=function(){for(var a in this.ib)this.ib[a].jb()};Y.prototype.resume=Y.prototype.jb;var Z={Qd:function(a){var b=N.prototype.hash;N.prototype.hash=a;var c=jc.prototype.hash;jc.prototype.hash=a;return function(){N.prototype.hash=b;jc.prototype.hash=c}}};Z.hijackHash=Z.Qd;Z.Qa=function(a){return a.Qa()};Z.queryIdentifier=Z.Qa;Z.Td=function(a){return a.m.u.ha};Z.listens=Z.Td;Z.ae=function(a){return a.m.u.ka};Z.refConnection=Z.ae;Z.Ed=pd;Z.DataConnection=Z.Ed;pd.prototype.sendRequest=pd.prototype.Ea;pd.prototype.interrupt=pd.prototype.La;Z.Fd=dd;Z.RealTimeConnection=Z.Fd;
dd.prototype.sendRequest=dd.prototype.yd;dd.prototype.close=dd.prototype.close;Z.Dd=pb;Z.ConnectionTarget=Z.Dd;Z.Nd=function(){Rc=Jc=!0};Z.forceLongPolling=Z.Nd;Z.Od=function(){Sc=!0};Z.forceWebSockets=Z.Od;Z.ge=function(a,b){a.m.u.Vc=b};Z.setSecurityDebugCallback=Z.ge;Z.Xc=function(a,b){a.m.Xc(b)};Z.stats=Z.Xc;Z.Yc=function(a,b){a.m.Yc(b)};Z.statsIncrementCounter=Z.Yc;Z.Vb=function(a){return a.m.Vb};Z.dataUpdateCount=Z.Vb;Z.Rd=function(a,b){a.m.nd=b};Z.interceptServerData=Z.Rd;function $(a,b,c){this.Kb=a;this.X=b;this.Da=c}$.prototype.cancel=function(a){x("Firebase.onDisconnect().cancel",0,1,arguments.length);z("Firebase.onDisconnect().cancel",1,a,!0);this.Kb.Nc(this.X,a)};$.prototype.cancel=$.prototype.cancel;$.prototype.remove=function(a){x("Firebase.onDisconnect().remove",0,1,arguments.length);B("Firebase.onDisconnect().remove",this.X);z("Firebase.onDisconnect().remove",1,a,!0);Ke(this.Kb,this.X,null,a)};$.prototype.remove=$.prototype.remove;
$.prototype.set=function(a,b){x("Firebase.onDisconnect().set",1,2,arguments.length);B("Firebase.onDisconnect().set",this.X);Aa("Firebase.onDisconnect().set",a,!1);z("Firebase.onDisconnect().set",2,b,!0);Ke(this.Kb,this.X,a,b)};$.prototype.set=$.prototype.set;
$.prototype.kb=function(a,b,c){x("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);B("Firebase.onDisconnect().setWithPriority",this.X);Aa("Firebase.onDisconnect().setWithPriority",a,!1);Fa("Firebase.onDisconnect().setWithPriority",2,b,!1);z("Firebase.onDisconnect().setWithPriority",3,c,!0);if(".length"===this.Da||".keys"===this.Da)throw"Firebase.onDisconnect().setWithPriority failed: "+this.Da+" is a read-only object.";Le(this.Kb,this.X,a,b,c)};$.prototype.setWithPriority=$.prototype.kb;
$.prototype.update=function(a,b){x("Firebase.onDisconnect().update",1,2,arguments.length);B("Firebase.onDisconnect().update",this.X);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;L("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Ea("Firebase.onDisconnect().update",a);z("Firebase.onDisconnect().update",2,b,!0);Me(this.Kb,
this.X,a,b)};$.prototype.update=$.prototype.update;var Ze=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);v(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);v(20===c.length,"NextPushId: Length should be 20.");
return c}}();function E(a,b){var c,d;if(a instanceof De)c=a,d=b;else{x("new Firebase",1,2,arguments.length);var e=arguments[0];d=c="";var f=!0,g="";if(q(e)){var k=e.indexOf("//");if(0<=k)var l=e.substring(0,k-1),e=e.substring(k+2);k=e.indexOf("/");-1===k&&(k=e.length);c=e.substring(0,k);var e=e.substring(k+1),m=c.split(".");if(3==m.length){k=m[2].indexOf(":");f=0<=k?"https"===l||"wss"===l:!0;if("firebase"===m[1])Vb(c+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");else for(d=m[0],
g="",e=("/"+e).split("/"),k=0;k<e.length;k++)if(0<e[k].length){m=e[k];try{m=decodeURIComponent(m.replace(/\+/g," "))}catch(p){}g+="/"+m}d=d.toLowerCase()}else Vb("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com")}f||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&L("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");c=new pb(c,f,d,"ws"===l||"wss"===l);d=new F(g);
f=d.toString();!(l=!q(c.host)||0===c.host.length||!za(c.bc))&&(l=0!==f.length)&&(f&&(f=f.replace(/^\/*\.info(\/|$)/,"/")),l=!(q(f)&&0!==f.length&&!ya.test(f)));if(l)throw Error(y("new Firebase",1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');if(b)if(b instanceof Y)f=b;else throw Error("Expected a valid Firebase.Context for second argument to new Firebase()");else f=Y.sb();l=c.toString();e=wa(f.ib,l);e||(e=new De(c),f.ib[l]=e);c=e}D.call(this,c,d)}
ka(E,D);var $e=E,af=["Firebase"],bf=aa;af[0]in bf||!bf.execScript||bf.execScript("var "+af[0]);for(var cf;af.length&&(cf=af.shift());)!af.length&&n($e)?bf[cf]=$e:bf=bf[cf]?bf[cf]:bf[cf]={};E.prototype.name=function(){x("Firebase.name",0,0,arguments.length);return this.path.f()?null:Na(this.path)};E.prototype.name=E.prototype.name;
E.prototype.G=function(a){x("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof F))if(null===C(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));Ia("Firebase.child",b)}else Ia("Firebase.child",a);return new E(this.m,this.path.G(a))};E.prototype.child=E.prototype.G;E.prototype.parent=function(){x("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new E(this.m,a)};E.prototype.parent=E.prototype.parent;
E.prototype.root=function(){x("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.parent();)a=a.parent();return a};E.prototype.root=E.prototype.root;E.prototype.toString=function(){x("Firebase.toString",0,0,arguments.length);var a;if(null===this.parent())a=this.m.toString();else{a=this.parent().toString()+"/";var b=this.name();a+=encodeURIComponent(String(b))}return a};E.prototype.toString=E.prototype.toString;
E.prototype.set=function(a,b){x("Firebase.set",1,2,arguments.length);B("Firebase.set",this.path);Aa("Firebase.set",a,!1);z("Firebase.set",2,b,!0);this.m.kb(this.path,a,null,b)};E.prototype.set=E.prototype.set;
E.prototype.update=function(a,b){x("Firebase.update",1,2,arguments.length);B("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;L("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Ea("Firebase.update",a);z("Firebase.update",2,b,!0);if(A(a,".priority"))throw Error("update() does not currently support updating .priority.");
this.m.update(this.path,a,b)};E.prototype.update=E.prototype.update;E.prototype.kb=function(a,b,c){x("Firebase.setWithPriority",2,3,arguments.length);B("Firebase.setWithPriority",this.path);Aa("Firebase.setWithPriority",a,!1);Fa("Firebase.setWithPriority",2,b,!1);z("Firebase.setWithPriority",3,c,!0);if(".length"===this.name()||".keys"===this.name())throw"Firebase.setWithPriority failed: "+this.name()+" is a read-only object.";this.m.kb(this.path,a,b,c)};E.prototype.setWithPriority=E.prototype.kb;
E.prototype.remove=function(a){x("Firebase.remove",0,1,arguments.length);B("Firebase.remove",this.path);z("Firebase.remove",1,a,!0);this.set(null,a)};E.prototype.remove=E.prototype.remove;
E.prototype.transaction=function(a,b,c){x("Firebase.transaction",1,3,arguments.length);B("Firebase.transaction",this.path);z("Firebase.transaction",1,a,!1);z("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(y("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.name()||".keys"===this.name())throw"Firebase.transaction failed: "+this.name()+" is a read-only object.";"undefined"===typeof c&&(c=!0);Oe(this.m,this.path,a,b,c)};E.prototype.transaction=E.prototype.transaction;
E.prototype.Wc=function(a,b){x("Firebase.setPriority",1,2,arguments.length);B("Firebase.setPriority",this.path);Fa("Firebase.setPriority",1,a,!1);z("Firebase.setPriority",2,b,!0);this.m.Wc(this.path,a,b)};E.prototype.setPriority=E.prototype.Wc;E.prototype.push=function(a,b){x("Firebase.push",0,2,arguments.length);B("Firebase.push",this.path);Aa("Firebase.push",a,!0);z("Firebase.push",2,b,!0);var c=Fe(this.m),c=Ze(c),c=this.G(c);"undefined"!==typeof a&&null!==a&&c.set(a,b);return c};
E.prototype.push=E.prototype.push;E.prototype.ia=function(){return new $(this.m,this.path,this.name())};E.prototype.onDisconnect=E.prototype.ia;E.prototype.be=function(){L("FirebaseRef.removeOnDisconnect() being deprecated. Please use FirebaseRef.onDisconnect().remove() instead.");this.ia().remove();Ne(this.m)};E.prototype.removeOnDisconnect=E.prototype.be;
E.prototype.fe=function(a){L("FirebaseRef.setOnDisconnect(value) being deprecated. Please use FirebaseRef.onDisconnect().set(value) instead.");this.ia().set(a);Ne(this.m)};E.prototype.setOnDisconnect=E.prototype.fe;E.prototype.mb=function(a,b,c){x("Firebase.auth",1,3,arguments.length);if(!q(a))throw Error(y("Firebase.auth",1,!1)+"must be a valid credential (a string).");z("Firebase.auth",2,b,!0);z("Firebase.auth",3,b,!0);this.m.mb(a,b,c)};E.prototype.auth=E.prototype.mb;
E.prototype.Qb=function(a){x("Firebase.unauth",0,1,arguments.length);z("Firebase.unauth",1,a,!0);this.m.Qb(a)};E.prototype.unauth=E.prototype.Qb;E.goOffline=function(){x("Firebase.goOffline",0,0,arguments.length);Y.sb().La()};E.goOnline=function(){x("Firebase.goOnline",0,0,arguments.length);Y.sb().jb()};
function Sb(a,b){v(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Qb=r(console.log,console):"object"===typeof console.log&&(Qb=function(a){console.log(a)})),b&&ob.set("logging_enabled",!0)):a?Qb=a:(Qb=null,ob.remove("logging_enabled"))}E.enableLogging=Sb;E.ServerValue={TIMESTAMP:{".sv":"timestamp"}};E.SDK_VERSION="1.0.21";E.INTERNAL=Z;E.Context=Y;})();
;(function() {var COMPILED=!0,goog=goog||{};goog.global=this;goog.exportPath_=function(a,d,e){a=a.split(".");e=e||goog.global;a[0]in e||!e.execScript||e.execScript("var "+a[0]);for(var f;a.length&&(f=a.shift());)a.length||void 0===d?e=e[f]?e[f]:e[f]={}:e[f]=d};goog.define=function(a,d){var e=d;COMPILED||goog.global.CLOSURE_DEFINES&&Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES,a)&&(e=goog.global.CLOSURE_DEFINES[a]);goog.exportPath_(a,e)};goog.DEBUG=!0;goog.LOCALE="en";goog.TRUSTED_SITE=!0;
goog.provide=function(a){if(!COMPILED){if(goog.isProvided_(a))throw Error('Namespace "'+a+'" already declared.');delete goog.implicitNamespaces_[a];for(var d=a;(d=d.substring(0,d.lastIndexOf(".")))&&!goog.getObjectByName(d);)goog.implicitNamespaces_[d]=!0}goog.exportPath_(a)};goog.setTestOnly=function(a){if(COMPILED&&!goog.DEBUG)throw a=a||"",Error("Importing test-only code into non-debug environment"+a?": "+a:".");};goog.forwardDeclare=function(a){};
COMPILED||(goog.isProvided_=function(a){return!goog.implicitNamespaces_[a]&&goog.isDefAndNotNull(goog.getObjectByName(a))},goog.implicitNamespaces_={});goog.getObjectByName=function(a,d){for(var e=a.split("."),f=d||goog.global,g;g=e.shift();)if(goog.isDefAndNotNull(f[g]))f=f[g];else return null;return f};goog.globalize=function(a,d){var e=d||goog.global,f;for(f in a)e[f]=a[f]};
goog.addDependency=function(a,d,e){if(goog.DEPENDENCIES_ENABLED){var f;a=a.replace(/\\/g,"/");for(var g=goog.dependencies_,h=0;f=d[h];h++)g.nameToPath[f]=a,a in g.pathToNames||(g.pathToNames[a]={}),g.pathToNames[a][f]=!0;for(f=0;d=e[f];f++)a in g.requires||(g.requires[a]={}),g.requires[a][d]=!0}};goog.ENABLE_DEBUG_LOADER=!0;
goog.require=function(a){if(!COMPILED&&!goog.isProvided_(a)){if(goog.ENABLE_DEBUG_LOADER){var d=goog.getPathFromDeps_(a);if(d){goog.included_[d]=!0;goog.writeScripts_();return}}a="goog.require could not find: "+a;goog.global.console&&goog.global.console.error(a);throw Error(a);}};goog.basePath="";goog.nullFunction=function(){};goog.identityFunction=function(a,d){return a};goog.abstractMethod=function(){throw Error("unimplemented abstract method");};
goog.addSingletonGetter=function(a){a.getInstance=function(){if(a.instance_)return a.instance_;goog.DEBUG&&(goog.instantiatedSingletons_[goog.instantiatedSingletons_.length]=a);return a.instance_=new a}};goog.instantiatedSingletons_=[];goog.DEPENDENCIES_ENABLED=!COMPILED&&goog.ENABLE_DEBUG_LOADER;
goog.DEPENDENCIES_ENABLED&&(goog.included_={},goog.dependencies_={pathToNames:{},nameToPath:{},requires:{},visited:{},written:{}},goog.inHtmlDocument_=function(){var a=goog.global.document;return"undefined"!=typeof a&&"write"in a},goog.findBasePath_=function(){if(goog.global.CLOSURE_BASE_PATH)goog.basePath=goog.global.CLOSURE_BASE_PATH;else if(goog.inHtmlDocument_())for(var a=goog.global.document.getElementsByTagName("script"),d=a.length-1;0<=d;--d){var e=a[d].src,f=e.lastIndexOf("?"),f=-1==f?e.length:
f;if("base.js"==e.substr(f-7,7)){goog.basePath=e.substr(0,f-7);break}}},goog.importScript_=function(a){var d=goog.global.CLOSURE_IMPORT_SCRIPT||goog.writeScriptTag_;!goog.dependencies_.written[a]&&d(a)&&(goog.dependencies_.written[a]=!0)},goog.writeScriptTag_=function(a){if(goog.inHtmlDocument_()){var d=goog.global.document;if("complete"==d.readyState){if(/\bdeps.js$/.test(a))return!1;throw Error('Cannot write "'+a+'" after document load');}d.write('<script type="text/javascript" src="'+a+'">\x3c/script>');
return!0}return!1},goog.writeScripts_=function(){function a(g){if(!(g in f.written)){if(!(g in f.visited)&&(f.visited[g]=!0,g in f.requires))for(var k in f.requires[g])if(!goog.isProvided_(k))if(k in f.nameToPath)a(f.nameToPath[k]);else throw Error("Undefined nameToPath for "+k);g in e||(e[g]=!0,d.push(g))}}var d=[],e={},f=goog.dependencies_,g;for(g in goog.included_)f.written[g]||a(g);for(g=0;g<d.length;g++)if(d[g])goog.importScript_(goog.basePath+d[g]);else throw Error("Undefined script input");
},goog.getPathFromDeps_=function(a){return a in goog.dependencies_.nameToPath?goog.dependencies_.nameToPath[a]:null},goog.findBasePath_(),goog.global.CLOSURE_NO_DEPS||goog.importScript_(goog.basePath+"deps.js"));
goog.typeOf=function(a){var d=typeof a;if("object"==d)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return d;var e=Object.prototype.toString.call(a);if("[object Window]"==e)return"object";if("[object Array]"==e||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==e||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==d&&"undefined"==typeof a.call)return"object";return d};goog.isDef=function(a){return void 0!==a};goog.isNull=function(a){return null===a};goog.isDefAndNotNull=function(a){return null!=a};goog.isArray=function(a){return"array"==goog.typeOf(a)};goog.isArrayLike=function(a){var d=goog.typeOf(a);return"array"==d||"object"==d&&"number"==typeof a.length};goog.isDateLike=function(a){return goog.isObject(a)&&"function"==typeof a.getFullYear};goog.isString=function(a){return"string"==typeof a};
goog.isBoolean=function(a){return"boolean"==typeof a};goog.isNumber=function(a){return"number"==typeof a};goog.isFunction=function(a){return"function"==goog.typeOf(a)};goog.isObject=function(a){var d=typeof a;return"object"==d&&null!=a||"function"==d};goog.getUid=function(a){return a[goog.UID_PROPERTY_]||(a[goog.UID_PROPERTY_]=++goog.uidCounter_)};goog.hasUid=function(a){return!!a[goog.UID_PROPERTY_]};goog.removeUid=function(a){"removeAttribute"in a&&a.removeAttribute(goog.UID_PROPERTY_);try{delete a[goog.UID_PROPERTY_]}catch(d){}};
goog.UID_PROPERTY_="closure_uid_"+(1E9*Math.random()>>>0);goog.uidCounter_=0;goog.getHashCode=goog.getUid;goog.removeHashCode=goog.removeUid;goog.cloneObject=function(a){var d=goog.typeOf(a);if("object"==d||"array"==d){if(a.clone)return a.clone();var d="array"==d?[]:{},e;for(e in a)d[e]=goog.cloneObject(a[e]);return d}return a};goog.bindNative_=function(a,d,e){return a.call.apply(a.bind,arguments)};
goog.bindJs_=function(a,d,e){if(!a)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,f);return a.apply(d,e)}}return function(){return a.apply(d,arguments)}};goog.bind=function(a,d,e){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?goog.bind=goog.bindNative_:goog.bind=goog.bindJs_;return goog.bind.apply(null,arguments)};
goog.partial=function(a,d){var e=Array.prototype.slice.call(arguments,1);return function(){var d=e.slice();d.push.apply(d,arguments);return a.apply(this,d)}};goog.mixin=function(a,d){for(var e in d)a[e]=d[e]};goog.now=goog.TRUSTED_SITE&&Date.now||function(){return+new Date};
goog.globalEval=function(a){if(goog.global.execScript)goog.global.execScript(a,"JavaScript");else if(goog.global.eval)if(null==goog.evalWorksForGlobals_&&(goog.global.eval("var _et_ = 1;"),"undefined"!=typeof goog.global._et_?(delete goog.global._et_,goog.evalWorksForGlobals_=!0):goog.evalWorksForGlobals_=!1),goog.evalWorksForGlobals_)goog.global.eval(a);else{var d=goog.global.document,e=d.createElement("script");e.type="text/javascript";e.defer=!1;e.appendChild(d.createTextNode(a));d.body.appendChild(e);
d.body.removeChild(e)}else throw Error("goog.globalEval not available");};goog.evalWorksForGlobals_=null;goog.getCssName=function(a,d){var e=function(a){return goog.cssNameMapping_[a]||a},f=function(a){a=a.split("-");for(var d=[],f=0;f<a.length;f++)d.push(e(a[f]));return d.join("-")},f=goog.cssNameMapping_?"BY_WHOLE"==goog.cssNameMappingStyle_?e:f:function(a){return a};return d?a+"-"+f(d):f(a)};goog.setCssNameMapping=function(a,d){goog.cssNameMapping_=a;goog.cssNameMappingStyle_=d};
!COMPILED&&goog.global.CLOSURE_CSS_NAME_MAPPING&&(goog.cssNameMapping_=goog.global.CLOSURE_CSS_NAME_MAPPING);goog.getMsg=function(a,d){var e=d||{},f;for(f in e){var g=(""+e[f]).replace(/\$/g,"$$$$");a=a.replace(RegExp("\\{\\$"+f+"\\}","gi"),g)}return a};goog.getMsgWithFallback=function(a,d){return a};goog.exportSymbol=function(a,d,e){goog.exportPath_(a,d,e)};goog.exportProperty=function(a,d,e){a[d]=e};
goog.inherits=function(a,d){function e(){}e.prototype=d.prototype;a.superClass_=d.prototype;a.prototype=new e;a.prototype.constructor=a;a.base=function(a,e,h){var k=Array.prototype.slice.call(arguments,2);return d.prototype[e].apply(a,k)}};
goog.base=function(a,d,e){var f=arguments.callee.caller;if(goog.DEBUG&&!f)throw Error("arguments.caller not defined.  goog.base() expects not to be running in strict mode. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");if(f.superClass_)return f.superClass_.constructor.apply(a,Array.prototype.slice.call(arguments,1));for(var g=Array.prototype.slice.call(arguments,2),h=!1,k=a.constructor;k;k=k.superClass_&&k.superClass_.constructor)if(k.prototype[d]===f)h=!0;else if(h)return k.prototype[d].apply(a,
g);if(a[d]===f)return a.constructor.prototype[d].apply(a,g);throw Error("goog.base called from a method of one name to a method of a different name");};goog.scope=function(a){a.call(goog.global)};var fb={simplelogin:{}};fb.simplelogin.Vars_=function(){this.apiHost="https://auth.firebase.com"};fb.simplelogin.Vars_.prototype.setApiHost=function(a){this.apiHost=a};fb.simplelogin.Vars_.prototype.getApiHost=function(){return this.apiHost};fb.simplelogin.Vars=new fb.simplelogin.Vars_;goog.json={};goog.json.USE_NATIVE_JSON=!1;goog.json.isValid_=function(a){return/^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""))};
goog.json.parse=goog.json.USE_NATIVE_JSON?goog.global.JSON.parse:function(a){a=String(a);if(goog.json.isValid_(a))try{return eval("("+a+")")}catch(d){}throw Error("Invalid JSON string: "+a);};goog.json.unsafeParse=goog.json.USE_NATIVE_JSON?goog.global.JSON.parse:function(a){return eval("("+a+")")};goog.json.serialize=goog.json.USE_NATIVE_JSON?goog.global.JSON.stringify:function(a,d){return(new goog.json.Serializer(d)).serialize(a)};goog.json.Serializer=function(a){this.replacer_=a};
goog.json.Serializer.prototype.serialize=function(a){var d=[];this.serialize_(a,d);return d.join("")};
goog.json.Serializer.prototype.serialize_=function(a,d){switch(typeof a){case "string":this.serializeString_(a,d);break;case "number":this.serializeNumber_(a,d);break;case "boolean":d.push(a);break;case "undefined":d.push("null");break;case "object":if(null==a){d.push("null");break}if(goog.isArray(a)){this.serializeArray(a,d);break}this.serializeObject_(a,d);break;case "function":break;default:throw Error("Unknown type: "+typeof a);}};
goog.json.Serializer.charToJsonCharCache_={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"};goog.json.Serializer.charsToReplace_=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_=function(a,d){d.push('"',a.replace(goog.json.Serializer.charsToReplace_,function(a){if(a in goog.json.Serializer.charToJsonCharCache_)return goog.json.Serializer.charToJsonCharCache_[a];var d=a.charCodeAt(0),g="\\u";16>d?g+="000":256>d?g+="00":4096>d&&(g+="0");return goog.json.Serializer.charToJsonCharCache_[a]=g+d.toString(16)}),'"')};goog.json.Serializer.prototype.serializeNumber_=function(a,d){d.push(isFinite(a)&&!isNaN(a)?a:"null")};
goog.json.Serializer.prototype.serializeArray=function(a,d){var e=a.length;d.push("[");for(var f="",g=0;g<e;g++)d.push(f),f=a[g],this.serialize_(this.replacer_?this.replacer_.call(a,String(g),f):f,d),f=",";d.push("]")};
goog.json.Serializer.prototype.serializeObject_=function(a,d){d.push("{");var e="",f;for(f in a)if(Object.prototype.hasOwnProperty.call(a,f)){var g=a[f];"function"!=typeof g&&(d.push(e),this.serializeString_(f,d),d.push(":"),this.serialize_(this.replacer_?this.replacer_.call(a,f,g):g,d),e=",")}d.push("}")};fb.simplelogin.util={};fb.simplelogin.util.json={};fb.simplelogin.util.json.parse=function(a){return"undefined"!==typeof JSON&&goog.isDef(JSON.parse)?JSON.parse(a):goog.json.parse(a)};fb.simplelogin.util.json.stringify=function(a){return"undefined"!==typeof JSON&&goog.isDef(JSON.stringify)?JSON.stringify(a):goog.json.serialize(a)};fb.simplelogin.transports={};fb.simplelogin.transports.Transport={};fb.simplelogin.Transport=function(){};fb.simplelogin.Transport.prototype.open=function(a,d,e){};fb.simplelogin.transports.Popup={};fb.simplelogin.Popup=function(){};fb.simplelogin.Popup.prototype.open=function(a,d,e){};fb.simplelogin.util.misc={};fb.simplelogin.util.misc.parseUrl=function(a){var d=document.createElement("a");d.href=a;return{protocol:d.protocol.replace(":",""),host:d.hostname,port:d.port,query:d.search,params:fb.simplelogin.util.misc.parseQuerystring(d.search),hash:d.hash.replace("#",""),path:d.pathname.replace(/^([^\/])/,"/$1")}};fb.simplelogin.util.misc.parseQuerystring=function(a){var d={};a=a.replace(/^\?/,"").split("&");for(var e=0;e<a.length;e++)if(a[e]){var f=a[e].split("=");d[f[0]]=f[1]}return d};
fb.simplelogin.util.misc.parseSubdomain=function(a){var d="";try{var e=fb.simplelogin.util.misc.parseUrl(a).host.split(".");2<e.length&&(d=e.slice(0,-2).join("."))}catch(f){}return d};fb.simplelogin.util.misc.warn=function(a){"undefined"!==typeof console&&("undefined"!==typeof console.warn?console.warn(a):console.log(a))};var popupTimeout=12E4;fb.simplelogin.transports.CordovaInAppBrowser_=function(){};
fb.simplelogin.transports.CordovaInAppBrowser_.prototype.open=function(a,d,e){callbackInvoked=!1;var f=function(){var a=Array.prototype.slice.apply(arguments);callbackInvoked||(callbackInvoked=!0,e.apply(null,a))},g=window.open(a+"&transport=internal-redirect-hash","blank","location=no");g.addEventListener("loadstop",function(a){var d;if(a&&a.url&&(a=fb.simplelogin.util.misc.parseUrl(a.url),"/blank/page.html"===a.path)){g.close();try{var e=fb.simplelogin.util.misc.parseQuerystring(a.hash);a={};for(var n in e)a[n]=
fb.simplelogin.util.json.parse(decodeURIComponent(e[n]));d=a}catch(q){}d&&d.token&&d.user?f(null,d):d&&d.error?f(d.error):f({code:"RESPONSE_PAYLOAD_ERROR",message:"Unable to parse response payload for PhoneGap."})}});g.addEventListener("exit",function(a){f({code:"USER_DENIED",message:"User cancelled the authentication request."})});setTimeout(function(){g&&g.close&&g.close()},popupTimeout)};fb.simplelogin.transports.CordovaInAppBrowser=new fb.simplelogin.transports.CordovaInAppBrowser_;fb.simplelogin.Errors={};var messagePrefix="FirebaseSimpleLogin: ",errors={UNKNOWN_ERROR:"An unknown error occurred.",INVALID_EMAIL:"Invalid email specified.",INVALID_PASSWORD:"Invalid password specified.",USER_DENIED:"User cancelled the authentication request.",RESPONSE_PAYLOAD_ERROR:"Unable to parse response payload.",TRIGGER_IO_TABS:'The "forge.tabs" module required when using Firebase Simple Login and                               Trigger.io. Without this module included and enabled, login attempts to                               OAuth authentication providers will not be able to complete.'};
fb.simplelogin.Errors.format=function(a,d){var e,f,g={},h=arguments;if(2===h.length)e=h[0],f=h[1];else if(1===h.length)if("object"===typeof h[0]&&h[0].code&&h[0].message){if(0===h[0].message.indexOf(messagePrefix))return h[0];e=h[0].code;f=h[0].message;g=h[0].data}else"string"===typeof h[0]&&(e=h[0],f=errors[e]);else e="UNKNOWN_ERROR",f=errors[e];f=Error(messagePrefix+f);f.code=e;g&&(f.data=g);return f};var RELAY_FRAME_NAME="__winchan_relay_frame",CLOSE_CMD="die";function addListener(a,d,e){a.attachEvent?a.attachEvent("on"+d,e):a.addEventListener&&a.addEventListener(d,e,!1)}function removeListener(a,d,e){a.detachEvent?a.detachEvent("on"+d,e):a.removeEventListener&&a.removeEventListener(d,e,!1)}function extractOrigin(a){/^https?:\/\//.test(a)||(a=window.location.href);var d=/^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(a);return d?d[1]:a}
function findRelay(){for(var a=window.location,d=window.opener.frames,a=a.protocol+"//"+a.host,e=d.length-1;0<=e;e--)try{if(0===d[e].location.href.indexOf(a)&&d[e].name===RELAY_FRAME_NAME)return d[e]}catch(f){}}
var isInternetExplorer=function(){var a,d=-1,e=navigator.userAgent;"Microsoft Internet Explorer"===navigator.appName?(a=/MSIE ([0-9]{1,}[\.0-9]{0,})/,(a=e.match(a))&&1<a.length&&(d=parseFloat(a[1]))):-1<e.indexOf("Trident")&&(a=/rv:([0-9]{2,2}[\.0-9]{0,})/,(a=e.match(a))&&1<a.length&&(d=parseFloat(a[1])));return 8<=d}();fb.simplelogin.transports.WinChan_=function(){};
fb.simplelogin.transports.WinChan_.prototype.open=function(a,d,e){function f(){k&&document.body.removeChild(k);k=void 0;s&&(s=clearInterval(s));removeListener(window,"message",g);removeListener(window,"unload",f);if(q)try{q.close()}catch(a){n.postMessage(CLOSE_CMD,l)}q=n=void 0}function g(a){if(a.origin===l)try{var d=fb.simplelogin.util.json.parse(a.data);"ready"===d.a?n.postMessage(m,l):"error"===d.a?(f(),e&&(e(d.d),e=null)):"response"===d.a&&(f(),e&&(e(null,d.d),e=null))}catch(g){}}if(!e)throw"missing required callback argument";
d.url=a;var h;d.url||(h="missing required 'url' parameter");d.relay_url||(h="missing required 'relay_url' parameter");h&&setTimeout(function(){e(h)},0);d.window_name||(d.window_name=null);if(!d.window_features||fb.simplelogin.util.env.isFennec())d.window_features=void 0;var k,l=extractOrigin(d.url);if(l!==extractOrigin(d.relay_url))return setTimeout(function(){e("invalid arguments: origin of url and relay_url must match")},0);var n;isInternetExplorer&&(k=document.createElement("iframe"),k.setAttribute("src",
d.relay_url),k.style.display="none",k.setAttribute("name",RELAY_FRAME_NAME),document.body.appendChild(k),n=k.contentWindow);var q=window.open(d.url,d.window_name,d.window_features);n||(n=q);var s=setInterval(function(){q&&q.closed&&(f(),e&&(e("unknown closed window"),e=null))},500),m=fb.simplelogin.util.json.stringify({a:"request",d:d.params});addListener(window,"unload",f);addListener(window,"message",g);return{close:f,focus:function(){if(q)try{q.focus()}catch(a){}}}};
goog.exportSymbol("fb.simplelogin.transports.WinChan_.prototype.open",fb.simplelogin.transports.WinChan_.prototype.open);
fb.simplelogin.transports.WinChan_.prototype.onOpen=function(a){function d(a){a=fb.simplelogin.util.json.stringify(a);isInternetExplorer?h.doPost(a,g):h.postMessage(a,g)}function e(f){var h;try{h=fb.simplelogin.util.json.parse(f.data)}catch(n){}h&&"request"===h.a&&(removeListener(window,"message",e),g=f.origin,a&&setTimeout(function(){a(g,h.d,function(e,f){k=!f;a=void 0;d({a:"response",d:e})})},0))}function f(a){if(k&&a.data===CLOSE_CMD)try{window.close()}catch(d){}}var g="*",h=isInternetExplorer?
findRelay():window.opener,k=!0;if(!h)throw"can't find relay frame";addListener(isInternetExplorer?h:window,"message",e);addListener(isInternetExplorer?h:window,"message",f);try{d({a:"ready"})}catch(l){addListener(h,"load",function(a){d({a:"ready"})})}var n=function(){try{removeListener(isInternetExplorer?h:window,"message",f)}catch(e){}a&&d({a:"error",d:"client closed window"});a=void 0;try{window.close()}catch(g){}};addListener(window,"unload",n);return{detach:function(){removeListener(window,"unload",
n)}}};goog.exportSymbol("fb.simplelogin.transports.WinChan_.prototype.onOpen",fb.simplelogin.transports.WinChan_.prototype.onOpen);fb.simplelogin.transports.WinChan_.prototype.isAvailable=function(){return fb.simplelogin.util.json&&fb.simplelogin.util.json.parse&&fb.simplelogin.util.json.stringify&&window.postMessage};fb.simplelogin.transports.WinChan=new fb.simplelogin.transports.WinChan_;fb.simplelogin.transports.TriggerIoTab_=function(){};
fb.simplelogin.transports.TriggerIoTab_.prototype.open=function(a,d,e){callbackInvoked=!1;var f=function(){var a=Array.prototype.slice.apply(arguments);callbackInvoked||(callbackInvoked=!0,e.apply(null,a))};forge.tabs.openWithOptions({url:a+"&transport=internal-redirect-hash",pattern:fb.simplelogin.Vars.getApiHost()+"/blank/page*"},function(a){var d;if(a&&a.url)try{var e=fb.simplelogin.util.misc.parseUrl(a.url),l=fb.simplelogin.util.misc.parseQuerystring(e.hash);a={};for(var n in l)a[n]=fb.simplelogin.util.json.parse(decodeURIComponent(l[n]));
d=a}catch(q){}d&&d.token&&d.user?f(null,d):d&&d.error?f(d.error):f({code:"RESPONSE_PAYLOAD_ERROR",message:"Unable to parse response payload for Trigger.io."})},function(a){f({code:"UNKNOWN_ERROR",message:"An unknown error occurred for Trigger.io."})})};fb.simplelogin.transports.TriggerIoTab=new fb.simplelogin.transports.TriggerIoTab_;var b,c;
!function(){var a={},d={};b=function(d,f,g){a[d]={deps:f,callback:g}};c=function(e){function f(a){if("."!==a.charAt(0))return a;a=a.split("/");for(var d=e.split("/").slice(0,-1),f=0,g=a.length;g>f;f++){var k=a[f];".."===k?d.pop():"."!==k&&d.push(k)}return d.join("/")}if(d[e])return d[e];if(d[e]={},!a[e])throw Error("Could not find module "+e);for(var g,h=a[e],k=h.deps,h=h.callback,l=[],n=0,q=k.length;q>n;n++)l.push("exports"===k[n]?g={}:c(f(k[n])));k=h.apply(this,l);return d[e]=g||k};c.entries=a}();
b("rsvp/all-settled",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=d.isArray,h=d.isNonThenable;e["default"]=function(a,d){return new f(function(d){function e(a){return function(d){m(a,{state:"fulfilled",value:d})}}function l(a){return function(d){m(a,{state:"rejected",reason:d})}}function m(a,e){u[a]=e;0===--r&&d(u)}if(!g(a))throw new TypeError("You must pass an array to allSettled.");var p,r=a.length;if(0===r)return void d([]);for(var u=Array(r),v=0;v<a.length;v++)p=a[v],
h(p)?m(v,{state:"fulfilled",value:p}):f.resolve(p).then(e(v),l(v))},d)}});b("rsvp/all",["./promise","exports"],function(a,d){var e=a["default"];d["default"]=function(a,d){return e.all(a,d)}});
b("rsvp/asap",["exports"],function(a){function d(){return function(){process.nextTick(g)}}function e(){var a=0,d=new k(g),e=document.createTextNode("");return d.observe(e,{characterData:!0}),function(){e.data=a=++a%2}}function f(){return function(){setTimeout(g,1)}}function g(){for(var a=0;a<l.length;a++){var d=l[a];(0,d[0])(d[1])}l.length=0}a["default"]=function(a,d){1===l.push([a,d])&&h()};var h;a="undefined"!=typeof window?window:{};var k=a.MutationObserver||a.WebKitMutationObserver,l=[];h="undefined"!=
typeof process&&"[object process]"==={}.toString.call(process)?d():k?e():f()});b("rsvp/config",["./events","exports"],function(a,d){var e={instrument:!1};a["default"].mixin(e);d.config=e;d.configure=function(a,d){return"onerror"===a?void e.on("error",d):2!==arguments.length?e[a]:void(e[a]=d)}});b("rsvp/defer",["./promise","exports"],function(a,d){var e=a["default"];d["default"]=function(a){var d={};return d.promise=new e(function(a,e){d.resolve=a;d.reject=e},a),d}});
b("rsvp/events",["exports"],function(a){function d(a,d){for(var e=0,k=a.length;k>e;e++)if(a[e]===d)return e;return-1}function e(a){var d=a._promiseCallbacks;return d||(d=a._promiseCallbacks={}),d}a["default"]={mixin:function(a){return a.on=this.on,a.off=this.off,a.trigger=this.trigger,a._promiseCallbacks=void 0,a},on:function(a,g){var h,k=e(this);(h=k[a])||(h=k[a]=[]);-1===d(h,g)&&h.push(g)},off:function(a,g){var h,k,l=e(this);return g?(h=l[a],k=d(h,g),void(-1!==k&&h.splice(k,1))):void(l[a]=[])},
trigger:function(a,d){var h;if(h=e(this)[a])for(var k=0;k<h.length;k++)(0,h[k])(d)}}});
b("rsvp/filter",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=d.isFunction;e["default"]=function(a,d,e){return f.all(a,e).then(function(a){if(!g(d))throw new TypeError("You must pass a function as filter's second argument.");for(var h=a.length,s=Array(h),m=0;h>m;m++)s[m]=d(a[m]);return f.all(s,e).then(function(d){for(var e=Array(h),f=0,g=0;h>g;g++)!0===d[g]&&(e[f]=a[g],f++);return e.length=f,e})})}});
b("rsvp/hash-settled",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=d.isNonThenable,h=d.keysOf;e["default"]=function(a){return new f(function(d){function e(a){return function(d){s(a,{state:"fulfilled",value:d})}}function q(a){return function(d){s(a,{state:"rejected",reason:d})}}function s(a,e){r[a]=e;0===--v&&d(r)}var m,p,r={},u=h(a),v=u.length;if(0===v)return void d(r);for(var t=0;t<u.length;t++)p=u[t],m=a[p],g(m)?s(p,{state:"fulfilled",value:m}):f.resolve(m).then(e(p),q(p))})}});
b("rsvp/hash",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=d.isNonThenable,h=d.keysOf;e["default"]=function(a){return new f(function(d,e){function q(a){return function(e){r[a]=e;0===--v&&d(r)}}function s(a){v=0;e(a)}var m,p,r={},u=h(a),v=u.length;if(0===v)return void d(r);for(var t=0;t<u.length;t++)p=u[t],m=a[p],g(m)?(r[p]=m,0===--v&&d(r)):f.resolve(m).then(q(p),s)})}});
b("rsvp/instrument",["./config","./utils","exports"],function(a,d,e){var f=a.config,g=d.now;e["default"]=function(a,d,e){try{f.trigger(a,{guid:d._guidKey+d._id,eventName:a,detail:d._detail,childGuid:e&&d._guidKey+e._id,label:d._label,timeStamp:g(),stack:Error(d._label).stack})}catch(n){setTimeout(function(){throw n;},0)}}});
b("rsvp/map",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=(d.isArray,d.isFunction);e["default"]=function(a,d,e){return f.all(a,e).then(function(a){if(!g(d))throw new TypeError("You must pass a function as map's second argument.");for(var h=a.length,s=Array(h),m=0;h>m;m++)s[m]=d(a[m]);return f.all(s,e)})}});
b("rsvp/node",["./promise","./utils","exports"],function(a,d,e){var f=a["default"],g=d.isArray;e["default"]=function(a,d){function e(){for(var g=arguments.length,m=Array(g),l=0;g>l;l++)m[l]=arguments[l];var r;return n||q||!d?r=this:(console.warn('Deprecation: RSVP.denodeify() doesn\'t allow setting the "this" binding anymore. Use yourFunction.bind(yourThis) instead.'),r=d),f.all(m).then(function(e){return new f(function(f,g){e.push(function(){for(var a=arguments.length,e=Array(a),h=0;a>h;h++)e[h]=
arguments[h];a=e[0];h=e[1];if(a)g(a);else if(n)f(e.slice(1));else if(q){for(var a={},l=e.slice(1),h=0;h<d.length;h++)e=d[h],a[e]=l[h];f(a)}else f(h)});a.apply(r,e)})})}var n=!0===d,q=g(d);return e.__proto__=a,e}});
b("rsvp/promise","./config ./events ./instrument ./utils ./promise/cast ./promise/all ./promise/race ./promise/resolve ./promise/reject exports".split(" "),function(a,d,e,f,g,h,k,l,n,q){function s(){}function m(a,d){if(!B(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof m))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._id=
H++;this._label=d;this._subscribers=[];z.instrument&&C("created",this);s!==a&&p(a,this)}function p(a,d){function e(a){y(d,a)}function f(a){x(d,a)}try{a(e,f)}catch(g){f(g)}}function r(a,d,e,f){a=a._subscribers;var g=a.length;a[g]=d;a[g+A]=e;a[g+D]=f}function u(a,d){var e,f,g=a._subscribers,h=a._detail;z.instrument&&C(d===A?"fulfilled":"rejected",a);for(var k=0;k<g.length;k+=3)e=g[k],f=g[k+d],v(d,e,f,h);a._subscribers=null}function v(a,d,e,f){var g,h,k,l,m=B(e);if(m)try{g=e(f),k=!0}catch(n){l=!0,h=
n}else g=f,k=!0;t(d,g)||(m&&k?y(d,g):l?x(d,h):a===A?y(d,g):a===D&&x(d,g))}function t(a,d){var e,f=null;try{if(a===d)throw new TypeError("A promises callback cannot return that same promise.");if(I(d)&&(f=d.then,B(f)))return f.call(d,function(f){return e?!0:(e=!0,void(d!==f?y(a,f):w(a,f)))},function(d){return e?!0:(e=!0,void x(a,d))},"Settle: "+(a._label||" unknown promise")),!0}catch(g){return e?!0:(x(a,g),!0)}return!1}function y(a,d){a===d?w(a,d):t(a,d)||w(a,d)}function w(a,d){a._state===E&&(a._state=
F,a._detail=d,z.async(G,a))}function x(a,d){a._state===E&&(a._state=F,a._detail=d,z.async(J,a))}function G(a){u(a,a._state=A)}function J(a){a._onerror&&a._onerror(a._detail);u(a,a._state=D)}var z=a.config,C=(d["default"],e["default"]),I=f.objectOrFunction,B=f.isFunction;a=f.now;g=g["default"];h=h["default"];k=k["default"];l=l["default"];n=n["default"];a="rsvp_"+a()+"-";var H=0;q["default"]=m;m.cast=g;m.all=h;m.race=k;m.resolve=l;m.reject=n;var E=void 0,F=0,A=1,D=2;m.prototype={constructor:m,_id:void 0,
_guidKey:a,_label:void 0,_state:void 0,_detail:void 0,_subscribers:void 0,_onerror:function(a){z.trigger("error",a)},then:function(a,d,e){var f=this;this._onerror=null;var g=new this.constructor(s,e);if(this._state){var h=arguments;z.async(function(){v(f._state,g,h[f._state-1],f._detail)})}else r(this,g,a,d);return z.instrument&&C("chained",f,g),g},"catch":function(a,d){return this.then(null,a,d)},"finally":function(a,d){var e=this.constructor;return this.then(function(d){return e.resolve(a()).then(function(){return d})},
function(d){return e.resolve(a()).then(function(){throw d;})},d)}}});
b("rsvp/promise/all",["../utils","exports"],function(a,d){var e=a.isArray,f=a.isNonThenable;d["default"]=function(a,d){var k=this;return new k(function(d,h){function q(a){return function(e){r[a]=e;0===--p&&d(r)}}function s(a){p=0;h(a)}if(!e(a))throw new TypeError("You must pass an array to all.");var m,p=a.length,r=Array(p);if(0===p)return void d(r);for(var u=0;u<a.length;u++)m=a[u],f(m)?(r[u]=m,0===--p&&d(r)):k.resolve(m).then(q(u),s)},d)}});
b("rsvp/promise/cast",["exports"],function(a){a["default"]=function(a,e){return a&&"object"==typeof a&&a.constructor===this?a:new this(function(e){e(a)},e)}});
b("rsvp/promise/race",["../utils","exports"],function(a,d){var e=a.isArray,f=(a.isFunction,a.isNonThenable);d["default"]=function(a,d){var k,l=this;return new l(function(d,h){function s(a){p&&(p=!1,d(a))}function m(a){p&&(p=!1,h(a))}if(!e(a))throw new TypeError("You must pass an array to race.");for(var p=!0,r=0;r<a.length;r++){if(k=a[r],f(k))return p=!1,void d(k);l.resolve(k).then(s,m)}},d)}});
b("rsvp/promise/reject",["exports"],function(a){a["default"]=function(a,e){return new this(function(e,g){g(a)},e)}});b("rsvp/promise/resolve",["exports"],function(a){a["default"]=function(a,e){return a&&"object"==typeof a&&a.constructor===this?a:new this(function(e){e(a)},e)}});b("rsvp/race",["./promise","exports"],function(a,d){var e=a["default"];d["default"]=function(a,d){return e.race(a,d)}});
b("rsvp/reject",["./promise","exports"],function(a,d){var e=a["default"];d["default"]=function(a,d){return e.reject(a,d)}});b("rsvp/resolve",["./promise","exports"],function(a,d){var e=a["default"];d["default"]=function(a,d){return e.resolve(a,d)}});b("rsvp/rethrow",["exports"],function(a){a["default"]=function(a){throw setTimeout(function(){throw a;}),a;}});
b("rsvp/utils",["exports"],function(a){function d(a){return"function"==typeof a||"object"==typeof a&&null!==a}a.objectOrFunction=d;a.isFunction=function(a){return"function"==typeof a};a.isNonThenable=function(a){return!d(a)};a.isArray=Array.isArray?Array.isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)};a.now=Date.now||function(){return(new Date).getTime()};a.keysOf=Object.keys||function(a){var d=[],g;for(g in a)d.push(g);return d}});
b("rsvp","./rsvp/promise ./rsvp/events ./rsvp/node ./rsvp/all ./rsvp/all-settled ./rsvp/race ./rsvp/hash ./rsvp/hash-settled ./rsvp/rethrow ./rsvp/defer ./rsvp/config ./rsvp/map ./rsvp/resolve ./rsvp/reject ./rsvp/filter ./rsvp/asap exports".split(" "),function(a,d,e,f,g,h,k,l,n,q,s,m,p,r,u,v,t){function y(){w.on.apply(w,arguments)}a=a["default"];d=d["default"];e=e["default"];f=f["default"];g=g["default"];h=h["default"];k=k["default"];l=l["default"];n=n["default"];q=q["default"];var w=s.config;s=
s.configure;m=m["default"];p=p["default"];r=r["default"];u=u["default"];if(w.async=v["default"],"undefined"!=typeof window&&"object"==typeof window.__PROMISE_INSTRUMENTATION__){v=window.__PROMISE_INSTRUMENTATION__;s("instrument",!0);for(var x in v)v.hasOwnProperty(x)&&y(x,v[x])}t.Promise=a;t.EventTarget=d;t.all=f;t.allSettled=g;t.race=h;t.hash=k;t.hashSettled=l;t.rethrow=n;t.defer=q;t.denodeify=e;t.configure=s;t.on=y;t.off=function(){w.off.apply(w,arguments)};t.resolve=p;t.reject=r;t.async=function(a,
d){w.async(a,d)};t.map=m;t.filter=u});fb.simplelogin.util.RSVP=c("rsvp");fb.simplelogin.util.env={};fb.simplelogin.util.env.hasLocalStorage=function(a){try{if(localStorage){localStorage.setItem("firebase-sentinel","test");var d=localStorage.getItem("firebase-sentinel");localStorage.removeItem("firebase-sentinel");return"test"===d}}catch(e){}return!1};
fb.simplelogin.util.env.hasSessionStorage=function(a){try{if(sessionStorage){sessionStorage.setItem("firebase-sentinel","test");var d=sessionStorage.getItem("firebase-sentinel");sessionStorage.removeItem("firebase-sentinel");return"test"===d}}catch(e){}return!1};fb.simplelogin.util.env.isMobileCordovaInAppBrowser=function(){return(window.cordova||window.CordovaInAppBrowser||window.phonegap)&&/ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)};
fb.simplelogin.util.env.isMobileTriggerIoTab=function(){return window.forge&&/ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)};fb.simplelogin.util.env.isWindowsMetro=function(){return!!window.Windows&&/^ms-appx:/.test(location.href)};fb.simplelogin.util.env.isChromeiOS=function(){return!!navigator.userAgent.match(/CriOS/)};fb.simplelogin.util.env.isTwitteriOS=function(){return!!navigator.userAgent.match(/Twitter for iPhone/)};fb.simplelogin.util.env.isFacebookiOS=function(){return!!navigator.userAgent.match(/FBAN\/FBIOS/)};
fb.simplelogin.util.env.isWindowsPhone=function(){return!!navigator.userAgent.match(/Windows Phone/)};fb.simplelogin.util.env.isStandaloneiOS=function(){return!!window.navigator.standalone};fb.simplelogin.util.env.isPhantomJS=function(){return!!navigator.userAgent.match(/PhantomJS/)};
fb.simplelogin.util.env.isIeLT10=function(){var a,d=-1,e=navigator.userAgent;return"Microsoft Internet Explorer"===navigator.appName&&(a=/MSIE ([0-9]{1,}[\.0-9]{0,})/,(a=e.match(a))&&1<a.length&&(d=parseFloat(a[1])),10>d)?!0:!1};fb.simplelogin.util.env.isFennec=function(){try{var a=navigator.userAgent;return-1!=a.indexOf("Fennec/")||-1!=a.indexOf("Firefox/")&&-1!=a.indexOf("Android")}catch(d){}return!1};fb.simplelogin.transports.XHR_=function(){};
fb.simplelogin.transports.XHR_.prototype.open=function(a,d,e){var f={contentType:"application/json"},g=new XMLHttpRequest,h=(f.method||"GET").toUpperCase(),k=f.contentType||"application/x-www-form-urlencoded",l=!1,n;g.onreadystatechange=function(){if(!l&&4===g.readyState){l=!0;var a,d;try{a=fb.simplelogin.util.json.parse(g.responseText),d=a.error||null,delete a.error}catch(f){}return e&&e(d,a)}};d&&("GET"===h?(-1===a.indexOf("?")&&(a+="?"),a+=this.formatQueryString(d),d=null):("application/json"===
k&&(d=fb.simplelogin.util.json.stringify(d)),"application/x-www-form-urlencoded"===k&&(d=this.formatQueryString(d))));g.open(h,a,!0);a={"X-Requested-With":"XMLHttpRequest",Accept:"application/json;text/plain","Content-Type":k};f.headers=f.headers||{};for(n in f.headers)a[n]=f.headers[n];for(n in a)g.setRequestHeader(n,a[n]);g.send(d)};fb.simplelogin.transports.XHR_.prototype.isAvailable=function(){return window.XMLHttpRequest&&"function"===typeof window.XMLHttpRequest&&!fb.simplelogin.util.env.isIeLT10()};
fb.simplelogin.transports.XHR_.prototype.formatQueryString=function(a){if(!a)return"";var d=[],e;for(e in a)d.push(encodeURIComponent(e)+"="+encodeURIComponent(a[e]));return d.join("&")};fb.simplelogin.transports.XHR=new fb.simplelogin.transports.XHR_;fb.simplelogin.util.validation={};var VALID_EMAIL_REGEX_=/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;fb.simplelogin.util.validation.validateArgCount=function(a,d,e,f){var g;f<d?g="at least "+d:f>e&&(g=0===e?"none":"no more than "+e);if(g)throw Error(a+" failed: Was called with "+f+(1===f?" argument.":" arguments.")+" Expects "+g+".");};fb.simplelogin.util.validation.isValidEmail=function(a){return goog.isString(a)&&VALID_EMAIL_REGEX_.test(a)};
fb.simplelogin.util.validation.isValidPassword=function(a){return goog.isString(a)};fb.simplelogin.util.validation.isValidNamespace=function(a){return goog.isString(a)};
fb.simplelogin.util.validation.errorPrefix_=function(a,d,e){var f="";switch(d){case 1:f=e?"first":"First";break;case 2:f=e?"second":"Second";break;case 3:f=e?"third":"Third";break;case 4:f=e?"fourth":"Fourth";break;default:fb.core.util.validation.assert(!1,"errorPrefix_ called with argumentNumber > 4.  Need to update it?")}return a=a+" failed: "+(f+" argument ")};
fb.simplelogin.util.validation.validateNamespace=function(a,d,e,f){if((!f||goog.isDef(e))&&!goog.isString(e))throw Error(fb.simplelogin.util.validation.errorPrefix_(a,d,f)+"must be a valid firebase namespace.");};fb.simplelogin.util.validation.validateCallback=function(a,d,e,f){if((!f||goog.isDef(e))&&!goog.isFunction(e))throw Error(fb.simplelogin.util.validation.errorPrefix_(a,d,f)+"must be a valid function.");};
fb.simplelogin.util.validation.validateString=function(a,d,e,f){if((!f||goog.isDef(e))&&!goog.isString(e))throw Error(fb.simplelogin.util.validation.errorPrefix_(a,d,f)+"must be a valid string.");};fb.simplelogin.util.validation.validateContextObject=function(a,d,e,f){if(!f||goog.isDef(e))if(!goog.isObject(e)||null===e)throw Error(fb.simplelogin.util.validation.errorPrefix_(a,d,f)+"must be a valid context object.");};var CALLBACK_NAMESPACE="_FirebaseSimpleLoginJSONP";fb.simplelogin.transports.JSONP_=function(){window[CALLBACK_NAMESPACE]=window[CALLBACK_NAMESPACE]||{}};fb.simplelogin.transports.JSONP_.prototype.open=function(a,d,e){a+=/\?/.test(a)?"":"?";a+="&transport=jsonp";for(var f in d)a+="&"+encodeURIComponent(f)+"="+encodeURIComponent(d[f]);d=this.generateRequestId_();a+="&callback="+encodeURIComponent(CALLBACK_NAMESPACE+"."+d);this.registerCallback_(d,e);this.writeScriptTag_(d,a,e)};
fb.simplelogin.transports.JSONP_.prototype.generateRequestId_=function(){return"_FirebaseJSONP"+(new Date).getTime()+Math.floor(100*Math.random())};fb.simplelogin.transports.JSONP_.prototype.registerCallback_=function(a,d){var e=this;window[CALLBACK_NAMESPACE][a]=function(f){var g=f.error||null;delete f.error;d(g,f);e.removeCallback_(a)}};
fb.simplelogin.transports.JSONP_.prototype.removeCallback_=function(a){setTimeout(function(){delete window[CALLBACK_NAMESPACE][a];var d=document.getElementById(a);d&&d.parentNode.removeChild(d)},0)};
fb.simplelogin.transports.JSONP_.prototype.writeScriptTag_=function(a,d,e){var f=this;setTimeout(function(){try{var g=document.createElement("script");g.type="text/javascript";g.id=a;g.async=!0;g.src=d;g.onerror=function(){var d=document.getElementById(a);null!==d&&d.parentNode.removeChild(d);e&&e(f.formatError_({code:"SERVER_ERROR",message:"An unknown server error occurred."}))};document.getElementsByTagName("head")[0].appendChild(g)}catch(h){e&&e(f.formatError_({code:"SERVER_ERROR",message:"An unknown server error occurred."}))}},
0)};fb.simplelogin.transports.JSONP_.prototype.formatError_=function(a){var d;a?(d=Error(a.message),d.code=a.code||"UNKNOWN_ERROR"):(d=Error(),d.code="UNKNOWN_ERROR");return d};fb.simplelogin.transports.JSONP=new fb.simplelogin.transports.JSONP_;fb.simplelogin.providers={};fb.simplelogin.providers.Password_=function(){};fb.simplelogin.providers.Password_.prototype.getTransport_=function(){return fb.simplelogin.transports.XHR.isAvailable()?fb.simplelogin.transports.XHR:fb.simplelogin.transports.JSONP};
fb.simplelogin.providers.Password_.prototype.login=function(a,d){var e=fb.simplelogin.Vars.getApiHost()+"/auth/firebase";if(!fb.simplelogin.util.validation.isValidNamespace(a.firebase))return d&&d("INVALID_FIREBASE");this.getTransport_().open(e,a,d)};
fb.simplelogin.providers.Password_.prototype.createUser=function(a,d){var e=fb.simplelogin.Vars.getApiHost()+"/auth/firebase/create";if(!fb.simplelogin.util.validation.isValidNamespace(a.firebase))return d&&d("INVALID_FIREBASE");if(!fb.simplelogin.util.validation.isValidEmail(a.email))return d&&d("INVALID_EMAIL");if(!fb.simplelogin.util.validation.isValidPassword(a.password))return d&&d("INVALID_PASSWORD");this.getTransport_().open(e,a,d)};
fb.simplelogin.providers.Password_.prototype.changePassword=function(a,d){var e=fb.simplelogin.Vars.getApiHost()+"/auth/firebase/update";if(!fb.simplelogin.util.validation.isValidNamespace(a.firebase))return d&&d("INVALID_FIREBASE");if(!fb.simplelogin.util.validation.isValidEmail(a.email))return d&&d("INVALID_EMAIL");if(!fb.simplelogin.util.validation.isValidPassword(a.newPassword))return d&&d("INVALID_PASSWORD");this.getTransport_().open(e,a,d)};
fb.simplelogin.providers.Password_.prototype.removeUser=function(a,d){var e=fb.simplelogin.Vars.getApiHost()+"/auth/firebase/remove";if(!fb.simplelogin.util.validation.isValidNamespace(a.firebase))return d&&d("INVALID_FIREBASE");if(!fb.simplelogin.util.validation.isValidEmail(a.email))return d&&d("INVALID_EMAIL");if(!fb.simplelogin.util.validation.isValidPassword(a.password))return d&&d("INVALID_PASSWORD");this.getTransport_().open(e,a,d)};
fb.simplelogin.providers.Password_.prototype.sendPasswordResetEmail=function(a,d){var e=fb.simplelogin.Vars.getApiHost()+"/auth/firebase/reset_password";if(!fb.simplelogin.util.validation.isValidNamespace(a.firebase))return d&&d("INVALID_FIREBASE");if(!fb.simplelogin.util.validation.isValidEmail(a.email))return d&&d("INVALID_EMAIL");this.getTransport_().open(e,a,d)};fb.simplelogin.providers.Password=new fb.simplelogin.providers.Password_;fb.simplelogin.transports.WindowsMetroAuthBroker_=function(){};
fb.simplelogin.transports.WindowsMetroAuthBroker_.prototype.open=function(a,d,e){var f,g,h,k,l,n;try{f=window.Windows.Foundation.Uri,g=window.Windows.Security.Authentication.Web.WebAuthenticationOptions,h=window.Windows.Security.Authentication.Web.WebAuthenticationBroker,k=h.authenticateAsync}catch(q){return e({code:"WINDOWS_METRO",message:'"Windows.Security.Authentication.Web.WebAuthenticationBroker" required when using Firebase Simple Login in Windows Metro context'})}l=!1;n=function(){var a=Array.prototype.slice.apply(arguments);
l||(l=!0,e.apply(null,a))};a=new f(a+"&transport=internal-redirect-hash");f=new f(fb.simplelogin.Vars.getApiHost()+"/blank/page.html");k(g.none,a,f).done(function(a){var d;if(a&&a.responseData)try{var e=fb.simplelogin.util.misc.parseUrl(a.responseData),f=fb.simplelogin.util.misc.parseQuerystring(e.hash);a={};for(var g in f)a[g]=fb.simplelogin.util.json.parse(decodeURIComponent(f[g]));d=a}catch(h){}d&&d.token&&d.user?n(null,d):d&&d.error?n(d.error):n({code:"RESPONSE_PAYLOAD_ERROR",message:"Unable to parse response payload for Windows."})},
function(a){n({code:"UNKNOWN_ERROR",message:"An unknown error occurred for Windows."})})};fb.simplelogin.transports.WindowsMetroAuthBroker=new fb.simplelogin.transports.WindowsMetroAuthBroker_;goog.string={};goog.string.Unicode={NBSP:"\u00a0"};goog.string.startsWith=function(a,d){return 0==a.lastIndexOf(d,0)};goog.string.endsWith=function(a,d){var e=a.length-d.length;return 0<=e&&a.indexOf(d,e)==e};goog.string.caseInsensitiveStartsWith=function(a,d){return 0==goog.string.caseInsensitiveCompare(d,a.substr(0,d.length))};goog.string.caseInsensitiveEndsWith=function(a,d){return 0==goog.string.caseInsensitiveCompare(d,a.substr(a.length-d.length,d.length))};
goog.string.caseInsensitiveEquals=function(a,d){return a.toLowerCase()==d.toLowerCase()};goog.string.subs=function(a,d){for(var e=a.split("%s"),f="",g=Array.prototype.slice.call(arguments,1);g.length&&1<e.length;)f+=e.shift()+g.shift();return f+e.join("%s")};goog.string.collapseWhitespace=function(a){return a.replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")};goog.string.isEmpty=function(a){return/^[\s\xa0]*$/.test(a)};goog.string.isEmptySafe=function(a){return goog.string.isEmpty(goog.string.makeSafe(a))};
goog.string.isBreakingWhitespace=function(a){return!/[^\t\n\r ]/.test(a)};goog.string.isAlpha=function(a){return!/[^a-zA-Z]/.test(a)};goog.string.isNumeric=function(a){return!/[^0-9]/.test(a)};goog.string.isAlphaNumeric=function(a){return!/[^a-zA-Z0-9]/.test(a)};goog.string.isSpace=function(a){return" "==a};goog.string.isUnicodeChar=function(a){return 1==a.length&&" "<=a&&"~">=a||"\u0080"<=a&&"\ufffd">=a};goog.string.stripNewlines=function(a){return a.replace(/(\r\n|\r|\n)+/g," ")};
goog.string.canonicalizeNewlines=function(a){return a.replace(/(\r\n|\r|\n)/g,"\n")};goog.string.normalizeWhitespace=function(a){return a.replace(/\xa0|\s/g," ")};goog.string.normalizeSpaces=function(a){return a.replace(/\xa0|[ \t]+/g," ")};goog.string.collapseBreakingSpaces=function(a){return a.replace(/[\t\r\n ]+/g," ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g,"")};goog.string.trim=function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};
goog.string.trimLeft=function(a){return a.replace(/^[\s\xa0]+/,"")};goog.string.trimRight=function(a){return a.replace(/[\s\xa0]+$/,"")};goog.string.caseInsensitiveCompare=function(a,d){var e=String(a).toLowerCase(),f=String(d).toLowerCase();return e<f?-1:e==f?0:1};goog.string.numerateCompareRegExp_=/(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare=function(a,d){if(a==d)return 0;if(!a)return-1;if(!d)return 1;for(var e=a.toLowerCase().match(goog.string.numerateCompareRegExp_),f=d.toLowerCase().match(goog.string.numerateCompareRegExp_),g=Math.min(e.length,f.length),h=0;h<g;h++){var k=e[h],l=f[h];if(k!=l)return e=parseInt(k,10),!isNaN(e)&&(f=parseInt(l,10),!isNaN(f)&&e-f)?e-f:k<l?-1:1}return e.length!=f.length?e.length-f.length:a<d?-1:1};goog.string.urlEncode=function(a){return encodeURIComponent(String(a))};
goog.string.urlDecode=function(a){return decodeURIComponent(a.replace(/\+/g," "))};goog.string.newLineToBr=function(a,d){return a.replace(/(\r\n|\r|\n)/g,d?"<br />":"<br>")};
goog.string.htmlEscape=function(a,d){if(d)return a.replace(goog.string.amperRe_,"&amp;").replace(goog.string.ltRe_,"&lt;").replace(goog.string.gtRe_,"&gt;").replace(goog.string.quotRe_,"&quot;").replace(goog.string.singleQuoteRe_,"&#39;");if(!goog.string.allRe_.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(goog.string.amperRe_,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(goog.string.ltRe_,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(goog.string.gtRe_,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(goog.string.quotRe_,
"&quot;"));-1!=a.indexOf("'")&&(a=a.replace(goog.string.singleQuoteRe_,"&#39;"));return a};goog.string.amperRe_=/&/g;goog.string.ltRe_=/</g;goog.string.gtRe_=/>/g;goog.string.quotRe_=/"/g;goog.string.singleQuoteRe_=/'/g;goog.string.allRe_=/[&<>"']/;goog.string.unescapeEntities=function(a){return goog.string.contains(a,"&")?"document"in goog.global?goog.string.unescapeEntitiesUsingDom_(a):goog.string.unescapePureXmlEntities_(a):a};
goog.string.unescapeEntitiesWithDocument=function(a,d){return goog.string.contains(a,"&")?goog.string.unescapeEntitiesUsingDom_(a,d):a};
goog.string.unescapeEntitiesUsingDom_=function(a,d){var e={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"'},f;f=d?d.createElement("div"):document.createElement("div");return a.replace(goog.string.HTML_ENTITY_PATTERN_,function(a,d){var k=e[a];if(k)return k;if("#"==d.charAt(0)){var l=Number("0"+d.substr(1));isNaN(l)||(k=String.fromCharCode(l))}k||(f.innerHTML=a+" ",k=f.firstChild.nodeValue.slice(0,-1));return e[a]=k})};
goog.string.unescapePureXmlEntities_=function(a){return a.replace(/&([^;]+);/g,function(a,e){switch(e){case "amp":return"&";case "lt":return"<";case "gt":return">";case "quot":return'"';default:if("#"==e.charAt(0)){var f=Number("0"+e.substr(1));if(!isNaN(f))return String.fromCharCode(f)}return a}})};goog.string.HTML_ENTITY_PATTERN_=/&([^;\s<&]+);?/g;goog.string.whitespaceEscape=function(a,d){return goog.string.newLineToBr(a.replace(/  /g," &#160;"),d)};
goog.string.stripQuotes=function(a,d){for(var e=d.length,f=0;f<e;f++){var g=1==e?d:d.charAt(f);if(a.charAt(0)==g&&a.charAt(a.length-1)==g)return a.substring(1,a.length-1)}return a};goog.string.truncate=function(a,d,e){e&&(a=goog.string.unescapeEntities(a));a.length>d&&(a=a.substring(0,d-3)+"...");e&&(a=goog.string.htmlEscape(a));return a};
goog.string.truncateMiddle=function(a,d,e,f){e&&(a=goog.string.unescapeEntities(a));if(f&&a.length>d){f>d&&(f=d);var g=a.length-f;a=a.substring(0,d-f)+"..."+a.substring(g)}else a.length>d&&(f=Math.floor(d/2),g=a.length-f,a=a.substring(0,f+d%2)+"..."+a.substring(g));e&&(a=goog.string.htmlEscape(a));return a};goog.string.specialEscapeChars_={"\x00":"\\0","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\x0B",'"':'\\"',"\\":"\\\\"};goog.string.jsEscapeCache_={"'":"\\'"};
goog.string.quote=function(a){a=String(a);if(a.quote)return a.quote();for(var d=['"'],e=0;e<a.length;e++){var f=a.charAt(e),g=f.charCodeAt(0);d[e+1]=goog.string.specialEscapeChars_[f]||(31<g&&127>g?f:goog.string.escapeChar(f))}d.push('"');return d.join("")};goog.string.escapeString=function(a){for(var d=[],e=0;e<a.length;e++)d[e]=goog.string.escapeChar(a.charAt(e));return d.join("")};
goog.string.escapeChar=function(a){if(a in goog.string.jsEscapeCache_)return goog.string.jsEscapeCache_[a];if(a in goog.string.specialEscapeChars_)return goog.string.jsEscapeCache_[a]=goog.string.specialEscapeChars_[a];var d=a,e=a.charCodeAt(0);if(31<e&&127>e)d=a;else{if(256>e){if(d="\\x",16>e||256<e)d+="0"}else d="\\u",4096>e&&(d+="0");d+=e.toString(16).toUpperCase()}return goog.string.jsEscapeCache_[a]=d};goog.string.toMap=function(a){for(var d={},e=0;e<a.length;e++)d[a.charAt(e)]=!0;return d};
goog.string.contains=function(a,d){return-1!=a.indexOf(d)};goog.string.countOf=function(a,d){return a&&d?a.split(d).length-1:0};goog.string.removeAt=function(a,d,e){var f=a;0<=d&&d<a.length&&0<e&&(f=a.substr(0,d)+a.substr(d+e,a.length-d-e));return f};goog.string.remove=function(a,d){var e=RegExp(goog.string.regExpEscape(d),"");return a.replace(e,"")};goog.string.removeAll=function(a,d){var e=RegExp(goog.string.regExpEscape(d),"g");return a.replace(e,"")};
goog.string.regExpEscape=function(a){return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")};goog.string.repeat=function(a,d){return Array(d+1).join(a)};goog.string.padNumber=function(a,d,e){a=goog.isDef(e)?a.toFixed(e):String(a);e=a.indexOf(".");-1==e&&(e=a.length);return goog.string.repeat("0",Math.max(0,d-e))+a};goog.string.makeSafe=function(a){return null==a?"":String(a)};goog.string.buildString=function(a){return Array.prototype.join.call(arguments,"")};
goog.string.getRandomString=function(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^goog.now()).toString(36)};
goog.string.compareVersions=function(a,d){for(var e=0,f=goog.string.trim(String(a)).split("."),g=goog.string.trim(String(d)).split("."),h=Math.max(f.length,g.length),k=0;0==e&&k<h;k++){var l=f[k]||"",n=g[k]||"",q=RegExp("(\\d*)(\\D*)","g"),s=RegExp("(\\d*)(\\D*)","g");do{var m=q.exec(l)||["","",""],p=s.exec(n)||["","",""];if(0==m[0].length&&0==p[0].length)break;var e=0==m[1].length?0:parseInt(m[1],10),r=0==p[1].length?0:parseInt(p[1],10),e=goog.string.compareElements_(e,r)||goog.string.compareElements_(0==
m[2].length,0==p[2].length)||goog.string.compareElements_(m[2],p[2])}while(0==e)}return e};goog.string.compareElements_=function(a,d){return a<d?-1:a>d?1:0};goog.string.HASHCODE_MAX_=4294967296;goog.string.hashCode=function(a){for(var d=0,e=0;e<a.length;++e)d=31*d+a.charCodeAt(e),d%=goog.string.HASHCODE_MAX_;return d};goog.string.uniqueStringCounter_=2147483648*Math.random()|0;goog.string.createUniqueString=function(){return"goog_"+goog.string.uniqueStringCounter_++};
goog.string.toNumber=function(a){var d=Number(a);return 0==d&&goog.string.isEmpty(a)?NaN:d};goog.string.isLowerCamelCase=function(a){return/^[a-z]+([A-Z][a-z]*)*$/.test(a)};goog.string.isUpperCamelCase=function(a){return/^([A-Z][a-z]*)+$/.test(a)};goog.string.toCamelCase=function(a){return String(a).replace(/\-([a-z])/g,function(a,e){return e.toUpperCase()})};goog.string.toSelectorCase=function(a){return String(a).replace(/([A-Z])/g,"-$1").toLowerCase()};
goog.string.toTitleCase=function(a,d){var e=goog.isString(d)?goog.string.regExpEscape(d):"\\s";return a.replace(RegExp("(^"+(e?"|["+e+"]+":"")+")([a-z])","g"),function(a,d,e){return d+e.toUpperCase()})};goog.string.parseInt=function(a){isFinite(a)&&(a=String(a));return goog.isString(a)?/^\s*-?0x/i.test(a)?parseInt(a,16):parseInt(a,10):NaN};goog.string.splitLimit=function(a,d,e){a=a.split(d);for(var f=[];0<e&&a.length;)f.push(a.shift()),e--;a.length&&f.push(a.join(d));return f};var sessionPersistentStorageKey="firebaseSession",hasLocalStorage=fb.simplelogin.util.env.hasLocalStorage();fb.simplelogin.SessionStore_=function(){};fb.simplelogin.SessionStore_.prototype.set=function(a,d){if(hasLocalStorage)try{localStorage.setItem(sessionPersistentStorageKey,fb.simplelogin.util.json.stringify(a))}catch(e){}};fb.simplelogin.SessionStore_.prototype.get=function(){if(hasLocalStorage){try{var a=localStorage.getItem(sessionPersistentStorageKey);if(a)return fb.simplelogin.util.json.parse(a)}catch(d){}return null}};
fb.simplelogin.SessionStore_.prototype.clear=function(){hasLocalStorage&&localStorage.removeItem(sessionPersistentStorageKey)};fb.simplelogin.SessionStore=new fb.simplelogin.SessionStore_;var CLIENT_VERSION="1.6.3";
fb.simplelogin.client=function(a,d,e,f){function g(a,d,e){setTimeout(function(){a(d,e)},0)}this.mRef=a;this.mNamespace=fb.simplelogin.util.misc.parseSubdomain(a.toString());this.sessionLengthDays=null;window._FirebaseSimpleLogin=window._FirebaseSimpleLogin||{};window._FirebaseSimpleLogin.callbacks=window._FirebaseSimpleLogin.callbacks||[];window._FirebaseSimpleLogin.callbacks.push({cb:d,ctx:e});"file:"!==window.location.protocol||fb.simplelogin.util.env.isPhantomJS()||fb.simplelogin.util.env.isMobileCordovaInAppBrowser()||fb.simplelogin.util.misc.warn("FirebaseSimpleLogin(): Due to browser security restrictions, loading applications via `file://*` URLs will prevent popup-based authentication providers from working properly. When testing locally, you'll need to run a barebones webserver on your machine rather than loading your test files via `file://*`. The easiest way to run a barebones server on your local machine is to `cd` to the root directory of your code and run `python -m SimpleHTTPServer`, which will allow you to access your content via `http://127.0.0.1:8000/*`.");
f&&fb.simplelogin.Vars.setApiHost(f);this.mLoginStateChange=function(a,d){var e=window._FirebaseSimpleLogin.callbacks||[];Array.prototype.slice.apply(arguments);for(var f=0;f<e.length;f++){var q=e[f],s=!!a||"undefined"===typeof q.user;if(!s){var m,p;q.user&&q.user.firebaseAuthToken&&(m=q.user.firebaseAuthToken);d&&d.firebaseAuthToken&&(p=d.firebaseAuthToken);s=(m||p)&&m!==p}window._FirebaseSimpleLogin.callbacks[f].user=d||null;s&&g(goog.bind(q.cb,q.ctx),a,d)}};this.resumeSession()};
fb.simplelogin.client.prototype.setApiHost=function(a){fb.simplelogin.Vars.setApiHost(a)};goog.exportSymbol("fb.simplelogin.client.prototype.setApiHost",fb.simplelogin.client.prototype.setApiHost);
fb.simplelogin.client.prototype.resumeSession=function(){var a=this,d;try{d=sessionStorage.getItem("firebaseRequestId"),sessionStorage.removeItem("firebaseRequestId")}catch(e){}if(d){var f=fb.simplelogin.transports.JSONP;fb.simplelogin.transports.XHR.isAvailable()&&(f=fb.simplelogin.transports.XHR);f.open(fb.simplelogin.Vars.getApiHost()+"/auth/session",{requestId:d,firebase:a.mNamespace},function(d,e){e&&e.token&&e.user?a.attemptAuth(e.token,e.user,!0):d?(fb.simplelogin.SessionStore.clear(),a.mLoginStateChange(d)):
(fb.simplelogin.SessionStore.clear(),a.mLoginStateChange(null,null))})}else(d=fb.simplelogin.SessionStore.get())&&d.token&&d.user?a.attemptAuth(d.token,d.user,!1):a.mLoginStateChange(null,null)};
fb.simplelogin.client.prototype.attemptAuth=function(a,d,e,f,g){var h=this;this.mRef.auth(a,function(k,l){k?(fb.simplelogin.SessionStore.clear(),h.mLoginStateChange(null,null),g&&g()):(e&&fb.simplelogin.SessionStore.set({token:a,user:d,sessionKey:d.sessionKey},h.sessionLengthDays),"function"==typeof l&&l(),delete d.sessionKey,d.firebaseAuthToken=a,h.mLoginStateChange(null,d),f&&f(d))},function(a){fb.simplelogin.SessionStore.clear();h.mLoginStateChange(null,null);g&&g()})};
fb.simplelogin.client.prototype.login=function(){fb.simplelogin.util.validation.validateString("FirebaseSimpleLogin.login()",1,arguments[0],!1);fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.login()",1,2,arguments.length);var a=arguments[0].toLowerCase(),d=arguments[1]||{};this.sessionLengthDays=d.rememberMe?30:null;switch(a){case "anonymous":return this.loginAnonymously(d);case "facebook-token":return this.loginWithFacebookToken(d);case "github":return this.loginWithGithub(d);
case "google-token":return this.loginWithGoogleToken(d);case "password":return this.loginWithPassword(d);case "twitter-token":return this.loginWithTwitterToken(d);case "facebook":return d.access_token?this.loginWithFacebookToken(d):this.loginWithFacebook(d);case "google":return d.access_token?this.loginWithGoogleToken(d):this.loginWithGoogle(d);case "twitter":return d.oauth_token&&d.oauth_token_secret?this.loginWithTwitterToken(d):this.loginWithTwitter(d);default:throw Error("FirebaseSimpleLogin.login("+
a+") failed: unrecognized authentication provider");}};goog.exportSymbol("fb.simplelogin.client.prototype.login",fb.simplelogin.client.prototype.login);
fb.simplelogin.client.prototype.loginAnonymously=function(a){var d=this;return new fb.simplelogin.util.RSVP.Promise(function(e,f){a.firebase=d.mNamespace;a.v=CLIENT_VERSION;fb.simplelogin.transports.JSONP.open(fb.simplelogin.Vars.getApiHost()+"/auth/anonymous",a,function(a,h){if(a||!h.token){var k=fb.simplelogin.Errors.format(a);d.mLoginStateChange(k,null);f(k)}else d.attemptAuth(h.token,h.user,!0,e,f)})})};
fb.simplelogin.client.prototype.loginWithPassword=function(a){var d=this;return new fb.simplelogin.util.RSVP.Promise(function(e,f){a.firebase=d.mNamespace;a.v=CLIENT_VERSION;fb.simplelogin.providers.Password.login(a,function(a,h){if(a||!h.token){var k=fb.simplelogin.Errors.format(a);d.mLoginStateChange(k,null);f(k)}else d.attemptAuth(h.token,h.user,!0,e,f)})})};fb.simplelogin.client.prototype.loginWithGithub=function(a){a.height=850;a.width=950;return this.loginViaOAuth("github",a)};
fb.simplelogin.client.prototype.loginWithGoogle=function(a){a.height=650;a.width=575;return this.loginViaOAuth("google",a)};fb.simplelogin.client.prototype.loginWithFacebook=function(a){a.height=400;a.width=535;return this.loginViaOAuth("facebook",a)};fb.simplelogin.client.prototype.loginWithTwitter=function(a){return this.loginViaOAuth("twitter",a)};fb.simplelogin.client.prototype.loginWithFacebookToken=function(a){return this.loginViaToken("facebook",a)};
fb.simplelogin.client.prototype.loginWithGoogleToken=function(a){return this.loginViaToken("google",a)};fb.simplelogin.client.prototype.loginWithTwitterToken=function(a){return this.loginViaToken("twitter",a)};fb.simplelogin.client.prototype.logout=function(){fb.simplelogin.SessionStore.clear();this.mRef.unauth();this.mLoginStateChange(null,null)};goog.exportSymbol("fb.simplelogin.client.prototype.logout",fb.simplelogin.client.prototype.logout);
fb.simplelogin.client.prototype.loginViaToken=function(a,d,e){d=d||{};d.v=CLIENT_VERSION;var f=this,g=fb.simplelogin.Vars.getApiHost()+"/auth/"+a+"/token?firebase="+f.mNamespace;return new fb.simplelogin.util.RSVP.Promise(function(a,e){fb.simplelogin.transports.JSONP.open(g,d,function(d,g){if(!d&&g.token&&g.user)f.attemptAuth(g.token,g.user,!0,a,e);else{var q=fb.simplelogin.Errors.format(d);f.mLoginStateChange(q);e(q)}})})};
fb.simplelogin.client.prototype.loginViaOAuth=function(a,d,e){d=d||{};var f=this,g=fb.simplelogin.Vars.getApiHost()+"/auth/"+a+"?firebase="+f.mNamespace;d.scope&&(g+="&scope="+d.scope);g+="&v="+encodeURIComponent(CLIENT_VERSION);a={menubar:0,location:0,resizable:0,scrollbars:1,status:0,dialog:1,width:700,height:375};d.height&&(a.height=d.height,delete d.height);d.width&&(a.width=d.width,delete d.width);e=fb.simplelogin.util.env.isMobileCordovaInAppBrowser()?"mobile-phonegap":fb.simplelogin.util.env.isMobileTriggerIoTab()?
"mobile-triggerio":fb.simplelogin.util.env.isWindowsMetro()?"windows-metro":"desktop";var h;if("desktop"===e){h=fb.simplelogin.transports.WinChan;e=[];for(var k in a)e.push(k+"="+a[k]);d.url+="&transport=winchan";d.relay_url=fb.simplelogin.Vars.getApiHost()+"/auth/channel";d.window_features=e.join(",")}else"mobile-phonegap"===e?h=fb.simplelogin.transports.CordovaInAppBrowser:"mobile-triggerio"===e?h=fb.simplelogin.transports.TriggerIoTab:"windows-metro"===e&&(h=fb.simplelogin.transports.WindowsMetroAuthBroker);
if(d.preferRedirect||fb.simplelogin.util.env.isChromeiOS()||fb.simplelogin.util.env.isWindowsPhone()||fb.simplelogin.util.env.isStandaloneiOS()||fb.simplelogin.util.env.isTwitteriOS()||fb.simplelogin.util.env.isFacebookiOS()){k=goog.string.getRandomString()+goog.string.getRandomString();try{sessionStorage.setItem("firebaseRequestId",k)}catch(l){}g+="&requestId="+k+"&fb_redirect_uri="+encodeURIComponent(window.location.href);window.location=g}else return new fb.simplelogin.util.RSVP.Promise(function(a,
e){h.open(g,d,function(d,g){if(g&&g.token&&g.user)f.attemptAuth(g.token,g.user,!0,a,e);else{var h=d||{code:"UNKNOWN_ERROR",message:"An unknown error occurred."};"unknown closed window"===d?h={code:"USER_DENIED",message:"User cancelled the authentication request."}:g&&g.error&&(h=g.error);h=fb.simplelogin.Errors.format(h);f.mLoginStateChange(h);e(h)}})})};
fb.simplelogin.client.prototype.manageFirebaseUsers=function(a,d,e){d.firebase=this.mNamespace;return new fb.simplelogin.util.RSVP.Promise(function(f,g){fb.simplelogin.providers.Password[a](d,function(a,d){if(a){var l=fb.simplelogin.Errors.format(a);g(l);return e&&e(l,null)}f(d);return e&&e(null,d)})})};fb.simplelogin.client.prototype.createUser=function(a,d,e){return this.manageFirebaseUsers("createUser",{email:a,password:d},e)};goog.exportSymbol("fb.simplelogin.client.prototype.createUser",fb.simplelogin.client.prototype.createUser);
fb.simplelogin.client.prototype.changePassword=function(a,d,e,f){return this.manageFirebaseUsers("changePassword",{email:a,oldPassword:d,newPassword:e},function(a){return f&&f(a)})};goog.exportSymbol("fb.simplelogin.client.prototype.changePassword",fb.simplelogin.client.prototype.changePassword);fb.simplelogin.client.prototype.removeUser=function(a,d,e){return this.manageFirebaseUsers("removeUser",{email:a,password:d},function(a){return e&&e(a)})};
goog.exportSymbol("fb.simplelogin.client.prototype.removeUser",fb.simplelogin.client.prototype.removeUser);fb.simplelogin.client.prototype.sendPasswordResetEmail=function(a,d){return this.manageFirebaseUsers("sendPasswordResetEmail",{email:a},function(a){return d&&d(a)})};goog.exportSymbol("fb.simplelogin.client.prototype.sendPasswordResetEmail",fb.simplelogin.client.prototype.sendPasswordResetEmail);fb.simplelogin.client.onOpen=function(a){fb.simplelogin.transports.WinChan.onOpen(a)};
goog.exportSymbol("fb.simplelogin.client.onOpen",fb.simplelogin.client.onOpen);fb.simplelogin.client.VERSION=function(){return CLIENT_VERSION};goog.exportSymbol("fb.simplelogin.client.VERSION",fb.simplelogin.client.VERSION);var FirebaseSimpleLogin=function(a,d,e,f){fb.simplelogin.util.validation.validateArgCount("new FirebaseSimpleLogin",1,4,arguments.length);fb.simplelogin.util.validation.validateCallback("new FirebaseSimpleLogin",2,d,!1);if(goog.isString(a))throw Error("new FirebaseSimpleLogin(): Oops, it looks like you passed a string instead of a Firebase reference (i.e. new Firebase(<firebaseURL>)).");var g=fb.simplelogin.util.misc.parseSubdomain(a.toString());if(!goog.isString(g))throw Error("new FirebaseSimpleLogin(): First argument must be a valid Firebase reference (i.e. new Firebase(<firebaseURL>)).");
var h=new fb.simplelogin.client(a,d,e,f);return{setApiHost:function(a){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.setApiHost",1,1,arguments.length);return h.setApiHost(a)},login:function(){return h.login.apply(h,arguments)},logout:function(){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.logout",0,0,arguments.length);return h.logout()},createUser:function(a,d,e){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.createUser",2,3,arguments.length);
fb.simplelogin.util.validation.validateCallback("FirebaseSimpleLogin.createUser",3,e,!0);return h.createUser(a,d,e)},changePassword:function(a,d,e,f){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.changePassword",3,4,arguments.length);fb.simplelogin.util.validation.validateCallback("FirebaseSimpleLogin.changePassword",4,f,!0);return h.changePassword(a,d,e,f)},removeUser:function(a,d,e){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.removeUser",2,3,arguments.length);
fb.simplelogin.util.validation.validateCallback("FirebaseSimpleLogin.removeUser",3,e,!0);return h.removeUser(a,d,e)},sendPasswordResetEmail:function(a,d){fb.simplelogin.util.validation.validateArgCount("FirebaseSimpleLogin.sendPasswordResetEmail",1,2,arguments.length);fb.simplelogin.util.validation.validateCallback("FirebaseSimpleLogin.sendPasswordResetEmail",2,d,!0);return h.sendPasswordResetEmail(a,d)}}};goog.exportSymbol("FirebaseSimpleLogin",FirebaseSimpleLogin);FirebaseSimpleLogin.onOpen=function(a){fb.simplelogin.client.onOpen(a)};
goog.exportProperty(FirebaseSimpleLogin,"onOpen",FirebaseSimpleLogin.onOpen);FirebaseSimpleLogin.VERSION=fb.simplelogin.client.VERSION();})();
;// Concat modules and export them as an app.
(function(root) {

  // All our modules will use global require.
  (function() {
    
    // app.coffee
    root.require.register('burnchart/src/app.js', function(exports, require, module) {
    
      var App, header;
      
      header = require('./components/header');
      
      document.title = 'BurnChart: GitHub Burndown Chart as a Service';
      
      App = Ractive.extend({
        template: require('./templates/layout'),
        'components': {
          'Header': header
        }
      });
      
      module.exports = new App();
      
    });

    // header.coffee
    root.require.register('burnchart/src/components/header.js', function(exports, require, module) {
    
      var firebase, user;
      
      firebase = require('../modules/firebase');
      
      user = require('../modules/user');
      
      module.exports = Ractive.extend({
        'template': require('../templates/header'),
        init: function() {
          console.log(this.get('user.uid'));
          return this.on('login', function() {
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
          console.log('Init Firebase');
          this.client = new Firebase("https://" + config.firebase + ".firebaseio.com");
          this.auth = new FirebaseSimpleLogin(this.client, function(err, obj) {
            if (err || !obj) {
              return authCb(err);
            }
            user.set(obj);
            return console.log("" + obj.displayName + " is logged in");
          });
        }
      
        FB.prototype.login = function(cb) {
          if (!this.client) {
            return cb('Client is not setup');
          }
          authCb = cb;
          console.log('Connecting GitHub account');
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
          user.reset();
          return console.log('You have logged out');
        };
      
        return FB;
      
      })();
      
      module.exports = new FB();
      
    });

    // user.coffee
    root.require.register('burnchart/src/modules/user.js', function(exports, require, module) {
    
      var user;
      
      module.exports = user = new Ractive();
      
      user.observe('uid', function() {
        return console.log('User', arguments);
      });
      
    });

    // header.mustache
    root.require.register('burnchart/src/templates/header.js', function(exports, require, module) {
    
      module.exports = ["<div id=\"head\">","    <div class=\"right\">","","    </div>","","    <h1><span class=\"icon fire-station\"></span></h1>","","    <div class=\"q\">","        <span class=\"icon search\"></span>","        <span class=\"icon down-open\"></span>","        <input type=\"text\" placeholder=\"Jump to...\">","    </div>","","    <ul>","        <li><a href=\"#\" class=\"add\"><span class=\"icon plus-circled\"></span> Add a Project</a></li>","        <li><a href=\"#\" class=\"faq\">FAQ</a></li>","    </ul>","</div>"].join("\n");
    });

    // layout.mustache
    root.require.register('burnchart/src/templates/layout.js', function(exports, require, module) {
    
      module.exports = ["<Header/>","","<div id=\"title\">","    <div class=\"wrap\">","        <h2>Disposable Project</h2>","        <span class=\"milestone\">Milestone 1.0</span>","        <p class=\"description\">The one where we deliver all that we promised.</p>","    </div>","</div>","","<div id=\"content\" class=\"wrap\">","    <div id=\"hero\">","        <div class=\"content\">","            <span class=\"icon address\"></span>","            <h2>See your project progress</h2>","            <p>Not sure where to start? Just add a demo repo to see a chart. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>","            <div class=\"cta\">","                <a href=\"#\" class=\"primary\"><span class=\"icon plus-circled\"></span> Add your project</a>","                <a href=\"#\" class=\"secondary\">Read the Guide</a>","            </div>","        </div>","    </div>","","    <div id=\"repos\">","        <div class=\"header\">","            <a href=\"#\" class=\"sort\"><span class=\"icon sort-alphabet\"></span> Sorted by priority</a>","            <h2>Projects</h2>","        </div>","","        <table>","            <tr>","                <td><a class=\"repo\" href=\"#\">radekstepan/disposable</a></td>","                <td><span class=\"milestone\">Milestone 1.0 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">40%</span>","                        <span class=\"due\">due on Friday</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:40%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr class=\"done\">","                <td><a class=\"repo\" href=\"#\">radekstepan/burnchart</a></td>","                <td><span class=\"milestone\">Beta Milestone <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">100%</span>","                        <span class=\"due\">due tomorrow</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar green\" style=\"width:100%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">intermine/intermine</a></td>","                <td><span class=\"milestone\">Emma Release 96 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">27%</span>","                        <span class=\"due\">due in 2 weeks</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:27%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","            <tr>","                <td><a class=\"repo\" href=\"#\">microsoft/windows</a></td>","                <td><span class=\"milestone\">RC 9 <span class=\"icon down-open\"></span></a></td>","                <td>","                    <div class=\"progress\">","                        <span class=\"percent\">90%</span>","                        <span class=\"due red\">overdue by a month</span>","                        <div class=\"outer bar\">","                            <div class=\"inner bar red\" style=\"width:90%\"></div>","                        </div>","                    </div>","                </td>","            </tr>","        </table>","","        <div class=\"footer\">","            <a href=\"#\"><span class=\"icon cog\"></span> Edit</a>","        </div>","    </div>","","    <div id=\"add\">","        <div class=\"header\">","            <h2>Add a Project</h2>","            <p>Type in the name of the repository as you would normally. If you'd like to add a private GitHub project, <a href=\"#\">Sign In</a> first.</p>","        </div>","","        <div class=\"form\">","            <table>","                <tr>","                    <td>","                        <input type=\"text\" placeholder=\"user/repo\" autocomplete=\"off\">","                    </td>","                    <td>","                        <a href=\"#\">Add</a>","                    </td>","                </tr>","            </table>","        </div>","","        <div class=\"footer\">","            <span class=\"icon spin6\"></span> Connecting to your repo.","        </div>","    </div>","</div>","","<div id=\"footer\">","    <div class=\"wrap\">","        &copy; 2012-2014 Radek Stepan","    </div>","</div>"].join("\n");
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