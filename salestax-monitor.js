var BS_PORT  = process.env.BS_PORT  || 11300
var BS_HOST  = process.env.BS_HOST  || 'localhost'

var seneca = require('seneca')({timeout:555})
      .use('beanstalk-transport')
      .client({
        type: 'beanstalk',
        pin:  'role:salestax,cmd:calculate',
        port:  BS_PORT,
        host:  BS_HOST
      })

var influx = require('influx')({
  host:     'localhost',
  username: 'root',
  password: 'root',
  database: 'salestax'
})


var expected = {
  basic: 120
}

setInterval(function(){

  // basic
  seneca.act('role:salestax,cmd:calculate,net:100',function(err,out){
    influx.writePoint(
      'salestax_calculate_basic', 
      { time:new Date(), value:(!err && expected.basic===out.total)?1:0 }, 
      function(err){ if(err) console.log(err); })
  })

},555)


