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
var checksum = require('checksum')
var inject = require( 'gulp-inject-string' )
var source = require( 'vinyl-source-stream' )
var eventstream = require( 'event-stream' )
var fs = require( 'fs' )
var del = require('del')

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
var tagSourcer = function() {
  var tagSources = ''
  if ( tags && tags.length > 0 ) {
    tags.forEach( function( tag ) {
      // Try finding tag specific less files and inject as imports
      var fileName = tag + '.less'
      if ( fs.existsSync( config.src + 'less/tags/' + fileName ) ) {
        tagSources += '@import "tags/' + fileName + '";'
      } else if ( fs.existsSync( config.src + 'js/modules/' + tag + '/' + fileName ) ) {
        tagSources += '@import "../js/modules/' + tag + '/' + fileName + '";'
      }
    } )
    return tagSources
  } else {
    return false
  }
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
  return gulp.src( config.src + 'js/**/*.tag')
    .pipe( logTags( eventstream ) )
} )

// Get sha hash for current commit
var hashes = {}
gulp.task( 'getHash', [ 'javascripts:prod', 'stylesheets:prod' ], function( callback ) {
  return checksum.file( config.dest + 'js/bundle.js', function ( err, jsChecksum ) {
    if ( err ) raise( err )
    return checksum.file( config.dest + 'css/bundle.css', function ( err, cssChecksum ) {
        if ( err ) raise( err )
          hashes = {
            js: jsChecksum,
            css: cssChecksum
          }
          callback()
      } )
  } )
} )


// ------------------
// HTML
// -- Production
gulp.task( 'html:prod', [ 'tagCollector', 'getHash' ], function() {
  var tagAdder
  if ( tags && tags.length > 0 ) {
    tagAdder = '<script>html5.addElements("' + tags.join(' ') + '")</script>'
  }
  return gulp.src( config.src + 'index.html')
    .pipe( tagAdder ? inject.before( '<![endif]-->', tagAdder ) : gutil.noop() )
    .pipe( inject.after( '/bundle.css', '?' + hashes.css ) )
    .pipe( inject.after( '/bundle.js', '?' + hashes.js ) )
    .on( 'error', raise )
    .pipe( htmlmin( {
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    } ) )
    .on( 'error', raise )
    .pipe( gulp.dest( config.dest ) )
} )
// -- Development
gulp.task( 'html:dev', function() {
  return gulp.src( config.src + 'index.html')
    .on( 'error', raise )
    .pipe( gulp.dest( config.dest ) )
} )


// ------------------
// JavaScripts
var bundler
bundle = function( env ) {
  return bundler
    .bundle()
    .on( 'error', braise )
    .pipe( source( 'bundle.js' ) )
    .pipe( buffer() )
    .pipe( env == 'production' ? uglify() : gutil.noop() )
    .pipe( env == 'development' ? sourcemaps.init( { loadMaps: true } ) : gutil.noop() )
    .pipe( env == 'development' ? sourcemaps.write( config.development.gulp.externalSourcemaps ? './' : '' ) : gutil.noop() )
    .pipe( gulp.dest( config.dest + 'js/' ) )
}
// -- Production
gulp.task( 'javascripts:prod', function() {
  bundler = browserify( config.src + 'js/main.js', {
    extensions: [ '.tag' ],
    debug: false
  } ).transform( 'riotify' )
  return bundle( 'production' )
} )
// -- Development
gulp.task( 'javascripts:dev', function() {
  bundler = watchify( browserify( config.src + 'js/main.js', {
    cache: {},
    packageCache: {},
    fullPaths: true,
    extensions: [ '.tag' ],
    debug: true
  } ) ) 
    .on( 'update', function() {
      return bundle( 'development' )
    } )
    .transform( 'riotify' )
  return bundle( 'development' )
} )


// ------------------
// Stylesheets
// -- Production
gulp.task( 'stylesheets:prod', [ 'tagCollector' ], function() {
  var tagString = tagSourcer()
  return gulp.src( config.src + 'less/main.less' )
    .pipe( tagString ? inject.append( tagString ) : gutil.noop() )
    .pipe( less() )
    .on( 'error', raise )
    .pipe( please( config.production.gulp.pleaseOpts ) )
    .on( 'error', raise )
    .pipe( rename('bundle.css') )
    .pipe( gulp.dest( config.dest + 'css/' ) )
} )
// -- Development
gulp.task( 'stylesheets:dev', [ 'tagCollector' ], function() {
  var tagString = tagSourcer()
  return gulp.src( config.src + 'less/main.less' )
    .pipe( sourcemaps.init() )
    .pipe( tagString ? inject.append( tagString ) : gutil.noop() )
    .pipe( less() )
    .on( 'error', raise )
    .pipe( please( config.development.gulp.pleaseOpts ) )
    .on( 'error', raise )
    .pipe( rename('bundle.css') )
    .pipe( sourcemaps.write( config.development.gulp.externalSourcemaps ? './' : '' ) )
    .pipe( gulp.dest( config.dest + 'css/' ) )
} )


// ------------------
// Images
// -- Production
gulp.task( 'images:prod', [ 'clean:images' ], function() {
  return gulp.src( config.src + 'i/**' )
    .pipe( gulp.dest( config.dest + 'i/' ) )
} )
// -- Development
gulp.task( 'images:dev', function() {
  return gulp.src( config.src + 'i/**' )
    .pipe( gulp.dest( config.dest + 'i/' ) )
} )
gulp.task( 'clean:images', function( callback ) {
  del( [ config.dest + 'i/**/*.*' ], function ( err ) {
    if ( err ) raise( err )
    callback()
  } )
} )

// ------------------
// Serve files through Browser Sync
gulp.task( 'serve', function() {
  browserSync( {
    port: config.development.gulp.browserSync.port,
    server: {
      baseDir: config.dest
    },
    files: [
      config.dest + 'js/*.*',
      config.dest + 'css/*.*',
      config.dest + '*.*'
    ]
  } )
} )


// ------------------
// Watch task
gulp.task( 'watch', function() {
  // The reason for using watchSrc and not config.src is that gulp.watch
  // doesn't trigger on globs starting with './'
  var watchSrc = config.src.replace(/\.\//, '')
  gulp.watch( watchSrc + '*.html', [ 'html:dev' ] )
  gulp.watch( watchSrc + '**/**/*.less', [ 'stylesheets:dev' ] )
  gulp.watch( watchSrc + 'js/**/*.tag', [ 'stylesheets:dev' ] )
  gulp.watch( watchSrc + 'i/*.*', [ 'images:dev' ] )
} )


// ------------------
// Build tasks
gulp.task( 'build:prod', [ 'html:prod', 'images:prod' ], function( callback ) {
  del( [ config.dest + 'js/*.map', config.dest + 'css/*.map' ], function ( err, deletedFiles ) {
    if ( err ) raise( err )
    gutil.log( 'Production build finished, sourcemaps cleaned.' )
    gutil.log( 'Build folder (' + config.dest + ') is now ready for deployment.' )
    callback()
  } )
} )
gulp.task( 'build:dev', [ 'images:dev', 'javascripts:dev', 'stylesheets:dev', 'html:dev' ] )


// ------------------
// Default task
gulp.task( 'default', [ 'build:dev', 'serve', 'watch' ], function() {
  gutil.log( 'Serving through BrowserSync on port ' + gutil.colors.yellow( config.port ) + '.' )
} )
