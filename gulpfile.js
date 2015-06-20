// grab our gulp packages
var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    less        = require('gulp-less'),
    uglify      = require('gulp-uglify'),
    mincss      = require('gulp-minify-css'),
    gfilter     = require('gulp-filter'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    babel       = require('gulp-babel'),
    sourcemaps  = require('gulp-sourcemaps'),
    mainBower   = require("main-bower-files");

var lessFilter = gfilter('**/*.less');

gulp.task("bower", function(){
  return gulp.src(mainBower(), {base: "bower_components"})
    .pipe(gulp.dest('build/lib'));
});

gulp.task('build-css', function(){
  return gulp.src(['client/stylesheets/**/*.less', 'client/stylesheets/**/*.css'])
    .pipe(lessFilter)
    .pipe(less())
    .pipe(lessFilter.restore())
    .pipe(concat('application.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('build-js', function(){
  return gulp.src(['client/javascripts/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('application.js'))
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('package-js', ['build-js'], function(){
  return gulp.src('build/js/*.js')
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('public'));
});

gulp.task('package-css', ['build-css'], function(){
  return gulp.src('build/css/*.css')
  .pipe(mincss())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('public'));
});

gulp.task('package', ['package-js', 'package-css']);
