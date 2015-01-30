var configs = require('./config.json')
var env = process.env.NODE_ENV || 'development'

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

var config = extend( {}, configs.global )
config = extend( config, configs[env] )

// Try loading private settings
try {
  pconfig = require('./private.json')
  config = extend(config, pconfig)
}
catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log('No private settings found.')
  }
}

config.env = env
config.port = process.env.PORT || config.port || 3000

module.exports = config
