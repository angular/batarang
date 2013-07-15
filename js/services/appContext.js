// Service for running code in the context of the application being debugged
angular.module('panelApp').factory('appContext', function (chromeExtension, $rootScope) {

  var port = chrome.extension.connect();

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

    // Registering events
    // ------------------

    // TODO: depreciate this; only poll from now on?
    // There are some cases where you need to gather data on a once-per-bootstrap basis, for
    // instance getting the version of AngularJS

    // TODO: move to chromeExtension?
    watchRefresh: function (cb) {
      port.postMessage({
        action: 'register',
        inspectedTabId: chrome.devtools.inspectedWindow.tabId
      });
      port.onMessage.addListener(function (msg) {
        if (msg === 'refresh') {
          cb();
        }
      });
    },

    // TODO: move to chromeExtension?
    watchModelChange: function (cb) {
      port.onMessage.addListener(function (msg) {
        if (msg.action === 'modelChange') {
          $rootScope.$apply(function () {
            cb(msg);
          });
        }
      });
    },

    watchScopeChange: function (cb) {
      port.onMessage.addListener(function (msg) {
        if (msg.action === 'scopeChange') {
          $rootScope.$apply(function () {
            cb(msg);
          });
        }
      });
    }

  };
});
