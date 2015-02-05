// http://gomakethings.com/ditching-jquery/#extend

var extend = {
  shallow: function ( objects ) {
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
  },

  deep: function ( objects ) {
    var extended = {}
    var merge = function ( obj ) {
      for ( var prop in obj ) {
        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
          if ( Object.prototype.toString.call( obj[ prop ] ) === '[object Object]' ) {
            extended[ prop ] = extend.deep( extended[ prop ], obj[ prop ] )
          }
          else {
            extended[ prop ] = obj[ prop ]
          }
        }
      }
    }
    merge( arguments[ 0 ] )
    for ( var i = 1; i < arguments.length; i++ ) {
      var obj = arguments[ i ]
      merge( obj )
    }
    return extended
  }
}

module.exports = extend
