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
    mainBower   = require('main-bower-files'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    babelify    = require('babelify'),
    debowerify  = require('debowerify');

var lessFilter = gfilter('**/*.less'),
    fontFilter = gfilter('**/*.{otf,eot,svg,ttf,woff,woff2}');

gulp.task("bower", function(){
  return gulp.src(mainBower(), {base: "bower_components"})
    .pipe(gulp.dest('build/lib'));
});

gulp.task('build-font', function(){
  return gulp.src(['bower_components/bootstrap/dist/fonts/**/*', 'bower_components/font-awesome/fonts/**/*'])
    .pipe(fontFilter)
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('build-css', function(){
  return gulp.src(['client/stylesheets/**/*.less', 'client/stylesheets/**/*.css'])
    .pipe(lessFilter)
    .pipe(less({
      paths: [
        "bower_components/bootstrap/less",
        "bower_components/font-awesome/less"
      ]
    }))
    .pipe(lessFilter.restore())
    .pipe(concat('application.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('browserify', function () {
  var b = browserify({
    entries: 'client/javascripts/application.js',
    debug: true
  });

  b.transform(debowerify);
  b.transform(babelify);

  return b.bundle()
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(gulp.dest('build/js'));
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
