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
var gutil = require('gulp-util')
var inject = require('gulp-inject-string')
var source = require('vinyl-source-stream')
var eventstream = require('event-stream')
var del = require('del')

// Read configuration file
var config = require('./conf/')

// Init Less plugins
var LessCleanCSS = require('less-plugin-clean-css')
var LessAutoPrefix = require('less-plugin-autoprefix')
var cleancss = new LessCleanCSS( config.gulp.cleancss )
var autoprefix = new LessAutoPrefix( config.gulp.autoprefix )

// Enable build task to force minification and turn off sourcemaps
var forProduction = false
gulp.task( 'toggleProduction', function() {
  forProduction = !forProduction
  config.env = forProduction ? 'production' : 'development'
})

// Save tags discovered by riot task to use for <= IE8 comp.
var tags
var logTags = function( eventstream ) {
  return eventstream.map( function( file, callback ) {
    var filename = file.path.replace(/.*\/|\..*$/g, '')
    tags.push( filename )
    return callback( null, file )
  })
}

// Generic + browserify error handlers
var raise = function( err ) {
  var errMess = 'Error\n'
  if ( err.type ) {
    errMess = err.type + ' ' + errMess
  }
  gutil.log( gutil.colors.red( errMess ), gutil.colors.yellow( err.message ), '\n in file: ', err.filename )
}
var braise = function( err ) {
  raise( err )
  this.end()
}

/*-----------------------------
  _________   _____ __ _______
 /_  __/   | / ___// //_/ ___/
  / / / /| | \__ \/ ,<  \__ \
 / / / ___ |___/ / /| |___/ /
/_/ /_/  |_/____/_/ |_/____/

-----------------------------*/

// HTML
gulp.task( 'html', [ 'riot' ], function() {
  var useHtmlMin = config.env == 'production'
  var tagAdder

  if ( tags && tags.length > 0 ) {
    tagAdder = '<script>html5.addElements("' + tags.join(' ') + '")</script>'
  }

  return gulp.src( config.src + 'index.html')
    .pipe( tagAdder ? inject.before( '<![endif]-->', tagAdder ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( useHtmlMin ? htmlmin( {
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    } ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( gulp.dest( config.build ) )
})


// JavaScripts
gulp.task( 'javascripts', [ 'riot' ], function() {
  var useUglify = config.env == 'production'

  var bundler = browserify({
    entries: [ config.src + 'js/main.js' ],
    debug: config.env == 'development'
  })

  var bundle = function() {
    return bundler
      .bundle()
      .on( 'error', braise )
      .pipe( source( 'bundle.js' ) )
      .pipe( useUglify ? gutil.buffer() : gutil.noop() )
      .pipe( useUglify ? uglify() : gutil.noop() )
      .pipe( gulp.dest( config.build + 'js/' ) )
  }

  return bundle()
})
gulp.task( 'riot', function() {
  tags = []
  return gulp.src( config.src + 'tags/**/*.tag')
    .pipe( logTags( eventstream ) )
    .pipe( riot() )
    .on( 'error', raise )
    .pipe( concat( 'tags.js' ) )
    .pipe( inject.prepend( 'var riot = require("riot");\n' ) )
    .pipe( gulp.dest( config.src + 'js' ) )
})


// Stylesheets
gulp.task( 'stylesheets', [ 'revercss' ], function() {
  var useSourcemaps = config.env == 'development'

  return gulp.src( config.src + 'less/main.less')
    .pipe( useSourcemaps ? sourcemaps.init() : gutil.noop() )
    .pipe( less( {
      plugins: [ autoprefix, cleancss ]
    } ) )
    .on( 'error', raise )
    .pipe( useSourcemaps ? sourcemaps.write() : gutil.noop() )
    .pipe( rename('main.css') )
    .pipe( gulp.dest( config.build + 'css/' ) )
})
gulp.task( 'revercss', function() {
  return gulp.src( config.src + 'revcss/**/*.revcss')
    .pipe( revercss() )
    .on( 'error', raise )
    .pipe( concat( 'revcss.less' ) )
    .pipe( gulp.dest( config.src + 'less/' ) )
})


// Clean-up
gulp.task( 'clean', function( callback ) {
  del( [
    config.src + 'less/' + 'revcss.less',
    config.src + 'js' + 'tags.js'
  ], callback )
  //callback()
})


// Serve files through Browser Sync
gulp.task( 'serve', [ 'build' ], function() {
  browserSync( {
    port: config.port,
    server: {
      baseDir: config.build
    },
    files: [
      config.build + 'js/*.*',
      config.build + 'less/*.*',
      config.build + '*.*'
    ]
  } )
})


// Watch task
gulp.task( 'watch', function() {
  gulp.watch( config.src + '*.html', [ 'html' ] )
  gulp.watch( [ config.src + 'js/*.js', config.src + 'tags/*.tag' ], [ 'javascripts' ] )
  gulp.watch( [ config.src + 'less/*.less', config.src + 'revcss/*.revcss' ], [ 'stylesheets' ] )
})


// Build tasks
gulp.task( 'build:prod', [ 'toggleProduction', 'build', 'toggleProduction' ] )
gulp.task( 'build', [ 'javascripts', 'stylesheets', 'html', 'clean' ] )


// Default task
gulp.task( 'default', [ 'serve', 'watch' ], function() {
  gutil.log('Serving through BrowserSync on port ' + config.port + '.')
})
