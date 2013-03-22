// Service for running code in the context of the application being debugged
angular.module('panelApp').factory('appModel', function (chromeExtension, appContext) {

  var _scopeTreeCache = {},
    _scopeCache = {},
    _rootScopeCache = [];


  // clear cache on page refresh
  appContext.watchRefresh(function () {
    _scopeCache = {};
    _rootScopeCache = [];
  });

  return {
    getRootScopes: function (callback) {
      chromeExtension.eval(function (window) {
        if (!window.__ngDebug) {
          return;
        }
        return window.__ngDebug.getRootScopeIds();
      },
      function (data) {
        if (data) {
          _rootScopeCache = data;
        }
        callback(_rootScopeCache);
      });
    },

    // only runs callback if model has changed since last call
    getModel: function (id, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getModel(args.id);
      }, {id: id}, function (tree) {
        if (tree) {
          _scopeCache[id] = tree;
        }
        callback(_scopeCache[id]);
      });
    },

    getScopeTree: function (id, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getScopeTree(args.id);
      }, {id: id}, function (tree) {
        if (tree) {
          _scopeTreeCache[id] = tree;
        }
        callback(_scopeTreeCache[id]);
      });
    },

    enableInspector: function (argument) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.enable();
      });
    }
  };
});
