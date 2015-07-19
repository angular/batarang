var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var zip = require('gulp-zip');
var protractor = require("gulp-protractor").protractor;
var webdriver_standalone = require("gulp-protractor").webdriver_standalone;
var webdriver_update = require("gulp-protractor").webdriver_update;

var main = require('./package.json').main;
// TODO: make sure manifest version === package.json version
var version = require('./manifest.json').version;

gulp.task('watch', function(){
  gulp.watch(['hint.js', '!./dist/*.js'], ['browserify']);
});

gulp.task('browserify', function() {
  var bundleStream = browserify('./' + main).bundle().pipe(source(main));
  return bundleStream.pipe(gulp.dest('./dist'));
});

/*
 * I use this to make a zip for the chrome store
 */
gulp.task('package', ['browserify'], function () {
  return gulp.src([
      './dist/**',
      './img/**',
      './panel/**',
      'background.js',
      'devtoolsBackground.*',
      'inject.js',
      'manifest.json',
      './node_modules/angular/angular.js'
    ], {base: '.'})
    .pipe(gulp.dest('./package'));
});

gulp.task('zip', ['package'], function () {
  return gulp.src('package/**')
      .pipe(zip('batarang-' + version + '.zip'))
      .pipe(gulp.dest('.'));
});

// protractor and selenium
gulp.task('webdriver_update', webdriver_update);
gulp.task('webdriver_standalone', webdriver_standalone);
gulp.task('profile1', ['webdriver_update'], function() {
  return gulp.src(["./tests/*.js"])
    .pipe(protractor({
        configFile: "profiles/protractor.config.js",
        args: ['--baseUrl', 'http://127.0.0.1:8000']
    })) 
    .on('error', function(e) { throw e; })
});
gulp.task('profile2', ['webdriver_update'], function() {
  return gulp.src(["./tests/*.js"])
    .pipe(protractor({
        configFile: "profiles/another.config.js",
        args: ['--baseUrl', 'http://127.0.0.1:8000']
    })) 
    .on('error', function(e) { throw e; })
});

gulp.task('default', ['browserify']);
