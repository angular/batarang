panelApp.controller('DepsCtrl', function DepsCtrl($scope, appContext) {
  //$scope.deps = appContext.getDeps();
  $scope.deps = [{
    name: 'foo',
    size: 10,
    children: []
  }];
});
