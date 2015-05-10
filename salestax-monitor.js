
var seneca = require('seneca')({timeout:555})
      .client({ pin:'role:salestax,cmd:calculate', port:51001 })
      .client({ pin:'role:salestax,cmd:calculate,country:*', port:51002 })

var influx = require('influx')({
  host:     'localhost',
  username: 'root',
  password: 'root',
  database: 'salestax'
})


function check(test) {
  return function(err,out) {
    influx.writePoint(
      'salestax_calculate_'+test.name, 
      { time:new Date(), value:(!err && test.val===out.total)?1:0 }, 
      function(err){ if(err) console.log(err); })
  }
}

setInterval(function(){

  seneca

    .act('role:salestax,cmd:calculate,net:100',
         check({name:'basic',val:120}))

    .act('role:salestax,cmd:calculate,country:ie,net:100',
         check({name:'ie',val:121}))

},555)


