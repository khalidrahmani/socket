
var mongoose = require('mongoose')
   ,Schema   = mongoose.Schema  

var MaxVisitorsSchema = new Schema({
    date:         { type: Date }
   ,tracking_url: { type: String }
   ,count:        { type: Number }
})

mongoose.model('MaxVisitors', MaxVisitorsSchema)