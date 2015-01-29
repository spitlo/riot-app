var riot = require('riot')
var ready = require('./modules/domready')

// Set up tags
var tagApp = require('./tags/riot-app')
var tagUser = require('./tags/user')

// Set up stores
var User = require('./modules/user/')

var app = function() {
  document.body.className += ' js'

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
