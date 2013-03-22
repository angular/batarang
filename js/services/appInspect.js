// Service for highlighting parts of the application
angular.module('panelApp').factory('appInspect', function (chromeExtension) {
  return {
    enable: function () {
      chromeExtension.eval(function (window) {
        var angular = window.angular;
        var popover = angular.element('<div style="position: fixed; left: 10px; top: 10px; z-index: 9999; background-color: white; padding: 10px;"></div>');
        angular.element(window.document.body).append(popover);
        angular.element('.ng-scope').
          on('mouseover', function () {
            var thisElt = this;
            var thisScope = angular.element(this).scope();
            var models = {};
            for (prop in thisScope) {
              if (thisScope.hasOwnProperty(prop) && prop !== 'this' && prop[0] !== '$') {
                models[prop] = thisScope[prop];
              }
            }
            var str = JSON.stringify(models);
            console.log(str);
            //console.log(thisScope);
            popover.html(str);
          });
      });
    }
  };
});
