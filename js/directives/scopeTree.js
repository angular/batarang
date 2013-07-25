angular.module('panelApp').directive('batScopeTree', function ($compile) {

  // make toggle settings persist across $compile
  var modelState = {};
  var scopeState = {};

  var selected = null;


  var maybe = function (fn) {
    return function (val) {
      if (val === (void 0)) {
        return;
      }
      return fn.apply(this, arguments);
    };
  };

  var repeaterPredicate = function (child) {
    return child.name && child.name['ng-repeat'];
  };

  var notRepeatedPredicate = function (child) {
    return !repeaterPredicate(child);
  };

  var name = function (name) {
    if (!name) {
      return '???';
    }
    if (name['ng-repeat']) {
      return name.lhs;
    }
    var n = '';
    [
      'ng-app',
      'ng-controller'
    ].
    forEach(function (prop) {
      if (name[prop]) {
        n += prop + '="' + name[prop] + '"';
      }
    });
    if (n.length === 0) {
      n += name.tag;
      if (name.classes.length > 0) {
        n += '.' + name.classes.join('.');
      }
    }
    return n;
  };

  var template =
    '<ol class="children expanded">' +
      '<span ng-click="select()" ng-class="{selected: selectedScope == val}">' +
        '<span class="webkit-html-tag">{{c}}</span> ' +
        '<span class="webkit-html-attribute">{{name(val.name)}}</span> ' +
        '<span class="webkit-html-tag">{{xc}}</span>' +
      '</span>' +
      '<div ng-repeat="(repeat, children) in grouped">' +
        '<span class="webkit-html-comment">&lt;!-- {{repeat}} --&gt;</span>' +
          '<bat-scope-tree ' +
            'ng-repeat="child in children" ' +
            'val="child" ' +
            'inspect="inspect" ' +
            'select="select" ' +
            'selected-scope-id="selectedScope.id">' +
          '</bat-scope-tree>' +
      '</div>' +
      '<bat-scope-tree ' +
        'ng-repeat="child in ungrouped" ' +
        'val="child" ' +
        'inspect="inspect" ' +
        'select="select" ' +
        'selected-scope-id="selectedScope.id">' +
      '</bat-scope-tree>' +
    '</ol>';

  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=',
      select: '=',
      selectedScopeId: '=',
      inspect: '='
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898
      element.append(template);

      scope.name = name;
      scope.c = '{{';
      scope.xc = '}}';

      var childScope = scope.$new();

      childScope.ungrouped = [];
      childScope.grouped = {};

      childScope.$watch('val.children', function (newChildren) {
        if (!newChildren) {
          return;
        }
        var grouped = childScope.grouped;
        newChildren.
          filter(repeaterPredicate).
          forEach(function (child) {
            var repOver = child.name['ng-repeat'];
            grouped[repOver] = grouped[repOver] || [];
            grouped[repOver].push(child);
          }, {});

        childScope.ungrouped = newChildren.filter(notRepeatedPredicate);
      });


      childScope.select = scope.select;
      //childScope.selectedScope = scope.selectedScope;
      childScope.inspect = scope.inspect;

      $compile(element.contents())(childScope);
    }
  };
});
