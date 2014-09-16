var mongoose   = require('mongoose')
   ,Visit      = mongoose.model('Visit')    

exports.index = function (req, res) {
    res.render('dashboard/index', {
	        live_users: "live_users"
    })
}

exports.respond = function(socket){
	socket.on('update_chart', function (name, fn) {
		date = new Date()
		date.setSeconds(date.getSeconds() - 6)
		Visit.count({ end: {$gte: date} }).exec(function (err, count) {  
			fn({ count: count });
		})
  	});
}