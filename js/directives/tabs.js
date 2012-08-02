panelApp.directive('batTabs', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    controller: function($scope, $element) {
      var panes = $scope.panes = [];

      $scope.select = function(pane) {
        angular.forEach(panes, function(pane) {
          pane.selected = false;
        });
        pane.selected = true;
      }

      this.addPane = function(pane) {
        if (panes.length === 0) {
          $scope.select(pane);
        }
        panes.push(pane);
      }
    },
    template:
      '<div class="container-fluid">' +
        '<div class="row-fluid">' +
          '<ul class="nav nav-tabs span12">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="row-fluid" ng-transclude></div>' +
      '</div>',
    replace: true
  };
}).
directive('batPane', function() {
  return {
    require: '^batTabs',
    restrict: 'E',
    transclude: true,
    scope: { title: '@' },
    link: function(scope, element, attrs, tabsCtrl) {
      tabsCtrl.addPane(scope);
    },
    template:
      '<div class="row-fluid" ng-show="selected" ng-transclude>' +
      '</div>',
    replace: true
  };
});
