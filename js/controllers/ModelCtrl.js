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

  appContext.watchModelChange(function (msg) {
    console.log(msg);
  });


});
