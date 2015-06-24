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
    debowerify  = require('debowerify'),
    gls         = require('gulp-live-server'),
    reactify    = require('reactify'),
    imagemin    = require('gulp-imagemin');
    // pngquant    = require('imagemin-pngquant');


var lessFilter = gfilter('**/*.less'),
    fontFilter = gfilter('**/*.{otf,eot,svg,ttf,woff,woff2}');

var paths = {
  scripts: 'client/js/**/*',
  images: 'client/img/**/*',
  stylesheets: ['client/stylesheets/**/*.less', 'client/stylesheets/**/*.css'],
  fonts: ['bower_components/bootstrap/dist/fonts/**/*', 'bower_components/font-awesome/fonts/**/*']
};

gulp.task("bower", function(){
  return gulp.src(mainBower(), {base: "bower_components"})
    .pipe(gulp.dest('build/lib'));
});

gulp.task('build-font', function(){
  return gulp.src(paths.fonts)
    .pipe(fontFilter)
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('image-min', function(){
  return gulp.src(paths.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      // use: [pngquant()]
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('build-css', function(){
  return gulp.src(paths.stylesheets)
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
    entries: 'client/js/application.js',
    debug: true
  });

  b.transform(reactify);
  b.transform(debowerify);
  b.transform(babelify);

  return b.bundle()
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(gulp.dest('build/js'));
});

gulp.task('package-js', ['browserify'], function(){
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

gulp.task('build', ['browserify', 'build-css', 'image-min']);
gulp.task('package', ['package-js', 'package-css', 'image-min']);

gulp.task('serve', ['build'], function() {
  var server = gls('index.js', {env: {NODE_ENV: 'development', PORT: 3000}});
  server.start();

  //use gulp.watch to trigger server actions(notify, start or stop) 
  gulp.watch('build/', function () {
    server.notify.apply(server, arguments);
  });

  gulp.watch('index.js', function(){
    //restart my server
    server.stop();
    server.start();
  });
});
 
// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['browserify']);
  gulp.watch(paths.images, ['image-min']);
  gulp.watch(paths.stylesheets, ['build-css']);
  gulp.watch(paths.fonts, ['build-font']);
});

gulp.task('default', ['watch', 'serve']);