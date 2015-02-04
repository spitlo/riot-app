var configs = require( './config.json' )
var deepExtend = require( '../src/js/modules/extend' ).deep

var env = process.env.NODE_ENV || 'development'

var config = deepExtend( {}, configs.global )
config = deepExtend( config, configs[ env ] )

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

config.env = env
config.port = process.env.PORT || config.port || 3000

module.exports = config
