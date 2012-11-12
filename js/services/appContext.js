// Service for running code in the context of the application being debugged
panelApp.factory('appContext', function (chromeExtension) {

  // Private vars
  // ============

  var _debugCache = {},
    _scopeCache = {},
    _watchCache = {},
    _pollListeners = [],
    _pollInterval = 500;


  // TODO: make this private and have it automatically poll?
  var getDebugData = function (callback) {
    chromeExtension.eval(function (window) {
      if (!window.__ngDebug) {
        return {};
      }
      return {
        deps: window.__ngDebug.getDeps(),
        watchPerf: window.__ngDebug.getWatchPerf(),
        roots: window.__ngDebug.getRootScopeIds()
      };
    },
    function (data) {
      if (data) {
        _debugCache = data;
        _incomingHistogramData = data.watchPerf;
      }
      _pollListeners.forEach(function (fn) {
        fn();
      });

      // poll every 500 ms
      setTimeout(getDebugData, _pollInterval);
    });
  };
  getDebugData();


  var _histogramCache = [];
  var _incomingHistogramData = [];
  var _watchNameToPerf = {};
  var _totalCache = 0;

  var processHistogram = function () {
    if (_incomingHistogramData.length === 0) {
      return;
    }

    _incomingHistogramData.forEach(function (info) {
      _totalCache += info.time;

      if (_watchNameToPerf[info.name]) {
        _watchNameToPerf[info.name].time += info.time;
      } else {
        _watchNameToPerf[info.name] = info;
        _histogramCache.push(info);
      }
    });

    // recalculate all percentages
    _histogramCache.forEach(function (item) {
      item.percent = (100 * item.time / _totalCache).toPrecision(3);
    });

    // clear the incoming queue
    _incomingHistogramData = [];
  };

  // Public API
  // ==========
  return {
    // TODO: Fix selection of scope
    // https://github.com/angular/angularjs-batarang/issues/6
    executeOnScope: function(scopeId, fn, args, cb) {
      if (typeof args === 'function') {
        cb = args;
        args = {};
      } else if (!args) {
        args = {};
      }
      args.scopeId = scopeId;
      args.fn = fn.toString();

      chromeExtension.eval("function (window, args) {" +
        "var elts = window.document.getElementsByClassName('ng-scope'), i;" +
        "for (i = 0; i < elts.length; i++) {" +
          "(function (elt) {" +
            "var $scope = window.angular.element(elt).scope();" +
            "if ($scope.$id === args.scopeId) {" +
              "(" + args.fn + "($scope, elt, args));" +
            "}" +
          "}(elts[i]));" +
        "}" +
      "}", args, cb);
    },

    // Getters
    // -------

    getHistogram: function () {
      processHistogram();
      return _histogramCache;
    },

    getListOfRoots: function () {
      return _debugCache.roots;
    },

    getModelTree: function (id) {
      chromeExtension.eval("function (window, args) {" +
        "return window.__ngDebug.getScopeTree(args.id);" +
      "}", {id: id}, function (tree) {
        if (tree) {
          _scopeCache[id] = tree;
        }
      });
      return _scopeCache[id];
    },

    getWatchTree: function (id) {
      chromeExtension.eval("function (window, args) {" +
        "return window.__ngDebug.getWatchTree(args.id);" +
      "}", {id: id}, function (tree) {
        if (tree) {
          _watchCache[id] = tree;
        }
      });
      return _watchCache[id];
    },

    getDeps: function () {
      return _debugCache.deps;
    },

    getAngularVersion: function (cb) {
      chromeExtension.eval(function () {
        return window.angular.version.full +
          ' ' +
          window.angular.version.codeName;
      }, cb);
    },

    getAngularSrc: function (cb) {
      chromeExtension.eval("function (window, args) {" +
        "if (!window.angular) {" +
          "return 'info';" +
        "}" +
        "var elts = window.angular.element('script[src]');" +
        "var re = /\/angular(-\d+(\.(\d+))+(rc)?)?(\.min)?\.js$/;" +
        "var elt;" +
        "for (i = 0; i < elts.length; i++) {" +
          "elt = elts[i];" +
          "if (re.exec(elt.src)) {" +
            "if (elt.src.indexOf('code.angularjs.org') !== -1) {" +
              "return 'error';" +
            "} else if (elt.src.indexOf('ajax.googleapis.com') !== -1) {" +
              "return 'good';" +
            "} else {" +
              "return 'info';" +
            "}" +
          "}" +
        "}" +
        "return 'info';" +
      "}", cb);
    },

    // Actions
    // -------

    clearHistogram: function (cb) {
      chromeExtension.eval(function (window) {
        window.__ngDebug.watchPerf = {};
      }, cb);
    },
    
    refresh: function (cb) {
      chromeExtension.eval(function (window) {
        window.document.location.reload();
      }, cb);
    },

    inspect: function (scopeId) {
      this.executeOnScope(scopeId, function (scope, elt) {
        inspect(elt);
      });
    },

    // Settings
    // --------

    // takes a bool
    setDebug: function (setting) {
      if (setting) {
        chromeExtension.eval(function (window) {
          window.document.cookie = '__ngDebug=true;';
          window.document.location.reload();
        });
      } else {
        chromeExtension.eval(function (window) {
          window.document.cookie = '__ngDebug=false;';
          window.document.location.reload();
        });
      }
    },

    getDebug: function (cb) {
      chromeExtension.eval(function (window) {
        return document.cookie.indexOf('__ngDebug=true') !== -1;
      }, cb);
    },

    // takes a bool
    setLog: function (setting) {
      setting = !!setting;
      chromeExtension.eval('function (window) {' +
        'window.__ngDebug.log = ' + setting.toString() + ';' +
      '}');
    },

    // takes # of milliseconds
    setPollInterval: function (setting) {
      _pollInterval = setting;
    },

    // Registering events
    // ------------------

    // TODO: depreciate this; only poll from now on?
    // There are some cases where you need to gather data on a once-per-bootstrap basis, for
    // instance getting the version of AngularJS
    
    // TODO: move to chromeExtension?
    watchRefresh: function (cb) {
      var port = chrome.extension.connect();
      port.postMessage({
        action: 'register',
        inspectedTabId: chrome.devtools.inspectedWindow.tabId
      });
      port.onMessage.addListener(function(msg) {
        if (msg === 'refresh') {
          cb();
        }
      });
      port.onDisconnect.addListener(function (a) {
        console.log(a);
      });
    },

    watchPoll: function (fn) {
      _pollListeners.push(fn);
    }

  };
});
