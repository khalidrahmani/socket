var mongoose = require('mongoose')  
  , app      = require('../../task_server')  
  , Phone    = mongoose.model('Phone')  
  , async    = require('async')

Phone.find({}).select('_id').exec(function (err, phones) {
	async.eachSeries(phones, function( phone, callback) { 
		phone.assigned = ''		
		phone.save(function (err) {
			console.log("saved")
			callback()
		})
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

