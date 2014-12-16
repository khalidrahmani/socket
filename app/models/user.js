
var  mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,crypto = require('crypto')
    ,validate = require('mongoose-validator')
    ,uniqueValidator = require('mongoose-unique-validator')
    ,URL = require('url')

var UserSchema = new Schema({
  phone: { type: String },   
  email: { type: String, required: "can't be blank", unique: true, validate: validate({validator: 'isEmail'}) },  
  password: { type: String, required: "can't be blank"},
  salt: { type: String },  
  website_url: { type: String, required: "can't be blank", unique: true, validate: validate({validator: 'isURL'}) },  
  createdAt: { type : Date, default : Date.now }
})

UserSchema.pre('save', function(next) {
  this.salt = this.makeSalt()
  this.password = this.encryptPassword(this.password)
  next()
})

UserSchema.methods = {

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.password
  },

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  }

}

UserSchema.virtual('full_name').get(function () {
  return this.first_name + " " +this.last_name
})

UserSchema.virtual('formatedwebsite_url').get(function () {
  return URL.parse(this.website_url).hostname || this.website_url
})

UserSchema.virtual('sites').get(function () {
  var id = this._id
  Site.find({}, function (err, sites) {    
    return sites
  })
})

UserSchema.plugin(uniqueValidator, { message: '{PATH} already in use.' })
mongoose.model('User', UserSchema)