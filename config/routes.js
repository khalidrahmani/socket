
var async              = require('async')
  , users_controller   = require('../app/controllers/users_controller')
  , dashboard_controller   = require('../app/controllers/dashboard_controller')  
  , tracker_controller = require('../app/controllers/tracker_controller')  
  , auth = require('./middlewares/authorization')

module.exports = function (app, passport) {

  app.get('/login', users_controller.login)
  app.get('/signup', users_controller.signup)
  app.get('/logout', users_controller.logout)
  app.post('/users', users_controller.create)

  app.post('/users/session', saveRequestBody(),
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users_controller.session)
  
  app.get('/users/edit', auth.requiresLogin, users_controller.edit)
  app.post('/users/update', auth.requiresLogin, users_controller.update)  
  
  app.get('/users/settings', auth.requiresLogin, users_controller.settings)
  app.post('/users/settings', auth.requiresLogin, users_controller.updateSettings) 

  app.get('/', auth.requiresLogin, dashboard_controller.index)  
  //app.post('/dashboard/broadcast', auth.requiresLogin, dashboard_controller.broadcast)  

  app.post('/track', tracker_controller.track)
  
  app.get('*', function(req, res, next) {
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      })
  })
}

function saveRequestBody() {   // save user email in login form 
   return function(req, res, next) {
          req.session['email'] = req.body.email
          next()
    }
}