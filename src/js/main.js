var riot = require('riot')
var Flux = require('delorean').Flux
var tags = require('./tags')
var ready = require('./modules/domready')

// Set up stores
var User = require('./stores/user')

var Dispatcher = require('./modules/dispatcher')

var app = function() {
  document.body.className += ' js'

  var user = User()
  user.onChange(function() {
    console.log('Change to user store detected...')
  })

  // Create a dispatcher
  var dispatcher = Dispatcher( {
    user: user
  } )

  var appData = {
    user: user,
    dispatcher: dispatcher
  }

  var riotApp = riot.mount( 'riot-app', appData )
}

ready( app )
