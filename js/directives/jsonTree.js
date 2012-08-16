// JSON tree
panelApp.directive('batJsonTree', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=',
      //edit: '=',
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898

      var buildDom = function (object) {
        var html = '';
        if (object == undefined) {
          html += 'null';
        } else if (object instanceof Array) {
          var i;
          html += '<div class="scope-branch">['
          for (i = 0; i < object.length; i++) {
            html += buildDom(object[i]) + ', ';
          }
          html += ']</div>'
        } else if (object instanceof Object) {
          for (prop in object) {
            if (object.hasOwnProperty(prop)) {
              html += '<div class="scope-branch">' + prop + ': ' + buildDom(object[prop]) + '</div>';
            }
          }
        } else {
          html += '<span>' + object.toString() + '</span>';
        }
        return html;
      };

      scope.$watch('val', function (newVal, oldVal) {
        element.html(buildDom(newVal));
      });
    }
  };
});
