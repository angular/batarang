panelApp.controller('PanelCtrl', function PanelCtrl($scope, appContext) {

  // TODO: remove this (newVal === oldVal ?)
  var first = true;

  appContext.getDebug(function (result) {
    $scope.enable = result;

    $scope.$watch('enable', function (newVal, oldVal) {
      // prevent refresh on initial pageload
      if (first) {
        first = false;
      } else {
        appContext.setDebug(newVal);
      }
    });
  });

});
