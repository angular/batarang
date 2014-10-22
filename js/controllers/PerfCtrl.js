angular.module('panelApp').controller('PerfCtrl', function PerfCtrl($scope, appContext, appPerf, appModel, appWatch, filesystem) {

  $scope.histogram = [];

  $scope.roots = [];

  $scope.min = 0;
  $scope.max = 100;

  $scope.clearHistogram = function () {
    appPerf.clear();
  };

  $scope.exportData = function () {
    filesystem.exportJSON('file.json', $scope.histogram);
  };

  $scope.$watch('log', function (newVal, oldVal) {
    appContext.setLog(newVal);
  });

  $scope.inspect = function () {
    appContext.inspect(this.val.id);
  };


  $scope.$on('poll', function () {
    appPerf.get(function (histogram) {

      $scope.$apply(function () {

        $scope.histogram = histogram;
      });
    });
    appModel.getRootScopes(function (rootScopes) {
      $scope.$apply(function () {
        $scope.roots = rootScopes;
        if ($scope.roots.length === 0) {
          $scope.selectedRoot = null;
        } else if (!$scope.selectedRoot) {
          $scope.selectedRoot = $scope.roots[0];
        }
      });
    });
    appWatch.getWatchTree($scope.selectedRoot, function (tree) {
      $scope.tree = tree;
    });
  });

});
