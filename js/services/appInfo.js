// Service for running code in the context of the application being debugged
panelApp.factory('appInfo', function (chromeExtension, appContext) {

  var _versionCache = null,
    _srcCache = null;

  // clear cache on page refresh
  appContext.watchRefresh(function () {
    _versionCache = null;
    _srcCache = null;
  });

  return {
    getAngularVersion: function (callback) {
      if (_versionCache) {
        setTimeout(function () {
          callback(_versionCache);
        }, 0);
      } else {
        chromeExtension.eval(function () {
          return window.angular.version.full +
            ' ' +
            window.angular.version.codeName;
        }, function (data) {
          _versionCache = data;
          callback(_versionCache);
        });
      }
    },

    getAngularSrc: function (callback) {
      if (_srcCache) {
        setTimeout(function () {
          callback(_srcCache);
        }, 0);
      } else {
        chromeExtension.eval(function (window, args) {
          if (!window.angular) {
            return 'info';
          }
          var elts = window.angular.element('script[src]');
          var re = /\/angular(-\d+(\.(\d+))+(rc)?)?(\.min)?\.js$/;
          var elt;
          for (i = 0; i < elts.length; i++) {
            elt = elts[i];
            if (re.exec(elt.src)) {
              if (elt.src.indexOf('code.angularjs.org') !== -1) {
                return 'error';
              } else if (elt.src.indexOf('ajax.googleapis.com') !== -1) {
                return 'good';
              } else {
                return 'info';
              }
            }
          }
          return 'info';
        }, function (src) {
          if (src) {
            _srcCache = src;
          }
          callback(_srcCache);
        });
      }
    }

  };
});
