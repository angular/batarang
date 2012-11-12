panelApp.directive('batTabs', function ($compile, $templateCache, $http) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    template:
      '<div class="container-fluid">' +
        '<div class="row-fluid">' +
          '<ul class="nav nav-tabs span12">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="row-fluid bat-tabs-inside"></div>' +
        '<div ng-transclude></div>' +
      '</div>',
    replace: true,
    controller: function ($scope, $element) {
      var panes = $scope.panes = [];

      this.addPane = function(pane) {
        panes.push(pane);
      };
    },
    link: function (scope, element, attr) {

      var lastScope;
      var insideElt = angular.element(element[0].getElementsByClassName('bat-tabs-inside')[0]);

      function destroyLastScope() {
        if (lastScope) {
          lastScope.$destroy();
          lastScope = null;
        }
      }

      scope.select = function (pane) {
        $http.get(pane.src, { cache: $templateCache }).
          then(function (response) {
            var template = response.data;
            insideElt.html(template);
            destroyLastScope();

            var link = $compile(insideElt.contents());
            lastScope = scope.$new();
            link(lastScope);
          });

        angular.forEach(scope.panes, function(pane) {
          pane.selected = false;
        });
        pane.selected = true;
      };

      scope.select(scope.panes[0]);
    }

  };
}).
directive('batPane', function() {
  return {
    require: '^batTabs',
    restrict: 'E',
    scope: {
      title: '@',
      src: '@'
    },
    link: function (scope, element, attrs, tabsCtrl) {
      tabsCtrl.addPane({
        title: attrs.title,
        src: attrs.src
      });
    }
  };
});
