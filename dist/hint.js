(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Batarang instrumentation
 *
 * This gets loaded into the context of the app you are inspecting
 */
require('./loader');
require('angular-hint');

angular.hint.onAny(function (event, data, severity) {
  // EventEmitter2 usually omits the event type for the argument list (assigning it to `this.event`
  // instead), but under certain circumstances it may include it.
  if (this.event !== event) {
    severity = data;
    data = event;
    event = this.event;
  }

  window.postMessage({
    __fromBatarang: true,
    module: event.split(':')[0],
    event: event,
    data: data,
    severity: severity
  }, '*');
});

},{"./loader":2,"angular-hint":3}],2:[function(require,module,exports){
// BATARANG
// Loader file based on `angular-loader.js` v1.6.5-local+sha.c7e48c05b
// (https://github.com/angular/angular.js/pull/15881).
// Modified regions should be marked with `// BATARANG` comments.
/**
 * @license AngularJS v1.6.5-local+sha.59dbff0c7
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */

(function() {'use strict';
    // NOTE:
    // These functions are copied here from `src/Angular.js`, because they are needed inside the
    // `angular-loader.js` closure and need to be available before the main `angular.js` script has
    // been loaded.
    function isFunction(value) {return typeof value === 'function';}
    function isDefined(value) {return typeof value !== 'undefined';}
    function isNumber(value) {return typeof value === 'number';}
    function isObject(value) {return value !== null && typeof value === 'object';}
    function isScope(obj) {return obj && obj.$evalAsync && obj.$watch;}
    function isUndefined(value) {return typeof value === 'undefined';}
    function isWindow(obj) {return obj && obj.window === obj;}
    function sliceArgs(args, startIndex) {return Array.prototype.slice.call(args, startIndex || 0);}
    function toJsonReplacer(key, value) {
      var val = value;

      if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
        val = undefined;
      } else if (isWindow(value)) {
        val = '$WINDOW';
      } else if (value &&  window.document === value) {
        val = '$DOCUMENT';
      } else if (isScope(value)) {
        val = '$SCOPE';
      }

      return val;
    }

/* exported toDebugString */

// This file is also included in `angular-loader`, so `copy()` might not always be available in the
// closure. In such cases, it is lazily retrieved as `angular.copy()` when needed.
var copyFn;

function serializeObject(obj, maxDepth) {
  var seen = [];

  // There is no direct way to stringify object until reaching a specific depth
  // and a very deep object can cause a performance issue, so we copy the object
  // based on this specific depth and then stringify it.
  if (isValidObjectMaxDepth(maxDepth)) {
    if (!copyFn) {
      copyFn = copy || angular.copy;
    }
    obj = copyFn(obj, null, maxDepth);
  }
  return JSON.stringify(obj, function(key, val) {
    val = toJsonReplacer(key, val);
    if (isObject(val)) {

      if (seen.indexOf(val) >= 0) return '...';

      seen.push(val);
    }
    return val;
  });
}

function toDebugString(obj, maxDepth) {
  if (typeof obj === 'function') {
    return obj.toString().replace(/ \{[\s\S]*$/, '');
  } else if (isUndefined(obj)) {
    return 'undefined';
  } else if (typeof obj !== 'string') {
    return serializeObject(obj, maxDepth);
  }
  return obj;
}

/* exported
  minErrConfig,
  errorHandlingConfig,
  isValidObjectMaxDepth
*/

var minErrConfig = {
  objectMaxDepth: 5
};

/**
 * @ngdoc function
 * @name angular.errorHandlingConfig
 * @module ng
 * @kind function
 *
 * @description
 * Configure several aspects of error handling in AngularJS if used as a setter or return the
 * current configuration if used as a getter. The following options are supported:
 *
 * - **objectMaxDepth**: The maximum depth to which objects are traversed when stringified for error messages.
 *
 * Omitted or undefined options will leave the corresponding configuration values unchanged.
 *
 * @param {Object=} config - The configuration object. May only contain the options that need to be
 *     updated. Supported keys:
 *
 * * `objectMaxDepth`  **{Number}** - The max depth for stringifying objects. Setting to a
 *   non-positive or non-numeric value, removes the max depth limit.
 *   Default: 5
 */
function errorHandlingConfig(config) {
  if (isObject(config)) {
    if (isDefined(config.objectMaxDepth)) {
      minErrConfig.objectMaxDepth = isValidObjectMaxDepth(config.objectMaxDepth) ? config.objectMaxDepth : NaN;
    }
  } else {
    return minErrConfig;
  }
}

/**
 * @private
 * @param {Number} maxDepth
 * @return {boolean}
 */
function isValidObjectMaxDepth(maxDepth) {
  return isNumber(maxDepth) && maxDepth > 0;
}

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * AngularJS. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

function minErr(module, ErrorConstructor) {
  ErrorConstructor = ErrorConstructor || Error;
  return function() {
    var code = arguments[0],
      template = arguments[1],
      message = '[' + (module ? module + ':' : '') + code + '] ',
      templateArgs = sliceArgs(arguments, 2).map(function(arg) {
        return toDebugString(arg, minErrConfig.objectMaxDepth);
      }),
      paramPrefix, i;

    message += template.replace(/\{\d+\}/g, function(match) {
      var index = +match.slice(1, -1);

      if (index < templateArgs.length) {
        return templateArgs[index];
      }

      return match;
    });

    // BATARANG
    // Use the app's version in error URLs instead of the version this file was based on.
    var version = (angular.version && angular.version.full) || 'snapshot';
    message += '\nhttp://errors.angularjs.org/' + version + '/' +
      (module ? module + '/' : '') + code;

    for (i = 0, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
      message += paramPrefix + 'p' + i + '=' + encodeURIComponent(templateArgs[i]);
    }

    return new ErrorConstructor(message);
  };
}

/**
 * @ngdoc type
 * @name angular.Module
 * @module ng
 * @description
 *
 * Interface for configuring AngularJS {@link angular.module modules}.
 */

function setupModuleLoader(window) {

  var $injectorMinErr = minErr('$injector');
  var ngMinErr = minErr('ng');

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  var angular = ensure(window, 'angular', Object);

  // We need to expose `angular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
  angular.$$minErr = angular.$$minErr || minErr;

  return ensure(angular, 'module', function() {
    /** @type {Object.<string, angular.Module>} */
    var modules = {};

    /**
     * @ngdoc function
     * @name angular.module
     * @module ng
     * @description
     *
     * The `angular.module` is a global place for creating, registering and retrieving AngularJS
     * modules.
     * All modules (AngularJS core or 3rd party) that should be available to an application must be
     * registered using this mechanism.
     *
     * Passing one argument retrieves an existing {@link angular.Module},
     * whereas passing more than one argument creates a new {@link angular.Module}
     *
     *
     * # Module
     *
     * A module is a collection of services, directives, controllers, filters, and configuration information.
     * `angular.module` is used to configure the {@link auto.$injector $injector}.
     *
     * ```js
     * // Create a new module
     * var myModule = angular.module('myModule', []);
     *
     * // register a new service
     * myModule.value('appName', 'MyCoolApp');
     *
     * // configure existing services inside initialization blocks.
     * myModule.config(['$locationProvider', function($locationProvider) {
     *   // Configure existing providers
     *   $locationProvider.hashPrefix('!');
     * }]);
     * ```
     *
     * Then you can create an injector and load your modules like this:
     *
     * ```js
     * var injector = angular.injector(['ng', 'myModule'])
     * ```
     *
     * However it's more likely that you'll just use
     * {@link ng.directive:ngApp ngApp} or
     * {@link angular.bootstrap} to simplify this process for you.
     *
     * @param {!string} name The name of the module to create or retrieve.
     * @param {!Array.<string>=} requires If specified then new module is being created. If
     *        unspecified then the module is being retrieved for further configuration.
     * @param {Function=} configFn Optional configuration function for the module. Same as
     *        {@link angular.Module#config Module#config()}.
     * @returns {angular.Module} new module with the {@link angular.Module} api.
     */
    return function module(name, requires, configFn) {

      var info = {};

      var assertNotHasOwnProperty = function(name, context) {
        if (name === 'hasOwnProperty') {
          throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
        }
      };

      assertNotHasOwnProperty(name, 'module');
      if (requires && modules.hasOwnProperty(name)) {
        modules[name] = null;
      }
      return ensure(modules, name, function() {
        if (!requires) {
          throw $injectorMinErr('nomod', 'Module \'{0}\' is not available! You either misspelled ' +
             'the module name or forgot to load it. If registering a module ensure that you ' +
             'specify the dependencies as the second argument.', name);
        }

        /** @type {!Array.<Array.<*>>} */
        var invokeQueue = [];

        /** @type {!Array.<Function>} */
        var configBlocks = [];

        /** @type {!Array.<Function>} */
        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke', 'push', configBlocks);

        /** @type {angular.Module} */
        var moduleInstance = {
          // Private state
          // BATARANG
          // `_invokeQueue` needs to be handled in a special way in order to support both v1.2 and
          // v1.3+ apps. See its definition below for more details.
          //_invokeQueue: invokeQueue,
          _configBlocks: configBlocks,
          _runBlocks: runBlocks,

          /**
           * @ngdoc method
           * @name angular.Module#info
           * @module ng
           *
           * @param {Object=} info Information about the module
           * @returns {Object|Module} The current info object for this module if called as a getter,
           *                          or `this` if called as a setter.
           *
           * @description
           * Read and write custom information about this module.
           * For example you could put the version of the module in here.
           *
           * ```js
           * angular.module('myModule', []).info({ version: '1.0.0' });
           * ```
           *
           * The version could then be read back out by accessing the module elsewhere:
           *
           * ```
           * var version = angular.module('myModule').info().version;
           * ```
           *
           * You can also retrieve this information during runtime via the
           * {@link $injector#modules `$injector.modules`} property:
           *
           * ```js
           * var version = $injector.modules['myModule'].info().version;
           * ```
           */
          info: function(value) {
            if (isDefined(value)) {
              if (!isObject(value)) throw ngMinErr('aobj', 'Argument \'{0}\' must be an object', 'value');
              info = value;
              return this;
            }
            return info;
          },

          /**
           * @ngdoc property
           * @name angular.Module#requires
           * @module ng
           *
           * @description
           * Holds the list of modules which the injector will load before the current module is
           * loaded.
           */
          requires: requires,

          /**
           * @ngdoc property
           * @name angular.Module#name
           * @module ng
           *
           * @description
           * Name of the module.
           */
          name: name,


          /**
           * @ngdoc method
           * @name angular.Module#provider
           * @module ng
           * @param {string} name service name
           * @param {Function} providerType Construction function for creating new instance of the
           *                                service.
           * @description
           * See {@link auto.$provide#provider $provide.provider()}.
           */
          provider: invokeLaterAndSetModuleName('$provide', 'provider'),

          /**
           * @ngdoc method
           * @name angular.Module#factory
           * @module ng
           * @param {string} name service name
           * @param {Function} providerFunction Function for creating new instance of the service.
           * @description
           * See {@link auto.$provide#factory $provide.factory()}.
           */
          factory: invokeLaterAndSetModuleName('$provide', 'factory'),

          /**
           * @ngdoc method
           * @name angular.Module#service
           * @module ng
           * @param {string} name service name
           * @param {Function} constructor A constructor function that will be instantiated.
           * @description
           * See {@link auto.$provide#service $provide.service()}.
           */
          service: invokeLaterAndSetModuleName('$provide', 'service'),

          /**
           * @ngdoc method
           * @name angular.Module#value
           * @module ng
           * @param {string} name service name
           * @param {*} object Service instance object.
           * @description
           * See {@link auto.$provide#value $provide.value()}.
           */
          value: invokeLater('$provide', 'value'),

          /**
           * @ngdoc method
           * @name angular.Module#constant
           * @module ng
           * @param {string} name constant name
           * @param {*} object Constant value.
           * @description
           * Because the constants are fixed, they get applied before other provide methods.
           * See {@link auto.$provide#constant $provide.constant()}.
           */
          constant: invokeLater('$provide', 'constant', 'unshift'),

           /**
           * @ngdoc method
           * @name angular.Module#decorator
           * @module ng
           * @param {string} name The name of the service to decorate.
           * @param {Function} decorFn This function will be invoked when the service needs to be
           *                           instantiated and should return the decorated service instance.
           * @description
           * See {@link auto.$provide#decorator $provide.decorator()}.
           */
          decorator: invokeLaterAndSetModuleName('$provide', 'decorator', configBlocks),

          /**
           * @ngdoc method
           * @name angular.Module#animation
           * @module ng
           * @param {string} name animation name
           * @param {Function} animationFactory Factory function for creating new instance of an
           *                                    animation.
           * @description
           *
           * **NOTE**: animations take effect only if the **ngAnimate** module is loaded.
           *
           *
           * Defines an animation hook that can be later used with
           * {@link $animate $animate} service and directives that use this service.
           *
           * ```js
           * module.animation('.animation-name', function($inject1, $inject2) {
           *   return {
           *     eventName : function(element, done) {
           *       //code to run the animation
           *       //once complete, then run done()
           *       return function cancellationFunction(element) {
           *         //code to cancel the animation
           *       }
           *     }
           *   }
           * })
           * ```
           *
           * See {@link ng.$animateProvider#register $animateProvider.register()} and
           * {@link ngAnimate ngAnimate module} for more information.
           */
          animation: invokeLaterAndSetModuleName('$animateProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#filter
           * @module ng
           * @param {string} name Filter name - this must be a valid AngularJS expression identifier
           * @param {Function} filterFactory Factory function for creating new instance of filter.
           * @description
           * See {@link ng.$filterProvider#register $filterProvider.register()}.
           *
           * <div class="alert alert-warning">
           * **Note:** Filter names must be valid AngularJS {@link expression} identifiers, such as `uppercase` or `orderBy`.
           * Names with special characters, such as hyphens and dots, are not allowed. If you wish to namespace
           * your filters, then you can use capitalization (`myappSubsectionFilterx`) or underscores
           * (`myapp_subsection_filterx`).
           * </div>
           */
          filter: invokeLaterAndSetModuleName('$filterProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#controller
           * @module ng
           * @param {string|Object} name Controller name, or an object map of controllers where the
           *    keys are the names and the values are the constructors.
           * @param {Function} constructor Controller constructor function.
           * @description
           * See {@link ng.$controllerProvider#register $controllerProvider.register()}.
           */
          controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#directive
           * @module ng
           * @param {string|Object} name Directive name, or an object map of directives where the
           *    keys are the names and the values are the factories.
           * @param {Function} directiveFactory Factory function for creating new instance of
           * directives.
           * @description
           * See {@link ng.$compileProvider#directive $compileProvider.directive()}.
           */
          directive: invokeLaterAndSetModuleName('$compileProvider', 'directive'),

          /**
           * @ngdoc method
           * @name angular.Module#component
           * @module ng
           * @param {string} name Name of the component in camel-case (i.e. myComp which will match as my-comp)
           * @param {Object} options Component definition object (a simplified
           *    {@link ng.$compile#directive-definition-object directive definition object})
           *
           * @description
           * See {@link ng.$compileProvider#component $compileProvider.component()}.
           */
          component: invokeLaterAndSetModuleName('$compileProvider', 'component'),

          /**
           * @ngdoc method
           * @name angular.Module#config
           * @module ng
           * @param {Function} configFn Execute this function on module load. Useful for service
           *    configuration.
           * @description
           * Use this method to register work which needs to be performed on module loading.
           * For more about how to configure services, see
           * {@link providers#provider-recipe Provider Recipe}.
           */
          config: config,

          /**
           * @ngdoc method
           * @name angular.Module#run
           * @module ng
           * @param {Function} initializationFn Execute this function after injector creation.
           *    Useful for application initialization.
           * @description
           * Use this method to register work which should be performed when the injector is done
           * loading all modules.
           */
          run: function(block) {
            runBlocks.push(block);
            return this;
          }
        };

        // BATARANG
        // To make this loader compatible with both AngularJS v1.2 and v1.3+ apps, it must handle
        // v1.2 apps that do not know about `_configBlocks` and expect everything to be on the
        // `_invokeQueue`.
        Object.defineProperty(moduleInstance, '_invokeQueue', {
          get: function() {
            return (angular.version.minor <= 2) ? invokeQueue.concat(configBlocks) : invokeQueue;
          }
        });

        if (configFn) {
          config(configFn);
        }

        return moduleInstance;

        /**
         * @param {string} provider
         * @param {string} method
         * @param {String=} insertMethod
         * @returns {angular.Module}
         */
        function invokeLater(provider, method, insertMethod, queue) {
          if (!queue) queue = invokeQueue;
          return function() {
            queue[insertMethod || 'push']([provider, method, arguments]);
            return moduleInstance;
          };
        }

        /**
         * @param {string} provider
         * @param {string} method
         * @returns {angular.Module}
         */
        function invokeLaterAndSetModuleName(provider, method, queue) {
          if (!queue) queue = invokeQueue;
          return function(recipeName, factoryFunction) {
            if (factoryFunction && isFunction(factoryFunction)) factoryFunction.$$moduleName = name;
            queue.push([provider, method, arguments]);
            return moduleInstance;
          };
        }
      });
    };
  });

}

setupModuleLoader(window);
})(window);

/**
 * Closure compiler type information
 *
 * @typedef { {
 *   requires: !Array.<string>,
 *   invokeQueue: !Array.<Array.<*>>,
 *
 *   service: function(string, Function):angular.Module,
 *   factory: function(string, Function):angular.Module,
 *   value: function(string, *):angular.Module,
 *
 *   filter: function(string, Function):angular.Module,
 *
 *   init: function(Function):angular.Module
 * } }
 */
angular.Module;


},{}],3:[function(require,module,exports){
'use strict';

// Create pipe for all hint messages from different modules
require('./src/modules/hintEmitter');

// Load angular hint modules
require('./src/modules/controllers');
// require('./src/modules/directives');
// require('./src/modules/dom');
require('./src/modules/events');
// require('./src/modules/interpolation');
require('./src/modules/modules');
require('./src/modules/scopes');

// List of all possible modules
// The default ng-hint behavior loads all modules
var AVAILABLE_MODULES = [
  'ngHintControllers',
// 'ngHintDirectives',
//  'ngHintDom',
  'ngHintEvents',
//  'ngHintInterpolation',
  'ngHintModules',
  'ngHintScopes'
];

var SEVERITY_WARNING = 2;
var DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

var deferRegex = new RegExp('^' + DEFER_LABEL + '.*');
// Determine whether this run is by protractor.
// If protractor is running, the bootstrap will already be deferred.
// In this case `resumeBootstrap` should be patched to load the hint modules.
if (deferRegex.test(window.name)) {
  var originalResumeBootstrap;
  Object.defineProperty(angular, 'resumeBootstrap', {
    get: function() {
      return function(modules) {
        return originalResumeBootstrap.call(angular, modules.concat(loadModules()));
      };
    },
    set: function(resumeBootstrap) {
      originalResumeBootstrap = resumeBootstrap;
    }
  });
}
//If this is not a test, defer bootstrapping
else {
  window.name = DEFER_LABEL + window.name;

  // determine which modules to load and resume bootstrap
  document.addEventListener('DOMContentLoaded', maybeBootstrap);

  /* angular should remove DEFER_LABEL from window.name, but if angular is never loaded, we want
   to remove it ourselves, otherwise hint will incorrectly detect protractor as being present on
   the next page load */
  window.addEventListener('beforeunload', function() {
    if (deferRegex.test(window.name)) {
      window.name = window.name.substring(DEFER_LABEL.length);
    }
  });
}

function maybeBootstrap() {
  // we don't know if angular is loaded
  if (!angular.resumeBootstrap) {
    return setTimeout(maybeBootstrap, 1);
  }

  var modules = loadModules();
  angular.resumeBootstrap(modules);
}

function loadModules() {
  var modules = [], elt;
  if (angular.version.minor < 2) {
    return modules;
  }

  if ((elt = document.querySelector('[ng-hint-include]'))) {
    modules = hintModulesFromElement(elt);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = AVAILABLE_MODULES;
  } else {
    angular.hint.emit('general:noinclude', 'ngHint is included on the page, but is not active because ' +
      'there is no `ng-hint` attribute present', SEVERITY_WARNING);
  }
  return modules;
}

function excludeModules(modulesToExclude) {
  return AVAILABLE_MODULES.filter(function(module) {
    return modulesToExclude.indexOf(module) === -1;
  });
}

function hintModulesFromElement (elt) {
  var selectedModules = (elt.attributes['ng-hint-include'] ||
    elt.attributes['ng-hint-exclude']).value.split(' ');

  return selectedModules.map(hintModuleName).filter(function (name) {
    return (AVAILABLE_MODULES.indexOf(name) > -1) ||
      angular.hint.emit('general:404module', 'Module ' + name + ' could not be found', SEVERITY_WARNING);
  });
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title(str) {
  return str[0].toUpperCase() + str.substr(1);
}

var LEVELS = [
  'error',
  'warning',
  'suggestion'
];

},{"./src/modules/controllers":21,"./src/modules/events":22,"./src/modules/hintEmitter":23,"./src/modules/modules":24,"./src/modules/scopes":25}],4:[function(require,module,exports){
'use strict';

var list = 'click submit mouseenter mouseleave mousemove mousedown mouseover mouseup dblclick keyup keydown keypress blur focus submit cut copy paste'.split(' ');

module.exports = list.map(function(eventName) {
  return 'ng' + eventName.charAt(0).toUpperCase() + eventName.substr(1);
});

},{}],5:[function(require,module,exports){
'use strict';

module.exports = function summarizeModel (model) {

  if (model instanceof Array) {
    return JSON.stringify(model.map(summarizeProperty));
  } else if (typeof model === 'object') {
    return JSON.stringify(Object.
        keys(model).
        filter(isAngularPrivatePropertyName).
        reduce(shallowSummary, {}));
  } else {
    return model;
  }

  function shallowSummary (obj, prop) {
    obj[prop] = summarizeProperty(model[prop]);
    return obj;
  }
};

function isAngularPrivatePropertyName (key) {
  return !(key[0] === '$' && key[1] === '$') && key !== '$parent' && key !== '$root';
}

// TODO: handle DOM nodes, fns, etc better.
function summarizeProperty (obj) {
  return obj instanceof Array ?
      { '~array-length': obj.length } :
    obj === null ?
      null :
    typeof obj === 'object' ?
      { '~object': true } :
      obj;
}

},{}],6:[function(require,module,exports){
var MODULE_NAME = 'Modules';

module.exports = function(modules) {
  modules.forEach(function(module) {
    angular.hint.emit(MODULE_NAME, module.message, module.severity);
  });
};

},{}],7:[function(require,module,exports){
var modData = require('./moduleData');
  MODULE_NAME = 'Modules',
  SEVERITY_WARNING = 2;

module.exports = function() {
  var multiLoaded = [];
  for(var modName in modData.createdMulti) {
    var message = 'Multiple modules with name "' + modName + '" are being created and they will ' +
      'overwrite each other.';
    var multi = modData.createdMulti[modName];
    var multiLength = multi.length;
    var details = {
      existingModule: multi[multiLength - 1],
      overwrittenModules: multi.slice(0, multiLength - 1)
    };
    multiLoaded
      .push({module: details, message: message, name: MODULE_NAME, severity: SEVERITY_WARNING});
  }
  return multiLoaded;
};

},{"./moduleData":14}],8:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function(moduleName, getCreated) {
  return (getCreated)? modData.createdModules[moduleName] : modData.loadedModules[moduleName];
};

},{"./moduleData":14}],9:[function(require,module,exports){
var MODULE_NAME = 'Modules',
  SEVERITY_ERROR = 1;
 module.exports = function(attrs, ngAppFound) {
   if(attrs['ng-app'] && ngAppFound) {
     angular.hint.emit(MODULE_NAME, 'ng-app may only be included once. The module "' +
      attrs['ng-app'].value + '" was not used to bootstrap because ng-app was already included.',
      SEVERITY_ERROR);
   }
  return attrs['ng-app'] ? attrs['ng-app'].value : undefined;
 };



},{}],10:[function(require,module,exports){
var getModule = require('./getModule'),
  dictionary = Object.keys(require('./moduleData').createdModules),
  suggest = require('suggest-it')(dictionary),
  SEVERITY_ERROR = 1;

module.exports = function(loadedModules) {
  var undeclaredModules = [];
  for(var module in loadedModules) {
    var cModule = getModule(module, true);
    if(!cModule) {
      var match = suggest(module),
        suggestion = (match) ? '; Try: "'+match+'"' : '',
        message = 'Module "'+module+'" was loaded but does not exist'+suggestion+'.';

      undeclaredModules.push({module: null, message: message, severity: SEVERITY_ERROR});
    }
  }
  return undeclaredModules;
};

},{"./getModule":8,"./moduleData":14,"suggest-it":30}],11:[function(require,module,exports){
var getModule = require('./getModule');

var IGNORED = ['ngHintControllers', 'ngHintDirectives', 'ngHintDom', 'ngHintEvents',
             'ngHintInterpolation', 'ngHintModules', 'ngHintScopes', 'ng', 'ngLocale', 'protractorBaseModule_'],
    SEVERITY_WARNING = 2;

module.exports = function(createdModules) {
  var unusedModules = [];
  for(var module in createdModules) {
    if(!getModule(module)) {
      var cModule = createdModules[module],
        message = 'Module "' + cModule.name + '" was created but never loaded.';
      if(IGNORED.indexOf(cModule.name) === -1) {
        unusedModules.push({module: cModule, message: message, severity: SEVERITY_WARNING});
      }
    }
  }
  return unusedModules;
};

},{"./getModule":8}],12:[function(require,module,exports){
var MODULE_NAME = 'Modules',
    SEVERITY_SUGGESTION = 3;

module.exports = function(str) {
  if (str === 'ng') {
    return true;
  }

  if(str.charAt(0).toUpperCase() === str.charAt(0)) {
    angular.hint.emit(MODULE_NAME, 'The best practice for' +
      ' module names is to use dot.case or lowerCamelCase. Check the name of "' + str + '".',
      SEVERITY_SUGGESTION);
    return false;
  }
  if(str.toLowerCase() === str && str.indexOf('.') === -1) {
    angular.hint.emit(MODULE_NAME, 'Module names should be namespaced' +
      ' with a dot (app.dashboard) or lowerCamelCase (appDashboard). Check the name of "' + str + '".', SEVERITY_SUGGESTION);
    return false;
  }
  return true;
};

},{}],13:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');

module.exports = function(attrs) {
  for(var i = 0, length = attrs.length; i < length; i++) {
    if(normalizeAttribute(attrs[i].nodeName) === 'ng-view' ||
        attrs[i].value.indexOf('ng-view') > -1) {
          return true;
    }
  }
};

},{"./normalizeAttribute":16}],14:[function(require,module,exports){
module.exports = {
  createdModules: {},
  createdMulti: {},
  loadedModules: {}
};

},{}],15:[function(require,module,exports){
var modData = require('./moduleData'),
  getModule = require('./getModule');

module.exports = function() {
  if(modData.ngViewExists && !getModule('ngRoute')) {
    return {message: 'Directive "ngView" was used in the application however "ngRoute" was not loaded into any module.'};
  }
};

},{"./getModule":8,"./moduleData":14}],16:[function(require,module,exports){
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/, '').replace(/[:_]/g, '-');
};

},{}],17:[function(require,module,exports){
var display = require('./display'),
  formatMultiLoaded = require('./formatMultiLoaded'),
  getUnusedModules = require('./getUnusedModules'),
  getUndeclaredModules = require('./getUndeclaredModules'),
  modData = require('./moduleData'),
  ngViewNoNgRoute = require('./ngViewNoNgRoute');

module.exports = function() {
  var unusedModules = getUnusedModules(modData.createdModules),
    undeclaredModules = getUndeclaredModules(modData.loadedModules),
    multiLoaded = formatMultiLoaded(),
    noNgRoute = ngViewNoNgRoute();
  if(unusedModules.length || undeclaredModules.length || multiLoaded.length || noNgRoute) {
    var toSend = unusedModules.concat(undeclaredModules)
      .concat(multiLoaded);
    if(noNgRoute) {
      toSend = toSend.concat(noNgRoute);
    }
    display(toSend);
  }
};

},{"./display":6,"./formatMultiLoaded":7,"./getUndeclaredModules":10,"./getUnusedModules":11,"./moduleData":14,"./ngViewNoNgRoute":15}],18:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function(module, isNgAppMod) {
  var name = module.name || module;
  if(!isNgAppMod){
    module.requires.forEach(function(dependency){
      modData.loadedModules[dependency] = dependency;
    });
  }
  else {
    modData.loadedModules[name] = name;
    modData.ngAppMod = name;
  }
};

},{"./moduleData":14}],19:[function(require,module,exports){
var getNgAppMod = require('./getNgAppMod'),
  inAttrsOrClasses = require('./inAttrsOrClasses'),
  storeDependencies = require('./storeDependencies'),
  modData = require('./moduleData');

module.exports = function(doms) {
  var bothFound,
      ngViewFound,
      elem,
      isElemName,
      isInAttrsOrClasses,
      ngAppMod;

  for(var i = 0; i < doms.length; i++) {
    elem = doms[i];
    var attributes = elem.attributes;
    isElemName = elem.nodeName.toLowerCase() === 'ng-view';
    isInAttrsOrClasses = inAttrsOrClasses(attributes);

    ngViewFound = isElemName || isInAttrsOrClasses;

    ngAppMod = getNgAppMod(attributes, modData.ngAppFound);
    modData.ngAppFound = modData.ngAppFound || ngAppMod;

    if(ngAppMod) {
      storeDependencies(ngAppMod, true);
    }
    modData.ngViewExists = ngViewFound ? true : modData.ngViewExists;

    if(bothFound) {
      break;
    }
  }
};

},{"./getNgAppMod":9,"./inAttrsOrClasses":13,"./moduleData":14,"./storeDependencies":18}],20:[function(require,module,exports){
var storeDependencies = require('./storeDependencies');

var seen = [];

var storeUsedModules = module.exports = function(module, modules){
  var name = module.name || module;
  if(module && seen.indexOf(name) === -1) {
    seen.push(name);
    storeDependencies(module);
    module.requires.forEach(function(modName) {
      var mod = modules[modName];
      storeUsedModules(mod, modules);
    });
  }
};
},{"./storeDependencies":18}],21:[function(require,module,exports){
'use strict';

var MODULE_NAME = 'Controllers',
    CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/,
    CATEGORY_CONTROLLER_NAME = 'Name controllers according to best practices',
    CATEGORY_GLOBAL_CONTROLLER = 'Using global functions as controllers is against Angular best practices and depricated in Angular 1.3 and up',
    SEVERITY_ERROR = 1,
    SEVERITY_WARNING = 2;

// local state
var nameToControllerMap = {};

/**
* Decorates $controller with a patching function to
* log a message if the controller is instantiated on the window
*/
angular.module('ngHintControllers', []).
  config(['$provide', '$controllerProvider', function ($provide, $controllerProvider) {
    $provide.decorator('$controller', ['$delegate', controllerDecorator]);

    var originalRegister = $controllerProvider.register;
    $controllerProvider.register = function(name, constructor) {
      stringOrObjectRegister(name);
      originalRegister.apply($controllerProvider, arguments);
    }
  }]);

function controllerDecorator($delegate) {
  return function(ctrl) {
    if (typeof ctrl === 'string') {
      var match = ctrl.match(CNTRL_REG);
      var ctrlName = (match && match[1]) || ctrl;

      if (!nameToControllerMap[ctrlName]) {
        sendMessageForControllerName(ctrlName);
      }

      if (!nameToControllerMap[ctrlName] && typeof window[ctrlName] === 'function') {
        sendMessageForGlobalController(ctrlName);
      }
    }
    return $delegate.apply(this, arguments);
  };
}

/**
* Save details of the controllers as they are instantiated
* for use in decoration.
* Hint about the best practices for naming controllers.
*/
var originalModule = angular.module;

function stringOrObjectRegister(controllerName) {
  if ((controllerName !== null) && (typeof controllerName === 'object')) {
    Object.keys(controllerName).forEach(processController);
  } else {
    processController(controllerName);
  }
}

function processController(ctrlName) {
  nameToControllerMap[ctrlName] = true;
  sendMessageForControllerName(ctrlName);
}

function sendMessageForGlobalController(name) {
  angular.hint.emit(MODULE_NAME + ':global',
    'add `' + name + '` to a module',
    angular.version.minor <= 2 ? SEVERITY_WARNING : SEVERITY_ERROR,
    CATEGORY_GLOBAL_CONTROLLER);
}

function sendMessageForControllerName(name) {
  var newName = name;
  if (!startsWithUpperCase(name)) {
    newName = title(newName);
  }
  if (!endsWithController(name)) {
    newName = addControllerSuffix(newName);
  }
  if (name !== newName) {
    angular.hint.emit(MODULE_NAME + ':rename',
      'Consider renaming `' + name + '` to `' + newName + '`.',
      SEVERITY_WARNING,
      CATEGORY_CONTROLLER_NAME);
  }
}

function startsWithUpperCase(name) {
  var firstChar = name.charAt(0);
  return firstChar === firstChar.toUpperCase() &&
         firstChar !== firstChar.toLowerCase();
}

function title (name) {
  return name[0].toUpperCase() + name.substr(1);
}

var CONTROLLER_RE = /Controller$/;
function endsWithController(name) {
  return CONTROLLER_RE.test(name);
}

var RE = /(Ctrl|Kontroller)?$/;
function addControllerSuffix(name) {
  return name.replace(RE, 'Controller');
}

/*
 * decorate angular module API
 */

angular.module = function() {
  var module = originalModule.apply(this, arguments),
      originalController = module.controller;

  module.controller = function(controllerName, controllerConstructor) {
    stringOrObjectRegister(controllerName);
    return originalController.apply(this, arguments);
  };

  return module;
};

},{}],22:[function(require,module,exports){
'use strict';

/**
* Load necessary functions from /lib into variables.
*/
var ngEventAttributes = require('../lib/event-directives'),
    MODULE_NAME = 'Events';

/*
 * Remove string expressions except property accessors.
 * ex. abc["def"] = "gef"; // `removeStringExp` will remove "gef" but not "def".
 */
function removeStringExp(str) {
  return str.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,
    function(match, pos, full) {
      // this is our lookaround code so that our regex doesn't become so
      // complicated.
      if (pos !== 0 && (match.length + pos) !== full.length &&
          full[pos - 1] === '[' && full[pos + match.length] === ']') {
           return match;
      }
      return '';
    });
}

var getFunctionNames = function(str) {
  if (typeof str !== 'string') {
    return [];
  }
  // There are still a bunch of corner cases here where we aren't going to be able to handle
  // but we shouldn't break the user's app and we should handle most common cases.
  // example of corner cases: we can't check for properties inside of function
  // arguments like `move(a.b.c)` with the current implementation
  // or property accessors with parentheses in them
  // like `prop["hello (world)"] = "test";`.
  // To fully fix these issues we would need a full blown expression parser.
  var results = removeStringExp(str.replace(/\s+/g, ''))
    .replace(/\(.*?\)/g, '')
    .split(/[\+\-\/\|\<\>\^=&!%~?:;]/g).map(function(x) {
      if (isNaN(+x)) {
        if (x.match(/\w+\(.*\)$/)){
          return x.substr(0, x.indexOf('('));
        }
        return x;
      }
  }).filter(function(x){
    return x;
  });
  return results;
};

/**
* Decorate $provide in order to examine ng-event directives
* and hint about their effective use.
*/
angular.module('ngHintEvents', [])
  .config(['$provide', function($provide) {
    for (var i = 0; i < ngEventAttributes.length; i++) {
      try {
        $provide.decorator(ngEventAttributes[i] + 'Directive',
            ['$delegate', '$parse', ngEventDirectivesDecorator(ngEventAttributes[i])]);
      } catch(e) {}
    }
  }]);

function ngEventDirectivesDecorator(ngEventAttrName) {
  return function ($delegate, $parse) {
    var originalCompileFn = $delegate[0].compile;

    $delegate[0].compile = function(element, attrs, transclude) {
      var linkFn = originalCompileFn.apply(this, arguments);

      return function ngEventHandler(scope, element, attrs) {
        var boundFuncs = getFunctionNames(attrs[ngEventAttrName]);

        // guard against any parsing errors since the parsing code
        // to split the expression is pretty simple and naive.
        try {
          boundFuncs.forEach(function(boundFn) {
            var property, propChain, lastProp = '';
            while((property = boundFn.match(/^.+?([^\.\[])*/)) !== null) {
              property = property[0];
              propChain = lastProp + property;
              if ($parse(propChain)(scope) === undefined) {
                angular.hint.emit(MODULE_NAME + ':undef', propChain + ' is undefined');
              }
              boundFn = boundFn.replace(property, '');
              lastProp += property;
              if(boundFn.charAt(0) === '.') {
                lastProp += '.';
                boundFn = boundFn.substr(1);
              }
            }
          });
        } catch (e) {
          angular.hint.emit(MODULE_NAME + ':undef', '' +
            'parsing error: please inform the angular-hint ' +
            'or batarang teams. expression: ' + boundFuncs.join(''));
        }

        return linkFn.apply(this, arguments);
      };
    };
    return $delegate;
  }
}

},{"../lib/event-directives":4}],23:[function(require,module,exports){
'use strict';

/**
 * We use EventEmitter2 here in order to have scoped events
 * For instance:
 *    hint.emit('scope:digest', {
 */
var EventEmitter2 = require('eventemitter2').EventEmitter2;

angular.hint = new EventEmitter2({
  wildcard: true,
  delimiter: ':'
});
},{"eventemitter2":27}],24:[function(require,module,exports){
'use strict';

var getModule = require('./angular-hint-modules/getModule'),
    start = require('./angular-hint-modules/start'),
    storeNgAppAndView = require('./angular-hint-modules/storeNgAppAndView'),
    storeUsedModules = require('./angular-hint-modules/storeUsedModules'),
    hasNameSpace = require('./angular-hint-modules/hasNameSpace'),
    modData = require('./angular-hint-modules/moduleData');

var doc = Array.prototype.slice.call(document.getElementsByTagName('*')),
    originalAngularModule = angular.module,
    modules = {};

storeNgAppAndView(doc);

angular.module = function(name, requiresOriginal) {
  var module = originalAngularModule.apply(this, arguments),
      name = module.name;

  module.requiresOriginal = requiresOriginal;
  modules[name] = module;
  var modToCheck = getModule(name, true);
  //check arguments to determine if called as setter or getter
  var modIsSetter = arguments.length > 1;

  if (modIsSetter) {
    hasNameSpace(name);
  }

  if(modToCheck && modToCheck.requiresOriginal !== module.requiresOriginal && modIsSetter) {
    if(!modData.createdMulti[name]) {
      modData.createdMulti[name] = [getModule(name,true)];
    }
    modData.createdMulti[name].push(module);
  }
  modData.createdModules[name] = module;
  return module;
};

angular.module('ngHintModules', []).config(function() {
  var ngAppMod = modules[modData.ngAppMod];
  if (ngAppMod) {
    storeUsedModules(ngAppMod, modules);
  }
  start();
});

},{"./angular-hint-modules/getModule":8,"./angular-hint-modules/hasNameSpace":12,"./angular-hint-modules/moduleData":14,"./angular-hint-modules/start":17,"./angular-hint-modules/storeNgAppAndView":19,"./angular-hint-modules/storeUsedModules":20}],25:[function(require,module,exports){
'use strict';

var summarize = require('../lib/summarize-model');
var debounceOn = require('debounce-on');

var hint = angular.hint;

hint.emit = hint.emit || function () {};

module.exports = angular.module('ngHintScopes', []).config(['$provide', function ($provide) {
  $provide.decorator('$rootScope', ['$delegate', '$parse', decorateRootScope]);
  $provide.decorator('$compile', ['$delegate', decorateDollaCompile]);
}]);

function decorateRootScope($delegate, $parse) {

  var perf = window.performance || { now: function () { return 0; } };

  var scopes = {},
      watching = {};

  var debouncedEmitModelChange = debounceOn(emitModelChange, 10);

  hint.watch = function (scopeId, path) {
    path = typeof path === 'string' ? path.split('.') : path;

    if (!watching[scopeId]) {
      watching[scopeId] = {};
    }

    for (var i = 1, ii = path.length; i <= ii; i += 1) {
      var partialPath = path.slice(0, i).join('.');
      if (watching[scopeId][partialPath]) {
        continue;
      }
      var get = gettterer(scopeId, partialPath);
      var value = summarize(get());
      watching[scopeId][partialPath] = {
        get: get,
        value: value
      };
      hint.emit('model:change', {
        id: convertIdToOriginalType(scopeId),
        path: partialPath,
        value: value
      });
    }
  };

  hint.assign = function (scopeId, path, value) {
    var scope;
    if (scope = scopes[scopeId]) {
      scope.$apply(function () {
        return $parse(path).assign(scope, value);
      });
    }
  };

  hint.inspectScope = function (scopeId) {
    var scope;
    if (scope = scopes[scopeId]) {
      window.$scope = scope;
    }
  };

  hint.unwatch = function (scopeId, unwatchPath) {
    Object.keys(watching[scopeId]).
      forEach(function (path) {
        if (path.indexOf(unwatchPath) === 0) {
          delete watching[scopeId][path];
        }
      });
  };

  var scopePrototype = ('getPrototypeOf' in Object) ?
      Object.getPrototypeOf($delegate) : $delegate.__proto__;

  var _watch = scopePrototype.$watch;
  var _digestEvents = [];
  var skipNextPerfWatchers = false;
  scopePrototype.$watch = function (watchExpression, reactionFunction) {
    // Convert the `watchExpression` to a function (if not already one).
    // This is also the first thing `Scope.$watch()` does.
    var parsedExpression = $parse(watchExpression);

    // Only intercept this call if there is no `$$watchDelegate`.
    // (With `$$watchDelegate` there will be subsequent calls to `$watch` (if necessary)).
    if (!parsedExpression.$$watchDelegate) {
      var scopeId = this.$id;
      var watchStr = humanReadableWatchExpression(watchExpression);

      // Intercept the `watchExpression` (if any).
      arguments[0] = simpleExtend(function() {
        var start = perf.now();
        var ret = parsedExpression.apply(this, arguments);
        var end = perf.now();
        _digestEvents.push({
          eventType: 'scope:watch',
          id: scopeId,
          watch: watchStr,
          time: end - start
        });
        return ret;
      }, parsedExpression);

      // Intercept the `reactionFunction` (if any).
      if (typeof reactionFunction === 'function') {
        arguments[1] = function() {
          var start = perf.now();
          var ret = reactionFunction.apply(this, arguments);
          var end = perf.now();
          _digestEvents.push({
            eventType: 'scope:reaction',
            id: scopeId,
            watch: watchStr,
            time: end - start
          });
          return ret;
        };
      }
    }

    return _watch.apply(this, arguments);
  };

  var _digest = scopePrototype.$digest;
  scopePrototype.$digest = function (fn) {
    _digestEvents = [];
    var start = perf.now();
    var ret = _digest.apply(this, arguments);
    var end = perf.now();
    hint.emit('scope:digest', {
      id: this.$id,
      time: end - start,
      events: _digestEvents
    });
    return ret;
  };

  var _destroy = scopePrototype.$destroy;
  scopePrototype.$destroy = function () {
    var id = this.$id;

    hint.emit('scope:destroy', { id: id });

    delete scopes[id];
    delete watching[id];

    return _destroy.apply(this, arguments);
  };


  var _new = scopePrototype.$new;
  scopePrototype.$new = function () {
    var child = _new.apply(this, arguments);

    scopes[child.$id] = child;
    watching[child.$id] = {};

    hint.emit('scope:new', { parent: this.$id, child: child.$id });
    setTimeout(function () {
      emitScopeElt(child);
    }, 0);
    return child;
  };

  function emitScopeElt (scope) {
    var scopeId = scope.$id;
    var elt = findElt(scopeId);
    var descriptor = scopeDescriptor(elt, scope);
    hint.emit('scope:link', {
      id: scopeId,
      descriptor: descriptor
    });
  }

  function findElt (scopeId) {
    var elts = document.querySelectorAll('.ng-scope');
    var elt, scope;

    for (var i = 0; i < elts.length; i++) {
      elt = angular.element(elts[i]);
      scope = elt.scope();
      if (scope.$id === scopeId) {
        return elt;
      }
    }
  }

  var _apply = scopePrototype.$apply;
  scopePrototype.$apply = function (fn) {
    // var start = perf.now();
    var ret = _apply.apply(this, arguments);
    // var end = perf.now();
    // hint.emit('scope:apply', { id: this.$id, time: end - start });
    debouncedEmitModelChange();
    return ret;
  };


  function gettterer (scopeId, path) {
    if (path === '') {
      return function () {
        return scopes[scopeId];
      };
    }
    var getter = $parse(path);
    return function () {
      return getter(scopes[scopeId]);
    };
  }

  function emitModelChange () {
    Object.keys(watching).forEach(function (scopeId) {
      Object.keys(watching[scopeId]).forEach(function (path) {
        var model = watching[scopeId][path];
        var value = summarize(model.get());
        if (value !== model.value) {
          hint.emit('model:change', {
            id: convertIdToOriginalType(scopeId),
            path: path,
            oldValue: model.value,
            value: value
          });
          model.value = value;
        }
      });
    });
  }

  hint.emit('scope:new', {
    parent: null,
    child: $delegate.$id
  });
  scopes[$delegate.$id] = $delegate;
  watching[$delegate.$id] = {};

  return $delegate;
}

function decorateDollaCompile ($delegate) {
  var newCompile = function () {
    var link = $delegate.apply(this, arguments);

    return function (scope) {
      var elt = link.apply(this, arguments);
      var descriptor = scopeDescriptor(elt, scope);
      hint.emit('scope:link', {
        id: scope.$id,
        descriptor: descriptor
      });
      return elt;
    };
  };

  // TODO: test this
  // copy private helpers like $$addScopeInfo
  for (var prop in $delegate) {
    if ($delegate.hasOwnProperty(prop)) {
      newCompile[prop] = $delegate[prop];
    }
  }
  return newCompile;
}

var TYPES = [
  'ng-app',
  'ng-controller',
  'ng-repeat',
  'ng-include'
];

function scopeDescriptor (elt, scope) {
  var val,
      theseTypes = [],
      noDataDefault = 'scope.$id=' + scope.$id,
      type;

  if (elt) {
    for (var i = 0, ii = TYPES.length; i < ii; i++) {
      type = TYPES[i];
      if (val = elt.attr(type)) {
        theseTypes.push(type + '="' + val + '"');
      }
    }
  }
  if (theseTypes.length) {
    // We have info from the HTML
    noDataDefault = theseTypes.join(' ');

    if (theseTypes[0].indexOf(' as ') > -1) {
      // It's controllerAs
      var caPrefix = theseTypes[0].match(/ as ([^"]+)"/);

      if (caPrefix && caPrefix[1]) {
        // We have enough info to make a decision
        return scope[caPrefix[1]].__ngHintName || noDataDefault;
      }
    }
  }

  if (scope.__ngHintName) {
    // Without controllerAs, we need to check to ensure the name wasn't
    //   inherited from the parent scope
    if (scope.$parent) {
      var sameNameAsParent = scope.__ngHintName === scope.$parent.__ngHintName;
    }

    // If we have a name, use it, otherwise use the next best thing
    return sameNameAsParent ?
      noDataDefault : scope.__ngHintName;
  }
  return noDataDefault;
}

function humanReadableWatchExpression (fn) {
  if (fn == null) {
    return null;
  }
  if (fn.exp) {
    fn = fn.exp;
  } else if (fn.name) {
    fn = fn.name;
  }
  return fn.toString();
}

function convertIdToOriginalType(scopeId) {
  return (angular.version.minor < 3) ? scopeId : parseInt(scopeId, 10);
}

function simpleExtend(dst, src) {
  Object.keys(src).forEach(function(key) {
    dst[key] = src[key];
  });
  return dst;
}

},{"../lib/summarize-model":5,"debounce-on":26}],26:[function(require,module,exports){
module.exports = function debounceOn (fn, timeout, hash) {
  var timeouts = {};

  timeout = typeof timeout === 'number' ? timeout : (hash = timeout, 100);
  hash = typeof hash === 'function' ? hash : defaultHash;

  return function () {
    var key = hash.apply(null, arguments);
    var args = arguments;
    if (typeof timeouts[key] === 'undefined') {
      timeouts[key] = setTimeout(function () {
        delete timeouts[key];
        fn.apply(null, args);
      }, timeout);
    }
    return function cancel () {
      if (timeouts[key]) {
        clearTimeout(timeouts[key]);
        delete timeouts[key];
        return true;
      }
      return false;
    };
  };
};

function defaultHash () {
  return Array.prototype.join.call(arguments, '::');
}

},{}],27:[function(require,module,exports){
(function (process){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._maxListeners > 0 &&
            tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';


  EventEmitter.prototype.once = function(event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function(event, fn, prepend) {
    this._many(event, 1, fn, prepend);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  }

  EventEmitter.prototype.prependMany = function(event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  }

  EventEmitter.prototype._many = function(event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function(type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  }

  EventEmitter.prototype._on = function(type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  }

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function(){
    return Object.keys(this._events);
  }

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

}).call(this,require('_process'))
},{"_process":28}],28:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],29:[function(require,module,exports){
module.exports = distance;

function distance(a, b) {
  var table = [];
  if (a.length === 0 || b.length === 0) return Math.max(a.length, b.length);
  for (var ii = 0, ilen = a.length + 1; ii !== ilen; ++ii) {
    table[ii] = [];
    for (var jj = 0, jlen = b.length + 1; jj !== jlen; ++jj) {
      if (ii === 0 || jj === 0) table[ii][jj] = Math.max(ii, jj);
      else {
        var diagPenalty = Number(a[ii-1] !== b[jj-1]);
        var diag = table[ii - 1][jj - 1] + diagPenalty;
        var top = table[ii - 1][jj] + 1;
        var left = table[ii][jj - 1] + 1;
        table[ii][jj] = Math.min(left, top, diag);
      }
    }
  }
  return table[a.length][b.length];
}


},{}],30:[function(require,module,exports){
module.exports = suggestDictionary;

var distance = require('./levenstein_distance');

function suggestDictionary(dict, opts) {
  opts = opts || {};
  var threshold = opts.threshold || 0.5;
  return function suggest(word) {
    var length = word.length;
    return dict.reduce(function (result, dictEntry) {
      var score = distance(dictEntry, word);
      if (result.score > score && score / length < threshold) {
        result.score = score;
        result.word = dictEntry;
      }
      return result;
    }, { score: Infinity }).word;
  };
}

suggestDictionary.distance = distance;

},{"./levenstein_distance":29}]},{},[1]);
