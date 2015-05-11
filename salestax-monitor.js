
var seneca = require('seneca')({timeout:555})
      .client({ pin:'role:salestax,cmd:calculate', port:51001 })

var influx = require('influx')({
  host:     'localhost',
  username: 'root',
  password: 'root',
  database: 'salestax'
})


setInterval(function(){
  seneca.act('role:salestax,cmd:calculate,net:100',function(err,out){
    influx.writePoint(
      'salestax_calculate_basic', 
      { time:new Date(), value:(!err && 120===out.total)?1:0 }, 
      function(err){ if(err) console.log(err); })
  })
},555)


