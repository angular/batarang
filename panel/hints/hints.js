'use strict';

angular.module('batarang.app.hint', []).
  controller('HintController', ['$scope', 'inspectedApp', HintController]);

function HintController($scope, inspectedApp) {
  $scope.$watch(function () {
    return inspectedApp.hints.length;
  }, function () {
    var newHints = inspectedApp.hints;
    $scope.groupedHints = {};
    newHints.forEach(function (hint) {
      var moduleName = hint.module || 'Hints';
      var category = hint.category || moduleName;
      if (!$scope.groupedHints[moduleName]) {
        $scope.groupedHints[moduleName] = {};
      }
      if (!$scope.groupedHints[moduleName][category]) {
        $scope.groupedHints[moduleName][category] = [];
      }
      $scope.groupedHints[moduleName][category].push(hint);
    });
  });
}
