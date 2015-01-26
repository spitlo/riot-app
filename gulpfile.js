var gulp = require('gulp')
var riot = require('gulp-riot')
var browserSync = require('browser-sync')
var reload = browserSync.reload
var browserify = require('browserify')
var uglify = require('gulp-uglify')
var htmlmin = require('gulp-htmlmin')
var rename = require('gulp-rename')
var concat = require('gulp-concat')
var revercss = require('gulp-revercss')
var less = require('gulp-less')
var sourcemaps = require('gulp-sourcemaps')
var lessCleanCSS = require("less-plugin-clean-css")
var lessAutoPrefix = require('less-plugin-autoprefix')
var gutil = require('gulp-util')
var inject = require('gulp-inject-string')
var stream = require('vinyl-source-stream')
var buffer = require('gulp-buffer')

// Read configuration file
var config = require('./conf/')
// Init Less plugins
var cleancss = new lessCleanCSS( config.gulp.cleancss )
var autoprefix= new lessAutoPrefix( config.gulp.autoprefix )

console.log(config.build);

// HTML
gulp.task( 'html', function() {
  return gulp.src( config.src + 'index.html')
    .pipe(htmlmin({
      collapseWhitespace: true, 
      removeComments: true, 
      keepClosingSlash: true
    }))
    .pipe(gulp.dest('build/'))
    .on( 'end', function() {
      gutil.log( 'HTML minified.' )
    } )
})

// JavaScript
gulp.task( 'riot', function() {
  return gulp.src( config.src + 'tags/**/*.tag')
    .pipe(riot({
      compact: true
    }))
    .pipe( concat('tags.js') )
    .pipe( uglify() )
    .pipe( gulp.dest(config.src + 'js') )
})
gulp.task( 'browserify', [ 'riot' ], function() {
  var bundler = browserify({
    entries: [ config.src + 'js/main.js' ],
    debug: config.env == 'development'
  })

  var bundle = function() {
    return bundler
      .bundle()
      .on( 'error', function( err ) {
        gutil.log( err )
      } )
      .pipe( stream( 'bundle.js' ) )
      .pipe( buffer() )
      .pipe( uglify() )
      .pipe( gulp.dest( config.build + 'js/' ) )
      .on( 'end', function() {
        gutil.log( 'Browserify done.' )
      } )
  }

  return bundle()
})

// LESS and CSS
gulp.task( 'revercss', function() {
  gulp.src( config.src + 'revcss/**/*.revcss')
    .pipe( revercss( {
      minified: false
    } ) )
    .pipe( concat( 'revcss.less' ) )
    .pipe( gulp.dest( config.src + 'less/' ) )
})
gulp.task( 'less', [ 'revercss' ], function() {
  useSourcemaps = config.env == 'development'

  return gulp.src( config.src + 'less/main.less')
    .pipe( useSourcemaps ? sourcemaps.init() : gutil.noop() )
    .pipe( less({
      plugins: [ autoprefix, cleancss ]
    } ) )
    .pipe( useSourcemaps ? sourcemaps.write() : gutil.noop() )
    .pipe( rename('main.css') )
    .pipe( gulp.dest( config.build + 'css/' ) )
})

// Serve files through Browser Sync
gulp.task( 'serve', [ 'build' ], function() {
  browserSync({
    server: {
      baseDir: config.build
    },
    files: [
      config.build + '**/*.*'
    ]
  })
})

gulp.task( 'watch', function() {
  gulp.watch( config.src + '*.html', [ 'html' ] )
  gulp.watch( [ config.src + 'less/*.less', config.src + 'revcss/*.revcss' ], [ 'less' ] )
  gulp.watch( [ config.src + 'js/*.js', config.src + 'tags/*.tag' ], [ 'browserify' ] )
})

gulp.task( 'build', [ 'browserify', 'less', 'html' ] )

gulp.task( 'default', [ 'serve', 'watch' ], function() {
  gutil.log('Serving through BrowserSync.')
})