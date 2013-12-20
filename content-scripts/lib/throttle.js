// throttle based on _.throttle from Lo-Dash
// https://github.com/bestiejs/lodash/blob/master/lodash.js#L4625

// modified so that it
// throttles based on arguments
// returns nothing

// Ex:
// var th = throttle(fn, 50);
// fn('foo'); // not throttled
// fn('foo'); // throttled
// fn('bar'); // not throttled
module.exports = function (func, wait) {
  var args,
      thisArg,
      timeoutId = {},
      lastCalled = {};

  if (wait === 0) {
    return func;
  }

  return function() {
    args = arguments;
    thisArg = this;

    var argsString = Array.prototype.slice.call(args).join(';');

    var now = Date.now();
    var remaining = wait - (now - (lastCalled[argsString] || 0));

    if (remaining <= 0) {
      clearTimeout(timeoutId[argsString]);
      timeoutId[argsString] = null;
      lastCalled[argsString] = now;
      func.apply(thisArg, args);
    }
    else if (!timeoutId[argsString]) {
      timeoutId[argsString] = setTimeout(function () {
        lastCalled[argsString] = Date.now();
        timeoutId[argsString] = null;
        func.apply(thisArg, args);
      }, remaining);
    }
  };
};
