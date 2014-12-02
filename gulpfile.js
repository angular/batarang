var gulp = require('gulp');
var source = require('vinyl-source-stream');
var ngAnnotate = require('browserify-ngannotate');
var browserify = require('browserify');

var main = require('./package.json').main;

gulp.task('watch', function(){
  gulp.watch(['hint.js', '!./dist/*.js'], ['browserify']);
});

gulp.task('browserify', function() {
  var bundleStream = browserify('./' + main).transform(ngAnnotate,{global:true}).bundle().pipe(source(main));
  return bundleStream.pipe(gulp.dest('./dist'));
});

gulp.task('default', ['browserify']);
