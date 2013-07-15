angular.module('panelApp').
constant('defaultSplit', 360).
directive('batVerticalSplit', function ($document, defaultSplit) {

  var classes = [
    'split-view',
    'split-view-vertical',
    'visible'
  ];

  return {
    restrict: 'A',
    compile: function (element) {
      classes.forEach(element.addClass.bind(element));

      var children = element.children();
      var left = angular.element(children[0]);
      var right = angular.element(children[1]);

      return function (scope, element, attr) {
        var slider = angular.element('<div class="split-view-resizer" style="right: ' + defaultSplit + 'px; margin-right: -2.5px;"></div>');

        var drag = function (ev) {
          var x = $document[0].body.clientWidth - ev.x;
          left.css('right', x + 'px');
          right.css('width', x + 'px');
          slider.css('right', x + 'px');
        };

        var oldCursor;

        slider.bind('mousedown', function (ev) {
          drag(ev);
          oldCursor = $document.css('cursor');
          $document.css('cursor', 'ew-resize');
          $document.bind('mousemove', drag);
          $document.bind('mouseup', stopDrag);
        });

        var stopDrag = function () {
          $document.css('cursor', oldCursor);
          $document.unbind('mousemove', drag);
          $document.unbind('mouseup', stopDrag);
        };

        element.append(slider);
      };
    }
  };
}).
directive('batVerticalLeft', function (defaultSplit) {
  var classes = [
    'split-view-contents',
    'scroll-target',
    'split-view-contents-first',
    'outline-disclosure'
  ];

  return {
    require: '^batVerticalSplit',
    restrict: 'A',
    compile: function (element) {
      classes.forEach(element.addClass.bind(element));
      element.css('right', defaultSplit + 'px');
    }
  };
}).
directive('batVerticalRight', function (defaultSplit) {
  var classes = [
    'split-view-contents',
    'scroll-target',
    'split-view-contents-second',
    'split-view-sidebar'
  ];

  return {
    require: '^batVerticalSplit',
    restrict: 'A',
    compile: function (element) {
      classes.forEach(element.addClass.bind(element));
      element.css('width', defaultSplit + 'px');
    }
  };
});
