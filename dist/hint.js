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

function sendMessage (obj) {
  window.postMessage(obj, '*');
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
//Create pipe for all hint messages from different modules
angular.hint = require('angular-hint-log');

// Load angular hint modules
require('angular-hint-controllers');
require('angular-hint-directives');
require('angular-hint-dom');
require('angular-hint-events');
require('angular-hint-interpolation');
require('angular-hint-modules');

// List of all possible modules
// The default ng-hint behavior loads all modules
var allModules = ['ngHintControllers', 'ngHintDirectives', 'ngHintDom', 'ngHintEvents',
  'ngHintInterpolation', 'ngHintModules'];

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

  if ((elt = document.querySelector('[ng-hint-include]'))) {
    modules = hintModulesFromElement(elt);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = allModules;
  } else {
    angular.hint.logMessage('##General## ngHint is included on the page, but is not active because'+
      ' there is no `ng-hint` attribute present');
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
      angular.hint.logMessage('##General## Module ' + name + ' could not be found');
  });
}

function hintModuleName(name) {
  return 'ngHint' + title(name);
}

function title(str) {
  return str[0].toUpperCase() + str.substr(1);
}

function flush() {
  var log = angular.hint.flush(), groups = Object.keys(log);
  for(var i = 0, ii = groups.length; i < ii; i++) {
    console.groupCollapsed? console.groupCollapsed('Angular Hint: ' + groups[i]) :
      console.log('Angular Hint: ' + groups[i]);
    var messages = Object.keys(log[groups[i]]);
    for(var j = 0, jj = messages.length; j < jj; j++) {
      console.log(messages[j]);
    }
    console.groupEnd && console.groupEnd();
  }
}
setInterval(flush, 5);

},{"angular-hint-controllers":4,"angular-hint-directives":5,"angular-hint-dom":35,"angular-hint-events":37,"angular-hint-interpolation":48,"angular-hint-log":59,"angular-hint-modules":60}],4:[function(require,module,exports){
'use strict';

var nameToControllerMatch = {};
var controllers = {};
var hintLog = angular.hint = require('angular-hint-log');

/**
* Decorates $controller with a patching function to
* log a message if the controller is instantiated on the window
*/
angular.module('ngHintControllers', []).
  config(function ($provide) {
    $provide.decorator('$controller', function($delegate) {
        return function(ctrl, locals) {
          //If the controller name is passed, find the controller than matches it
          if(typeof ctrl === 'string') {
            ctrl = nameToControllerMatch[ctrl];
          }
          locals = locals || {};
          //If the controller is not in the list of already registered controllers
          //and it is not connected to the local scope, it must be instantiated on the window
          if(!controllers[ctrl] && (!locals.$scope || !locals.$scope[ctrl])) {
            if(angular.version.minor <= 2) {
              hintLog.logMessage('##Controllers## It is against Angular best practices to ' +
                'instantiate a controller on the window. This behavior is deprecated in Angular' +
                ' 1.3.0');
            } else {
              hintLog.logMessage('##Controllers## Global instantiation of controllers was deprecated in Angular' +
              ' 1.3.0. Define the controller on a module.');
            }
          }
          var ctrlInstance = $delegate.apply(this, [ctrl, locals]);
          return ctrlInstance;
        };
    });
});

/**
* Save details of the controllers as they are instantiated
* for use in decoration.
*/
var originalModule = angular.module;
angular.module = function() {
  var module = originalModule.apply(this, arguments);
  var originalController = module.controller;
  module.controller = function(controllerName, controllerConstructor) {
    nameToControllerMatch[controllerName] = controllerConstructor;
    var firstLetter = controllerName.charAt(0);

    if(firstLetter !== firstLetter.toUpperCase() && firstLetter === firstLetter.toLowerCase()) {
      hintLog.logMessage('##Controllers## The best practice is to name controllers with an' +
        ' uppercase first letter. Check the name of \'' + controllerName + '\'.');
    }

    var splitName = controllerName.split('Controller');
    if(splitName.length === 1 || splitName[splitName.length - 1] !== '') {
      hintLog.logMessage('##Controllers## The best practice is to name controllers ending with ' +
        '\'Controller\'. Check the name of \'' + controllerName + '\'');
    }

    controllers[controllerConstructor] = controllerConstructor;
    return originalController.apply(this, arguments);
  };
  return module;
};

},{"angular-hint-log":59}],5:[function(require,module,exports){
'use strict';

var hintLog = angular.hint = require('angular-hint-log');
var ddLibData = require('./lib/ddLib-data');

var RESTRICT_REGEXP = /restrict\s*:\s*['"](.+?)['"]/;
var customDirectives = [];
var dasherize = require('dasherize');
var search = require('./lib/search');
var checkPrelimErrors = require('./lib/checkPrelimErrors');
var getKeysAndValues = require('./lib/getKeysAndValues');
var defaultDirectives = ddLibData.directiveTypes['angular-default-directives'].directives;
var htmlDirectives = ddLibData.directiveTypes['html-directives'].directives;

angular.module('ngHintDirectives', ['ngLocale'])
  .config(['$provide', function($provide) {
    $provide.decorator('$compile', ['$delegate', function($delegate) {
      return function(elem) {
        elem = angular.element(elem);
        for(var i = 0; i < elem.length; i+=2){
          if(elem[i].getElementsByTagName){
            var toSend = Array.prototype.slice.call(elem[i].getElementsByTagName('*'));
            search(toSend, customDirectives);
          }
        }
        return $delegate.apply(this, arguments);
      };
    }]);
  }]);


angular.module('ngLocale').config(function($provide) {
  var originalProvider = $provide.provider;
  $provide.provider = function(token, provider) {
    provider = originalProvider.apply($provide, arguments);
    if (token === '$compile') {
      var originalProviderDirective = provider.directive;
      provider.directive = function(dirsObj) {
        for(var prop in dirsObj){
          var propDashed = dasherize(prop);
          if(isNaN(+propDashed) &&
              !defaultDirectives[propDashed] &&
              !htmlDirectives[propDashed]) {
            var matchRestrict = dirsObj[prop].toString().match(RESTRICT_REGEXP);
            ddLibData.directiveTypes['angular-default-directives']
                .directives[propDashed] = (matchRestrict && matchRestrict[1]) || 'ACME';
          }
        }
        return originalProviderDirective.apply(this, arguments);
      };
    }
    return provider;
  };
});

var originalAngularModule = angular.module;
angular.module = function() {
  var module = originalAngularModule.apply(this, arguments);
  var originalDirective = module.directive;
  module.directive = function(directiveName, directiveFactory) {
    var originalDirectiveFactory = typeof directiveFactory === 'function' ? directiveFactory :
        directiveFactory[directiveFactory.length - 1];
    var factoryStr = originalDirectiveFactory.toString();

    checkPrelimErrors(directiveName,factoryStr);

    var pairs = getKeysAndValues(factoryStr);
    pairs.map(function(pair){customDirectives.push(pair);});

    var matchRestrict = factoryStr.match(RESTRICT_REGEXP);
    var restrict = (matchRestrict && matchRestrict[1]) || 'A';
    var directive = {directiveName: directiveName, restrict: restrict,  require:pairs};
    customDirectives.push(directive);

    return originalDirective.apply(this, arguments);
  };
  return module;
};

},{"./lib/checkPrelimErrors":15,"./lib/ddLib-data":16,"./lib/getKeysAndValues":23,"./lib/search":31,"angular-hint-log":33,"dasherize":34}],6:[function(require,module,exports){
/**
 *@param s: first string to compare
 *@param t: second string to compare
 *
 *@description:
 *Checks to see if two strings are similiar enough to even bother checking the Levenshtein Distance.
 */
module.exports = function(s,t) {
  var strMap = {}, similarities = 0, STRICTNESS = 0.66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x;});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  }
  return similarities >= t.length * STRICTNESS;
};

},{}],7:[function(require,module,exports){
var ddLibData = require('./ddLib-data');

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@description attribute exsistance in the types of directives/attibutes (html, angular core, and
 * angular custom) and checks the restrict property of values matches its use.
 *
 *@return {} with attribute exsistance and wrong use e.g. restrict property set to elements only.
 **/
module.exports = function(attribute, options) {
  var anyTrue = false,
      wrongUse = '',
      directive,
      restrictProp;

  options.directiveTypes.forEach(function(dirType) {
    var isTag = attribute.charAt(0) === '*';
    var isCustomDir = dirType === 'angular-custom-directives';
    if(!isTag) {
      directive = ddLibData.directiveTypes[dirType].directives[attribute] || '';
      restrictProp = directive.restrict || directive;
      if(restrictProp) {
        if(restrictProp.indexOf('E') > -1 && restrictProp.indexOf('A') < 0) {
          wrongUse = 'element';
        }
        if(restrictProp.indexOf('C') > -1 && restrictProp.indexOf('A') < 0) {
          wrongUse = (wrongUse) ? 'element and class' : 'class';
        }
        anyTrue = anyTrue || true;
      }
    }
    else if(isTag && isCustomDir){
      directive = ddLibData.directiveTypes[dirType].directives[attribute.substring(1)] || '';
      restrictProp = directive.restrict || directive;
      anyTrue = anyTrue || true;
      if(restrictProp && restrictProp.indexOf('A') > -1 && restrictProp.indexOf('E') < 0) {
        wrongUse = 'attribute';
      }
    }
  });
  var typeError = wrongUse? 'wronguse':'' || !anyTrue ? 'nonexsisting' : '' || '';
  return {exsists: anyTrue, wrongUse: wrongUse, typeError: typeError};
};

},{"./ddLib-data":16}],8:[function(require,module,exports){
module.exports = function(info, id, type) {
  var s = info.missing.length === 1 ? ' ' : 's ';
  var waswere = info.missing.length === 1 ? 'was ' : 'were ';
  var missing = '';
  info.missing.forEach(function(str){
    missing += '"'+str+'",';
  });
  missing = '['+missing.substring(0,missing.length-1)+'] ';
  var message = 'Attribute'+s+missing+waswere+'found to be missing in '+type+ ' element'+id+'.';
  return message;
};

},{}],9:[function(require,module,exports){
var isMutExclusiveDir = require('./isMutExclusiveDir');

module.exports = function(info, id, type) {
  var pair = isMutExclusiveDir(info.error);
  var message = 'Angular attributes "'+info.error+'" and "'+pair+'" in '+type+ ' element'+id+
    ' should not be attributes together on the same HTML element';
  return message;
};

},{"./isMutExclusiveDir":28}],10:[function(require,module,exports){
var hintLog = require('angular-hint-log');

module.exports = function(directiveName) {
  var message = 'Directive "'+directiveName+'" should have proper namespace try adding a prefix'+
    ' and/or using camelcase.';
  var domElement = '<'+directiveName+'> </'+directiveName+'>';
  hintLog.logMessage('##Directives## ' + message);
};

},{"angular-hint-log":33}],11:[function(require,module,exports){
module.exports = function(info, id, type) {
  var ngDir = 'ng-'+info.error.substring(2);
  var message = 'Use Angular version of "'+info.error+'" in '+type+' element'+id+'. Try: "'+ngDir+'"';
  return message;
};

},{}],12:[function(require,module,exports){
var ddLibData = require('./ddLib-data');

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message+type+' element'+id+'. ';
  var error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error;
  message +='Found incorrect attribute "'+error+'" try "'+info.match+'".';
  return message;
};

},{"./ddLib-data":16}],13:[function(require,module,exports){
var hintLog = require('angular-hint-log');

module.exports = function(directiveName) {
  var message = 'The use of "replace" in directive factories is deprecated,'+
    ' and it was found in "'+directiveName+'".';
  var domElement = '<'+directiveName+'> </'+directiveName+'>';
  hintLog.logMessage('##Directives## ' + message);
};

},{"angular-hint-log":33}],14:[function(require,module,exports){
var ddLibData = require('./ddLib-data');

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message+type+' element'+id+'. ';
  var error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error;
  var aecmType = (info.wrongUse.indexOf('attribute') > -1)? 'Element' : 'Attribute';
  message += aecmType+' name "'+error+'" is reserved for '+info.wrongUse+' names only.';
  return message;
};

},{"./ddLib-data":16}],15:[function(require,module,exports){
var hasNameSpace = require('./hasNameSpace');
var buildNameSpace = require('./buildNameSpace');
var hasReplaceOption = require('./hasReplaceOption');
var buildReplaceOption = require('./buildReplaceOption');

module.exports = function(dirName, dirFacStr) {
  if (!hasNameSpace(dirName)) {
    buildNameSpace(dirName);
  }
  if (hasReplaceOption(dirFacStr)) {
    buildReplaceOption(dirName);
  }
};

},{"./buildNameSpace":10,"./buildReplaceOption":13,"./hasNameSpace":26,"./hasReplaceOption":27}],16:[function(require,module,exports){
module.exports = {
  directiveTypes : {
    'html-directives': {
      message: 'There was an HTML error in ',
      directives: {
      'abbr' : 'A',
      'accept': 'A',
      'accesskey': 'A',
      'action': 'A',
      'align': 'A',
      'alt': 'A',
      'background': 'A',
      'bgcolor': 'A',
      'border': 'A',
      'cellpadding': 'A',
      'char': 'A',
      'charoff': 'A',
      'charset': 'A',
      'checked': 'A',
      'cite': 'A',
      'class': 'A',
      'classid': 'A',
      'code': 'A',
      'codebase': 'A',
      'color': 'A',
      'cols': 'A',
      'colspan': 'A',
      'content': 'A',
      'data': 'A',
      'defer': 'A',
      'dir': 'A',
      'face': 'A',
      'for': 'A',
      'frame': 'A',
      'frameborder': 'A',
      'headers': 'A',
      'height': 'A',
      'http-equiv': 'A',
      'href': 'A',
      'id': 'A',
      'label': 'A',
      'lang': 'A',
      'language': 'A',
      'link': 'A',
      'marginheight': 'A',
      'marginwidth': 'A',
      'maxlength': 'A',
      'media': 'A',
      'multiple': 'A',
      'name': 'A',
      'object': '!A',
      'onblur': '!A',
      'onchange': '!A',
      'onclick': '!A',
      'onfocus': '!A',
      'onkeydown': '!A',
      'onkeypress': '!A',
      'onkeyup': '!A',
      'onload': '!A',
      'onmousedown': '!A',
      'onmousemove': '!A',
      'onmouseout': '!A',
      'onmouseover': '!A',
      'onmouseup': '!A',
      'onreset': '!A',
      'onselect': '!A',
      'onsubmit': '!A',
      'readonly': 'A',
      'rel': 'A',
      'rev': 'A',
      'role': 'A',
      'rows': 'A',
      'rowspan': 'A',
      'size': 'A',
      'span': 'EA',
      'src': 'A',
      'start': 'A',
      'style': 'A',
      'text': 'A',
      'target': 'A',
      'title': 'A',
      'type': 'A',
      'value': 'A',
      'width': 'A'}
    },
    'angular-default-directives': {
      message: 'There was an AngularJS error in ',
      directives: {
        'count': 'A',
        'min': 'A',
        'max': 'A',
        'ng-app': 'A',
        'ng-bind': 'A',
        'ng-bindhtml': 'A',
        'ng-bindtemplate': 'A',
        'ng-blur': 'A',
        'ng-change': 'A',
        'ng-checked': 'A',
        'ng-class': 'A',
        'ng-classeven': 'A',
        'ng-classodd': 'A',
        'ng-click': 'A',
        'ng-cloak': 'A',
        'ng-controller': 'A',
        'ng-copy': 'A',
        'ng-csp': 'A',
        'ng-cut': 'A',
        'ng-dblclick': 'A',
        'ng-disabled': 'A',
        'ng-dirty': 'A',
        'ng-focus': 'A',
        'ng-form': 'A',
        'ng-hide': 'A',
        'ng-hint': 'A',
        'ng-hint-exclude': 'A',
        'ng-hint-include': 'A',
        'ng-href': 'A',
        'ng-if': 'A',
        'ng-include': 'A',
        'ng-init': 'A',
        'ng-invalid': 'A',
        'ng-keydown': 'A',
        'ng-keypress': 'A',
        'ng-keyup': 'A',
        'ng-list': 'A',
        'ng-maxlength': 'A',
        'ng-minlength': 'A',
        'ng-model': 'A',
        'ng-model-options': 'A',
        'ng-mousedown': 'A',
        'ng-mouseenter': 'A',
        'ng-mouseleave': 'A',
        'ng-mousemove': 'A',
        'ng-mouseover': 'A',
        'ng-mouseup': 'A',
        'ng-nonbindable': 'A',
        'ng-open': 'A',
        'ng-options': 'A',
        'ng-paste': 'A',
        'ng-pattern': 'A',
        'ng-pluralize': 'A',
        'ng-pristine': 'A',
        'ng-readonly': 'A',
        'ng-repeat': 'A',
        'ng-required': 'A',
        'ng-selected': 'A',
        'ng-show': 'A',
        'ng-src': 'A',
        'ng-srcset': 'A',
        'ng-style': 'A',
        'ng-submit': 'A',
        'ng-switch': 'A',
        'ng-transclude': 'A',
        'ng-true-value': 'A',
        'ng-trim': 'A',
        'ng-false-value': 'A',
        'ng-value': 'A',
        'ng-valid': 'A',
        'ng-view': 'A',
        'required': 'A',
        'when': 'A'
      }
    },
    'angular-custom-directives': {
      message: 'There was an AngularJS error in ',
      directives: {

      }
    }
  }
};

},{}],17:[function(require,module,exports){
var areSimilarEnough = require('./areSimilarEnough');
var levenshteinDistance = require('./levenshtein');

/**
 *@param directiveTypeData: {} with list of directives/attributes and
 *their respective restrict properties.
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *
 *@return {} with Levenshtein Distance and name of the closest match to given attribute.
 **/
module.exports = function(directiveTypeData, attribute) {
  if(typeof attribute !== 'string') {
    throw new Error('Function must be passed a string as second parameter.');
  }
  if((directiveTypeData === null || directiveTypeData === undefined) ||
    typeof directiveTypeData !== 'object') {
    throw new Error('Function must be passed a defined object as first parameter.');
  }
  var min_levDist = Infinity,
      closestMatch = '';

  for(var directive in directiveTypeData){
    if(areSimilarEnough(attribute,directive)) {
      var currentlevDist = levenshteinDistance(attribute, directive);
      closestMatch = (currentlevDist < min_levDist)? directive : closestMatch;
      min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return {min_levDist: min_levDist, match: closestMatch};
};

},{"./areSimilarEnough":6,"./levenshtein":29}],18:[function(require,module,exports){

var getFailedAttributesOfElement = require('./getFailedAttributesOfElement');

module.exports = function(scopeElements, options) {
  return scopeElements.map(getFailedAttributesOfElement.bind(null, options))
      .filter(function(x) {return x;});
};

},{"./getFailedAttributesOfElement":22}],19:[function(require,module,exports){
var ddLibData = require('./ddLib-data');

module.exports = function(dirName, attributes) {
  attributes = attributes.map(function(x){return x.nodeName;});
  var directive = ddLibData.directiveTypes['angular-custom-directives'].directives[dirName];
  var missing = [];
  if (directive && directive.require) {
    for (var i = 0; i < directive.require.length; i++) {
      if (attributes.indexOf(directive.require[i].directiveName) < 0) {
        missing.push(directive.require[i].directiveName);
      }
    }
  }
  return missing;
};

},{"./ddLib-data":16}],20:[function(require,module,exports){
var hintLog = require('angular-hint-log');

var build = {
  wronguse: require('./buildWrongUse'),
  nonexsisting: require('./buildNonExsisting'),
  missingrequired: require('./buildMissingRequired'),
  ngevent: require('./buildNgEvent'),
  mutuallyexclusive: require('./buildMutuallyExclusive')
};

/**
 *@param failedElements: [] of {}s of all failed elements with their failed attributes and closest
 *matches or restrict properties
 *
 *@return [] of failed messages.
 **/
module.exports = function(failedElements) {
  failedElements.forEach(function(obj) {
    obj.data.forEach(function(info) {
      var id = (obj.domElement.id) ? ' with id: #' + obj.domElement.id : '';
      var type = obj.domElement.nodeName;
      var message = build[info.typeError](info, id, type);
      hintLog.logMessage('##Directives## ' + message);
    });
  });
};

},{"./buildMissingRequired":8,"./buildMutuallyExclusive":9,"./buildNgEvent":11,"./buildNonExsisting":12,"./buildWrongUse":14,"angular-hint-log":33}],21:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');
var ddLibData = require('./ddLib-data');
var isMutExclusiveDir = require('./isMutExclusiveDir');
var hasMutExclusivePair = require('./hasMutExclusivePair');
var attributeExsistsInTypes = require('./attributeExsistsInTypes');
var getSuggestions = require('./getSuggestions');

/**
 *@param attributes: [] of attributes from element (includes tag name of element, e.g. DIV, P, etc.)
 *@param options: {} options object from beginSearch
 *
 *@return [] of failedAttributes with their respective suggestions and directiveTypes
 **/
module.exports = function(attributes, options) {
  var failedAttrs = [], mutExPairFound = false;
  for (var i = 0; i < attributes.length; i++) {
    var attr = normalizeAttribute(attributes[i].nodeName);
    var dirVal = ddLibData.directiveTypes['html-directives'].directives[attr] || '';
    if (dirVal.indexOf('!') > -1) {
      failedAttrs.push({
        error: attr,
        directiveType: 'html-directives',
        typeError: 'ngevent'
      });
      continue;
    }
    if (!mutExPairFound && isMutExclusiveDir(attr) && hasMutExclusivePair(attr, attributes)) {
      failedAttrs.push({
        error: attr,
        directiveType: 'angular-default-directives',
        typeError: 'mutuallyexclusive'
      });
      mutExPairFound = true;
      continue;
    }
    var result = attributeExsistsInTypes(attr,options);
    var suggestion = result.typeError === 'nonexsisting' ?
        getSuggestions(attr, options) : {match: ''};

    if (result.typeError) {
      failedAttrs.push({
        match: suggestion.match || '',
        wrongUse: result.wrongUse || '',
        error: attr,
        directiveType: suggestion.directiveType || 'angular-custom-directives',
        typeError: result.typeError
      });
    }
  }
  return failedAttrs;
};

},{"./attributeExsistsInTypes":7,"./ddLib-data":16,"./getSuggestions":24,"./hasMutExclusivePair":25,"./isMutExclusiveDir":28,"./normalizeAttribute":30}],22:[function(require,module,exports){
var getFailedAttributes = require('./getFailedAttributes');
var findMissingAttrs = require('./findMissingAttrs');


/**
 *@description
 *Adds element tag name (DIV, P, SPAN) to list of attributes with '*' prepended
 *for identification later.
 *
 *@param options: {} options object from beginSearch
 *@param element: HTML element to check attributes of
 *
 *@return {} of html element and [] of failed attributes
 **/
module.exports = function(options, element) {
  if(element.attributes.length) {
    var eleName = element.nodeName.toLowerCase();
    var eleAttrs = Array.prototype.slice.call(element.attributes);
    eleAttrs.push({
      nodeName: '*'+eleName
    });
    var failedAttrs = getFailedAttributes(eleAttrs, options);
    var missingRequired = findMissingAttrs(eleName, eleAttrs);
    if(failedAttrs.length || missingRequired.length) {
      if(missingRequired.length) {
        failedAttrs.push({
          directiveType: 'angular-custom-directive',
          missing: missingRequired,
          typeError: 'missingrequired'
        });
      }
      return {
        domElement: element,
        data: failedAttrs
      };
    }
  }
};

},{"./findMissingAttrs":19,"./getFailedAttributes":21}],23:[function(require,module,exports){
module.exports = function(str) {
  var customDirectives = [], pairs = [];
  var matchScope = str.replace(/\n/g,'').match(/scope\s*:\s*{\s*[^}]*['"]\s*}/);
  if (matchScope) {
    matchScope[0].match(/\w+\s*:\s*['"][a-zA-Z=@&]+['"]/g).map(function(str){
      var temp = str.match(/(\w+)\s*:\s*['"](.+)['"]/);
      pairs.push({key:temp[1],value:temp[2]});
    });
    pairs.forEach(function(pair){
      var name = (['=', '@', '&'].indexOf(pair.value) !== -1)? pair.key : pair.value.substring(1);
      customDirectives.push({directiveName: name , restrict:'A'});
    });
  }
  return customDirectives;
};

},{}],24:[function(require,module,exports){
var ddLibData = require('./ddLib-data');
var findClosestMatchIn = require('./findClosestMatchIn');

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@return {} with closest match to attribute and the directive type it corresponds to.
 **/
module.exports = function(attribute, options) {
  var min_levDist = Infinity,
      match = '',
      dirType = '';

  options.directiveTypes.forEach(function(directiveType) {
    var isTag = attribute.charAt(0) === '*';
    var isCustomDir = directiveType === 'angular-custom-directives';
    if (!isTag || (isTag && isCustomDir)) {
      var directiveTypeData = ddLibData.directiveTypes[directiveType].directives;
      var tempMatch = findClosestMatchIn(directiveTypeData, attribute);
      if (tempMatch.min_levDist < options.tolerance && tempMatch.min_levDist < min_levDist) {
        match = tempMatch.match;
        dirType = directiveType;
        min_levDist = tempMatch.min_levDist;
      }
    }
  });
  return {
    match: match,
    directiveType: dirType
  };
};

},{"./ddLib-data":16,"./findClosestMatchIn":17}],25:[function(require,module,exports){
var isMutExclusiveDir = require('./isMutExclusiveDir');

module.exports = function(attr, attributes) {
  var pair = isMutExclusiveDir(attr);

  return attributes.some(function(otherAttr) {
    return otherAttr.nodeName === pair;
  });
};

},{"./isMutExclusiveDir":28}],26:[function(require,module,exports){
module.exports = function(str) {
  return str.toLowerCase() !== str;
};

},{}],27:[function(require,module,exports){
module.exports = function(facStr) {
  return facStr.match(/replace\s*:/);
};

},{}],28:[function(require,module,exports){
module.exports = function (dirName) {
  var exclusiveDirHash = {
    'ng-show' : 'ng-hide',
    'ng-hide' : 'ng-show',
    'ng-switch-when' : 'ng-switch-default',
    'ng-switch-default' : 'ng-switch-when',
  };
  return exclusiveDirHash[dirName];
};

},{}],29:[function(require,module,exports){
/**
 *@param s: first string to compare for Levenshtein Distance.
 *@param t: second string to compare for Levenshtein Distance.
 *
 *@description
 *Calculates the minimum number of changes (insertion, deletion, transposition) to get from s to t.
 *
 *credit: http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
 *http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
 **/
module.exports = function(s, t) {
  if(typeof s !== 'string' || typeof t !== 'string') {
    throw new Error('Function must be passed two strings, given: '+typeof s+' and '+typeof t+'.');
  }
  var d = [];
  var n = s.length;
  var m = t.length;

  if (n === 0) {return m;}
  if (m === 0) {return n;}

  for (var ii = n; ii >= 0; ii--) { d[ii] = []; }
  for (var ii = n; ii >= 0; ii--) { d[ii][0] = ii; }
  for (var jj = m; jj >= 0; jj--) { d[0][jj] = jj; }
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    for (var j = 1; j <= m; j++) {
      if (i == j && d[i][j] > 4) return n;
      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1;
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;
      if (b < mi) mi = b;
      if (c < mi) mi = c;
      d[i][j] = mi;
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[n][m];
};

},{}],30:[function(require,module,exports){
/**
 *@param attribute: attribute name before normalization as string
 * e.g. 'data-ng-click', 'width', 'x:ng:src', etc.
 *
 *@return normalized attribute name
 **/
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,'').replace(/[:_]/g,'-');
};

},{}],31:[function(require,module,exports){

var formatResults = require('./formatResults');
var findFailedElements = require('./findFailedElements');
var setCustomDirectives = require('./setCustomDirectives');
var defaultTypes = [
  'html-directives',
  'angular-default-directives',
  'angular-custom-directives'
];


/**
 *
 *@param scopeElements: [] of HTML elements to be checked for incorrect attributes
 *@param customDirectives: [] of custom directive objects from $compile decorator
 *@param options: {} of options for app to run with:
 *    options.tolerance: Integer, maximum Levenshtein Distance to be allowed for misspellings
 *    options.directiveTypes: [] of which type of directives/attributes to search through
 **/
module.exports = function(scopeElements, customDirectives, options) {
  if(!Array.isArray(scopeElements)) {
    throw new Error('Function search must be passed an array.');
  }
  options = options || {};
  options.directiveTypes = options.directiveTypes || defaultTypes;
  options.tolerance = options.tolerance || 4;
  if(customDirectives && customDirectives.length){
    setCustomDirectives(customDirectives);
  }
  var failedElements = findFailedElements(scopeElements, options);
  formatResults(failedElements);
};

},{"./findFailedElements":18,"./formatResults":20,"./setCustomDirectives":32}],32:[function(require,module,exports){
var ddLibData = require('../lib/ddLib-data');

module.exports = function(customDirectives) {
  customDirectives.forEach(function(directive) {
    var directiveName = directive.directiveName.replace(/([A-Z])/g, '-$1').toLowerCase();
    ddLibData.directiveTypes['angular-custom-directives']
      .directives[directiveName] = directive;
  });
};

},{"../lib/ddLib-data":16}],33:[function(require,module,exports){
var queuedMessages = {};
function logMessage(message) {
  var nameAndValue = message.split(/##/);
  if(nameAndValue[0] !== '') {
    if(queuedMessages['No Name']) {
      queuedMessages['No Name'][message] = message;
    }  else {
      queuedMessages['No Name'] = {};
      queuedMessages['No Name'][message] = message;
    }
  } else if(queuedMessages[nameAndValue[1]]) {
    queuedMessages[nameAndValue[1]][nameAndValue[2]] = nameAndValue[2];
  } else {
    queuedMessages[nameAndValue[1]] = {};
    queuedMessages[nameAndValue[1]][nameAndValue[2]] = nameAndValue[2];
  }
  module.exports.onMessage(message);
};

function flush() {
  var flushMessages = queuedMessages;
  queuedMessages = {};
  return flushMessages;
};

module.exports.onMessage = function(message) {};
module.exports.logMessage = logMessage;
module.exports.flush = flush;
},{}],34:[function(require,module,exports){
'use strict';

var isArray = Array.isArray || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var isDate = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Date]';
};

var isRegex = function (obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var has = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

function dashCase(str) {
  return str.replace(/([A-Z])/g, function ($1) {
    return '-' + $1.toLowerCase();
  });
}

function map(xs, f) {
  if (xs.map) {
    return xs.map(f);
  }
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

function reduce(xs, f, acc) {
  if (xs.reduce) {
    return xs.reduce(f, acc);
  }
  for (var i = 0; i < xs.length; i++) {
    acc = f(acc, xs[i], i);
  }
  return acc;
}

function walk(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (isDate(obj) || isRegex(obj)) {
    return obj;
  }
  if (isArray(obj)) {
    return map(obj, walk);
  }
  return reduce(objectKeys(obj), function (acc, key) {
    var camel = dashCase(key);
    acc[camel] = walk(obj[key]);
    return acc;
  }, {});
}

module.exports = function (obj) {
  if (typeof obj === 'string') {
    return dashCase(obj);
  }
  return walk(obj);
};

},{}],35:[function(require,module,exports){
'use strict';

/**
* Create an interceptor that will log a message when use of a DOM API is detected
*/
var domInterceptor = require('dom-interceptor');
domInterceptor.enableLineNumbers(3);
var hintLog = angular.hint = require('angular-hint-log');
var INTERCEPTOR_FUNCTION = function(message) {
  hintLog.logMessage(message);
};

/**
* Decorates $controller with a patching function to
* throw an error if DOM APIs are manipulated from
* within an Angular controller
*/
angular.module('ngHintDom', []).
  config(function ($provide) {
    $provide.decorator('$controller', function($delegate, $injector) {

      var patchedServices = {};

      return function(ctrl, locals) {

        if(typeof ctrl === 'string') {
          ctrl = nameToConstructorMappings[ctrl];
        }

        var dependencies = $injector.annotate(ctrl);

        // patch methods on $scope
        locals = locals || {};
        dependencies.forEach(function (dep) {
          if (typeof dep === 'string' && !locals[dep]) {
            locals[dep] = patchedServices[dep] ||
              (patchedServices[dep] = patchService($injector.get('$timeout')));
          }
        });

        function disallowedContext(fn) {
          return function () {
            domInterceptor.addManipulationListener(INTERCEPTOR_FUNCTION);
            var ret = fn.apply(this, arguments);
            domInterceptor.removeManipulationListener();
            return ret;
          };
        }

        function patchArguments (fn) {
          return function () {
            for (var i = 0, ii = arguments.length; i < ii; i++) {
              if (typeof arguments[i] === 'function') {
                arguments[i] = disallowedContext(arguments[i]);
              }
            }
            return fn.apply(this, arguments);
          };
        }

        function patchService (obj) {
          if (typeof obj === 'function') {
            return patchArguments(obj);
          } else if (typeof obj === 'object') {
            return Object.keys(obj).reduce(function (obj, prop) {
              return obj[prop] = patchService(obj[prop]), obj;
            }, obj);
          }
          return obj;
        }

        //Detect manipulation of DOM APIs from within the body of the controller
        domInterceptor.addManipulationListener(INTERCEPTOR_FUNCTION);
        var ctrlInstance = $delegate.apply(this, [ctrl, locals]);
        domInterceptor.removeManipulationListener();

        //Detect manipulation of DOM APIs from properties on the controller
        Object.keys(ctrlInstance).forEach(function (prop) {
          if (prop[0] !== '$' && typeof ctrlInstance[prop] === 'function') {
            ctrlInstance[prop] = disallowedContext(ctrlInstance[prop]);
          }
        });

        //Detect manipulation of DOM APIs from functions defined inside the controller
        if(locals.$scope) {
          Object.keys(locals.$scope).forEach(function (prop) {
            if([prop][0] !== '$' && typeof locals.$scope[prop] === 'function') {
              locals.$scope[prop] = disallowedContext(locals.$scope[prop]);
            }
          });
        }

        return ctrlInstance;
      };
    });
  });

/**
* Keep a record of 'ControllerName': Controller pairs
* so that a controller can be retrieved via its name
*/
var nameToConstructorMappings = {};
var originalAngularModule = angular.module;
angular.module = function() {
  var module = originalAngularModule.apply(this, arguments);
  var originalController = module.controller;
  module.controller = function(controllerName, controllerConstructor) {
    nameToConstructorMappings[controllerName] = controllerConstructor;
    return originalController.apply(this, arguments);
  };
  return module;
};

},{"angular-hint-log":59,"dom-interceptor":36}],36:[function(require,module,exports){
'use strict';

/**
* The DOM-interceptor should not throw errors because
* of its own access to the DOM. Within the interceptor
* the listener should have no behavior.
*/
var _listener = function() {};
var listener = savedListener;
var savedListener = function(message) {};

/**
* Initializes the  listener to a function that is provided.
* The Element, Node, and Document prototypes are then patched to call
* this listener when DOM APIs are accessed.
**/
function addManipulationListener(newListener) {
  listener = _listener;
  savedListener = newListener;
  patchOnePrototype(Element, 'Element');
  patchOnePrototype(Node, 'Node');
  patchOnePrototype(Document, 'Document');
  listener = savedListener;
}

/**
* The interceptor should give a helpful message when manipulation is detected.
*/
var explanation = 'Detected Manipulation of DOM API: ';


/**
* The listener should include the line where the users program gives an error
* if line numbers are enabled. Enabling line numbers requires giving a valid
* line of the stack trace in which the line number should appear. This is because
* using an arbitrary line of the stacktrace such as line might return the line within
* the interceptor where the listener was called.
*/
var stackTraceLine;
function enableLineNumbers(stackTraceLocation) {
  if(typeof stackTraceLocation === 'number' && !isNaN(stackTraceLocation)) {
    stackTraceLine = stackTraceLocation;
  } else {
    throw new Error('Enabling line numbers requires an integer parameter of the stack trace line ' +
      'that should be given. Got: ' + stackTraceLocation);
  }
}

/**
* Finds the line number where access of a DOM API was detected
*/
function findLineNumber() {
  var e = new Error();
  var lineNum;
  //Find the line in the user's program rather than in this service
  if(e.stack) {
    lineNum = e.stack.split('\n')[stackTraceLine];
  } else {
      //In Safari, an error does not have a line number until it is thrown
      try {
        throw e;
      } catch (e) {
          lineNum = e.stack.split('\n')[stackTraceLine];
      }
  }
  lineNum = lineNum.split('<anonymous> ')[1] || lineNum;
  return lineNum;
}

/**
* Object to preserve all the original properties
* that will be restored after patching.
**/
var originalProperties = {};

/**
* Helper function for patching one prototype.
* Saves the unaltered state of the prototype using collectUnalteredPrototypeProperties()
* and then patches the given prototype with a call to the listener.
*/
function patchOnePrototype(type, typeName) {
  collectUnalteredPrototypeProperties(type, typeName);
  listener = _listener;
  if (!type || !type.prototype) {
    throw new Error('collectPrototypeProperties() needs a .prototype to collect properties from. ' +
      type + '.prototype is undefined.');
  }
  var objectProperties = Object.getOwnPropertyNames(type.prototype);
  objectProperties.forEach(function(prop) {
    //Access of some prototype values may throw an error
    var desc;
    try {
      desc = Object.getOwnPropertyDescriptor(type.prototype, prop);
    }
    catch(e) {}
    if (desc) {
      if (desc.configurable) {
        if (desc.value) {
          if (typeof desc.value === 'function') {
            var originalValue = desc.value;
            desc.value = function () {
              listener(explanation + prop + (stackTraceLine ? ' ' + findLineNumber() : ''));
              return originalValue.apply(this, arguments);
            };
          }
        }
        Object.defineProperty(type.prototype, prop, desc);
      } else if (desc.writable) {
          try {
            var original = type.prototype[prop];
            type.prototype[prop] = function () {
              listener(explanation + prop + (stackTraceLine ? ' ' + findLineNumber() : ''));
              return original.apply(this, arguments);
            };
          }
          catch (e) {}
        }
    }
  });
  listener = savedListener;
}

/**
* Helper method to collect all properties of a given prototype.
* When patching is removed, all prototype properties
* are set back to these original values
**/
function collectUnalteredPrototypeProperties(type, typeName) {
  listener = _listener;
  if(!type || !type.prototype) {
    throw new Error('collectUnalteredPrototypeProperties() needs a .prototype to collect properties' +
      ' from. ' + type + '.prototype is undefined.');
  } else if(!typeName) {
    throw new Error('typeName is required to save properties, got: ' + typeName);
  }
  var objectProperties = {};
  var objectPropertyNames = Object.getOwnPropertyNames(type.prototype);
  objectPropertyNames.forEach(function(prop) {
    //Access of some prototype values may throw an error
    try {
      objectProperties[prop] = type.prototype[prop];
    } catch(e) {}
  });
  listener = savedListener;
  originalProperties[typeName] = objectProperties;
  return objectProperties;
}

/**
* Controls the unpatching process by unpatching the
* prototypes as well as disabling the patching of individual
* HTML elements and returning those patched elements to their
* original state.
**/
function removeManipulationListener() {
  listener = _listener;
  unpatchOnePrototype(Element, 'Element');
  unpatchOnePrototype(Node, 'Node');
  unpatchOnePrototype(Document, 'Document');
  listener = savedListener;
}

/**
* Helper function to unpatch one prototype.
* Sets all properties of the given type back to the
* original values that were collected.
**/
function unpatchOnePrototype(type, typeName) {
  listener = _listener;
  if(!typeName) {
    throw new Error('typeName must be the name used to save prototype properties. Got: ' + typeName);
  }
  var objectProperties = Object.getOwnPropertyNames(type.prototype);
  objectProperties.forEach(function(prop) {
    //Access of some prototype values may throw an error
    try{
    var alteredElement = type.prototype[prop];
      if(typeof alteredElement === 'function') {
        type.prototype[prop] = originalProperties[typeName][prop];
      }
    } catch(e) {}
  });
  listener = savedListener;
}

module.exports.addManipulationListener = addManipulationListener;
module.exports.removeManipulationListener = removeManipulationListener;
module.exports.patchOnePrototype = patchOnePrototype;
module.exports.unpatchOnePrototype = unpatchOnePrototype;
module.exports.enableLineNumbers = enableLineNumbers;


},{}],37:[function(require,module,exports){
'use strict';

var hintLog = angular.hint = require('angular-hint-log');
var ngEventDirectives = require('./lib/getEventDirectives')();

var getEventAttribute = require('./lib/getEventAttribute');
var getFunctionNames = require('./lib/getFunctionNames');
var formatResults = require('./lib/formatResults');

angular.module('ngHintEvents',[])
  .config(['$provide',function($provide) {

    for(var directive in ngEventDirectives) {

      var dirName = ngEventDirectives[directive]+'Directive';

      $provide.decorator(dirName, ['$delegate', '$timeout', '$parse',
        function($delegate, $timeout, $parse) {

          var original = $delegate[0].compile, falseBinds = [], messages = [];

          $delegate[0].compile = function(element, attrs, transclude) {
            var eventAttrName = getEventAttribute(attrs.$attr);
            var fn = $parse(attrs[eventAttrName]);
            var messages = [];
            return function ngEventHandler(scope, element, attrs) {
              for(var attr in attrs.$attr) {
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
    }
  }]);
},{"./lib/formatResults":40,"./lib/getEventAttribute":41,"./lib/getEventDirectives":42,"./lib/getFunctionNames":43,"angular-hint-log":47}],38:[function(require,module,exports){
var getValidProps = require('./getValidProps');
var getSuggestion = require('./getSuggestion');

module.exports = function addSuggestions(messages) {
  messages.forEach(function(messageObj) {
    var props = getValidProps(messageObj.scope);
    var suggestion = getSuggestion(messageObj.boundFunc, props);
    messageObj['match'] = suggestion;
  });
  return messages;
};

},{"./getSuggestion":44,"./getValidProps":45}],39:[function(require,module,exports){
module.exports = function areSimilarEnough(s,t) {
  var strMap = {}, similarities = 0, STRICTNESS = .66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x;});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  }
  return similarities >= t.length * STRICTNESS;
};

},{}],40:[function(require,module,exports){
var hintLog = require('angular-hint-log');
var addSuggestions = require('./addSuggestions');

module.exports = function formatResults(messages) {
  messages = addSuggestions(messages);
  if(messages.length) {
    messages.forEach(function(obj) {
      var id = (obj.element[0].id) ? ' with id: #'+obj.element[0].id : '';
      var type = obj.element[0].nodeName;
      var suggestion = obj.match ? ' (Try "'+obj.match+'")': '';
      var message = 'Variable "'+obj.boundFunc+'" called on '+type+' element'+id+' does not '+
      'exist in that scope.'+suggestion+' Event directive found on ' + obj.element[0] + ' in ' +
      obj.scope + ' scope.';
      hintLog.logMessage('##Events## ' + message);
    });
  }
};

},{"./addSuggestions":38,"angular-hint-log":47}],41:[function(require,module,exports){
var ngEventDirectives = require('./getEventDirectives')();

module.exports = function getEventAttribute(attrs) {
  for(var attr in attrs) {
    if(ngEventDirectives[attr]) {
      return attr;
    }
  }
};

},{"./getEventDirectives":42}],42:[function(require,module,exports){
module.exports = function getEventDirectives() {
  var list = 'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' ');
  var eventDirHash = {};
  list.map(function(x){
    var name = 'ng'+x.charAt(0).toUpperCase()+x.substring(1);
    eventDirHash[name]=name;
  });
  return eventDirHash;
};

},{}],43:[function(require,module,exports){
module.exports = function getFunctionNames(str) {
  var results = str.replace(/\s+/g,'').split(/[\+\-\/\|\<\>\^=&!%~]/g).map(function(x){
    if(isNaN(+x)) {
      if(x.match(/\w+\(.*\)$/)){
        return x.substring(0,x.indexOf('('));
      }
      return x;
    }
  }).filter(function(x){return x;});
  return results;
};

},{}],44:[function(require,module,exports){
var areSimilarEnough = require('./areSimilarEnough');
var levenshteinDistance = require('./levenshtein');

module.exports = function getSuggestion(original, props) {
  var min_levDist = Infinity, closestMatch = '';
  for(var i in props) {
    var prop = props[i];
    if(areSimilarEnough(original, prop)) {
      var currentlevDist = levenshteinDistance(original, prop);
      var closestMatch = (currentlevDist < min_levDist)? prop : closestMatch;
      var min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return closestMatch;
};

},{"./areSimilarEnough":39,"./levenshtein":46}],45:[function(require,module,exports){
module.exports = function getValidProps(obj) {
  var props = [];
  for(var prop in obj) {
    if (prop.charAt(0) != '$' && typeof obj[prop] == 'function') {
      props.push(prop);
    }
  }
  return props;
};

},{}],46:[function(require,module,exports){
module.exports = function levenshteinDistance(s, t) {
    if(typeof s !== 'string' || typeof t !== 'string') {
      throw new Error('Function must be passed two strings, given: '+typeof s+' and '+typeof t+'.');
    }
    var d = [];
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    for (var i = n; i >= 0; i--) d[i] = [];
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        for (var j = 1; j <= m; j++) {
            if (i == j && d[i][j] > 4) return n;
            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1;
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;
            if (b < mi) mi = b;
            if (c < mi) mi = c;
            d[i][j] = mi;
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    return d[n][m];
};

},{}],47:[function(require,module,exports){
module.exports=require(33)
},{"/home/somekittens/Dropbox/angular/batarang/node_modules/angular-hint/node_modules/angular-hint-directives/node_modules/angular-hint-log/hint-log.js":33}],48:[function(require,module,exports){
'use strict';

var getAllParts = require('./lib/getAllParts');
var buildMessage = require('./lib/buildMessage');

angular.module('ngHintInterpolation', [])
  .config(['$provide', function($provide) {
    var ngHintInterpMessages = [];
    $provide.decorator('$interpolate', ['$delegate', '$timeout', function($delegate, $timeout) {
      var interpolateWrapper = function() {
        var interpolationFn = $delegate.apply(this, arguments);
        if(interpolationFn) {
          var parts = getAllParts(arguments[0],$delegate.startSymbol(),$delegate.endSymbol());
          var temp = interpolationFnWrap(interpolationFn,arguments, parts);
          return temp;
        }
      };
      var interpolationFnWrap = function(interpolationFn, interpolationArgs, allParts) {
        return function(){
          var result = interpolationFn.apply(this, arguments);
          buildMessage(allParts, interpolationArgs[0].trim(), arguments[0], $timeout);
          return result;
        };
      };
      angular.extend(interpolateWrapper,$delegate);
      return interpolateWrapper;
    }]);
  }]);

},{"./lib/buildMessage":50,"./lib/getAllParts":52}],49:[function(require,module,exports){
module.exports = function(s,t) {
  var strMap = {}, similarities = 0, STRICTNESS = 0.66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x;});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  }
  return similarities >= t.length * STRICTNESS;
};

},{}],50:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log');

var partsEvaluate = require('./partsEvaluate');

module.exports = function(allParts, originalInterpolation, scope, $timeout) {
  var message = partsEvaluate(allParts, originalInterpolation, scope);
  if(message) {
    hintLog.logMessage('##Interpolation## ' + message);
  }
};

},{"./partsEvaluate":57,"angular-hint-log":58}],51:[function(require,module,exports){
module.exports = function(parts, concatLength) {
  var total = '';
  for(var i = 0; i <= concatLength; i++) {
    var period = (i===0) ? '' : '.';
    total+=period+parts[i].trim();
  }
  return total;
};

},{}],52:[function(require,module,exports){
var getInterpolation = require('./getInterpolation');
var getOperands = require('./getOperands');
var concatParts = require('./concatParts');

module.exports = function(text, startSym, endSym) {
  if(text.indexOf(startSym) < 0 || text.indexOf(endSym) < 0) {
    throw new Error('Missing start or end symbol in interpolation. Start symbol: "'+startSym+
      '" End symbol: "'+endSym+'"');
  }
  var comboParts = [];
  var interpolation = getInterpolation(text, startSym, endSym);
  var operands = getOperands(interpolation);
  operands.forEach(function(operand) {
    var opParts =  operand.split('.');
    for(var i = 0; i < opParts.length; i++) {
      var result = concatParts(opParts,i);
      if(result && comboParts.indexOf(result) < 0 && isNaN(+result)){
        comboParts.push(result);
      }
    }
  });
  return comboParts;
};

},{"./concatParts":51,"./getInterpolation":53,"./getOperands":54}],53:[function(require,module,exports){
module.exports = function(text, startSym, endSym) {
  var startInd = text.indexOf(startSym) + startSym.length;
  var endInd = text.indexOf(endSym);
  return text.substring(startInd, endInd);
};

},{}],54:[function(require,module,exports){
module.exports = function(str) {
  return str.split(/[\+\-\/\|<\>\^=&!%~]/g);
};

},{}],55:[function(require,module,exports){
var areSimilarEnough = require('./areSimilarEnough');
var levenshtein = require('./levenshtein');

module.exports = function (part, scope) {
  var min_levDist = Infinity, closestMatch = '';
  for(var i in scope) {
    if(areSimilarEnough(part, i)) {
      var currentlevDist = levenshtein(part, i);
      closestMatch = (currentlevDist < min_levDist)? i : closestMatch;
      min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return closestMatch;
};

},{"./areSimilarEnough":49,"./levenshtein":56}],56:[function(require,module,exports){
module.exports = function(s, t) {
  if(typeof s !== 'string' || typeof t !== 'string') {
    throw new Error('Function must be passed two strings, given: '+typeof s+' and '+typeof t+'.');
  }
  var d = [];
  var n = s.length;
  var m = t.length;

  if (n === 0) {return m;}
  if (m === 0) {return n;}

  for (var ii = n; ii >= 0; ii--) { d[ii] = []; }
  for (var ii = n; ii >= 0; ii--) { d[ii][0] = ii; }
  for (var jj = m; jj >= 0; jj--) { d[0][jj] = jj; }
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    for (var j = 1; j <= m; j++) {
      if (i == j && d[i][j] > 4) return n;
      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1;
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;
      if (b < mi) mi = b;
      if (c < mi) mi = c;
      d[i][j] = mi;
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[n][m];
};

},{}],57:[function(require,module,exports){
var getSuggestion = require('./getSuggestion');

module.exports = function(allParts, originalInterpolation, scope) {
  var message, found = false;
  allParts.forEach(function(part) {
    if(!scope.$eval(part) && !found){
      found = true;
      var perInd = part.lastIndexOf('.');
      var tempScope = (perInd > -1) ? scope.$eval(part.substring(0, perInd)) : scope;
      var tempPart = part.substring(part.lastIndexOf('.') + 1);
      var suggestion = getSuggestion(tempPart, tempScope);
      suggestion = (suggestion) ? ' Try: "'+suggestion+'"' : '';
      message = '"'+part+'" was found to be undefined in "'+originalInterpolation+'".'+ suggestion;
    }
  });
  return message;
};

},{"./getSuggestion":55}],58:[function(require,module,exports){
module.exports=require(33)
},{"/home/somekittens/Dropbox/angular/batarang/node_modules/angular-hint/node_modules/angular-hint-directives/node_modules/angular-hint-log/hint-log.js":33}],59:[function(require,module,exports){
/**
* HintLog creates a queue of messages logged by ngHint modules. This object
* has a key for each ngHint module that corresponds to the messages
* from that module.
*/
var queuedMessages = {};

/**
* Add a message to the HintLog message queue. Messages are organized into categories
* according to their module name which is included in the message with ##ModuleName##.
* If a ##ModuleName## is not included, the message is added to a `General` category
* in the queue.
**/
function logMessage(message) {
  //HintLog messages are delimited by `##ModuleName## Module Message`
  //Split the message into the name and message value
  var nameThenValue = message.split(/##/);
  //If no ##ModuleName## was found, categorize the message under `General`
  if(nameThenValue[0] !== '') {
    //If the category does not exist, initialize a new object
    queuedMessages.General = queuedMessages.General || {};
    queuedMessages.General[message] = message;
  } else {
    //Strip leading spaces in message caused by splitting out ##ModuleName##
    nameThenValue[2] = nameThenValue[2].charAt(0) === ' ' ? nameThenValue[2].substring(1)
      : nameThenValue[2];
    //If the category does not exist, initialize a new object
    queuedMessages[nameThenValue[1]] = queuedMessages[nameThenValue[1]] || {};
    queuedMessages[nameThenValue[1]][nameThenValue[2]] = nameThenValue[2];
  }
  module.exports.onMessage(message);
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
},{}],60:[function(require,module,exports){
'use strict';

var hintLog = angular.hint = require('angular-hint-log');
var storeDependencies = require('./lib/storeDependencies');
var getModule = require('./lib/getModule');
var start = require('./lib/start');
var storeNgAppAndView = require('./lib/storeNgAppAndView');
var storeUsedModules = require('./lib/storeUsedModules');
var modData = require('./lib/moduleData');

var doc = Array.prototype.slice.call(document.getElementsByTagName('*'));
var originalAngularModule = angular.module;
var modules = {};

storeNgAppAndView(doc);

angular.module = function() {
  var module = originalAngularModule.apply(this,arguments);
  var name = module.name;
  modules[name] = module;
  var modToCheck = getModule(module.name, true);
  if(modToCheck && modToCheck.requires.length && module.requires.length) {
    if(!modData.createdMulti[module.name]) {
      modData.createdMulti[module.name] = [getModule(module.name,true)];
    }
    modData.createdMulti[module.name].push(module);
  }
  modData.createdModules[module.name] = module;
  return module;
};

angular.module('ngHintModules', []).config(function() {
  var ngAppMod = modules[modData.ngAppMod];
  storeUsedModules(ngAppMod, modules);
  start();
});

},{"./lib/getModule":64,"./lib/moduleData":71,"./lib/start":74,"./lib/storeDependencies":75,"./lib/storeNgAppAndView":76,"./lib/storeUsedModules":77,"angular-hint-log":59}],61:[function(require,module,exports){
module.exports = function(s,t) {
  var strMap = {},
      similarities = 0,
      STRICTNESS = 0.66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x;});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  }
  return similarities >= t.length * STRICTNESS;
};

},{}],62:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log');

module.exports = function(unusedModules) {
  unusedModules.forEach(function(module) {
    hintLog.logMessage('##Modules## ' + module.message);
  });
};

},{"angular-hint-log":59}],63:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function() {
  var multiLoaded = [];
  for(var modName in modData.createdMulti) {
    var message = 'Multiple modules with name "'+modName+'" are being created and they will overwrite each other.';
    var multi = modData.createdMulti[modName];
    var details = {
      existingModule: multi[multi.length - 1],
      overwrittenModules: multi.slice(0,multi.length-1)
    };
    multiLoaded.push({module:details, message:message});
  }
  return multiLoaded;
};

},{"./moduleData":71}],64:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function(moduleName, getCreated) {
    return (getCreated)? modData.createdModules[moduleName] : modData.loadedModules[moduleName];
};

},{"./moduleData":71}],65:[function(require,module,exports){
module.exports = function(attrs) {
  return attrs['ng-app'] ? attrs['ng-app'].value : undefined;
};

},{}],66:[function(require,module,exports){
var levenshteinDistance = require('./levenshtein');
var areSimilarEnough = require('./areSimilarEnough');
var modData = require('./moduleData');

module.exports = function(module){
  var min_levDist = Infinity,
      closestMatch = '';
  for(var createdModule in modData.createdModules) {
    if(areSimilarEnough(createdModule, module)) {
      var currentlevDist = levenshteinDistance(module, createdModule);
      if(currentlevDist < 5) {
        closestMatch = (currentlevDist < min_levDist)? createdModule : closestMatch;
        min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
      }
    }
  }
  return closestMatch;
};

},{"./areSimilarEnough":61,"./levenshtein":70,"./moduleData":71}],67:[function(require,module,exports){
var getModule = require('./getModule');
var getSuggestion = require('./getSuggestion');

module.exports = function(loadedModules) {
  var undeclaredModules = [];
  for( var module in loadedModules) {
    var cModule = getModule(module, true);
    if(!cModule) {
      var match = getSuggestion(module);
      var suggestion = (match) ? '; Try: "'+match+'"' : '';
      var message = 'Module "'+module+'" was loaded but does not exist'+suggestion+'.';
      undeclaredModules.push({module:null, message:message});
    }
  }
  return undeclaredModules;
};

},{"./getModule":64,"./getSuggestion":66}],68:[function(require,module,exports){
var getModule = require('./getModule');

module.exports = function(createdModules) {
  var unusedModules = [];
  for(var module in createdModules) {
    if(!getModule(module)) {
      var cModule = createdModules[module];
      var message = 'Module "'+cModule.name+'" was created but never loaded.';
      unusedModules.push({module:cModule, message:message});
    }
  }
  return unusedModules;
};

},{"./getModule":64}],69:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');

module.exports = function(attrs) {
  for(var i = 0; i < attrs.length; i++) {
    if(normalizeAttribute(attrs[i].nodeName) === 'ng-view'
      || attrs[i].value.indexOf('ng-view') > -1) {
      return true;
    }
  }
};

},{"./normalizeAttribute":73}],70:[function(require,module,exports){
module.exports=require(56)
},{"/home/somekittens/Dropbox/angular/batarang/node_modules/angular-hint/node_modules/angular-hint-interpolation/lib/levenshtein.js":56}],71:[function(require,module,exports){
module.exports = {
    createdModules: {},
    createdMulti: {},
    loadedModules: {}
  };

},{}],72:[function(require,module,exports){
var modData = require('./moduleData');
var getModule = require('./getModule');

module.exports = function() {
  if(modData.ngViewExists && !getModule('ngRoute')) {
    return {message: 'Directive "ngView" was used in the application however "ngRoute" was not loaded into any module.'};
  }
};

},{"./getModule":64,"./moduleData":71}],73:[function(require,module,exports){
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,'').replace(/[:_]/g,'-');
};

},{}],74:[function(require,module,exports){
var display = require('./display');
var formatMultiLoaded = require('./formatMultiLoaded');
var getUnusedModules = require('./getUnusedModules');
var getUndeclaredModules = require('./getUndeclaredModules');
var modData = require('./moduleData');
var ngViewNoNgRoute = require('./ngViewNoNgRoute');

module.exports = function() {
  var unusedModules = getUnusedModules(modData.createdModules);
  var undeclaredModules = getUndeclaredModules(modData.loadedModules);
  var multiLoaded = formatMultiLoaded();
  var noNgRoute = ngViewNoNgRoute();
  if(unusedModules.length || undeclaredModules.length || multiLoaded.length || noNgRoute) {
    var toSend = unusedModules.concat(undeclaredModules)
      .concat(multiLoaded);
    if(noNgRoute) {
      toSend = toSend.concat(noNgRoute);
    }
    display(toSend);
  }
};

},{"./display":62,"./formatMultiLoaded":63,"./getUndeclaredModules":67,"./getUnusedModules":68,"./moduleData":71,"./ngViewNoNgRoute":72}],75:[function(require,module,exports){
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

},{"./moduleData":71}],76:[function(require,module,exports){
var getNgAppMod = require('./getNgAppMod');
var inAttrsOrClasses = require('./inAttrsOrClasses');
var storeDependencies = require('./storeDependencies');
var modData = require('./moduleData');

module.exports = function(doms) {
  var bothFound,
      ngViewFound,
      elem,
      isElemName,
      isInAttrsOrClasses,
      ngAppMod;

  for(var i = 0; i < doms.length; i++) {
    elem = doms[i];
    isElemName = elem.nodeName.toLowerCase() === 'ng-view';
    isInAttrsOrClasses = inAttrsOrClasses(elem.attributes);

    ngViewFound = isElemName || isInAttrsOrClasses;
    ngAppMod = getNgAppMod(elem.attributes);

    if(ngAppMod) {
      storeDependencies(ngAppMod, true);
    }
    modData.ngViewExists = ngViewFound ? true : modData.ngViewExists;

    if(bothFound) {
      break;
    }
  }
};

},{"./getNgAppMod":65,"./inAttrsOrClasses":69,"./moduleData":71,"./storeDependencies":75}],77:[function(require,module,exports){
var storeDependencies = require('./storeDependencies');

var storeUsedModules = module.exports = function(module, modules){
  if(module) {
    storeDependencies(module);
    module.requires.forEach(function(modName) {
      var mod = modules[modName];
      storeUsedModules(mod, modules);
    });
  }
}
},{"./storeDependencies":75}]},{},[1]);
