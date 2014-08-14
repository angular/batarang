angular.module('panelApp').controller('ModelCtrl', function ModelCtrl($scope, appContext, appModel) {

  $scope.inspect = function () {
    appContext.inspect(this.val.id);
  };
  $scope.select = function () {
    $scope.selectedScope = this.val.id;
  };

  // TODO: fix this
  $scope.edit = function () {
    appContext.executeOnScope(this.val.id, function (scope, elt, args) {
      scope.$apply(function () {
        scope[args.name] = args.value;
      });
    }, {
      name: this.key,
      value: JSON.parse(this.item)
    });
  };

  $scope.roots = [];
  $scope.model = null;

  $scope.selectedRoot = null;
  $scope.selectedScope = null;

  $scope.enableInspector = appModel.enableInspector;

  $scope.inspectElement = function() {
    appContext.inspect($scope.selectedScope);
  };

  $scope.$on('poll', function () {

    // get the list of root scopes
    appModel.getRootScopes(function (rootScopes) {
      $scope.$apply(function () {
        $scope.roots = rootScopes;
        if ($scope.roots.length === 0) {
          $scope.selectedRoot = null;
        } else if (!$scope.selectedRoot) {
          $scope.selectedRoot = $scope.roots[0];
        }
        if ($scope.selectedRoot && !$scope.selectedScope) {
          $scope.selectedScope = $scope.selectedRoot;
        }
      });
    });

    // get scope tree
    if ($scope.selectedRoot) {
      appModel.getScopeTree($scope.selectedRoot, function (tree) {
        $scope.$apply(function () {
          $scope.tree = tree;
        });
      });
    }

    // get models on the selected scope
    if ($scope.selectedScope) {
      appModel.getModel($scope.selectedScope, function (model) {
        $scope.$apply(function () {
          $scope.model = model;
        });
      });
    }
  });


});
