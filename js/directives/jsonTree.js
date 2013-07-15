angular.module('panelApp').directive('batJsonTree', function($compile, appModel) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      scopeId: '=',
      val: '=',
      expand: '&',
      close: '&'
    },
    link: function (scope, element, attrs) {

      var root = angular.element('<div class="properties-tree"></div>')
      element.append(root);

      var branches = {
        '': root
      };

      var buildDom = function (object, depth) {
        branches[depth].html('');

        var buildBranch = function (key) {
          var val = object[key];
          var fullPath = depth;
          if (depth) {
            fullPath += '.';
          }
          fullPath += key;

          var parentElt = angular.element('<li title>' +
              '<span class="name">' + key + '</span>' +
              '<span class="separator">: </span>' +
            '</li>'),
            childElt;

          if (val === null) {
            childElt = angular.element('<span class="value console-formatted-null">null</span>');
          } else if (val['~object'] || val['~array-length'] !== undefined) {
            parentElt.addClass('parent');

            // you can't expand an empty array
            if (val['~array-length'] !== 0) {
              parentElt.bind('click', function () {
                scope.expand()(scope.scopeId, fullPath);
                parentElt.addClass('expanded');
              });
            }

            if (val['~object']) {
              childElt = angular.element('<span class="console-formatted-object">Object</span>');
            } else {
              childElt = angular.element(
                '<span class="console-formatted-object">Array[' +
                  val['~array-length'] +
                ']</span>');
            }
          } else {
            // TODO: what doe sregex look like?
            if (typeof val === 'string') {
              val = '"' + val + '"';
            }
            childElt = angular.element(
              '<span class="console-formatted-' + (typeof val) + '">' +
                val +
              '</span>');
          }

          parentElt.append(childElt);
          branches[fullPath] = childElt;

          return parentElt;
        };

        var properties;
        if (object instanceof Array) {
          properties = object.map(function (item, i) {
            return i;
          });
        } else {
          properties = Object.keys(object);
        }

        properties.
          map(buildBranch).
          forEach(function (elt) {
            branches[depth].append(elt);
          });

      };

      scope.$watch('val', function (val) {
        Object.
          keys(val).
          filter(function (key) {
            return key.substr(0, 2) !== '$$';
          }).
          sort(function (a, b) { // sort '' first
            if (a === '') {
              return -1;
            } else if (b === '') {
              return 1;
            } else { // sort by tree depth
              return a.split('.').length - b.split('.').length;
            }
          }).
          forEach(function (key) {
            buildDom(val[key], key);
          });
      }, true);

    }
  };
});
