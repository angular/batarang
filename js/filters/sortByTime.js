// Sort watchers by time
// Used by the performance tab
angular.module('panelApp').filter('sortByTime', function () {
  return function (input, min, max) {
    var copy = input.slice(0);

    copy = copy.sort(function (a, b) {
      return b.time - a.time;
    });

    if (typeof min !== 'number' || typeof max !== 'number') {
      return copy;
    }

    // Previous implementation was very strange. I think it is more obvious to work this way:
    //   to show only those watchers with percentages >= min and <= max.
    return copy.filter(function(data) {
      return data.percent >= min && data.percent <= max;
    });
  };
});
