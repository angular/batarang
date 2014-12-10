/*
 * This karma conf tests just the panel app
 */

module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
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
