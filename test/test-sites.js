
var mongoose = require('mongoose')
  , should   = require('should')
  , request  = require('supertest')
  , app      = require('../server')
  , context  = describe
  , User     = mongoose.model('User')  
  , Site     = mongoose.model('Site')  
  , Phone    = mongoose.model('Phone')    
  , agent    = request.agent(app)

var sites_count = 0
  , phones_count = 0

describe('Sites', function () {
  before(function (done) {    
    var user = new User({ first_name: 'Foo', last_name: 'foo', email:'foo@example.com', password: '11212'})
    user.save(done)
  })  

  context('When logged in', function () {

      before(function (done) {
        agent
        .post('/users/session')
        .send({ email: 'foo@example.com', password: '11212' })
        .end(done)        
      })

    describe('Invalid parameters', function () {
      before(function (done) {
        Site.count(function (err, cnt) {
          sites_count = cnt
          done()
        })
      })

      it('no website url - should respond with errors', function (done) {
        agent
        .post('/sites')
        .send({ spanClass: 'call'})
        .expect(200)        
        .end(done)
      })

      it('should not save the website to the database', function (done) {
        Site.count(function (err, cnt) {
          sites_count.should.equal(cnt)
          done()
        })
      })
    })

    describe('Valid parameters', function () {
      before(function (done) {
        Site.count(function (err, cnt) {
          sites_count = cnt
          Phone.count(function (err, cnt) {
            phones_count = cnt
            done()
          })
        })
      })
      
      it('should create website', function (done) {
        agent
        .post('/sites')
        .send({ websiteUrl: 'http://redpointrack.herokuapp.com/',
                postBackUrl:'http://redpointrack.herokuapp.com/', defaultPhone: '2145212365', spanClass: 'call',
                defaultDestinationNumber: '2145221565', callTrackingApiKey: '11212', phonesDistributionMethod: 'AA'})        
        .end(done);
      })

      it('should insert a site to the database', function (done) {
        Site.count(function (err, cnt) {  
          cnt.should.equal(sites_count + 1)
          Phone.count(function (err, cnt) {  
            cnt.should.equal(phones_count + 1)
            done()
          })  
        })
      })

    })

  })
  after(function (done) {
    require('./helper').clearDb(done)
  })
})
