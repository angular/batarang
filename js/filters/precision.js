// returns the number's first 4 decimals
panelApp.filter('precision', function () {
  return function (input, output) {
    return input.toPrecision(4);
  };
});
