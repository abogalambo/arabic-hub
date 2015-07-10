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
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    babelify    = require('babelify'),
    gls         = require('gulp-live-server'),
    watchify    = require('watchify'),
    eslint      = require('gulp-eslint'),
    notify      = require('gulp-notify'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin');
    // pngquant    = require('imagemin-pngquant');


var lessFilter = gfilter('**/*.less'),
    fontFilter = gfilter('**/*.{otf,eot,svg,ttf,woff,woff2}');

var config = {
  dist: './build',
  js: {
    bundle: {entries: './client/js/application.js', debug: true, extensions: ['.js', '.jsx']},
    source: 'application.js',
    dist: './build/js'
  },
  img: {
    src: './client/img/**/*',
    dist: './build/img'
  },
  css: {
    src: ['client/css/**/*.less', 'client/css/**/*.css'],
    dist: './build/css'
  },
  fonts: {
    src: ['bower_components/bootstrap/dist/fonts/**/*', 'bower_components/font-awesome/fonts/**/*'],
    dist: './build/fonts'
  }
}

gulp.task('clean', function(cb) {
  del([config.dist], cb);
});
gulp.task('clean-js', function(cb) {
  del([config.js.dist], cb);
});
gulp.task('clean-css', function(cb) {
  del([config.css.dist], cb);
});
gulp.task('clean-img', function(cb) {
  del([config.img.dist], cb);
});

gulp.task('browserify', ['clean-js'], function() {
  var bundler = browserify(config.js.bundle);
  bundler.transform(babelify)
    .bundle()
    .pipe(source(config.js.source))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.js.dist));
});

gulp.task('watchify', function() {
  var bundler = watchify(browserify(config.js.bundle, watchify.args));
  bundler.transform(babelify)

  function rebundle(){
    return bundler.bundle()
      .on('error', notify.onError())
      .pipe(source(config.js.source))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(config.js.dist));
  }

  bundler.on('update', rebundle);
  return rebundle();
});

gulp.task('lint', function(){
  return gulp.src(['./app/**/*.js', './app/**/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('image-min', ['clean-img'], function(){
  return gulp.src(config.img.src)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      // use: [pngquant()]
    }))
    .pipe(gulp.dest(config.img.dist));
});

gulp.task('build-css', ['clean-css'],function(){
  return gulp.src(config.css.src)
    // .pipe(lessFilter)
    // .pipe(less({
    //   paths: [
    //     "bower_components/bootstrap/less",
    //     "bower_components/font-awesome/less"
    //   ]
    // }))
    // .pipe(lessFilter.restore())
    .pipe(concat('application.css'))
    .pipe(gulp.dest(config.css.dist));
});

gulp.task('package-css', ['build-css'], function(){
  return gulp.src('build/css/*.css')
  .pipe(mincss())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('public'));
});

gulp.task('build', ['browserify', 'build-css', 'image-min']);

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
gulp.task('watch', ['watchify'],function() {
  gulp.watch(config.img.src, ['image-min']);
  gulp.watch(config.css.src, ['build-css']);
});

gulp.task('default', ['watch', 'serve']);