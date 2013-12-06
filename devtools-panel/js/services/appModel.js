// Service for running code in the context of the application being debugged
angular.module('panelApp').

factory('appModel', function ($rootScope, chromeExtension) {

  var _scopeTreeCache = {},
    _scopeCache = {},
    _rootScopeIdCache = [];

  $rootScope.$on('referesh', function clearCaches () {
    emptyObject(_scopeCache);
    emptyObject(_scopeTreeCache);
    emptyArray(_rootScopeIdCache);
  });

  function emptyObject (obj) {
    for (prop in obj) {
      if (obj.hasOwnProperty(obj)) {
        delete obj[prop];
      }
    }
  }

  function emptyArray (arr) {
    arr.splice(0, arr.length);
  }

  $rootScope.$on('scopeChange', function (ev, data) {
    if (_rootScopeIdCache.indexOf(data.id) === -1) {
      _rootScopeIdCache.push(data.id);
      $rootScope.$broadcast('rootScopeChange', _rootScopeIdCache);
    }
    _scopeTreeCache[data.id] = data.scope;
  });

  $rootScope.$on('scopeDeleted', function (ev, data) {
    _rootScopeIdCache.splice(_rootScopeIdCache.indexOf(data.id), 1);
    $rootScope.$broadcast('rootScopeChange', _rootScopeIdCache);
    delete _scopeTreeCache[data.id];
  });

  return {
    getRootScopeIds: function () {
      return _rootScopeIdCache.slice();
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
