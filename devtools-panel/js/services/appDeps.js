// Service for retrieving and caching application dependencies
angular.module('panelApp').

factory('appDeps', function (chromeExtension, $rootScope) {

  var _depsCache = [];

  // clear cache on page refresh
  $rootScope.$on('refresh', function () {
    _depsCache = [];
  });

  return {
    get: function (callback) {
      chromeExtension.eval(function (window) {
        if (window.__ngDebug) {
          return window.__ngDebug.getDeps();
        }
      },
      function (data) {
        if (data) {
          _depsCache = data;
        }
        callback(_depsCache);
      });
    }
  };
});
