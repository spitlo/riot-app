riot.tag("timer","<p>Seconds Elapsed: { time }</p>",function(t){this.time=t.start||0,this.tick=function(){this.update({time:++this.time})}.bind(this);var i=setInterval(this.tick,1e3);this.on("unmount",function(){clearInterval(i)})}),riot.tag("todo",'<h3>{ opts.title }</h3><ul><li each="{ items }"><label class="{ completed: done }"><input type="checkbox" __checked="{ done }" onclick="{ parent.toggle }"> { title } </label></li></ul><form onsubmit="{ add }"><input name="input" onkeyup="{ edit }"><button __disabled="{ !text }">Add #{ items.length + 1 }</button></form>',function(t){this.disabled=!0,this.items=t.items,this.edit=function(t){this.text=t.target.value}.bind(this),this.add=function(){this.text&&(this.items.push({title:this.text}),this.text=this.input.value="")}.bind(this),this.toggle=function(t){var i=t.item;return i.done=!i.done,!0}.bind(this)});