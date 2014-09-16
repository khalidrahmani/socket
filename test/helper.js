
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

exports.clearDb = function (done) {	
  mongoose.connection.db.dropDatabase(function(){
        done()
  }) 
}
