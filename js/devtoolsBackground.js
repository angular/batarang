var panels = chrome && chrome.devtools && chrome.devtools.panels;

function getScope(node) {
  var scope = window.angular.element(node).scope();
  if (!scope) {
    // Might be a child of a DocumentFragment...
    while (node && node.nodeType === 1) node = node.parentNode;
    if (node && node.nodeType === 11) node = (node.parentNode || node.host);
    return getScope(node);
  }
  return scope;
}

// The function below is executed in the context of the inspected page.

var getPanelContents = function () {
  if (window.angular && $0) {
    //TODO: can we move this scope export into updateElementProperties
    var scope = getScope($0);

    // Export $scope to the console
    window.$scope = scope;
    return (function (scope) {
      var panelContents = {
        __private__: {}
      };

      for (prop in scope) {
        if (scope.hasOwnProperty(prop)) {
          if (prop.substr(0, 2) === '$$') {
            panelContents.__private__[prop] = scope[prop];
          } else {
            panelContents[prop] = scope[prop];
          }
        }
      }
      return panelContents;
    }(scope));
  } else {
    return {};
  }
};

if (panels) {
  panels.elements.createSidebarPane(
    "AngularJS Properties",
    function (sidebar) {
      panels.elements.onSelectionChanged.addListener(function updateElementProperties() {
        sidebar.setExpression("(" + getPanelContents.toString() + ")()");
      });
    });

  // Angular panel
  var angularPanel = panels.create(
    "AngularJS",
    "img/angular.png",
    "panel.html"
  );
}
