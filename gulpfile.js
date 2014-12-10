var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var zip = require('gulp-zip');

var main = require('./package.json').main;
// TODO: make sure manifest version === package.json version === bower.json version
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

gulp.task('default', ['browserify']);
