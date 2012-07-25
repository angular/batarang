panelApp.controller('OptionsCtrl', function OptionsCtrl($scope, appContext, chromeExtension) {

  $scope.debugger = {
    scopes: false,
    bindings: false,
    app: false
  };

  //TODO: improve look of highlighting; for instance, if an element is bound and a scope,
  // you will only see the most recently applied outline

  // TODO: refactor; remove chromeExtension calls in favor of adding methods to appContext
  $scope.$watch('debugger.scopes', function (newVal, oldVal) {
    if (newVal) {
      chromeExtension.eval(function () {
        var addCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];
          styleSheet.insertRule(selector + '{' + rule + '}', styleSheet.cssRules.length);
        };
        addCssRule('.ng-scope', 'border: 1px solid red');
      });
    } else {
      chromeExtension.eval(function () {
        removeCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];

          var i;
          for (i = styleSheet.cssRules.length - 1; i >= 0; i -= 1) {
            if (styleSheet.cssRules[i].cssText === selector + ' { ' + rule + '; }') {
              styleSheet.deleteRule(i);
            }
          }
        };
        removeCssRule('.ng-scope', 'border: 1px solid red');
      });
    }
  });

  $scope.$watch('debugger.bindings', function (newVal, oldVal) {
    if (newVal) {
      chromeExtension.eval(function () {
        var addCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];
          styleSheet.insertRule(selector + '{' + rule + '}', styleSheet.cssRules.length);
        };
        addCssRule('.ng-binding', 'border: 1px solid blue');
      });
    } else {
      chromeExtension.eval(function () {
        removeCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];

          var i;
          for (i = styleSheet.cssRules.length - 1; i >= 0; i -= 1) {
            if (styleSheet.cssRules[i].cssText === selector + ' { ' + rule + '; }') {
              styleSheet.deleteRule(i);
            }
          }
        };
        removeCssRule('.ng-binding', 'border: 1px solid blue');
      });
    }
  });

  $scope.$watch('debugger.app', function (newVal, oldVal) {
    if (newVal) {
      chromeExtension.eval(function () {
        var addCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];
          styleSheet.insertRule(selector + '{' + rule + '}', styleSheet.cssRules.length);
        };
        // TODO: rules for ng-app (is it added as a class?)
        addCssRule('[ng-app]', 'border: 1px solid green');
        //addCssRule('ng-app:', 'border: 1px solid green');
        addCssRule('[app-run]', 'border: 1px solid green');
      });
    } else {
      chromeExtension.eval(function () {
        removeCssRule = function (selector, rule) {
          var styleSheet = document.styleSheets[document.styleSheets.length - 1];

          var i;
          for (i = styleSheet.cssRules.length - 1; i >= 0; i -= 1) {
            if (styleSheet.cssRules[i].cssText === selector + ' { ' + rule + '; }') {
              styleSheet.deleteRule(i);
            }
          }
        };
        removeCssRule('[ng-app]', 'border: 1px solid green');
        //removeCssRule('ng-app:', 'border: 1px solid green');
        removeCssRule('[app-run]', 'border: 1px solid green');
      });
    }
  });

  chromeExtension.eval(function () {
    return window.angular.version.full +
      ' ' +
      window.angular.version.codeName;
  }, function (version) {
    $scope.version = version;
  });

  appContext.getAngularSrc(function (status) {
    $scope.status = status;
  });
  
});
