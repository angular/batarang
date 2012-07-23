panelApp.controller('DepsCtrl', function DepsCtrl($scope, appContext) {
  appContext.watchPoll(function () {
    $scope.deps = appContext.getDeps();
  });
  $scope.deps = appContext.getDeps();
});
