panelApp.controller('PerfCtrl', function PerfCtrl($scope, appContext, filesystem) {

  $scope.histogram = [];

  $scope.roots = [];

  $scope.min = 0;
  $scope.max = 100;

  $scope.clearHistogram = function () {
    appContext.clearHistogram();
  };

  $scope.exportData = function () {
    filesystem.exportJSON('file.json', $scope.histogram);
  };

  // TODO: remove this (newVal === oldVal ?)
  var first = true;

  appContext.getDebug(function (result) {
    $scope.enable = result;

    $scope.$watch('enable', function (newVal, oldVal) {
      // prevent refresh on initial pageload
      if (first) {
        first = false;
      } else {
        appContext.setDebug(newVal);
      }
    });
  });

  $scope.$watch('log', function (newVal, oldVal) {
    appContext.setLog(newVal);
  });

  $scope.inspect = function () {
    appContext.inspect(this.val.id);
  };

  var updateHistogram = function () {
    var info = appContext.getHistogram();
    if (!info) {
      return;
    }
    var total = 0;
    info.forEach(function (elt) {
      total += elt.time;
    });
    var i, elt, his;
    for (i = 0; (i < $scope.histogram.length && i < info.length); i++) {
      elt = info[i];
      his = $scope.histogram[i];
      his.time = elt.time.toPrecision(3);
      his.percent = (100 * elt.time / total).toPrecision(3);
    }
    for ( ; i < info.length; i++) {
      elt = info[i];
      elt.time = elt.time.toPrecision(3);
      elt.percent = (100 * elt.time / total).toPrecision(3);
      $scope.histogram.push(elt);
    }
    $scope.histogram.length = info.length;
  };

  var updateTree = function () {
    var roots = appContext.getListOfRoots();
    if (!roots) {
      return;
    }
    
    $scope.tree = appContext.getWatchTree($scope.selectedRoot);

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
  };
  appContext.watchPoll(updateTree);
  appContext.watchPoll(updateHistogram);
});
