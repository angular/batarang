panelApp.controller('OptionsCtrl', function OptionsCtrl($scope, appContext, appHighlight) {

  $scope.debugger = {
    scopes: false,
    bindings: false,
    app: false
  };

  ['scopes', 'bindings', 'app'].forEach(function (thing) {
    $scope.$watch('debugger.' + thing, function (val) {
      appHighlight[thing](val);
    });
  });

  appContext.getAngularVersion(function (version) {
    $scope.version = version;
  });
  /*
  appContext.getAngularSrc(function (status) {
    $scope.status = status;
  });
  */
});
