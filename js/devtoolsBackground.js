var panels = chrome.devtools.panels;

// The function below is executed in the context of the inspected page.

var getPanelContents = function () {
  if (window.angular && $0) {
    //TODO: can we move this scope export into updateElementProperties
    var scope = window.angular.element($0).scope(),
        dataBinding = window.angular.element($0).data('$binding');

    // Export $scope to the console
    window.$scope = scope;
    return (function (scope) {
      var panelContents = {
        scope: {
          __private__: {}
        },
        bindings: []
      };

      if (dataBinding) {
        panelContents.bindings = angular.isArray(dataBinding)
                               ? dataBinding.map(function(b) { return b.exp; })
                               : [dataBinding.exp || dataBinding];
      }

      for (prop in scope) {
        if (scope.hasOwnProperty(prop)) {
          if (prop.substr(0, 2) === '$$') {
            panelContents.scope.__private__[prop] = scope[prop];
          } else {
            panelContents.scope[prop] = scope[prop];
          }
        }
      }
      return panelContents;
    }(scope));
  } else {
    return {};
  }
};

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
