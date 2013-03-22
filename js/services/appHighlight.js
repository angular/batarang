// Service for highlighting parts of the application
angular.module('panelApp').factory('appHighlight', function (appCss) {

  //TODO: improve look of highlighting; for instance, if an element is bound and a scope,
  // you will only see the most recently applied outline
  var styles = {
    scopes: {
      selector: '.ng-scope',
      style: 'border: 1px solid red'
    },
    bindings: {
      selector: '.ng-binding',
      style: 'border: 1px solid blue'
    },
    app: {
      selector: '[ng-app]',
      style: 'border: 1px solid green'
    }
  };

  var api = {};

  for (i in styles) {
    if (styles.hasOwnProperty(i)) {
      // create closure around "styles"
      (function () {
        var style = styles[i];
        api[i] = function (setting) {
          if (setting) {
            appCss.addCssRule(style);
          } else {
            appCss.removeCssRule(style);
          }
        }
      }());
    }
  }
  return api;
});
