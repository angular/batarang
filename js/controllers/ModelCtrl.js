angular.module('panelApp').controller('ModelCtrl', function ModelCtrl($scope, appContext, appModel) {

  $scope.roots = appModel.getRootScopes;
  $scope.selectedRoot = null;
  $scope.$watch('roots()', function (newVal, oldVal) {
    if (newVal.length > 0 && newVal.indexOf($scope.selectedRoot) === -1) {
      $scope.selectedRoot = newVal[0];
    }
  });
  
  $scope.model = null;

  $scope.scopeTree = function () {
    var select = $scope.selectedRoot;
    if (!select) {
      var rs = $scope.roots();
      if (rs.length === 0) {
        return;
      }
      select = rs[0];
    }
    return appModel.getScopeTree(select);
  };
  $scope.selectedScope = null;

  $scope.watching = {};

  appContext.watchModelChange(function (msg) {
    $scope.watching[msg.id] = $scope.watching[msg.id] || {};
    Object.keys(msg.changes).forEach(function (key) {
      $scope.watching[msg.id][key] = msg.changes[key];
    });
  });

  $scope.select = function () {
    appModel.unwatchModel($scope.selectedScope);
    $scope.selectedScope = this.val.id;
    appModel.watchModel($scope.selectedScope);
  };

  $scope.expand = function (id, path) {
    appModel.watchModel(id, path);
  };

  // expose methods of appContext
  [
    'addModelWatch',
    'removeModelWatch',
    'editModel',
    'enableInspector',
    'inspect'
  ].
  forEach(function (method) {
    $scope[method] = appContext[method];
  });

});
