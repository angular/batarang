// Service for running code in the context of the application being debugged
angular.module('panelApp').factory('appContext', function (chromeExtension, $rootScope) {

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
        // prevent a refresh if debugging is already enabled
        chromeExtension.eval(function (window) {
          if (document.cookie.indexOf('__ngDebug=true') === -1) {
            window.document.cookie = '__ngDebug=true;';
            window.document.location.reload();
          }
        });
      } else {
        chromeExtension.eval(function (window) {
          window.document.cookie = '__ngDebug=false;';
          window.document.location.reload();
        });
      }
    },

    getAppId: getAppId,

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
    }
  };

  function getAppId (cb) {
    chromeExtension.eval(function (window) {
      return window.__ngDebug.getAppId();
    }, cb);
  }

});
