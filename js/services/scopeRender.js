//Renders scope name according to how it was created - for controller, for directive, etc.
//See debug.js#collectScopes
angular.module('panelApp').factory('renderScope', function() {
  var render = {
    scopeIdSuffix: function(scope) {return " (" + scope.id + ")"},
    controller: function(scope, data) { return "<dfn>controller</dfn> '" + data + "'"},
    directive: function(scope, data) { return "<dfn>directive</dfn> '" + data + "'"},
    ngRepeat: function(scope, data) { return "<dfn>" + data.index + ". " + data.itemExpr + "</dfn> " + data.itemId },
    ngInclude: function(scope, data) { return data }
  };

  function renderName(scope) {
    if (angular.isString(scope.name)) {
      return "Scope (" + scope.name + ")";
    }
    else if (angular.isObject(scope.name)) {
      var names = [];
      angular.forEach(scope.name, function (data, type) {
        names.push(render[type](scope, data));
      });
      return names.join(", ") + render.scopeIdSuffix(scope);
    }
    return "Scope (" + scope.id + ")";
  }

  return renderName;
});