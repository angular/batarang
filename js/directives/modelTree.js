// model tree
panelApp.directive('batModelTree', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=',
      edit: '=',
      inspect: '='
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898
      element.append(
        '<div class="scope-branch">' +
          '<a href ng-click="inspect()">Scope ({{val.id}})</a> | ' +
          '<a href ng-click="hideScopes = !hideScopes">scopes</a> | ' +
          '<a href ng-click="showModels = !showModels">models</a>' +

          '<div ng-show="showModels">' +
            '<bat-json-tree val="val.locals" ></bat-json-tree>' +
          '</div>' +
          
          '<div ng-hide="hideScopes">' +
            '<div ng-repeat="child in val.children">' +
              '<bat-model-tree val="child" inspect="inspect" edit="edit"></bat-model-tree>' +
            '</div>' +
          '</div>' +

        '</div>');

      $compile(element.contents())(scope.$new());
    }
  };
});
