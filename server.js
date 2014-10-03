
var express = require('express')
   ,fs = require('fs')
   ,passport = require('passport')
   ,port = process.env.PORT || 3000

var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , mongoose = require('mongoose')

var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect(config.db, options)
}
connect()

var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

require('./config/passport')(passport, config)

var app = express()

app.use(function (req, res, next) {  
  req.config = config
  return next()
})

require('./config/express')(app, config, passport)

var server = require('http').Server(app);
var io = require('socket.io')(server);
require('./config/routes')(app, passport)
server.listen(port);

var dashboard_controller = require('./app/controllers/dashboard_controller');

io.sockets.on('connection', function (socket) { // io.of('/track').on('connection', function (socket) {
    dashboard_controller.respond(socket, io);
});
io.of('/track').on('connection', function (socket) {
    dashboard_controller.track(socket);
});

console.log('Express app started on port '+port)

exports = module.exports = app

