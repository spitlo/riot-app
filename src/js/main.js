var riot = require('riot')
var tags = require('./tags')
var domReady = require('./modules/domready')

var app = function() {
  document.body.className += ' js'

  var riotApp = riot.mount( 'riot-app' )
}

domReady( app )