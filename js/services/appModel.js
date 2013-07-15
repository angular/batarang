// Service for running code in the context of the application being debugged
angular.module('panelApp').factory('appModel', function (chromeExtension, appContext) {

  var _scopeTreeCache = {},
    _scopeCache = {},
    _rootScopeCache = [];


  // clear cache on page refresh
  appContext.watchRefresh(function () {
    _scopeCache = {};
    _scopeTreeCache = {};
    _rootScopeCache = [];
  });

  appContext.watchScopeChange(function (data) {
    if (_rootScopeCache.indexOf(data.id) === -1) {
      _rootScopeCache.push(data.id);
    }
    _scopeTreeCache[data.id] = data.scope;
  });

  return {
    getRootScopes: function () {
      return _rootScopeCache;
    },

    getModel: function (id, path, callback) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getSomeModel(args.id, args.path);
      }, {
        id: id,
        path: path
      }, callback);
    },

    setModel: function (id, path, value, callback) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.setSomeModel(args.id, args.path, args.value);
      }, {
        id: id,
        path: path,
        value: value
      }, callback);
    },

    watchModel: function (id, path) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.watchModel(args.id, args.path);
      }, {
        id: id,
        path: path
      });
    },

    unwatchModel: function (id, path) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.unwatchModel(args.id, args.path);
      }, {
        id: id,
        path: path
      });
    },

    getScopeTree: function (id) {
      return _scopeTreeCache[id];
    },

    enableInspector: function (argument) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.enable();
      });
    }
  };
});
