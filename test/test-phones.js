
var mongoose = require('mongoose')
  , should   = require('should')
  , request  = require('supertest')
  , app      = require('../server')
  , context  = describe
  , User     = mongoose.model('User')  
  , Site     = mongoose.model('Site')  
  , Phone    = mongoose.model('Phone')    
  , agent    = request.agent(app)

var phones_count = 0

describe('Phones', function () {  
     before(function (done) {
        Phone.count(function (err, cnt) {
          phones_count = cnt
          done()
        })
      }) 

    describe('Save Valid Phone', function () {
      before(function (done) {    
        var phone = new Phone({ number: '8885361176', destinationNumber: '8885361188'})            
            phone.save(done)
      }) 

      it('should insert a phone to the database', function (done) {
        Phone.count(function (err, cnt) {  
          cnt.should.equal(phones_count + 1)   
          done()         
        })
      })
    })

    describe('Should not save same number and destination again', function () {
      before(function (done) {    
        var phone = new Phone({ number: '8885361176', destinationNumber: '8885361188'})      
            phone.save(function (err) {
              if(err){
                console.log(err)
                done()
              }
            })            
      }) 

      it('should insert a phone to the database', function (done) {
        Phone.count(function (err, cnt) {  
          cnt.should.equal(phones_count+1)   
          done()         
        })
      })

    })    
  after(function (done) {
    require('./helper').clearDb(done)
  })
})

