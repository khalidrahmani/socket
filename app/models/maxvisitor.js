
var mongoose = require('mongoose')
   ,Schema   = mongoose.Schema  

var MaxVisitorsSchema = new Schema({
   date:        { type: Date }
  ,count:      { type: Number }
})

mongoose.model('MaxVisitors', MaxVisitorsSchema)