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
var config = require('./config')
config.env = 'development'

// http://gomakethings.com/ditching-jquery/#extend
var extend = function ( objects ) {
  var extended = {}
  var merge = function (obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        extended[prop] = obj[prop]
      }
    }
  }
  merge(arguments[0])
  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i]
    merge(obj)
  }
  return extended
}

gulp.task( 'html', function() {
  return gulp.src('src/index.html')
    // .pipe(inline({
    //   base: './build/',
    //   js: uglify(),
    //   css: cssmin()
    // }))
    .pipe(htmlmin({
      collapseWhitespace: true, 
      removeComments: true, 
      keepClosingSlash: true
    }))
    .pipe(gulp.dest('build/'))
    .on( 'end', function() {
      gutil.log( 'CSS and JS minified and inlined, HTML minified.' )
    } )
})

// Pre Riot 2.0.2
// gulp.task( 'libs', function() {
//   var riotDir = './node_modules/gulp-riot/node_modules/riot/'
//   var riotVersion = require( riotDir + 'package' ).version
//   var riotLicense = '/* Riot ' + riotVersion + ', @license MIT, (c) 2015 Muut Inc. + contributors */\n'
//   gulp.src( riotDir + 'lib/*.js' )
//     .pipe(inject.prepend('var riot = { version: \'v' + riotVersion + '\' } ; \'use strict\';'))
//     .pipe(concat('riot.js'))
//     .pipe(uglify())
//     .pipe(inject.prepend(riotLicense))
//     .pipe(gulp.dest('./build/js'))
// })

gulp.task( 'browserify', function() {
  var bundler = browserify({
    entries: [ './src/js/main.js' ],
    debug: config.env == 'development_'
  })

  var bundle = function() {
    return bundler
      .bundle()
      .on( 'error', function( err ) {
        gutil.log( err )
      } )
      .pipe( stream( 'bundle.js' ) )
    .pipe( revercss( {
      minified: true
    } ) )
      .pipe( buffer() )
      .pipe( uglify() )
      .pipe( gulp.dest( './build/js/' ) )
      .on( 'end', function() {
        gutil.log( 'Browserify done.' )
      } )
  }

  return bundle()
})

gulp.task( 'riot', function() {
  return gulp.src('src/tags/**/*.tag')
    .pipe(riot({
      compact: true
    }))
    .pipe( concat('tags.js') )
    .pipe( uglify() )
    .pipe( gulp.dest('./build/js') )
})

gulp.task( 'less', function() {
  useSourcemaps = config.env == 'development'

  return gulp.src(config.src + 'less/main.less')
    .pipe( useSourcemaps ? sourcemaps.init() : gutil.noop() )
    .pipe( less({
      plugins: [autoprefix, cleancss]
    } ) )
    .pipe( useSourcemaps ? sourcemaps.write() : gutil.noop() )
    .pipe( rename('main.css') )
    .pipe( gulp.dest(config.dist + 'css/') )
})

gulp.task( 'revercss', function() {
  gulp.src('src/revcss/**/*.revcss')
    .pipe( revercss( {
      minified: true
    } ) )
    .pipe( concat( 'main.css' ) )
    .pipe( gulp.dest( './build/css' ) )
})

// Serve files through Browser Sync
gulp.task( 'serve', [ 'build' ], function() {
  browserSync({
    server: {
      baseDir: './build/'
    },
    files: [
      './build/*.*'
    ]
  })
})

gulp.task( 'watch', function() {
  gulp.watch('src/*.html', [ 'html' ])
  gulp.watch('src/less/*.less', [ 'less' ])
  gulp.watch('src/revcss/*.revcss', [ 'revercss' ])
  gulp.watch('src/tags/*.tag', [ 'riot' ])
  gulp.watch('src/js/*.js', [ 'browserify' ])
})


gulp.task( 'build', [ 'browserify', 'riot', 'revercss', 'less', 'html' ] )

gulp.task( 'default', [ 'serve', 'watch' ], function() {
  gutil.log('Serving through BrowserSync.')
})