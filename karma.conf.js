module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'hint.js',
      'hintApp.js',
      'hintCtrl.js',
      'hintService.js',
      '*_test.js'
    ],
    exclude: [],
    preprocessors: {
      'hint.js': [ 'browserify' ]
    },
    browsers: ['Chrome'],
  });
};