/*
 * karma.conf.js and karma.es5.conf.js optionally load this
 */

var CUSTOM_LAUNCHERS = {
  'SL_Chrome': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '35'
  }
};

module.exports = function(options) {
  options.sauceLabs = {
    testName: 'AngularJS Batarang Unit Tests',
    startConnect: true
  };
  options.captureTimeout = 100000;
  options.customLaunchers = CUSTOM_LAUNCHERS;
  options.browsers = Object.keys(CUSTOM_LAUNCHERS);
  options.reporters = ['dots', 'saucelabs'];
};
