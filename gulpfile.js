// Gulp.js configuration

// include gulp and plugins
var
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  del = require('del'),
  pkg = require('./package.json');

// file locations
var
  devBuild = ((process.env.NODE_ENV || 'development')).trim().toLowerCase() !== 'production',

  source = 'source/',
  dest = 'build/';

  images = {
    in: source + 'images/*.*',
    out: dest + 'images/'
  };

// show build type
console.log(`Project info: ${pkg.name}, ${pkg.version}, ${devBuild ? 'development' : 'production'} build.`);

// manage images
gulp.task('images', function() {
  return gulp.src(images.in)
    .pipe(newer(images.out))  // to compare with the files already in the out folder
    .pipe(imagemin())
    .pipe(gulp.dest(images.out));
});

// clean build folder
gulp.task('clean', function() {
  del([
    dest + '*'
  ]);
});

// default task
gulp.task('default', ['images'], function() {

  // watch for image changes
  gulp.watch(images.in, ['images']);

});
