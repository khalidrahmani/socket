
var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils')
  , extend = require('util')._extend

var login = function (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/'
  delete req.session.returnTo
  res.redirect(redirectTo)
}

exports.signin = function (req, res) {}

exports.index = function (req, res) {
  res.render('users/index', {
    
  })
}

exports.authCallback = login

exports.login = function (req, res) {  
  res.render('users/login', {     
    email: req.session['email'] || ''
  })
}

exports.signup = function (req, res) {
  res.render('users/signup', {    
    user: new User()
  })
}

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

exports.session = login

exports.create = function (req, res) {
  var user = new User(req.body)  
  user.save(function (err) {
    if (err) {      
      return res.render('users/signup', {
        error: {type: "error", errors: user.errors},
        user: user
      })
    }
    console.log(user)
    // manually login the user once successfully signed up
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

exports.show = function (req, res) {
  var user = req.profile
  res.render('users/show', {
    user: user
  })
}

exports.user = function (req, res, next, id) {
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load User ' + id))
      req.profile = user
      next()
    })
}

exports.edit = function (req, res) {
  User.findOne({ _id : req.user._id }).lean().exec(function (err, user) {  
    res.render('users/edit', {
       user: user
      ,params: user
    })
  })
}

exports.update = function(req, res){
  user = req.user
  user = extend(user, req.body)
  user.save(function (err) {
        if (err) { 
          return res.render('users/edit', {
             error: {type: "error", errors: user.errors}
            ,params: req.body
            ,user: user
          })
        }   
        else{
          req.session.messages = {type: 'success', message: 'User updated'}
          return res.redirect('/')      
        }         
      })  
}

exports.settings = function (req, res) {
  User.findOne({ _id : req.user._id }).lean().exec(function (err, user) {  
    res.render('users/settings', {
       user: user
      ,params: user
    })
  })
}

exports.updateSettings = function(req, res){
  user = req.user
  user = extend(user, req.body)
  user.save(function (err) {
        if (err) { 
          return res.render('users/settings', {
             error: {type: "error", errors: user.errors}
            ,params: req.body
            ,user: user
          })
        }   
        else{
          req.session.messages = {type: 'success', message: 'User updated'}
          return res.redirect('/')      
        }         
      })  
}
