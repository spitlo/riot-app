var Dispatcher = require( './dispatcher' )
var Store = require( './store' )

// Require tags
var icon = require( '../icon/' )
var self = require( './user' )

var User = function( user ) {
  var store = new Store( user )
  var dispatcher = Dispatcher( {
    userStore: store
  } )
  return {
    store: store,
    dispatcher: dispatcher
  }
}

module.exports = User
