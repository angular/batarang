
panelApp.controller('ModelCtrl', function ModelCtrl($scope, appContext, appModel, poll) {

  $scope.inspect = function () {
    appContext.inspect(this.val.id);
  };

  // TODO: fix this
  $scope.edit = function () {
    appContext.executeOnScope(this.val.id, function (scope, elt, args) {
      scope[args.name] = args.value;
      scope.$apply();
    }, {
      name: this.key,
      value: JSON.parse(this.item)
    });
  };

  $scope.roots = [];
  $scope.selectedRoot = null;

  $scope.$on('poll', function () {
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
    appModel.getModelTree($scope.selectedRoot, function (tree) {
      $scope.$apply(function () {
        $scope.tree = tree;
      });
    });
  });

});
