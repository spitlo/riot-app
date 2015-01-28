var domReady = function( callback ) {
  if ( document.addEventListener ) {
    document.addEventListener( 'DOMContentLoaded', function() {
      document.removeEventListener( 'DOMContentLoaded', arguments.callee, false )
      callback()
    }, false )
  } else if ( document.attachEvent ) {
    document.attachEvent( 'onreadystatechange', function() {
      if ( document.readyState === 'complete' ) {
        document.detachEvent( 'onreadystatechange', arguments.callee )
        callback()
      }
    })
  } else {
    var oldOnload = window.onload;
    window.onload = function () {
      oldOnload && oldOnload()
      callback()
    }
  }
}

module.exports = domReady