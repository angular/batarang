var panels = chrome && chrome.devtools && chrome.devtools.panels;
var elementsPanel = panels && panels.elements;

if (elementsPanel) {
  elementsPanel.createSidebarPane('$scope', function onSidebarCreated(sidebar) {
    elementsPanel.onSelectionChanged.addListener(function updateElementProperties() {
      sidebar.setExpression('(' + getPanelContents.toString() + ')()');
    });

    // AngularJS panel
    panels.create('AngularJS', 'img/angular.png', 'panel/app.html');
  });
}

// The function below is executed in the context of the inspected page.
function getPanelContents() {
  var angular = window.angular;
  var panelContents = {};

  if (angular && $0) {
    var scope = getScope($0);

    // Export $scope to the console
    window.$scope = scope;

    // Get sidebar contents
    panelContents.__private__ = {};
    Object.keys(scope).forEach(function (prop) {
      var dest = (prop.substr(0, 2) === '$$') ? panelContents.__private__ : panelContents;
      dest[prop] = scope[prop];
    });
  }

  return panelContents;

  // Helpers
  function getScope(node) {
    var scope = angular.element(node).scope();
    if (!scope) {
      // Might be a child of a DocumentFragment...
      while (node && node.nodeType === Node.ELEMENT_NODE) node = node.parentNode;
      if (node && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) node = node.parentNode || node.host;
      return node && getScope(node);
    }
    return scope;
  }
}
