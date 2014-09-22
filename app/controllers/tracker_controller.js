var mongoose        = require('mongoose')   
   ,Visitor         = mongoose.model('Visitor')
   ,Visit           = mongoose.model('Visit')   
   ,moment          = require('moment')
   ,async    		= require('async')
   //,date            = moment().subtract(2, 'day')._d	

exports.track = function (req, res){
	res.header("Access-Control-Allow-Origin", "*")
	req.session.destroy(function(err) {
  		//console.log("session destroyed")
	})
	var  websiteUrl         = req.headers["origin"]		
		,ip                 = req.connection.remoteAddress //"105.148.27.127" "88.190.229.170"  "105.189.28.69"
		,visitor_id         = req.body['visitor_id'] || null
		,visit_id           = req.body['visit_id'] || null
		,url                = req.headers["referer"] || "" 
	if(visit_id){
		Visit.update({_id: visit_id}, {$set: { end: new Date(), url: url}}, { multi: false }, function (err, numAffected) {
			res.send({visitor_id: visitor_id, visit_id: visit_id})			
		})
	}
	else
	{
		Visitor.update({_id: visitor_id}, { $inc: { visits: 1 }, $set: { last_visit: new Date() } }, { multi: false }, function (err, numAffected) {
		if(err){
			console.log(err)
			res.send({err: err})
		}
		else{		
			if(numAffected != 1){
				visitor = new Visitor({ip: ip})
				visitor.save(function (err) {
					visit = new Visit({visitor: visitor._id, url: url, mobile: req.body['mobile']})
					visit.save(function (err){
						res.send({visitor_id: visitor._id, visit_id: visit._id})
					})					
				})
			}
			else{
				visit = new Visit({visitor: visitor_id, url: url, mobile: req.body['mobile']})
				visit.save(function (err){
					res.send({visitor_id: visitor_id, visit_id: visit._id})
				})
			}
		  }
		})	
	}	
}