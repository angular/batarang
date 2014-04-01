
module.exports = function niceNames () {
  var ngScopeElts = document.getElementsByClassName('ng-scope');
  ngScopeElts = Array.prototype.slice.call(ngScopeElts);
  return ngScopeElts.
    reduce(accumulateElements, {});

  function accumulateElements (acc, elt) {
    acc[scope.$id] = nameElement(elt);
    return acc;
  }

};


var interestingAttributes = {
  'ng-app': function (value) {
    // body...
  },
  'ng-controller': function (value) {
    // body...
  },
  'ng-repeat': function (value) {
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
  }
}


function nameElement (element) {
  var $elt = angular.element(elt),
      scope = $elt.scope(),
      name = {};

  Object.keys(interestingAttributes).forEach(function (attributeName) {

  })

  return Object.keys(name).length > 0 ? name : boringName($elt);
}

function boringName ($elt) {
  return {
    tag: $elt[0].tagName.toLowerCase(),
    name: $elt[0].className.
      replace(/(\W*ng-scope\W*)/, ' ').
      split(' ').
      filter(function (i) { return i; })
  }
}

function parseAttributeValue (attr) {
  var val = $elt.attr(attr),
      className;

  if (!val && className.indexOf(attr) !== -1) {

    className = $elt[0].className;

    match = (new RegExp(attr + ': ([a-zA-Z0-9]+);')).exec(className);
    val = match[1];
  }
}
