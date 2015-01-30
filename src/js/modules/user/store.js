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
    this.set( 'firstName', newName )
  },

  changeLastName: function( newName ) {
    console.log('Store: Event received, setting new last name', newName)
    this.set( 'lastName', newName )
  },

  getState: function () {
    return {
      firstName: this.firstName,
      lastName: this.lastName
    }
  }
})

module.exports = Store
