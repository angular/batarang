angular.module('panelApp').controller('PerfCtrl', function PerfCtrl($scope, appContext, appPerf, appModel, appWatch, filesystem, composingQueue) {

  $scope.histogram = [];

  $scope.roots = [];

  $scope.min = 0;
  $scope.max = 100;

  $scope.clearHistogram = function () {
    appPerf.clear();
  };

  $scope.setMin = function (min) {
    $scope.min = parseFloat(min);
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

  $scope.$watch(function() {
    return composingQueue.queueLength
  }, function(newVal) {
    $scope.queueLength = newVal;
  });

  // Very simple merging of old and new trees - to reuse previously created objects and let ng-repeat reuse
  // previously created DOM elements
  function mergeTree (oldTree, newTree) {
    if (oldTree == newTree || (typeof oldTree === 'undefined')) return newTree;

    function mergeNodeWithChildren (oldNode, newNode) {
      if (oldNode.id == newNode.id) {
        oldNode.watchers = newNode.watchers;
        var oldChildren = oldNode.children, newChildren = newNode.children;
        if (newChildren.length < oldChildren.length) {
          oldChildren.splice(newChildren.length - 1, oldChildren.length);
        }
        var oldLength = oldChildren.length, newLength = newChildren.length;
        for (var idx = 0; idx < newLength; idx++) {
          if (idx < oldLength) {
            oldChildren[idx] = mergeNodeWithChildren(oldChildren[idx], newChildren[idx]);
          }
          else {
            oldChildren.push(newChildren[idx]);
          }
        }
        return oldNode;
      }
      else {
        return newNode;
      }
    }

    return mergeNodeWithChildren(oldTree, newTree);

  }

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
      $scope.tree = mergeTree($scope.tree, tree);
    });
  });

});
