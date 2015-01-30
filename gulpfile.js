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
var sourcemaps = require( 'gulp-sourcemaps' )
var gutil = require( 'gulp-util' )
var inject = require( 'gulp-inject-string' )
var source = require( 'vinyl-source-stream' )
var eventstream = require( 'event-stream' )
var fs = require( 'fs' )

// Read configuration file
var config = require( './conf/' )

// Init Less plugins
var LessCleanCSS = require( 'less-plugin-clean-css' )
var LessAutoPrefix = require( 'less-plugin-autoprefix' )
var cleancss = new LessCleanCSS( config.gulp.cleancss )
var autoprefix = new LessAutoPrefix( config.gulp.autoprefix )

// Enable build task to force minification and turn off sourcemaps
var forProduction = false
gulp.task( 'toggleProduction', function() {
  forProduction = !forProduction
  config.env = forProduction ? 'production' : 'development'
} )

// Save tags discovered by riot task to use for <= IE8 comp.
var tags
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

// Collect tags
gulp.task( 'tagCollector', function() {
  tags = []
  return gulp.src( config.src + 'js/**/*.tag')
    .pipe( logTags( eventstream ) )
} )


// HTML
gulp.task( 'html', [ 'tagCollector' ], function() {
  var tagAdder
  if ( tags && tags.length > 0 ) {
    tagAdder = '<script>html5.addElements("' + tags.join(' ') + '")</script>'
  }

  return gulp.src( config.src + 'index.html')
    .pipe( tagAdder ? inject.before( '<![endif]-->', tagAdder ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( config.env == 'production' ? htmlmin( {
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    } ) : gutil.noop() )
    .on( 'error', raise )
    .pipe( gulp.dest( config.build ) )
} )


// JavaScripts
var bundler = watchify( browserify( config.src + 'js/main.js', {
  cache: {},
  packageCache: {},
  fullPaths: true,
  extensions: [ '.tag' ],
  debug: config.env == 'development'
} ) ).transform( 'riotify' ).on( 'update', bundle )
function bundle() {
  return bundler
    .bundle()
    .on( 'error', braise )
    .pipe( source( 'bundle.js' ) )
    .pipe( buffer() )
    .pipe( config.env == 'production' ? uglify() : gutil.noop() )
    .pipe( config.env == 'development' ? sourcemaps.init( { loadMaps: true } ) : gutil.noop() )
    .pipe( config.env == 'development' ? sourcemaps.write( './' ) : gutil.noop() )
    .pipe( gulp.dest( config.build + 'js/' ) )
}
gulp.task( 'javascripts', bundle )


// Stylesheets
gulp.task( 'stylesheets', [ 'tagCollector' ], function() {
  var tagAdder = ''
  if ( tags && tags.length > 0 ) {
    tags.forEach( function( tag ) {
      // Try finding tag specific less files and inject as imports
      var fileName = tag + '.less'
      if ( fs.existsSync( config.src + 'less/tags/' + fileName ) ) {
        tagAdder += '@import "tags/' + fileName + '";'
      } else if ( fs.existsSync( config.src + 'js/modules/' + tag + '/' + fileName ) ) {
        tagAdder += '@import "../js/modules/' + tag + '/' + fileName + '";'
      }
    } )
  }

  return gulp.src( config.src + 'less/main.less')
    .pipe( config.env == 'development' ? sourcemaps.init() : gutil.noop() )
    .pipe( tagAdder ? inject.append( tagAdder ) : gutil.noop() )
    .pipe( less( {
      plugins: [ autoprefix, cleancss ]
    } ) )
    .on( 'error', raise )
    .pipe( rename('main.css') )
    .pipe( config.env == 'development' ? sourcemaps.write( './' ) : gutil.noop() )
    .pipe( gulp.dest( config.build + 'css/' ) )
} )


// Serve files through Browser Sync
gulp.task( 'serve', [ 'build' ], function() {
  browserSync( {
    port: config.port,
    server: {
      baseDir: config.build
    },
    files: [
      config.build + 'js/*.*',
      config.build + 'css/*.*',
      config.build + '*.*'
    ]
  } )
} )


// Watch task
gulp.task( 'watch', function() {
  gulp.watch( [ config.watchSrc + '*.html', config.watchSrc + 'js/**/*.tag' ], [ 'html' ] )
  gulp.watch( config.watchSrc + 'js/**', [ 'javascripts' ] )
  gulp.watch( config.watchSrc + 'js/**/*.tag', [ 'html' ] )
  gulp.watch( config.watchSrc + '**/*.less', [ 'stylesheets' ] )
} )


// Build tasks
gulp.task( 'build:prod', [ 'toggleProduction', 'build', 'toggleProduction' ] )
gulp.task( 'build', [ 'javascripts', 'stylesheets', 'html' ] )


// Default task
gulp.task( 'default', [ 'serve', 'watch' ], function() {
  gutil.log('Serving through BrowserSync on port ' + config.port + '.')
} )
