// Broadcast poll events
angular.module('panelApp', []).run(function ($rootScope) {
  setInterval(function () {
    $rootScope.$broadcast('poll');
  }, 500);
});
