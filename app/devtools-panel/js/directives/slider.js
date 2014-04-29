// range slider
angular.module('panelApp').directive('batSlider', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      minimum: '=minimum',
      maximum: '=maximum'
    },
    link: function (scope, element, attrs) {

      var dom = $('<div class="ui-slider">' +
          '<a class="ui-slider-handle" href></a>' +
          '<a class="ui-slider-handle" href></a>' +
          '<div class="ui-slider-range"></div>' +
        '</div>');

      element.append(dom);

      $compile(element.contents())(scope.$new());

      dom.slider({
        range: true,
        values: [0, 100],
        slide: function () {
          var min = $(this).slider('values', 0);
          var max = $(this).slider('values', 1);
          scope.minimum = min;
          scope.maximum = max;
          scope.$apply();
        },
        stop: function () {
          var min = $(this).slider('values', 0);
          var max = $(this).slider('values', 1);
          scope.minimum = min;
          scope.maximum = max;
          scope.$apply();
        }
      });

    }
  };
});
