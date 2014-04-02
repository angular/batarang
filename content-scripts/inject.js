// content-scripts/inject.js
// this file is run from the content script context (separate JS VM from the app, but same DOM)
// but injects an 'instrumentation' script tag into the app context
// confusing, right?

var instument = function instument (window) {
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
    function areWeThereYet (ev) {
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
    }
    document.addEventListener('DOMNodeInserted', areWeThereYet);
    return;
  }

  // do not patch twice
  if (window.__ngDebug) {
    return;
  }


  // Helpers
  // =======

  var throttle        = require('./lib/throttle.js');
  var summarizeObject = require('./lib/summarizeObject.js');
  var niceNames       = require('./lib/niceNames.js');

  // helper to extract dependencies from function arguments
  // not all versions of AngularJS expose annotate
  var annotate = angular.injector().annotate || require('./lib/annotate.js');

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
    data.appId = instrumentedAppId;
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

    // whether or not to emit profile data
    profiling: false,

    // map of $ids --> [] array of things being watched
    modelWatchers: {},
    // map of $id + watcher --> value
    modelWatchersState: {},

    // map of $ids --> refs to $rootScope objects
    rootScopes: {},

    deps: []
  };

  var instrumentedAppId = window.location.host + '~' + Date.now() + '~' + Math.random();


  // Utils
  // =====

  var getScopeTree = function (id) {

    var names = niceNames();

    var traverse = function (sc) {
      var tree = {
        id: sc.$id,
        name: names[sc.$id],
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

    scopeDeleted: function (id) {
      fireCustomEvent({
        action: 'scopeDeleted',
        id: id
      });
    },

    watcherChange: throttle(function (id) {
      if (debug.modelWatchers[id]) {
        fireCustomEvent({
          action: 'watcherChange',
          id: id,
          watchers: debug.watchers[id]
        });
      }
    }, 50),

    watchPerfChange: throttle(function (str) {
      if (debug.profiling) {
        fireCustomEvent({
          action: 'watchPerfChange',
          watcher: str,
          value: debug.watchPerf[str]
        });
      }
    }, 50),

    applyPerfChange: throttle(function (str) {
      if (debug.profiling) {
        fireCustomEvent({
          action: 'applyPerfChange',
          watcher: str,
          value: debug.applyPerf[str]
        });
      }
    }, 50),

    // might be worth limiting
    watchPerf: function () {
      throw new Error('Implement me :c');
    }
  };


  // Public API
  // ==========

  var api = window.__ngDebug = {

    profiling: function (setting) {
      debug.profiling = setting;
    },

    getDeps: function () {
      return debug.deps;
    },

    getRootScopeIds: function () {
      return Object.keys(debug.rootScopes);
    },

    getAppId: function () {
      return instrumentedAppId;
    },

    fireCustomEvent : fireCustomEvent,
    niceNames       : niceNames,
    getModel        : summarizeObject,

    setSomeModel: function (id, path, value) {
      debug.scope[id].$apply(path + '=' + JSON.stringify(value));
    },

    watchModel: function (id, path) {
      debug.modelWatchers[id] = debug.modelWatchers[id] || {};
      debug.modelWatchers[id][path || ''] = true;
      if (!path || path === '') {
        debug.modelWatchersState = {};
      }
      emit.modelChange(id);
      emit.watcherChange(id);
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
        }
      });
    }
  };

  var recordDependencies = function (providerName, dependencies) {
    debug.deps.push({
      name: providerName,
      imports: dependencies
    });
  };

  require('./lib/decorate.js');

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
