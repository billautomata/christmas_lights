// https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt

var fs = require('fs')
var http = require('http')
var https = require('https')
var express = require('express')
var io

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
  })

  socket.on('disconnect', function(){
    sockets = sockets.filter(function(s){ return s !== socket })
    p.set_sockets(sockets)
  })

});

var p = require('./lib/Player.js')()
p.start()
