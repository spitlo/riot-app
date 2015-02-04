var gulp = require( 'gulp' )
var browserSync = require( 'browser-sync' )
var reload = browserSync.reload
var watchify = require( 'watchify' )
var browserify = require( 'browserify' )
var riotify = require( 'riotify' )
var buffer = require( 'gulp-buffer' )
var uglify = require( 'gulp-uglify' )
var htmlmin = require( 'gulp-htmlmin' )
var rename = require( 'gulp-rename' )
var concat = require( 'gulp-concat' )
var less = require( 'gulp-less' )
var please = require( 'gulp-pleeease' )
var sourcemaps = require( 'gulp-sourcemaps' )
var gutil = require( 'gulp-util' )
var inject = require( 'gulp-inject-string' )
var source = require( 'vinyl-source-stream' )
var eventstream = require( 'event-stream' )
var fs = require( 'fs' )

// Read configuration file
var config = require( './conf/' )

// Helper funtion to save name of all custom tags discovered by tagCollector
var tags = []
var logTags = function( eventstream ) {
  return eventstream.map( function( file, callback ) {
    var filename = file.path.replace(/.*\/|\..*$/g, '')
    tags.push( filename )
    return callback( null, file )
  } )
}

// Generic + browserify error handlers
var raise = function( err ) {
  var errMess = 'Error\n'
  if ( err.type ) {
    errMess = err.type + ' ' + errMess
  }
  gutil.log(
    gutil.colors.red( errMess ),
    gutil.colors.yellow( err.message ),
    '\n in file: ',
    err.filename
  )
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

// Collect tags to use for <= IE8 compability and tag-specific .less file injection
gulp.task( 'tagCollector', function() {
  tags = []
  return gulp.src( config.gulp.src + 'js/**/*.tag')
    .pipe( logTags( eventstream ) )
} )


// Enable build task to force minification and turn off sourcemaps
gulp.task( 'forceProduction', function() {
  config.env = 'production'
} )


// HTML
gulp.task( 'html', [ 'tagCollector' ], function() {
  var tagAdder
  if ( tags && tags.length > 0 ) {
    tagAdder = '<script>html5.addElements("' + tags.join(' ') + '")</script>'
  }

  return gulp.src( config.gulp.src + 'index.html')
    .pipe( tagAdder ? inject.before( '<![endif]-->', tagAdder ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( config.env == 'production' ? htmlmin( {
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    } ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( gulp.dest( config.gulp.build ) )
} )


// JavaScripts
var bundler
bundle = function() {
  gutil.log( 'Bundling for', ( config.env == 'production' ? 'production' : 'development' ) )
  return bundler
    .bundle()
    .on( 'error', braise )
    .pipe( source( 'bundle.js' ) )
    .pipe( buffer() )
    .pipe( config.env == 'production' ? uglify() : gutil.noop() )
    .pipe( config.env == 'development' ? sourcemaps.init( { loadMaps: true } ) : gutil.noop() )
    .pipe( config.env == 'development' ? sourcemaps.write( config.gulp.externalSourcemaps ? './' : '' ) : gutil.noop() )
    .pipe( gulp.dest( config.gulp.build + 'js/' ) )
}
gulp.task( 'javascripts', function() {
  bundler = browserify( config.gulp.src + 'js/main.js', {
    cache: {},
    packageCache: {},
    fullPaths: config.env == 'development',
    extensions: [ '.tag' ],
    debug: config.env == 'development'
  } )

  if ( config.env == 'development' ) {
    bundler = watchify( bundler )
    bundler.on( 'update', function() {
      return bundle()
    } )
  }

  bundler.transform( 'riotify' )
  
  return bundle()
} )


// Stylesheets
gulp.task( 'stylesheets', [ 'tagCollector' ], function() {
  var tagAdder = ''
  if ( tags && tags.length > 0 ) {
    tags.forEach( function( tag ) {
      // Try finding tag specific less files and inject as imports
      var fileName = tag + '.less'
      if ( fs.existsSync( config.gulp.src + 'less/tags/' + fileName ) ) {
        tagAdder += '@import "tags/' + fileName + '";'
      } else if ( fs.existsSync( config.gulp.src + 'js/modules/' + tag + '/' + fileName ) ) {
        tagAdder += '@import "../js/modules/' + tag + '/' + fileName + '";'
      }
    } )
  }

  var pleaseOpts = config.gulp.pleaseOpts

  if ( config.env == 'production' ) {
    pleaseOpts[ 'minifier' ] = true
    pleaseOpts[ 'mqpacker' ] = true
  }

  return gulp.src( config.gulp.src + 'less/main.less' )
    .pipe( config.env == 'development' ? sourcemaps.init() : gutil.noop() )
    .pipe( tagAdder ? inject.append( tagAdder ) : gutil.noop() )
    .pipe( less() )
    .on( 'error', raise )
    .pipe( please( pleaseOpts ) )
    .on( 'error', raise )
    .pipe( rename('main.css') )
    .pipe( config.env == 'development' ? sourcemaps.write( config.gulp.externalSourcemaps ? './' : '' ) : gutil.noop() )
    .pipe( gulp.dest( config.gulp.build + 'css/' ) )
} )


// Images
gulp.task( 'images', function() {
  return gulp.src( config.gulp.src + 'i/**' )
    .pipe( gulp.dest( config.gulp.build + 'i/' ) )
} )


// Serve files through Browser Sync
gulp.task( 'serve', function() {
  browserSync( {
    port: config.gulp.browserSync.port,
    server: {
      baseDir: config.gulp.build
    },
    files: [
      config.gulp.build + 'js/*.*',
      config.gulp.build + 'css/*.*',
      config.gulp.build + '*.*'
    ]
  } )
} )


// Watch task
gulp.task( 'watch', function() {
  // The reason for using config.gulp.watchSrc and not config.gulp.src is that gulp.watch
  // doesn't trigger on globs starting with './'
  gulp.watch( config.gulp.watchSrc + '*.html', [ 'html' ] )
  gulp.watch( config.gulp.watchSrc + '**/**/*.less', [ 'stylesheets' ] )
  gulp.watch( config.gulp.watchSrc + 'js/**/*.tag', [ 'html', 'stylesheets' ] )
  gulp.watch( config.gulp.watchSrc + 'i/*.*', [ 'images' ] )
} )


// Build tasks
// build:prod forces build into production mode, turning off sourcemaps and
// turning on minification
gulp.task( 'build:prod', [ 'forceProduction', 'build' ] )
gulp.task( 'build', [ 'images', 'javascripts', 'stylesheets', 'html' ] )


// Default task
gulp.task( 'default', [ 'build', 'serve', 'watch' ], function() {
  gutil.log( 'Serving through BrowserSync on port ' + gutil.colors.yellow( config.port ) + '.' )
} )
