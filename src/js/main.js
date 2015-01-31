var riot = require( 'riot' )
var SVGInjector = require( 'svg-injector' )
var ready = require( './modules/domready' )

// Set up tags - There must be a better way to do this!?
var appTag = require( './riot-app' )

// Set up stores
var User = require( './modules/user/' )

var app = function() {
  document.body.className += ' js'
  
  var svgSprite = document.querySelectorAll( '.iconic-sprite' )
  SVGInjector( svgSprite )

  var user = User()
  user.store.onChange(function() {
    console.log('Change to user store detected...')
  })

  var appData = {
    user: user
  }

  var riotApp = riot.mount( 'riot-app', appData )
}

ready( app )
