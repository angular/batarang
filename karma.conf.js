/*
 * This karma conf tests just the panel app
 */

module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'panel/app.js',
      'panel/**/*.js',
      'panel/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'hint.js': [ 'browserify' ]
    },
    browsers: ['Chrome'],
  });
};
