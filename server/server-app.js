const express = require('express');
var app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var path = require("path");
var fs = require('fs');



var drone = require('./app');

var dir = path.join(__dirname+'/../public/');
app.use('/js', express.static(__dirname + '/../node_modules/popper.js/dist')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/../node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/../node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/../node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};


server.listen(3005, function () {
  console.log('Listening on http://localhost:3005/');
});

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname+'/../public/index.html'));
// });

app.get('*', function (req, res) {
  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
  });
  s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('Not found');
  });
});

io.on('connection', (socket) => {

  socket.on('logging', (msg) => {
    console.log(msg);
  })

  socket.emit('logging', 'connected...');

  socket.on('takeoff', () => {
    console.log('takeoff');

    drone.takeoff()
      .then(function() {
        console.log('did take off!');
        io.sockets.emit('logging', 'I took off');
      });

  });

  socket.on('land', () => {

    drone.land()
      .then(function() {
        console.log('did land!');
        io.socket.emit('logging', 'I landed');
        io.socket.emit('logging', 'Thanks for flying!');
      });

  });

  socket.on('move', (direction) => {

    drone.move({ direction })
      .then(function() {
        console.log('done moving', direction);
        io.socket.emit('logging', 'I moved ' + direction);
      });

  });

  socket.on('turn', (direction) => {
    console.log('turn', direction);
    
    drone.turn({ direction })
      .then(function() {
        console.log('done rotating', { direction });
        io.sockets.emit('logging', 'I turned ' + direction);
      })
  });

  socket.on('up', (direction) => {

    drone.move('up', direction)
      .then(function() {
        console.log('moved ', direction);
        io.sockets.emit('logging', 'I moved up');
      })

  });

  socket.on('down', (direction) => {
    drone.move('down', direction)
      .then(function() {
        console.log('moved ', direction);
        io.sockets.emit('logging', 'I moved down');
      })
  });

  socket.on('frontflip', () => {
    drone.frontflip()
      .then(function() {
        console.log('front flip');
        io.sockets.emit('logging', 'I did front flip');
      })
  });

  socket.on('emergency', () => {
    drone.emergency()
      .then(function() {
        console.log('emergency');
        io.sockets.emit('logging', 'uh, oh! I did an emergency landing');
        
      })
  });


});
