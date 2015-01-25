var through = require('through2')
var gutil = require('gulp-util')
var streamifier = require('streamifier')
var revercss = require( 'revercss' )
var PluginError = gutil.PluginError

const PLUGIN_NAME = 'gulp-revercss'

function gulpRevercss( opts ) {

  var stream = through.obj(function(file, enc, callback) {
    if ( file.isStream() ) {
      this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streams are not supported!' ) )
      return callback()
    }
    var self = this
    if ( file.isBuffer() ) {
      var srcStream = streamifier.createReadStream( file.contents )
      revercss( srcStream, opts, function( outputCss ) {
        file.contents = new Buffer( outputCss )

        self.push(file)

        callback()
      } )
    }

  })

  return stream
}

module.exports = gulpRevercss