// https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt

var gpio
var pins = [3,5,7,8]
var pins_setup = [false,false,false,false]

console.log(process.env)

if(process.env.RPI && process.env.RPI === '1'){
  console.log('setting up the GPIO pins')
  gpio = require('rpi-gpio')
  pins.forEach(function(p,pidx){
    gpio.setup(p, gpio.DIR_OUT, function(err){
      if(err){
        console.log('error', err)
      } else {
        console.log('no error setting up pin ', p)
        pins_setup[pidx] = true
        gpio.write(p, true)
      }
    })
  })
}

var fs = require('fs')
var http = require('http')
var https = require('https')
var express = require('express')
var io

var mongojs = require('mongojs')

var db = mongojs('lights', ['patterns'])
db.on('error', function (err) {
  console.log('database error', err)
})
db.on('connect', function () {
  console.log('database connected')
})
db.patterns.find({
    $query: {},
    $orderby: {
      _id: -1
    },
  }, {}, {
    limit: 250
  },
  function (err, data) {
    if (err) {
      console.log('error')
      console.log(err)
      // res.status(500)
    } else {
      console.log(data.length + ' elements returned - latest')
      // res.status(200).json(data)
    }
  })


var port = 8000;

var options = {
  key: fs.readFileSync('./nginx.key'),
  cert: fs.readFileSync('./nginx.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

var app = express();

var server

if (process.env.HTTPS && process.env.HTTPS === '1') {
  server = https.createServer(options, app).listen(port, function () {
    console.log("Express _SECURE_ server listening on port " + port);
  });
} else {
  server = http.createServer(app).listen(port, function () {
    console.log("Express server listening on port " + port);
  });
  io = require('socket.io')(server)
}

app.get('/current_pattern', function (req, res) {
  res.status(200).json(p.current_pattern())
})

// app.get('/', function (req, res) {
//     res.writeHead(200);
//     res.end("hello world\n");
// });

app.use(express.static(__dirname + '/public'))

var sockets = []

io.on('connection', function(socket){

  console.log('a user connected');
  sockets.push(socket)
  p.set_sockets(sockets)

  console.log(sockets.length, 'users total')

  socket.on('get_current_pattern', function(d){
    socket.emit('current_pattern', p.current_module())
    socket.emit('current_pattern_index', { value: p.current_pattern_index() })
  })

  socket.on('new_module', function(d){
    console.log(d)
    p.set_module(d)
    // socket.emit('current_pattern', p.current_module())
  })

  socket.on('disconnect', function(){
    sockets = sockets.filter(function(s){ return s !== socket })
    p.set_sockets(sockets)
  })

});

var p = require('./lib/Player.js')()
p.start()
p.set_gpio(gpio,pins)
