var config = require( './config.json' )
var deepExtend = require( '../src/js/modules/extend' ).deep

module.exports = deepExtend( {}, config.browser )
