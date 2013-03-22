angular.module('panelApp').directive('batJsonTree', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '='
      //edit: '=',
    },
    link: function (scope, element, attrs) {
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898

      var buildDom = function (object) {
        var html = '';
        var prop;
        if (object === undefined) {
          html += '<i>undefined</i>';
        } else if (object === null) {
          html += '<i>null</i>';
        } else if (object instanceof Array) {
          var i;
          html += '<div class="scope-branch">[ ';
          if (object.length > 0) {
            html += buildDom(object[i]);
            for (i = 1; i < object.length; i++) {
              html += ',' + buildDom(object[i]);
            }
          }
          html += ']</div>';
        } else if (object instanceof Object) {
          html += ' { ';
          for (prop in object) {
            if (object.hasOwnProperty(prop)) {
              html += '<div class="scope-branch">' + prop + ': ' + buildDom(object[prop]) + '</div>';
            }
          }
          html += ' } ';
        } else {
          html += '<span>' + object.toString() + '</span>';
        }
        return html;
      };

      var isEmpty = function (object) {
        var prop;
        for (prop in object) {
          if (object.hasOwnProperty(prop)) {
            return false;
          }
        }
        return true;
      };

      scope.$watch('val', function (newVal, oldVal) {
        if (newVal === null) {
          element.html('<div class="alert alert-info">Select a scope to view its models.</div>');
        } else if (isEmpty(newVal)) {
          element.html('<pre>{ This scope has no models }</pre>');
        } else {
          element.html('<pre>' + buildDom(newVal) + '</pre>');
        }
      });
    }
  };
});
