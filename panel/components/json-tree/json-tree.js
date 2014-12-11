angular.module('batarang.json-tree', []).
  directive('batJsonTree', [batJsonTreeDirective]);

var BAT_JSON_TREE_TEMPLATE = '<div class="properties-tree"></div>';

var ENTER_KEY = 13,
    EXIT_KEY = 27;

var BAT_JSON_TREE_UNEDITABLE = [
  '$id',

  // managed by ngRepeat
  '$first',
  '$last',
  '$index',
  '$even',
  '$odd'
];

/*
 * TODO: remove dependency on inspectedApp service
 */
function batJsonTreeDirective() {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      batInspect: '&',
      batAssign: '&',
      batModel: '='
    },
    link: jsonTreeLinkFn
  };

  function jsonTreeLinkFn(scope, element, attrs) {
    var root = angular.element(BAT_JSON_TREE_TEMPLATE);
    element.append(root);

    var branches = {
      '': root
    };

    scope.$watch('batModel', function (val) {
      if (!val) {
        return;
      }
      Object.
        keys(val).
        filter(function (key) {
          return key.substr(0, 2) !== '$$';
        }).
        sort(byPathDepth).
        forEach(function (key) {
          buildDom(val[key], key);
        });
    }, true);


    function buildDom(object, depth) {
      branches[depth].html('');

      if (!typeof object === 'undefined') {
        return;
      }

      var buildBranch = function (key) {
        var val = object[key];
        var fullPath = depth;
        if (depth) {
          if (Number.isNaN(parseInt(key, 10))) {
            fullPath += '.' + key;
          } else {
            fullPath += '[' + key + ']';
          }
        } else {
          fullPath += key;
        }

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
            parentElt.on('click', function () {
              scope.batInspect({ path: fullPath });
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

          // TODO: test this
          // some properties (like $id) shouldn't be edited
          if (BAT_JSON_TREE_UNEDITABLE.indexOf(fullPath) > -1) {
            childElt = angular.element(
              '<span class="console-formatted-' + (typeof val) + '">' +
                val +
              '</span>');
          } else {
            childElt = angular.element(
              '<span contentEditable="true" class="console-formatted-' + (typeof val) + '">' +
                val +
              '</span>');

            // TODO: test this
            childElt.on('keydown', function (ev) {
              if (ev.keyCode === ENTER_KEY || ev.keyCode === EXIT_KEY) {
                ev.preventDefault();
                childElt[0].blur();
                doAssign();
              }
            });

            // TODO: test this
            childElt.on('blur', doAssign);

            function doAssign() {
              scope.batAssign({
                path: fullPath,
                value: childElt.text()
              });
            }
          }
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
      } else if (object != null) {
        properties = Object.keys(object);
      } else {
        properties = [];
      }

      properties.
        map(buildBranch).
        forEach(function (elt) {
          branches[depth].append(elt);
        });

    };
  }
}

function byPathDepth(a, b) { // sort '' first
  if (a === '') {
    return -1;
  } else if (b === '') {
    return 1;
  } else { // sort by tree depth
    return a.split('.').length - b.split('.').length;
  }
}
