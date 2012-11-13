panelApp.controller('OptionsCtrl', function OptionsCtrl($scope, appInfo, appHighlight) {

  $scope.debugger = {
    scopes: false,
    bindings: false,
    app: false
  };

  ['scopes', 'bindings', 'app'].forEach(function (thing) {
    $scope.$watch('debugger.' + thing, function (val) {
      appHighlight[thing](val);
    });
  });

  appInfo.getAngularVersion(function (version) {
    $scope.$apply(function () {
      $scope.version = version;
    });
  });

  appInfo.getAngularSrc(function (status) {
    $scope.$apply(function () {
      switch(status) {
        case 'good':
          $scope.status = 'success';
          $scope.explain = 'CDN detected';
          break;
        case 'bad':
          $scope.status = 'important';
          $scope.explain = 'You are using the old code.angularjs.org links, which are slow! You should switch to the new CDN link. See <a target="_blank" href="http://blog.angularjs.org/2012/07/angularjs-now-hosted-on-google-cdn.html">this post</a> for more info';
          break;
        case 'info':
          $scope.status = 'info';
          $scope.explain = 'You may want to use the CDN-hosted AngularJS files. See <a target="_blank" href="http://blog.angularjs.org/2012/07/angularjs-now-hosted-on-google-cdn.html">this post</a> for more info';
          break;
      }
    });
  });

});
