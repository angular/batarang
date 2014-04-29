// Karma configuration for testing injected AngularJS instrumentation

module.exports = function (config) {
  config.set({

    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'test/inject/mock/*.js',
      'app/content-scripts/inject.build.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'test/inject/*.js'
    ],

    preprocessors: {
      'content-scripts/inject.build.js': ['coverage']
    },

    exclude: [
      '*.min.js'
    ],

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false
  });
};
