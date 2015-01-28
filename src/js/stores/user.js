var Flux = require('delorean').Flux

var Store = Flux.createStore({
  scheme: {
    firstName: {
      default: 'Unknown'
    },
    lastName: {
      default: 'User'
    },
    fullName: {
      deps: ['firstName', 'lastName'],
      calculate: function () {
        return this.firstName + ' ' + this.lastName
      }
    }
  },

  initialize: function( user ) {
    if ( user ) {
      this.set( 'firstName', user.firstName )
      this.set( 'lastName', user.lastName )
    }
  },

  actions: {
    'user:changeFirstName': 'changeFirstName',
    'user:changeLastName': 'changeLastName'
  },

  changeFirstName: function( newName ) {
    console.log('Store: Event received, setting new first name', newName)
    this.firstName = newName
    this.emit('change')
  },

  changeLastName: function( newName ) {
    console.log('Store: Event received, setting new last name', newName)
    this.lastName = newName
    this.emit('change')
  },

  getState: function () {
    return {
      firstName: this.firstName,
      lastName: this.lastName
    }
  }
})

var User = function( user ) {
  return new Store( user )
}

module.exports = User
