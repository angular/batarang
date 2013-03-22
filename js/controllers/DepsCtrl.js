angular.module('panelApp').controller('DepsCtrl', function DepsCtrl($scope, appDeps) {
  $scope.$on('poll', function () {
    appDeps.get(function (deps) {
      $scope.$apply(function () {
        $scope.deps = deps;
      });
    });
  });
});
