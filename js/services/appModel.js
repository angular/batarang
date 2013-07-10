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

    getModel: function (id, path, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getSomeModel(args.id, args.path);
      }, {
        id: id,
        path: path
      }, callback);
    },

    setModel: function (id, path, value, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.setSomeModel(args.id, args.path, args.value);
      }, {
        id: id,
        path: path,
        value: value
      }, callback);
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
