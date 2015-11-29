// https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt

///////////////////////////////////////////////////////////////////////////////
// initial / global variables and imports

var fs = require('fs')
var http = require('http')
var https = require('https')
var express = require('express')

var io      // socket.io server
var server  // express webserver
var app     // express
var gpio

var p       // pattern player

var port = 8000         // webserver port


///////////////////////////////////////////////////////////////////////////////
// setup GPIO

var pins = [3, 5, 7, 8]
var pins_setup = [false, false, false, false]

if (process.env.RPI && process.env.RPI === '1') {
  console.log('Raspberry Pi envrionment variable set.')
  console.log('Setting up the GPIO pins...')

  gpio = require('rpi-gpio')
  pins.forEach(function (p, pidx) {
    gpio.setup(p, gpio.DIR_OUT, function (err) {
      if (err) {
        console.log('error setting up pin ', p)
        console.log('with error message')
        console.log(JSON.stringify(err))
      } else {
        console.log('no error setting up pin ', p)
        pins_setup[pidx] = true
        gpio.write(p, true)
      }
    })
  })
}

///////////////////////////////////////////////////////////////////////////////
// setup webserver
var options = {
  key: fs.readFileSync('./nginx.key'),
  cert: fs.readFileSync('./nginx.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app = express()

// https or http ?
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

// set the root http route to serve the interface
app.use(express.static(__dirname + '/public'))

///////////////////////////////////////////////////////////////////////////////
// setup websockets
var sockets = []

io.on('connection', function (socket) {

  console.log('a user connected');
  sockets.push(socket)
  p.set_sockets(sockets)

  console.log(sockets.length, ' users connected')

  socket.on('get_current_pattern', function (d) {
    socket.emit('current_pattern', p.current_module())
    socket.emit('current_pattern_index', {
      value: p.current_pattern_index()
    })
  })

  socket.on('new_module', function (d) {
    p.set_module(d)
  })

  socket.on('save_to_db', function(d){
    p.save_pattern()
  })

  socket.on('disconnect', function () {
    sockets = sockets.filter(function (s) {
      return s !== socket
    })
    p.set_sockets(sockets)
    console.log('DISCONNECT :: ', sockets.length, ' users connected')
  })

  socket.on('list_patterns', function(){
    p.list_patterns(function(d){
      socket.emit('all_patterns', d)
    })
  })

  socket.on('load_pattern_from_db', function(d){
    p.get_pattern_from_db(d.value, function(d){
      p.set_module(d)
      socket.emit('current_pattern', p.current_module())
      socket.emit('current_pattern_index', {
        value: p.current_pattern_index()
      })
    })
  })

});

///////////////////////////////////////////////////////////////////////////////
// setup pattern player and start the app
p = require('./lib/Player.js')()
p.start()
p.set_gpio(gpio, pins)
