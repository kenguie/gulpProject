// Gulp.js configuration

// include gulp and plugins
var
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  preprocess = require('gulp-preprocess'),
  htmlclean = require('gulp-htmlclean'),
  imagemin = require('gulp-imagemin'),
  sass = require('gulp-sass'),
  size = require('gulp-size'),
  del = require('del'),
  pkg = require('./package.json');

// file locations
var
  devBuild = ((process.env.NODE_ENV || 'development')).trim().toLowerCase() !== 'production',

  source = 'source/',
  dest = 'build/';

  html = {
    in: source + '*.html',
    watch: [source + '*.html', source + 'template/**/*'],
    out: dest,
    context: {
      devBuild: devBuild,
      author: pkg.author,
      version: pkg.version
    }
  };

  images = {
    in: source + 'images/*.*',
    out: dest + 'images/'
  };

  css = {
    in: source + 'scss/main.scss',
    watch: [source + 'scss/**/*'], // watches all scss files and recompiles if there are any changes
    out: dest + 'css/',
    sassOpts: {
      outputStyle: 'nested',
      imagePath: '../images',
      precision: 3,
      errLogToConsole: true
    }
  };

  fonts = {
    in: source + 'fonts/*.*',
    out: css.out + 'fonts/'
  }

// show build type
console.log(`Project info: ${pkg.name}, ${pkg.version}, ${devBuild ? 'development' : 'production'} build.`);

// build HTML files
gulp.task('html', function() {
  var page =  gulp.src(html.in).pipe(preprocess({ context: html.context }));

  if (!devBuild) {
    page = page
      .pipe(size({ title: 'HTML in'}))
      .pipe(htmlclean())
      .pipe(size({ title: 'HTML out'}))
  }

  return page.pipe(gulp.dest(html.out));
});

// manage images
gulp.task('images', function() {
  return gulp.src(images.in)
    .pipe(newer(images.out))  // to compare with the files already in the out folder
    .pipe(imagemin())
    .pipe(gulp.dest(images.out));
});

// copy fonts over to build
gulp.task('fonts', function() {
  return gulp.src(fonts.in)
  .pipe(newer(fonts.out))
  .pipe(gulp.dest(fonts.out))
});

// compile sass
gulp.task('sass', function() {
  return gulp.src(css.in)
    .pipe(sass(css.sassOpts))
    .pipe(gulp.dest(css.out))
});

// clean build folder
gulp.task('clean', function() {
  del([
    dest + '*'
  ]);
});

// default task
gulp.task('default', ['html', 'images', 'fonts', 'sass'], function() {

  // watch for html changes
  gulp.watch(html.watch, ['html']);

  // watch for image changes
  gulp.watch(images.in, ['images']);

  // watch for font changes
  gulp.watch(fonts.in, ['fonts']);

  // watch for sass changes
  gulp.watch(css.watch, ['sass']);

});
