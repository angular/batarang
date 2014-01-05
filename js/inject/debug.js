var inject = function () {
  document.head.appendChild((function () {

    var fn = function bootstrap (window) {

      var angular = window.angular;

      // Helper to determine if the root 'ng' module has been loaded
      // window.angular may be available if the app is bootstrapped asynchronously, but 'ng' might
      // finish loading later.
      var ngLoaded = function () {
        if (!window.angular) {
          return false;
        }
        try {
          window.angular.module('ng');
        }
        catch (e) {
          return false;
        }
        return true;
      };

      if (!ngLoaded()) {
        (function () {
          // TODO: var name
          var areWeThereYet = function (ev) {
            if (ev.srcElement.tagName === 'SCRIPT') {
              var oldOnload = ev.srcElement.onload;
              ev.srcElement.onload = function () {
                if (ngLoaded()) {

                  document.removeEventListener('DOMNodeInserted', areWeThereYet);
                  bootstrap(window);
                }
                if (oldOnload) {
                  oldOnload.apply(this, arguments);
                }
              };
            }
          };
          document.addEventListener('DOMNodeInserted', areWeThereYet);
        }());
        return;
      }

      // do not patch twice
      if (window.__ngDebug) {
        return;
      }

      // Helpers
      // =======

      // polyfill for performance.now on older webkit
      if (!performance.now) {
        performance.now = performance.webkitNow;
      }

      // Based on cycle.js
      // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js

      // Make a deep copy of an object or array, assuring that there is at most
      // one instance of each object or array in the resulting structure. The
      // duplicate references (which might be forming cycles) are replaced with
      // an object of the form
      //      {$ref: PATH}
      // where the PATH is a JSONPath string that locates the first occurrence.
      var decycle = function (object) {
        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {
          var i,          // The loop counter
              name,       // Property name
              nu;         // The new object or array
          switch (typeof value) {
          case 'object':
            if (value instanceof HTMLElement) {
              return value.innerHTML.toString().trim();
            }
            if (!value) {
              return null;
            }
            for (i = 0; i < objects.length; i += 1) {
              if (objects[i] === value) {
                return {$ref: paths[i]};
              }
            }
            objects.push(value);
            paths.push(path);
            if (value instanceof Array) {
              nu = [];
              for (i = 0; i < value.length; i += 1) {
                nu[i] = derez(value[i], path + '[' + i + ']');
              }
            } else {
              nu = {};
              for (name in value) {
                if (name[0] !== '$' && Object.prototype.hasOwnProperty.call(value, name)) {
                  nu[name] = derez(value[name],
                    path + '[' + JSON.stringify(name) + ']');
                }
              }
            }
            return nu;
          case 'number':
          case 'string':
          case 'boolean':
            return value;
          }
        }(object, '$'));
      };
      // End
      // ===

      // given a scope object, return an object with deep clones
      // of the models exposed on that scope
      var getScopeLocals = function (scope) {
        var scopeLocals = {}, prop;
        for (prop in scope) {
          if (scope.hasOwnProperty(prop) && prop !== 'this' && prop[0] !== '$') {
            scopeLocals[prop] = decycle(scope[prop]);
          }
        }
        return scopeLocals;
      };

      // helper to extract dependencies from function arguments
      // not all versions of AngularJS expose annotate
      var annotate = angular.injector().annotate;
      if (!annotate) {
        annotate = (function () {

          var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
          var FN_ARG_SPLIT = /,/;
          var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
          var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

          // TODO: should I keep these assertions?
          function assertArg(arg, name, reason) {
            if (!arg) {
              throw new Error("Argument '" + (name || '?') + "' is " + (reason || "required"));
            }
            return arg;
          }
          function assertArgFn(arg, name, acceptArrayAnnotation) {
            if (acceptArrayAnnotation && angular.isArray(arg)) {
              arg = arg[arg.length - 1];
            }

            assertArg(angular.isFunction(arg), name, 'not a function, got ' +
                (arg && typeof arg == 'object' ? arg.constructor.name || 'Object' : typeof arg));
            return arg;
          }

          return function (fn) {
            var $inject,
                fnText,
                argDecl,
                last;

            if (typeof fn == 'function') {
              if (!($inject = fn.$inject)) {
                $inject = [];
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
                  arg.replace(FN_ARG, function(all, underscore, name) {
                    $inject.push(name);
                  });
                });
                fn.$inject = $inject;
              }
            } else if (angular.isArray(fn)) {
              last = fn.length - 1;
              assertArgFn(fn[last], 'fn');
              $inject = fn.slice(0, last);
            } else {
              assertArgFn(fn, 'fn', true);
            }
            return $inject;
          };
        }());
      }

      // throttle based on _.throttle from Lo-Dash
      // https://github.com/bestiejs/lodash/blob/master/lodash.js#L4625
      var throttle = function (func, wait) {
        var args,
            result,
            thisArg,
            timeoutId,
            lastCalled = 0;

        function trailingCall() {
          lastCalled = new Date();
          timeoutId = null;
          result = func.apply(thisArg, args);
        }
        return function() {
          var now = new Date(),
            remaining = wait - (now - lastCalled);

          args = arguments;
          thisArg = this;

          if (remaining <= 0) {
            clearTimeout(timeoutId);
            timeoutId = null;
            lastCalled = now;
            result = func.apply(thisArg, args);
          }
          else if (!timeoutId) {
            timeoutId = setTimeout(trailingCall, remaining);
          }
          return result;
        };
      };

      var debounce = function (func, wait, immediate) {
        var args,
          result,
          thisArg,
          timeoutId;

        function delayed() {
          timeoutId = null;
          if (!immediate) {
            result = func.apply(thisArg, args);
          }
        }
        return function() {
          var isImmediate = immediate && !timeoutId;
          args = arguments;
          thisArg = this;

          clearTimeout(timeoutId);
          timeoutId = setTimeout(delayed, wait);

          if (isImmediate) {
            result = func.apply(thisArg, args);
          }
          return result;
        };
      };

      var updateScopeModelCache = function (scope) {
        debug.models[scope.$id] = getScopeLocals(scope);
        debug.scopeDirty[scope.$id] = false;
      };


      //converts camelCase to snake-case
      var snakeCase = function (inCamelCase, delimiter) {
        return inCamelCase.split(/(?=[A-Z])/).map(function (p) {
          return p.toLowerCase()
        }).join(delimiter || "-");
      };

      //see objectId.js
      var objectId = ngTool().objectId;

      // gets name of user-defined directive which introduced new scope for the DOM element
      // for now works with Attribute and Element directives only
      // does not work if 'replace' flag for directive is true
      var getScopeSourceDirective = function (el) {
        var directive = debug.directives['E-' + el.tagName.toLowerCase()];
        if (directive && directive.newScope) return directive;
        for (var i = 0; i < el.attributes.length; i++) {
          directive = debug.directives['A-' + el.attributes[i].name.toLowerCase()];
          if (directive && directive.newScope) return directive;
        }
        return undefined;
      };


      // Tries to give human-readable name to each scope using the following:
      // - controller name
      // - user-defined directive name
      // - ngRepeat iterated item object
      // - ngInclude source
      // - __name attribute of the scope (may be used for debug)
      var collectScopeNames = function () {

        function getScope(jq) {
          //for angular 1.2 we need to check isolateScope as well
          return (jq.hasClass('ng-isolate-scope') && jq.isolateScope) ? jq.isolateScope() : jq.scope();
        }

        function controllerName (obj, el) {
          if (!el.hasAttribute('ng-controller')) {
            return;
          }
          obj.controller = el.getAttribute("ng-controller");
        }

        function directiveName (obj, el) {
          var directive = getScopeSourceDirective(el);
          if (!directive) {
            return;
          }
          obj.directive = directive.name;
        }

        function ngRepeat (obj, el, scope) {
          if (!el.hasAttribute('ng-repeat')) {
            return;
          }
          var expr = el.getAttribute('ng-repeat');
          //TODO: for object it is probably better to read value, not key
          var itemExpr = expr.split('in')[0].split(",")[0].replace(/^\(/, '').trim();
          var item = scope.$eval(itemExpr);
          if (item) {
            obj.ngRepeat = {
                index: scope.$index,
                itemExpr: itemExpr,
                itemId: objectId(item)
            }
          }
        }

        function ngInclude (obj, el, scope) {
          if (el.hasAttribute('ng-include')) {
            obj.ngInclude = scope.$eval(el.getAttribute('ng-include'));
          }
          if (el.tagName == "NG-INCLUDE") {
            obj.ngInclude = scope.$eval(el.getAttribute('src'));
          }
        }

        //for directives like ng-include the scope for corresponding dom element is actually the parent scope,
        // so we need to get scope of first child (if it does not have its own isolated scope)
        function correctScope (el, scope) {
          if (el.hasAttribute('ng-include') || el.tagName == 'NG-INCLUDE') {
            var $el = angular.element(el), firstChild = $el.children()[0];
            if (firstChild) {
              var childScope = getScope(angular.element(firstChild));
              if (childScope.$parent != scope) {
                //there is one more scope inside
                childScope = childScope.$parent;
              }
              return childScope;
            }
          }
          return scope;
        }

        function parseNode (el, scope) {
          var res = {};
          controllerName(res, el);
          directiveName(res, el);
          ngRepeat(res, el, scope);
          ngInclude(res, el, scope);
          return Object.keys(res).length == 0 ? undefined : res;
        }

        function saveScopeName (el) {
          var $el = angular.element(el);
          var scope = getScope($el);
          var realScope = correctScope(el, scope);
          if (angular.isDefined(debug.scopeNames[realScope.$id])) {
            return;
          }
          debug.scopeNames[realScope.$id] = parseNode(el, scope);
        }

        debug.scopeNames = {};
        ["[ng-controller]", ".ng-scope", ".ng-isolate-scope", "[ng-repeat]", "[ng-include]", "ng-include"].forEach(function (selector) {
          angular.forEach(document.querySelectorAll(selector), saveScopeName);
        });
      };

      var popover = null;

      // Public API
      // ==========

      var api = window.__ngDebug = {

        getDeps: function () {
          return debug.deps;
        },

        getRootScopeIds: function () {
          var ids = [];
          angular.forEach(debug.rootScopes, function (elt, id) {
            ids.push(id);
          });
          return ids;
        },

        // returns null or cached scope
        getModel: function (id) {
          if (debug.scopeDirty[id]) {
            updateScopeModelCache(debug.scopes[id]);
            return debug.models[id];
          }
        },

        getScopeTree: function (id) {
          if (debug.scopeTreeDirty[id] === false) {
            return;
          }
          collectScopeNames();
          var traverse = function (sc) {
            var tree = {
              id: sc.$id,
              name: sc.__name || debug.scopeNames[sc.$id],
              children: []
            };

            var child = sc.$$childHead;
            if (child) {
              do {
                tree.children.push(traverse(child));
              } while (child !== sc.$$childTail && (child = child.$$nextSibling));
            }

            return tree;
          };

          var root = debug.rootScopes[id];
          var tree = traverse(root);

          if (tree) {
            debug.scopeTreeDirty[id] = false;
          }


          return tree;
        },

        getWatchPerf: function () {
          var changes = [];
          angular.forEach(debug.watchPerf, function (info, name) {
            if (info.time > 0) {
              changes.push({
                name: name,
                time: info.time
              });
              info.time = 0;
            }
          });
          return changes;
        },

        getWatchTree: function (id) {
          //TODO: here we may cache the scope names and do not collect them on each call
          collectScopeNames();
          var traverse = function (sc) {
            var tree = {
              id: sc.$id,
              name: sc.__name || debug.scopeNames[sc.$id],
              watchers: debug.watchers[sc.$id],
              children: []
            };

            var child = sc.$$childHead;
            if (child) {
              do {
                tree.children.push(traverse(child));
              } while (child !== sc.$$childTail && (child = child.$$nextSibling));
            }

            return tree;
          };

          var root = debug.rootScopes[id];
          var tree = traverse(root);

          return tree;
        },

        enable: function () {
          if (popover) {
            return;
          }
          var angular = window.angular;
          popover = angular.element(
            '<div style="position: fixed; left: 50px; top: 50px; z-index: 9999; background-color: #f1f1f1; box-shadow: 0 15px 10px -10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;">' +
              '<div style="position: relative" style="min-width: 300px; min-height: 100px;">' +
                '<div style="min-width: 100px; min-height: 50px; padding: 5px;"><pre>{ Please select a scope }</pre></div>' +
                '<button style="position: absolute; top: -15px; left: -15px; cursor: move;">⇱</button>' +
                '<button style="position: absolute; top: -15px; left: 10px;">+</button>' +
                '<button style="position: absolute; top: -15px; right: -15px;">x</button>' +
                '<style>' +
                  '.ng-scope.bat-selected { border: 1px solid red; } ' +
                  '.bat-indent { margin-left: 20px; }' +
                '</style>' +
              '</div>' +
            '</div>');
          angular.element(window.document.body).append(popover);
          var popoverContent = angular.element(angular.element(popover.children('div')[0]).children()[0]);
          var dragElt = angular.element(angular.element(popover.children('div')[0]).children()[1]);
          var selectElt = angular.element(angular.element(popover.children('div')[0]).children()[2]);
          var closeElt = angular.element(angular.element(popover.children('div')[0]).children()[3]);

          var currentScope = null,
            currentElt = null;

          function onMove (ev) {
            var x = ev.clientX,
              y = ev.clientY;

            if (x > window.outerWidth - 100) {
              x = window.outerWidth - 100;
            } else if (x < 0) {
              x = 0;
            }
            if (y > window.outerHeight - 100) {
              y = window.outerHeight - 100;
            } else if (y < 0) {
              y = 0;
            }

            x += 5;
            y += 5;

            popover.css('left', x + 'px');
            popover.css('top', y + 'px');
          }

          closeElt.bind('click', function () {
            popover.remove();
            popover = null;
          });

          selectElt.bind('click', bindSelectScope);

          var selecting = false;
          function bindSelectScope () {
            if (selecting) {
              return;
            }
            setTimeout(function () {
              selecting = true;
              selectElt.attr('disabled', true);
              angular.element(document.body).css('cursor', 'crosshair');
              angular.element(document.getElementsByClassName('ng-scope'))
                .bind('click', onSelectScope)
                .bind('mouseover', onHoverScope);
            }, 30);
          }

          var hoverScopeElt = null;

          function markHoverElt () {
            if (hoverScopeElt) {
              hoverScopeElt.addClass('bat-selected');
            }
          }
          function unmarkHoverElt () {
            if (hoverScopeElt) {
              hoverScopeElt.removeClass('bat-selected');
            }
          }

          function onSelectScope (ev) {
            render(this);
            angular.element(document.getElementsByClassName('ng-scope'))
              .unbind('click', onSelectScope)
              .unbind('mouseover', onHoverScope);
            unmarkHoverElt();
            selecting = false;
            selectElt.attr('disabled', false);
            angular.element(document.body).css('cursor', '');
            hovering = false;
          }

          var hovering = false;
          function onHoverScope (ev) {
            if (hovering) {
              return;
            }
            hovering = true;
            var that = this;
            setTimeout(function () {
              unmarkHoverElt();
              hoverScopeElt = angular.element(that);
              markHoverElt();
              hovering = false;
              render(that);
            }, 100);
          }

          function onUnhoverScope (ev) {
            angular.element(this).css('border', '');
          }

          dragElt.bind('mousedown', function (ev) {
            ev.preventDefault();
            rendering = true;
            angular.element(document).bind('mousemove', onMove);
          });
          angular.element(document).bind('mouseup', function () {
            angular.element(document).unbind('mousemove', onMove);
            setTimeout(function () {
              rendering = false;
            }, 120);
          });

          function renderTree (data) {
            var tree = angular.element('<div class="bat-indent"></div>');
            angular.forEach(data, function (val, key) {
              var toAppend;
              if (val === undefined) {
                toAppend = '<i>undefined</i>';
              } else if (val === null) {
                toAppend = '<i>null</i>';
              } else if (val instanceof Array) {
                toAppend = objectId(val);
              } else if (val instanceof Object) {
                toAppend = objectId(val);
              } else {
                toAppend = val.toString();
              }
              if (data instanceof Array) {
                toAppend = '<div>' +
                  toAppend +
                  ((key === (data.length - 1))?'':',') +
                  '</div>';
              } else {
                toAppend = '<div>' +
                  key +
                  ': ' +
                  toAppend +
                  (key!==0?'':',') +
                  '</div>';
              }
              toAppend = angular.element(toAppend);
              if (val instanceof Array || val instanceof Object) {
                function recur () {
                  toAppend.unbind('click', recur);
                  toAppend.html('');
                  toAppend
                    .append(angular.element('<span>' +
                      key + ': ' +
                      ((val instanceof Array)?'[':'{') +
                      '<span>').bind('click', collapse))
                    .append(renderTree(val))
                    .append('<span>' + ((val instanceof Array)?']':'}') + '<span>');
                }
                function collapse () {
                  toAppend.html('');
                  toAppend.append(angular.element('<div>' +
                    key +
                    ': ' +
                    ((val instanceof Array)?'[ ... ]':'{ ... }') +
                    '</div>').bind('click', recur));
                }
                toAppend.bind('click', recur);
              }
              tree.append(toAppend);
            });

            return tree;
          }

          var isEmpty = function (object) {
            var prop;
            for (prop in object) {
              if (object.hasOwnProperty(prop)) {
                return false;
              }
            }
            return true;
          };

          var objLength = function (object) {
            var prop, len = 0;
            for (prop in object) {
              if (object.hasOwnProperty(prop)) {
                len += 1;
              }
            }
            return len;
          };

          var rendering = false;
          var render = function (elt) {
            if (rendering) {
              return;
            }
            rendering = true;
            setTimeout(function () {
              var scope = angular.element(elt).scope();
              rendering = false;
              if (scope === currentScope) {
                return;
              }
              currentScope = scope;
              currentElt = elt;

              var models = getScopeLocals(scope);
              popoverContent.children().remove();
              if (isEmpty(models)) {
                popoverContent.append(angular.element('<i>This scope has no models</i>'));
              } else {
                popoverContent.append(renderTree(models));
              }

            }, 100);
          };

        }
      };


      // Private state
      // =============

      //var bootstrap = window.angular.bootstrap;
      var debug = {
        // map of scopes --> watcher function name strings
        watchers: {},

        // maps of watch/apply exp/fns to perf data
        watchPerf: {},
        applyPerf: {},

        // map of scope.$ids --> $scope objects
        scopes: {},
        // map of scope.$ids --> $scope human readable names (as string or as object with several 'type': 'name' strings)
        scopeNames: {},
        // map of scope.$ids --> model objects
        models: {},
        // map of $ids --> bools
        scopeDirty: {},

        // map of $ids --> refs to $rootScope objects
        rootScopes: {},
        scopeTreeDirty: {},

        deps: [],

        // map of directive names in form '<restrict>-snake-case' --> {name: <camelCase>, newScope: <true/false>}
        // for directives with multiple restricts there will be several records
        directives: {},
        //list of directive names registered by user
        directiveNames: []
      };


      // Instrumentation
      // ===============

      var ng = angular.module('ng');
      ng.config(function ($provide) {
        // methods to patch

        // $provide.provider
        var temp = $provide.provider;
        $provide.provider = function (name, definition) {
          if (!definition) {
            angular.forEach(name, function (definition, name) {
              var tempGet = definition.$get;
              definition.$get = function () {
                debug.deps.push({
                  name: name,
                  imports: annotate(tempGet)
                });
                return tempGet.apply(this, arguments);
              };
            });
          } else if (definition instanceof Array) {
            // it is a constructoctor with array syntax
            var tempConstructor = definition[definition.length - 1];

            definition[definition.length - 1] = function () {
              debug.deps.push({
                name: name,
                imports: annotate(tempConstructor)
              });
              return tempConstructor.apply(this, arguments);
            };
          } else if (definition.$get instanceof Array) {
            // it should have a $get
            var tempGet = definition.$get[definition.$get.length - 1];

            definition.$get[definition.$get.length - 1] = function () {
              debug.deps.push({
                name: name,
                imports: annotate(tempGet)
              });
              return tempGet.apply(this, arguments);
            };
          } else if (typeof definition === 'object') {
            // it should have a $get
            var tempGet = definition.$get;

            // preserve original annotations
            definition.$get = annotate(definition.$get);
            definition.$get.push(function () {
              debug.deps.push({
                name: name,
                imports: annotate(tempGet)
              });
              return tempGet.apply(this, arguments);
            });
          } else {
            debug.deps.push({
              name: name,
              imports: annotate(definition)
            });
          }
          return temp.apply(this, arguments);
        };

        // $provide.(factory|service)
        [
          'factory',
          'service'
        ].forEach(function (met) {
          var temp = $provide[met];
          $provide[met] = function (name, definition) {
            if (typeof name === 'object') {
              angular.forEach(name, function (value, key) {
                var isArray = value instanceof Array;
                var originalValue = isArray ? value[value.length - 1] : value;

                var newValue = function () {
                  debug.deps.push({
                    name: key,
                    imports: annotate(originalValue)
                  });
                  return originalValue.apply(this, arguments);
                };

                if (isArray) {
                  value[value.length - 1] = newValue;
                } else {
                  name[value] = newValue;
                }
              });
            } else {
              debug.deps.push({
                name: name,
                imports: annotate(definition)
              });
            }
            return temp.apply(this, arguments);
          };
        });

        $provide.decorator('$rootScope', function ($delegate) {

          var watchFnToHumanReadableString = function (fn) {
            if (fn.exp) {
              return fn.exp.trim();
            } else if (fn.name) {
              return fn.name.trim();
            } else {
              return fn.toString();
            }
          };

          var applyFnToLogString = function (fn) {
            var str;
            if (fn) {
              if (fn.name) {
                str = fn.name;
              } else if (fn.toString().split('\n').length > 1) {
                str = 'fn () { ' + fn.toString().split('\n')[1].trim() + ' /* ... */ }';
              } else {
                str = fn.toString().trim().substr(0, 30) + '...';
              }
            } else {
              str = '$apply';
            }
            return str;
          };


          // patch registering watchers
          // ==========================

          var _watch = $delegate.__proto__.$watch;
          $delegate.__proto__.$watch = function (watchExpression, applyFunction) {
            var thatScope = this;
            var watchStr = watchFnToHumanReadableString(watchExpression);

            if (!debug.watchPerf[watchStr]) {
              debug.watchPerf[watchStr] = {
                time: 0,
                calls: 0
              };
            }
            if (!debug.watchers[thatScope.$id]) {
              debug.watchers[thatScope.$id] = [];
            }
            debug.watchers[thatScope.$id].push(watchStr);

            // patch watchExpression
            // ---------------------
            var w = watchExpression;
            if (typeof w === 'function') {
              watchExpression = function () {
                var start = performance.now();
                var ret = w.apply(this, arguments);
                var end = performance.now();
                debug.watchPerf[watchStr].time += (end - start);
                debug.watchPerf[watchStr].calls += 1;
                return ret;
              };
            } else {
              watchExpression = function () {
                var start = performance.now();
                var ret = thatScope.$eval(w);
                var end = performance.now();
                debug.watchPerf[watchStr].time += (end - start);
                debug.watchPerf[watchStr].calls += 1;
                return ret;
              };
            }

            // patch applyFunction
            // -------------------
            if (typeof applyFunction === 'function') {
              var applyStr = applyFunction.toString();
              var unpatchedApplyFunction = applyFunction;
              applyFunction = function () {
                var start = performance.now();
                var ret = unpatchedApplyFunction.apply(this, arguments);
                var end = performance.now();
                debug.scopeDirty[this.$id] = true;

                //TODO: move these checks out of here and into registering the watcher
                if (!debug.applyPerf[applyStr]) {
                  debug.applyPerf[applyStr] = {
                    time: 0,
                    calls: 0
                  };
                }
                debug.applyPerf[applyStr].time += (end - start);
                debug.applyPerf[applyStr].calls += 1;
                return ret;
              };
            }

            return _watch.apply(this, arguments);
          };


          // patch $destroy
          // --------------
          var _destroy = $delegate.__proto__.$destroy;
          $delegate.__proto__.$destroy = function () {
            if (debug.watchers[this.$id]) {
              delete debug.watchers[this.$id];
            }
            if (debug.models[this.$id]) {
              delete debug.models[this.$id];
            }
            if (debug.scopes[this.$id]) {
              delete debug.scopes[this.$id];
            }
            return _destroy.apply(this, arguments);
          };


          // patch $new
          // ----------
          var _new = $delegate.__proto__.$new;
          $delegate.__proto__.$new = function () {

            var ret = _new.apply(this, arguments);
            if (ret.$root) {
              debug.rootScopes[ret.$root.$id] = ret.$root;
              debug.scopeTreeDirty[ret.$root.$id] = true;
            }

            // create empty watchers array for this scope
            if (!debug.watchers[ret.$id]) {
              debug.watchers[ret.$id] = [];
            }

            debug.scopes[ret.$id] = ret;
            debug.scopes[this.$id] = this;
            debug.scopeDirty[ret.$id] = true;

            return ret;
          };


          // patch $digest
          // -------------
          var _digest = $delegate.__proto__.$digest;
          $delegate.__proto__.$digest = function (fn) {
            var ret = _digest.apply(this, arguments);
            debug.scopeDirty[this.$id] = true;
            return ret;
          };


          // patch $apply
          // ------------
          var _apply = $delegate.__proto__.$apply;
          $delegate.__proto__.$apply = function (fn) {
            var start = performance.now();
            var ret = _apply.apply(this, arguments);
            var end = performance.now();
            debug.scopeDirty[this.$id] = true;

            // If the debugging option is enabled, log to console
            // --------------------------------------------------
            if (debug.log) {
              console.log(applyFnToLogString(fn) + '\t\t' + (end - start).toPrecision(4) + 'ms');
            }

            return ret;
          };


          return $delegate;
        });
      });

      // Here we collect user-defined directives
      ng.config(function patchCompileProvider ($compileProvider) {
        var tempDirective = $compileProvider.directive;

        $compileProvider.directive = function (name, directiveFactory) {
          if (angular.isString(name)) {
            debug.directiveNames.push(name);
          }
          else {
            angular.forEach(name, function (directiveFactory, name) {
              debug.directiveNames.push(name);
            });
          }
          return tempDirective.apply(this, arguments);
        };
      });

      ng.run(function readDirectiveOptions ($injector) {
        angular.forEach(debug.directiveNames, function(name) {
          var directives = $injector.get(name + 'Directive');
          angular.forEach(directives, function(def) {
            angular.forEach((def.restrict || 'A').split(''), function(restrictType) {
              debug.directives[restrictType + '-' + snakeCase(name)] = {name: name, newScope: !!def.scope};
              //TODO: patch directive to add something to element which will refer to the directive name if 'replace' flag is true
            });
          });
        });
      });
    };

    // Return a script element with the above code embedded in it
    var script = window.document.createElement('script');
    script.innerHTML = ngTool.toString() + ';\n' + '(' + fn.toString() + '(window))';

    return script;
  }()));
};

// only inject if cookie is set
if (document.cookie.indexOf('__ngDebug=true') != -1) {
  document.addEventListener('DOMContentLoaded', inject);
}
