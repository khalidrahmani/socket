var mongoose = require('mongoose')  
  , app      = require('../../task_server')  
  , Phone    = mongoose.model('Phone')  
  , async    = require('async')
  , env      = process.env.NODE_ENV || 'development'
  , config   = require('../../config/config')[env]
  , url      = config.iat.url     
  , apiKey   = config.iat.apiKey 
  , soap     = require('soap')
  , client   = null

getClient = function (callback) {
    if (client) {
        callback(null, client)
        return
    }
    soap.createClient(url, function (err, result) {
        if (err) {
            callback(err)
            return
        }
        console.log('Client is ready')
        client = result            
        callback(null, client)
	})
}

Phone.find({$or: [{iat: { $exists: false }}, {iat:  false}]}).limit(250).exec(function (err, phones) {
	if(phones.length > 0)	ActivateNumbersAndSetDestination(phones)
	else {
		console.log("all phones iat activated")	
		process.exit()	
	}
})

function ActivateNumbersAndSetDestination(phones){
	console.log(phones.length)
	phone = phones.pop()
	getClient(function (err, client) {
    	if (err) {  }
    	client.ActivateNumber({phoneNumber: phone.number, apiKey: apiKey}, function(err, res) {
    		console.log("activated")
    		client.SetNumberDestination({iatNumber: phone.number, destinationNumber: phone.destinationNumber, apiKey: apiKey}, function(err, res) {
				console.log("destination set")			
				phone.iat = true
				phone.save(function (err) {
					if (phones.length > 0) { 
						ActivateNumbersAndSetDestination(phones) 
					}
					else { 
						console.log("done ........ !!!!!!")	
						process.exit()	
					}
				}) 			
		})
		})    		
	})
}
		