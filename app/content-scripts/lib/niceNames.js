
var interestingAttributes = {
  'ng-app': function (value) {
    // body...
  },
  'ng-controller': function (value) {
    // body...
  },
  'ng-repeat': function (value, scope) {
    var match = /(.+) in/.exec(value);
    var lhs = match[1];

    match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
    var valueIdentifier = match[3] || match[1];
    var keyIdentifier = match[2];

    name.lhs = valueIdentifier +
                (keyIdentifier ? '["' + scope[keyIdentifier] + '"]' : '') +
                summarizeObject(scope[valueIdentifier]);
  }
};

function nameElement (element) {
  var scope = element.scope(),
      name = {};

  Object.keys(interestingAttributes).forEach(function (attributeName) {
    var value = element.attr(attributeName);
    value && (name[attributeName] =
            interestingAttributes[attributeName](value, scope));
  })

  return Object.keys(name).length > 0 ? name : boringName(element);
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

module.exports = function niceNames () {
  var ngScopeElts = document.getElementsByClassName('ng-scope');
  ngScopeElts = Array.prototype.slice.call(ngScopeElts);
  return ngScopeElts.
    map(angular.element).
    reduce(accumulateElements, {});

  function accumulateElements (acc, elt) {
    acc[elt.scope().$id] = nameElement(elt);
    return acc;
  }

};