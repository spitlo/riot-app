var Flux = require('delorean').Flux

var Dispatcher = function ( stores ) {
  var dispatcher = Flux.createDispatcher({
    setFirstName: function ( newName ) {
      console.log('Dispatcher: Action received, triggering event. New name:', newName)
      this.dispatch('user:changeFirstName', newName)
    },

    setLastName: function ( newName ) {
      console.log('Dispatcher: Action received, triggering event. New name:', newName)
      this.dispatch('user:changeLastName', newName)
    },

    getStores: function () {
      return stores
    }
  })
  return dispatcher
}

module.exports = Dispatcher
