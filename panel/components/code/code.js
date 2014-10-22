'use strict';

angular.module('batarang.code', []).

directive('batCode', function() {
  return {
    restrict: 'A',
    terminal: true,
    scope: {
      batCode: '='
    },
    link: function (scope, element, attrs) {
      scope.$watch('batCode', function (newVal) {
        if (newVal) {
          element.html(replaceCodeInString(newVal));
        }
      });
    }
  };
});

// super lite version of markdown
var CODE_RE = /\`(.+?)\`/g;
function replaceCodeInString(str) {
  return str.replace(CODE_RE, function (match, contents) {
    return ['<code>', contents, '</code>'].join('');
  });
}
