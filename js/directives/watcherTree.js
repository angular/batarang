// watchers tree
panelApp.directive('batWatcherTree', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=val',
      inspect: '=inspect'
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898
      element.append(
        '<div class="scope-branch">' +
          '<a href ng-click="inspect()">Scope ({{val.id}})</a> | ' +
          '<a href ng-click="showState = !showState">toggle</a>' +
          '<div ng-hide="showState">' +
            '<ul>' +
              '<li ng-repeat="item in val.watchers">' +
                '<a href ng-hide="item.split(\'\n\').length < 2" ng-click="showState = !showState">toggle</a> ' +
                '<code ng-hide="showState && item.split(\'\n\').length > 1">{{item | first}}</code>' +
                '<pre ng-hide="!showState || item.split(\'\n\').length < 2">' +
                  '{{item}}' +
                '</pre>' +
              '</li>' +
            '</ul>' +
            '<div ng-repeat="child in val.children">' +
              '<bat-watcher-tree val="child" inspect="inspect"></bat-watcher-tree>' +
            '</div>' +
          '</div>' +
        '</div>');

      $compile(element.contents())(scope.$new());
    }
  };
});
