// Service for injecting CSS into the application
angular.module('panelApp').factory('appCss', function (chromeExtension) {
  return {
    addCssRule: function (args) {
      chromeExtension.eval(function (window, args) {
        var styleSheet = document.styleSheets[document.styleSheets.length - 1];
        styleSheet.insertRule(args.selector + '{' + args.style + '}', styleSheet.cssRules.length);
      }, args);
    },

    removeCssRule: function (args) {
      chromeExtension.eval(function (window, args) {
        var styleSheet = document.styleSheets[document.styleSheets.length - 1];
        var i;
        for (i = styleSheet.cssRules.length - 1; i >= 0; i -= 1) {
          if (styleSheet.cssRules[i].cssText === args.selector + ' { ' + args.style + '; }') {
            styleSheet.deleteRule(i);
          }
        }
      }, args);
    }
  };
});
