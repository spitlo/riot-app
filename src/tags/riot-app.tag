<riot-app>

  <h1>Riot Test App</h1>

  <user store={opts.user.store} dispatcher={opts.dispatcher}></user>

  <script>
    this.on( 'mount', function() {
      console.log('App mounted.', opts);
    })
  </script>
</riot-app>