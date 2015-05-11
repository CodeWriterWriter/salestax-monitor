var BS_PORT  = process.env.BS_PORT  || 11300
var BS_HOST  = process.env.BS_HOST  || 'localhost'
var WEB_PORT = process.env.WEB_PORT || 51000 
var WEB_HOST = process.env.WEB_HOST || 'localhost' 

var needle = require('needle')

var seneca = require('seneca')({timeout:555})
      .use('beanstalk-transport')
      .client({
        type: 'beanstalk',
        pin:  'role:salestax,cmd:calculate',
        port:  BS_PORT,
        host:  BS_HOST
      })
      .client({
        type: 'beanstalk',
        pin:  'role:salestax,cmd:calculate,country:*',
        port:  BS_PORT,
        host:  BS_HOST
      })

var influx = require('influx')({
  host:     'localhost',
  username: 'root',
  password: 'root',
  database: 'salestax'
})



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
    'http://'+WEB_HOST+':'+WEB_PORT+'/api/salestax?net=100',
    check_api({name:'basic',val:120}))

  needle.get(
    'http://'+WEB_HOST+':'+WEB_PORT+'/api/salestax?net=100&country=de',
    check_api({name:'de',val:119}))

  needle.get(
    'http://'+WEB_HOST+':'+WEB_PORT+'/api/salestax?net=100&country=it',
    check_api({name:'it',val:122}))

},555)


