
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validate = require('mongoose-validator')
  , uniqueValidator = require('mongoose-unique-validator')

var UserSchema = new Schema({
  first_name: { type: String, required: "can't be blank" },  
  last_name: { type: String, required: "can't be blank" },  
  phone: { type: String },   
  email: { type: String, required: "can't be blank", unique: true, validate: validate({validator: 'isEmail'}) },  
  password: { type: String, required: "can't be blank"},
  salt: { type: String },
  company_name: { type: String },
  street_address: { type: String },
  street_address_2: { type: String },
  city: { type: String },
  state_province: { type: String },
  postal_code: { type: String },
  country: { type: String },
  timezone: { type: String },  
  interactivetel_web_service_url: { type: String }, 
  interactivetel_api_key: { type: String },   
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

UserSchema.virtual('sites').get(function () {
  var id = this._id
  Site.find({}, function (err, sites) {
    console.log("in")
    return sites
  })
})

UserSchema.plugin(uniqueValidator, { message: '{PATH} already in use.' })
mongoose.model('User', UserSchema)