var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var nano = require('gulp-cssnano');
// var concat = require('gulp-concat');
var del = require('del');
var gutil = require('gulp-util');
var ftp = require( 'vinyl-ftp' );
var runSequence = require('run-sequence');

// CSS
gulp.task('sass', function(){
  return gulp.src('dev/css/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('dev/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// concatenates js betweeen <!--build:js js/app.min.js --> <!-- endbuild -->
// also works with <!--build:css css/style.min.css --> <!-- endbuild -->
gulp.task('useref', function(){
  return gulp.src('dev/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('copy', function(){
  // gulp.src(['dev/js/**/*']).pipe(gulp.dest('dist/js'));
  gulp.src(['dev/**/*.html']).pipe(gulp.dest('dist/'));
  gulp.src(['dev/fonts/**/*']).pipe(gulp.dest('dist/fonts'));
})


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dev'
    },
  })
})

gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('dev/css/**/*.scss', ['sass']); 
  // gulp.watch('dev/css/**/*.css', ['uncss']); 
  gulp.watch('dev/**/*.html', browserSync.reload); 
  gulp.watch('dev/js/**/*.js', browserSync.reload);
  // Other watchers
})

gulp.task('clean:dist', function() {
  return del.sync('dist');
})


gulp.task('copy', function(){
  gulp.src(['dev/js/**/*']).pipe(gulp.dest('dist/js'));
  gulp.src(['dev/**/*.html']).pipe(gulp.dest('dist/'));
  gulp.src(['dev/fonts/**/*']).pipe(gulp.dest('dist/fonts'));
  // gulp.src(['dev/img/**/*']).pipe(gulp.dest('dist/img'));
  gulp.src(['dev/util/**/*']).pipe(gulp.dest('dist/util'));
  gulp.src(['dev/**/*MD']).pipe(gulp.dest('dist/'));
})

gulp.task('images', function(){
  return gulp.src('dev/img/**/*.+(png|jpg|JPG|gif|svg)')
  // .pipe(cache(imagemin({
  //  interlaced: true
  // })))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('js-images', function(){
  return gulp.src('dev/js/**/*.+(png|jpg|JPG|gif|svg)')
  .pipe(gulp.dest('dist/js'))
});

gulp.task('deploy', function () {
    var conn = ftp.create( {
        host:     'jamesbenedict.info',
        user:     'jamesb21',
        password: 'Tango kilo 6',
        parallel: 10,
        log:      gutil.log
    } );

    var globs = [
        'css/**',
        'fonts/**',
        // 'img/**',
        'js/**',
        'index.html',
        'error.html'
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {cwd: 'dist', base: './dist/', buffer: false } )
        .pipe( conn.newer( '/www/abortion_graphic' ) ) // only upload newer files
        .pipe( conn.dest( '/www/abortion_graphic' ) );

} );

gulp.task( 'deploy-img', function () {
    var conn = ftp.create( {
        host:     'jamesbenedict.info',
        user:     'jamesb21',
        password: 'Tango kilo 6',
        parallel: 10,
        log:      gutil.log
    } );

    var globs = [
        'img/**',
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src(globs, {cwd: 'dist', base: './dist/', buffer: false } )
        .pipe( conn.newer( '/www/abortion_graphic' ) ) // only upload newer files
        .pipe( conn.dest( '/www/abortion_graphic' ) );

} );




gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
});


gulp.task('dist', function (callback) {
  runSequence('clean:dist', 
    ['useref', 'copy', 'sass',  'images', 'js-images'],
    callback
  )
})



