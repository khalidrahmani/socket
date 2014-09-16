var mongoose = require('mongoose')  
   ,app      = require('../../task_server')  
   ,Site     = mongoose.model('Site')  
   ,Phone    = mongoose.model('Phone')  
   ,async    = require('async')
   ,env      = process.env.NODE_ENV || 'development'
   ,config   = require('../../config/config')[env]
   ,url      = config.iat.url     
   ,apiKey   = config.iat.apiKey 
   ,soap     = require('soap')
   ,client   = null
   ,_        = require('underscore')
   ,quantity = 50


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

Site.find({active: true}, function (err, sites){
    async.eachSeries(sites, function( site, callback) {
      Phone.findOne({isDefault: true, site: site._id}, function (err, phone) {
        if((!phone) || site.defaultPhone == "") {
          console.log("missing default phone for site "+ site.websiteUrl)
          getInteractivTellPhones([], 1, function(err, toll_free_numbers) {  
            Phone.create({number: toll_free_numbers[0], destinationNumber: site.defaultDestinationNumber, isDefault: true, site: site._id}, function (err, res) {
              if(err){ 
                console.log(err)
                callback()
              }
              else{
                site.defaultPhone = toll_free_numbers[0]
                site.save(function (err) {
                  callback()
                })
              }            
            })
          })
        }
        else{
          console.log( "provisioning phones for "+site.websiteUrl)
          Phone.aggregate([{$match: {site: site._id}}, {$group: {_id: '$destinationNumber', count: { $sum: 1 }, websiteNumber: { $addToSet: "$websiteNumber" }}}], 
          	function(err, results){               
              provisionNewPhones(site._id, results, callback)					
        	})   
        } 
      })	        
    }, function(err){
      if( err ) {
        console.log(err)
      } 
      else{
        console.log('Done')
        process.exit()  
      }
  })
})

function provisionNewPhones(site_id, results, callback){
	phone = results.pop()
	if(phone){
		destinationNumber = phone._id
		websiteNumber     = phone.websiteNumber[0]
		Phone.count({destinationNumber: destinationNumber, assigned: ''}, function( err, count){	    
			if(count < quantity){
				console.log("provisioning new phones for " + destinationNumber)				
				getInteractivTellPhones([], quantity, function(err, toll_free_numbers) {
          if(err){
            console.log(err)
            process.exit(0)
          }	
					new_phones = []
					for (index = 0; index < quantity; ++index){
						if(websiteNumber) new_phones.push({number: toll_free_numbers[index], destinationNumber: destinationNumber, site: site_id, websiteNumber: websiteNumber})
						else 	            new_phones.push({number: toll_free_numbers[index], destinationNumber: destinationNumber, site: site_id})
					}
					Phone.create(new_phones, function (err, res) {
						if(err) console.log(err)
				  		provisionNewPhones(site_id, results, callback)
					})					
				})			
			}
			else{
				provisionNewPhones(site_id, results, callback)
			}	
		})
	}
	else callback()
}

function getInteractivTellPhones(phones, phones_count, callback){
  getClient(function (err, client) {
    client.GetTollFreeNumbers({apiKey: apiKey}, function(err, result) {      
      if(err) {       
      	callback(err, result) 
      }
      else if (_.isEmpty(result.GetTollFreeNumbersResult)) {
        callback("Error, empty InteractivTellPhones", [])
      }  
      else{        
        console.log(phones)
        phones = phones.concat(result.GetTollFreeNumbersResult.string)
        if(phones.length >= phones_count){
          phones = _.first(phones, phones_count)
          callback(err, phones)
        }
        else{
          getInteractivTellPhones(phones, phones_count,callback)
        }
      }
    })
  })
}