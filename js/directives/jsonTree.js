angular.module('panelApp').directive('batJsonTree', function($compile, appModel) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      scopeId: '='
    },
    link: function (scope, element, attrs) {

      var watching = [];

      console.log(element);

      var scopeId = '003';

      appModel.getModel(scopeId, [], function (obj) {
        console.log(obj);
      });
    }
  };
});
