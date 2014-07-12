(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var hint = require('angular-hint');

},{"angular-hint":2}],2:[function(require,module,exports){

// decorate angular.bootstrap to check for ng-hint=
//
// everything on by default

require('angular-hint-dom');
require('angular-hint-directives');

var allModules = ['ngHintDirectives', 'ngHintDom'];

window.name = 'NG_DEFER_BOOTSTRAP!';

// determine which modules to load and resume bootstrap
angular.element(document).ready(function() {
  var selectedModules;
  var elts;
  var includeModules = function(modulesToInclude) {
    var selected = modulesToInclude.map(function(name) {
      return 'ngHint' + name[0].toUpperCase() + name.substring(1);
    });
    return selected;
  };

  var excludeModules = function(modulesToExclude) {
    var selected = allModules.filter(function(name) {
      var notFound = true;
      modulesToExclude.forEach(function(element) {
        if(('ngHint' + element[0].toUpperCase() + element.substring(1)) == name) {
          notFound = false;
        }
      });
      if(notFound) {
        return name;
      }
    });
    return selected;
  };

  elts = document.querySelectorAll('[ng-hint-include]');
  if(elts.length > 0) {
    selectedModules = includeModules(elts[0].attributes['ng-hint-include'].value.split(' '));
  }
  else {
    elts = document.querySelectorAll('[ng-hint-exclude]');
    if(elts.length > 0) {
      selectedModules = excludeModules(elts[0].attributes['ng-hint-exclude'].value.split(' '));
    }
    else {
      elts = document.querySelectorAll('[ng-hint]');
      if(elts.length > 0) {
        selectedModules = allModules;
      }
    }
  }
  if(selectedModules != undefined) {
    angular.resumeBootstrap(selectedModules);
  }
  else {
    angular.resumeBootstrap();
  }
});

},{"angular-hint-directives":4,"angular-hint-dom":5}],3:[function(require,module,exports){
(function (ddLib) {

'use strict';

ddLib.directiveDetails = {
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
      'object': 'A',
      'onblur': 'A',
      'onchange': 'A',
      'onclick': 'A',
      'onfocus': 'A',
      'onkeydown': 'A',
      'onkeypress': 'A',
      'onkeyup': 'A',
      'onload': 'A',
      'onmousedown': 'A',
      'onmousemove': 'A',
      'onmouseout': 'A',
      'onmouseover': 'A',
      'onmouseup': 'A',
      'onreset': 'A',
      'onselect': 'A',
      'onsubmit': 'A',
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
        'ng-keydown': 'A',
        'ng-keypress': 'A',
        'ng-keyup': 'A',
        'ng-list': 'A',
        'ng-maxlength': 'A',
        'ng-minlength': 'A',
        'ng-model': 'A',
        'ng-modeloptions': 'A',
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
}

/**
 *
 *@param scopeElements: [] of HTML elements to be checked for incorrect attributes
 *@param customDirectives: [] of custom directive objects from $compile decorator
 *@param options: {} of options for app to run with:
 *    options.tolerance: Integer, maximum Levenshtein Distance to be allowed for misspellings
 *    options.directiveTypes: [] of which type of directives/attributes to search through
 **/
ddLib.beginSearch = function(scopeElements, customDirectives, options) {
  if(!Array.isArray(scopeElements)) {
    throw new Error("Function beginSearch must be passed an array.");
  }
  options = options || {};
  options.directiveTypes = options.directiveTypes ||
    ['html-directives','angular-default-directives','angular-custom-directives'];;
  options.tolerance = options.tolerance || 4;
  if(customDirectives) {
    ddLib.setCustomDirectives(customDirectives);
  }
  var failedElements = ddLib.findFailedElements(scopeElements, options);
  var messages = ddLib.formatResults(failedElements);
  return messages;
};

ddLib.findFailedElements = function(scopeElements, options) {
  return scopeElements.map(ddLib.getFailedAttributesOfElement.bind(null,options))
    .filter(function(x) {return x;});
}

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
ddLib.getFailedAttributesOfElement = function(options, element) {
  if(element.attributes.length) {
    var elementAttributes = Array.prototype.slice.call(element.attributes);
    elementAttributes.push({nodeName: "*"+element.nodeName.toLowerCase()});
    var failedAttributes = ddLib.getFailedAttributes(elementAttributes, options);
    if(failedAttributes.length) {
      return {
        domElement: element,
        data: failedAttributes
      };
    }
  }
};


/**
 *@param attributes: [] of attributes from element (includes tag name of element, e.g. DIV, P, etc.)
 *@param options: {} options object from beginSearch
 *
 *@return [] of failedAttributes with their respective suggestions and directiveTypes
 **/
ddLib.getFailedAttributes = function(attributes, options) {
  var failedAttributes = [];
  for(var i = 0; i < attributes.length; i++) {
    var attr = ddLib.normalizeAttribute(attributes[i].nodeName);
    var result = ddLib.attributeExsistsInTypes(attr,options);
    if(!result.exsists) {
      var suggestion = ddLib.getSuggestions(attr,options);
      if(suggestion){
        failedAttributes.
          push({match: suggestion.match, error: attr, directiveType:suggestion.directiveType});
      }
    }
    else if(result.wrongUse) {
      failedAttributes.
        push({wrongUse:result.wrongUse, error: attr, directiveType: 'angular-custom-directives'});
    }
  }
  return failedAttributes;
};

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@description attribute exsistance in the types of directives/attibutes (html, angular core, and
 * angular custom) and checks the restrict property of values matches its use.
 *
 *@return {} with attribute exsistance and wrong use e.g. restrict property set to elements only.
 **/
ddLib.attributeExsistsInTypes = function(attribute, options) {
  var allTrue = false, wrongUse = '';
  options.directiveTypes.forEach(function(directiveType) {
    var isTag = attribute.charAt(0) == '*';
    var isCustomDir = directiveType == 'angular-custom-directives';
    if(!isTag) {
      var directive = ddLib.directiveDetails.directiveTypes[directiveType].directives[attribute];
      if(directive) {
        if(directive.indexOf('E') > -1 && directive.indexOf('A') < 0) {
          wrongUse = 'element';
        }
        if(directive.indexOf('C') > -1 && directive.indexOf('A') < 0) {
          wrongUse = (wrongUse) ? 'element and class' : 'class';
        }
        allTrue = allTrue || true;
      }
    }
    else if(isTag && isCustomDir){
      var directive = ddLib.directiveDetails.directiveTypes[directiveType].directives[attribute.substring(1)];
      if(directive){
        allTrue = allTrue || true;
        if(directive && directive.indexOf('A') > -1 && directive.indexOf('E') < 0) {
          wrongUse = 'attribute';
        }
      }
    }
  });
  return {exsists: allTrue, wrongUse: wrongUse};
};

/**
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *@param options: {} options object from beginSearch.
 *
 *@return {} with closest match to attribute and the directive type it corresponds to.
 **/
ddLib.getSuggestions = function(attribute, options) {
  var min_levDist = Infinity, match = '', dirType = '';
  options.directiveTypes.forEach(function(directiveType) {
    var isTag = attribute.charAt(0) == '*';
    var isCustomDir = directiveType == 'angular-custom-directives';
    if(!isTag || (isTag && isCustomDir)) {
      var directiveTypeData = ddLib.directiveDetails.directiveTypes[directiveType].directives
      var tempMatch = ddLib.findClosestMatchIn(directiveTypeData, attribute);
      if(tempMatch.min_levDist < options.tolerance && tempMatch.min_levDist < min_levDist) {
        match = tempMatch.match;
        dirType = directiveType;
        min_levDist = tempMatch.min_levDist;
      }
    }
  });
  return (match)? {match:match, directiveType:dirType}: null;
};

/**
 *@param directiveTypeData: {} with list of directives/attributes and
 *their respective restrict properties.
 *@param attribute: attribute name as string e.g. 'ng-click', 'width', 'src', etc.
 *
 *@return {} with Levenshtein Distance and name of the closest match to given attribute.
 **/
ddLib.findClosestMatchIn = function(directiveTypeData, attribute) {
  if(typeof attribute != 'string') {
    throw new Error('Function must be passed a string as second parameter.');
  }
  if((directiveTypeData === null || directiveTypeData === undefined) ||
    typeof directiveTypeData != 'object') {
    throw new Error('Function must be passed a defined object as first parameter.');
  }
  var min_levDist = Infinity, closestMatch = '';
  for(var directive in directiveTypeData){
    if(ddLib.areSimilarEnough(attribute,directive)) {
      var currentlevDist = ddLib.levenshteinDistance(attribute, directive);
      var closestMatch = (currentlevDist < min_levDist)? directive : closestMatch;
      var min_levDist = (currentlevDist < min_levDist)? currentlevDist : min_levDist;
    }
  }
  return {min_levDist: min_levDist, match: closestMatch};
};

/**
 *@param attribute: attribute name before normalization as string
 * e.g. 'data-ng-click', 'width', 'x:ng:src', etc.
 *
 *@return normalized attribute name
 **/
ddLib.normalizeAttribute = function(attribute) {
  return attribute.replace(/^(?:data|x)[-_:]/,"").replace(/[:_]/g,'-');
};

/**
 *@param failedElements: [] of {}s of all failed elements with their failed attributes and closest
 *matches or restrict properties
 *
 *@return [] of failed messages.
 **/
ddLib.formatResults = function(failedElements) {
  var messages = [];
  failedElements.forEach(function(obj) {
    obj.data.forEach(function(attr) {
      var id = (obj.domElement.id) ? ' with id: #'+obj.domElement.id : '';
      var type = obj.domElement.nodeName;
      var message = ddLib.directiveDetails.directiveTypes[attr.directiveType].message+type+' element'+id+'. ';
      var error = (attr.error.charAt(0) == '*') ? attr.error.substring(1): attr.error;
      if(!attr.wrongUse) {
        message +='Found incorrect attribute "'+error+'" try "'+attr.match+'".';
      }
      else {
        var aecmType = (attr.wrongUse.indexOf('attribute') > -1)? 'Element' : 'Attribute';
        message += aecmType+' name "'+error+'" is reserved for '+attr.wrongUse+' names only.';
      }
      messages.push({message:message, domElement: obj.domElement})
    })
  })
  return messages;
};

/**
 *@param customDirectives: [] of custom directive objects from $compile decorator
 **/
ddLib.setCustomDirectives = function(customDirectives) {
  customDirectives.forEach(function(directive) {
    var directiveName = directive.directiveName.replace(/([A-Z])/g, '-$1').toLowerCase();
    ddLib.directiveDetails.directiveTypes['angular-custom-directives']
      .directives[directiveName] = directive.restrict;
  })
}

/**
 *@param s: first string to compare
 *@param t: second string to compare
 *
 *@description:
 *Checks to see if two strings are similiar enough to even bother checking the Levenshtein Distance.
 */
ddLib.areSimilarEnough = function(s,t) {
  var strMap = {}, similarities = 0, STRICTNESS = .66;
  if(Math.abs(s.length-t.length) > 3) {
    return false;
  }
  s.split('').forEach(function(x){strMap[x] = x});
  for (var i = t.length - 1; i >= 0; i--) {
    similarities = strMap[t.charAt(i)] ? similarities + 1 : similarities;
  };
  return similarities >= t.length * STRICTNESS;
}

/**
 *@param s: first string to compare for Levenshtein Distance.
 *@param t: second string to compare for Levenshtein Distance.
 *
 *@description
 *Calculates the minimum number of changes (insertion, deletion, transposition) to get from s to t.
 **/
ddLib.levenshteinDistance = function(s, t) {
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

/**
 * @param str: string to convert formatting from camelCase to lowercase with dash after ng.
 **/
ddLib.camelToDashes = function(str) {
 return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
}

}((typeof module !== 'undefined' && module && module.exports) ?
      (module.exports = window.ddLib = {}) : (window.ddLib = {}) ));




},{}],4:[function(require,module,exports){
'use strict';

var ddLib = require('./dd-lib/dd-lib');
var customDirectives = [];


angular.module('ngHintDirectives', ['ngLocale'])
  .config(['$provide', function($provide) {
    $provide.decorator('$compile', ['$delegate','$timeout', function($delegate, $timeout) {
      return function(elem) {
        var messages=[];
        for(var i = 0; i < elem.length; i+=2){
          if(elem[i].getElementsByTagName){
            var toSend = Array.prototype.slice.call(elem[i].getElementsByTagName('*'));
            var result = ddLib.beginSearch(toSend,customDirectives);
            messages = messages.concat(result);
          }
        }
        if(messages.length) {
          console.groupCollapsed('Angular Hint: Directives');
          messages.forEach(function(error) {
            console.warn(error.message);
            console.log(error.domElement);
          })
          console.groupEnd();
        }
        return $delegate.apply(this,arguments);
      };
    }]);
  }]);
angular.module('ngLocale').config(function($provide) {
  var originalProvider = $provide.provider;
  $provide.provider = function(token, provider) {
    var provider = originalProvider.apply($provide, arguments);
    if (token === '$compile') {
      var originalProviderDirective = provider.directive;
      provider.directive = function(dirsObj) {
        for(var prop in dirsObj){
          var propDashed = ddLib.camelToDashes(prop);
          if(isNaN(+propDashed) &&
            !ddLib.directiveDetails.directiveTypes['angular-default-directives'].directives[propDashed] &&
            !ddLib.directiveDetails.directiveTypes['html-directives'].directives[propDashed]) {
            var matchRestrict = dirsObj[prop].toString().match(/restrict:\s*'(.+?)'/) || 'ACME';
            ddLib.directiveDetails.directiveTypes['angular-default-directives']
              .directives[propDashed] = matchRestrict[1];
          }
        };
        return originalProviderDirective.apply(this, arguments);
      };
    }
    return provider;
  }
})
var originalAngularModule = angular.module;
angular.module = function() {
  var module = originalAngularModule.apply(this, arguments);
  var originalDirective = module.directive;
  module.directive = function(directiveName, directiveFactory) {
    var originalDirectiveFactory = typeof directiveFactory === 'function' ? directiveFactory :
        directiveFactory[directiveFactory.length - 1];
    var directive = {directiveName: directiveName, restrict: 'AE'}
    customDirectives.push(directive);
    var matchRestrict = originalDirectiveFactory.toString().match(/restrict:\s*'(.+?)'/);
    var matchScope = originalDirectiveFactory.toString().match(/scope:\s*?{\s*?(\w+):\s*?'(.+?)'/);
    if(matchScope) {
      var name = (matchScope[2]=='=')? matchScope[1] : matchScope[2].substring(1);
      customDirectives.push({directiveName: name , restrict:'A'})
    }
    if (matchRestrict) {
      directive.restrict = matchRestrict[1];
    }
    arguments[1][0] = function () {
      var ddo = originalDirectiveFactory.apply(this, arguments);
      directive.restrict = ddo.restrict || 'A';
      return ddo;
    };
    return originalDirective.apply(this, arguments);
  };
  return module;
}


},{"./dd-lib/dd-lib":3}],5:[function(require,module,exports){

'use strict';

var domInterceptor = require('dom-interceptor');

var nameToConstructorMappings = {};

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

        if(typeof ctrl == 'string') {
          ctrl = nameToConstructorMappings[ctrl];
        }

        var dependencies = $injector.annotate(ctrl);

        // patch methods on $scope
        if (!locals) {
          locals = {};
        }
        dependencies.forEach(function (dep) {
          if (typeof dep === 'string' && !locals[dep]) {
            locals[dep] = patchedServices[dep] ||
                (patchedServices[dep] = patchService($injector.get('$timeout')));
          }
        });

        function disallowedContext(fn) {
          return function () {
            domInterceptor.addManipulationListener();
            var ret = fn.apply(this, arguments);
            domInterceptor.removeManipulationListener();
            return ret;
          }
        }

        function patchArguments (fn) {
          return function () {
            for (var i = 0; i < arguments.length; i++) {
              if (typeof arguments[i] === 'function') {
                arguments[i] = disallowedContext(arguments[i]);
              }
            }
            return fn.apply(this, arguments);
          }
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

        // body of controller
        domInterceptor.addManipulationListener(false, false, false, true);
        var ctrlInstance = $delegate.apply(this, [ctrl, locals]);
        domInterceptor.removeManipulationListener();

        // controller.test
        Object.keys(ctrlInstance).forEach(function (prop) {
          if (prop[0] !== '$' && typeof ctrlInstance[prop] === 'function') {
            ctrlInstance[prop] = disallowedContext(ctrlInstance[prop]);
          }
        });

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

},{"dom-interceptor":6}],6:[function(require,module,exports){
(function (domInterceptor) {

'use strict';

/**
* Controls the patching process by patching all necessary
* prototypes as well as triggering the patching of individual
* HTML elements.
**/
domInterceptor.addManipulationListener = function(loudError, debugStatement, propOnly, includeLine) {
  domInterceptor.listener = domInterceptor._listener;
  domInterceptor.setListenerDefaults(loudError, debugStatement, propOnly, includeLine);
  domInterceptor.collectUnalteredPrototypeProperties(Element, 'Element');
  domInterceptor.patchOnePrototype(Element);
  domInterceptor.collectUnalteredPrototypeProperties(Node, 'Node');
  domInterceptor.patchOnePrototype(Node);
  domInterceptor.collectUnalteredPrototypeProperties(EventTarget, 'EventTarget');
  domInterceptor.patchOnePrototype(EventTarget);
  domInterceptor.collectUnalteredPrototypeProperties(Document, 'Document');
  domInterceptor.patchOnePrototype(Document);
  domInterceptor.listener = domInterceptor.savedListener;
};

/**
* Set the listener function to a custom value
* if the provided listener is not undefined and
* is a function. If the parameter does not meet these
* standards, leave domInterceptor.callListenerWithMessage as the default error
* throwing function.
*/
domInterceptor.setListenerDefaults = function(loudError, debugBreak, propOnly, includeLine) {
  loudError ? domInterceptor.loudError = true : domInterceptor.loudError = false;
  debugBreak ? domInterceptor.debugBreak = true : domInterceptor.debugBreak = false;
  propOnly ? domInterceptor.propOnly = true : domInterceptor.propOnly = false;
  includeLine ? domInterceptor.includeLine = true : domInterceptor.includeLine = false;
};

domInterceptor._listener = domInterceptor.NOOP = function() {};

domInterceptor.listener = domInterceptor.savedListener;

domInterceptor.savedListener = function(messageProperties) {
  domInterceptor.callListenerWithMessage(messageProperties);
};

/**
* Error function thrown on detection of DOM manipulation.
* May be overriden to throw custom error function if desired.
*/
domInterceptor.callListenerWithMessage = function(messageProperties) {
  var message;
  var lineNumber;
  if (!domInterceptor.propOnly) {
    message = messageProperties['property'];
    if (domInterceptor.includeLine) {
      var e = new Error();
      //Find the line in the user's program rather than in this service
      var lineNum = e.stack.split('\n')[4];
      lineNum = lineNum.split('<anonymous> ')[1];
      lineNumber = lineNum;
    }
  }

  if(domInterceptor.loudError) {
    throw new Error(message + ' ' + lineNumber);
  }
  else if(domInterceptor.debugBreak) {
    debugger;
  }
  else {
    domInterceptor.createMessageTable(message, lineNumber);
  }
};

/**
* Default formatting of message to be given on DOM API manipulation from
* a controller.
*/
domInterceptor.message = 'Angular best practices are to manipulate the DOM in the view.' +
' See: (https://github.com/angular/angular-hint-dom/blob/master/README.md) ' +
'Expand to view manipulated properties and line numbers.';

domInterceptor.givenMessages = {};
domInterceptor.currentMessages = [];
domInterceptor.lines = [];
domInterceptor.createMessageTable = function(warning, lineNumber) {
  if(!domInterceptor.givenMessages[lineNumber]) {
    domInterceptor.givenMessages[lineNumber] = lineNumber;
    domInterceptor.currentMessages.push(warning);
    domInterceptor.lines.push(lineNumber);
  }
};

/**
* Buffer console messages and release them at reasonable time intervals.
* Use the console.group message to organize information where available.
* Default to other console methods if the browser does not support console.group.
*/
setTimeout(function() {
  if(console.group) {
    if(domInterceptor.currentMessages.length > 1) {
      console.group(domInterceptor.message);
      for(var i = 0; i < domInterceptor.currentMessages.length; i++) {
        console.log(domInterceptor.currentMessages[i] + ' ' + domInterceptor.lines[i]);
      }
      console.groupEnd();
    }
    else if(domInterceptor.currentMessages.length > 0) {
      console.log(domInterceptor.message);
      console.log(domInterceptor.currentMessages[0]);
    }
  }
  else if(console.warn) {
    console.warn(domInterceptor.message);
    for(var i = 0; i < domInterceptor.currentMessages.length; i++) {
      console.warn(domInterceptor.currentMessages[i] + ' ' + domInterceptor.lines[i]);
    }
  }
  else {
    console.log(domInterceptor.message);
    for(var i = 0; i < domInterceptor.currentMessages.length; i++) {
      console.log(domInterceptor.currentMessages[i] + ' ' + domInterceptor.lines[i]);
    }
  }
  domInterceptor.currentMessages = [];
  domInterceptor.lines = [];
}, 3000);

/**
* Object to preserve all the original properties
* that will be restored after patching.
**/
domInterceptor.originalProperties = {};

/**
* Helper method to collect all properties of a given prototype.
* When patching is removed, all prototype properties
* are set back to these original values
**/
domInterceptor.collectUnalteredPrototypeProperties = function(type, typeName) {
  domInterceptor.listener = domInterceptor._listener;
  if(!type || !type.prototype) {
    throw new Error('collectUnalteredPrototypeProperties() needs a .prototype to collect properties from. ' +
      type + '.prototype is undefined.');
  }
  else if(!typeName) {
    throw new Error('typeName is required to save properties, got: ' + typeName);
  }
  var objectProperties = {};
  var objectPropertyNames = Object.getOwnPropertyNames(type.prototype);
  objectPropertyNames.forEach(function(prop) {
    //Access of some prototype values may throw an error
    try {
      objectProperties[prop] = type.prototype[prop];
    }
    catch(e) {}
  });
  domInterceptor.listener = domInterceptor.savedListener;
  domInterceptor.originalProperties[typeName] = objectProperties;
  return objectProperties;
};

/**
* Helper function for patching one prototype.
* Patches the given type with the addition of a
* call to listener, a function passed as a parameter.
* If no listener function is provided, the default listener is used.
*/
domInterceptor.patchOnePrototype = function(type) {
  domInterceptor.listener = domInterceptor._listener;
  if (!type || !type.prototype) {
    throw new Error('collectPrototypeProperties() needs a .prototype to collect properties from. ' + type + '.prototype is undefined.');
  }
  var objectProperties = Object.getOwnPropertyNames(type.prototype);
  objectProperties.forEach(function(prop) {
    //Access of some prototype values may throw an error
    var desc = undefined;
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
              domInterceptor.listener({message: '', property: prop});
              return originalValue.apply(this, arguments);
            };
          }
        } else {
          if (typeof desc.set === 'function') {
            var originalSet = desc.set;
            desc.set = function () {
              domInterceptor.listener('set:' + prop);
              return originalSet.apply(this, arguments);
            };
          }
          if (typeof desc.get === 'function') {
            var originalGet = desc.get;
            desc.get = function () {
              domInterceptor.listener('get:' + prop);
              return originalGet.apply(this, arguments);
            };
          }
        }
        Object.defineProperty(type.prototype, prop, desc);
      } else if (desc.writable) {
        try {
          var original = type.prototype[prop];
          type.prototype[prop] = function () {
            domInterceptor.listener({message: '', property: prop});
            return original.apply(this, arguments);
          };
        }
        catch (e) {}
      }
    }
  });
  domInterceptor.listener = domInterceptor.savedListener;
};

/**
* Controls the unpatching process by unpatching the
* prototypes as well as disabling the patching of individual
* HTML elements and returning those patched elements to their
* original state.
**/
domInterceptor.removeManipulationListener = function() {
  domInterceptor.listener = domInterceptor._listener;
  domInterceptor.unpatchOnePrototype(Element, 'Element');
  domInterceptor.unpatchOnePrototype(Node, 'Node');
  domInterceptor.unpatchOnePrototype(EventTarget, 'EventTarget');
  domInterceptor.unpatchOnePrototype(Document, 'Document');
  domInterceptor.listener = domInterceptor.savedListener;
};

/**
* Helper function to unpatch one prototype.
* Sets all properties of the given type back to the
* original values that were collected.
**/
domInterceptor.unpatchOnePrototype = function(type, typeName) {
  domInterceptor.listener = domInterceptor._listener;
  if(typeName == undefined) {
    throw new Error('typeName must be the name used to save prototype properties. Got: ' + typeName);
  }
  var objectProperties = Object.getOwnPropertyNames(type.prototype);
  objectProperties.forEach(function(prop) {
    //Access of some prototype values may throw an error
    try{
    var alteredElement = type.prototype[prop];
      if(typeof alteredElement === 'function') {
        type.prototype[prop] = domInterceptor.originalProperties[typeName][prop];
      }
    }
    catch(e) {}
  });
  domInterceptor.listener = domInterceptor.savedListener;
};

/**************************************************************************************************/
/** EXTRA PATCHING METHODS NOT USED IN MAIN DOM-MANIPULATION DETECTOR **/

/**
* List of DOM API properties to patch on individual elements.
* These are properties not covered by patching of the prototypes
* and must therefore be patched on the elements themselves.
**/
domInterceptor.propertiesToPatch = ['innerHTML', 'parentElement'];

/**
* Object to hold original version of patched elements
*/
domInterceptor.savedElements = {};

/**
* While patching prototypes patches many of the DOM APIs,
* some properties exist only on the elements themselves. This
* function retrieves all the current elements on the page and
* patches them to call the given listener function if manipulated.
*/
domInterceptor.patchExistingElements = function() {
  domInterceptor.listener = domInterceptor._listener;
  var elements = document.getElementsByTagName('*');
  for(var i = 0; i < elements.length; i++) {
    domInterceptor.save(elements[i], i);
    domInterceptor.patchElementProperties(elements[i]);
  }
  domInterceptor.listener = domInterceptor.savedListener;
};

/**
* Function to patch specified properties of a given
* element to call the listener function on getting or setting
**/
domInterceptor.patchElementProperties = function(element) {
  domInterceptor.listener = domInterceptor._listener;
  var real = {};
  domInterceptor.propertiesToPatch.forEach(function(prop) {
    real[prop] = element[prop];
    Object.defineProperty(element, prop, {
      configurable: true,
      get: function() {
        domInterceptor.listener({message: '', property: prop});
        return real[prop];
      },
      set: function(newValue) {
        domInterceptor.listener({message: '', property: prop});
        real[prop] = element[prop];
      }
    });
  });
  domInterceptor.listener = domInterceptor.savedListener;
  return element;
};

/**
* Function to save properties that will be patched
* Each element has an object associating with it the patched properties
**/
domInterceptor.save = function(element, index) {
  domInterceptor.listener = domInterceptor._listener;
  var elementProperties = {};
  domInterceptor.propertiesToPatch.forEach(function(prop) {
    elementProperties[prop] = element[prop];
  });
  domInterceptor.savedElements[index] = elementProperties;
  domInterceptor.listener = domInterceptor.savedListener;
};


/**
* Unpatches all the elements on the page that were patched.
*/
domInterceptor.unpatchExistingElements = function() {
  domInterceptor.listener = domInterceptor._listener;
  var elements = document.getElementsByTagName('*');
  for(var i = 0; i < elements.length; i++) {
    var originalElement = domInterceptor.savedElements[i];
    domInterceptor.unpatchElementProperties(elements[i], originalElement);
  }
  domInterceptor.listener = domInterceptor.savedListener;
};

/**
* Helper function to unpatch all properties of a given element
*/
domInterceptor.unpatchElementProperties = function(element, originalElement) {
  domInterceptor.listener = domInterceptor._listener;
  domInterceptor.propertiesToPatch.forEach(function(prop) {
    Object.defineProperty(element, prop, {
      configurable: true,
      get: function() {
        return originalElement[prop];
      },
      set: function(newValue) {
        element.prop = newValue;
      }
    });
  });
  domInterceptor.listener = domInterceptor.savedListener;
};


// /**
// * Methods to patch DOM Access based on the harmony-reflect library and
// * the use of proxies. Currently proxies are considered experimental javascript.
// * In chrome, proxies can be enabled with the enable-javascript-harmony flag.
// * When support of proxies is more common, these functions could be used to patch
// * DOM elements on retrieval so that only the proxies are patched.
// */
// domInterceptor.accessFunctions = ['getElementsByClassName', 'getElementsByName',
// 'getElementsByTagName', 'getElementsByTagNameNS'];
// domInterceptor.unpatchedFunctions = {};
// domInterceptor.patchAccess = function() {
//   var originalIndividual = Document.prototype['getElementById'];
//   domInterceptor.unpatchedFunctions['getElementById'] = originalIndividual;
//   Document.prototype['getElementById'] = function() {
//     return domInterceptor.getProxy(originalIndividual.apply(this, arguments));
//   }
//   domInterceptor.accessFunctions.forEach(function(accessFunction) {
//     var originalFunction = Document.prototype[accessFunction];
//     domInterceptor.unpatchedFunctions[accessFunction] = originalFunction;
//     Document.prototype[accessFunction] = function() {
//       return domInterceptor.getProxyList(originalFunction.apply(this, arguments));
//     }
//   });
// };

// /**
// * Attempts to create a proxy element in place of a created element when the method
// * is called. Currently causes the proxy to be null.
// */
// domInterceptor.patchCreation = function() {
//   var originalCreate = Document.prototype['createElement'];
//   domInterceptor.unpatchedFunctions['createElement'] = Document.prototype['createElement'];
//   Document.prototype['createElement'] = function() {
//     return domInterceptor.getProxy(originalCreate.apply(this, arguments));
//   }
// }

// /**
// * Helper method to get a list of proxies for methods that access
// * lists of DOM elements such as getElementsByTagName()
// */
// domInterceptor.getProxyList = function(elementList) {
//   var elems = {};
//   for(var i = 0; i < Object.keys(elementList).length - 1; i++) {
//     if(elementList[i]) {
//       elems[i] = domInterceptor.getProxy(elementList[i]);
//     }
//   }
//   return elems;
// };

// /**
// * Creates a proxy element that is accessed instead of a given DOM element.
// * This proxy is patched to call the desired listener function.
// * Hence, the proxy has the functionality necessary to detect DOM manipulation,
// * but the original element is still fully functional.
// */
// domInterceptor.getProxy = function(element) {
//   var proxyElement = new Proxy(element, {
//     get: function(target, name, receiver) {
//       domInterceptor.savedListener({message: '', property: name});
//       return Reflect.get(target, name, receiver);
//     },
//     set: function(target, name, value, receiver) {
//       domInterceptor.savedListener({message: '', property: name});
//       return Reflect.set(target, name, value, receiver);
//     }
//   });
//   return proxyElement;
// };

// /**
// * Removes proxies of elements.
// */
// domInterceptor.unPatchAccess = function() {
//   Document.prototype['getElementById'] = domInterceptor.unpatchedFunctions['getElementById'];
//   domInterceptor.accessFunctions.forEach(function(accessFunction) {
//     Document.prototype[accessFunction] = domInterceptor.unpatchedFunctions[accessFunction];
//   });
// };

}((typeof module !== 'undefined' && module && module.exports) ?
      (module.exports = window.domInterceptor = {}) : (window.domInterceptor = {}) ));

},{}]},{},[1])