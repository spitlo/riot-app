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
var gutil = require('gulp-util')

// Read configuration file
var config = require('./config')

// Check for command line arguments (--port is the only supported one)
// var opts = require("nomnom")
//   .options({
//     port: {
//       abbr: 'p',
//       default: 8000,
//       help: 'Set what port to listen to'
//     }
//   })
//  .parse()

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



// Inline minified js & css and minify HTML
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

gulp.task( 'browserify', function() {
  var bundler = browserify({
    entries: [ './src/js/main.js' ],
    debug: true
  })

  var bundle = function() {
    return bundler
      .bundle()
      .on( 'error', function( err ) {
        gutil.log( err )
      } )
      .pipe( stream( 'bundle.js' ) )
      .pipe( gulp.dest( './build/' ) )
      .on( 'end', function() {
        gutil.log( 'Browserify done.' )
      } )
  }

  return bundle()
})

gulp.task( 'riot', function() {
  gulp.src('src/tags/**/*.tag')
    .pipe(riot({
      compact: true
    }))
    .pipe(concat('tags.js'))
    .pipe(gulp.dest('./build/js'))
})

gulp.task( 'revercss', function() {
  gulp.src('src/revcss/**/*.revcss')
    .pipe(revercss({
      minified: true
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./build/css'))
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
  gulp.watch('src/js/*.js', [ 'browserify' ])
})


gulp.task( 'build', [ 'riot', 'revercss', 'html' ] )

gulp.task( 'default', [ 'serve', 'watch' ], function() {
  gutil.log('Serving through BrowserSync.')
})