
panelApp.controller('ModelCtrl', function ModelCtrl($scope, appContext) {

  $scope.inspect = function () {
    appContext.inspect(this.val.id);
  };

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


  var updateTree = function () {
    var roots = appContext.getListOfRoots();
    if (!roots) {
      return;
    }
    
    $scope.tree = appContext.getModelTree($scope.selectedRoot);

    $scope.roots.length = roots.length;
    roots.forEach(function (item, i) {
      $scope.roots[i] = {
        label: item,
        value: item
      };
    });
    if (roots.length === 0) {
      $scope.selectedRoot = null;
    } else if (!$scope.selectedRoot) {
      $scope.selectedRoot = $scope.roots[0].value;
    }
    $scope.$apply();
  };

  appContext.watchPoll(updateTree);
});
