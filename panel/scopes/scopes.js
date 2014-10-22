'use strict';

angular.module('batarang.app.scopes', []).
  controller('ScopesController', ['$scope', 'inspectedApp', ScopesController]);

function ScopesController($scope, inspectedApp) {
  $scope.scopes = inspectedApp.scopes;

  $scope.watch = inspectedApp.watch;

  $scope.inspectedScope = null;

  $scope.$on('inspected-scope:change', function (ev, data) {
    inspectScope(data.id);
  });

  function inspectScope(scopeId) {
    $scope.watch(scopeId);
    $scope.inspectedScope = scopeId;
  };

}
