riot = require('riot')
tags = require('./tags')

function domReady () {
  document.body.className += ' js'

  riot.mount('todo', {
    title: 'I want to behave!',
    items: [
      { title: 'Avoid excessive coffeine', done: true },
      { title: 'Hidden item', hidden: true },
      { title: 'Be less provocative' },
      { title: 'Be nice to people' }
    ]
  })
  riot.mount('timer', { start: 0 })
}

if ( document.addEventListener ) {
  document.addEventListener( 'DOMContentLoaded', function() {
    document.removeEventListener( 'DOMContentLoaded', arguments.callee, false)
    domReady()
  }, false )
} else if ( document.attachEvent ) {
  document.attachEvent( 'onreadystatechange', function() {
    if ( document.readyState === 'complete' ) {
      document.detachEvent( 'onreadystatechange', arguments.callee )
      domReady()
    }
  })
}