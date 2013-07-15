// inject/debug.js
// this file is run from the content script context (separate JS VM from the app, but same DOM)
// but injects an 'instrumentation' script tag into the app context
// confusing, right?

var instument = function (window) {

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
    // TODO: var name
    var areWeThereYet = function (ev) {
      if (ev.srcElement.tagName === 'SCRIPT') {
        var oldOnload = ev.srcElement.onload;
        ev.srcElement.onload = function () {
          if (ngLoaded()) {
            document.removeEventListener('DOMNodeInserted', areWeThereYet);
            instument(window);
          }
          if (oldOnload) {
            oldOnload.apply(this, arguments);
          }
        };
      }
    };
    document.addEventListener('DOMNodeInserted', areWeThereYet);
    return;
  }

  // do not patch twice
  if (window.__ngDebug) {
    return;
  }



  // Helpers
  // =======

  // throttle based on _.throttle from Lo-Dash
  // https://github.com/bestiejs/lodash/blob/master/lodash.js#L4625

  // modified so that it
  // throttles based on arguments
  // returns nothing

  // Ex:
  // var th = throttle(fn, 50);
  // fn('foo'); // not throttled
  // fn('foo'); // throttled
  // fn('bar'); // not throttled
  var throttle = function (func, wait) {
    var args,
        thisArg,
        timeoutId = {},
        lastCalled = {};

    return function() {
      args = arguments;
      thisArg = this;

      var argsString = Array.prototype.slice.call(args).join(';'); // lol javascript

      var now = new Date();
      var remaining = wait - (now - lastCalled[argsString]);

      if (remaining <= 0) {
        clearTimeout(timeoutId[argsString]);
        timeoutId[argsString] = null;
        lastCalled[argsString] = now;
        func.apply(thisArg, args);
      }
      else if (!timeoutId[argsString]) {
        timeoutId[argsString] = setTimeout(function () {
          lastCalled[argsString] = new Date();
          timeoutId[argsString] = null;
          func.apply(thisArg, args);
        }, remaining);
      }
    };
  };

  // polyfill for performance.now on older webkit
  if (!performance.now) {
    performance.now = performance.webkitNow;
  }

  // Send notifications from app context to devtools context
  // in order to do this, we need to create a DOM element across which
  // the app and content script contexts can communicate
  var eventProxyElement = document.createElement('div');
  eventProxyElement.id = '__ngDebugElement';
  eventProxyElement.style.display = 'none';
  document.body.appendChild(eventProxyElement);

  var customEvent = document.createEvent('Event');
  customEvent.initEvent('myCustomEvent', true, true);

  var fireCustomEvent = function  (data) {
    eventProxyElement.innerText = JSON.stringify(data);
    eventProxyElement.dispatchEvent(customEvent);
  };


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

    // map of $ids --> [] array of things being watched
    modelWatchers: {},
    // map of $id + watcher --> value
    modelWatchersState: {},

    // map of $ids --> refs to $rootScope objects
    rootScopes: {},

    deps: []
  };

  var popover = null;



  // Utils
  // =====

  var getWatchTree = function (id) {
    var traverse = function (sc) {
      var tree = {
        id: sc.$id,
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
  };


  var getScopeTree = function (id) {
    var traverse = function (sc) {
      var tree = {
        id: sc.$id,
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
  };

  var getWatchPerf = function () {
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
  };

  // Emit stuff
  // ==========

  var emit = {
    modelChange: throttle(function (id, watchers) {
      var scope = debug.scopes[id];
      var changes = {};

      watchers = watchers || debug.modelWatchers[id];

      if (scope && debug.modelWatchers[id]) {

        Object.keys(debug.modelWatchers[id]).
          forEach(function (watcher) {
            var newValue = api.getModel(id, watcher),
              newString = JSON.stringify(newValue),
              prop = id + '~' + watcher;

            if (debug.modelWatchersState[prop] !== newString) {
              changes[watcher] = newValue;
              debug.modelWatchersState[prop] = newString;
            }
          });
      }

      if (Object.keys(changes).length > 0) {
        fireCustomEvent({
          action: 'modelChange',
          id: id,
          changes: changes
        });
      }
    }, 50),

    scopeChange: throttle(function (id) {
      fireCustomEvent({
        action: 'scopeChange',
        id: id,
        scope: getScopeTree(id)
      });
    }, 50),

    // might be worth limiting
    watchPerf: function () {
      throw new Error('Implement me :c');
    }
  };


  // Public API
  // ==========

  var api = window.__ngDebug = {

    getDeps: function () {
      return debug.deps;
    },

    getRootScopeIds: function () {
      return Object.keys(debug.rootScopes);
    },

    fireCustomEvent: fireCustomEvent,

    getModel: function (id, path) {

      // lol chrome
      if (path) {
        try {throw new Error(''); } catch (e) {}
      }

      if (path === undefined || path === '') {
        path = [];
      } else if (typeof path === 'string') {
        path = path.split('.');
      }

      var dest = debug.scopes[id],
        segment;

      if (!dest) {
        return;
      }

      while (path.length > 0) {
        segment = path.shift();
        dest = dest[segment];
        if (!dest) {
          return;
        }
      }

      // TODO: handle DOM nodes, fns, etc better.
      var subModel = function (obj) {
        return obj instanceof Array ?
            { '~array-length': obj.length } :
          obj === null ?
            null :
          typeof obj === 'object' ?
            { '~object': true } :
            obj;
      };

      if (dest instanceof Array) {
        return dest.map(subModel);
      } else if (typeof dest === 'object') {
        return Object.
          keys(dest).
          filter(function (key) {
            return key[0] !== '$' || key[1] !== '$';
          }).
          reduce(function (obj, prop) {
            obj[prop] = subModel(dest[prop]);
            return obj;
          }, {});
      } else {
        return dest;
      }
    },

    setSomeModel: function (id, path, value) {
      debug.scope[id].$apply(path + '=' + JSON.stringify(value));
    },

    watchModel: function (id, path) {
      debug.modelWatchers[id] = debug.modelWatchers[id] || {};
      debug.modelWatchers[id][path || ''] = true;
      emit.modelChange(id);
    },

    // unwatches all children of the given path
    // Ex:
    // if watching 'foo.bar.baz', 'foo.bar', and 'foo'
    // unwatchModel('001', 'foo.bar')
    // unwatches 'foo.bar.baz' and 'foo.bar'
    unwatchModel: function (id, path) {
      if (!debug.modelWatchers[id]) {
        return;
      }
      if (path === undefined) {
        path = '';
      }
      Object.keys(modelWatchers[id]).forEach(function (key) {
        if (key.substr(0, path.length) === path) {
          delete debug.modelWatchers[id][key];
          //delete debug.
        }
      });
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
            toAppend = '[ ... ]';
          } else if (val instanceof Object) {
            toAppend = '{ ... }';
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

  var recordDependencies = function (providerName, dependencies) {
    debug.deps.push({
      name: providerName,
      imports: dependencies
    });
  };

  // $provide Instrumentation
  // ========================

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
            recordDependencies(name, annotate(tempGet));
            return tempGet.apply(this, arguments);
          };
        });
      } else if (definition instanceof Array) {
        // it is a constructoctor with array syntax
        var tempConstructor = definition[definition.length - 1];

        definition[definition.length - 1] = function () {
          recordDependencies(name, annotate(tempConstructor));
          return tempConstructor.apply(this, arguments);
        };
      } else if (definition.$get instanceof Array) {
        // it should have a $get
        var tempGet = definition.$get[definition.$get.length - 1];

        definition.$get[definition.$get.length - 1] = function () {
          recordDependencies(name, annotate(tempGet));
          return tempGet.apply(this, arguments);
        };
      } else if (typeof definition === 'object') {
        // it should have a $get
        var tempGet = definition.$get;

        // preserve original annotations
        definition.$get = annotate(definition.$get);
        definition.$get.push(function () {
          recordDependencies(name, annotate(tempGet));
          return tempGet.apply(this, arguments);
        });
      } else {
        recordDependencies(name, annotate(definition));
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
              recordDependencies(key, annotate(originalValue));
              return originalValue.apply(this, arguments);
            };

            if (isArray) {
              value[value.length - 1] = newValue;
            } else {
              name[value] = newValue;
            }
          });
        } else {
          recordDependencies(name, annotate(definition));
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
        [
          'watchers',
          'scopes'
        ].forEach(function (prop) {
          if (debug[prop][this.$id]) {
            delete debug[prop][this.$id];
          }
        }, this);
        return _destroy.apply(this, arguments);
      };


      // patch $new
      // ----------
      var _new = $delegate.__proto__.$new;
      $delegate.__proto__.$new = function () {

        var ret = _new.apply(this, arguments);
        if (ret.$root) {
          debug.rootScopes[ret.$root.$id] = ret.$root;
          emit.scopeChange(ret.$root.$id);
        }

        // create empty watchers array for this scope
        if (!debug.watchers[ret.$id]) {
          debug.watchers[ret.$id] = [];
        }

        debug.scopes[ret.$id] = ret;
        debug.scopes[this.$id] = this;

        return ret;
      };


      // patch $digest
      // -------------
      var _digest = $delegate.__proto__.$digest;
      $delegate.__proto__.$digest = function (fn) {
        var ret = _digest.apply(this, arguments);
        emit.modelChange(this.$id);
        return ret;
      };


      // patch $apply
      // ------------
      var _apply = $delegate.__proto__.$apply;
      $delegate.__proto__.$apply = function (fn) {
        var start = performance.now();
        var ret = _apply.apply(this, arguments);
        var end = performance.now();

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
};

// inject into the application context from the content script context

var inject = function () {
  var script = window.document.createElement('script');
  script.innerHTML = '(' + instument.toString() + '(window))';
  document.head.appendChild(script);

  // handle forwarding the events sent from the app context to the
  // background page context
  var eventProxyElement = document.getElementById('__ngDebugElement');

  if (eventProxyElement) {
    eventProxyElement.addEventListener('myCustomEvent', function () {
      var eventData = JSON.parse(eventProxyElement.innerText);
      chrome.extension.sendMessage(eventData);
    });
    document.removeEventListener('DOMContentLoaded', inject);
  }
};

// only inject if cookie is set
if (document.cookie.indexOf('__ngDebug=true') != -1) {
  document.addEventListener('DOMContentLoaded', inject);
}
