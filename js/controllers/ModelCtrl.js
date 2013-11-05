angular.module('panelApp').

controller('ModelCtrl', function ModelCtrl($scope, appContext, appModel) {

  $scope.rootScopeIds = appModel.getRootScopeIds();

  $scope.$on('rootScopeChange', function () {
    $scope.rootScopeIds = appModel.getRootScopeIds();
  });

  $scope.$on('refresh', reset);

  function reset () {
    $scope.modelsExpanded = true;
    $scope.watchExpanded = true;
    $scope.selectedRootScopeId = null;
  }

  reset();

  $scope.$watch('rootScopeIds', function (newVal, oldVal) {
    if ($scope.selectedRootScopeId == null) {
      if ($scope.rootScopeIds.some(function (id) {
        return $scope.selectedRootScopeId = id;
      })) {
        while ($scope.rootScopeIds.indexOf(undefined) !== -1) {
          $scope.rootScopeIds.splice($scope.rootScopeIds.indexOf(undefined), 1);
        }
      }
    }
  });

  $scope.$watch('selectedRootScopeId', function (newVal) {
    $scope.scopeTree = newVal ? appModel.getScopeTree(newVal) : undefined;
  });

  $scope.selectedScopeId = null;

  $scope.watching = {};

  $scope.$on('modelChange', function (ev, msg) {
    $scope.watching[msg.id] = $scope.watching[msg.id] || {};

    Object.keys(msg.changes).
      forEach(function (prop) {
        $scope.watching[msg.id][prop] = msg.changes[prop];
      });
  });

  $scope.$on('watcherChange', function (ev, msg) {
    $scope.watchers = msg.watchers;
  });

  $scope.select = function () {
    if (this.val && $scope.selectedScopeId === this.val.id) {
      return;
    }

    appModel.unwatchModel($scope.selectedScopeId);
    delete $scope.watching[$scope.selectedScopeId];

    $scope.selectedScopeId = this.val.id;
    appModel.watchModel($scope.selectedScopeId);
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
