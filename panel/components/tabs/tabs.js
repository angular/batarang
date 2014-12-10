angular.module('batarang.tabs', []).

directive('batTabs', function ($compile, $templateCache, $http, inspectedApp) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: 'components/tabs/tabs.html',

    replace: true,
    controller: function ($scope) {
      var panes = $scope.panes = [];

      this.addPane = function(pane) {
        panes.push(pane);
      };

      $scope.$watch('enabled', function (newVal) {
        if (newVal === !!newVal) {
          inspectedApp.enableInstrumentation(newVal);
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
