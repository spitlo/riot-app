<user>
  
  <div class="user-name">
    <h2>{opts.store.firstName} {opts.store.lastName} ... {opts.store.fullName}</h2>
    <input name="firstName" value={opts.store.firstName}></input><button onclick={changeFirstname}>Change</button><br>
    <input name="lastName" value={opts.store.lastName}></input><button onclick={changeLastname}>Change</button>
  </div>

  <script>
    var store = opts.store
    changeFirstname( e ) {
      console.log('firstName change requested', e);
      opts.dispatcher.setFirstName( this.firstName.value )
    }
    changeLastname( e ) {
      console.log('lastName change requested', e);
      opts.dispatcher.setLastName( this.lastName.value )
    }
    this.on( 'mount', function() {
      console.log('In user.tag:', opts);
    })
  </script>
</user>