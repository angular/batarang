// Service for running code in the context of the application being debugged
panelApp.factory('appModel', function (chromeExtension, appContext) {

  var _scopeCache = {},
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

    getModelTree: function (id, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getScopeTree(args.id);
      }, {id: id}, function (tree) {
        if (tree) {
          _scopeCache[id] = tree;
        }
        callback(_scopeCache[id]);
      });
    }
  };
});
