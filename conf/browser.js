var configs = require( './config.json' )
var deepExtend = require( '../src/js/modules/extend' ).deep

var env = process.env.NODE_ENV || 'development'

var config = deepExtend( {}, configs.global )
config = deepExtend( config, configs[env] )

module.exports = config.browser
