<user>
  
  <div class="user-name">
    <icon iconname="audio-spectrum" icontype="inline" class="medium"></icon>
    <h2>{opts.store.store.fullName}</h2>
  </div>
  <div class="form">
    <input name="firstName" value={opts.store.store.firstName}></input><button onclick={changeFirstname}>Change</button><br>
    <input name="lastName" value={opts.store.store.lastName}></input><button onclick={changeLastname}>Change</button>
  </div>

  <script>
    var store = opts.store.store
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
      console.log( 'In user.tag:', opts )
    })
  </script>
</user>