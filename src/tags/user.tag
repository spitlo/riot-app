<user>
  
  <div class="user-name">
    <h2>{opts.store.firstName} {opts.store.lastName}</h2>
    <h4>Calculated name: {opts.store.fullName}</h4>
    <input name="firstName" value={opts.store.firstName}></input><button onclick={changeFirstname}>Change</button><br>
    <input name="lastName" value={opts.store.lastName}></input><button onclick={changeLastname}>Change</button>
  </div>

  <script>
    var store = opts.store
    changeFirstname( e ) {
      var newName = this.firstName.value
      if ( newName !== store.firstName ) {
        console.log( 'firstName change requested' )
        opts.dispatcher.setFirstName( newName )
      }
    }
    changeLastname( e ) {
      var newName = this.lastName.value
      if ( newName !== store.lastName ) {
        console.log( 'lastName change requested' )
        opts.dispatcher.setLastName( newName )
      }
    }
    this.on( 'mount', function() {
      console.log( 'In user.tag:', opts)
    })
  </script>
</user>