
var needle = require('needle')

var seneca = require('seneca')({timeout:555})
      .client({ pin:'role:salestax,cmd:calculate', port:51001 })
      .client({ pin:'role:salestax,cmd:calculate,country:*', port:51002 })

var influx = require('influx')({
  host:     'localhost',
  username: 'root',
  password: 'root',
  database: 'salestax'
})


var HOST = process.env.HOST || 'localhost' 
var PORT = process.env.PORT || 51000 

function check_service(test) {
  return function(err,out) {
    influx.writePoint(
      'salestax_calculate_'+test.name, 
      { time:new Date(), value:(!err && test.val===out.total)?1:0 }, 
      function(err){ if(err) console.log(err); })
  }
}

function check_api(test) {
  return function(err,res){
    var out = res && res.body ? res.body : {}
    influx.writePoint(
      'salestax_api_'+test.name, 
      { time:new Date(), value:(!err && test.val===out.total)?1:0 }, 
      function(err){ if(err) console.log(err); })
  }
}


setInterval(function(){

  seneca

    .act('role:salestax,cmd:calculate,net:100',
         check_service({name:'basic',val:120}))

    .act('role:salestax,cmd:calculate,country:ie,net:100',
         check_service({name:'ie',val:121}))

  needle.get(
    'http://'+HOST+':'+PORT+'/api/salestax?net=100',
    check_api({name:'basic',val:120}))

  needle.get(
    'http://'+HOST+':'+PORT+'/api/salestax?net=100&country=de',
    check_api({name:'uk',val:119}))

},555)


