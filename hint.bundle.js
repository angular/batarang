(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license AngularJS v1.2.21
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

    message = message + '\nhttp://errors.angularjs.org/1.2.21/' +
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
        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke');

        /** @type {angular.Module} */
        var moduleInstance = {
          // Private state
          _invokeQueue: invokeQueue,
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
        function invokeLater(provider, method, insertMethod) {
          return function() {
            invokeQueue[insertMethod || 'push']([provider, method, arguments]);
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


},{}],2:[function(require,module,exports){

require('./bower_components/angular-loader/angular-loader.js');
require('angular-hint');
var eventProxyElement = document.getElementById('__ngDebugElement');

var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);

angular.hint.onMessage = function (moduleName, message, messageType) {
  eventProxyElement.innerText = moduleName+'##'+message+'##'+messageType;
  eventProxyElement.dispatchEvent(customEvent);
};

},{"./bower_components/angular-loader/angular-loader.js":1,"angular-hint":3}],3:[function(require,module,exports){
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

  if ((elt = document.querySelector('[ng-hint-include]'))) {
    modules = hintModulesFromElement(elt);
  } else if (elt = document.querySelector('[ng-hint-exclude]')) {
    modules = excludeModules(hintModulesFromElement(elt));
  } else if (document.querySelector('[ng-hint]')) {
    modules = allModules;
  } else {
    angular.hint.logMessage('General', 'ngHint is included on the page, but is not active because'+
      ' there is no `ng-hint` attribute present', SEVERITY_WARNING);
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

function flush() {
  var log = angular.hint.flush(), groups = Object.keys(log);
  for(var i = 0, ii = groups.length; i < ii; i++) {
    console.groupCollapsed? console.groupCollapsed('Angular Hint: ' + groups[i]) :
      console.log('Angular Hint: ' + groups[i]);
      if(log[groups[i]]['Error Messages']) {
        logGroup(log[groups[i]]['Error Messages'], 'Error Messages');
      }
      if(log[groups[i]]['Warning Messages']) {
        logGroup(log[groups[i]]['Warning Messages'], 'Warning Messages');
      }
      if(log[groups[i]]['Suggestion Messages']) {
        logGroup(log[groups[i]]['Suggestion Messages'], 'Suggestion Messages');
      }
    console.groupEnd && console.groupEnd();
  }
}
setInterval(flush, 2);

function logGroup(group, type) {
  console.group? console.group(type + ':') : console.log(type + ':');
  for(var i = 0, ii = group.length; i < ii; i++) {
    console.log(group[i]);
  }
  console.group && console.groupEnd();
}

},{"angular-hint-controllers":4,"angular-hint-directives":5,"angular-hint-dom":40,"angular-hint-events":42,"angular-hint-interpolation":51,"angular-hint-log":60,"angular-hint-modules":61}],4:[function(require,module,exports){
'use strict';

var nameToControllerMatch = {},
  controllers = {},
  hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Controllers',
  SEVERITY_ERROR = 1,
  SEVERITY_WARNING = 2;

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
            if(nameToControllerMatch[ctrl]) {
              ctrl = nameToControllerMatch[ctrl];
            } else {
              //If the controller function cannot be found, check for it on the window
              checkUppercaseName(ctrl);
              checkControllerInName(ctrl);
              ctrl = window[ctrl] || ctrl;
              if(typeof ctrl === 'string') {
                throw new Error('The controller function for ' + ctrl + ' could not be found.' +
                  ' Is the function registered under that name?');
              }
            }
          }
          locals = locals || {};
          //If the controller is not in the list of already registered controllers
          //and it is not connected to the local scope, it must be instantiated on the window
          if(!controllers[ctrl] && (!locals.$scope || !locals.$scope[ctrl]) &&
              ctrl.toString().indexOf('@name ngModel.NgModelController#$render') === -1 &&
              ctrl.toString().indexOf('@name form.FormController') === -1) {
            if(angular.version.minor <= 2) {
              hintLog.logMessage(MODULE_NAME, 'It is against Angular best practices to ' +
                'instantiate a controller on the window. This behavior is deprecated in Angular' +
                ' 1.3.0', SEVERITY_WARNING);
            } else {
              hintLog.logMessage(MODULE_NAME, 'Global instantiation of controllers was deprecated' +
                ' in Angular 1.3.0. Define the controller on a module.', SEVERITY_ERROR);
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
* Hint about the best practices for naming controllers.
*/
var originalModule = angular.module;

function checkUppercaseName(controllerName) {
  var firstLetter = controllerName.charAt(0);
  if(firstLetter !== firstLetter.toUpperCase() && firstLetter === firstLetter.toLowerCase()) {
    hintLog.logMessage(MODULE_NAME, 'The best practice is to name controllers with an' +
      ' uppercase first letter. Check the name of \'' + controllerName + '\'.', SEVERITY_WARNING);
  }
}

function checkControllerInName(controllerName) {
  var splitName = controllerName.split('Controller');
  if(splitName.length === 1 || splitName[splitName.length - 1] !== '') {
    hintLog.logMessage(MODULE_NAME, 'The best practice is to name controllers ending with ' +
      '\'Controller\'. Check the name of \'' + controllerName + '\'.', SEVERITY_WARNING);
  }
}

angular.module = function() {
  var module = originalModule.apply(this, arguments),
    originalController = module.controller;
  module.controller = function(controllerName, controllerConstructor) {
    nameToControllerMatch[controllerName] = controllerConstructor;
    controllers[controllerConstructor] = controllerConstructor;
    checkUppercaseName(controllerName);
    checkControllerInName(controllerName);
    return originalController.apply(this, arguments);
  };
  return module;
};

},{"angular-hint-log":60}],5:[function(require,module,exports){
'use strict';

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

},{"./lib/checkPrelimErrors":18,"./lib/ddLib-data":19,"./lib/getKeysAndValues":26,"./lib/search":34,"dasherize":36}],6:[function(require,module,exports){
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

},{"./ddLib-data":19}],8:[function(require,module,exports){
var ddLibData = require('./ddLib-data'),
  SEVERITY_ERROR = 1;

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message + type + ' element' + id + '. ';
  var error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error;
  message += 'Found deprecated directive "' + error + '". Use an alternative solution.';
  return [message, SEVERITY_ERROR];
};

},{"./ddLib-data":19}],9:[function(require,module,exports){
var SEVERITY_ERROR = 1;

module.exports = function(info, id, type) {
  var s = info.missing.length === 1 ? ' ' : 's ';
  var waswere = info.missing.length === 1 ? 'is ' : 'are ';
  var missing = '';
  info.missing.forEach(function(str){
    missing += '"' + str + '",';
  });
  missing = '[' + missing.substring(0,missing.length-1) + '] ';
  var message = 'Attribute' + s + missing + waswere + 'missing in ' + type + ' element' + id + '.';
  return [message, SEVERITY_ERROR];
};

},{}],10:[function(require,module,exports){
var isMutExclusiveDir = require('./isMutExclusiveDir'),
  SEVERITY_ERROR = 1;

module.exports = function(info, id, type) {
  var pair = isMutExclusiveDir(info.error);
  var message = 'Angular attributes "'+info.error+'" and "'+pair+'" in '+type+ ' element'+id+
    ' should not be attributes together on the same HTML element';
  return [message, SEVERITY_ERROR];
};

},{"./isMutExclusiveDir":31}],11:[function(require,module,exports){
var hintLog = require('angular-hint-log'),
  MODULE_NAME = 'Directives',
  SEVERITY_SUGGESTION = 3;

module.exports = function(directiveName) {
  var message = 'Directive "'+directiveName+'" should have proper namespace try adding a prefix'+
    ' and/or using camelcase.';
  var domElement = '<'+directiveName+'> </'+directiveName+'>';
  hintLog.logMessage(MODULE_NAME, message, SEVERITY_SUGGESTION);
};

},{"angular-hint-log":60}],12:[function(require,module,exports){
var SEVERITY_SUGGESTION = 3;

module.exports = function(info, id, type) {
  var ngDir = 'ng-' + info.error.substring(2),
    message = 'Use Angular version of "' + info.error + '" in ' + type + ' element' + id +
      '. Try: "' + ngDir + '"';
  return [message, SEVERITY_SUGGESTION];
};

},{}],13:[function(require,module,exports){
var SEVERITY_ERROR = 1;
module.exports = function(info, id, type) {
  var message = 'ngRepeat in '+type+' element'+id+' was used incorrectly. '+info.suggestion;
  return [message, SEVERITY_ERROR];
};

},{}],14:[function(require,module,exports){
var ddLibData = require('./ddLib-data'),
  SEVERITY_ERROR = 1;

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message + type + ' element' + id + '. ';
  var error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error;
  message += 'Found incorrect attribute "' + error + '" try "' + info.match + '".';
  return [message, SEVERITY_ERROR];
};

},{"./ddLib-data":19}],15:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Directives',
  SEVERITY_ERROR = 1;

module.exports = function(directiveName) {
  var message = 'The use of "replace" in directive factories is deprecated,'+
    ' and it was found in "' + directiveName + '".';
  var domElement = '<' + directiveName + '> </' + directiveName + '>';
  hintLog.logMessage(MODULE_NAME, message, SEVERITY_ERROR);
};

},{"angular-hint-log":60}],16:[function(require,module,exports){
var ddLibData = require('./ddLib-data'),
  SEVERITY_ERROR = 1;

module.exports = function(info, id, type) {
  var message = ddLibData.directiveTypes[info.directiveType].message + type + ' element' +
    id + '. ',
    error = (info.error.charAt(0) === '*') ? info.error.substring(1): info.error,
    aecmType = (info.wrongUse.indexOf('attribute') > -1)? 'Element' : 'Attribute';
  message += aecmType + ' name "' + error + '" is reserved for ' + info.wrongUse + ' names only.';
  return [message, SEVERITY_ERROR];
};

},{"./ddLib-data":19}],17:[function(require,module,exports){

module.exports = function(attrVal){
      var suggestion,
          error = false;;
      var trackMatch = attrVal.match(/track\s+by\s+\S*/);
      var filterMatch = attrVal.match(/filter\s*:\s*\w+(?:\.\w+)*/);
      var breakIndex = attrVal.indexOf('|') > -1 ? attrVal.indexOf('|') : Infinity;
      if(!trackMatch && filterMatch && breakIndex === Infinity) {
        return 'Try: " | '+filterMatch[0]+'"';
      }
      if(trackMatch && filterMatch) {
        var trackInd = attrVal.indexOf(trackMatch[0]);
        var filterInd = attrVal.indexOf(filterMatch[0]);
        if(!(breakIndex < filterInd && filterInd < trackInd)) {
          return 'Try: " | '+filterMatch[0]+' '+trackMatch[0]+'"';
        }
      }
}
},{}],18:[function(require,module,exports){
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

},{"./buildNameSpace":11,"./buildReplaceOption":15,"./hasNameSpace":29,"./hasReplaceOption":30}],19:[function(require,module,exports){
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
        'ng-repeat-start': 'A',
        'ng-repeat-end': 'A',
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
    },
    'angular-deprecated-directives': {
      message: 'There was an AngularJS error in ',
      directives: {
        'ng-bind-html-unsafe': 'deprecated'
      }
    }
  }
};

},{}],20:[function(require,module,exports){
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

},{"./areSimilarEnough":6,"./levenshtein":32}],21:[function(require,module,exports){

var getFailedAttributesOfElement = require('./getFailedAttributesOfElement');

module.exports = function(scopeElements, options) {
  return scopeElements.map(getFailedAttributesOfElement.bind(null, options))
      .filter(function(x) {return x;});
};

},{"./getFailedAttributesOfElement":25}],22:[function(require,module,exports){
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

},{"./ddLib-data":19}],23:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Directives';

var build = {
  deprecated: require('./buildDeprecated'),
  missingrequired: require('./buildMissingRequired'),
  mutuallyexclusive: require('./buildMutuallyExclusive'),
  ngevent: require('./buildNgEvent'),
  ngrepeatformat: require('./buildNgRepeatFormat'),
  nonexsisting: require('./buildNonExsisting'),
  wronguse: require('./buildWrongUse')
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
      var id = (obj.domElement.id) ? ' with id: #' + obj.domElement.id : '',
        type = obj.domElement.nodeName,
        messageAndSeverity = build[info.typeError](info, id, type);
      hintLog.logMessage(MODULE_NAME, messageAndSeverity[0], messageAndSeverity[1]);
    });
  });
};

},{"./buildDeprecated":8,"./buildMissingRequired":9,"./buildMutuallyExclusive":10,"./buildNgEvent":12,"./buildNgRepeatFormat":13,"./buildNonExsisting":14,"./buildWrongUse":16,"angular-hint-log":60}],24:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');
var ddLibData = require('./ddLib-data');
var isMutExclusiveDir = require('./isMutExclusiveDir');
var hasMutExclusivePair = require('./hasMutExclusivePair');
var attributeExsistsInTypes = require('./attributeExsistsInTypes');
var getSuggestions = require('./getSuggestions');
var checkNgRepeatFormat = require('./checkNgRepeatFormat');

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
    var dirVal = ddLibData.directiveTypes['html-directives'].directives[attr] ||
      ddLibData.directiveTypes['angular-deprecated-directives'].directives[attr] || '';

    if(dirVal === 'deprecated') {
      failedAttrs.push({
        error: attr,
        directiveType: 'angular-deprecated-directives',
        typeError: 'deprecated'
      });
    }

    //if attr is a event attr. Html event directives are prefixed with ! in ddLibData
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
    var attrVal = attributes[i].value || '';
    if(attr === 'ng-repeat') {
      var result = checkNgRepeatFormat(attrVal);
      if(result) {
        failedAttrs.push({
          error: attr,
          suggestion: result,
          directiveType: 'angular-default-directives',
          typeError: 'ngrepeatformat'
        });
      }
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
},{"./attributeExsistsInTypes":7,"./checkNgRepeatFormat":17,"./ddLib-data":19,"./getSuggestions":27,"./hasMutExclusivePair":28,"./isMutExclusiveDir":31,"./normalizeAttribute":33}],25:[function(require,module,exports){
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

},{"./findMissingAttrs":22,"./getFailedAttributes":24}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./ddLib-data":19,"./findClosestMatchIn":20}],28:[function(require,module,exports){
var isMutExclusiveDir = require('./isMutExclusiveDir');

module.exports = function(attr, attributes) {
  var pair = isMutExclusiveDir(attr);

  return attributes.some(function(otherAttr) {
    return otherAttr.nodeName === pair;
  });
};

},{"./isMutExclusiveDir":31}],29:[function(require,module,exports){
var dasherize = require('dasherize');
var validate = require('validate-element-name');

module.exports = function(str) {
  var dashStr = dasherize(str);
  var validated = !validate(dashStr).message ? true : false;
  //Check for message definition because validate-element-name returns true for things starting
  //with ng-, polymer-, and data- but message is defined for those and errors.
  return validated && str.toLowerCase() !== str;
};

},{"dasherize":36,"validate-element-name":37}],30:[function(require,module,exports){
module.exports = function(facStr) {
  return facStr.match(/replace\s*:/);
};

},{}],31:[function(require,module,exports){
module.exports = function (dirName) {
  var exclusiveDirHash = {
    'ng-show' : 'ng-hide',
    'ng-hide' : 'ng-show',
    'ng-switch-when' : 'ng-switch-default',
    'ng-switch-default' : 'ng-switch-when',
  };
  return exclusiveDirHash[dirName];
};

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
/**
 *@param attribute: attribute name before normalization as string
 * e.g. 'data-ng-click', 'width', 'x:ng:src', etc.
 *
 *@return normalized attribute name
 **/
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,'').replace(/[:_]/g,'-');
};

},{}],34:[function(require,module,exports){

var formatResults = require('./formatResults');
var findFailedElements = require('./findFailedElements');
var setCustomDirectives = require('./setCustomDirectives');
var defaultTypes = [
  'html-directives',
  'angular-default-directives',
  'angular-custom-directives',
  'angular-deprecated-directives'
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

},{"./findFailedElements":21,"./formatResults":23,"./setCustomDirectives":35}],35:[function(require,module,exports){
var ddLibData = require('../lib/ddLib-data');

module.exports = function(customDirectives) {
  customDirectives.forEach(function(directive) {
    var directiveName = directive.directiveName.replace(/([A-Z])/g, '-$1').toLowerCase();
    ddLibData.directiveTypes['angular-custom-directives']
      .directives[directiveName] = directive;
  });
};

},{"../lib/ddLib-data":19}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
'use strict';
var ncname = require('ncname');

var reservedNames = [
	'annotation-xml',
	'color-profile',
	'font-face',
	'font-face-src',
	'font-face-uri',
	'font-face-format',
	'font-face-name',
	'missing-glyph'
];

function hasError(name) {
	if (!name) {
		return 'Missing element name.';
	}

	if (/[A-Z]/.test(name)) {
		return 'Custom element names must not contain uppercase ASCII characters.';
	}

	if (name.indexOf('-') === -1) {
		return 'Custom element names must contain a hyphen. Example: unicorn-cake';
	}

	if (/^\d/i.test(name)) {
		return 'Custom element names must not start with a digit.';
	}

	if (/^-/i.test(name)) {
		return 'Custom element names must not start with a hyphen.';
	}

	// http://www.w3.org/TR/custom-elements/#concepts
	if (!ncname.test(name)) {
		return 'Invalid element name.';
	}

	if (reservedNames.indexOf(name) !== -1) {
		return 'The supplied element name is reserved and can\'t be used.\nSee: http://www.w3.org/TR/custom-elements/#concepts';
	}
};

function hasWarning(name) {
	if (/^polymer-/i.test(name)) {
		return 'Custom element names should not start with `polymer-`.\nSee: http://webcomponents.github.io/articles/how-should-i-name-my-element';
	}

	if (/^x-/i.test(name)) {
		return 'Custom element names should not start with `x-`.\nSee: http://webcomponents.github.io/articles/how-should-i-name-my-element/';
	}

	if (/^ng-/i.test(name)) {
		return 'Custom element names should not start with `ng-`.\nSee: http://docs.angularjs.org/guide/directive#creating-directives';
	}

	if (/^xml/i.test(name)) {
		return 'Custom element names should not start with `xml`.';
	}

	if (/^[^a-z]/i.test(name)) {
		return 'This element name is only valid in XHTML, not in HTML. First character should be in the range a-z.';
	}

	if (/[^a-z0-9]$/i.test(name)) {
		return 'Custom element names should not end with a non-alpha character.';
	}

	if (/[\.]/.test(name)) {
		return 'Custom element names should not contain a dot character as it would need to be escaped in a CSS selector.';
	}

	if (/[^\x20-\x7E]/.test(name)) {
		return 'Custom element names should not contain non-ASCII characters.';
	}

	if (/--/.test(name)) {
		return 'Custom element names should not contain consecutive hyphens.';
	}

	if (/[^a-z0-9]{2}/i.test(name)) {
		return 'Custom element names should not contain consecutive non-alpha characters.';
	}
}

module.exports = function (name) {
	var errMsg = hasError(name);

	return {
		isValid: !errMsg,
		message: errMsg || hasWarning(name)
	};
};

},{"ncname":38}],38:[function(require,module,exports){
'use strict';
var xmlChars = require('xml-char-classes');

function getRange(re) {
	return re.source.slice(1, -1);
}

// http://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-NCName
module.exports = new RegExp('^[' + getRange(xmlChars.letter) + '_][' + getRange(xmlChars.letter) + getRange(xmlChars.digit) + '\\.\\-_' + getRange(xmlChars.combiningChar) + getRange(xmlChars.extender) + ']*$');

},{"xml-char-classes":39}],39:[function(require,module,exports){
exports.baseChar = /[A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\uAC00-\uD7A3]/;

exports.ideographic = /[\u3007\u3021-\u3029\u4E00-\u9FA5]/;

exports.letter = /[A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7\u04C8\u04CB\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B36-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60\u0D61\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD\u0EAE\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102\u1103\u1105-\u1107\u1109\u110B\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D\u116E\u1172\u1173\u1175\u119E\u11A8\u11AB\u11AE\u11AF\u11B7\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u212E\u2180-\u2182\u3007\u3021-\u3029\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\u4E00-\u9FA5\uAC00-\uD7A3]/;

exports.combiningChar = /[\u0300-\u0345\u0360\u0361\u0483-\u0486\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1\u05C2\u05C4\u064B-\u0652\u0670\u06D6-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0901-\u0903\u093C\u093E-\u094D\u0951-\u0954\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A02\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A70\u0A71\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0B01-\u0B03\u0B3C\u0B3E-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B82\u0B83\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C01-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C82\u0C83\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u20D0-\u20DC\u20E1\u302A-\u302F\u3099\u309A]/;

exports.digit = /[0-9\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE7-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29]/;

exports.extender = /[\xB7\u02D0\u02D1\u0387\u0640\u0E46\u0EC6\u3005\u3031-\u3035\u309D\u309E\u30FC-\u30FE]/;
},{}],40:[function(require,module,exports){
'use strict';

/**
* Create an interceptor that will log a message when use of a DOM API is detected
*/
var domInterceptor = require('dom-interceptor');
domInterceptor.enableLineNumbers(3);
var hintLog = angular.hint = require('angular-hint-log');
var INTERCEPTOR_FUNCTION = function(message) {
  var moduleName = 'DOM',
    severityWarning = 2;
  hintLog.logMessage(moduleName, message, severityWarning);
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
      var patchedDependencies = {};

      return function(ctrl, locals) {

        //If this controller is the NgModelController created by Angular
        //There is no need to detect its manipulation of the DOM
        if(ctrl.toString().indexOf('@name ngModel.NgModelController#$render') > -1 ||
            ctrl.toString().indexOf('@name form.FormController') > -1) {
          return $delegate.apply(this, [ctrl, locals]);
        }

        //If the controller method is given only the controller's name,
        //find the matching controller method from the controller list
        if(typeof ctrl === 'string') {
          ctrl = nameToConstructorMappings[ctrl] || window[ctrl] || ctrl;
          if(typeof ctrl === 'string') {
            throw new Error('The controller function for ' + ctrl + ' could not be found.' +
              ' Is the function registered under that name?');
          }
        }

        var dependencies = $injector.annotate(ctrl);

        // patch methods on $scope
        locals = locals || {};
        dependencies.forEach(function (dep) {
          if (typeof dep === 'string' && !locals[dep]) {
            locals[dep] = patchedServices[dep] ||
              (patchedServices[dep] = patchService($injector.get(dep)));
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
          } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce(function (obj, prop) {
              if(patchedDependencies[obj[prop]]) {
                return obj[prop], obj;
              }
              patchedDependencies[obj[prop]] = obj[prop];
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

},{"angular-hint-log":60,"dom-interceptor":41}],41:[function(require,module,exports){
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


},{}],42:[function(require,module,exports){
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
      var dirName = ngEventDirectives[directive] + 'Directive';

      $provide.decorator(dirName, ['$delegate', '$timeout', '$parse',
        function($delegate, $timeout, $parse) {
          $delegate[0].compile = function(element, attrs) {
            var eventAttrName = getEventAttribute(attrs.$attr),
              fn = $parse(attrs[eventAttrName]),
              messages = [];

            return function ngEventHandler(scope, element, attrs) {
              for(var attr in attrs.$attr) {
                var boundFuncs = getFunctionNames(attrs[attr]);

                //For the event functions that are bound, find if they exist on the scope
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
                  fn(scope, {$event: event});
                });
              });

              //Hint about any mistakes found
              formatResults(messages);
            };
          };
          return $delegate;
        }
      ]);
    }
  }]);
},{"./lib/formatResults":44,"./lib/getEventAttribute":45,"./lib/getEventDirectives":46,"./lib/getFunctionNames":47}],43:[function(require,module,exports){
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

},{"./getValidProps":48,"suggest-it":50}],44:[function(require,module,exports){
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

},{"./addSuggestions":43,"angular-hint-log":60}],45:[function(require,module,exports){
'use strict';

var ngEventDirectives = require('./getEventDirectives')();

module.exports = function getEventAttribute(attrs) {
  for(var attr in attrs) {
    if(ngEventDirectives[attr]) {
      return attr;
    }
  }
};

},{"./getEventDirectives":46}],46:[function(require,module,exports){
'use strict';

module.exports = function getEventDirectives() {
  var list = 'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' ');
  var eventDirHash = {};
  list.map(function(x) {
    var name = 'ng'+x.charAt(0).toUpperCase()+x.substring(1);
    eventDirHash[name] = name;
  });
  return eventDirHash;
};

},{}],47:[function(require,module,exports){
'use strict';

module.exports = function getFunctionNames(str) {
  var results = str.replace(/\s+/g,'').split(/[\+\-\/\|\<\>\^=&!%~]/g).map(function(x) {
    if(isNaN(+x)) {
      if(x.match(/\w+\(.*\)$/)){
        return x.substring(0,x.indexOf('('));
      }
      return x;
    }
  }).filter(function(x){return x;});
  return results;
};

},{}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
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


},{}],50:[function(require,module,exports){
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

},{"./levenstein_distance":49}],51:[function(require,module,exports){
'use strict';

var getAllParts = require('./lib/getAllParts');
var buildMessage = require('./lib/buildMessage');

angular.module('ngHintInterpolation', [])
  .config(['$provide', function($provide) {
    $provide.decorator('$interpolate', ['$delegate', function($delegate) {
      var interpolateWrapper = function() {
        var interpolationFn = $delegate.apply(this, arguments);
        if(interpolationFn) {
          var parts = getAllParts(arguments[0], $delegate.startSymbol(), $delegate.endSymbol());
          var temp = interpolationFnWrap(interpolationFn, arguments, parts);
          return temp;
        }
      };
      var interpolationFnWrap = function(interpolationFn, interpolationArgs, allParts) {
        return function(){
          var result = interpolationFn.apply(this, arguments);
          buildMessage(allParts, interpolationArgs[0].trim(), arguments[0]);
          return result;
        };
      };
      angular.extend(interpolateWrapper,$delegate);
      return interpolateWrapper;
    }]);
  }]);

},{"./lib/buildMessage":52,"./lib/getAllParts":54}],52:[function(require,module,exports){
var partsEvaluate = require('./partsEvaluate'),
  hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Interpolation',
  SEVERITY_ERROR = 1;

module.exports = function(allParts, originalInterpolation, scope) {
  var res = partsEvaluate(allParts, originalInterpolation, scope);
  if(res[1]) {
    var suggestion = (res[0]) ? ' Try: "' + res[0] + '"' : '',
      part = res[1];
      message = '"' + part + '" was found to be undefined in "' + originalInterpolation + '".' +
        suggestion;
    hintLog.logMessage(MODULE_NAME, message, SEVERITY_ERROR);
  }
};

},{"./partsEvaluate":57,"angular-hint-log":60}],53:[function(require,module,exports){
module.exports = function(parts, concatLength) {
  var total = '';
  for(var i = 0; i <= concatLength; i++) {
    var period = (i === 0) ? '' : '.';
    total += period + parts[i].trim();
  }
  return total;
};

},{}],54:[function(require,module,exports){
var getInterpolation = require('./getInterpolation');
var getOperands = require('./getOperands');
var concatParts = require('./concatParts');

module.exports = function(text, startSym, endSym) {
  if(text.indexOf(startSym) < 0 || text.indexOf(endSym) < 0) {
    throw new Error('Missing start or end symbol in interpolation. Start symbol: "' + startSym +
      '" End symbol: "' + endSym + '"');
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

},{"./concatParts":53,"./getInterpolation":55,"./getOperands":56}],55:[function(require,module,exports){
module.exports = function(text, startSym, endSym) {
  var startInd = text.indexOf(startSym) + startSym.length,
    endInd = text.indexOf(endSym);
  return text.substring(startInd, endInd);
};

},{}],56:[function(require,module,exports){
module.exports = function(str) {
  return str.split(/[\+\-\/\|<\>\^=&!%~]/g);
};

},{}],57:[function(require,module,exports){
var suggest = require('suggest-it');

module.exports = function(allParts, originalInterpolation, scope) {
  var suggestion, partToSend, found = false;

  allParts.forEach(function(part) {
    if(!scope.$eval(part) && !found){
      found = true;
      var perInd = part.lastIndexOf('.'),
        tempScope = (perInd > -1) ? scope.$eval(part.substring(0, perInd)) : scope,
        tempPart = part.substring(part.lastIndexOf('.') + 1),
        dictionary = Object.keys(tempScope);
      suggestion = suggest(dictionary)(tempPart);
      partToSend = part;
    }
  });

  return [suggestion, partToSend];
};

},{"suggest-it":59}],58:[function(require,module,exports){
module.exports=require(49)
},{}],59:[function(require,module,exports){
module.exports=require(50)
},{"./levenstein_distance":58}],60:[function(require,module,exports){
/**
* HintLog creates a queue of messages logged by ngHint modules. This object
* has a key for each ngHint module that corresponds to the messages
* from that module.
*/
var queuedMessages = {},
  MESSAGE_TYPES = ['Error Messages', 'Warning Messages', 'Suggestion Messages'];

/**
* Add a message to the HintLog message queue. Messages are organized into categories
* according to their module name and severity.
**/
function logMessage(moduleName, message, severity) {
  //If no severity was provided, categorize the message under `Suggestion Messages`
  severity = severity || 3;
  var messageType = MESSAGE_TYPES[severity-1];
  //If no ModuleName was found, categorize the message under `General`
  moduleName = moduleName || 'General';

  //If the category does not exist, initialize a new object
  queuedMessages[moduleName] = queuedMessages[moduleName] || {};
  queuedMessages[moduleName][messageType] = queuedMessages[moduleName][messageType] || [];

  if(queuedMessages[moduleName][messageType].indexOf(message) < 0) {
    queuedMessages[moduleName][messageType].push(message);
  }

  module.exports.onMessage(moduleName, message, messageType);
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

},{}],61:[function(require,module,exports){
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

angular.module = function() {
  var requiresOriginal = arguments[1],
    module = originalAngularModule.apply(this, arguments),
    name = module.name;
  module.requiresOriginal = requiresOriginal;
  modules[name] = module;
  hasNameSpace(module.name);
  var modToCheck = getModule(module.name, true);

  if(modToCheck && modToCheck.requiresOriginal !== module.requiresOriginal) {
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

},{"./lib/getModule":64,"./lib/hasNameSpace":68,"./lib/moduleData":70,"./lib/start":73,"./lib/storeDependencies":74,"./lib/storeNgAppAndView":75,"./lib/storeUsedModules":76}],62:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Modules';

module.exports = function(modules) {
  modules.forEach(function(module) {
    hintLog.logMessage(MODULE_NAME, module.message, module.severity);
  });
};

},{"angular-hint-log":60}],63:[function(require,module,exports){
var modData = require('./moduleData');
  MODULE_NAME = 'Modules',
  SEVERITY_WARNING = 2;

module.exports = function() {
  var multiLoaded = [];
  for(var modName in modData.createdMulti) {
    var message = 'Multiple modules with name "' + modName + '" are being created and they will ' +
      'overwrite each other.';
    var multi = modData.createdMulti[modName];
    var details = {
      existingModule: multi[multi.length - 1],
      overwrittenModules: multi.slice(0,multi.length-1)
    };
    multiLoaded.push({module:details, message:message, name: MODULE_NAME,
      severity: SEVERITY_WARNING});
  }
  return multiLoaded;
};

},{"./moduleData":70}],64:[function(require,module,exports){
var modData = require('./moduleData');

module.exports = function(moduleName, getCreated) {
  return (getCreated)? modData.createdModules[moduleName] : modData.loadedModules[moduleName];
};

},{"./moduleData":70}],65:[function(require,module,exports){
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

},{"angular-hint-log":60}],66:[function(require,module,exports){
var getModule = require('./getModule'),
  dictionary = Object.keys(require('./moduleData').createdModules),
  suggest = require('suggest-it')(dictionary),
  SEVERITY_ERROR = 1;

module.exports = function(loadedModules) {
  var undeclaredModules = [];
  for( var module in loadedModules) {
    var cModule = getModule(module, true);
    if(!cModule) {
      var match = suggest(module),
        suggestion = (match) ? '; Try: "'+match+'"' : '',
        message = 'Module "'+module+'" was loaded but does not exist'+suggestion+'.';
      undeclaredModules.push({module:null, message:message, severity:SEVERITY_ERROR});
    }
  }
  return undeclaredModules;
};

},{"./getModule":64,"./moduleData":70,"suggest-it":78}],67:[function(require,module,exports){
var getModule = require('./getModule'),
  IGNORED = ['ngHintControllers', 'ngHintDirectives', 'ngHintDOM', 'ngHintEvents',
    'ngHintInterpolation', 'ngHintModules'];
  SEVERITY_WARNING = 2;

module.exports = function(createdModules) {
  var unusedModules = [];
  for(var module in createdModules) {
    if(!getModule(module)) {
      var cModule = createdModules[module],
        message = 'Module "' + cModule.name + '" was created but never loaded.';
      if(IGNORED.indexOf(cModule.name) === -1) {
        unusedModules.push({module:cModule, message:message, severity:SEVERITY_WARNING});
      }
    }
  }
  return unusedModules;
};

},{"./getModule":64}],68:[function(require,module,exports){
var hintLog = angular.hint = require('angular-hint-log'),
  MODULE_NAME = 'Modules',
  SEVERITY_SUGGESTION = 3;
module.exports = function(str) {
  if(str.toLowerCase() === str || str.charAt(0).toUpperCase() === str.charAt(0)) {
    hintLog.logMessage(MODULE_NAME, 'The best practice for' +
      ' module names is to use lowerCamelCase. Check the name of "' + str + '".',
      SEVERITY_SUGGESTION);
    return false;
  }
  return true;
};

},{"angular-hint-log":60}],69:[function(require,module,exports){
var normalizeAttribute = require('./normalizeAttribute');

module.exports = function(attrs) {
  for(var i = 0; i < attrs.length; i++) {
    if(normalizeAttribute(attrs[i].nodeName) === 'ng-view' ||
        attrs[i].value.indexOf('ng-view') > -1) {
          return true;
    }
  }
};

},{"./normalizeAttribute":72}],70:[function(require,module,exports){
module.exports = {
  createdModules: {},
  createdMulti: {},
  loadedModules: {}
};

},{}],71:[function(require,module,exports){
var modData = require('./moduleData'),
  getModule = require('./getModule');

module.exports = function() {
  if(modData.ngViewExists && !getModule('ngRoute')) {
    return {message: 'Directive "ngView" was used in the application however "ngRoute" was not loaded into any module.'};
  }
};

},{"./getModule":64,"./moduleData":70}],72:[function(require,module,exports){
module.exports = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,'').replace(/[:_]/g,'-');
};

},{}],73:[function(require,module,exports){
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

},{"./display":62,"./formatMultiLoaded":63,"./getUndeclaredModules":66,"./getUnusedModules":67,"./moduleData":70,"./ngViewNoNgRoute":71}],74:[function(require,module,exports){
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

},{"./moduleData":70}],75:[function(require,module,exports){
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
    isElemName = elem.nodeName.toLowerCase() === 'ng-view';
    isInAttrsOrClasses = inAttrsOrClasses(elem.attributes);

    ngViewFound = isElemName || isInAttrsOrClasses;

    ngAppMod = getNgAppMod(elem.attributes, modData.ngAppFound);
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

},{"./getNgAppMod":65,"./inAttrsOrClasses":69,"./moduleData":70,"./storeDependencies":74}],76:[function(require,module,exports){
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
},{"./storeDependencies":74}],77:[function(require,module,exports){
module.exports=require(49)
},{}],78:[function(require,module,exports){
module.exports=require(50)
},{"./levenstein_distance":77}]},{},[2]);
