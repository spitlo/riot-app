<icon>
  <svg viewBox="0 0 8 8" class={ svgClass }>
    <use xlink:href="{ useHref }" class={ useClass }></use>
  </svg>

  <script>
    this.on( 'update', function() {
      this.svgClass = 'icon ' + opts.icontype
      this.useHref = '#' + opts.iconname
      this.useClass = 'icon-' + opts.iconname
    } )
  </script>
</icon>