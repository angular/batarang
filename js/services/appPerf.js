// Service for retrieving and caching performance data
angular.module('panelApp').

factory('appPerf', function (chromeExtension, $rootScope) {

  var _histogramCache = [],
    _watchNameToPerf = {},
    _totalCache = 0;

  var clear = function () {
    _histogramCache = [];
    _watchNameToPerf = {};
    _totalCache = 0;
  };

  // clear cache on page refresh
  $rootScope.$on('refresh', clear);

  var getHistogramData = function (callback) {
    chromeExtension.eval(function (window) {
      if (!window.__ngDebug) {
        return {};
      }
      return window.__ngDebug.getWatchPerf();
    },
    function (data) {
      if (data && data.length) {
        updateHistogram(data);
      }
      callback();
    });
  };

  var updateHistogram = function (data) {
    data.forEach(function (info) {
      _totalCache += info.time;

      if (_watchNameToPerf[info.name]) {
        _watchNameToPerf[info.name].time += info.time;
      } else {
        _watchNameToPerf[info.name] = info;
        _histogramCache.push(info);
      }
    });

    // recalculate all percentages
    _histogramCache.forEach(function (item) {
      item.percent = (100 * item.time / _totalCache).toPrecision(3);
    });
  };

  // Public API
  // ==========
  return {
    get: function (callback) {
      getHistogramData(function () {
        callback(_histogramCache);
      });
    },
    clear: clear
  };
});
