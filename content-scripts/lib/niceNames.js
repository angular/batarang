
module.exports = function niceNames () {
  var ngScopeElts = document.getElementsByClassName('ng-scope');
  ngScopeElts = Array.prototype.slice.call(ngScopeElts);
  return ngScopeElts.
    reduce(function (acc, elt) {
      var $elt = angular.element(elt);
      var scope = $elt.scope();

      var name = {};

      [
        'ng-app',
        'ng-controller',
        'ng-repeat'
      ].
      forEach(function (attr) {
        var val = $elt.attr(attr),
          className = $elt[0].className,
          match,
          lhs,
          valueIdentifier,
          keyIdentifier;

        if (val) {
          name[attr] = val;
          if (attr === 'ng-repeat') {
            match = /(.+) in/.exec(val);
            lhs = match[1];

            match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
            valueIdentifier = match[3] || match[1];
            keyIdentifier = match[2];

            if (keyIdentifier) {
              name.lhs = valueIdentifier + '["' + scope[keyIdentifier] + '"]' + summarizeObject(scope[valueIdentifier]);
            } else {
              name.lhs = valueIdentifier + summarizeObject(scope[valueIdentifier]);
            }

          }
        } else if (className.indexOf(attr) !== -1) {
          match = (new RegExp(attr + ': ([a-zA-Z0-9]+);')).exec(className);
          name[attr] = match[1];
        }
      });

      if (Object.keys(name).length === 0) {
        name.tag = $elt[0].tagName.toLowerCase();
        name.classes = $elt[0].className.
          replace(/(\W*ng-scope\W*)/, ' ').
          split(' ').
          filter(function (i) { return i; });
      }
      acc[scope.$id] = name;
      return acc;
    }, {});
};
