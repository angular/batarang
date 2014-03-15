/*
 * This karma conf tests just the panel app
 */

var sauceConfig = require('./config/karma.sauce.conf');
var travisConfig = require('./config/karma.travis.conf');

module.exports = function(config) {
  var options = {
    frameworks: ['browserify', 'jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'panel/app.js',
      'panel/**/*.js',
      'panel/**/*.spec.js',
      'devtoolsBackground.js',
      'test/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'hint.js': [ 'browserify' ]
    },
    browsers: ['Chrome'],
  };

  if (process.argv.indexOf('--sauce') > -1) {
    sauceConfig(options);
    travisConfig(options);
  }

  config.set(options);
};
