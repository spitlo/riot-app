var config = require( './config.json' )
var deepExtend = require( '../src/js/modules/extend' ).deep

// Try loading private settings
try {
  pconfig = require( './private.json' )
  config = deepExtend( config, pconfig )
}
catch ( err ) {
  if ( err.code === 'MODULE_NOT_FOUND' ) {
    console.log( 'No private settings found.' )
  }
}

config.port = process.env.PORT || config.port || 3000
config.env = process.env.NODE_ENV || 'development'

module.exports = config
