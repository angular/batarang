angular.module('panelApp').directive('batScopeTree', function ($compile) {

  // make toggle settings persist across $compile
  var modelState = {};
  var scopeState = {};

  var selected = null;

  var template =
    '<div class="scope-branch">' +
      '<a href ng-click="inspect()">&lt;</a> ' +
      '<a href ng-click="select()" ng-class="{selected: selectedScope == val.id}">Scope ({{val.id}})</a>' +
      '<div ng-repeat="child in val.children">' +
        '<bat-scope-tree ' +
          'val="child" ' +
          'inspect="inspect" ' +
          'select="select" ' +
          'selected-scope="selectedScope">' +
        '</bat-scope-tree>' +
      '</div>' +
    '</div>';

  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=',
      select: '=',
      selectedScope: '=',
      inspect: '='
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898
      element.append(template);

      var childScope = scope.$new();

      childScope.select = scope.select;
      //childScope.selectedScope = scope.selectedScope;
      childScope.inspect = scope.inspect;

      $compile(element.contents())(childScope);
    }
  };
});
