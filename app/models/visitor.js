
var mongoose = require('mongoose')
   ,Schema   = mongoose.Schema  
   ,geoip    = require('geoip-lite')

var VisitorSchema = new Schema({
   ip:                { type: String, required: "can't be blank" }
  ,city:              { type: String }
  ,state:             { type: String }
  ,country:           { type: String }
  ,visits:            { type: Number, default : 0 }  
  ,site:              { type : Schema.ObjectId, ref : 'Site' }  
  ,first_visit:       { type : Date, default : Date.now }
  ,last_visit:        { type : Date, default : Date.now }
})

VisitorSchema.pre('save', function(next) {
  geo = geoip.lookup(this.ip)
  if( geo != null ){
    this.city    = geo.city
    this.state   = geo.region
    this.country = geo.country  
  }
  next()
})

mongoose.model('Visitor', VisitorSchema)