(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Batarang instrumentation
 *
 * This gets loaded into the context of the app you are inspecting
 */
require('./loader.js');
require('angular-hint');

angular.hint.onMessage = function (moduleName, message, messageType, category) {
  if (!message) {
    message = moduleName;
    moduleName = 'Unknown'
  }
  if (typeof messageType === 'undefined') {
    messageType = 1;
  }
  sendMessage({
    module: moduleName,
    message: message,
    severity: messageType,
    category: category
  });
};

angular.hint.emit = function (ev, data) {
  data.event = ev;
  sendMessage(data);
};

var eventProxyElement = document.getElementById('__ngBatarangElement');

var customEvent = document.createEvent('Event');
customEvent.initEvent('batarangDataEvent', true, true);

function sendMessage (obj) {
  eventProxyElement.innerText = JSON.stringify(obj);
  eventProxyElement.dispatchEvent(customEvent);
}

},{"./loader.js":2,"angular-hint":3}],2:[function(require,module,exports){
/**
 * @license AngularJS v1.3.0-build.3042+sha.76e57a7
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */

(function() {'use strict';

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
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
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

function minErr(module) {
  return function () {
    var code = arguments[0],
      prefix = '[' + (module ? module + ':' : '') + code + '] ',
      template = arguments[1],
      templateArgs = arguments,
      stringify = function (obj) {
        if (typeof obj === 'function') {
          return obj.toString().replace(/ \{[\s\S]*$/, '');
        } else if (typeof obj === 'undefined') {
          return 'undefined';
        } else if (typeof obj !== 'string') {
          return JSON.stringify(obj);
        }
        return obj;
      },
      message, i;

    message = prefix + template.replace(/\{\d+\}/g, function (match) {
      var index = +match.slice(1, -1), arg;

      if (index + 2 < templateArgs.length) {
        arg = templateArgs[index + 2];
        if (typeof arg === 'function') {
          return arg.toString().replace(/ ?\{[\s\S]*$/, '');
        } else if (typeof arg === 'undefined') {
          return 'undefined';
        } else if (typeof arg !== 'string') {
          return toJson(arg);
        }
        return arg;
      }
      return match;
    });

    message = message + '\nhttp://errors.angularjs.org/1.3.0-build.3042+sha.76e57a7/' +
      (module ? module + '/' : '') + code;
    for (i = 2; i < arguments.length; i++) {
      message = message + (i == 2 ? '?' : '&') + 'p' + (i-2) + '=' +
        encodeURIComponent(stringify(arguments[i]));
    }

    return new Error(message);
  };
}

/**
 * @ngdoc type
 * @name angular.Module
 * @module ng
 * @description
 *
 * Interface for configuring angular {@link angular.module modules}.
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
     * The `angular.module` is a global place for creating, registering and retrieving Angular
     * modules.
     * All modules (angular core or 3rd party) that should be available to an application must be
     * registered using this mechanism.
     *
     * When passed two or more arguments, a new module is created.  If passed only one argument, an
     * existing module (the name passed as the first argument to `module`) is retrieved.
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
     * @returns {module} new module with the {@link angular.Module} api.
     */
    return function module(name, requires, configFn) {
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
          throw $injectorMinErr('nomod', "Module '{0}' is not available! You either misspelled " +
             "the module name or forgot to load it. If registering a module ensure that you " +
             "specify the dependencies as the second argument.", name);
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
          _configBlocks: [],
          _runBlocks: runBlocks,

          /**
           * @ngdoc property
           * @name angular.Module#requires
           * @module ng
           * @returns {Array.<string>} List of module names which must be loaded before this module.
           * @description
           * Holds the list of modules which the injector will load before the current module is
           * loaded.
           */
          requires: requires,

          /**
           * @ngdoc property
           * @name angular.Module#name
           * @module ng
           * @returns {string} Name of the module.
           * @description
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
          provider: invokeLater('$provide', 'provider'),

          /**
           * @ngdoc method
           * @name angular.Module#factory
           * @module ng
           * @param {string} name service name
           * @param {Function} providerFunction Function for creating new instance of the service.
           * @description
           * See {@link auto.$provide#factory $provide.factory()}.
           */
          factory: invokeLater('$provide', 'factory'),

          /**
           * @ngdoc method
           * @name angular.Module#service
           * @module ng
           * @param {string} name service name
           * @param {Function} constructor A constructor function that will be instantiated.
           * @description
           * See {@link auto.$provide#service $provide.service()}.
           */
          service: invokeLater('$provide', 'service'),

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
           * Because the constant are fixed, they get applied before other provide methods.
           * See {@link auto.$provide#constant $provide.constant()}.
           */
          constant: invokeLater('$provide', 'constant', 'unshift'),

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
           * {@link ngAnimate.$animate $animate} service and directives that use this service.
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
           * See {@link ngAnimate.$animateProvider#register $animateProvider.register()} and
           * {@link ngAnimate ngAnimate module} for more information.
           */
          animation: invokeLater('$animateProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#filter
           * @module ng
           * @param {string} name Filter name.
           * @param {Function} filterFactory Factory function for creating new instance of filter.
           * @description
           * See {@link ng.$filterProvider#register $filterProvider.register()}.
           */
          filter: invokeLater('$filterProvider', 'register'),

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
          controller: invokeLater('$controllerProvider', 'register'),

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
          directive: invokeLater('$compileProvider', 'directive'),

          /**
           * @ngdoc method
           * @name angular.Module#config
           * @module ng
           * @param {Function} configFn Execute this function on module load. Useful for service
           *    configuration.
           * @description
           * Use this method to register work which needs to be performed on module loading.
           * For more about how to configure services, see
           * {@link providers#providers_provider-recipe Provider Recipe}.
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

        /**
        * ANGULAR HINT ALTERATION
        * To make this loader compatible with apps that are running
        * both Angular 1.2 and 1.3, the loader must handle 1.3 applications
        * that expect to initialize their config blocks after all providers
        * are registered. Hence, the configBlocks are added to the end
        * of the exisiting invokeQueue.
        */
        Object.defineProperty(moduleInstance, '_invokeQueue', {
          get: function() {
            return invokeQueue.concat(configBlocks);
          }
        });

        if (configFn) {
          config(configFn);
        }

        return  moduleInstance;

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
window.angular.hint = require('angular-hint-log');

// Load angular hint modules
require('angular-hint-controllers');
// require('angular-hint-directives');
// require('angular-hint-dom');
require('angular-hint-events');
// require('angular-hint-interpolation');
require('angular-hint-modules');
require('angular-hint-scopes');

// List of all possible modules
// The default ng-hint behavior loads all modules
var allModules = [
'ngHintControllers',
// 'ngHintDirectives',
//  'ngHintDom',
  'ngHintEvents',
//  'ngHintInterpolation',
  'ngHintModules',
  'ngHintScopes'
];

var SEVERITY_WARNING = 2;

// Determine whether this run is by protractor.
// If protractor is running, the bootstrap will already be deferred.
// In this case `resumeBootstrap` should be patched to load the hint modules.
if (window.name === 'NG_DEFER_BOOTSTRAP!') {
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
  window.name = 'NG_DEFER_BOOTSTRAP!';

  // determine which modules to load and resume bootstrap
  document.addEventListener('DOMContentLoaded', maybeBootstrap);
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
    modules = allModules;
  } else {
    angular.hint.logMessage('General', 'ngHint is included on the page, but is not active because ' +
      'there is no `ng-hint` attribute present', SEVERITY_WARNING);
  }
  return modules;
}

function excludeModules(modulesToExclude) {
  return allModules.filter(function(module) {
    return modulesToExclude.indexOf(module) === -1;
  });
}

function hintModulesFromElement (elt) {
  var selectedModules = (elt.attributes['ng-hint-include'] ||
    elt.attributes['ng-hint-exclude']).value.split(' ');

  return selectedModules.map(hintModuleName).filter(function (name) {
    return (allModules.indexOf(name) > -1) ||
      angular.hint.logMessage('General', 'Module ' + name + ' could not be found', SEVERITY_WARNING);
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

},{"angular-hint-controllers":4,"angular-hint-events":6,"angular-hint-log":16,"angular-hint-modules":17,"angular-hint-scopes":35}],4:[function(require,module,exports){
'use strict';

var hint = angular.hint = require('angular-hint-log');

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
  config(['$provide', function ($provide) {
    $provide.decorator('$controller', ['$delegate', controllerDecorator]);
  }]);

function controllerDecorator($delegate) {
  return function(ctrl) {
    if (typeof ctrl === 'string') {
      var match = ctrl.match(CNTRL_REG);
      var ctrlName = (match && match[1]) || ctrl;

      sendMessageForControllerName(ctrlName);
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

function processController(ctrlName) {
  nameToControllerMap[ctrlName] = true;
  sendMessageForControllerName(ctrlName);
}

function sendMessageForGlobalController(name) {
  hint.logMessage(MODULE_NAME,
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
    hint.logMessage(MODULE_NAME,
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
    if ((controllerName !== null) && (typeof controllerName === 'object')) {
      Object.keys(controllerName).forEach(processController);
    } else {
      processController(controllerName);
    }
    return originalController.apply(this, arguments);
  };

  return module;
};

},{"angular-hint-log":5}],5:[function(require,module,exports){
'use strict';

/*
 * HintLog creates a queue of messages logged by ngHint modules. This object
 * has a key for each ngHint module that corresponds to the messages
 * from that module.
 */
var queuedMessages = {},
    MESSAGE_TYPES = [
      'error',
      'warning',
      'suggestion'
    ];

/*
 * Add a message to the HintLog message queue. Messages are organized into categories
 * according to their module name and severity.
 */
function logMessage(moduleName, message, severity, category) {
  // If no severity was provided, categorize the message as a `suggestion`
  severity = severity || 3;
  var messageType = MESSAGE_TYPES[severity - 1];

  moduleName = moduleName || 'General';

  // If the category does not exist, initialize a new object
  queuedMessages[moduleName] = queuedMessages[moduleName] || {};
  queuedMessages[moduleName][messageType] = queuedMessages[moduleName][messageType] || [];

  if (queuedMessages[moduleName][messageType].indexOf(message) < 0) {
    queuedMessages[moduleName][messageType].push(message);
  }

  this.onMessage(moduleName, message, messageType, category);
}

/*
 * Return and empty the current queue of messages.
 */
function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
}

module.exports.onMessage = function(message) {};
module.exports.logMessage = logMessage;
module.exports.flush = flush;

},{}],6:[function(require,module,exports){
'use strict';

/**
* Load necessary functions from /lib into variables.
*/
var ngEventDirectives = require('./lib/getEventDirectives')(),
  getEventAttribute = require('./lib/getEventAttribute'),
  getFunctionNames = require('./lib/getFunctionNames'),
  formatResults = require('./lib/formatResults');

/**
* Decorate $provide in order to examine ng-event directives
* and hint about their effective use.
*/
angular.module('ngHintEvents', [])
  .config(['$provide', function($provide) {

    for(var directive in ngEventDirectives) {
      var dirName = ngEventDirectives[directive]+'Directive';
      try{
        $provide.decorator(dirName, ['$delegate', '$timeout', '$parse',
          function($delegate, $timeout, $parse) {

            var original = $delegate[0].compile, falseBinds = [], messages = [];

            $delegate[0].compile = function(element, attrs, transclude) {
              var angularAttrs = attrs.$attr;
              var eventAttrName = getEventAttribute(angularAttrs);
              var fn = $parse(attrs[eventAttrName]);
              var messages = [];
              return function ngEventHandler(scope, element, attrs) {
                for(var attr in angularAttrs) {
                  var boundFuncs = getFunctionNames(attrs[attr]);
                  boundFuncs.forEach(function(boundFn) {
                    if(ngEventDirectives[attr] && !(boundFn in scope)) {
                      messages.push({
                        scope: scope,
                        element:element,
                        attrs: attrs,
                        boundFunc: boundFn
                      });
                    }
                  });
                }
                element.on(eventAttrName.substring(2).toLowerCase(), function(event) {
                  scope.$apply(function() {
                    fn(scope, {$event:event});
                  });
                });
                formatResults(messages);
              };
            };
            return $delegate;
        }]);
      } catch(e) {}
    }
  }]);
},{"./lib/formatResults":8,"./lib/getEventAttribute":9,"./lib/getEventDirectives":10,"./lib/getFunctionNames":11}],7:[function(require,module,exports){
'use strict';

var getValidProps = require('./getValidProps'),
  suggest = require('suggest-it');

module.exports = function addSuggestions(messages) {
  messages.forEach(function(messageObj) {
    var dictionary = getValidProps(messageObj.scope),
      suggestion = suggest(dictionary)(messageObj.boundFunc);
    messageObj['match'] = suggestion;
  });
  return messages;
};

},{"./getValidProps":12,"suggest-it":15}],8:[function(require,module,exports){
'use strict';

var hintLog = angular.hint = require('angular-hint-log'),
  addSuggestions = require('./addSuggestions'),
  MODULE_NAME = 'Events',
  SEVERITY_ERROR = 1;

module.exports = function formatResults(messages) {
  messages = addSuggestions(messages);
  if(messages.length) {
    messages.forEach(function(obj) {
      var id = (obj.element[0].id) ? ' with id: #' + obj.element[0].id : '',
        type = obj.element[0].nodeName,
        suggestion = obj.match ? ' (Try "' + obj.match + '").': '.',
        message = 'Variable "' + obj.boundFunc + '" called on ' + type + ' element' + id +
          ' does not exist in that scope' + suggestion + ' Event directive found on "' +
          obj.element[0].outerHTML + '".';
      hintLog.logMessage(MODULE_NAME, message, SEVERITY_ERROR);
    });
  }
};

},{"./addSuggestions":7,"angular-hint-log":13}],9:[function(require,module,exports){
'use strict';

var ngEventDirectives = require('./getEventDirectives')();

module.exports = function getEventAttribute(attrs) {
  for(var attr in attrs) {
    if(ngEventDirectives[attr]) {
      return attr;
    }
  }
};

},{"./getEventDirectives":10}],10:[function(require,module,exports){
'use strict';

module.exports = function getEventDirectives() {
  var list = 'click submit mouseenter mouseleave mousemove mousedown mouseover mouseup dblclick keyup keydown keypress blur focus submit cut copy paste'.split(' ');
  var eventDirHash = {};
  list.forEach(function(dirName) {
    dirName = 'ng'+dirName.charAt(0).toUpperCase()+dirName.substring(1);
    eventDirHash[dirName] = dirName;
  });
  return eventDirHash;
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function getFunctionNames(str) {
  if (typeof str !== 'string') {
    return [];
  }
  var results = str.replace(/\s+/g, '').split(/[\+\-\/\|\<\>\^=&!%~]/g).map(function(x) {
    if(isNaN(+x)) {
      if(x.match(/\w+\(.*\)$/)){
        return x.substring(0, x.indexOf('('));
      }
      return x;
    }
  }).filter(function(x){return x;});
  return results;
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function getValidProps(obj) {
  var props = [];
  for(var prop in obj) {
    if (prop.charAt(0) !== '$' && typeof obj[prop] === 'function') {
      props.push(prop);
    }
  }
  return props;
};

},{}],13:[function(require,module,exports){
/**
* HintLog creates a queue of messages logged by ngHint modules. This object
* has a key for each ngHint module that corresponds to the messages
* from that module.
*/
var queuedMessages = {},
    MESSAGE_TYPES = [
      'error',
      'warning',
      'suggestion'
    ];

/**
* Add a message to the HintLog message queue. Messages are organized into categories
* according to their module name and severity.
**/
function logMessage(moduleName, message, severity, category) {
  // If no severity was provided, categorize the message as a `suggestion`
  severity = severity || 3;
  var messageType = MESSAGE_TYPES[severity - 1];

  // If no ModuleName was found, categorize the message under `General`
  moduleName = moduleName || 'General';

  // If the category does not exist, initialize a new object
  queuedMessages[moduleName] = queuedMessages[moduleName] || {};
  queuedMessages[moduleName][messageType] = queuedMessages[moduleName][messageType] || [];

  if (queuedMessages[moduleName][messageType].indexOf(message) < 0) {
    queuedMessages[moduleName][messageType].push(message);
  }

  module.exports.onMessage(moduleName, message, messageType, category);
}

/**
* Return and empty the current queue of messages.
**/
function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
}

module.exports.onMessage = function(message) {};
module.exports.logMessage = logMessage;
module.exports.flush = flush;

},{}],14:[function(require,module,exports){
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


},{}],15:[function(require,module,exports){
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

},{"./levenstein_distance":14}],16:[function(require,module,exports){
module.exports=require(5)
},{"/Users/bford/Development/angularjs-batarang/node_modules/angular-hint/node_modules/angular-hint-controllers/node_modules/angular-hint-log/hint-log.js":5}],17:[function(require,module,exports){
'use strict';

var storeDependencies = require('./lib/storeDependencies'),
    getModule = require('./lib/getModule'),
    start = require('./lib/start'),
    storeNgAppAndView = require('./lib/storeNgAppAndView'),
    storeUsedModules = require('./lib/storeUsedModules'),
    hasNameSpace = require('./lib/hasNameSpace'),
    modData = require('./lib/moduleData');

var doc = Array.prototype.slice.call(document.getElementsByTagName('*')),
  originalAngularModule = angular.module,
  modules = {};

storeNgAppAndView(doc);

angular.module = function(name, requiresOriginal) {
  var module = originalAngularModule.apply(this, arguments),
      name = module.name;

  module.requiresOriginal = requiresOriginal;
  modules[name] = module;
  hasNameSpace(name);
  var modToCheck = getModule(name, true);

  if(modToCheck && modToCheck.requiresOriginal !== module.requiresOriginal) {
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
  storeUsedModules(ngAppMod, modules);
  start();
});

},{"./lib/getModule":20,"./lib/hasNameSpace":24,"./lib/moduleData":26,"./lib/start":29,"./lib/storeDependencies":30,"./lib/storeNgAppAndView":31,"./lib/storeUsedModules":32}],18:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Modules';

module.exports = function(modules) {
  modules.forEach(function(module) {
    hintLog.logMessage(MODULE_NAME, module.message, module.severity);
  });
};

},{"angular-hint-log":16}],19:[function(require,module,exports){
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

},{"./moduleData":26}],20:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function(moduleName, getCreated) {
  return (getCreated)? modData.createdModules[moduleName] : modData.loadedModules[moduleName];
};

},{"./moduleData":26}],21:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Modules',
  SEVERITY_ERROR = 1;
 module.exports = function(attrs, ngAppFound) {
   if(attrs['ng-app'] && ngAppFound) {
     hintLog.logMessage(MODULE_NAME, 'ng-app may only be included once. The module "' +
      attrs['ng-app'].value + '" was not used to bootstrap because ng-app was already included.',
      SEVERITY_ERROR);
   }
  return attrs['ng-app'] ? attrs['ng-app'].value : undefined;
 };



},{"angular-hint-log":16}],22:[function(require,module,exports){
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

},{"./getModule":20,"./moduleData":26,"suggest-it":34}],23:[function(require,module,exports){
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

},{"./getModule":20}],24:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
    MODULE_NAME = 'Modules',
    SEVERITY_SUGGESTION = 3;

module.exports = function(str) {
  if (str === 'ng') {
    return true;
  }
  if(str.toLowerCase() === str || str.charAt(0).toUpperCase() === str.charAt(0)) {
    hintLog.logMessage(MODULE_NAME, 'The best practice for' +
      ' module names is to use lowerCamelCase. Check the name of "' + str + '".',
      SEVERITY_SUGGESTION);
    return false;
  }
  return true;
};

},{"angular-hint-log":16}],25:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');

module.exports = function(attrs) {
  for(var i = 0, length = attrs.length; i < length; i++) {
    if(normalizeAttribute(attrs[i].nodeName) === 'ng-view' ||
        attrs[i].value.indexOf('ng-view') > -1) {
          return true;
    }
  }
};

},{"./normalizeAttribute":28}],26:[function(require,module,exports){
module.exports = {
  createdModules: {},
  createdMulti: {},
  loadedModules: {}
};

},{}],27:[function(require,module,exports){
var modData = require('./moduleData'),
  getModule = require('./getModule');

module.exports = function() {
  if(modData.ngViewExists && !getModule('ngRoute')) {
    return {message: 'Directive "ngView" was used in the application however "ngRoute" was not loaded into any module.'};
  }
};

},{"./getModule":20,"./moduleData":26}],28:[function(require,module,exports){
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/, '').replace(/[:_]/g, '-');
};

},{}],29:[function(require,module,exports){
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

},{"./display":18,"./formatMultiLoaded":19,"./getUndeclaredModules":22,"./getUnusedModules":23,"./moduleData":26,"./ngViewNoNgRoute":27}],30:[function(require,module,exports){
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

},{"./moduleData":26}],31:[function(require,module,exports){
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

},{"./getNgAppMod":21,"./inAttrsOrClasses":25,"./moduleData":26,"./storeDependencies":30}],32:[function(require,module,exports){
var storeDependencies = require('./storeDependencies');

var storeUsedModules = module.exports = function(module, modules){
  if(module) {
    storeDependencies(module);
    module.requires.forEach(function(modName) {
      var mod = modules[modName];
      storeUsedModules(mod, modules);
    });
  }
};
},{"./storeDependencies":30}],33:[function(require,module,exports){
module.exports=require(14)
},{"/Users/bford/Development/angularjs-batarang/node_modules/angular-hint/node_modules/angular-hint-events/node_modules/suggest-it/lib/levenstein_distance.js":14}],34:[function(require,module,exports){
module.exports=require(15)
},{"./levenstein_distance":33,"/Users/bford/Development/angularjs-batarang/node_modules/angular-hint/node_modules/angular-hint-events/node_modules/suggest-it/lib/suggest-it.js":15}],35:[function(require,module,exports){
'use strict';

var summarize = require('./lib/summarize-model');
var hint = angular.hint = require('angular-hint-log');
var debounceOn = require('debounce-on');

hint.emit = function () {};

module.exports = angular.module('ngHintScopes', []).config(['$provide', function ($provide) {
  $provide.decorator('$rootScope', ['$delegate', '$parse', decorateRootScope]);
  $provide.decorator('$compile', ['$delegate', decorateDollaCompile]);
}]);

function decorateRootScope($delegate, $parse) {

  var perf = window.performance || { now: function () { return 0; } };

  var scopes = {},
      watching = {};

  var debouncedEmitModelChange = debounceOn(emitModelChange, 10, byScopeId);

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
        id: scopeId,
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

  var debouncedEmit = debounceOn(hint.emit, 10, function (params) {
    return params.id + params.path;
  });


  var scopePrototype = ('getPrototypeOf' in Object) ?
      Object.getPrototypeOf($delegate) : $delegate.__proto__;

  // var _watch = scopePrototype.$watch;
  // scopePrototype.$watch = function (watchExpression, reactionFunction) {
  //   var watchStr = humanReadableWatchExpression(watchExpression);
  //   var scopeId = this.$id;
  //   if (typeof watchExpression === 'function') {
  //     arguments[0] = function () {
  //       var start = perf.now();
  //       var ret = watchExpression.apply(this, arguments);
  //       var end = perf.now();
  //       hint.emit('scope:watch', {
  //         id: scopeId,
  //         watch: watchStr,
  //         time: end - start
  //       });
  //       return ret;
  //     };
  //   } else {
  //     var thatScope = this;
  //     arguments[0] = function () {
  //       var start = perf.now();
  //       var ret = thatScope.$eval(watchExpression);
  //       var end = perf.now();
  //       hint.emit('scope:watch', {
  //         id: scopeId,
  //         watch: watchStr,
  //         time: end - start
  //       });
  //       return ret;
  //     };
  //   }

  //   if (typeof reactionFunction === 'function') {
  //     var applyStr = reactionFunction.toString();
  //     arguments[1] = function () {
  //       var start = perf.now();
  //       var ret = reactionFunction.apply(this, arguments);
  //       var end = perf.now();
  //       hint.emit('scope:reaction', {
  //         id: this.$id,
  //         watch: watchStr,
  //         time: end - start
  //       });
  //       return ret;
  //     };
  //   }

  //   return _watch.apply(this, arguments);
  // };


  var _destroy = scopePrototype.$destroy;
  scopePrototype.$destroy = function () {
    var id = this.id;

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


  var _digest = scopePrototype.$digest;
  scopePrototype.$digest = function (fn) {
    var start = perf.now();
    var ret = _digest.apply(this, arguments);
    var end = perf.now();
    hint.emit('scope:digest', { id: this.$id, time: end - start });
    return ret;
  };


  var _apply = scopePrototype.$apply;
  scopePrototype.$apply = function (fn) {
    var start = perf.now();
    var ret = _apply.apply(this, arguments);
    var end = perf.now();
    hint.emit('scope:apply', { id: this.$id, time: end - start });
    debouncedEmitModelChange(this);
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

  function emitModelChange (scope) {
    var scopeId = scope.$id;
    if (watching[scopeId]) {
      Object.keys(watching[scopeId]).forEach(function (path) {
        var model = watching[scopeId][path];
        var value = summarize(model.get());
        if (value !== model.value) {
          hint.emit('model:change', {
            id: scope.$id,
            path: path,
            oldValue: model.value,
            value: value
          });
          model.value = value;
        }
      });
    }
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
    }
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

function scopeDescriptor (elt, scope) {
  var val,
      types = [
        'ng-app',
        'ng-controller',
        'ng-repeat',
        'ng-include'
      ],
      theseTypes = [],
      type;

  if (elt) {
    for (var i = 0; i < types.length; i++) {
      type = types[i];
      if (val = elt.attr(type)) {
        theseTypes.push(type + '="' + val + '"');
      }
    }
  }
  if (theseTypes.length === 0) {
    return 'scope.$id=' + scope.$id;
  } else {
    return theseTypes.join(' ');
  }
}

function byScopeId (scope) {
  return scope.$id;
}

function humanReadableWatchExpression (fn) {
  if (fn.exp) {
    fn = fn.exp;
  } else if (fn.name) {
    fn = fn.name;
  }
  return fn.toString();
}

},{"./lib/summarize-model":36,"angular-hint-log":37,"debounce-on":38}],36:[function(require,module,exports){

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

},{}],37:[function(require,module,exports){
module.exports=require(5)
},{"/Users/bford/Development/angularjs-batarang/node_modules/angular-hint/node_modules/angular-hint-controllers/node_modules/angular-hint-log/hint-log.js":5}],38:[function(require,module,exports){
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

},{}]},{},[1]);
