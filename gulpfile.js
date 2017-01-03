// Gulp.js configuration

// include gulp and plugins
var
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  preprocess = require('gulp-preprocess'),
  htmlclean = require('gulp-htmlclean'),
  imagemin = require('gulp-imagemin'),
  imacss = require('gulp-imacss'),
  sass = require('gulp-sass'),
  pleeease = require('gulp-pleeease'),
  jshint = require('gulp-jshint'),
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

  imguri = {
    in: source + 'images/inline/*',
    out: source + 'scss/images',
    filename: '_datauri.scss',
    namespace: 'img'
  };

  css = {
    in: source + 'scss/main.scss',
    watch: [source + 'scss/**/*', '!' + imguri.out + imguri.filename], // watches all scss files and recompiles if there are any changes - except if there is a _datauri.scss file
    out: dest + 'css/',
    sassOpts: {
      outputStyle: 'nested',
      imagePath: '../images',
      precision: 3,
      errLogToConsole: true
    },
    pleeeaseOpts: {
      autoprefixer: { browsers: ['last 2 versions', '> 2%']}, // last 2 versions and those browsers with more than 2% marketshare
      rem: ['16px'], // 1 rem will equal 16px
      pseudoElements: true, // double colons will become single for IE
      mqpacker: true, // media queries will be packed into one
      minifier: !devBuild
    }
  };

  fonts = {
    in: source + 'fonts/*.*',
    out: css.out + 'fonts/'
  };

  js = {
    in: source + 'js/**/*',
    out: dest + 'js/',
    filename: 'main.js'
  };

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

// convert inline images to dataURIs in scss source
gulp.task('imguri', function() {
  return gulp.src(imguri.in)
    .pipe(imagemin())
    .pipe(imacss(imguri.filename, imguri.namespace))
    .pipe(gulp.dest(imguri.out));
});

// copy fonts over to build
gulp.task('fonts', function() {
  return gulp.src(fonts.in)
  .pipe(newer(fonts.out))
  .pipe(gulp.dest(fonts.out))
});

// compile sass
gulp.task('sass', ['imguri'], function() {
  return gulp.src(css.in)
    .pipe(sass(css.sassOpts))
    .pipe(size({title: 'CSS in '}))
    .pipe(pleeease(css.pleeeaseOpts))
    .pipe(size({title: 'CSS out '}))
    .pipe(gulp.dest(css.out))
});

// JS validation
gulp.task('js', function() {
  return gulp.src(js.in)
    .pipe(newer(js.out))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))  // output errors to the console
    .pipe(jshint.reporter('fail')) // if there are errors, fail
    .pipe(gulp.dest(js.out)); // if it's ok, output the js
});


// clean build folder
gulp.task('clean', function() {
  del([
    dest + '*'
  ]);
});

// default task
gulp.task('default', ['html', 'images', 'fonts', 'sass', 'js'], function() {

  // watch for html changes
  gulp.watch(html.watch, ['html']);

  // watch for image changes
  gulp.watch(images.in, ['images']);

  // watch for font changes
  gulp.watch(fonts.in, ['fonts']);

  // watch for sass changes
  gulp.watch([css.watch, imguri.in], ['sass']);

  // js changes
  gulp.watch(js.in, ['js']);

});
