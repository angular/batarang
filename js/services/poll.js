// Service for broadcasting poll events
panelApp.factory('poll', function ($rootScope) {

  setInterval(function () {
    $rootScope.$broadcast('poll');
  }, 500);

  return {
    setInterval: function (int) {}
  };
});
