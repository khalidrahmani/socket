
var express = require('express')
  , flash = require('connect-flash')
  , winston = require('winston')
  , helpers = require('view-helpers')
  , pkg = require('../package.json')

  , favicon = require('serve-favicon')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')  
  , compress = require('compression')
  , logger = require('morgan')
  , csrfCrypto = require('csrf-crypto')
  , session = require('express-session')
  , MongoStore = require('connect-mongo')(session)
  , xmlparser = require('express-xml-bodyparser')

var env = process.env.NODE_ENV || 'development'

module.exports = function (app, config, passport) {

  app.set('showStackError', true)

  app.use(compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }))
  
  app.use(favicon(__dirname + '/../public/favicon.ico')) 
  app.use(express.static(config.root + '/public'))

  var log
  if (env !== 'development') {
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message)
        }
      }
    }
  } else {
    log = 'dev'
  }

  app.set('views', config.root + '/app/views')
  app.set('view engine', 'ejs')

  app.use(function (req, res, next) {
    res.locals.pkg = pkg
    next()
  })

  app.use(cookieParser('my sekret')) 

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(xmlparser())
  app.use(methodOverride())

  if (env === 'test') {
        app.use(session({ secret: "config.sessionSecret", resave: true, saveUninitialized: true }));
    } else {
    app.use(session({
      secret: "pkg.cookie_secret",
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({
        url : config.db,
        collection : 'sessions'
      })
    }))
  }

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
  app.use(helpers(pkg.name))

  if (env !== 'test') {
      app.use(logger(log))
      app.use(csrfCrypto({ key: "secret" }))
      app.use(function(req, res, next){
        res.locals.csrf_token = res.getFormToken()
        next()
      })
    }
   app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');    
  })
  app.locals.pretty = true
}
