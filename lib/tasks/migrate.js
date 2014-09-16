var mongoose = require('mongoose')  
   ,app      = require('../../task_server')  
   ,Visit    = mongoose.model('Visit')  
   ,Site     = mongoose.model('Site')  
   ,async    = require('async')

/*
Visit.find({ page : { "$exists" : false }} ).remove().exec(function(err){
	console.log("done")
	process.exit()
});
*/

Site.find({}).exec(function (err, sites) { 	
	async.eachSeries(sites, function(site, callback) {	
		var conditions = { page: new RegExp(site.websiteUrl, "i") }
	  		, update = { site: site._id}
		  	, options = { multi: true };

		Visit.update(conditions, update, options, callback);
		}, function(err){
		      if( err ) {
		        console.log('Error !!')
		      }
		      else{
		      	console.log("done")
		      	process.exit()
		    }
	})
})


