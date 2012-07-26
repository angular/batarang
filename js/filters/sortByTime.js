// Sort watchers by time
// Used by the performance tab
panelApp.filter('sortByTime', function () {
  return function (input, min, max) {
    var copy = input.slice(0);

    copy = copy.sort(function (a, b) {
      return b.time - a.time;
    });

    if (typeof min !== 'number' || typeof max !== 'number') {
      return copy;
    }

    var start = Math.floor(input.length * min/100);
    var end = Math.ceil(input.length * max/100) - start;

    return copy.splice(start, end);
  };
});
