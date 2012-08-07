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
          '<a href ng-click="showState = !showState">toggle</a>' +
          '<div ng-hide="showState">' +
            '<ul>' +
              '<li ng-repeat="(key, item) in val.locals">' +
                '{{key}}' +
                '<input ng-show="item" ng-model="item" ng-change="edit()()">' +
              '</li>' +
            '</ul>' +
            '<div ng-repeat="child in val.children">' +
              '<bat-model-tree val="child" inspect="inspect" edit="edit"></bat-model-tree>' +
            '</div>' +
          '</div>' +
        '</div>');

      $compile(element.contents())(scope.$new());
    }
  };
});
