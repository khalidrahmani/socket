var express = require('express')
   ,fs = require('fs')
var https = require('https');
var http = require('http');
var app = express();
var subdomain = require('express-subdomain');

var router = express.Router();
app.use(subdomain('api', router));
//api specific routes
router.get('/', function(req, res) {
    res.send('Welcome to our API!');
});

var sslOptions = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

http.createServer(app).listen(3002);
https.createServer(sslOptions, app).listen(443);

