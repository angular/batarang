'use strict';

angular.module('batarang.app.scopes', []).
  controller('ScopesController', ['$scope', 'inspectedApp', ScopesController]);

function ScopesController($scope, inspectedApp) {
  $scope.scopes = inspectedApp.scopes;

  $scope.watch = inspectedApp.watch;
  $scope.inspect = function (path) {
    inspectedApp.watch($scope.inspectedScope, path);
  };
  $scope.assign = function (path, value) {
    inspectedApp.assign($scope.inspectedScope, path, value);
  };

  $scope.inspectedScope = null;

  $scope.$on('refresh', function () {
    $scope.inspectedScope = null;
  });

  // expand models the fist time we inspect a scope
  var cancelWatch = $scope.$watch('inspectedScope', function (newScope) {
    if (newScope) {
      $scope.modelsExpanded = true;
      cancelWatch();
    }
  });


  $scope.$on('inspected-scope:change', function (ev, data) {
    inspectScope(data.id);
  });

  function inspectScope(scopeId) {
    $scope.watch(scopeId);
    $scope.inspectedScope = scopeId;
    inspectedApp.inspectScope(scopeId);
  };

}
