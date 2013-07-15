angular.module('panelApp').directive('batTabs', function ($compile, $templateCache, $http) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    template:
      '<div class="split-view split-view-vertical visible">' +

        '<div ' +
          'class="split-view-contents ' +
            'scroll-target ' +
            'split-view-contents-first ' +
            'split-view-sidebar ' +
            'sidebar" ' +
          'style="width: 200px;">' +
            '<ol class="sidebar-tree" tabindex="0">' +
              '<li class="sidebar-tree-item ' +
                'profile-launcher-view-tree-item">' +
                  '<img class="icon">' +
                  '<div class="status"></div>' +
                  '<div class="titles no-subtitle">' +
                    '<span class="title">' +
                      'Enable <input type="checkbox" ng-model="enable">' +
                    '</span>' +
                    '<span class="subtitle"></span>' +
                  '</div>' +
              '</li>' +
              '<li ng-repeat="pane in panes" ' +
                'ng-click="select(pane)" ' +
                'class="sidebar-tree-item ' +
                'profile-launcher-view-tree-item" ' +
                'ng-class="{selected:pane.selected}">' +

                  '<img class="icon">' +
                  '<div class="status"></div>' +
                  '<div class="titles no-subtitle">' +
                    '<span class="title">{{pane.title}}</span>' +
                    '<span class="subtitle"></span>' +
                  '</div>' +

              '</li>' +
            '</ol>' +
        '</div>' +

        '<div ' +
          'class="split-view-contents ' +
            'scroll-target ' +
            'split-view-contents-second ' +
            'outline-disclosure ' +
            'bat-tabs-inside" ' +
          'style="left: 200px;">' +
        '</div>' +

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
