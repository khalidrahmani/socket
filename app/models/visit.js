
var mongoose = require('mongoose')
   ,Schema   = mongoose.Schema  

var VisitSchema = new Schema({
   start:             { type: Date }
  ,end:               { type: Date, default : Date.now }  
  ,mobile:            { type: Boolean }  
  ,url:               { type: String }
  ,visitor:           { type: Schema.ObjectId, ref : 'Visitor' }    
})
mongoose.model('Visit', VisitSchema)