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

            '<li>' +
              '<div class="bat-nav-check">' +
                '<input type="checkbox" ng-model="enable" id="enable-instrumentation"> ' +
                'Enable' +
              '</div>' +
            '</li>' +

          '</ul>' +
        '</div>' +
        '<div class="row-fluid bat-tabs-inside"></div>' +
        '<div ng-transclude></div>' +
      '</div>',
    replace: true,
    controller: function ($scope, appContext) {
      var panes = $scope.panes = [];

      this.addPane = function(pane) {
        panes.push(pane);
      };

      appContext.getDebug(function (result) {
        $scope.enable = result;

        $scope.$watch('enable', function (newVal, oldVal) {
          appContext.setDebug(newVal);
          if (!newVal) {
            $scope.lastPane = $scope.currentPane;
            $scope.select($scope.panes[$scope.panes.length - 1]);
          } else {
            $scope.select($scope.lastPane);
          }
        });

        if (result) {
          $scope.select($scope.panes[0]);
        }
      });
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
        if (!scope.enable && pane !== scope.panes[scope.panes.length - 1]) {
          return;
        }
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
        scope.currentPane = pane;
      };

      scope.lastPane = scope.panes[0];
      scope.select(scope.panes[scope.panes.length - 1]);
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
