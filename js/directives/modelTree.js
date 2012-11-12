panelApp.directive('batModelTree', function ($compile) {

  // make toggle settings persist across $compile
  var modelState = {};
  var scopeState = {};

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
          '<a href ng-click="inspect()">Scope ({{val.id}})</a>' +
          '<span ng-show="val.children.length"> | <a href ng-click="scopeState[val.id] = !scopeState[val.id]">scopes</a></span>' +
          '<span ng-show="val.locals"> | <a href ng-click="modelState[val.id] = !modelState[val.id]">models</a></span>' +

          '<div ng-show="modelState[val.id]">' +
            '<bat-json-tree val="val.locals" ></bat-json-tree>' +
          '</div>' +
          
          '<div ng-hide="scopeState[val.id]">' +
            '<div ng-repeat="child in val.children">' +
              '<bat-model-tree val="child" inspect="inspect" edit="edit"></bat-model-tree>' +
            '</div>' +
          '</div>' +

        '</div>');

      var childScope = scope.$new();
      childScope.modelState = modelState;
      childScope.scopeState = scopeState;

      $compile(element.contents())(childScope);
    }
  };
});
